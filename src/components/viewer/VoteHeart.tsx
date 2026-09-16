import React from "react"

import ToggleButton from "react-bootstrap/ToggleButton"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

import { useApiClient } from '../../lib/clients'
import {
  updateVotes,
  deleteVotes,
} from '../../graphql/mutations'
import {
  UpdateVotesMutationVariables,
  DeleteVotesMutationVariables,
} from '../../API'

import { useAuth } from "../../hooks/useAuth"
import { useVotes } from "../../hooks/useVotes"

import { SuitHeart } from "react-bootstrap-icons"
import { VotesProps } from './VotesProps'
import { getWidgetRoot } from '../../lib/widgetRoot'

export const VoteHeart = ({votes}:{votes:VotesProps}) => {
  const { username, isAuthenticated, setIsOpenDialog } = useAuth()
  const apiClient = useApiClient()
  // 投票者の一覧は公開していないので、票数と自分の投票状態は votesByIds の結果から引く。
  const { summaries, applyLocalVote } = useVotes()
  const commentVotesId: string = votes.id
  const summary = summaries.get(commentVotesId)
  const isVoted: boolean = summary?.votedByMe ?? false
  const numvotes: number = summary?.upvoteCount ?? 0

  const sendUpvote = () => {
    const sendRequest = async () => {
      const updateVotesInput: UpdateVotesMutationVariables = {
        input: {
          id: commentVotesId,
          upvoter: username
        }
      }
      try {
        await apiClient.mutate(updateVotes, updateVotesInput)
        applyLocalVote(commentVotesId, true)
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
        await apiClient.mutate(deleteVotes, deleteVotesInput)
        applyLocalVote(commentVotesId, false)
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
      // 未ログインならログインダイアログを開く
      setIsOpenDialog(true)
    }
  }
  const updateTooltip = (props: any) => (
    <Tooltip id="blogcomment-check-votetoheart-tooltip" {...props}>
      {isVoted ? 'Remove your vote' : 'Vote for this comment'}
    </Tooltip>
  )

  return (
    <OverlayTrigger
      container={getWidgetRoot}
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
