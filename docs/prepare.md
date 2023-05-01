# 事前準備

## 完了の定義

- AWSが利用可能である
- awscliコマンドを実行できる
- amplifyコマンドを実行できる

## 前提知識

- AWSのサービス（AWSコンソール, IAM, Amplify）がわかる
- aws/amplify CLIが使える
- npmがわかる

## AWSアカウントを作成

- AWSアカウントを作成しておく
  - 参考: [AWS アカウント作成の流れ](https://aws.amazon.com/jp/register-flow/)
- IAMユーザーを作成しておく
  - 参考: [AWS アカウント での IAM ユーザーの作成](https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/id_users_create.html)
- IAMユーザーのアクセスキーを作成する
  - 参考: [アクセスキーを作成するには](https://docs.aws.amazon.com/ja_jp/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey)

## AWS CLIをセットアップ

- awscliコマンドをインストール
  - 参考: [インストール/更新](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-install.html).

- awscliコマンドを設定
  - 参考: [AWS CLI 高速セットアップ](https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/getting-started-quickstart.html).
  - 上記のIAMユーザーで作成したアクセスキーを指定する
  ```sh
  $ aws configure
  ```

- 手動でプロファイルを編集するとき
  ```sh
  $ vim ~/.aws/config
  $ vim ~/.aws/credentials
  ```

## amplify CLIをセットアップ

- インストール
  - 参考: [Install the Amplify CLI](https://docs.amplify.aws/cli/start/install/#install-the-amplify-cli)
  ```sh
  $ npm install -g @aws-amplify/cli
  ```

- 設定
  ```sh
  $ amplify configure
  ```
