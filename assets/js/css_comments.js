/**
 * This function extracts CSS comments from a stylesheet text and tracks their source.
 * @param {string} cssText The CSS text to search for comments.
 * @param {string} source The source of the CSS (inline or URL).
 * @returns {string[]} An array of CSS comments with source information.
 */
function getCssComments(cssText, source) {
    const comments = [];
    const commentRegex = /\/\*[\s\S]*?\*\//g;
    let match;

    while ((match = commentRegex.exec(cssText)) !== null) {
        let comment = match[0];
        // Remove /* and */ and trim whitespace
        comment = comment.replace(/^\/\*\s*/, "").replace(/\s*\*\/$/, "").trim();

        // Skip empty comments and comments that are actually CSS content
        if (comment.length > 0 && !isCssContent(comment)) {
            comments.push(`CSS: ${comment} | Source: ${source}`);
        }
    }

    return comments;
}

/**
 * This function checks if the comment content is actually CSS code rather than a comment.
 * @param {string} content The content to check.
 * @returns {boolean} True if the content appears to be CSS code.
 */
function isCssContent(content) {
    // Skip very short content that might be legitimate comments
    if (content.length < 10) {
        return false;
    }

    // Check for CSS properties, selectors, or other CSS-specific patterns
    const cssPatterns = [
        /^\s*[\w-]+\s*:\s*[^;]+;?\s*$/m, // CSS property: value;
        /^\s*@\w+/, // CSS at-rules like @media, @keyframes
        /^\s*[\w\-\.#\[\]:()]+\s*\{/m, // CSS selectors followed by {
        /^\s*\}\s*$/m, // Closing brace
        /border\s*:\s*\d+px/, // Common CSS patterns
        /animation\s*:\s*[\w-]+/,
        /background[^:]*:\s*/,
        /filter\s*:\s*/,
        /data-highlight/,
        /fadeOut/,
        /rgba?\(/,
        /hue-rotate/,
        /forwards/,
        /!important/,
        /transform\s*:/,
        /opacity\s*:/,
        /translateY/,
        /sepia\(/,
        /saturate\(/
    ];

    // If multiple patterns match, it's likely CSS code
    const matchCount = cssPatterns.filter(pattern => pattern.test(content)).length;
    return matchCount >= 2;
}

/**
 * This function finds all CSS comments from stylesheets in the document.
 * @returns {Promise<string[]>} A promise that resolves to an array of CSS comments found in all stylesheets.
 */
async function getAllCssComments() {
    const comments = [];

    // Get comments from inline style elements
    const styleElements = document.querySelectorAll("style");
    styleElements.forEach((styleElement, index) => {
        const cssComments = getCssComments(styleElement.textContent || styleElement.innerHTML, `Inline style #${index + 1}`);
        comments.push(...cssComments);
    });

    // Get comments from external stylesheets
    const linkElements = document.querySelectorAll("link[rel='stylesheet']");
    const fetchPromises = [];

    linkElements.forEach(linkElement => {
        if (linkElement.href) {
            const fileName = linkElement.href.split("/").pop() || linkElement.href;

            // Try to fetch external stylesheets
            const fetchPromise = fetch(linkElement.href)
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    throw new Error(`Failed to fetch ${linkElement.href}`);
                })
                .then(cssText => {
                    const cssComments = getCssComments(cssText, fileName);
                    return cssComments;
                })
                .catch(error => {
                    console.log(`Cannot access stylesheet: ${linkElement.href}`, error);
                    return [];
                });

            fetchPromises.push(fetchPromise);
        }
    });

    // Wait for all external stylesheet fetches to complete
    const externalComments = await Promise.all(fetchPromises);
    externalComments.forEach(commentArray => {
        comments.push(...commentArray);
    });

    return comments;
}
