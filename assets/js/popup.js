/**
 * This function gets the current tab.
 * @returns {Promise<browser.tabs.Tab>}
 */
async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await browser.tabs.query(queryOptions);
    return tab;
}

const noComments = document.getElementById("no-comments");
const commentsElement = document.getElementById("comments");

/**
 * This is an immediately invoked function expression (IIFE) that gets the comments from the content script and displays them in the popup.
 */
(async () => {
    const tab = await getCurrentTab();
    let comments = [];

    try {
        comments = await browser.tabs.sendMessage(tab.id, { action: "get" });
    } catch (error) {
        console.error("An error occurred:", error);
    }

    if (!comments || comments.length === 0) {
        noComments.hidden = false;
    } else {
        commentsElement.innerHTML = "";
        for (const comment of comments) {
            const li = document.createElement("li");
            li.textContent = comment;
            commentsElement.appendChild(li);
        }
    }
})();
