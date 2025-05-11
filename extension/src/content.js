// --- Global Variables ---
let currentProblemTitle = null;
let pollInterval = null;
let userClosedSidebar = false; // Tracks if user explicitly closed sidebar
let currentProblemUrl = null;
let sidebarElement = null; // Reference to the sidebar DOM element
let currentAuthState = { isLoggedIn: false, user: null, error: null }; // Track auth state locally

const WEBAPP_URL = "http://localhost:5173"; // Your web app URL

// --- UI Rendering Functions ---

/**
 * Creates the main UI for a logged-in user.
 * @param {HTMLElement} container - The sidebar container element.
 * @param {object} user - The Supabase user object.
 */
function renderLoggedInUI(container, user) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 100%;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-shrink: 0;">
                <h2 style="margin: 0; font-size: 1.5em;">Cracked</h2>
                <div>
                    <button id="open-webapp-btn" title="Open Dashboard" class="cracked-sidebar-button">Dashboard</button>
                    <button id="logout-btn" title="Logout" class="cracked-sidebar-button" style="margin-left: 8px; background-color: #6c757d;">Logout</button>
                </div>
            </div>
            <p style="font-size: 0.8em; color: #ccc; margin-top: 0; margin-bottom: 12px; flex-shrink: 0;">Logged in as: ${user?.email || 'User'}</p>
            
            <div style="font-size: 0.9em; margin-bottom: 15px; flex-shrink: 0;">
                Practice mock interviews with AI while solving LeetCode problems.
            </div>
            <div id="current-problem" style="margin-bottom: 15px; font-size: 0.9em; color: #ccc; min-height: 20px; flex-shrink: 0;">Detecting problem...</div>
            
            <button id="start-interview-btn" class="cracked-sidebar-button cracked-sidebar-button-primary" style="margin-bottom: 20px; flex-shrink: 0;">
                Start Interview
            </button>
            
            <div id="cracked-feedback" style="flex-grow: 1; background-color: #222; border-radius: 4px; padding: 10px; font-size: 0.85em; overflow-y: auto;">
                Welcome! Ready to start an interview?
            </div>
        </div>
    `;

    document.getElementById("open-webapp-btn")?.addEventListener("click", () => {
        window.open(`${WEBAPP_URL}/dashboard`, "_blank");
    });

    document.getElementById("logout-btn")?.addEventListener("click", () => {
        console.log("CS: Logout button clicked");
        chrome.runtime.sendMessage({ action: "triggerLogout" });
        // UI will update via authStateChanged message from background
    });

    document.getElementById("start-interview-btn")?.addEventListener("click", () => {
        const feedbackDiv = document.getElementById("cracked-feedback");
        if (currentProblemTitle && feedbackDiv) {
            feedbackDiv.textContent = `Interview started for: ${currentProblemTitle}... (AI interaction logic to be added)`;
            console.log("CS: Start Interview for:", currentProblemTitle);
        } else if (feedbackDiv) {
            feedbackDiv.textContent = "Please navigate to a LeetCode problem page first.";
        }
    });

    updateProblemInfo(); // Update problem info for the logged-in view
    if (!pollInterval) {
        pollInterval = setInterval(updateProblemInfo, 2000);
    }
}

/**
 * Creates the UI for a logged-out user.
 * @param {HTMLElement} container - The sidebar container element.
 */
function renderLoggedOutUI(container) {
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
            <h2 style="margin-bottom: 10px; font-size: 1.5em;">Cracked</h2>
            <p style="color: #ccc; margin-bottom: 30px; font-size: 0.9em;">Please sign in to start your AI mock interviews.</p>
            <button id="google-login-btn" class="cracked-sidebar-button cracked-sidebar-button-primary">
                Sign in with Google
            </button>
            <div id="login-error-message" style="color: #ff7b7b; margin-top: 15px; font-size: 0.8em;"></div>
        </div>
    `;

    document.getElementById("google-login-btn")?.addEventListener("click", () => {
        console.log("CS: Sign in with Google button clicked");
        document.getElementById("login-error-message").textContent = ""; // Clear previous errors
        chrome.runtime.sendMessage({ action: "initiateGoogleLogin" }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("CS: Error sending initiateGoogleLogin message:", chrome.runtime.lastError.message);
                 document.getElementById("login-error-message").textContent = "Error initiating login. Try again.";
            } else if (response && response.status) {
                console.log("CS: Login initiation status:", response.status);
                 // Optionally show a "Redirecting to Google..." message
            }
        });
    });

    // Stop polling if user logs out
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

