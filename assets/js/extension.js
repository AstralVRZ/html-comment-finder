/**
 * This function finds all the comments in a given HTML element and CSS stylesheets.
 * @param {HTMLElement} rootElem The root element to search for comments.
 * @returns {Promise<string[]>} A promise that resolves to an array of comments found in the root element and CSS.
 */
async function getAllComments(rootElem) {
    const comments = [];

    // Get HTML comments
    const htmlComments = getAllHtmlComments(rootElem);
    comments.push(...htmlComments);

    // Get CSS comments (async)
    const cssComments = await getAllCssComments();
    comments.push(...cssComments);

    // Get JavaScript comments (async)
    const jsComments = await getAllJsComments();
    comments.push(...jsComments);

    return comments;
}

/**
 * This is a timeout that sends a message to the background script with the comments found on the page.
 */
setTimeout(async () => {
    const comments = await getAllComments(document);
    browser.runtime.sendMessage({ action: "set", comments });
}, 500);

/**
 * This is a listener that waits for a message from the popup script.
 * When it receives a "get" message, it sends back the comments found on the page.
 */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get") {
        getAllComments(document).then(comments => {
            sendResponse(comments);
        }).catch(error => {
            console.error("Error getting comments:", error);
            sendResponse([]);
        });
        return true; // Keep the message channel open for async response
    }
});
