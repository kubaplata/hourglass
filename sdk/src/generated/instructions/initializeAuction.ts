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
 * @category InitializeAuction
 * @category generated
 */
export type InitializeAuctionInstructionArgs = {
  hourglassId: beet.bignum
}
/**
 * @category Instructions
 * @category InitializeAuction
 * @category generated
 */
export const initializeAuctionStruct = new beet.BeetArgsStruct<
  InitializeAuctionInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['hourglassId', beet.u64],
  ],
  'InitializeAuctionInstructionArgs'
)
/**
 * Accounts required by the _initializeAuction_ instruction
 *
 * @property [_writable_, **signer**] creator
 * @property [_writable_] hourglassAssociatedAccount
 * @property [_writable_] hourglassMint
 * @property [_writable_] hourglassVault
 * @property [_writable_] hourglassAuction
 * @category Instructions
 * @category InitializeAuction
 * @category generated
 */
export type InitializeAuctionInstructionAccounts = {
  creator: web3.PublicKey
  hourglassAssociatedAccount: web3.PublicKey
  hourglassMint: web3.PublicKey
  hourglassVault: web3.PublicKey
  hourglassAuction: web3.PublicKey
  tokenProgram?: web3.PublicKey
  systemProgram?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const initializeAuctionInstructionDiscriminator = [
  37, 10, 117, 197, 208, 88, 117, 62,
]

/**
 * Creates a _InitializeAuction_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitializeAuction
 * @category generated
 */
export function createInitializeAuctionInstruction(
  accounts: InitializeAuctionInstructionAccounts,
  args: InitializeAuctionInstructionArgs,
  programId = new web3.PublicKey('HEwZhZFUgMAxHe5uP1jVRGKhNxdD7qZsoiypyifGrNq6')
) {
  const [data] = initializeAuctionStruct.serialize({
    instructionDiscriminator: initializeAuctionInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.creator,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.hourglassAssociatedAccount,
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
      pubkey: accounts.hourglassAuction,
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
