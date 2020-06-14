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

// add-on implementation
function loadAddon() {
  browser.storage.local.get().then(options => {

    // init options
    options.topRightButton = typeof options.topRightButton === 'undefined'? true: options.topRightButton;
    options.bottomRightButton = typeof options.bottomRightButton === 'undefined'? true: options.bottomRightButton;
    options.sizeFilterWitdh = typeof options.sizeFilterWitdh === 'undefined'? 100: options.sizeFilterWitdh;
    options.sizeFilterHeight = typeof options.sizeFilterHeight === 'undefined'? 100: options.sizeFilterHeight;

    // search img tags
    let images = document.querySelectorAll("img");
    if (images.length == 0) {
      return;
    }

    images.forEach(element => {
      // get the target element
      let target = element;
      let downloadUrl = element.src;

      // filter by size
      if(target.width < options.sizeFilterWitdh && target.height <  options.sizeFilterHeight) {
        // skip
        return
      }

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

      // download func
      let downloadFunc = function() {
        browser.runtime.sendMessage({ url: downloadUrl });
      };

      if (options.topRightButton) {
        // top right
        let overlay1 = document.createElement("img");
        overlay1.src = browser.extension.getURL("images/save.png");
        overlay1.style.width = "2em";
        overlay1.style.height = "2em";
        overlay1.style.position = "absolute";
        overlay1.style.right = 0;
        overlay1.style.top = 0;
        overlay1.style.cursor = "pointer";
        overlay1.style.backgroundColor = "rgba(0, 0, 0, .1)";
        overlay1.addEventListener("click", downloadFunc);
        imgContainer.appendChild(overlay1);
      }

      if (options.bottomRightButton) {
        // bottom right
        let overlay2 = document.createElement("img");
        overlay2.src = browser.extension.getURL("images/save.png");
        overlay2.style.width = "2em";
        overlay2.style.height = "2em";
        overlay2.style.position = "absolute";
        overlay2.style.right = 0;
        overlay2.style.bottom = 0;
        overlay2.style.cursor = "pointer";
        overlay2.style.backgroundColor = "rgba(0, 0, 0, .1)";
        overlay2.addEventListener("click", downloadFunc);
        imgContainer.appendChild(overlay2);
      }
    });
  });
}

loadAddon();

console.log("addon configured");
