console.log("addon loaded");

// ブラウザ標準画像ビューアのCSSスタイルの削除
// https://unformedbuilding.com/articles/default-style-for-image-only-page-on-each-browsers/
const removeStyleSheets = [
    "resource://content-accessible/TopLevelImageDocument.css"
];

// CSSの削除
for (let i = 0; i < document.styleSheets.length; i++) {
    if (removeStyleSheets.indexOf(document.styleSheets[i].href) >= 0) {
        document.styleSheets[i].disabled = true;
    }
}

// ターゲットとなる画像URLの拡張子
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

// 拡張子一覧の大文字版
const imgExtensionsUpperCases = imgExtensions.map(function (x) {
    return x.toUpperCase();
});

// 小さすぎる画像は広告リンクであることが多いので除外する. そのためのしきい値
const widthThreshold = 100;
const heightThreshold = 100;


// 処理済み画像タグに付与するマーカー
const className = "quick-download-button-added";

// ダウンロード用ボタン要素生成
const newDownloadButton = (downloadURL) => {

    const downloadButton = document.createElement("img");
    downloadButton.src = browser.extension.getURL("images/save.svg");
    downloadButton.style.width = "2em";
    downloadButton.style.height = "2em";
    downloadButton.style.position = "absolute";
    downloadButton.style.cursor = "pointer";
    downloadButton.style.backgroundColor = "rgba(0, 0, 0, .1)";

    downloadButton.addEventListener("click", () => {
        // クリックされたら、バックグラウンドスクリプトのダウンローダーへURLを転送する
        browser.runtime.sendMessage({
            documentTitle: document.title,
            url: downloadURL
        });
    });

    // 処理済みマーカー付与
    // 繰り返し処理をする際に、このボタンそのものが対象になってしまうことを防止する
    downloadButton.classList.add(className);

    return downloadButton;
}

// ダウンロード用ボタン設定処理
const addDownloadButtonToImage = (image) => {

    // すでに処理済み画像に関しては無視する
    // ダウンロードボタンそのものもこれで除外される
    if (image.classList.contains(className)) {
        return;
    }

    // 小さすぎる画像は広告リンクであることが多いので無視する
    if (image.width < widthThreshold && image.height < heightThreshold) {
        // skip
        return
    }

    // ダウンロード死体画像のURLを取得
    let downloadURL = image.src;
    console.log("download url: " + downloadURL);

    // 画像がデータURLの場合スキップする
    if (downloadURL.startsWith("data:")) {
        // skip
        return
    }

    // ダウンロード可能な画像にダウンロード用ボタンを付与していく
    let target = image;
    let targetParent = image.parentElement;

    // let originalWidth = image.offsetWidth;
    // let originalHeight = image.offsetHeight;

    // 画像に処理済みマーカー付与
    target.classList.add(className);

    // aタグで囲まれた画像対策 (例: <a><img/></a>)
    if (targetParent.tagName === "A") {
        // そのまま画像にダウンロードボタンを付けても、Aタグ側のクリック担ってしまうため、Aタグの上にダウンロードボタンをつけて、クリック可能にする
        target = targetParent;
        targetParent = targetParent.parentElement;

        // Aタグの参照先がより大きな画像(オリジナル画像であることが多い)である場合、ダウンロードURLをそちらに更新する
        let extension = target.href.split(".").pop();
        if (imgExtensions.indexOf(extension) >= 0 || imgExtensionsUpperCases.indexOf(extension) >= 0) {
            // image link
            downloadURL = target.href;
        }
    }

    // 外側divで、画像があったところに差し込む
    const outerContainer = document.createElement("div");
    target.replaceWith(outerContainer);

    // 内側divで、画像を格納する
    const innerContainer = document.createElement("div");
    innerContainer.appendChild(target);
    outerContainer.appendChild(innerContainer);

    // 外側divのスタイル設定
    outerContainer.style.display = "inline-block";
    // outerContainer.style.width = originalWidth + "px";
    // outerContainer.style.height = originalHeight + "px";

    // 内側divのスタイル設定
    innerContainer.style.display = "inline-block";
    innerContainer.style.position = "relative";
    // innerContainer.style.width = originalWidth + "px";
    // innerContainer.style.height = originalHeight + "px";

    // もし画像のサイズが0になっている場合、100%に更新
    if (innerContainer.querySelector("img:first-child").width == 0) {
        innerContainer.style.width = "100%";
    }

    //内側divにダウンロードボタン追加 (右上)
    const downloadButton1 = newDownloadButton(downloadURL);
    innerContainer.appendChild(downloadButton1);
    downloadButton1.style.right = 0;
    downloadButton1.style.top = 0;
    downloadButton1.style.fontSize = "unset";
    downloadButton1.style.zIndex = 1000;

    //内側divにダウンロードボタン追加 (右下)
    const downloadButton2 = newDownloadButton(downloadURL);
    innerContainer.appendChild(downloadButton2);
    downloadButton2.style.right = 0;
    downloadButton2.style.bottom = 0;
    downloadButton2.style.fontSize = "unset";
    downloadButton2.style.zIndex = 1000;
}

// 画像を検索して、ダウンロード用ボタン設定する処理
function exec() {

    const images = document.querySelectorAll(`img:not(.${className})`);
    for (const image of images) {
        if (image) {
            if (image.complete) {
                addDownloadButtonToImage(image);
            } else {
                if (image.getAttribute('load-event-listener-added') !== 'true') {
                    image.addEventListener('load', () => {
                        // LAZYダウンロード対策
                        addDownloadButtonToImage(image);
                    });
                    image.setAttribute('load-event-listener-added', 'true');
                }
            }
        }
    }
}

// LAZYダウンロードなどに対応するため、スクロールされるたびに再実行されるよう設定.
document.addEventListener("scroll", (event) => {
    exec();
});

// 初回実行
exec();

console.log("addon configured");
