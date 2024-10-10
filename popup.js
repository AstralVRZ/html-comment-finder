async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await browser.tabs.query(queryOptions);
    return tab;
}

let noComments = document.getElementById('no-comments');
let commentsElement = document.getElementById('comments');

(async () => {
    let tab = await getCurrentTab();
    let comments = [];
    try {
        comments = await browser.tabs.sendMessage(tab.id, { action: "get" });
    } catch (error) {
        console.error("An error occurred:", error);
    }
    
    if(!comments) comments = [];
    
    if (comments.length === 0) {
        noComments.hidden = false;
    } else {
        commentsElement.innerHTML = "";
        for(let comment of comments) {
            let li = document.createElement('li');
            li.innerHTML = comment;
            commentsElement.appendChild(li);
        }
    }
})();
