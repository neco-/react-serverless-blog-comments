// Amplify が「ログインが進行中」として残す印を読む。
//
// この印が無いまま復帰 URL を開くと、Amplify はトークン交換を始めず、成功も失敗も
// 通知しない（attemptCompleteOAuthFlow が何もせず戻る）。待機表示を出したままだと
// そこで止まってしまうので、始まらないことを先に知るために読む。
//
// Amplify は交換を終えるとこの印を消すため、必ず Amplify.configure より前に読むこと。
export const isSignInInFlight = (userPoolClientId: string): boolean => {
  try {
    return localStorage.getItem(`CognitoIdentityServiceProvider.${userPoolClientId}.inflightOAuth`) === 'true'
  } catch {
    return false
  }
}
