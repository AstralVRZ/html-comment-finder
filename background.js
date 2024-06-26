browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if(request.action === "set") {
        browser.action.setBadgeText({
            text: request.comments.length > 0 ? request.comments.length.toString() : '',
            tabId: sender.tab.id
        });
        browser.action.setIcon({
            path: request.comments.length > 0 ? 'images/eye_open.png' : 'images/eye_closed.png',
            tabId: sender.tab.id
        });
    }
});