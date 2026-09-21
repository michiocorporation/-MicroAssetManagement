# MicroAsset Management Webサイト

地域の建設会社向け経営統合プラットフォームのコーポレートサイトです。
参考サイト https://res8.jp/ の深いネイビー、光のアクセント、広い余白を踏まえ、MAMの5色のロゴを中心に制作しています。

## ローカルで確認

Node.js が利用できる環境で、このフォルダーを開き、次を実行します。

```powershell
node preview.mjs
```

ブラウザで http://127.0.0.1:4173/ を開きます。
3DはJavaScriptモジュールのため、HTMLの直接ダブルクリックではなくHTTPサーバー経由で確認してください。
Three.js本体は public/vendor に同梱しています。外部CDNやビルド操作は不要です。

## 実装内容

- 提供されたサイト構成・会社メンバー情報を反映した1ページ構成
- 5つのロゴパーツが画面外から集まるオープニング（約2秒、スキップ可能）。見出し・ヘッダーは演出中も表示し、スクロールや操作を妨げません
- ヒーローとオープニングの英字コピーは「Five in One team」
- 本文の初回描画後に `hero-loader.js` がThree.jsを読み込みます。初回演出を待つ間はシンボルだけを最大1.5秒非表示にし、完成ロゴのちらつきを防止。読み込みが遅い場合や失敗時はSVGロゴを表示し、遅れてオープニングが始まることはありません
- 一画面に収まる中央配置の3Dヒーロー、ポインター反応、スクロールによる奥行き変化。レイアウト調整は hero.css
- オープニングは同じブラウザ・公開先で一度だけ再生（localStorageの `mam:intro-seen-v2` に記録）。再訪・再読み込み・セクションへの直接リンクでは省略。保存機能が使えない環境では再度再生される場合があります
- ヒーロー下部は中央のSCROLLと上下に動く矢印を表示。説明文・サービスリンク・REPLAYボタンは削除
- 添付の「日本企業Webサイト_読みやすいフォントルール」に準拠した文字設計。日本語はNoto Sans JP、英字ラベルはInter、太さは400 / 500 / 700。本文はPC 16px、スマートフォン15〜16px、行間1.8。濃紺の背景に合わせて明るい文字色を使用
- 書体・文字サイズ・行間・読みやすさのためのレスポンシブ調整は `typography.css` に集約。見出しはPC 32〜40px、スマートフォン24〜28px。ヒーロー主見出しはPC 48〜64px、スマートフォン36px
- フォントは使用文字を含むNoto Sans JPのサブセットとInter Latinの2つのWOFF2（計190,704バイト）をローカル配信。`fonts.css` は105,413バイトから372バイトに縮小。`font-display: swap` により、読み込み中もシステム書体で文章を表示します。外部フォント配信サービスへの通信はありません。SIL Open Font License同梱
- 動きを減らす設定・データ節約設定ではThree.jsの読み込み自体を省略し、SVGを表示
- WebGL非対応時・読み込み失敗時は元のロゴを表示
- 画面外・非表示タブではアニメーションを停止
- サービス詳細の開閉、各メンバーのプロフィールダイアログ。5名の経歴・担当領域は `index.html` の `details` に記載し、JavaScriptなしでも開いて読めます。JavaScriptは同じHTMLをダイアログに表示する補助処理のみを担当します
- 人材サービスの名称は「人材支援」に統一。英語氏名は「Yoshikazu Ito」、大学名は「慶應義塾大学」。鈴木氏の紹介は勤務先名・役職を省き、一級建築士としての経験とMAMでの役割を記載
- ヘッダー・フッターのナビゲーションに日本語を併記。最初の見出しはヒーローのh1とし、主要セクションはh2で構成
- マウス操作時は三角形のカスタムカーソルと追従リングを表示。リンク・ボタン上では矢印付きのリングに変化。入力欄・プロフィールダイアログは標準カーソルを使用。タッチ操作では表示せず、動きを減らす設定では追従の遅延を無効化。実装は `cursor.css` と `cursor.js`
- スマートフォン用メニュー、キーボード操作、ネイティブフォーム検証

