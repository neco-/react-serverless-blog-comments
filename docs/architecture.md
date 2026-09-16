# アーキテクチャ

## 基本的な構成

- バックエンドの定義は AWS Amplify Gen2（`amplify/` 配下の TypeScript）です。
- フロントエンドは React 19 + TypeScript、ビルドは Vite です。
- Lambda は Node.js 22 + AWS SDK v3 です。

## 全体像

```
   ブログ（hugo など、別ホスティング）
        │  <script src=".../main.min.js">
        │  <div id="blogcomments">
        ▼
   ┌──────────────────────────────┐
   │ BlogComments ウィジェット (React)      │
   └──────────────┬───────────────┘
                  │
       ┌──────────┴───────────┐
       ▼                      ▼
  ┌─────────┐          ┌──────────────┐
  │ Cognito  │          │ AppSync        │
  │ User Pool│◀─ 認証 ──│ (GraphQL)      │
  │ ID Pool  │          └───┬────────┬───┘
  └─────────┘       読み取り │        │ 書き込み
                （直接リゾルバ）│        │（Lambda リゾルバ）
                            ▼        ▼
                     ┌──────────┐  ┌──────────────┐
                     │ DynamoDB  │  │ Lambda ×6      │
                     │ Comment   │◀─│ CreateComment  │
                     │ Votes     │  │ UpdateComment  │
                     └──────────┘  │ DeleteComment  │
                                   │ UpdateVotes    │
                                   │ DeleteVotes    │
                                   │ VotesByIds     │
                                   └──────────────┘
```

## 読み取りと書き込みの非対称

- **読み取り**は AppSync が DynamoDB を直接引きます（Lambda を通しません）。
  未ログインの閲覧者は ID プールのゲストロール（IAM）、ログイン済みはユーザープールで認可されます。
  自動生成される `get` / `list` は無効化し、インデックス経由のクエリだけを残しています。
- **票数だけは読み取りも Lambda 経由**です（`votesByIds`）。投票者の一覧を公開しないため、
  `Votes` の `upvoters` / `downvoters` は GraphQL に出さず、Lambda が票数と
  「自分が投票済みか」に畳んで返します。
- **書き込み**はすべて Lambda のカスタム mutation 経由です。自動生成の CRUD mutation は
  無効化してあります（`amplify/data/resource.ts` の `.disableOperations()`）。
  投稿者本人かどうかは Lambda が DynamoDB の `ConditionExpression` で検査します。
  クライアントから送られた userId は信用せず、AppSync が渡す `event.identity.username` を使います。

## ファイルの対応

| 役割 | 場所 |
| --- | --- |
| 認証（Cognito） | `amplify/auth/resource.ts` |
| データモデルと認可 | `amplify/data/resource.ts` |
| 購読のフィルタ（slug 単位） | `amplify/data/onCommentEvent.js` |
| Lambda 本体 | `amplify/functions/*/handler.mjs` |
| Lambda の定義（ランタイム等） | `amplify/functions/*/resource.ts` |
| スタックの組み立てと権限付与 | `amplify/backend.ts` |
| ウィジェットのエントリ | `src/index.tsx` |
| 表示の設定（ログインボタン等） | `src/config.ts` |
| Amplify SDK の隔離層 | `src/lib/authClient.ts`, `src/lib/apiClient.ts` |
| 見た目（すべて `#blogcomments` 配下） | `src/styles/blogcomments.css` |

## Amplify SDK の隔離

Amplify SDK を直接呼ぶのは `src/lib/authClient.ts`、`src/lib/apiClient.ts`、`src/index.tsx` だけです。
フックやコンポーネントは `useAuthClient()` / `useApiClient()` 越しに使い、テストでは
`src/test/fakes.ts` のフェイクを注入します。SDK のバージョンが上がったときに
影響範囲を 3 ファイルに閉じ込めるためです。

## 既存の認証基盤を使う場合

`amplify/auth/resource.ts` は環境変数が揃っていれば `referenceAuth` で既存の Cognito を参照し、
無ければ `defineAuth` で専用のプールを新規作成します。前者は、すでに会員制サイトを
運用していて、そのアカウントでコメントさせたい場合の構成です。
設定方法は [導入手順の手順6](setup.md#手順6-既存の-cognito-を参照する任意) を参照してください。

## デプロイの流れ

`amplify.yml` に定義してあります。

1. `npx ampx pipeline-deploy` でバックエンドをブランチ環境へデプロイし、`amplify_outputs.json` を生成
2. `npm test`（フロント + Lambda）
3. `npm run build` で `build/` に固定名の bundle を出力
4. `build/` を Amplify Hosting が配信

テストが落ちるとデプロイされません。
