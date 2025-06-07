console.log("addon loaded");

// 起動直後にバックグラウンドをウォームアップ
browser.runtime.sendMessage({ warmup: true }).catch(() => {});

// ブラウザ標準画像ビューアのCSSスタイルの削除
// https://unformedbuilding.com/articles/default-style-for-image-only-page-on-each-browsers/
const removeStyleSheets = [
  "resource://content-accessible/TopLevelImageDocument.css",
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
  "webp",
];

// 拡張子一覧の大文字版
const imgExtensionsUpperCases = imgExtensions.map(function (x) {
  return x.toUpperCase();
});

// 小さすぎる画像は広告リンクであることが多いので除外する. そのためのしきい値
const minWidth = 100;
const minHeight = 100;

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
      url: downloadURL,
    });
  });

  // 処理済みマーカー付与
  // 繰り返し処理をする際に、このボタンそのものが対象になってしまうことを防止する
  downloadButton.classList.add(className);

  return downloadButton;
};

// ダウンロード用ボタン設定処理
const addDownloadButtonToImage = (image) => {
  // すでに処理済み画像に関しては無視する
  // ダウンロードボタンそのものもこれで除外される
  if (image.classList.contains(className)) {
    return;
  }

  // 小さすぎる画像は広告リンクであることが多いので無視する
  if (image.width < minWidth && image.height < minHeight) {
    // skip
    return;
  }

  // ダウンロード死体画像のURLを取得
  let downloadURL = image.src;
  console.log("download url: " + downloadURL);

  // 画像がデータURLの場合スキップする
  if (downloadURL.startsWith("data:")) {
    // skip
    return;
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
    if (
      imgExtensions.indexOf(extension) >= 0 ||
      imgExtensionsUpperCases.indexOf(extension) >= 0
    ) {
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
};

function tryAttach(img) {
  // 成功したら true, 見送ったら false
  if (
    // ロード完了
    img.complete &&
    // 指定のサイズより大きい
    img.naturalWidth >= minWidth &&
    img.naturalHeight >= minHeight
  ) {
    addDownloadButtonToImage(img);
    return true;
  }
  return false;
}

// 要素とビューポート(or指定の要素)との"交差状態"をブラウザが監視し、非同期コールバックで通知
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return; // 交差状態

      const img = e.target;
      if (tryAttach(img)) {
        // 付与できたので監視終了
        io.unobserve(img);
      } else {
        // まだロード中なら load 完了後に再試行
        img.addEventListener(
          "load",
          () => {
            if (tryAttach(img)) {
              // 付与できたので監視終了
              io.unobserve(img);
            }
          },
          { once: true },
        );
      }
    });
  },
  {
    // ビューポートより300px外側に仮想的な境界線をつくり、そこに要素が入った瞬間(=実際に目に触れる手前)でcallbackが呼ばれる
    rootMargin: "300px",
  },
);

// 既に存在するimgを監視
document.querySelectorAll("img").forEach((img) => io.observe(img));

// MutationObserverでの監視で、imgが追加された場合に対応
new MutationObserver((records) => {
  // 変更レコード走査 (1回の発火で複数の変更がまとめて届く)
  for (const r of records) {
    // 属性変更などは除外し、子ノード追加/削除だけを通す
    if (r.type !== "childList") continue;

    // 追加分だけを見る (removedNodesは見ない)
    r.addedNodes.forEach((n) => {
      if (n.nodeType !== 1) return; // 要素ノード(1)以外は除外

      // imgタグなら監視追加
      // 直に追加されたimg監視
      if (n.tagName === "img") io.observe(n);

      // 子孫のimgも拾う
      n.querySelectorAll?.("img").forEach((i) => io.observe(i));
    });
  }
}).observe(document, { childList: true, subtree: true });

console.log("addon configured");