## シェアカード（OGP）

公開URL： https://michiocorporation.github.io/-MicroAssetManagement/

`index.html` のheadに、LINE等で利用されるOpen GraphタグとX向けのカード情報を静的に記載しています。JavaScriptの実行を必要としません。
共有画像は `public/og-image.png`（1200 × 630px、白背景のカラーロゴ）です。正方形に切り取られる場合も考慮し、ロゴを中央に配置しています。画像URL・ページURLは公開先の絶対URLで指定しています。

GitHub Pagesには `index.html` と画像ファイルを一緒に反映してください。既に共有されたURLのプレビューはLINE等でキャッシュされ、更新直後は古い表示が残ることがあります。ローカルプレビューは外部の共有サービスから取得できません。

画像の再生成（PowerShell）： `.\scripts\render-share-card.ps1`

参考：[LINE DevelopersのURLプレビュー仕様](https://developers.line.biz/ja/faq/) / [Open Graph protocol](https://ogp.me/)

## お問い合わせの表示について

ユーザーの指定により、お問い合わせセクションと全ての問い合わせリンクは hidden 属性で非表示にしています。フォームの既存コードは再表示に備えて保持しています。
`site-config.js` の `contactEmail` に実際の受信先を設定すると、確認画面に「メールアプリで送信する」が表示されます。
メールアプリが開いた後の送信操作は利用者が行います。送信API・メール配送サーバーは未接続です。
所在地・設立・資本金は未提供のため掲載していません。支援事例は今後追加予定と明示しています。

ヘッダー・フッターは、ご提供の透過SVG `public/HP_logo.svg`（15,872バイト）を使用。マーク・文字ともCSSで白一色に表示しています。正方形ロゴとファビコンは `public/HP_logo_square.svg`。会社概要はロゴを掲載せず、見出し・情報を中央寄せにしています。OGP画像は共有サービスに対応するPNGを維持しています。
Three.js 0.180.0 のライセンスは public/vendor/THREE-LICENSE.txt に同梱しています。

## 文章を更新した際のフォント再生成

使用文字のサブセットは、プロフィールを含む `index.html` とUIメッセージを含む `script.js` から作っています。新しい日本語文字を追加した場合は再生成してください（未収録文字もシステム書体で表示されます）。

1. [公式Noto Sans JP原本](https://github.com/google/fonts/tree/main/ofl/notosansjp)の可変TTFを、`public` 以外の作業フォルダーに保存します。
2. Pythonに `fonttools` と `brotli` をインストールします。
3. `python scripts/optimize-fonts.py 原本TTFのパス` を実行します。本文・使用文字を外部に送信せず、端末内で処理します。
4. `public/fonts/fonts.css`、新しい `noto-site-*.woff2`、`SOURCE.txt` を一緒に公開します。CSSのバージョンも更新してください。

元の分割フォントは旧ページのキャッシュに備えて保持していますが、現在のCSSは2ファイルだけを参照します。`scripts/vendor-fonts.mjs` は全言語版を取得する旧スクリプトのため、通常の文言更新では使用しません。

## GitHub Pagesへ反映するファイル

`index.html` が置かれる階層を変えずに、次のファイルをまとめて更新してください。

- `index.html`、`script.js`、`hero-loader.js`（新規）、`hero-3d.js`、`hero.css`、`typography.css`
- `public/HP_logo.svg`、`public/HP_logo_square.svg`
- `public/fonts/fonts.css`、`public/fonts/noto-site-7aabe9f01336.woff2`、`public/fonts/font-007.woff2`、`public/fonts/SOURCE.txt`、同フォルダーの2つのOFLライセンス
- 再生成用の `scripts/optimize-fonts.py` と、この `README.md`

既存の `style.css`、`cursor.css`、`cursor.js`、`site-config.js`、`public/vendor/`、`public/og-image.png` も必要です。特にカスタムカーソル用の2ファイルを落とさないでください。公開にはGitHubリポジトリへの反映が必要で、ローカルプレビューの更新だけでは公開サイトは変わりません。


