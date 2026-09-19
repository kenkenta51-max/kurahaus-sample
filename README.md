# KURAHAUS

自然素材の注文住宅サイトの静的HTMLプロトタイプです。これはポートフォリオ用の架空サイトであり、会社・スタッフ・お客様の声・施工事例・イベントはサンプルです。予約・資料請求・お問い合わせは送信されません。TOP、家づくり、施工事例、モデルハウス、スタッフ、お客様の声、来場予約、資料請求、お問い合わせ、会社情報、お知らせ、FAQ、プライバシーポリシー、サイトマップと各詳細ページを含みます。

## ローカルで確認

`index.html` を直接開くとルート相対リンクが動かないため、このフォルダをドキュメントルートにしたローカルWebサーバーで確認してください。例：`python -m http.server 8000` の後、`http://localhost:8000/` を開きます。

## 公開前に必要なこと

- `/reserve/`、`/document/`、`/contact/` は入力UI・HTML5検証までの仮フォームです。送信先APIなどを設定し、各JSの仮送信ハンドラーを置き換えてください。現状、送信は発生しません。
- `sitemap.xml` と `robots.txt` の `example.com`、新規ページの `og:image` の仮ドメインを正式な公開ドメインに変更し、canonical / `og:url` を設定してください。
- 会社の許認可番号と一部Footer情報、SNSの公開先を実情報で確認してください。イベント・施工事例・スタッフ・お客様の声のテキストは架空サイト用の仮内容です。
- 自社のプライバシーポリシーを法務・運用担当で確認してください。

## ポートフォリオ公開版

GitHub Pages の `/kurahaus-sample/` 配下で表示できるよう、`python3 scripts/build-pages.py` で `site-dist/` を生成します。公開版には全ページ共通のデモ表記を加え、架空の電話番号・汎用SNS・地図へのリンクを無効化します。`main` への push で `.github/workflows/pages.yml` がこの成果物を公開します。別名のリポジトリへ移す場合は `scripts/build-pages.py` と `scripts/preview-pages.py` の `BASE_PATH` を変更してください。

## 補助スクリプト

- `node scripts/audit-site.cjs`：ローカルHTMLの内部リンクと画像参照を検査します。
- `node scripts/generate-remaining.cjs`：残りページ作成時の静的テンプレートとサイトマップ生成。既存ページは上書きしません。
- `node scripts/normalize-shared.cjs`：共通Footerの連絡先と導線を揃える機械的な更新。再実行可能です。
