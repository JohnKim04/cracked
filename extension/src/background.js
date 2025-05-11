// Import the configured Supabase client
import supabase from './supabaseClient_ext.js';

const AUTH_STATE_KEY = 'crackedAuthState';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// --- Helper Functions (notifyContentScripts, updateAuthState, getAuthState) ---
// These should be the same as your current implementations.
async function notifyContentScripts(state) {
    try {
        const tabs = await chrome.tabs.query({ url: 'https://leetcode.com/problems/*'});
        tabs.forEach(tab => {
            if (tab.id) {
                chrome.tabs.sendMessage(tab.id, { action: "authStateChanged", payload: state})
                .catch(err => {
                    if (err.message?.includes("Receiving end does not exist")) return;
                    console.warn(`BG: Error sending auth state to tab ${tab.id}:`, err.message);
                });
            }
        });
    } catch (err) {
        console.error("BG: Error querying or notifying tabs:", err);
    }
}

async function updateAuthState(newState) {
    console.log("BG: Updating auth state:", newState);
    try {
        await chrome.storage.local.set({ [AUTH_STATE_KEY]: newState });
        await notifyContentScripts(newState);
    } catch (error) {
        console.error("BG: Error setting auth state in storage:", error);
    }
}

async function getAuthState(){
    if (!supabase) {
        console.warn("BG: Supabase client not available in getAuthState");
        return { isLoggedIn: false, user: null, error: "Supabase client not initialized." };
    }
    try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error("BG: Error getting supabase Session:", sessionError)
            const loggedOutState = { isLoggedIn: false, user: null, error: sessionError.message };
            await chrome.storage.local.set({ [AUTH_STATE_KEY]: loggedOutState });
            return loggedOutState;
        }

        const isLoggedIn = !!session?.user;
        const user = session?.user ?? null;
        const currentState = { isLoggedIn, user, error: null };
        await chrome.storage.local.set({ [AUTH_STATE_KEY]: currentState });
        return currentState;
    } catch (err) {
        console.error("BG: Error getting auth state (getAuthState):", err);
        const errorState = { isLoggedIn: false, user: null, error: err.message || "Unknown error checking auth state"};
        await chrome.storage.local.set({ [AUTH_STATE_KEY]: errorState });
        return errorState;
    }
}
// --- End Helper Functions ---

// Helper function to decode JWT payload (simplified for nonce checking)
function decodeJwtPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Error decoding JWT payload:", e);
        return null;
    }
}


async function handleGoogleLoginFlow() {
    console.log("BG: Initiating Google Login Flow via launchWebAuthFlow...");
    if (!supabase) {
        console.error("BG: Supabase client not available for login.");
        await updateAuthState({ isLoggedIn: false, user: null, error: "Login unavailable (client error)." });
        return;
    }
    if (!GOOGLE_CLIENT_ID) {
        console.error("BG: VITE_GOOGLE_CLIENT_ID is not configured in .env file.");
        await updateAuthState({ isLoggedIn: false, user: null, error: "Login unavailable (config error)." });
        return;
    }

    try {
        const redirectUri = chrome.identity.getRedirectURL();
        const generatedNonce = Math.random().toString(36).substring(2, 15); 
        console.log("BG: Nonce generated for Google Auth URL:", generatedNonce);


        let authUrl = `https://accounts.google.com/o/oauth2/v2/auth`;
        authUrl += `?client_id=${GOOGLE_CLIENT_ID}`;
        authUrl += `&redirect_uri=${encodeURIComponent(redirectUri)}`;
        authUrl += `&response_type=id_token token`; 
        authUrl += `&scope=${encodeURIComponent('openid email profile')}`;
        authUrl += `&nonce=${encodeURIComponent(generatedNonce)}`; 

        console.log("BG: Launching Web Auth Flow with URL:", authUrl);

        chrome.identity.launchWebAuthFlow({
            url: authUrl,
            interactive: true
        }, async (callbackUrl) => {
            if (chrome.runtime.lastError || !callbackUrl) {
                console.error("BG: launchWebAuthFlow error or user cancelled:", chrome.runtime.lastError?.message);
                await updateAuthState({ isLoggedIn: false, user: null, error: "Login cancelled or failed." });
                return;
            }

            console.log("BG: launchWebAuthFlow successful, callback URL:", callbackUrl);

            const params = new URLSearchParams(callbackUrl.substring(callbackUrl.indexOf('#') + 1));
            const idToken = params.get('id_token');
            
            if (!idToken) {
                console.error("BG: ID token not found in callback URL.");
                await updateAuthState({ isLoggedIn: false, user: null, error: "Login failed (ID token missing)." });
                return;
            }

            // *** DEBUGGING: Decode ID token and check its nonce claim ***
            const idTokenPayload = decodeJwtPayload(idToken);
            const nonceFromToken = idTokenPayload ? idTokenPayload.nonce : null;
            console.log("BG: Nonce sent to Supabase (generatedNonce):", generatedNonce);
            console.log("BG: Nonce received in ID Token from Google (nonceFromToken):", nonceFromToken);
            console.log("BG: Full ID Token Payload (for debugging, contains PII):", idTokenPayload);


            if (nonceFromToken !== generatedNonce) {
                console.error("BG: CRITICAL NONCE MISMATCH! Nonce in token does not match generated nonce BEFORE Supabase call.");
                // This would be a major issue if it happens here, investigate why generatedNonce might have changed
                // or if Google is not returning the exact nonce.
            }

            console.log("BG: Extracted ID Token. Attempting Supabase sign-in...");

            try {
                const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: idToken,
                    nonce: generatedNonce // Pass the same nonce that was sent to Google
                });

                if (supabaseError) {
                    console.error("BG: Supabase signInWithIdToken error:", supabaseError);
                    // Log the nonces again if there's a mismatch error from Supabase
                    if (supabaseError.message && supabaseError.message.toLowerCase().includes("nonce")) {
                        console.error("BG: Nonce passed to Supabase at time of error:", generatedNonce);
                        console.error("BG: Nonce from ID Token at time of error:", nonceFromToken);
                    }
                    await updateAuthState({ isLoggedIn: false, user: null, error: `Login failed: ${supabaseError.message}` });
                    return;
                }

                if (data?.user) {
                    console.log("BG: Supabase login successful:", data.user.email);
                    await updateAuthState({ isLoggedIn: true, user: data.user, error: null });
                } else {
                    console.error("BG: Supabase signInWithIdToken succeeded but returned no user data.");
                    await updateAuthState({ isLoggedIn: false, user: null, error: "Login failed (no user data)." });
                }
            } catch (signInError) {
                console.error("BG: Exception during Supabase signInWithIdToken:", signInError);
                await updateAuthState({ isLoggedIn: false, user: null, error: "Login failed (exception)." });
            }
        });
    } catch (flowError) {
        console.error("BG: Error setting up launchWebAuthFlow:", flowError);
        await updateAuthState({ isLoggedIn: false, user: null, error: "Login setup failed." });
    }
}

