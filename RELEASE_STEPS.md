# 最新バージョンリリースの手引

1. ソースコードに変更を加える
1. `./addon/manifest.json` のバージョンをインクリメントする
1. `./script/build.sh` を実行する
1. Mozilla アドオン開発者センターの『自分のアドオン』にアクセスする  
   <https://addons.mozilla.org/ja/developers/addons>
1. 『Quick Download Images 』にアクセス
1. 『新バージョンをアップロード 』にアクセス
1. ビルドした`.xpi`ファイルをアップロード
1. 署名が完了されるまで待つことになる
1. 『Quick Download Images 』のページの『すべて表示』にアクセス
1. アップロードした最新バージョンのステータスが『審査待ち』→『承認済み』になるまで待つ
1. 承認済みになった最新バージョンのページにアクセスする
1. 『ファイル』のところにある署名付き`.xpi`ファイルをダウンロードする
    * 右クリックからの『別名でリンク先を保存...』する
    * 通常クリックだとFirefoxへのインストールが始まるため
1. manifest.jsonの更新をコミットしpushする
1. そのコミットにそのバージョン相当のタグを付ける
    * `x.y.z`の形
    * 冒頭`v`は不要
1. タグをoriginにpushする
1. GitHubのReleasesにアクセスする  
   <https://github.com/aazw/firefox-addon-quick-download-images/releases>
1. 『Draft a new release』にアクセスする
1. 『Choose a tag』で先程pushしたタグを選択する
1. 『Generate release notes』でリリースノートを生成する
1. 先ほどダウンロードした署名付き`.xpi`ファイルをアップロードする
1. 『Publish release』する
