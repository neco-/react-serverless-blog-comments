import React, { useState } from 'react'

import Modal from "react-bootstrap/Modal"

import { useAuth } from './useAuth'
import googleSignIn from '../images/google_signin.png'

export const useSignInGoogleModal = () => {
  const { signInWithGoogle } = useAuth()
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const openSignInGoogleModal = () => setIsOpen(true)
  const closeSignInGoogleModal = () => setIsOpen(false)
  const handleSignIn = () => {
    setIsOpen(false)
    signInWithGoogle()
  }

  const SignInGoogleModal = () => {
    return isOpen ? (
      <Modal
        size="sm"
        show={isOpen}
        onHide={() => setIsOpen(false)}
        aria-label="Sign in with Google Modal"
      >
        <Modal.Header closeButton>
          <div style={{display: "flex", justifyContent: "center", cursor: "pointer"}}>
            <img src={googleSignIn} alt="Sign in with Google" onClick={() => handleSignIn()} />
          </div>
        </Modal.Header>
        <Modal.Body>
          I will follow the <a href="https://developers.google.com/identity/branding-guidelines" rel="noreferrer" target="_blank">Sign-In Branding Guidelines</a>.
        </Modal.Body>
      </Modal>
    )
    : null
  }

  return { SignInGoogleModal, openSignInGoogleModal, closeSignInGoogleModal }
}
