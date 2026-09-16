/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createComment = /* GraphQL */ `
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      slug
      displayName
      userId
      content
      siteurl
      commentVotesId
      votes {
        id
        createdAt
        updatedAt
      }
      replyTo
      replies {
        items {
          id
          slug
          displayName
          userId
          content
          siteurl
          commentVotesId
          votes {
            id
            createdAt
            updatedAt
          }
          replyTo
          replies {
            items {
              id
              slug
              displayName
              userId
              content
              siteurl
              commentVotesId
              votes {
                id
                createdAt
                updatedAt
              }
              replyTo
              replies {
                items {
                  id
                  slug
                  displayName
                  userId
                  content
                  siteurl
                  commentVotesId
                  votes {
                    id
                    createdAt
                    updatedAt
                  }
                  replyTo
                  replies {
                    nextToken
                  }
                  createdAt
                  updatedAt
                  deletedAt
                  owner
                }
                nextToken
              }
              createdAt
              updatedAt
              deletedAt
              owner
            }
            nextToken
          }
          createdAt
          updatedAt
          deletedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      deletedAt
      owner
    }
  }
` as GeneratedMutation<
  APITypes.CreateCommentMutationVariables,
  APITypes.CreateCommentMutation
>;
export const updateComment = /* GraphQL */ `
  mutation UpdateComment($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      id
      slug
      displayName
      userId
      content
      siteurl
      commentVotesId
      votes {
        id
        createdAt
        updatedAt
      }
      replyTo
      replies {
        items {
          id
          slug
          displayName
          userId
          content
          siteurl
          commentVotesId
          votes {
            id
            createdAt
            updatedAt
          }
          replyTo
          replies {
            items {
              id
              slug
              displayName
              userId
              content
              siteurl
              commentVotesId
              votes {
                id
                createdAt
                updatedAt
              }
              replyTo
              replies {
                items {
                  id
                  slug
                  displayName
                  userId
                  content
                  siteurl
                  commentVotesId
                  votes {
                    id
                    createdAt
                    updatedAt
                  }
                  replyTo
                  replies {
                    nextToken
                  }
                  createdAt
                  updatedAt
                  deletedAt
                  owner
                }
                nextToken
              }
              createdAt
              updatedAt
              deletedAt
              owner
            }
            nextToken
          }
          createdAt
          updatedAt
          deletedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      deletedAt
      owner
    }
  }
` as GeneratedMutation<
  APITypes.UpdateCommentMutationVariables,
  APITypes.UpdateCommentMutation
>;
export const deleteComment = /* GraphQL */ `
  mutation DeleteComment($input: DeleteCommentInput!) {
    deleteComment(input: $input) {
      id
      slug
      displayName
      userId
      content
      siteurl
      commentVotesId
      votes {
        id
        createdAt
        updatedAt
      }
      replyTo
      replies {
        items {
          id
          slug
          displayName
          userId
          content
          siteurl
          commentVotesId
          votes {
            id
            createdAt
            updatedAt
          }
          replyTo
          replies {
            items {
              id
              slug
              displayName
              userId
              content
              siteurl
              commentVotesId
              votes {
                id
                createdAt
                updatedAt
              }
              replyTo
              replies {
                items {
                  id
                  slug
                  displayName
                  userId
                  content
                  siteurl
                  commentVotesId
                  votes {
                    id
                    createdAt
                    updatedAt
                  }
                  replyTo
                  replies {
                    nextToken
                  }
                  createdAt
                  updatedAt
                  deletedAt
                  owner
                }
                nextToken
              }
              createdAt
              updatedAt
              deletedAt
              owner
            }
            nextToken
          }
          createdAt
          updatedAt
          deletedAt
          owner
        }
        nextToken
      }
      createdAt
      updatedAt
      deletedAt
      owner
    }
  }
` as GeneratedMutation<
  APITypes.DeleteCommentMutationVariables,
  APITypes.DeleteCommentMutation
>;
export const updateVotes = /* GraphQL */ `
  mutation UpdateVotes($input: UpdateVotesInput!) {
    updateVotes(input: $input) {
      id
      createdAt
      updatedAt
    }
  }
` as GeneratedMutation<
  APITypes.UpdateVotesMutationVariables,
  APITypes.UpdateVotesMutation
>;
export const deleteVotes = /* GraphQL */ `
  mutation DeleteVotes($input: DeleteVotesInput!) {
    deleteVotes(input: $input) {
      id
      createdAt
      updatedAt
    }
  }
` as GeneratedMutation<
  APITypes.DeleteVotesMutationVariables,
  APITypes.DeleteVotesMutation
>;
