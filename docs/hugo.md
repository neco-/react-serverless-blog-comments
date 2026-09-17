# hugoへの組み込み例

## 完了の定義

- hugo のブログ記事にコメント欄が表示される

## 事前準備

- [導入手順](setup.md) を完了していることを確認してください。
- 以降、デプロイ先を `https://prod.xxxxxxxxxxxxxx.amplifyapp.com` として書きます。
  独自ドメインを設定している場合はそちらに読み替えてください。

## 読み込むもの

```html
<script defer type="text/javascript" src="https://prod.xxxxxxxxxxxxxx.amplifyapp.com/static/js/main.min.js" crossorigin="anonymous"></script>
<link href="https://prod.xxxxxxxxxxxxxx.amplifyapp.com/static/css/main.min.css" rel="stylesheet" crossorigin="anonymous">
```

- **Bootstrap の読み込みは不要です。** レイアウトとフォームの見た目は `main.min.css` に
  含まれており、すべて `#blogcomments` 配下に限定してあります（`src/styles/blogcomments.css`）。
  埋め込み先の記事本文には影響しません。
- Markdown エディタの CSS も `main.min.css` にバンドル済みです。外部 CDN の `<link>` は要りません。
- `main.min.js` は classic な `<script>` でも `type="module"` でも読み込めます。

> `main.min.js` は gzip で約 600KB あります。コメント欄を出さないページでも
> `<head>` で読み込むと全ページに転送量がかかるので、記事ページだけで読み込む構成を勧めます。

## コメント欄を置く

`#blogcomments` という id の要素があれば、そこに描画されます。

`layouts/partials/blogcomments.html`:

```html
{{ if eq .Type "post" }}
  <hr />
  <div id="blogcomments"></div>
  <script defer type="text/javascript" src="https://prod.xxxxxxxxxxxxxx.amplifyapp.com/static/js/main.min.js" crossorigin="anonymous"></script>
  <link href="https://prod.xxxxxxxxxxxxxx.amplifyapp.com/static/css/main.min.css" rel="stylesheet" crossorigin="anonymous">
{{ end }}
```

`layouts/post/single.html` の任意の位置で読み込みます:

```html
{{ partial "blogcomments.html" . }}
```

## ライトとダーク

既定では OS の `prefers-color-scheme` に追従します。埋め込む側が同じ方式なら、
何も指定しなくても見た目が揃います。

独自のテーマ切替を持つサイトでは、`#blogcomments` に `data-bc-theme` を付けて明暗を強制できます。
OS の設定より優先し、属性を書き換えればその場で切り替わります。

```html
<div id="blogcomments" data-bc-theme="dark"></div>
```

指定できる値は `light` と `dark` です。属性を付けない（または他の値の）ときは OS に追従します。
属性を付けた場合だけ、ウィジェットは自分の地の色を塗ります。埋め込み先の地の色と食い違うためです。

![ダーク表示のスクリーンショット](dark.png "ダーク表示")

## OAuth の戻り先ページ

Cognito は登録済みのコールバック URL にしか戻せないため、記事ページからソーシャルログインしても
戻り先はサイトのルートなど固定の 1 ページになります。**そのページでも `main.min.js` を
読み込んでください。** 読み込まれないと認可コードがトークンに交換されず、
ログインしていない状態のままになります。

コメント欄（`#blogcomments`）は不要です。要素が無い場合、ウィジェットは描画せず、
ログイン開始時に記憶した元のパスへ自動で戻します。

戻り先ページで常時読み込みたくない場合は、ログインからの復帰時だけ読み込めば十分です。

```html
<script>
(function () {
  var p = new URLSearchParams(location.search)
  if (!p.get("code") || !p.get("state")) return
  var s = document.createElement("script")
  s.src = "https://prod.xxxxxxxxxxxxxx.amplifyapp.com/static/js/main.min.js"
  s.crossOrigin = "anonymous"
  s.defer = true
  document.head.appendChild(s)
})()
</script>
```

### 復帰中の待機表示を出す場合

交換には数秒かかるので、その間を覆う表示を置きたくなります。置くなら、**遷移しないまま
終わる結末にも出口を用意してください**。交換が失敗したときや、交換済みの URL を開き直して
そもそも交換が始まらないときは、待っても遷移は起きません。出口が「遷移」しか無いと、
待機表示がそのまま残り続けます。

遷移せずに復帰処理が終わったとき、ウィジェットは `window` に
`blogcomments:oauth-return-done` を投げます。これを受けて表示を畳んでください。

```html
<script>
window.addEventListener("blogcomments:oauth-return-done", function () {
  /* 待機表示を消す */
})
</script>
```

失敗した場合は、戻り先が分かるかぎり元の記事へ戻したうえで、コメント欄に理由を出します。
開発者ツールを開けない端末でも分かるよう、短い理由コードを文言に入れています。

| コード | 意味 |
| --- | --- |
| `exchange` | 認可コードをトークンに交換できなかった |
| `no-flow` | 進行中のログインが無かった（交換済みの URL を開き直した、など） |

## サインアウトの戻り先

サインアウトも Cognito のログアウトを経由し、`redirect_sign_out_uri` に登録した URL
（サイトのルートなど）へ戻ります。ログインと違って戻り先を URL に載せる手段がありません。
`logout_uri` は登録済みの URL と完全一致である必要があり、`state` のような付随する値も
渡せないためです。

そこでウィジェットは、離れる前に戻り先を `sessionStorage` へ預けます。

| | |
| --- | --- |
| キー | `blogcomment-signout-return` |
| 値 | `{"path": "/post/xxx/", "at": 1758067200000}`（`at` は預けた時刻、epoch ミリ秒） |

**着地するページでこれを読んで、元のページへ送り返してください。** 置いたままにしても
実害はありませんが、読者はトップに取り残されます。

```html
<script>
(function () {
  var k = "blogcomment-signout-return", v
  try { v = sessionStorage.getItem(k); sessionStorage.removeItem(k) } catch (e) { return }
  if (!v) return
  var r; try { r = JSON.parse(v) } catch (e) { return }
  if (!r || typeof r.path != "string" || typeof r.at != "number") return
  if (Date.now() - r.at > 120000) return
  if (r.path.charAt(0) != "/" || r.path.charAt(1) == "/") return
  location.replace(r.path)
})()
</script>
```

読んだら消すこと（往復しないため）、古い値は使わないこと（ログアウト画面で離脱したあと、
同じタブで後からそのページを開いたときに行き先を乗っ取らないため）、`/` で始まり `//` で
始まらないパスだけを使うこと（別サイトへ飛ばさないため）。`<head>` に置くと描画の前に
離れるので、着地したページがちらつきません。`replace` を使うのは、戻るボタンで
「元のページ ⇄ 着地ページ」を往復させないためです。

## 単に Web ページへ組み込む場合

hugo でなくても、上の 3 つ（script / link / `<div id="blogcomments">`）を置くだけで動きます。

## ページの区別について

コメントは slug 単位で紐付きます。slug は URL の末尾のパスです。
`/aaa/hoge/` と `/bbb/hoge/` はどちらも `hoge` になり、同じコメントを共有します。
詳しくは [細かい仕様](hint.md) を参照してください。
