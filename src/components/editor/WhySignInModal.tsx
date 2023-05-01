import React from "react"

import Modal from "react-bootstrap/Modal"

export const WhySignInModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <Modal
      show={isOpen}
      onHide={() => onClose()}
      aria-labelledby="blogcomment-modal-whysiginin"
    >
      <Modal.Header closeButton>
        <Modal.Title id="blogcomment-modal-whysignin-title">
          Why sign in is needed?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul>
        <li>For anti-spam measures.</li>
        <li>Users can create the account securely.</li>
        <li>Social Login for popular services is easy available.</li>
        </ul>
      </Modal.Body>
    </Modal>
  )
}
