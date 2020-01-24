function restoreOptions() {
  let storageItem = browser.storage.local.get();
  storageItem.then(res => {
    let optionsForm = document.querySelector("#optionsForm");
    optionsForm.topRightButton.checked =
      typeof res.topRightButton === "undefined" ? true : res.topRightButton;
    optionsForm.bottomRightButton.checked =
      typeof res.bottomRightButton === "undefined"
        ? true
        : res.bottomRightButton;
  });
}

function saveOptions(e) {
  let optionsForm = document.querySelector("#optionsForm");
  browser.storage.local.set({
    topRightButton: optionsForm.topRightButton.checked,
    bottomRightButton: optionsForm.bottomRightButton.checked
  });
  e.preventDefault();
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelectorAll("input").forEach(element => {
  element.addEventListener("change", saveOptions);
});
