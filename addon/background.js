// References
// * https://stackoverflow.com/questions/48450230/firefox-webextension-api-downloads-not-working/48456109
// * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#Communicating_with_background_scripts

const onStartedDownload = (id) => {
  console.log(`Started downloading: ${id}`);
}

const onFailed = (error) => {
  console.log(`Download failed: ${error}`);
}

const download = async (message) => {

  let filename = null;

  // for twitter web
  const urlParser = new URL(message.url);
  if (urlParser.searchParams.has("format")) {
    let format = urlParser.searchParams.get("format");
    let splited = urlParser.pathname.split('/');
    filename = splited[splited.length - 1] + "." + format;
  }

  const sleep = waitTime => new Promise(resolve => setTimeout(resolve, waitTime));
  await sleep(50);

  const maxRetryCount = 10;

  for (let retryCount = 0; retryCount < maxRetryCount; retryCount++) {
    try {
      const downloading = await browser.downloads.download({
        url: message.url,
        filename: filename,
        method: "GET",
        conflictAction: "uniquify"
      });

      console.log(`Started downloading: ${downloading}`);
      break; // finish retry loop
    } catch (error) {
      console.log(`Download failed: ${error}`);
      await sleep(50);
      console.log(`retrying`);
    }
  }

  console.log(`Download complete`);

  // downloading.then(onStartedDownload, onFailed);
}

browser.runtime.onMessage.addListener(download);