// --- Temporarily expose for testing ---
if (typeof self !== 'undefined') {
    self.testLoginFlow = handleGoogleLoginFlow;
}
// --- Remove after testing ---


async function handleLogout() {
    console.log("BG: Handling logout request...");
    if (!supabase) {
        console.error("BG: Supabase client not available for logout.");
        await updateAuthState({ isLoggedIn: false, user: null, error: "Logout unavailable (client error)." });
        return;
    }
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("BG: Supabase signOut error:", error);
             await updateAuthState({ isLoggedIn: false, user: null, error: `Logout failed: ${error.message}` });
        } else {
            console.log("BG: Supabase signOut successful.");
            await updateAuthState({ isLoggedIn: false, user: null, error: null });
        }
    } catch (logoutError) {
        console.error("BG: Exception during Supabase signOut:", logoutError);
        await updateAuthState({ isLoggedIn: false, user: null, error: "Logout failed (exception)." });
    }
}

// --- Event Listeners (onInstalled, onStartup, onAuthStateChange, onMessage, onClicked) ---
chrome.runtime.onInstalled.addListener(async (details) => {
    console.log(`BG: Extension ${details.reason}. Checking initial auth state.`);
    await getAuthState();
});

chrome.runtime.onStartup.addListener(async () => {
    console.log("BG: Browser Startup. Checking initial auth state.");
    await getAuthState();
});

if (supabase) {
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log(`BG: Supabase Auth Event: ${event}`);
        const isLoggedIn = !!session?.user;
        const user = session?.user ?? null;
        const newState = { isLoggedIn, user, error: null};

        const storedStateRaw = await chrome.storage.local.get(AUTH_STATE_KEY);
        const storedState = storedStateRaw?.[AUTH_STATE_KEY];

        if(!storedState || storedState.isLoggedIn !== newState.isLoggedIn || storedState.user?.id !== newState.user?.id) {
            await updateAuthState(newState);
        }
    });
} else {
    console.warn("BG: Supabase client not available, auth listeners not attached.");
    updateAuthState({ isLoggedIn: false, user: null, error: "Supabase client not initialized" });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("BG: Message received:", message.action);

    if (message.action === 'getAuthState') {
        (async () => {
            const state = await getAuthState();
            sendResponse(state);
        })();
        return true; 
    }

    if (message.action === 'initiateGoogleLogin') {
        handleGoogleLoginFlow();
        sendResponse({ status: "Login initiated" });
        return false; 
    }

    if (message.action === 'triggerLogout') {
        handleLogout();
        sendResponse({ status: "Logout initiated"});
        return false;
    }
});

chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id || !tab.url || !tab.url.includes("leetcode.com")) { 
        console.log("BG: Not a valid LeetCode page or missing tab ID.");
        return;
    }

    chrome.tabs.sendMessage(tab.id, { action: "toggle_sidebar" }, (response) => {
        if (chrome.runtime.lastError) {
            console.log("BG: Content script not responding, attempting injection...");
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            })
            .then(() => {
                 console.log("BG: Cracked sidebar script injected.");
                 setTimeout(() => {
                     chrome.tabs.sendMessage(tab.id, { action: "toggle_sidebar" })
                         .catch(err => console.error("BG: Error sending toggle after injection:", err.message));
                 }, 150);
            })
            .catch(error => {
                 console.error("BG: Injection failed:", error);
            });
        } else {
            console.log("BG: Toggle message sent to existing content script.", response);
        }
    });
});

console.log("BG: Service Worker started.");
