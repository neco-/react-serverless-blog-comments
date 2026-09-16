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

## サイト固有の表示（クレジット表記・サイト名）

サイトの名前や URL は `src/config.ts` に書かず、ビルド時の環境変数で差し込みます。
どれも未設定なら何も出ません（サイト固有の文言が入らない一般的な表示になります）。

| 環境変数 | 値 | 使われる場所 |
| --- | --- | --- |
| `VITE_POWERED_BY_LABEL` | クレジットの文言（例: `Powered by example`） | コメント欄の見出しの右。**URL とそろって初めて**表示 |
| `VITE_POWERED_BY_URL` | クレジットのリンク先（例: `https://example.com`） | 同上 |
| `VITE_SITE_NAME` | サイト名（例: `example`） | 自前ログインのダイアログの見出し「Sign in example」と、アカウント作成の文言 |
| `VITE_SIGNUP_URL` | アカウント作成ページ（例: `https://example.com/signup`） | 自前ログインのダイアログの「You can create … account.」リンク。未設定ならリンクなし |

- ローカルなら shell の環境変数、Amplify Hosting ならコンソールの「環境変数」で
  ブランチごとに設定します。`.env.local` に書く方法もあります（`.gitignore` 済み）。
- リポジトリに直接書かないのは、公開用のコピーを作ったときに一緒に載ってしまうからです。
  自分のリポジトリだけで使うなら、`src/config.ts` の `?? ""` の側を書き換えても構いません。

```sh
VITE_POWERED_BY_LABEL="Powered by example" VITE_POWERED_BY_URL="https://example.com" \
VITE_SITE_NAME="example" VITE_SIGNUP_URL="https://example.com/signup" npm run build
```

## 自前ログインのボタン画像

`ENABLED_OAUTH_ORIGINAL` のボタンには `public/favicon-32x32.png` がそのまま出ます。
このリポジトリの `public/` にはライブDEMOのサイトのアイコンが入っているので、
**自分で運用する場合は `public/` のアイコン類を差し替えてください。**

## OAuth のドメインについて

Cognito の Hosted UI ドメインは `amplify_outputs.json` に含まれるため、アプリ側では指定しません。
