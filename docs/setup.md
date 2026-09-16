# 導入手順

Amplify Gen2 でバックエンドを構築し、ブログに組み込むまでの手順です。

## 完了の定義

- 自分の AWS アカウントにバックエンド（Cognito / AppSync / DynamoDB / Lambda）が構築できる
- ウィジェットの bundle をビルドできる（`build/static/js/main.min.js` が生成される）
- ブログから読み込める場所に配置できる

## 事前準備

- [事前準備](prepare.md) を先に済ませてください。
- 前提知識: AWS の基本（IAM, Cognito, AppSync, DynamoDB, Lambda）、npm、git

## 手順1. clone して依存を入れる

```sh
git clone https://github.com/neco-/react-serverless-blog-comments
cd react-serverless-blog-comments
npm ci
```

Node.js は 22 以上が必要です（Vite と Amplify Gen2 CLI の要件）。

## 手順2. バックエンドを作る

```sh
npx ampx sandbox
```

これだけで、`amplify/` の定義どおりに以下が自分の AWS アカウントへ作られます。

| 定義 | 作られるもの |
| --- | --- |
| `amplify/auth/resource.ts` | Cognito ユーザープール / ID プール |
| `amplify/data/resource.ts` | AppSync API、DynamoDB の `Comment` / `Votes` テーブル |
| `amplify/functions/*/resource.ts` | Lambda 6 本（投稿 / 編集 / 削除 / 投票 / 投票取り消し / 票数取得） |

完了すると `amplify_outputs.json` が生成されます。フロントエンドはこれを読んで接続先を決めます
（`.gitignore` 済み。リポジトリには入れません）。

`npx ampx sandbox` は起動したままファイルの変更を監視します。終了は Ctrl+C、
作った環境を消すときは `npx ampx sandbox delete` です。

> 既定ではこのプロジェクト専用の Cognito を新しく作り、メールアドレスでのサインアップ／
> サインインだけを有効にします。すでに持っている Cognito を使いたい場合は
> [手順6](#手順6-既存の-cognito-を参照する任意) を参照してください。

## 手順3. ビルド確認

```sh
npm test
npm run build
```

`build/static/js/main.min.js` と `build/static/css/main.min.css` が生成されます。
ローカルで動かすなら `npm start`（http://localhost:3000）です。

`amplify_outputs.json` が無い状態でビルドだけ試したいときは、雛形を置いてください。

```sh
cp amplify_outputs.example.json amplify_outputs.json
```

## 手順4. 本番デプロイ（Amplify Hosting）

1. AWS Amplify コンソールで「アプリケーションをデプロイ」からリポジトリを接続します。
2. ビルド設定はリポジトリの `amplify.yml` がそのまま使われます。
   バックエンドのデプロイ（`npx ampx pipeline-deploy`）とフロントエンドのビルドが順に走り、
   `npm test` が落ちるとデプロイされません。
3. ブランチごとに独立した環境ができます。検証用ブランチで確かめてから本番ブランチへ入れてください。

デプロイ先は `https://<ブランチ名>.<アプリID>.amplifyapp.com` です。
独自ドメインを使う場合は Amplify コンソールの「ドメイン管理」で設定します。
ソーシャルログインの審査には独自ドメインが要ることが多いので、先に用意しておくと楽です。

### キャッシュの設定

リポジトリの `customHttp.yml` に入っており、ビルド時に Amplify Hosting が取り込みます。
追加の操作は要りません。

Amplify の既定は `public, max-age=0, s-maxage=31536000` です。CloudFront には 1 年載りますが、
**ブラウザは記事を開くたびに 304 の往復を払います**。`main.min.js` は 1.8MB（brotli で約 500KB）
あるため、この再検証がスクリプト実行の前に挟まって体感が悪くなります。

ブログ側が固定 URL を読み込む設計なので、エントリの名前は変えられません。代わりに
`stale-while-revalidate` を付け、期限を過ぎてもキャッシュから即座に返し、更新は裏で取りに行かせます。

| 対象 | Cache-Control |
| --- | --- |
| `main.min.js` / `main.min.css`（固定名） | `public, max-age=600, stale-while-revalidate=86400, s-maxage=31536000` |
| ハッシュ付きのチャンクと画像 | `public, max-age=31536000, immutable` |
| `index.html` | `public, max-age=0, must-revalidate` |

> ⚠️ `customHttp.yml` があると、**Amplify コンソールで設定したカスタムヘッダーは使われなくなります。**
> コンソール側で足していた設定があれば、このファイルへ書き写してください。
> 埋め込みは `crossorigin="anonymous"` で読み込むため、CORS ヘッダーも同ファイルに明記してあります。

## 手順5. ソーシャルログインを足す（任意）

既定では自前のメールアドレス認証だけが有効です。Google などを足すには、
シークレットを登録してから `amplify/auth/resource.ts` の `createOwnUserPool()` に
`externalProviders` を足します。

```sh
npx ampx sandbox secret set GOOGLE_CLIENT_ID
npx ampx sandbox secret set GOOGLE_CLIENT_SECRET
```

```ts
import { defineAuth, secret } from '@aws-amplify/backend'

defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret('GOOGLE_CLIENT_ID'),
        clientSecret: secret('GOOGLE_CLIENT_SECRET'),
        scopes: ['email', 'openid', 'profile'],
      },
      // LINE は OIDC プロバイダとして追加します
      // oidc: [{ name: 'LINE', clientId: secret('LINE_CLIENT_ID'), ... }],
      callbackUrls: ['http://localhost:3000/', 'https://example.com/'],
      logoutUrls: ['http://localhost:3000/', 'https://example.com/'],
    },
  },
})
```

- 各プロバイダ側（Google Cloud Console など）で OAuth クライアントを作り、
  Cognito の Hosted UI ドメインをリダイレクト先に登録する作業も必要です。
- どのボタンを画面に出すかは `src/config.ts` で切り替えます（[config設定](config.md)）。
- 本番運用には各サービスの審査が要ります。手間は Google < LINE の順に大きい印象です。

## 手順6. 既存の Cognito を参照する（任意）

すでに運用しているユーザープールにコメントを紐付けたい場合は、新しく作らずに参照できます。
次の 5 つの環境変数をすべて設定してください。

| 環境変数 | 値 |
| --- | --- |
| `BLOGCOMMENTS_USER_POOL_ID` | ユーザープール ID |
| `BLOGCOMMENTS_USER_POOL_CLIENT_ID` | アプリクライアント ID |
| `BLOGCOMMENTS_IDENTITY_POOL_ID` | ID プール ID |
| `BLOGCOMMENTS_AUTH_ROLE_ARN` | 認証済みロールの ARN |
| `BLOGCOMMENTS_UNAUTH_ROLE_ARN` | 未認証ロールの ARN |

- ローカルなら shell の環境変数、Amplify Hosting ならコンソールの
  「環境変数」でブランチごとに設定します。
- **値はリポジトリに書かないでください。** 公開リポジトリに実環境の識別子を残さないための構成です。
- 5 つのうち一部だけ設定するとエラーで止まります。書き忘れに気づかないまま
  別のプールが新規作成され、「ログインできるのにコメントが消えた」ように見えるのを避けるためです。

## 手順7. ブログへ組み込む

[hugoへの組み込み例](hugo.md) を参照してください。

## 環境の解体

```sh
npx ampx sandbox delete
```

Amplify Hosting で作った環境は、コンソールからアプリごと削除します。
DynamoDB のテーブルが残る場合があるので、コメントを残したくないときは確認してください。
