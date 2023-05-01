# わかる人向けの簡単な説明

## 結局やりたいこと

1. amplifyでバックエンドを作成
    - Cognito(認証)
      - UserPool（自前アカウント）
      - OAuth（ソーシャルログイン）
    - DynamoDB(ストレージ)
      - Comment
      - Votes
    - functions(API)
      - CreateComment（投稿）
      - UpdateComment（編集）
      - DeleteComment（削除）
      - UpdateVotes（投票）
      - DeleteVotes（投票削除）
2. amplifyで作成したbackendを使うbundleを生成
    - build/static/js/main.\*.js
    - build/static/js/main.\*.css
3. このBundleをブログやWebサイトに組み込めば、コメント機能が実現できる

以上
