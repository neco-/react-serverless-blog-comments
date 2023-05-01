import React, { useState, useEffect, useContext, createContext } from 'react'

import { Amplify, Auth, Hub } from 'aws-amplify'
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth/lib/types"
import { CognitoUser } from "amazon-cognito-identity-js"

interface IInternalAuth {
  username: string
  displayName: string
  isLoading: boolean
  isError: boolean
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
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false)
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
    const hubListenerCancelToken = Hub.listen('auth', async ({payload: {event, data}}) => {
      // Read attributes separately when OAuth
      const getAttributes = async (user: CognitoUser) => {
        const attr = await Auth.userAttributes(user)
        const hasName = attr?.filter(at => (at.Name === "name"))
        return (hasName && hasName[0]?.Value) ?? ""
      }
      switch (event) {
      // Sign in success
      case 'signIn':
        console.log("cusomOAuthSignIn", data)
        if (data) {
          // Use cognito auth to access AppSync after signing in
          Amplify.configure({
            "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS", 
          })
          // Cognito user pool has attributes
          const name = ("attributes" in data) ? data.username : (await getAttributes(data))
          setAuthState({
            username: data.username,
            displayName: name,
            isError: false,
            isAuthenticated: true,
            isLoading: false,
          })
        }
        break
      // Sign in failed
      case 'signIn_failure':
        console.error("signIn_failure", data)
        setAuthState({
          username: "",
          displayName: "",
          isError: true,
          isAuthenticated: false,
          isLoading: false,
        })
        // Use IAM auth before singing in
        Amplify.configure({
          "aws_appsync_authenticationType": "AWS_IAM", 
        })
        break
      // Sign out
      case 'signOut':
        console.log("signOut", data)
        setAuthState({
          username: "",
          displayName: "",
          isError: false,
          isAuthenticated: false,
          isLoading: false,
        })
        // Use IAM auth before singing in
        Amplify.configure({
          "aws_appsync_authenticationType": "AWS_IAM", 
        })
        break
      // To redirect to the original slug after OAuth redirect
      // BlogComments must exist on the root page.
      case 'customOAuthState':
        console.log("customOAuthState", data)
        if (data !== "" && data !== "/") {
          window.location.pathname = data
        }
        break
      default:
        console.log("Hub.listen", event, data)
      }
    })

    // check signin status for load comments with AWS_IAM
    const inner = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser()
        if (user) {
          setAuthState({
            username: user.username,
            displayName: "",
            isError: false,
            isAuthenticated: true,
            isLoading: false,
          })
          Amplify.configure({
            "aws_appsync_authenticationType": "AMAZON_COGNITO_USER_POOLS", 
          })
        }
      } catch(error) {
        setAuthState({
          username: "",
          displayName: "",
          isError: true,
          isAuthenticated: false,
          isLoading: false,
        })
        Amplify.configure({
          "aws_appsync_authenticationType": "AWS_IAM", 
        })
      }
    }
    inner()

    return () => {hubListenerCancelToken()}
  }, [])

  // Sign in with Cognito user pool
  const signIn = async (username:string, password:string) => {
    setAuthState({
      username: "",
      displayName: "",
      isError: false,
      isAuthenticated: false,
      isLoading: true,
    })
    await Auth.signIn(username, password)
  }

  // Sign in with federated OIDC for Facebook
  const signInWithFacebook = async () => {
    setAuthState({
      username: "",
      displayName: "",
      isError: false,
      isAuthenticated: false,
      isLoading: true,
    })
    const path: string = window.location.pathname
    await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Facebook, customState: path })
  }

  // Sign in with federated OIDC for Google
  const signInWithGoogle = async () => {
    setAuthState({
      username: "",
      displayName: "",
      isError: false,
      isAuthenticated: false,
      isLoading: true,
    })
    const path: string = window.location.pathname
    await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google, customState: path})
  }

  // Sign in with federated OIDC for Facebook
  const signInWithLine = async () => {
    setAuthState({
      username: "",
      displayName: "",
      isError: false,
      isAuthenticated: false,
      isLoading: true,
    })
    const path: string = window.location.pathname
    await Auth.federatedSignIn({ customProvider: "LINE", customState: path })
  }

  // Sign out
  const signOut = async () => {
    await Auth.signOut()
  }

  return {
    ...authState,
    signIn,
    signOut,
    isOpenDialog,
    setIsOpenDialog,
    signInWithFacebook,
    signInWithGoogle,
    signInWithLine,
  }
}
