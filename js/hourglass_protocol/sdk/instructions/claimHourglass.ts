/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category ClaimHourglass
 * @category generated
 */
export type ClaimHourglassInstructionArgs = {
  hourglassId: beet.bignum
  auctionId: beet.bignum
  instantSellPrice: beet.bignum
}
/**
 * @category Instructions
 * @category ClaimHourglass
 * @category generated
 */
export const claimHourglassStruct = new beet.BeetArgsStruct<
  ClaimHourglassInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['hourglassId', beet.u64],
    ['auctionId', beet.u64],
    ['instantSellPrice', beet.u64],
  ],
  'ClaimHourglassInstructionArgs'
)
/**
 * Accounts required by the _claimHourglass_ instruction
 *
 * @property [_writable_, **signer**] user
 * @property [_writable_] creator
 * @property [_writable_] hourglassAssociatedAccount
 * @property [_writable_] hourglassCreatorAccount
 * @property [_writable_] hourglassAuction
 * @property [_writable_] userAuctionAccount
 * @property [_writable_] hourglassMint
 * @property [_writable_] userTaxAccount
 * @property [_writable_] hourglassVault
 * @property [_writable_] userHourglassAta
 * @property [_writable_] thread
 * @property [] clockworkProgram
 * @category Instructions
 * @category ClaimHourglass
 * @category generated
 */
export type ClaimHourglassInstructionAccounts = {
  user: web3.PublicKey
  creator: web3.PublicKey
  hourglassAssociatedAccount: web3.PublicKey
  hourglassCreatorAccount: web3.PublicKey
  hourglassAuction: web3.PublicKey
  userAuctionAccount: web3.PublicKey
  hourglassMint: web3.PublicKey
  userTaxAccount: web3.PublicKey
  hourglassVault: web3.PublicKey
  userHourglassAta: web3.PublicKey
  thread: web3.PublicKey
  tokenProgram?: web3.PublicKey
  systemProgram?: web3.PublicKey
  clockworkProgram: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const claimHourglassInstructionDiscriminator = [
  125, 128, 120, 86, 28, 61, 228, 90,
]

/**
 * Creates a _ClaimHourglass_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category ClaimHourglass
 * @category generated
 */
export function createClaimHourglassInstruction(
  accounts: ClaimHourglassInstructionAccounts,
  args: ClaimHourglassInstructionArgs,
  programId = new web3.PublicKey('83PYe3dvbceG6KH98pewdyxLfhLFTHQUc8sjJXiKAcij')
) {
  const [data] = claimHourglassStruct.serialize({
    instructionDiscriminator: claimHourglassInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.user,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.creator,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.hourglassAssociatedAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.hourglassCreatorAccount,
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
      pubkey: accounts.hourglassMint,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.userTaxAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.hourglassVault,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.userHourglassAta,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.thread,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.clockworkProgram,
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
