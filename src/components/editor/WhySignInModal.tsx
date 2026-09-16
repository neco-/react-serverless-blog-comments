import React from "react"

import Modal from "react-bootstrap/Modal"
import { getWidgetRoot } from '../../lib/widgetRoot'

export const WhySignInModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <Modal
      container={getWidgetRoot}
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
        <li>PokerTable and AI chatbot users already have an account.</li>
        <li>Social Login for popular services is easy available.</li>
        </ul>
      </Modal.Body>
    </Modal>
  )
}
