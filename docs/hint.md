# 細かい仕様

## ページの区別（slug）

- ブログページの区別は slug 単位です。slug は URL の末尾のパスです。
  - `/aaa/hoge/` と `/bbb/hoge/` はどちらも `hoge` になり、同じコメントを共有します。
    区別したい場合は `src/hooks/useSlug.tsx` の `getSlugFromPathname()` を変更してください。
  - URL が変わらない SPA 構造のブログは想定していません。
    全ページ共通のコメント欄として使うことはできます。

## 投稿の扱い

- コメントの削除は確認ダイアログなしで即時実行されます。
- 削除は内容だけを消します（`deletedAt` を立て、本文と表示名を伏せます）。
  返信の階層構造を保つための仕様です。消した内容は復活できません。
- 返信は 3 階層（depth 0〜2）まで画面に出ます。
- 投票の結果は押した本人の画面にはすぐ反映されます。他の人の投票が見えるのは次に開いたときです
  （投票のリアルタイム更新はしていません）。
- 投票者の一覧は公開していません。`Votes` の `upvoters` / `downvoters` は DynamoDB には
  ありますが GraphQL には出さず、`votesByIds`（Lambda）が票数と「自分が投票済みか」だけを
  返します。誰が何に投票したかは外から引けません。
- 投稿時の名前と書きかけのコメントはブラウザの localStorage に保存されます。
  キャッシュをクリアすると消えます。
- ログイン要求はスパム対策のためです。表示名は自由に変更できます。

## 本文のサニタイズ

- コメント本文の Markdown は `rehype-sanitize` を通してから描画します
  （`src/components/viewer/Comment.tsx`、編集中のプレビューは `src/components/editor/RowEditor.tsx`）。
  `iframe` / `object` / `form` / `style` / `base` などの生 HTML は落とされます。
- `src/components/viewer/Comment.sanitize.test.tsx` が本物のレンダラでこれを検証しています。
  **Markdown の描画まわりを変更したら、このテストが通ることを必ず確認してください。**
  もう一方の `Comment.test.tsx` はプレビューをモックしているため、ここの退行を検知できません。
- Markdown 機能を外す場合は、サニタイズも一緒に外れることに注意してください。

## 入力の制限

投稿できる長さの上限です（`amplify/functions/shared/validate.mjs`）。
超えると Lambda が弾き、DynamoDB には書きません。

| 項目 | 上限 |
| --- | --- |
| slug | 256 文字 |
| displayName | 50 文字 |
| content | 10,000 文字 |
| siteurl | 2,048 文字 |

- 文字数はコードポイントで数えます（絵文字を 2 文字と数えません）。
- 制御文字は弾きます。改行とタブを許すのは本文だけです。
- 返信先（`replyTo`）は、存在するか・削除済みでないか・同じページか・深さが 2 以内かを
  サーバー側で確認します。画面の表示だけでなく API も同じ制限で止まります。

## ログ

- Lambda は受信イベントを丸ごと出しません（`event.identity` の claims に
  メールアドレスなどが含まれるため）。出すのは操作名と id / slug だけで、
  値は検証後、かつ `JSON.stringify` で包みます。
- CloudWatch のロググループは 3 年で失効します（`amplify/functions/*/resource.ts` の
  `logging: { retention: '3 years' }`）。既定は無期限で、消さない限り溜まり続けます。

## 既知の制限

実運用で問題になりうる点です。改善する場合の入口として挙げておきます。

- **投稿のレート制限がありません。** 1 人が短時間に大量投稿するのを止める仕組みは
  入っていません。必要なら AppSync の WAF か Cognito のグループで制御してください。
- **コメントの取得は 1 ページ 100 件・最大 20 ページです**（`src/hooks/useComments.tsx`）。
  トップレベルのコメントを `filter` で絞っていますが、DynamoDB のフィルタはページを
  読んだ後に効くため、`nextToken` を最後までたどっています。2,000 件を超える記事では
  上限に達して打ち切られます。返信を含まない専用のインデックスを足すのが本筋です。
- 初期表示に Markdown エディタまで含まれます。閲覧するだけの人には不要なので、
  `src/components/editor/Editor.tsx` を `React.lazy` で分割すると軽くなります。

## OAuth（ソーシャルログイン）

- 本番運用には各サービスの承認フローが必要です。ガイドラインに従ってください。
  手間は Google < LINE の順に大きい印象です。審査には独自ドメインがほぼ必須です。
- ログイン後は元の記事ページに戻りますが、**Cognito のコールバック URL に登録した
  戻り先ページでも bundle を読み込む必要があります**。詳しくは
  [hugoへの組み込み例](hugo.md#oauth-の戻り先ページ) を参照してください。
- 新規アカウント作成は Hosted UI から行えます。

## 機能変更へのヒント

- Lambda の `return` に入っている `headers: { "Access-Control-Allow-Origin": ... }` は
  AppSync の Lambda リゾルバでは使われません（API Gateway の統合レスポンス用の書き方の名残です）。
  CORS を制御したい場合は AppSync 側か、配信元の Amplify Hosting のヘッダーで行ってください。
- OAuth は Apple や Amazon にも対応できます（`defineAuth` の `externalProviders`）。
- 投票は少し直せば Up/Down の両対応にできます。DynamoDB 側は既に両方を持っています。
- 投稿をメールで通知したいときは、DynamoDB Streams か CloudWatch アラームから SNS を
  呼ぶのが簡単です。このリポジトリの定義には含めていません。
- 初期表示を軽くしたい場合は、エディタ（`src/components/editor/Editor.tsx`）を
  `React.lazy` で分割すると、閲覧するだけの人が Markdown エディタを読み込まずに済みます。
