# config設定

- src/config.tsが設定ファイルになっています。

## ログインボタンの表示/非表示

- src/config.tsでログインボタンの表示非表示を切り替えることができます。
  - 修正後は`npm run build`でbundleを更新してください(Amplify Hostingではpush時に自動ビルド)。
  - `true`または`false`を指定します。
    ```js
    export const ENABLED_OAUTH_ORIGINAL = true
    export const ENABLED_OAUTH_GOOGLE = true
    export const ENABLED_OAUTH_FACEBOOK = false
    export const ENABLED_OAUTH_LINE = true
    export const ENABLED_OAUTH_GITHUB = false
    ```
  - `ENABLED_OAUTH_GITHUB` は未実装のボタン（押しても何も起きない見た目だけのもの）で、既定は `false` です。
  - 例)自前のログイン機能のみ
    ```js
    export const ENABLED_OAUTH_ORIGINAL = true
    export const ENABLED_OAUTH_GOOGLE = false
    export const ENABLED_OAUTH_FACEBOOK = false
    export const ENABLED_OAUTH_LINE = false
    export const ENABLED_OAUTH_GITHUB = false
    ```

- ボタンを表示しても、バックエンド側でそのプロバイダを有効にしていなければログインはできません。
  プロバイダの追加手順は [導入手順の手順5](setup.md#手順5-ソーシャルログインを足す任意) を参照してください。

## OAuth のドメインについて

- Cognito の Hosted UI ドメインは `amplify_outputs.json` に含まれるため、アプリ側では指定しません。
  旧 Gen1 版にあった `OAUTH_DOMAIN` の設定は不要になりました。
