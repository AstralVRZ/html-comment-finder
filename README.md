# Comment Finder

A simple browser extension to find HTML, CSS, and JavaScript comments on a webpage. This extension was made to fit my personal preferences and needs, so it might not be the most polished or feature-rich extension out there. However, it does the job for me. If you have any suggestions or improvements, feel free to open an issue or pull request.

## How It Works

This extension injects a content script into every webpage you visit. This script scans the page for HTML, CSS, and JavaScript comments. The number of comments found is then displayed on the extension's icon. When you click the icon, a popup will display all the comments found on the page.

## Installation

1. Get it from the addons page from mozilla (recommended).

The extension is not yet available on the Mozilla Add-ons page, since I'm still working on it. However, you can install it from source code. With the instructions below:

2. From source code.

Since this is a Firefox-specific extension, you'll need to load it as a temporary add-on. Here are the steps to install it:

1. Clone or download this repository.
2. Open Firefox and navigate to `about:debugging`.
3. Click on "This Firefox".
4. Click on "Load Temporary Add-on...".
5. Select the `manifest.json` file from the cloned repository.

The extension is now installed and will remain active until you close Firefox.

## About this extension

This extension is a fork of a fork of the original: [HTML Comment Finder](https://github.com/dimdenGD/html-comment-finder). This version is made for Firefox (*not chrome!*) It might not be of the best quality, but it works for me.

## Showcase

<img src="images/showcase.png" alt="Showcasing the image" style="max-width: 500px;">

## Features

- [x] Find HTML comments.
- [x] Display comments in a popup when the extension icon is clicked.
- [x] Display the number of comments found on the extension icon.
- [X] Find CSS comments.
- [X] Find JavaScript comments.
- [ ] Improve the UI of the popup.
- [ ] Add a settings page to customize the extension.
- [ ] Add a search feature to find specific comments.
- [ ] Add a feature to copy comments to the clipboard.
