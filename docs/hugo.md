# hugoへの組み込み例

## 完了の定義

- hugoにBlogCommentsを組み込める

## 事前準備

- [導入手順](setup.md)を完了していることをご確認ください。

## 前提知識

- hugoがわかる
- ネットワークの知識（HTML, CDN, CORS）がある

## ヘッダーでCDNのスクリプトを読み込ませる
- headタグでscriptを読み込ませます。
- （例）layouts/partials/head.html
  ```html
  <script defer language="javascript" type="text/javascript" src="https://prod.xxxxxxxxxxxxxx.amplifyapp.com/static/js/main.min.js" crossorigin="anonymous"></script>
  <link href="https://prod.xxxxxxxxxxxxxx.amplifyapp.com/static/css/main.min.css" rel="stylesheet" crossorigin="anonymous">
  ```

## blogcomments.html
- .Typeがpostの場合にのみ表示する例です。
- （例）layouts/partials/blogcomments.html
  ```html
  {{ $ctx := . }}
  {{ if eq .Type "post" }}
    <hr />
    <div id="blogcomments"></div>
  {{ end }}
  ```

## post記事への追加
- postの任意の位置でpartialを読み込ませる場合の例です。
- （例）layouts/post/single.html
  ```html
  （略）
  {{ partial "blogcomments.html" . }}
  （略）
  ```

## 単にWebページに組み込む場合

- 以下を読み込ませます。
  ```html
  <script defer language="javascript" type="text/javascript" src="https://prod.xxxxxxxxxxxxxx.amplifyapp.com/static/js/main.min.js" crossorigin="anonymous"></script>
  <link href="https://prod.xxxxxxxxxxxxxx.amplifyapp.com/static/css/main.min.css" rel="stylesheet" crossorigin="anonymous">
  <div id="blogcomments" />
  ```

- 外部依存のCSSが必要な場合は以下も含めてください。
  ```html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@uiw/react-md-editor@3.20.5/dist/mdeditor.min.css" integrity="sha256-ZrmHDpMdWypuIFbcNrmzmCwN5wuQXwO2lG3qvvrPPPE=" crossorigin="anonymous">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" crossorigin="anonymous">
  ```