/**
 * Main function to create or update the sidebar based on auth state.
 * @param {object} authState - The authentication state { isLoggedIn, user, error }.
 */
function createOrUpdateSidebar(authState) {
    currentAuthState = authState; // Update local auth state tracker
    console.log("CS: Rendering sidebar for auth state:", authState);

    if (!sidebarElement) { // If sidebar doesn't exist, create it
        sidebarElement = document.createElement("div");
        sidebarElement.id = "cracked-sidebar";
        // Basic styling, consider moving to a CSS file if it grows
        sidebarElement.style.cssText = `
            position: fixed; top: 0; right: -350px; /* Start off-screen for animation */
            width: 320px; height: 100vh; background-color: #282c34; /* Darker theme */
            color: #e0e0e0; z-index: 2147483647; /* Max z-index */
            box-shadow: -3px 0 10px rgba(0, 0, 0, 0.3);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
            display: flex; flex-direction: column; padding: 16px;
            transition: right 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smoother transition */
            box-sizing: border-box;
        `;
        document.body.appendChild(sidebarElement);

        // Adjust body padding (only once)
        const bodyStyle = window.getComputedStyle(document.body);
        const originalPaddingRight = parseFloat(bodyStyle.paddingRight) || 0;
        const originalOverflowX = bodyStyle.overflowX;
        document.body.dataset.originalPaddingRight = originalPaddingRight;
        document.body.dataset.originalOverflowX = originalOverflowX;
        document.body.style.paddingRight = `${originalPaddingRight + 320}px`;
        document.body.style.overflowX = 'hidden'; // Prevent horizontal scroll

        // Animate sidebar in
        requestAnimationFrame(() => {
            if (sidebarElement) sidebarElement.style.right = '0';
        });
    }

    // Clear previous content and render based on auth state
    sidebarElement.innerHTML = ''; // Clear existing content
    if (authState.isLoggedIn && authState.user) {
        renderLoggedInUI(sidebarElement, authState.user);
    } else {
        renderLoggedOutUI(sidebarElement);
        if (authState.error) {
            const errorDiv = sidebarElement.querySelector("#login-error-message");
            if (errorDiv) errorDiv.textContent = authState.error;
        }
    }
}

/**
 * Removes the sidebar from the page.
 */
function removeSidebar() {
    if (sidebarElement) {
        sidebarElement.style.right = '-350px'; // Animate out

        // Restore original body styles after transition
        setTimeout(() => {
            if (sidebarElement) sidebarElement.remove();
            sidebarElement = null;

            const originalPadding = parseFloat(document.body.dataset.originalPaddingRight ?? 0);
            const originalOverflow = document.body.dataset.originalOverflowX || 'visible';
            document.body.style.paddingRight = `${originalPadding}px`;
            document.body.style.overflowX = originalOverflow;
            delete document.body.dataset.originalPaddingRight;
            delete document.body.dataset.originalOverflowX;
        }, 300); // Match transition duration

        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }
}

// --- Problem Info Detection (Mostly Unchanged from your version) ---
function getProblemTitle() {
    // ... (Your existing getProblemTitle logic)
    try {
        const script = document.getElementById('__NEXT_DATA__');
        if (!script) return null;
        const jsonData = JSON.parse(script.textContent);
        const question = jsonData.props?.pageProps?.question;
        if (question?.questionFrontendId && question?.title) {
            return `${question.questionFrontendId}. ${question.title}`;
        }
    } catch (e) { console.error('Error parsing problem data:', e); }
    const links = document.querySelectorAll('a[href*="/problems/"]');
    for (const link of links) {
        const text = link.textContent.trim();
        if (/^\d+\.\s+.+/.test(text)) return text;
    }
    return null;
}

function updateProblemInfo() {
    if (!sidebarElement || !currentAuthState.isLoggedIn) return; // Only if logged in

    const startBtn = document.getElementById("start-interview-btn");
    const problemInfoDiv = document.getElementById("current-problem");

    if (!startBtn || !problemInfoDiv) return;

    const isProblemPage = window.location.href.includes("leetcode.com/problems/");
    const problemTitle = isProblemPage ? getProblemTitle() : null;

    if (problemTitle) {
        currentProblemTitle = problemTitle;
        problemInfoDiv.textContent = `Problem: ${problemTitle}`;
        startBtn.disabled = false;
        startBtn.style.backgroundColor = ""; // Rely on CSS class
        startBtn.style.cursor = "pointer";
        startBtn.innerText = "Start Interview";
    } else {
        currentProblemTitle = null;
        problemInfoDiv.textContent = isProblemPage ? "Detecting problem..." : "Navigate to a problem page";
        startBtn.disabled = true;
        startBtn.style.backgroundColor = "#555"; // Disabled color
        startBtn.style.cursor = "not-allowed";
        startBtn.innerText = isProblemPage ? "Loading problem..." : "Go to Problem";
    }
}

