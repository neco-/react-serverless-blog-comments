import { VotesProps } from './VotesProps'

export type CommentProps = {
  id: string
  slug: string
  displayName: string
  userId: string
  content: string
  siteurl?: string
  commentVotesId: string
  votes: VotesProps
  replyTo?: string
  replies: {
    items: [CommentProps]
  }
  createdAt: string
  updatedAt: string
  deletedAt?: string
  owner: string
}
