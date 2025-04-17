function createCrackedSidebar() {
    if (document.getElementById("cracked-sidebar")) {
        console.log("Cracked sidebar already exists.");
        return;
    }
    const sidebar = document.createElement("div");
    sidebar.id = "cracked-sidebar";
    sidebar.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 320px;
        height: 100vh;
        background-color: #333;
        color: #fff;
        z-index: 9999;
        box-shadow: -2px 0 6px rgba(0, 0, 0, 0.3);
        font-family: sans-serif;
        display: flex;
        flex-direction: column;
        padding: 16px;
    `;
    sidebar.innerHTML = `
        <h2 style="margin: 0 0 12px 0">Cracked</h2>
        <p style="font-size: 14px;">Practice mock interviews with AI while solving LeetCode problems.</p>
        <button id="start-interview-btn" style="
            margin-top: 20px;
            padding: 10px 16px;
            font-size: 16px;
            background-color: #0070f3;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            color: #fff;
        ">
        Start Interview
        </button>
        <div id="cracked-feedback" style="
            margin-top: 24px;"></div>
    `;
    document.body.appendChild(sidebar);
    // Enable/disable button logic after creation
    const startBtn = document.getElementById("start-interview-btn");
    if (!window.location.href.includes("leetcode.com/problems/")) {
        startBtn.disabled = true;
        startBtn.innerText = "Go to a problem to start interviewing";
        startBtn.style.backgroundColor = "#999";
        startBtn.style.cursor = "not-allowed";
    }
}

// Listen for messages from background.js to toggle the sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle_sidebar") {
        const sidebar = document.getElementById("cracked-sidebar");
        if (sidebar) {
            sidebar.remove();
        } else {
            createCrackedSidebar();
        }
        sendResponse({ toggled: true });
    }
});

// Auto-inject sidebar only if not present (optional, comment out if you don't want auto-inject)
// createCrackedSidebar();
if (!window.location.href.includes("leetcode.com/problems/")) {
    startBtn.disabled = true;
    startBtn.innerText = "Go to a problem to start interviewing";
    startBtn.style.backgroundColor = "#999";
    startBtn.style.cursor = "not-allowed";
}


