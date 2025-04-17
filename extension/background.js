chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url) {
        console.log("Not a valid page.");
        return;
    }

    try {
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });
        console.log("Cracked sidebar script injected!");
    } catch (error) {
        console.error("Injection failed:", error);
    }
});