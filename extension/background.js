chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url) {
        console.log("Not a valid page.");
        return;
    }

    // Try sending a toggle message to content script
    chrome.tabs.sendMessage(tab.id, { action: "toggle_sidebar" }, async (response) => {
        if (chrome.runtime.lastError) {
            // Content script not injected yet, so inject it first
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ["content.js"]
                });
                // After injection, send the toggle message again
                chrome.tabs.sendMessage(tab.id, { action: "toggle_sidebar" });
                console.log("Cracked sidebar script injected and toggled!");
            } catch (error) {
                console.error("Injection failed:", error);
            }
        } else {
            // Message sent successfully
            console.log("Toggle message sent to content script.");
        }
    });
});