// --- Event Listeners & Initialization ---

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("CS: Message received from background:", request.action);

    if (request.action === "toggle_sidebar") {
        if (sidebarElement) {
            userClosedSidebar = true; // User explicitly closed it
            removeSidebar();
            sendResponse({ success: true, toggled: false });
        } else {
            userClosedSidebar = false;
            // Ask background for auth state before showing
            chrome.runtime.sendMessage({ action: 'getAuthState' }, (authState) => {
                if (chrome.runtime.lastError) {
                   console.error("CS: Error getting auth state on toggle:", chrome.runtime.lastError.message);
                   createOrUpdateSidebar({ isLoggedIn: false, user: null, error: "Could not get auth status." });
                } else if (authState) {
                   createOrUpdateSidebar(authState);
                } else {
                    // Fallback if authState is unexpectedly undefined
                    createOrUpdateSidebar({ isLoggedIn: false, user: null, error: "Auth status unavailable." });
                }
                sendResponse({ success: true, toggled: true });
            });
            return true; // Keep channel open for async response from getAuthState
        }
    } else if (request.action === "authStateChanged") {
        console.log("CS: Auth state changed message received, new state:", request.payload);
        currentAuthState = request.payload; // Update local tracker
        if (sidebarElement) { // Only update UI if sidebar is currently open
             createOrUpdateSidebar(currentAuthState);
        }
        sendResponse({ success: true, received: true });
    } else if (request.action === "get_problem_title") {
         sendResponse({ problemTitle: currentProblemTitle });
    }
    // Ensure a response is sent if not returning true for async
    // if (! (request.action === "toggle_sidebar" && !sidebarElement) ) {
    //     sendResponse({ success: true }); // Default ack for other sync messages
    // }
});

// Observe URL changes
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        onUrlChange();
    }
}).observe(document, { subtree: true, childList: true });

function onUrlChange() {
    const url = location.href;
    const isProblemPage = url.includes("leetcode.com/problems/");

    if (isProblemPage) {
        if (sidebarElement && currentAuthState.isLoggedIn) { // Only update if sidebar exists and logged in
            updateProblemInfo();
        }
        currentProblemUrl = url;
    } else {
        // Navigated away from a problem page
        if (sidebarElement) {
            // If sidebar is open and user navigates away from problems,
            // we might want to close it or change its content.
            // For now, let's just ensure problem info is cleared if it was specific.
            // If you want to auto-close:
            // removeSidebar();
            // userClosedSidebar = false; // Reset this if auto-closing
            const problemInfoDiv = document.getElementById("current-problem");
            const startBtn = document.getElementById("start-interview-btn");
            if(problemInfoDiv) problemInfoDiv.textContent = "Navigate to a problem page";
            if(startBtn) {
                startBtn.disabled = true;
                startBtn.style.backgroundColor = "#555";
                startBtn.innerText = "Go to Problem";
            }

        }
        currentProblemTitle = null;
    }
}

// Initial check when content script loads (e.g., on page load/refresh)
function initializeContentScript() {
    console.log("CS: Initializing Cracked Content Script...");
    // Don't automatically open sidebar on load. User clicks icon.
    // We just need to be ready to listen for messages.
    // If sidebar was previously open and page reloads, it will be closed.
    // User needs to click icon again. This simplifies state management.

    // Add basic styles for buttons
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        .cracked-sidebar-button {
            padding: 8px 12px;
            font-size: 0.9em;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            color: #fff;
            background-color: #007bff; /* Primary button color */
            transition: background-color 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .cracked-sidebar-button:hover {
            background-color: #0056b3;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .cracked-sidebar-button:disabled {
            background-color: #555;
            cursor: not-allowed;
            box-shadow: none;
        }
        .cracked-sidebar-button-primary {
             background-color: #28a745; /* Green for primary actions like Start/Sign In */
        }
        .cracked-sidebar-button-primary:hover {
             background-color: #1e7e34;
        }
    `;
    document.head.appendChild(styleSheet);
}

// Run initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
    initializeContentScript();
}
