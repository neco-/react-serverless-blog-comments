// モーダルとツールチップの描画先。
//
// react-bootstrap は既定で document.body の直下に描画する。それだと自前の CSS
// （#blogcomments 配下に限定してある）が効かず、.modal や .tooltip といったクラス名を
// 埋め込み先のページに晒すことにもなる。そのため描画先をウィジェットの中に指定する。
//
// 見つからないときは body に戻す。null を返すと react-bootstrap は描画先が未解決と見なし、
// モーダルを一切描画しないため。
export const getWidgetRoot = (): HTMLElement =>
  document.getElementById('blogcomments') ?? document.body
