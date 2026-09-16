// slug 単位で subscription を配信するための AppSync JS リゾルバ（onCreate/onUpdate/onDeleteComment 共通）
import { util, extensions } from '@aws-appsync/utils'

export function request() {
  return { payload: null }
}

export function response(ctx) {
  const filter = { slug: { eq: ctx.args.slug } }
  extensions.setSubscriptionFilter(util.transform.toSubscriptionFilter(filter))
  return null
}
