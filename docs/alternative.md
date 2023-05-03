# 代替手段

## react-serverless-blog-comments（このサイト）

[react-serverless-blog-comments](https://github.com/neco-/react-serverless-blog-comments)

```diff
+ 100% Self-hosting on AWS
+ amplifyで構築できる
+ Markdownが使える
+ 投票機能がある
+ 認証があるため、スパム対策になる
+ 自前の認証基盤(Cognito)が使える
+ OAuth認証はFacebook/Google/LINEで用意(Apple/AWS/GitHubも対応できる)
+ 独自ドメイン運用への対応も簡単
- amplifyを使いこなしていないと利便性が分からない
```

## jamstack-cdk-comments

[JAMstack CDK comments](https://github.com/pawelgrzybek/jamstack-cdk-comments)

- 静的サイトを維持してデプロイするなら、お薦め

```diff
+ 100% Self-hosting on AWS
+ CDKで構築できる
+ hugoの良さを活かして、コメントが投稿されるとコメントを含めて静的ページとして再デプロイすることで実現
+ 誰でも書き込める利便性がある
- コメントが高頻度、あるいは溜まってくるとデプロイ負荷が高くなっていく
- 認証がないため、スパム対応が難しい
- 投票機能がない
```

## flamewars

[flamewars](https://github.com/michaelboyles/flamewars)

- Google認証のみでよければ、お薦め

```diff
+ 100% Self-hosting on AWS
+ CloudFormationで構築できる
+ Markdownが使える
+ 認証があるため、スパム対策になる
+ 投票機能がある
- OAuth認証がGoogleのみ
```

## giscus

[giscus](https://giscus.app/ja)

- GitHubとブログサイトのユーザーが同じ層なら、お薦め

```diff
+ GitHub Discussionsをバックエンドに使ったコメントシステム
+ 機能性は高い
- 外部サービス依存
- OAuth認証がGitHubのみ
GitHub Discussionsをそのまま使ってもいい
```
