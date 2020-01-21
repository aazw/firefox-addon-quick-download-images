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

const imgExtensionsUpperCases = imgExtensions.map(function(x) {
  return x.toUpperCase();
});

function loadAddon() {
  let images = document.querySelectorAll("img");
  if (images.length == 0) {
    return;
  }

  images.forEach(element => {
    // get the target element
    let target = element;
    let downloadUrl = element.src;

    // update the target element if it is be wrapped by A tag
    if (element.parentElement.tagName == "A") {
      target = element.parentElement;

      // override downloadUrl
      let extension = target.href.split(".").pop();
      if (
        imgExtensions.indexOf(extension) >= 0 ||
        imgExtensionsUpperCases.indexOf(extension) >= 0
      ) {
        // image link
        downloadUrl = target.href;
      } else {
        return;
      }
    }

    // create an image container
    let imgContainer = document.createElement("div");

    // add the image container into the parent node of the target element
    target.parentElement.appendChild(imgContainer);

    // move the target element to the image container
    imgContainer.appendChild(target);

    // add an download button overlaying the target element
    imgContainer.style.display = "inline-block";
    imgContainer.style.position = "relative";

    let overlay = document.createElement("img");
    overlay.src = browser.extension.getURL("images/save.png");
    overlay.style.width = "2em";
    overlay.style.height = "2em";
    overlay.style.position = "absolute";
    overlay.style.top = 0;
    overlay.style.right = 0;
    overlay.style.cursor = "pointer";
    overlay.style.backgroundColor = "rgba(0, 0, 0, .1)";
    overlay.addEventListener("click", function() {
      browser.runtime.sendMessage({ url: downloadUrl });
    });

    imgContainer.appendChild(overlay);
  });
}

loadAddon();

console.log("addon configured");
