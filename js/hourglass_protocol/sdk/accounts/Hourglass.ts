/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * Arguments used to create {@link Hourglass}
 * @category Accounts
 * @category generated
 */
export type HourglassArgs = {
  admin: web3.PublicKey
  feeSettlementToken: web3.PublicKey
  feeCollector: web3.PublicKey
  fee: beet.bignum
  totalHourglasses: beet.bignum
}

export const hourglassDiscriminator = [28, 165, 183, 62, 195, 115, 219, 182]
/**
 * Holds the data for the {@link Hourglass} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class Hourglass implements HourglassArgs {
  private constructor(
    readonly admin: web3.PublicKey,
    readonly feeSettlementToken: web3.PublicKey,
    readonly feeCollector: web3.PublicKey,
    readonly fee: beet.bignum,
    readonly totalHourglasses: beet.bignum
  ) {}

  /**
   * Creates a {@link Hourglass} instance from the provided args.
   */
  static fromArgs(args: HourglassArgs) {
    return new Hourglass(
      args.admin,
      args.feeSettlementToken,
      args.feeCollector,
      args.fee,
      args.totalHourglasses
    )
  }

  /**
   * Deserializes the {@link Hourglass} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [Hourglass, number] {
    return Hourglass.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link Hourglass} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<Hourglass> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find Hourglass account at ${address}`)
    }
    return Hourglass.fromAccountInfo(accountInfo, 0)[0]
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
    return beetSolana.GpaBuilder.fromStruct(programId, hourglassBeet)
  }

  /**
   * Deserializes the {@link Hourglass} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [Hourglass, number] {
    return hourglassBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link Hourglass} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return hourglassBeet.serialize({
      accountDiscriminator: hourglassDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link Hourglass}
   */
  static get byteSize() {
    return hourglassBeet.byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link Hourglass} data from rent
   *
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      Hourglass.byteSize,
      commitment
    )
  }

  /**
   * Determines if the provided {@link Buffer} has the correct byte size to
   * hold {@link Hourglass} data.
   */
  static hasCorrectByteSize(buf: Buffer, offset = 0) {
    return buf.byteLength - offset === Hourglass.byteSize
  }

  /**
   * Returns a readable version of {@link Hourglass} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      admin: this.admin.toBase58(),
      feeSettlementToken: this.feeSettlementToken.toBase58(),
      feeCollector: this.feeCollector.toBase58(),
      fee: (() => {
        const x = <{ toNumber: () => number }>this.fee
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      totalHourglasses: (() => {
        const x = <{ toNumber: () => number }>this.totalHourglasses
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const hourglassBeet = new beet.BeetStruct<
  Hourglass,
  HourglassArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['admin', beetSolana.publicKey],
    ['feeSettlementToken', beetSolana.publicKey],
    ['feeCollector', beetSolana.publicKey],
    ['fee', beet.u64],
    ['totalHourglasses', beet.u64],
  ],
  Hourglass.fromArgs,
  'Hourglass'
)
