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
 * @category PayTax
 * @category generated
 */
export type PayTaxInstructionArgs = {
  hourglassId: beet.bignum
}
/**
 * @category Instructions
 * @category PayTax
 * @category generated
 */
export const payTaxStruct = new beet.BeetArgsStruct<
  PayTaxInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['hourglassId', beet.u64],
  ],
  'PayTaxInstructionArgs'
)
/**
 * Accounts required by the _payTax_ instruction
 *
 * @property [_writable_, **signer**] user
 * @property [_writable_] hourglassAssociatedAccount
 * @property [_writable_] userTaxAccount
 * @property [_writable_] userNextTaxAccount
 * @property [_writable_] currentThread
 * @property [_writable_] hourglassMint
 * @property [_writable_] hourglassVault
 * @property [_writable_] userHourglassAta
 * @property [_writable_] creatorHourglassAccount
 * @property [_writable_] creator
 * @property [] clockworkProgram
 * @category Instructions
 * @category PayTax
 * @category generated
 */
export type PayTaxInstructionAccounts = {
  user: web3.PublicKey
  hourglassAssociatedAccount: web3.PublicKey
  userTaxAccount: web3.PublicKey
  userNextTaxAccount: web3.PublicKey
  currentThread: web3.PublicKey
  hourglassMint: web3.PublicKey
  hourglassVault: web3.PublicKey
  userHourglassAta: web3.PublicKey
  creatorHourglassAccount: web3.PublicKey
  creator: web3.PublicKey
  tokenProgram?: web3.PublicKey
  systemProgram?: web3.PublicKey
  clockworkProgram: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const payTaxInstructionDiscriminator = [51, 5, 236, 118, 42, 113, 61, 53]

/**
 * Creates a _PayTax_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category PayTax
 * @category generated
 */
export function createPayTaxInstruction(
  accounts: PayTaxInstructionAccounts,
  args: PayTaxInstructionArgs,
  programId = new web3.PublicKey('83PYe3dvbceG6KH98pewdyxLfhLFTHQUc8sjJXiKAcij')
) {
  const [data] = payTaxStruct.serialize({
    instructionDiscriminator: payTaxInstructionDiscriminator,
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
      pubkey: accounts.userTaxAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.userNextTaxAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.currentThread,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.hourglassMint,
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
      pubkey: accounts.creatorHourglassAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.creator,
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
