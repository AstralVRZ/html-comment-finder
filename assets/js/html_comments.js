/**
 * This function is a filter that accepts all nodes.
 * It is used with the NodeIterator to traverse all nodes in the document.
 * @returns {number} NodeFilter.FILTER_ACCEPT
 */
function filterNone() {
    return NodeFilter.FILTER_ACCEPT;
}

/**
 * This function cleans up malformed HTML comments and handles nested comment markers.
 * @param {string} commentText The raw comment text.
 * @returns {string} The cleaned comment text.
 */
function cleanHtmlComment(commentText) {
    // Remove any nested comment markers that might appear in malformed comments
    let cleaned = commentText;

    // Remove any trailing comment end markers that might be present in malformed comments
    cleaned = cleaned.replace(/-->\s*$/, "");

    // Remove any leading comment start markers that might be present in malformed comments
    cleaned = cleaned.replace(/^<!--\s*/, "");

    // Handle the specific case of nested comments like "<!-- Nested comments - inner comment - outer continues"
    // Split on comment markers and take the first meaningful part
    if (cleaned.includes("<!--")) {
        const parts = cleaned.split("<!--");
        cleaned = parts[0].trim();
    }

    return cleaned.trim();
}

/**
 * This function finds all HTML comments in a given HTML element.
 * @param {HTMLElement} rootElem The root element to search for comments.
 * @returns {string[]} An array of HTML comments found in the root element.
 */
function getAllHtmlComments(rootElem) {
    const comments = [];

    // Get HTML comments using NodeIterator (handles properly formed comments)
    const iterator = document.createNodeIterator(rootElem, NodeFilter.SHOW_COMMENT, filterNone, false);
    let curNode;
    while (curNode = iterator.nextNode()) {
        let commentText = curNode.nodeValue.trim();
        if (commentText.length > 0) {
            // Clean up malformed nested comments
            commentText = cleanHtmlComment(commentText);
            comments.push("HTML: " + commentText);
        }
    }

    return comments;
}
