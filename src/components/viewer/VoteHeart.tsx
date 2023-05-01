import React from "react"

import ToggleButton from "react-bootstrap/ToggleButton"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

import { API } from 'aws-amplify'
import {
  updateVotes,
  deleteVotes,
} from '../../graphql/mutations'
import {
  UpdateVotesMutationVariables,
  DeleteVotesMutationVariables,
} from '../../API'

import { useAuth } from "../../hooks/useAuth"

import { SuitHeart } from "react-bootstrap-icons"
import { VotesProps } from './VotesProps'

export const VoteHeart = ({votes}:{votes:VotesProps}) => {
  const { username, isAuthenticated, setIsOpenDialog } = useAuth()
  const isVoted: boolean = votes.upvoters.includes(username)
  const commentVotesId: string = votes.id
  const numvotes: number = votes.upvoters.length

  const sendUpvote = () => {
    const sendRequest = async () => {
      const updateVotesInput: UpdateVotesMutationVariables = {
        input: {
          id: commentVotesId,
          upvoter: username
        }
      }
      try {
        await API.graphql({
          query: updateVotes,
          variables: updateVotesInput,
          authMode: 'AMAZON_COGNITO_USER_POOLS'
        })
      } catch (err: any) {
        if (err.errors[0].message.includes("voted")) {
          console.info("You already voted.")
        } else {
          console.error(err)
        }
      }
    }
    sendRequest()
  }

  const sendDelete = () => {
    const sendRequest = async () => {
      const deleteVotesInput: DeleteVotesMutationVariables = {
        input: {
          id: commentVotesId,
        }
      }
      try {
        await API.graphql({
          query: deleteVotes,
          variables: deleteVotesInput,
          authMode: 'AMAZON_COGNITO_USER_POOLS'
        })
      } catch (err) {
        console.error(err)
      }
    }
    sendRequest()
  }

  const handleChangeChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAuthenticated) {
      if (isVoted) {
        sendDelete()
      } else {
        sendUpvote()
      }
    } else {
      // sign in with blog account
      setIsOpenDialog(true)
    }
  }
  const updateTooltip = (props: any) => (
    <Tooltip id="blogcomment-check-votetoheart-tooltip" {...props}>
      Please reload after voting!
    </Tooltip>
  )

  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 150, hide: 300 }}
      overlay={updateTooltip}
    >
      <ToggleButton
        id={"blogcomment-check-votetoheart-" + commentVotesId}
        size="sm"
        type="checkbox"
        variant="outline-primary"
        checked={isVoted}
        value="1"
        onChange={handleChangeChecked}
      >
        <SuitHeart /> {numvotes}
      </ToggleButton>
    </OverlayTrigger>
  )
}
