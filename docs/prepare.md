# 事前準備

## 完了の定義

- AWS が利用可能である
- `aws` コマンドを実行できる
- Node.js 22 以上が入っている

## 前提知識

- AWS の基本（AWS コンソール, IAM）がわかる
- npm がわかる

## AWS アカウントと認証情報

- AWS アカウントを作成しておく
  - 参考: [AWS アカウント作成の流れ](https://aws.amazon.com/jp/register-flow/)
- IAM Identity Center またはIAM ユーザーで、開発用の認証情報を用意する
  - 参考: [IAM でのセキュリティのベストプラクティス](https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/best-practices.html)
  - 長期のアクセスキーより、IAM Identity Center による一時認証情報が推奨です

## AWS CLI をセットアップ

```sh
aws configure
# または IAM Identity Center を使う場合
aws configure sso
```

- 参考: [AWS CLI のインストール](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-install.html)
- 参考: [AWS CLI の設定](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/cli-chap-configure.html)

疎通確認:

```sh
aws sts get-caller-identity
```

## Node.js

Node.js 22 以上が必要です（Vite 8 と Amplify Gen2 CLI の要件）。

```sh
node -v   # v22 以上であること
```

## Amplify CLI について

CLI をグローバルに入れる必要はありません。リポジトリの devDependencies に
`@aws-amplify/backend-cli` が入っており、`npx ampx ...` で実行します。

次は [導入手順](setup.md) へ。
