// References
// * https://stackoverflow.com/questions/48450230/firefox-webextension-api-downloads-not-working/48456109
// * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#Communicating_with_background_scripts

function onStartedDownload(id) {
  console.log(`Started downloading: ${id}`);
}

function onFailed(error) {
  console.log(`Download failed: ${error}`);
}

function download(message) {
  let downloading = browser.downloads.download({
    url: message.url,
    method: "GET",
    conflictAction: "uniquify"
  });
  downloading.then(onStartedDownload, onFailed);
}

browser.runtime.onMessage.addListener(download);
