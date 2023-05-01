import React from 'react'
import ReactDOM from 'react-dom/client'

import { Amplify, Auth } from 'aws-amplify'

import '@aws-amplify/ui-react/styles.css'

import { BlogComment } from './components/BlogComment'
//import reportWebVitals from './reportWebVitals'

import { OAUTH_DOMAIN } from './config'
import awsExports from './aws-exports'

if (process.env.NODE_ENV === 'production') {
  console.log = () => {}
  console.error = () => {}
  console.debug = () => {}
}

if (awsExports.oauth.redirectSignIn.includes(',')) {
  const { host } = window.location
  const filterHost = (url: string) => new URL(url).host === host
  awsExports.oauth.redirectSignIn = awsExports.oauth.redirectSignIn
    .split(',')
    .filter(filterHost)
    .shift() as string
  awsExports.oauth.redirectSignOut = awsExports.oauth.redirectSignOut
    .split(',')
    .filter(filterHost)
    .shift() as string
}
if (OAUTH_DOMAIN) {
  awsExports.oauth.domain = OAUTH_DOMAIN
}

Amplify.configure(awsExports)
Auth.configure(awsExports)

const bc:HTMLElement = document.getElementById('blogcomments') as HTMLElement
if (bc) {
  const root = ReactDOM.createRoot(bc)
  if (root) {
    root.render(<BlogComment />)
  }
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals()
