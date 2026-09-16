import { selectRedirectUrls } from './redirectUrls'

// Cognito のコールバック URL は複数登録できる（localhost と本番など）。
// ここを間違えるとログイン後に戻ってこられなくなるが、単体テストでしか拾えない。
describe('selectRedirectUrls', () => {
  const urls = ['http://localhost:3000/', 'https://example.com/', 'https://www.example.com/']

  it('現在のホストに一致する URL だけを返す', () => {
    expect(selectRedirectUrls(urls, 'example.com')).toEqual(['https://example.com/'])
  })

  it('一致が複数あればすべて返す', () => {
    const dup = ['https://example.com/', 'https://example.com/callback']
    expect(selectRedirectUrls(dup, 'example.com')).toEqual(dup)
  })

  it('一致が無ければ元の一覧をそのまま返す', () => {
    // 空配列を返すとリダイレクト先が決まらなくなるため、絞らずに渡す
    expect(selectRedirectUrls(urls, 'nowhere.test')).toEqual(urls)
  })

  it('ポートが違えば別のホストとして扱う', () => {
    expect(selectRedirectUrls(urls, 'localhost:5173')).toEqual(urls)
    expect(selectRedirectUrls(urls, 'localhost:3000')).toEqual(['http://localhost:3000/'])
  })

  it('サブドメインは一致しない', () => {
    expect(selectRedirectUrls(urls, 'www.example.com')).toEqual(['https://www.example.com/'])
  })

  it('元の配列を書き換えない', () => {
    const before = [...urls]
    selectRedirectUrls(urls, 'example.com')
    expect(urls).toEqual(before)
  })
})
