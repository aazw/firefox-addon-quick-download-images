console.log("addon loaded");

// remove css style for default image viewer
// * https://unformedbuilding.com/articles/default-style-for-image-only-page-on-each-browsers/
const removeStyleSheets = [
    // "resource://content-accessible/ImageDocument.css",
    "resource://content-accessible/TopLevelImageDocument.css"
];

for (let i = 0; i < document.styleSheets.length; i++) {
    if (removeStyleSheets.indexOf(document.styleSheets[i].href) >= 0) {
        document.styleSheets[i].disabled = true;
    }
}

// target url extensions
const imgExtensions = [
    "jpeg",
    "jpg",
    "png",
    "bmp",
    "gif",
    "tif",
    "tiff",
    "webp"
];

// marker for added img tag
const className = "quick-download-button-added";

const imgExtensionsUpperCases = imgExtensions.map(function (x) {
    return x.toUpperCase();
});

const newButton = (downloadURL) => {

    const downloadButton = document.createElement("img");
    downloadButton.classList.add(className);

    downloadButton.src = browser.extension.getURL("images/save.svg");
    downloadButton.style.width = "2em";
    downloadButton.style.height = "2em";
    downloadButton.style.position = "absolute";
    // downloadButton.style.right = 0;
    // downloadButton.style.top = 0;
    downloadButton.style.cursor = "pointer";
    downloadButton.style.backgroundColor = "rgba(0, 0, 0, .1)";
    downloadButton.addEventListener("click", () => {
        browser.runtime.sendMessage({ url: downloadURL });
    });

    return downloadButton;
}

const addDownloadButtonToImage = (image) => {

    if(image.classList.contains(className)) {
        return;
    }

    const widthThreshold = 100;
    const heightThreshold = 100;

    // filter by size
    if (image.width < widthThreshold && image.height < heightThreshold) {
        // skip
        return
    }

    let downloadURL = image.src;
    let target = image;
    let targetParent = image.parentElement;

    // check sign
    target.classList.add(className);

    // for <a><img/></a>
    if (targetParent.tagName === "A") {
        target = targetParent; // target: A tag
        targetParent = targetParent.parentElement; // target's parent: A tag's parent

        // override downloadUrl
        // when href is a link for the bigger image
        let extension = target.href.split(".").pop();
        if (imgExtensions.indexOf(extension) >= 0 || imgExtensionsUpperCases.indexOf(extension) >= 0) {
            // image link
            downloadURL = target.href;
        }
    }

    // insert container between parent(targetParent) and child(target)
    const container = document.createElement("div");
    target.replaceWith(container);
    container.appendChild(target);

    // set container's styles
    container.style.display = "inline-block";
    container.style.position = "relative";

    if (container.querySelector("img:first-child").width == 0) {
        container.style.width = "100%";
        container.style.height = "100%";
    }

    // add download button on 
    const downloadButton1 = newButton(downloadURL);
    container.appendChild(downloadButton1);
    downloadButton1.style.right = 0;
    downloadButton1.style.top = 0;

    const downloadButton2 = newButton(downloadURL);
    container.appendChild(downloadButton2);
    downloadButton2.style.right = 0;
    downloadButton2.style.bottom = 0;
}

function init() {

    const images = document.querySelectorAll(`img:not(.${className})`);
    for (const image of images) {
        if (image) {
            if (image.complete) {
                addDownloadButtonToImage(image);
            } else {
                if (image.getAttribute('load-event-listener-added') !== 'true') {
                    image.addEventListener('load', () => {
                        addDownloadButtonToImage(image);
                    });
                    image.setAttribute('load-event-listener-added', 'true');
                }
            }
        }
    }
}

// support continuous execution
document.addEventListener("scroll", (event) => {
    init();
});

// run first time
init();

console.log("addon configured");
