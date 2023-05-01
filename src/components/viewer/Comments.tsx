import React, { memo, useEffect } from 'react'

import { graphqlOperation } from 'aws-amplify'
import { API, GraphQLSubscription } from '@aws-amplify/api';

import {
  OnCreateCommentSubscription,
  OnCreateCommentSubscriptionVariables,
  OnUpdateCommentSubscription,
  OnUpdateCommentSubscriptionVariables,
  OnDeleteCommentSubscription,
  OnDeleteCommentSubscriptionVariables,
} from '../../API'
import {
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
} from '../../graphql/subscriptions'

import { CommentThread } from './CommentThread'
import { useComments } from '../../hooks/useComments'

import { useAuth } from "../../hooks/useAuth"
import { useSlug } from "../../hooks/useSlug"

export const Comments = memo(() => {
  const { comments, getComments } = useComments()
  const { slug } = useSlug()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    console.log("useEffect in Comments: subscribe with ", slug)
    const subscribeCreateComment = () => {
      const input: OnCreateCommentSubscriptionVariables = {
        slug: slug,
      }
      const sub = API.graphql<GraphQLSubscription<OnCreateCommentSubscription>>(graphqlOperation(onCreateComment, input))
        .subscribe({
          next: ({ provider, value }) => {
            getComments()
          },
          error: (error) => {
            console.error(error)
          }
        })
      return sub
    }
    const subscribeUpdateComment = () => {
      const input: OnUpdateCommentSubscriptionVariables = {
        slug: slug,
      }
      const sub = API.graphql<GraphQLSubscription<OnUpdateCommentSubscription>>(graphqlOperation(onUpdateComment, input))
        .subscribe({
          next: ({ provider, value }) => {
            getComments()
          },
          error: (error) => {
            console.error(error)
          }
        })
      return sub
    }
    const subscribeDeleteComment = () => {
      const input: OnDeleteCommentSubscriptionVariables = {
        slug: slug,
      }
      const sub = API.graphql<GraphQLSubscription<OnDeleteCommentSubscription>>(graphqlOperation(onDeleteComment, input))
        .subscribe({
          next: ({ provider, value }) => {
            getComments()
          },
          error: (error) => {
            console.error(error)
          }
        })
      return sub
    }
    if (isAuthenticated) {
      const subCreateComment = subscribeCreateComment()
      const subUpdateComment = subscribeUpdateComment()
      const subDeleteComment = subscribeDeleteComment()
      return () => {
        subCreateComment.unsubscribe()
        subUpdateComment.unsubscribe()
        subDeleteComment.unsubscribe()
      }
    }
    return () => {}
  }, [isAuthenticated,  slug, getComments])

  return <CommentThread comments={comments} depth={0} />
})
