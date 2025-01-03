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
 * Arguments used to create {@link HourglassAuction}
 * @category Accounts
 * @category generated
 */
export type HourglassAuctionArgs = {
  index: beet.bignum
  hourglassId: beet.bignum
  claimed: boolean
  started: beet.bignum
  ended: beet.bignum
  currentTopBid: beet.bignum
  currentWinner: web3.PublicKey
}

export const hourglassAuctionDiscriminator = [
  162, 209, 159, 35, 43, 46, 89, 254,
]
/**
 * Holds the data for the {@link HourglassAuction} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class HourglassAuction implements HourglassAuctionArgs {
  private constructor(
    readonly index: beet.bignum,
    readonly hourglassId: beet.bignum,
    readonly claimed: boolean,
    readonly started: beet.bignum,
    readonly ended: beet.bignum,
    readonly currentTopBid: beet.bignum,
    readonly currentWinner: web3.PublicKey
  ) {}

  /**
   * Creates a {@link HourglassAuction} instance from the provided args.
   */
  static fromArgs(args: HourglassAuctionArgs) {
    return new HourglassAuction(
      args.index,
      args.hourglassId,
      args.claimed,
      args.started,
      args.ended,
      args.currentTopBid,
      args.currentWinner
    )
  }

  /**
   * Deserializes the {@link HourglassAuction} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [HourglassAuction, number] {
    return HourglassAuction.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link HourglassAuction} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<HourglassAuction> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find HourglassAuction account at ${address}`)
    }
    return HourglassAuction.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'HEwZhZFUgMAxHe5uP1jVRGKhNxdD7qZsoiypyifGrNq6'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, hourglassAuctionBeet)
  }

  /**
   * Deserializes the {@link HourglassAuction} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [HourglassAuction, number] {
    return hourglassAuctionBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link HourglassAuction} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return hourglassAuctionBeet.serialize({
      accountDiscriminator: hourglassAuctionDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link HourglassAuction}
   */
  static get byteSize() {
    return hourglassAuctionBeet.byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link HourglassAuction} data from rent
   *
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      HourglassAuction.byteSize,
      commitment
    )
  }

  /**
   * Determines if the provided {@link Buffer} has the correct byte size to
   * hold {@link HourglassAuction} data.
   */
  static hasCorrectByteSize(buf: Buffer, offset = 0) {
    return buf.byteLength - offset === HourglassAuction.byteSize
  }

  /**
   * Returns a readable version of {@link HourglassAuction} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      index: (() => {
        const x = <{ toNumber: () => number }>this.index
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      hourglassId: (() => {
        const x = <{ toNumber: () => number }>this.hourglassId
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      claimed: this.claimed,
      started: (() => {
        const x = <{ toNumber: () => number }>this.started
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      ended: (() => {
        const x = <{ toNumber: () => number }>this.ended
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      currentTopBid: (() => {
        const x = <{ toNumber: () => number }>this.currentTopBid
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      currentWinner: this.currentWinner.toBase58(),
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const hourglassAuctionBeet = new beet.BeetStruct<
  HourglassAuction,
  HourglassAuctionArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['index', beet.u64],
    ['hourglassId', beet.u64],
    ['claimed', beet.bool],
    ['started', beet.u64],
    ['ended', beet.u64],
    ['currentTopBid', beet.u64],
    ['currentWinner', beetSolana.publicKey],
  ],
  HourglassAuction.fromArgs,
  'HourglassAuction'
)
