# Contributing

Issue と Pull Request を歓迎します。個人が趣味で運用しているリポジトリなので、
返事に時間がかかることがあります。

## はじめに

- 大きめの変更は、先に Issue で相談してもらえると手戻りが減ります。
- バグ報告には、再現手順・期待した結果・実際の結果・ブラウザを書いてください。
- **脆弱性は公開の Issue に書かないでください。** [SECURITY.md](SECURITY.md) を参照してください。

## 開発環境

Node.js 22 以上が必要です。

```sh
npm ci
npm test              # フロント（Vitest + jsdom）と Lambda（Vitest + node）
npm start             # 開発サーバー（http://localhost:3000）
npm run build         # tsc で型検査してから build/ へ
```

バックエンドまで動かす場合は、自分の AWS アカウントに `npx ampx sandbox` で一式を作ります
（[導入手順](docs/setup.md)）。フロントだけ触るなら
`cp amplify_outputs.example.json amplify_outputs.json` で雛形を置けばビルドは通ります。

## 変更を出す前に

- `npm test` と `npm run build` が通ること。テストは Amplify Hosting のビルドでも走り、
  落ちるとデプロイされません。
- 振る舞いを変える変更には、テストを足してください。

## 守ってほしい構成上の約束

- **Amplify SDK を直接 import してよいのは `src/lib/authClient.ts`, `src/lib/apiClient.ts`,
  `src/index.tsx` だけです。** ほかは `useAuthClient()` / `useApiClient()` を使い、
  テストでは `src/test/fakes.ts` のフェイクを注入します。SDK の更新で壊れる範囲を狭く保つためです。
- **コメント本文のサニタイズを外さないでください。** 他人が書いた Markdown をそのまま描画する場所です。
  描画まわりを触ったら `src/components/viewer/Comment.sanitize.test.tsx` が通ることを確認してください
  （`Comment.test.tsx` はプレビューをモックしているので、ここの退行を検知できません）。
- **実際の AWS リソースの識別子（ユーザープール ID、AppSync の URL、ARN など）を
  コミットしないでください。** 環境依存の値は環境変数か `amplify_outputs.json`（`.gitignore` 済み）に置きます。
- Lambda は Node.js 22 + AWS SDK v3 です。SDK はランタイム同梱のものを使い、
  `amplify/functions/*/` に依存を足さないでください。

詳しくは [アーキテクチャ](docs/architecture.md) を参照してください。

## Pull Request

- 1 つの PR では 1 つのことをしてください。
- 何を直したか、どう確認したかを書いてください。
- バックエンドやランタイムに関わる変更は、[動作検証チェックリスト](docs/verification-checklist.md)
  のどの項目を通したかも書いてもらえると助かります。

## ライセンス

送ってもらった変更は Apache License 2.0 で公開されます。
