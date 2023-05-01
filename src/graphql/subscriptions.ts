/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateComment = /* GraphQL */ `
  subscription OnCreateComment($slug: String!) {
    onCreateComment(slug: $slug) {
      id
      slug
      displayName
      userId
      content
      siteurl
      commentVotesId
      votes {
        id
        upvoters
        downvoters
        owner
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
            upvoters
            downvoters
            owner
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
                upvoters
                downvoters
                owner
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
                    upvoters
                    downvoters
                    owner
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
`;
export const onUpdateComment = /* GraphQL */ `
  subscription OnUpdateComment($slug: String!) {
    onUpdateComment(slug: $slug) {
      id
      slug
      displayName
      userId
      content
      siteurl
      commentVotesId
      votes {
        id
        upvoters
        downvoters
        owner
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
            upvoters
            downvoters
            owner
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
                upvoters
                downvoters
                owner
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
                    upvoters
                    downvoters
                    owner
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
`;
export const onDeleteComment = /* GraphQL */ `
  subscription OnDeleteComment($slug: String!) {
    onDeleteComment(slug: $slug) {
      id
      slug
      displayName
      userId
      content
      siteurl
      commentVotesId
      votes {
        id
        upvoters
        downvoters
        owner
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
            upvoters
            downvoters
            owner
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
                upvoters
                downvoters
                owner
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
                    upvoters
                    downvoters
                    owner
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
`;
