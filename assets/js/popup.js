/**
 * This function gets the current tab.
 * @returns {Promise<browser.tabs.Tab>}
 */
async function getCurrentTab() {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await browser.tabs.query(queryOptions);
    return tab;
}

const noHtmlComments = document.getElementById("no-html-comments");
const noCssComments = document.getElementById("no-css-comments");
const noJsComments = document.getElementById("no-js-comments");
const htmlCommentsElement = document.getElementById("html-comments");
const cssCommentsElement = document.getElementById("css-comments");
const jsCommentsElement = document.getElementById("js-comments");

/**
 * This function handles tab switching functionality.
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabPanels = document.querySelectorAll(".tab-panel");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetTab = button.getAttribute("data-tab");

            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabPanels.forEach(panel => panel.classList.remove("active"));

            button.classList.add("active");
            document.getElementById(targetTab + "-tab").classList.add("active");
        });
    });
}

/**
 * This function displays HTML comments in the ordered list.
 * @param {string[]} htmlComments Array of HTML comments
 */
function displayHtmlComments(htmlComments) {
    if (htmlComments.length === 0) {
        noHtmlComments.hidden = false;
        htmlCommentsElement.style.display = "none";
    } else {
        noHtmlComments.hidden = true;
        htmlCommentsElement.style.display = "block";
        htmlCommentsElement.innerHTML = "";
        htmlComments.forEach(comment => {
            const li = document.createElement("li");
            li.textContent = comment;
            htmlCommentsElement.appendChild(li);
        });
    }
}

/**
 * This function displays CSS comments in the table.
 * @param {Object[]} cssComments Array of CSS comment objects with comment and source properties
 */
function displayCssComments(cssComments) {
    const tbody = cssCommentsElement.querySelector("tbody");

    if (cssComments.length === 0) {
        noCssComments.hidden = false;
        cssCommentsElement.style.display = "none";
    } else {
        noCssComments.hidden = true;
        cssCommentsElement.style.display = "table";
        tbody.innerHTML = "";
        cssComments.forEach(commentObj => {
            const row = document.createElement("tr");

            const commentCell = document.createElement("td");
            commentCell.className = "comment-cell";
            commentCell.textContent = commentObj.comment;

            const sourceCell = document.createElement("td");
            sourceCell.className = "source-cell";
            sourceCell.textContent = commentObj.source;

            row.appendChild(commentCell);
            row.appendChild(sourceCell);
            tbody.appendChild(row);
        });
    }
}

/**
 * This function displays JS comments in the table.
 * @param {Object[]} jsComments Array of JS comment objects with comment and source properties
 */
function displayJsComments(jsComments) {
    const tbody = jsCommentsElement.querySelector("tbody");

    if (jsComments.length === 0) {
        noJsComments.hidden = false;
        jsCommentsElement.style.display = "none";
    } else {
        noJsComments.hidden = true;
        jsCommentsElement.style.display = "table";
        tbody.innerHTML = "";
        jsComments.forEach(commentObj => {
            const row = document.createElement("tr");

            const commentCell = document.createElement("td");
            commentCell.className = "comment-cell";
            commentCell.textContent = commentObj.comment;

            const sourceCell = document.createElement("td");
            sourceCell.className = "source-cell";
            sourceCell.textContent = commentObj.source;

            row.appendChild(commentCell);
            row.appendChild(sourceCell);
            tbody.appendChild(row);
        });
    }
}

/**
 * This is an immediately invoked function expression (IIFE) that gets the comments from the content script and displays them in the popup.
 */
(async () => {
    initializeTabs();

    // Hide "no comments" messages initially
    noHtmlComments.hidden = true;
    noCssComments.hidden = true;
    noJsComments.hidden = true;

    const tab = await getCurrentTab();
    let comments = [];

    try {
        comments = await browser.tabs.sendMessage(tab.id, { action: "get" });
    } catch (error) {
        console.error("An error occurred:", error);
    }

    const htmlComments = [];
    const cssComments = [];
    const jsComments = [];

    if (comments && comments.length > 0) {
        comments.forEach(comment => {
            if (comment.startsWith("HTML: ")) {
                htmlComments.push(comment.substring(6));
            } else if (comment.startsWith("CSS: ")) {
                const parts = comment.substring(5).split(" | Source: ");
                cssComments.push({
                    comment: parts[0],
                    source: parts[1] || "Unknown"
                });
            } else if (comment.startsWith("JS: ")) {
                const parts = comment.substring(4).split(" | Source: ");
                jsComments.push({
                    comment: parts[0],
                    source: parts[1] || "Unknown"
                });
            }
        });
    }

    displayHtmlComments(htmlComments);
    displayCssComments(cssComments);
    displayJsComments(jsComments);
})();
