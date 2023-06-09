/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateCommentInput = {
  slug: string,
  displayName: string,
  content: string,
  siteurl?: string | null,
  replyTo?: string | null,
  commentVotesId?: string | null,
};

export type Comment = {
  __typename: "Comment",
  id: string,
  slug: string,
  displayName: string,
  userId?: string | null,
  content: string,
  siteurl?: string | null,
  commentVotesId: string,
  votes: Votes,
  replyTo?: string | null,
  replies?: ModelCommentConnection | null,
  createdAt: string,
  updatedAt: string,
  deletedAt?: string | null,
  owner?: string | null,
};

export type Votes = {
  __typename: "Votes",
  id: string,
  upvoters?: Array< string | null > | null,
  downvoters?: Array< string | null > | null,
  owner?: string | null,
  createdAt: string,
  updatedAt: string,
};

export type ModelCommentConnection = {
  __typename: "ModelCommentConnection",
  items:  Array<Comment | null >,
  nextToken?: string | null,
};

export type UpdateCommentInput = {
  id: string,
  displayName?: string | null,
  content?: string | null,
  siteurl?: string | null,
  commentVotesId?: string | null,
};

export type DeleteCommentInput = {
  id: string,
};

export type UpdateVotesInput = {
  id: string,
  upvoter?: string | null,
  downvoter?: string | null,
};

export type DeleteVotesInput = {
  id: string,
};

