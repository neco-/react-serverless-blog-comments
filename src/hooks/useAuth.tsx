import React, { useState, useEffect, useContext, createContext } from 'react'

import { useAuthClient } from '../lib/clients'
import { navigateTo } from '../lib/navigation'

// ソーシャルログインは失敗しても画面が無反応になりやすいので、共通の文言で必ず知らせる
export const SIGN_IN_ERROR_MESSAGE = "Sign in failed. Please try again."

interface IInternalAuth {
  username: string
  displayName: string
  // 起動時のログイン判定が終わったか。終わる前に読み取ると認証モードを誤る
  isAuthResolved: boolean
  isLoading: boolean
  isError: boolean
  // ソーシャルログインが失敗したときだけ入る。未ログインなだけのときは空
  signInErrorMessage: string
  isAuthenticated: boolean
  signIn: (username: string, password: string) => void
  signOut: () => void
  isOpenDialog: boolean
  setIsOpenDialog: React.Dispatch<React.SetStateAction<boolean>>
  signInWithFacebook: () => void
  signInWithGoogle: () => void
  signInWithLine: () => void
}

const AuthContext = createContext({} as IInternalAuth)

export const useAuth = () => useContext(AuthContext)

export const AuthContextProvider = ({children}: any) => {
  return <AuthContext.Provider value={InternalAuth()}>{children}</AuthContext.Provider>
}

const InternalAuth = (): IInternalAuth => {
  const authClient = useAuthClient()
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false)
  const [isAuthResolved, setIsAuthResolved] = useState<boolean>(false)
  const [signInErrorMessage, setSignInErrorMessage] = useState<string>("")
  const [authState, setAuthState] = useState({
    username: "",
    displayName: "",
    isLoading: false,
    isError: false,
    isAuthenticated: false,
  })

  useEffect(() => {
    // handling auth
    console.log("useAuth Hook")
    const off = authClient.onAuthEvent((event) => {
      setIsAuthResolved(true)
      switch (event.type) {
      // Sign in success
      case 'signedIn':
        setSignInErrorMessage("")
        setAuthState({
          username: event.user.username,
          displayName: event.user.displayName,
          isError: false,
          isAuthenticated: true,
          isLoading: false,
        })
        break
      // Sign in failed (OAuth redirect flow)
      case 'signInFailure':
        console.error("signInWithRedirect_failure", event.error)
        setSignInErrorMessage(SIGN_IN_ERROR_MESSAGE)
        setAuthState({
          username: "",
          displayName: "",
          isError: true,
          isAuthenticated: false,
          isLoading: false,
        })
        break
      // Sign out
      case 'signedOut':
        setAuthState({
          username: "",
          displayName: "",
          isError: false,
          isAuthenticated: false,
          isLoading: false,
        })
        break
      // To redirect to the original slug after OAuth redirect
      // BlogComments must exist on the root page.
      case 'customOAuthState':
        if (event.state !== "" && event.state !== "/") {
          navigateTo(event.state)
        }
        break
      }
    })

    // check signin status for load comments with AWS_IAM
    authClient.currentUser().then((user) => {
      setIsAuthResolved(true)
      if (user) {
        setAuthState({
          username: user.username,
          displayName: "",
          isError: false,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        setAuthState({
          username: "",
          displayName: "",
          isError: true,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    })

    return off
  }, [authClient])

  // Sign in with Cognito user pool
  const signIn = async (username:string, password:string) => {
    setAuthState({
      username: "",
      displayName: "",
      isError: false,
      isAuthenticated: false,
      isLoading: true,
    })
    try {
      await authClient.signIn(username, password)
    } catch (error) {
      console.error("signIn failure", error)
      setAuthState({
        username: "",
        displayName: "",
        isError: true,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  // リダイレクトに入る前に失敗した場合（コールバック URL 未登録など）。
  // 本番ビルドではログが残らないので、画面に出すのが唯一の手掛かりになる
  const handleSignInWithProviderFailure = (provider: string, error: unknown) => {
    console.error("signInWithProvider failure", provider, error)
    setSignInErrorMessage(SIGN_IN_ERROR_MESSAGE)
    setAuthState({
      username: "",
      displayName: "",
      isError: true,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  // Sign in with federated OIDC for Facebook
  const signInWithFacebook = async () => {
    setSignInErrorMessage("")
    setAuthState({
      username: "",
      displayName: "",
      isError: false,
      isAuthenticated: false,
      isLoading: true,
    })
    const path: string = window.location.pathname
    try {
      await authClient.signInWithProvider('Facebook', path)
    } catch (error) {
      handleSignInWithProviderFailure('Facebook', error)
    }
  }

  // Sign in with federated OIDC for Google
  const signInWithGoogle = async () => {
    setSignInErrorMessage("")
    setAuthState({
      username: "",
      displayName: "",
      isError: false,
      isAuthenticated: false,
      isLoading: true,
    })
    const path: string = window.location.pathname
    try {
      await authClient.signInWithProvider('Google', path)
    } catch (error) {
      handleSignInWithProviderFailure('Google', error)
    }
  }

  // Sign in with federated OIDC for LINE
  const signInWithLine = async () => {
    setSignInErrorMessage("")
    setAuthState({
      username: "",
      displayName: "",
      isError: false,
      isAuthenticated: false,
      isLoading: true,
    })
    const path: string = window.location.pathname
    try {
      await authClient.signInWithProvider('LINE', path)
    } catch (error) {
      handleSignInWithProviderFailure('LINE', error)
    }
  }

  // Sign out
  const signOut = async () => {
    await authClient.signOut()
  }

  return {
    ...authState,
    isAuthResolved,
    signInErrorMessage,
    signIn,
    signOut,
    isOpenDialog,
    setIsOpenDialog,
    signInWithFacebook,
    signInWithGoogle,
    signInWithLine,
  }
}
