# セキュリティ

## 脆弱性の報告

**公開の Issue や Pull Request には書かないでください。**

GitHub の [Security](https://github.com/neco-/react-serverless-blog-comments/security) タブから
「Report a vulnerability」（非公開の脆弱性報告）で連絡してください。

連絡には次を含めてください。

- 何が起きるか（影響）
- 再現手順、または該当するコードの場所
- 影響を受けるバージョン（コミット）

個人が趣味で運用しているリポジトリのため、対応の速さは約束できません。
受け取った旨の返事はできるだけ早く返します。

## 対象の範囲

このリポジトリのコード（フロントエンド、`amplify/` のバックエンド定義、Lambda）が対象です。

利用者それぞれの AWS アカウントに作られたリソースの設定ミスは、その運用者の責任範囲です。
ただし、**このリポジトリの既定値が安全でない**場合は、脆弱性として報告してください。

## 設計上、気をつけている点

改変するときは、ここを壊していないか確認してください。

- **コメント本文は `rehype-sanitize` を通してから描画します。** 他人が書いた Markdown を
  そのまま出す場所です（`src/components/viewer/Comment.sanitize.test.tsx`）。
- **書き込みはすべて Lambda 経由のカスタム mutation です。** 自動生成の CRUD mutation は
  無効化してあります。所有者かどうかは Lambda が DynamoDB の `ConditionExpression` で検査し、
  クライアントから送られた userId は信用せず AppSync の `event.identity.username` を使います。
- **投票者の一覧は公開していません。** `Votes` の `upvoters` / `downvoters` は GraphQL に出さず、
  `votesByIds`（Lambda）が票数と「自分が投票済みか」だけを返します。
- **Lambda は受信イベントを丸ごとログに出しません。** `event.identity` の claims に
  メールアドレスなどが含まれるためです。
- **入力の長さと文字種はサーバー側で検査します**（`amplify/functions/shared/validate.mjs`）。

## 既知の制限

脆弱性ではありませんが、運用で気をつける点です。詳しくは [細かい仕様](docs/hint.md) を参照してください。

- 投稿のレート制限がありません。必要なら AppSync の WAF などで制御してください。
