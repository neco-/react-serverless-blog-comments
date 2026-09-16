# 代替手段

## react-serverless-blog-comments（このリポジトリ）

[react-serverless-blog-comments](https://github.com/neco-/react-serverless-blog-comments)

```diff
+ 100% Self-hosting on AWS
+ Amplify Gen2 で構築できる（npx ampx sandbox の一発）
+ Markdown が使える
+ 投票機能がある
+ 認証があるため、スパム対策になる
+ 自前の認証基盤(Cognito)を新規に作れる。既存の Cognito を参照することもできる
+ ソーシャルログインを追加できる(Google/LINE ほか)
+ 独自ドメイン運用への対応も簡単
- bundle が大きい（gzip 約 600KB）
- AWS の利用料と運用が自分持ち
```

## jamstack-cdk-comments

[JAMstack CDK comments](https://github.com/pawelgrzybek/jamstack-cdk-comments)

- 静的サイトを維持してデプロイするなら、お薦め

```diff
+ 100% Self-hosting on AWS
+ CDK で構築できる
+ hugo の良さを活かして、コメントが投稿されるとコメントを含めて静的ページとして再デプロイすることで実現
+ 誰でも書き込める利便性がある
- コメントが高頻度、あるいは溜まってくるとデプロイ負荷が高くなっていく
- 認証がないため、スパム対応が難しい
- 投票機能がない
```

## flamewars

[flamewars](https://github.com/michaelboyles/flamewars)

- Google 認証のみでよければ、お薦め

```diff
+ 100% Self-hosting on AWS
+ CloudFormation で構築できる
+ Markdown が使える
+ 認証があるため、スパム対策になる
+ 投票機能がある
- OAuth 認証が Google のみ
```

## giscus

[giscus](https://giscus.app/ja)

- GitHub とブログサイトのユーザーが同じ層なら、お薦め

```diff
+ GitHub Discussions をバックエンドに使ったコメントシステム
+ 機能性は高い
+ 自前でホスティングするものが無い
- 外部サービス依存
- OAuth 認証が GitHub のみ
GitHub Discussions をそのまま使ってもいい
```
