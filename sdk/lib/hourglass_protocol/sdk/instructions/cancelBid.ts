/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category CancelBid
 * @category generated
 */
export type CancelBidInstructionArgs = {
  hourglassId: beet.bignum
  auctionId: beet.bignum
}
/**
 * @category Instructions
 * @category CancelBid
 * @category generated
 */
export const cancelBidStruct = new beet.BeetArgsStruct<
  CancelBidInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['hourglassId', beet.u64],
    ['auctionId', beet.u64],
  ],
  'CancelBidInstructionArgs'
)
/**
 * Accounts required by the _cancelBid_ instruction
 *
 * @property [_writable_, **signer**] user
 * @property [_writable_] hourglassAssociatedAccount
 * @property [_writable_] hourglassAuction
 * @property [_writable_] userAuctionAccount
 * @category Instructions
 * @category CancelBid
 * @category generated
 */
export type CancelBidInstructionAccounts = {
  user: web3.PublicKey
  hourglassAssociatedAccount: web3.PublicKey
  hourglassAuction: web3.PublicKey
  userAuctionAccount: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const cancelBidInstructionDiscriminator = [
  40, 243, 190, 217, 208, 253, 86, 206,
]

/**
 * Creates a _CancelBid_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CancelBid
 * @category generated
 */
export function createCancelBidInstruction(
  accounts: CancelBidInstructionAccounts,
  args: CancelBidInstructionArgs,
  programId = new web3.PublicKey('83PYe3dvbceG6KH98pewdyxLfhLFTHQUc8sjJXiKAcij')
) {
  const [data] = cancelBidStruct.serialize({
    instructionDiscriminator: cancelBidInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.user,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.hourglassAssociatedAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.hourglassAuction,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.userAuctionAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
