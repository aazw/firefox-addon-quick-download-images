// References
// * https://stackoverflow.com/questions/48450230/firefox-webextension-api-downloads-not-working/48456109
// * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts#Communicating_with_background_scripts

// バックグラウンドスクリプトでのダウンロード処理
const download = async (message) => {
  let filename = null;

  // URLからファイル名取得
  const urlPath = new URL(message.url).pathname;
  const urlPathParts = urlPath.split("/");
  filename = urlPathParts[urlPathParts.length - 1];

  // ファイル名からベース名取得
  const filenameParts = filename.split(".");
  const extension = filenameParts.pop();
  const basename = decodeURI(filenameParts.join(".")).replace(
    /[\/:\\\^`\|]/g,
    "_",
  );

  // ベース名にページタイトルが含まれているかどうかを、英数字のみのファイル名かどうかで判断
  if (new RegExp("[a-zA-Z0-9\-_]", "g").exec(basename)) {
    // ページタイトルをファイルパスにできるよう正規化
    // https://stackoverflow.com/questions/54804674/regex-remove-special-characters-in-filename-except-extension
    let title = message.documentTitle.replace(/[\/:\\\^`\|]/g, "_");

    // ファイル名長くなりすぎて保存できなくなるのに対応. ページタイトル30文字以上切り捨て
    if (title.length > 30) {
      title = title.substring(0, 30);
    }

    // ファイル名にページタイトルを追加
    filename = title + "_" + basename + "." + extension;
  }

  // Twitter Web向け設定
  const urlParser = new URL(message.url);
  if (urlParser.searchParams.has("format")) {
    let format = urlParser.searchParams.get("format");
    let splited = urlParser.pathname.split("/");
    filename = splited[splited.length - 1] + "." + format;
  }

  // リトライ時の待機処理
  const sleep = (waitTime) =>
    new Promise((resolve) => setTimeout(resolve, waitTime));

  // 謎の50msまち. 意味ないのなら消す
  await sleep(50);

  // リトライカウント
  const maxRetryCount = 10;

  // ダウンロード with リトライ
  for (let retryCount = 0; retryCount < maxRetryCount; retryCount++) {
    try {
      const downloading = await browser.downloads.download({
        url: message.url,
        filename: filename,
        method: "GET",
        conflictAction: "uniquify",
      });

      // リトライループの正常終了
      break;
    } catch (error) {
      // リトライ前の待機
      await sleep(50);
    }
  }
};

// コンテンツスクリプトからのメッセージの受取り
browser.runtime.onMessage.addListener(download);