export type ModelStringKeyConditionInput = {
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelCommentFilterInput = {
  id?: ModelIDInput | null,
  slug?: ModelStringInput | null,
  displayName?: ModelStringInput | null,
  userId?: ModelStringInput | null,
  content?: ModelStringInput | null,
  siteurl?: ModelStringInput | null,
  commentVotesId?: ModelIDInput | null,
  replyTo?: ModelIDInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  deletedAt?: ModelStringInput | null,
  and?: Array< ModelCommentFilterInput | null > | null,
  or?: Array< ModelCommentFilterInput | null > | null,
  not?: ModelCommentFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type CreateCommentMutationVariables = {
  input: CreateCommentInput,
};

export type CreateCommentMutation = {
  createComment?:  {
    __typename: "Comment",
    id: string,
    slug: string,
    displayName: string,
    userId?: string | null,
    content: string,
    siteurl?: string | null,
    commentVotesId: string,
    votes:  {
      __typename: "Votes",
      id: string,
      upvoters?: Array< string | null > | null,
      downvoters?: Array< string | null > | null,
      owner?: string | null,
      createdAt: string,
      updatedAt: string,
    },
    replyTo?: string | null,
    replies?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        slug: string,
        displayName: string,
        userId?: string | null,
        content: string,
        siteurl?: string | null,
        commentVotesId: string,
        votes:  {
          __typename: "Votes",
          id: string,
          upvoters?: Array< string | null > | null,
          downvoters?: Array< string | null > | null,
          owner?: string | null,
          createdAt: string,
          updatedAt: string,
        },
        replyTo?: string | null,
        replies?:  {
          __typename: "ModelCommentConnection",
          items:  Array< {
            __typename: "Comment",
            id: string,
            slug: string,
            displayName: string,
            userId?: string | null,
            content: string,
            siteurl?: string | null,
            commentVotesId: string,
            votes:  {
              __typename: "Votes",
              id: string,
              upvoters?: Array< string | null > | null,
              downvoters?: Array< string | null > | null,
              owner?: string | null,
              createdAt: string,
              updatedAt: string,
            },
            replyTo?: string | null,
            replies?:  {
              __typename: "ModelCommentConnection",
              items:  Array< {
                __typename: "Comment",
                id: string,
                slug: string,
                displayName: string,
                userId?: string | null,
                content: string,
                siteurl?: string | null,
                commentVotesId: string,
                votes:  {
                  __typename: "Votes",
                  id: string,
                  upvoters?: Array< string | null > | null,
                  downvoters?: Array< string | null > | null,
                  owner?: string | null,
                  createdAt: string,
                  updatedAt: string,
                },
                replyTo?: string | null,
                replies?:  {
                  __typename: "ModelCommentConnection",
                  nextToken?: string | null,
                } | null,
                createdAt: string,
                updatedAt: string,
                deletedAt?: string | null,
                owner?: string | null,
              } | null >,
              nextToken?: string | null,
            } | null,
            createdAt: string,
            updatedAt: string,
            deletedAt?: string | null,
            owner?: string | null,
          } | null >,
          nextToken?: string | null,
        } | null,
        createdAt: string,
        updatedAt: string,
        deletedAt?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    deletedAt?: string | null,
    owner?: string | null,
  } | null,
};

export type UpdateCommentMutationVariables = {
  input: UpdateCommentInput,
};

export type UpdateCommentMutation = {
  updateComment?:  {
    __typename: "Comment",
    id: string,
    slug: string,
    displayName: string,
    userId?: string | null,
    content: string,
    siteurl?: string | null,
    commentVotesId: string,
    votes:  {
      __typename: "Votes",
      id: string,
      upvoters?: Array< string | null > | null,
      downvoters?: Array< string | null > | null,
      owner?: string | null,
      createdAt: string,
      updatedAt: string,
    },
    replyTo?: string | null,
    replies?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        slug: string,
        displayName: string,
        userId?: string | null,
        content: string,
        siteurl?: string | null,
        commentVotesId: string,
        votes:  {
          __typename: "Votes",
          id: string,
          upvoters?: Array< string | null > | null,
          downvoters?: Array< string | null > | null,
          owner?: string | null,
          createdAt: string,
          updatedAt: string,
        },
        replyTo?: string | null,
        replies?:  {
          __typename: "ModelCommentConnection",
          items:  Array< {
            __typename: "Comment",
            id: string,
            slug: string,
            displayName: string,
            userId?: string | null,
            content: string,
            siteurl?: string | null,
            commentVotesId: string,
            votes:  {
              __typename: "Votes",
              id: string,
              upvoters?: Array< string | null > | null,
              downvoters?: Array< string | null > | null,
              owner?: string | null,
              createdAt: string,
              updatedAt: string,
            },
            replyTo?: string | null,
            replies?:  {
              __typename: "ModelCommentConnection",
              items:  Array< {
                __typename: "Comment",
                id: string,
                slug: string,
                displayName: string,
                userId?: string | null,
                content: string,
                siteurl?: string | null,
                commentVotesId: string,
                votes:  {
                  __typename: "Votes",
                  id: string,
                  upvoters?: Array< string | null > | null,
                  downvoters?: Array< string | null > | null,
                  owner?: string | null,
                  createdAt: string,
                  updatedAt: string,
                },
                replyTo?: string | null,
                replies?:  {
                  __typename: "ModelCommentConnection",
                  nextToken?: string | null,
                } | null,
                createdAt: string,
                updatedAt: string,
                deletedAt?: string | null,
                owner?: string | null,
              } | null >,
              nextToken?: string | null,
            } | null,
            createdAt: string,
            updatedAt: string,
            deletedAt?: string | null,
            owner?: string | null,
          } | null >,
          nextToken?: string | null,
        } | null,
        createdAt: string,
        updatedAt: string,
        deletedAt?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    deletedAt?: string | null,
    owner?: string | null,
  } | null,
};

export type DeleteCommentMutationVariables = {
  input: DeleteCommentInput,
};

export type DeleteCommentMutation = {
  deleteComment?:  {
    __typename: "Comment",
    id: string,
    slug: string,
    displayName: string,
    userId?: string | null,
    content: string,
    siteurl?: string | null,
    commentVotesId: string,
    votes:  {
      __typename: "Votes",
      id: string,
      upvoters?: Array< string | null > | null,
      downvoters?: Array< string | null > | null,
      owner?: string | null,
      createdAt: string,
      updatedAt: string,
    },
    replyTo?: string | null,
    replies?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        slug: string,
        displayName: string,
        userId?: string | null,
        content: string,
        siteurl?: string | null,
        commentVotesId: string,
        votes:  {
          __typename: "Votes",
          id: string,
          upvoters?: Array< string | null > | null,
          downvoters?: Array< string | null > | null,
          owner?: string | null,
          createdAt: string,
          updatedAt: string,
        },
        replyTo?: string | null,
        replies?:  {
          __typename: "ModelCommentConnection",
          items:  Array< {
            __typename: "Comment",
            id: string,
            slug: string,
            displayName: string,
            userId?: string | null,
            content: string,
            siteurl?: string | null,
            commentVotesId: string,
            votes:  {
              __typename: "Votes",
              id: string,
              upvoters?: Array< string | null > | null,
              downvoters?: Array< string | null > | null,
              owner?: string | null,
              createdAt: string,
              updatedAt: string,
            },
            replyTo?: string | null,
            replies?:  {
              __typename: "ModelCommentConnection",
              items:  Array< {
                __typename: "Comment",
                id: string,
                slug: string,
                displayName: string,
                userId?: string | null,
                content: string,
                siteurl?: string | null,
                commentVotesId: string,
                votes:  {
                  __typename: "Votes",
                  id: string,
                  upvoters?: Array< string | null > | null,
                  downvoters?: Array< string | null > | null,
                  owner?: string | null,
                  createdAt: string,
                  updatedAt: string,
                },
                replyTo?: string | null,
                replies?:  {
                  __typename: "ModelCommentConnection",
                  nextToken?: string | null,
                } | null,
                createdAt: string,
                updatedAt: string,
                deletedAt?: string | null,
                owner?: string | null,
              } | null >,
              nextToken?: string | null,
            } | null,
            createdAt: string,
            updatedAt: string,
            deletedAt?: string | null,
            owner?: string | null,
          } | null >,
          nextToken?: string | null,
        } | null,
        createdAt: string,
        updatedAt: string,
        deletedAt?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    deletedAt?: string | null,
    owner?: string | null,
  } | null,
};

export type UpdateVotesMutationVariables = {
  input: UpdateVotesInput,
};

export type UpdateVotesMutation = {
  updateVotes?:  {
    __typename: "Votes",
    id: string,
    upvoters?: Array< string | null > | null,
    downvoters?: Array< string | null > | null,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteVotesMutationVariables = {
  input: DeleteVotesInput,
};

export type DeleteVotesMutation = {
  deleteVotes?:  {
    __typename: "Votes",
    id: string,
    upvoters?: Array< string | null > | null,
    downvoters?: Array< string | null > | null,
    owner?: string | null,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CommentsBySlugAndUpdatedAtQueryVariables = {
  slug: string,
  updatedAt?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCommentFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type CommentsBySlugAndUpdatedAtQuery = {
  commentsBySlugAndUpdatedAt?:  {
    __typename: "ModelCommentConnection",
    items:  Array< {
      __typename: "Comment",
      id: string,
      slug: string,
      displayName: string,
      userId?: string | null,
      content: string,
      siteurl?: string | null,
      commentVotesId: string,
      votes:  {
        __typename: "Votes",
        id: string,
        upvoters?: Array< string | null > | null,
        downvoters?: Array< string | null > | null,
        owner?: string | null,
        createdAt: string,
        updatedAt: string,
      },
      replyTo?: string | null,
      replies?:  {
        __typename: "ModelCommentConnection",
        items:  Array< {
          __typename: "Comment",
          id: string,
          slug: string,
          displayName: string,
          userId?: string | null,
          content: string,
          siteurl?: string | null,
          commentVotesId: string,
          votes:  {
            __typename: "Votes",
            id: string,
            upvoters?: Array< string | null > | null,
            downvoters?: Array< string | null > | null,
            owner?: string | null,
            createdAt: string,
            updatedAt: string,
          },
          replyTo?: string | null,
          replies?:  {
            __typename: "ModelCommentConnection",
            items:  Array< {
              __typename: "Comment",
              id: string,
              slug: string,
              displayName: string,
              userId?: string | null,
              content: string,
              siteurl?: string | null,
              commentVotesId: string,
              votes:  {
                __typename: "Votes",
                id: string,
                upvoters?: Array< string | null > | null,
                downvoters?: Array< string | null > | null,
                owner?: string | null,
                createdAt: string,
                updatedAt: string,
              },
              replyTo?: string | null,
              replies?:  {
                __typename: "ModelCommentConnection",
                items:  Array< {
                  __typename: "Comment",
                  id: string,
                  slug: string,
                  displayName: string,
                  userId?: string | null,
                  content: string,
                  siteurl?: string | null,
                  commentVotesId: string,
                  replyTo?: string | null,
                  createdAt: string,
                  updatedAt: string,
                  deletedAt?: string | null,
                  owner?: string | null,
                } | null >,
                nextToken?: string | null,
              } | null,
              createdAt: string,
              updatedAt: string,
              deletedAt?: string | null,
              owner?: string | null,
            } | null >,
            nextToken?: string | null,
          } | null,
          createdAt: string,
          updatedAt: string,
          deletedAt?: string | null,
          owner?: string | null,
        } | null >,
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      deletedAt?: string | null,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CommentsByReplyToAndUpdatedAtQueryVariables = {
  replyTo: string,
  updatedAt?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelCommentFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type CommentsByReplyToAndUpdatedAtQuery = {
  commentsByReplyToAndUpdatedAt?:  {
    __typename: "ModelCommentConnection",
    items:  Array< {
      __typename: "Comment",
      id: string,
      slug: string,
      displayName: string,
      userId?: string | null,
      content: string,
      siteurl?: string | null,
      commentVotesId: string,
      votes:  {
        __typename: "Votes",
        id: string,
        upvoters?: Array< string | null > | null,
        downvoters?: Array< string | null > | null,
        owner?: string | null,
        createdAt: string,
        updatedAt: string,
      },
      replyTo?: string | null,
      replies?:  {
        __typename: "ModelCommentConnection",
        items:  Array< {
          __typename: "Comment",
          id: string,
          slug: string,
          displayName: string,
          userId?: string | null,
          content: string,
          siteurl?: string | null,
          commentVotesId: string,
          votes:  {
            __typename: "Votes",
            id: string,
            upvoters?: Array< string | null > | null,
            downvoters?: Array< string | null > | null,
            owner?: string | null,
            createdAt: string,
            updatedAt: string,
          },
          replyTo?: string | null,
          replies?:  {
            __typename: "ModelCommentConnection",
            items:  Array< {
              __typename: "Comment",
              id: string,
              slug: string,
              displayName: string,
              userId?: string | null,
              content: string,
              siteurl?: string | null,
              commentVotesId: string,
              votes:  {
                __typename: "Votes",
                id: string,
                upvoters?: Array< string | null > | null,
                downvoters?: Array< string | null > | null,
                owner?: string | null,
                createdAt: string,
                updatedAt: string,
              },
              replyTo?: string | null,
              replies?:  {
                __typename: "ModelCommentConnection",
                items:  Array< {
                  __typename: "Comment",
                  id: string,
                  slug: string,
                  displayName: string,
                  userId?: string | null,
                  content: string,
                  siteurl?: string | null,
                  commentVotesId: string,
                  replyTo?: string | null,
                  createdAt: string,
                  updatedAt: string,
                  deletedAt?: string | null,
                  owner?: string | null,
                } | null >,
                nextToken?: string | null,
              } | null,
              createdAt: string,
              updatedAt: string,
              deletedAt?: string | null,
              owner?: string | null,
            } | null >,
            nextToken?: string | null,
          } | null,
          createdAt: string,
          updatedAt: string,
          deletedAt?: string | null,
          owner?: string | null,
        } | null >,
        nextToken?: string | null,
      } | null,
      createdAt: string,
      updatedAt: string,
      deletedAt?: string | null,
      owner?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateCommentSubscriptionVariables = {
  slug: string,
};

export type OnCreateCommentSubscription = {
  onCreateComment?:  {
    __typename: "Comment",
    id: string,
    slug: string,
    displayName: string,
    userId?: string | null,
    content: string,
    siteurl?: string | null,
    commentVotesId: string,
    votes:  {
      __typename: "Votes",
      id: string,
      upvoters?: Array< string | null > | null,
      downvoters?: Array< string | null > | null,
      owner?: string | null,
      createdAt: string,
      updatedAt: string,
    },
    replyTo?: string | null,
    replies?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        slug: string,
        displayName: string,
        userId?: string | null,
        content: string,
        siteurl?: string | null,
        commentVotesId: string,
        votes:  {
          __typename: "Votes",
          id: string,
          upvoters?: Array< string | null > | null,
          downvoters?: Array< string | null > | null,
          owner?: string | null,
          createdAt: string,
          updatedAt: string,
        },
        replyTo?: string | null,
        replies?:  {
          __typename: "ModelCommentConnection",
          items:  Array< {
            __typename: "Comment",
            id: string,
            slug: string,
            displayName: string,
            userId?: string | null,
            content: string,
            siteurl?: string | null,
            commentVotesId: string,
            votes:  {
              __typename: "Votes",
              id: string,
              upvoters?: Array< string | null > | null,
              downvoters?: Array< string | null > | null,
              owner?: string | null,
              createdAt: string,
              updatedAt: string,
            },
            replyTo?: string | null,
            replies?:  {
              __typename: "ModelCommentConnection",
              items:  Array< {
                __typename: "Comment",
                id: string,
                slug: string,
                displayName: string,
                userId?: string | null,
                content: string,
                siteurl?: string | null,
                commentVotesId: string,
                votes:  {
                  __typename: "Votes",
                  id: string,
                  upvoters?: Array< string | null > | null,
                  downvoters?: Array< string | null > | null,
                  owner?: string | null,
                  createdAt: string,
                  updatedAt: string,
                },
                replyTo?: string | null,
                replies?:  {
                  __typename: "ModelCommentConnection",
                  nextToken?: string | null,
                } | null,
                createdAt: string,
                updatedAt: string,
                deletedAt?: string | null,
                owner?: string | null,
              } | null >,
              nextToken?: string | null,
            } | null,
            createdAt: string,
            updatedAt: string,
            deletedAt?: string | null,
            owner?: string | null,
          } | null >,
          nextToken?: string | null,
        } | null,
        createdAt: string,
        updatedAt: string,
        deletedAt?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    deletedAt?: string | null,
    owner?: string | null,
  } | null,
};

export type OnUpdateCommentSubscriptionVariables = {
  slug: string,
};

export type OnUpdateCommentSubscription = {
  onUpdateComment?:  {
    __typename: "Comment",
    id: string,
    slug: string,
    displayName: string,
    userId?: string | null,
    content: string,
    siteurl?: string | null,
    commentVotesId: string,
    votes:  {
      __typename: "Votes",
      id: string,
      upvoters?: Array< string | null > | null,
      downvoters?: Array< string | null > | null,
      owner?: string | null,
      createdAt: string,
      updatedAt: string,
    },
    replyTo?: string | null,
    replies?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        slug: string,
        displayName: string,
        userId?: string | null,
        content: string,
        siteurl?: string | null,
        commentVotesId: string,
        votes:  {
          __typename: "Votes",
          id: string,
          upvoters?: Array< string | null > | null,
          downvoters?: Array< string | null > | null,
          owner?: string | null,
          createdAt: string,
          updatedAt: string,
        },
        replyTo?: string | null,
        replies?:  {
          __typename: "ModelCommentConnection",
          items:  Array< {
            __typename: "Comment",
            id: string,
            slug: string,
            displayName: string,
            userId?: string | null,
            content: string,
            siteurl?: string | null,
            commentVotesId: string,
            votes:  {
              __typename: "Votes",
              id: string,
              upvoters?: Array< string | null > | null,
              downvoters?: Array< string | null > | null,
              owner?: string | null,
              createdAt: string,
              updatedAt: string,
            },
            replyTo?: string | null,
            replies?:  {
              __typename: "ModelCommentConnection",
              items:  Array< {
                __typename: "Comment",
                id: string,
                slug: string,
                displayName: string,
                userId?: string | null,
                content: string,
                siteurl?: string | null,
                commentVotesId: string,
                votes:  {
                  __typename: "Votes",
                  id: string,
                  upvoters?: Array< string | null > | null,
                  downvoters?: Array< string | null > | null,
                  owner?: string | null,
                  createdAt: string,
                  updatedAt: string,
                },
                replyTo?: string | null,
                replies?:  {
                  __typename: "ModelCommentConnection",
                  nextToken?: string | null,
                } | null,
                createdAt: string,
                updatedAt: string,
                deletedAt?: string | null,
                owner?: string | null,
              } | null >,
              nextToken?: string | null,
            } | null,
            createdAt: string,
            updatedAt: string,
            deletedAt?: string | null,
            owner?: string | null,
          } | null >,
          nextToken?: string | null,
        } | null,
        createdAt: string,
        updatedAt: string,
        deletedAt?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    deletedAt?: string | null,
    owner?: string | null,
  } | null,
};

export type OnDeleteCommentSubscriptionVariables = {
  slug: string,
};

export type OnDeleteCommentSubscription = {
  onDeleteComment?:  {
    __typename: "Comment",
    id: string,
    slug: string,
    displayName: string,
    userId?: string | null,
    content: string,
    siteurl?: string | null,
    commentVotesId: string,
    votes:  {
      __typename: "Votes",
      id: string,
      upvoters?: Array< string | null > | null,
      downvoters?: Array< string | null > | null,
      owner?: string | null,
      createdAt: string,
      updatedAt: string,
    },
    replyTo?: string | null,
    replies?:  {
      __typename: "ModelCommentConnection",
      items:  Array< {
        __typename: "Comment",
        id: string,
        slug: string,
        displayName: string,
        userId?: string | null,
        content: string,
        siteurl?: string | null,
        commentVotesId: string,
        votes:  {
          __typename: "Votes",
          id: string,
          upvoters?: Array< string | null > | null,
          downvoters?: Array< string | null > | null,
          owner?: string | null,
          createdAt: string,
          updatedAt: string,
        },
        replyTo?: string | null,
        replies?:  {
          __typename: "ModelCommentConnection",
          items:  Array< {
            __typename: "Comment",
            id: string,
            slug: string,
            displayName: string,
            userId?: string | null,
            content: string,
            siteurl?: string | null,
            commentVotesId: string,
            votes:  {
              __typename: "Votes",
              id: string,
              upvoters?: Array< string | null > | null,
              downvoters?: Array< string | null > | null,
              owner?: string | null,
              createdAt: string,
              updatedAt: string,
            },
            replyTo?: string | null,
            replies?:  {
              __typename: "ModelCommentConnection",
              items:  Array< {
                __typename: "Comment",
                id: string,
                slug: string,
                displayName: string,
                userId?: string | null,
                content: string,
                siteurl?: string | null,
                commentVotesId: string,
                votes:  {
                  __typename: "Votes",
                  id: string,
                  upvoters?: Array< string | null > | null,
                  downvoters?: Array< string | null > | null,
                  owner?: string | null,
                  createdAt: string,
                  updatedAt: string,
                },
                replyTo?: string | null,
                replies?:  {
                  __typename: "ModelCommentConnection",
                  nextToken?: string | null,
                } | null,
                createdAt: string,
                updatedAt: string,
                deletedAt?: string | null,
                owner?: string | null,
              } | null >,
              nextToken?: string | null,
            } | null,
            createdAt: string,
            updatedAt: string,
            deletedAt?: string | null,
            owner?: string | null,
          } | null >,
          nextToken?: string | null,
        } | null,
        createdAt: string,
        updatedAt: string,
        deletedAt?: string | null,
        owner?: string | null,
      } | null >,
      nextToken?: string | null,
    } | null,
    createdAt: string,
    updatedAt: string,
    deletedAt?: string | null,
    owner?: string | null,
  } | null,
};
