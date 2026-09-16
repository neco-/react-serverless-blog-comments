import { describe, it, expect } from "vitest"
import { FakeAuthClient, FakeApiClient } from './fakes'

describe('FakeAuthClient', () => {
  it('emit で listener に届き、解除後は届かない', () => {
    const c = new FakeAuthClient()
    const seen: string[] = []
    const off = c.onAuthEvent((e) => seen.push(e.type))
    c.emit({ type: 'signedOut' })
    off()
    c.emit({ type: 'signedOut' })
    expect(seen).toEqual(['signedOut'])
    expect(c.listenerCount()).toBe(0)
  })
})

describe('FakeApiClient', () => {
  it('subscribe の解除で active が false になる', () => {
    const c = new FakeApiClient()
    const off = c.subscribe('q', {}, { next: () => {}, error: () => {} })
    expect(c.subscriptions[0].active).toBe(true)
    off()
    expect(c.subscriptions[0].active).toBe(false)
  })
  it('mutateError があれば reject する', async () => {
    const c = new FakeApiClient()
    c.mutateError = new Error('boom')
    await expect(c.mutate('m', {})).rejects.toThrow('boom')
  })
})
