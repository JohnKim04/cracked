// Track the current problem title
let currentProblemTitle = null;
let pollInterval = null;

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
        <div id="current-problem" style="margin: 10px 0; font-size: 14px; color: #ccc;"></div>
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

    const bodyStyle = window.getComputedStyle(document.body);
    const originalPaddingRight = parseFloat(bodyStyle.paddingRight) || 0;
    const originalOverflowX = bodyStyle.overflowX;

    document.body.style.paddingRight = `${originalPaddingRight + 320}px`;
    document.body.style.overflowX = 'hidden';

    // Save original values as data attributes
    document.body.dataset.originalPaddingRight = originalPaddingRight;
    document.body.dataset.originalOverflowX = originalOverflowX;
    document.body.appendChild(sidebar);

    pollInterval = setInterval(updateProblemInfo, 2000);
    
    // Update the button state and problem info
    updateProblemInfo();
}

function getProblemTitle() {
    try {
        const script = document.getElementById('__NEXT_DATA__');
        if (!script) return null;
        
        const jsonData = JSON.parse(script.textContent);
        const question = jsonData.props?.pageProps?.question;
        
        if (question?.questionFrontendId && question?.title) {
            return `${question.questionFrontendId}. ${question.title}`;
        }
    } catch (e) {
        console.error('Error parsing problem data:', e);
    }
    
    // Fallback to DOM scraping if Next.js data not available
    const links = document.querySelectorAll('a[href*="/problems/"]');
    for (const link of links) {
        const text = link.textContent.trim();
        if (/^\d+\.\s+.+/.test(text)) {
            return text;
        }
    }
    
    return null;
}

function updateProblemInfo() {
    const startBtn = document.getElementById("start-interview-btn");
    const problemInfoDiv = document.getElementById("current-problem");
    
    if (!startBtn || !problemInfoDiv) return;

    const isProblemPage = window.location.href.includes("leetcode.com/problems/");
    const problemTitle = isProblemPage ? getProblemTitle() : null;

    if (problemTitle) {
        currentProblemTitle = problemTitle;
        problemInfoDiv.textContent = `Current Problem: ${problemTitle}`;
        startBtn.disabled = false;
        startBtn.style.backgroundColor = "#0070f3";
        startBtn.style.cursor = "pointer";
        startBtn.innerText = "Start Interview";
    } else {
        problemInfoDiv.textContent = isProblemPage 
            ? "Detecting problem..." 
            : "Navigate to a problem to begin";
        startBtn.disabled = true;
        startBtn.style.backgroundColor = "#999";
        startBtn.style.cursor = "not-allowed";
        startBtn.innerText = isProblemPage 
            ? "Loading problem..." 
            : "Go to a problem page";
    }
}

// Observe URL changes to detect when user navigates to a problem page
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        onUrlChange();
    }
}).observe(document, {subtree: true, childList: true});

function onUrlChange() {
    // If sidebar exists, update the problem info
    if (document.getElementById("cracked-sidebar")) {
        updateProblemInfo();
    }
    
}

// Listen for messages from background.js to toggle the sidebar
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle_sidebar") {
        const sidebar = document.getElementById("cracked-sidebar");
        if (sidebar) {
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
            // Restore original body styles
            const originalPadding = parseFloat(document.body.dataset.originalPaddingRight) || 0;
            const originalOverflow = document.body.dataset.originalOverflowX || 'visible';

            document.body.style.paddingRight = `${originalPadding}px`;
            document.body.style.overflowX = originalOverflow;

            // Cleanup data attributes
            delete document.body.dataset.originalPaddingRight;
            delete document.body.dataset.originalOverflowX;

            sidebar.remove();
        } else {
            createCrackedSidebar();
        }
        sendResponse({ toggled: true, problemTitle: currentProblemTitle });
    }
    
    if (request.action === "get_problem_title") {
        sendResponse({ problemTitle: currentProblemTitle });
    }
});

// Wait for DOMContentLoaded before initializing sidebar or getting problem title
function initializeCrackedSidebar() {
    if (window.location.href.includes("leetcode.com/problems/")) {
        currentProblemTitle = getProblemTitle();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCrackedSidebar);
} else {
    initializeCrackedSidebar();
}