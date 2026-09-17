import { describe, it, expect, beforeEach } from 'vitest'
import { isSignInInFlight } from './oauthInFlight'

const CLIENT = 'testclientid'
const KEY = `CognitoIdentityServiceProvider.${CLIENT}.inflightOAuth`

beforeEach(() => localStorage.clear())

describe('isSignInInFlight', () => {
  it('Amplify が進行中の印を残していれば true', () => {
    localStorage.setItem(KEY, 'true')
    expect(isSignInInFlight(CLIENT)).toBe(true)
  })

  it('印が無ければ false（交換の済んだ URL を開き直した場合）', () => {
    expect(isSignInInFlight(CLIENT)).toBe(false)
  })

  it('false が入っているときも false', () => {
    localStorage.setItem(KEY, 'false')
    expect(isSignInInFlight(CLIENT)).toBe(false)
  })
})
