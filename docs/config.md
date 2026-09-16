# config設定

`src/config.ts` が設定ファイルです。修正後は `npm run build` で bundle を更新してください
（Amplify Hosting では push 時に自動ビルドされます）。

## ログインボタンの表示/非表示

`true` または `false` を指定します。

```ts
export const ENABLED_OAUTH_ORIGINAL = true
export const ENABLED_OAUTH_GOOGLE = true
export const ENABLED_OAUTH_LINE = true
export const ENABLED_OAUTH_GITHUB = false
```

| 定数 | ボタン |
| --- | --- |
| `ENABLED_OAUTH_ORIGINAL` | このプロジェクトの Cognito ユーザープール（メールアドレスとパスワード） |
| `ENABLED_OAUTH_GOOGLE` | Google |
| `ENABLED_OAUTH_LINE` | LINE |
| `ENABLED_OAUTH_GITHUB` | 未実装（押しても何も起きない見た目だけのもの）。既定は `false` です |

例）自前のログイン機能のみ:

```ts
export const ENABLED_OAUTH_ORIGINAL = true
export const ENABLED_OAUTH_GOOGLE = false
export const ENABLED_OAUTH_LINE = false
export const ENABLED_OAUTH_GITHUB = false
```

- ボタンを表示しても、バックエンド側でそのプロバイダを有効にしていなければログインはできません。
  プロバイダの追加手順は [導入手順の手順5](setup.md#手順5-ソーシャルログインを足す任意) を参照してください。

## クレジット表記

コメント欄の見出しの右に、任意のリンクを 1 つ出せます。**両方を埋めたときだけ**表示され、
既定（空文字）では何も出ません。

```ts
export const POWERED_BY_LABEL = "Powered by example"
export const POWERED_BY_URL = "https://example.com"
```

## 自前ログインのボタン画像

`ENABLED_OAUTH_ORIGINAL` のボタンには `public/favicon-32x32.png` がそのまま出ます。
このリポジトリの `public/` にはライブDEMOのサイトのアイコンが入っているので、
**自分で運用する場合は `public/` のアイコン類を差し替えてください。**

## OAuth のドメインについて

Cognito の Hosted UI ドメインは `amplify_outputs.json` に含まれるため、アプリ側では指定しません。
