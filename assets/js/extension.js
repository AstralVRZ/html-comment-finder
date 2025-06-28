/**
 * This function is a filter that accepts all nodes.
 * It is used with the NodeIterator to traverse all nodes in the document.
 * @returns {number} NodeFilter.FILTER_ACCEPT
 */
function filterNone() {
    return NodeFilter.FILTER_ACCEPT;
}

/**
 * This function finds all the comments in a given HTML element.
 * @param {HTMLElement} rootElem The root element to search for comments.
 * @returns {string[]} An array of comments found in the root element.
 */
function getAllComments(rootElem) {
    const comments = [];
    const iterator = document.createNodeIterator(rootElem, NodeFilter.SHOW_COMMENT, filterNone, false);

    let curNode;
    while (curNode = iterator.nextNode()) {
        const trimmedComment = curNode.nodeValue.trim();
        if (trimmedComment.length > 0) {
            comments.push(trimmedComment);
        }
    }

    return comments;
}

/**
 * This is a timeout that sends a message to the background script with the comments found on the page.
 */
setTimeout(() => {
    browser.runtime.sendMessage({ action: "set", comments: getAllComments(document) });
}, 500);

/**
 * This is a listener that waits for a message from the popup script.
 * When it receives a "get" message, it sends back the comments found on the page.
 */
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "get") {
        sendResponse(getAllComments(document));
    }
});
