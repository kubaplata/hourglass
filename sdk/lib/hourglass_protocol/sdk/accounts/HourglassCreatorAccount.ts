/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * Arguments used to create {@link HourglassCreatorAccount}
 * @category Accounts
 * @category generated
 */
export type HourglassCreatorAccountArgs = {
  totalEarned: beet.bignum
  toWithdraw: beet.bignum
  created: web3.PublicKey[]
  withdrawalAccount: web3.PublicKey
}

export const hourglassCreatorAccountDiscriminator = [
  54, 84, 12, 231, 35, 92, 175, 10,
]
/**
 * Holds the data for the {@link HourglassCreatorAccount} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class HourglassCreatorAccount implements HourglassCreatorAccountArgs {
  private constructor(
    readonly totalEarned: beet.bignum,
    readonly toWithdraw: beet.bignum,
    readonly created: web3.PublicKey[],
    readonly withdrawalAccount: web3.PublicKey
  ) {}

  /**
   * Creates a {@link HourglassCreatorAccount} instance from the provided args.
   */
  static fromArgs(args: HourglassCreatorAccountArgs) {
    return new HourglassCreatorAccount(
      args.totalEarned,
      args.toWithdraw,
      args.created,
      args.withdrawalAccount
    )
  }

  /**
   * Deserializes the {@link HourglassCreatorAccount} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [HourglassCreatorAccount, number] {
    return HourglassCreatorAccount.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link HourglassCreatorAccount} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<HourglassCreatorAccount> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(
        `Unable to find HourglassCreatorAccount account at ${address}`
      )
    }
    return HourglassCreatorAccount.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      '83PYe3dvbceG6KH98pewdyxLfhLFTHQUc8sjJXiKAcij'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(
      programId,
      hourglassCreatorAccountBeet
    )
  }

  /**
   * Deserializes the {@link HourglassCreatorAccount} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(
    buf: Buffer,
    offset = 0
  ): [HourglassCreatorAccount, number] {
    return hourglassCreatorAccountBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link HourglassCreatorAccount} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return hourglassCreatorAccountBeet.serialize({
      accountDiscriminator: hourglassCreatorAccountDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link HourglassCreatorAccount} for the provided args.
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   */
  static byteSize(args: HourglassCreatorAccountArgs) {
    const instance = HourglassCreatorAccount.fromArgs(args)
    return hourglassCreatorAccountBeet.toFixedFromValue({
      accountDiscriminator: hourglassCreatorAccountDiscriminator,
      ...instance,
    }).byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link HourglassCreatorAccount} data from rent
   *
   * @param args need to be provided since the byte size for this account
   * depends on them
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    args: HourglassCreatorAccountArgs,
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      HourglassCreatorAccount.byteSize(args),
      commitment
    )
  }

  /**
   * Returns a readable version of {@link HourglassCreatorAccount} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      totalEarned: (() => {
        const x = <{ toNumber: () => number }>this.totalEarned
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      toWithdraw: (() => {
        const x = <{ toNumber: () => number }>this.toWithdraw
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      created: this.created,
      withdrawalAccount: this.withdrawalAccount.toBase58(),
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const hourglassCreatorAccountBeet = new beet.FixableBeetStruct<
  HourglassCreatorAccount,
  HourglassCreatorAccountArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['totalEarned', beet.u64],
    ['toWithdraw', beet.u64],
    ['created', beet.array(beetSolana.publicKey)],
    ['withdrawalAccount', beetSolana.publicKey],
  ],
  HourglassCreatorAccount.fromArgs,
  'HourglassCreatorAccount'
)
