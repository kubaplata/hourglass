export * from './Hourglass'
export * from './HourglassAssociatedAccount'
export * from './HourglassAuction'
export * from './HourglassCreatorAccount'
export * from './Message'
export * from './UserAuctionAccount'
export * from './UserTaxAccount'

import { HourglassAssociatedAccount } from './HourglassAssociatedAccount'
import { HourglassAuction } from './HourglassAuction'
import { HourglassCreatorAccount } from './HourglassCreatorAccount'
import { Hourglass } from './Hourglass'
import { Message } from './Message'
import { UserAuctionAccount } from './UserAuctionAccount'
import { UserTaxAccount } from './UserTaxAccount'

export const accountProviders = {
  HourglassAssociatedAccount,
  HourglassAuction,
  HourglassCreatorAccount,
  Hourglass,
  Message,
  UserAuctionAccount,
  UserTaxAccount,
}
