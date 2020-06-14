function restoreOptions() {
  browser.storage.local.get().then(options => {
    let optionsForm = document.querySelector("#optionsForm");

    // top-right button
    optionsForm.topRightButton.checked = typeof options.topRightButton === "undefined" ? true : options.topRightButton;

    // bottom-right button
    optionsForm.bottomRightButton.checked = typeof options.bottomRightButton === "undefined" ? true : options.bottomRightButton;
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
