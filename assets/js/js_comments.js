/**
 * This function extracts JavaScript comments from script text and tracks their source.
 * @param {string} jsText The JavaScript text to search for comments.
 * @param {string} source The source of the JavaScript (inline or URL).
 * @returns {string[]} An array of JavaScript comments with source information.
 */
function getJsComments(jsText, source) {
    const comments = [];

    // Remove string literals to avoid false positives from content within strings
    let cleanedJsText = jsText;

    // Remove single-quoted strings
    cleanedJsText = cleanedJsText.replace(/'(?:[^'\\]|\\.)*'/g, "''");

    // Remove double-quoted strings
    cleanedJsText = cleanedJsText.replace(/"(?:[^"\\]|\\.)*"/g, '""');

    // Remove template literals
    cleanedJsText = cleanedJsText.replace(/`(?:[^`\\]|\\.)*`/g, "``");

    // Match single-line comments (//) from cleaned text
    const singleLineRegex = /\/\/.*$/gm;
    let match;

    while ((match = singleLineRegex.exec(cleanedJsText)) !== null) {
        let comment = match[0].replace(/^\/\/\s*/, "").trim();
        if (comment.length > 0 && !isJsContent(comment)) {
            comments.push(`JS: ${comment} | Source: ${source}`);
        }
    }

    // Match multi-line comments (/* */) from cleaned text
    const multiLineRegex = /\/\*[\s\S]*?\*\//g;

    while ((match = multiLineRegex.exec(cleanedJsText)) !== null) {
        let comment = match[0];
        // Remove /* and */ and trim whitespace
        comment = comment.replace(/^\/\*\s*/, "").replace(/\s*\*\/$/, "").trim();

        // Skip empty comments and comments that are actually JS content
        if (comment.length > 0 && !isJsContent(comment)) {
            comments.push(`JS: ${comment} | Source: ${source}`);
        }
    }

    return comments;
}

/**
 * This function checks if the comment content is actually JavaScript code rather than a comment.
 * @param {string} content The content to check.
 * @returns {boolean} True if the content appears to be JavaScript code.
 */
function isJsContent(content) {
    // Skip very short content that might be legitimate comments
    if (content.length < 3) {
        return false;
    }

    // Allow simple words/phrases that are clearly comments
    if (/^[a-zA-Z\s]+$/.test(content)) {
        return false;
    }

    // Check for SVG/XML content
    const svgXmlPatterns = [
        /www\.w3\.org\/2000\/svg/, // SVG namespace
        /<[\/]?\w+/, // XML/HTML tags
        /fill=["']/, // SVG attributes
        /path\s+d=/, // SVG path data
        /class=["']/, // Class attributes
        /clip-rule=/, // SVG attributes
        /fill-rule=/, // SVG attributes
    ];

    // Check for obvious code patterns that should be filtered out
    const codePatterns = [
        /^\s*(function|const|let|var|if|for|while|return|import|export|class|async|await)\s*[\(\{]/,
        /^\s*\w+\s*=\s*[\[\{]/, // Variable assignment to object/array
        /^\s*\w+\s*\([^)]*\)\s*[\{;]/, // Function calls or definitions
        /^\s*(true|false|null|undefined)\s*[,;\}]/, // Literals followed by syntax
        /^\s*\d+\s*[,;\}]/, // Numbers followed by syntax
        /^\s*["'].*["']\s*[,;\}]/, // Strings followed by syntax
        /^\s*\/.*\/[gimuy]*\s*[,;\}]/, // Regex followed by syntax
        /^\s*[\[\{].*[\]\}]\s*$/, // Array or object literals
        /console\.(log|error|warn|info)\s*\(/, // Console methods
        /document\.|window\./, // DOM/BOM objects
        /addEventListener|querySelector|getElementById/,
        // Make these patterns more specific to avoid false positives
        /^\w+\s*[\(\{]/, // Only filter if it looks like a function call/definition
    ];

    // Check for CSS-like content that got mixed in
    const cssLikePatterns = [
        /\{\s*[\w-]+\s*:\s*[^}]+\}/, // CSS rule blocks
        /[\w-]+\s*:\s*[^;]+;/, // CSS properties
        /px|em|rem|%|vh|vw|deg/, // CSS units
        /border\s*:\s*\d+px/, // CSS properties
        /animation\s*:\s*/,
        /background-color\s*:\s*/,
        /filter\s*:\s*/,
        /rgba?\(/,
        /hue-rotate/,
        /forwards/,
        /!important/,
        /transform\s*:/,
        /opacity\s*:/,
        /translateY/,
        /sepia\(/,
        /saturate\(/,
        /fadeOut/,
        /data-highlight/
    ];

    // Check for fragments that are clearly code syntax
    const syntaxFragments = [
        /^[,;\}\]]+$/, // Just punctuation
        /^[gm]+$/, // Regex flags
        /^[\w.-]+\.js$/, // Filenames
        /^https?:\/\//, // URLs
        /^[A-Z]\d+[A-Z]\d+/, // Hex-like patterns (like SVG coordinates)
        /^[0-9A-F]{6,}$/i, // Hex colors or IDs
        /^\w+\(\d+/, // Function calls with numbers
    ];

    // If it contains SVG/XML content, filter it out
    if (svgXmlPatterns.some(pattern => pattern.test(content))) {
        return true;
    }

    // If it matches code patterns, filter it out
    if (codePatterns.some(pattern => pattern.test(content))) {
        return true;
    }

    // If it looks like CSS, filter it out
    if (cssLikePatterns.some(pattern => pattern.test(content))) {
        return true;
    }

    // If it's just syntax fragments, filter it out
    if (syntaxFragments.some(pattern => pattern.test(content))) {
        return true;
    }

    // Filter out very long content that's likely data rather than comments
    if (content.length > 500) {
        return true;
    }

    return false;
}

/**
 * This function finds all JavaScript comments from script elements and external files in the document.
 * @returns {Promise<string[]>} A promise that resolves to an array of JavaScript comments found.
 */
async function getAllJsComments() {
    const comments = [];

    // Get comments from inline script elements
    const scriptElements = document.querySelectorAll("script");
    scriptElements.forEach((scriptElement, index) => {
        // Skip external scripts without content and scripts with src attribute
        if (scriptElement.src) {
            return; // We'll handle external scripts separately
        }

        const scriptContent = scriptElement.textContent || scriptElement.innerHTML;
        if (scriptContent && scriptContent.trim()) {
            const jsComments = getJsComments(scriptContent, `Inline script #${index + 1}`);
            comments.push(...jsComments);
        }
    });

    // Get comments from external JavaScript files
    const externalScripts = document.querySelectorAll("script[src]");
    const fetchPromises = [];

    externalScripts.forEach(scriptElement => {
        if (scriptElement.src) {
            const fileName = scriptElement.src.split("/").pop() || scriptElement.src;

            // Try to fetch external JavaScript files
            const fetchPromise = fetch(scriptElement.src)
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    }
                    throw new Error(`Failed to fetch ${scriptElement.src}`);
                })
                .then(jsText => {
                    const jsComments = getJsComments(jsText, fileName);
                    return jsComments;
                })
                .catch(error => {
                    console.log(`Cannot access script: ${scriptElement.src}`, error);
                    return [];
                });

            fetchPromises.push(fetchPromise);
        }
    });

    // Wait for all external script fetches to complete
    const externalComments = await Promise.all(fetchPromises);
    externalComments.forEach(commentArray => {
        comments.push(...commentArray);
    });

    return comments;
}
