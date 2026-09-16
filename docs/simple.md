# わかる人向けの簡単な説明

## 結局やりたいこと

1. Amplify Gen2 でバックエンドを作る（`npx ampx sandbox` の一発）
    - Cognito（認証）
      - ユーザープール（メールアドレスでの自前アカウント）
      - 外部プロバイダ（ソーシャルログイン、任意）
      - ID プール（未ログインの閲覧者に読み取り権限を与えるため）
    - DynamoDB（ストレージ）
      - `Comment`
      - `Votes`
    - AppSync（GraphQL API）
      - コメントの読み取りは DynamoDB 直結
      - 票数の読み取りと書き込みは下の Lambda 経由のカスタム operation のみ
    - Lambda（6 本）
      - `CreateComment`（投稿）
      - `UpdateComment`（編集）
      - `DeleteComment`（削除）
      - `UpdateVotes`（投票）
      - `DeleteVotes`（投票取り消し）
      - `VotesByIds`（票数の取得。投票者の一覧は返さない）
2. そのバックエンドに繋がる bundle をビルドする
    - `build/static/js/main.min.js`
    - `build/static/css/main.min.css`
3. この bundle をブログや Web サイトに読み込ませ、`<div id="blogcomments"></div>` を置く

以上

## 最短手順

```sh
git clone https://github.com/neco-/react-serverless-blog-comments
cd react-serverless-blog-comments
npm ci
npx ampx sandbox     # 自分の AWS にバックエンド一式が立ち、amplify_outputs.json が出る
npm run build        # build/static/js/main.min.js
```

本番は Amplify Hosting にリポジトリを繋ぐだけです（`amplify.yml` がそのまま使われます）。

詳細は [導入手順](setup.md)、組み込みは [hugoへの組み込み例](hugo.md)、
構成は [アーキテクチャ](architecture.md) を参照してください。
