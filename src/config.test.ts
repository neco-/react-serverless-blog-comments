// クレジット表記はビルド時の環境変数で差し込む。
// 値をリポジトリに書くと、公開用ブランチへコピーしたときにも載ってしまうため。
const loadConfig = async () => {
  vi.resetModules()
  return await import('./config')
}

describe('クレジット表記の設定', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('環境変数が無ければ空（既定では何も出さない）', async () => {
    vi.stubEnv('VITE_POWERED_BY_LABEL', undefined)
    vi.stubEnv('VITE_POWERED_BY_URL', undefined)
    const config = await loadConfig()
    expect(config.POWERED_BY_LABEL).toBe('')
    expect(config.POWERED_BY_URL).toBe('')
  })

  it('環境変数があればその値を使う', async () => {
    vi.stubEnv('VITE_POWERED_BY_LABEL', 'Powered by example')
    vi.stubEnv('VITE_POWERED_BY_URL', 'https://example.com')
    const config = await loadConfig()
    expect(config.POWERED_BY_LABEL).toBe('Powered by example')
    expect(config.POWERED_BY_URL).toBe('https://example.com')
  })

  it('片方だけの指定でも、もう片方は空のまま', async () => {
    vi.stubEnv('VITE_POWERED_BY_LABEL', 'Powered by example')
    vi.stubEnv('VITE_POWERED_BY_URL', undefined)
    const config = await loadConfig()
    expect(config.POWERED_BY_LABEL).toBe('Powered by example')
    expect(config.POWERED_BY_URL).toBe('')
  })
})
