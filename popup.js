async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await browser.tabs.query(queryOptions);
    return tab;
}

let noComments = document.getElementById('no-comments');
let commentsElement = document.getElementById('comments');

(async () => {
    let tab = await getCurrentTab();
    let comments = await browser.tabs.sendMessage(tab.id, { action: "get" });
    if(!comments) comments = [];
    
    noComments.hidden = comments.length >= 1;
    commentsElement.innerHTML = "";

    for(let comment of comments) {
        let li = document.createElement('li');
        li.innerHTML = comment;
        commentsElement.appendChild(li);
    }
})();