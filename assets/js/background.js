/**
 * This script is responsible for updating the browser action (the extension's icon)
 * based on the number of comments found on a webpage.
 */

browser.runtime.onMessage.addListener(async (request, sender) => {
    if (request.action === "set") {
        const { comments } = request;
        const { tab } = sender;

        const text = comments.length > 0 ? comments.length.toString() : "";
        browser.action.setBadgeText({
            text,
            tabId: tab.id,
        });

        const iconPath = comments.length > 0 ? "/assets/images/comments_found.png" : "/assets/images/no_comments_found.png";
        browser.action.setIcon({
            path: iconPath,
            tabId: tab.id,
        });
    }
});