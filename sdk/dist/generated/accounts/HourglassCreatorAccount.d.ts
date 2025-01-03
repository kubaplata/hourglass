/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
import * as web3 from '@solana/web3.js';
import * as beet from '@metaplex-foundation/beet';
import * as beetSolana from '@metaplex-foundation/beet-solana';
/**
 * Arguments used to create {@link HourglassCreatorAccount}
 * @category Accounts
 * @category generated
 */
export type HourglassCreatorAccountArgs = {
    creator: web3.PublicKey;
    totalEarned: beet.bignum;
    toWithdraw: beet.bignum;
    hourglasses: beet.bignum[];
};
export declare const hourglassCreatorAccountDiscriminator: number[];
/**
 * Holds the data for the {@link HourglassCreatorAccount} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export declare class HourglassCreatorAccount implements HourglassCreatorAccountArgs {
    readonly creator: web3.PublicKey;
    readonly totalEarned: beet.bignum;
    readonly toWithdraw: beet.bignum;
    readonly hourglasses: beet.bignum[];
    private constructor();
    /**
     * Creates a {@link HourglassCreatorAccount} instance from the provided args.
     */
    static fromArgs(args: HourglassCreatorAccountArgs): HourglassCreatorAccount;
    /**
     * Deserializes the {@link HourglassCreatorAccount} from the data of the provided {@link web3.AccountInfo}.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static fromAccountInfo(accountInfo: web3.AccountInfo<Buffer>, offset?: number): [HourglassCreatorAccount, number];
    /**
     * Retrieves the account info from the provided address and deserializes
     * the {@link HourglassCreatorAccount} from its data.
     *
     * @throws Error if no account info is found at the address or if deserialization fails
     */
    static fromAccountAddress(connection: web3.Connection, address: web3.PublicKey, commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig): Promise<HourglassCreatorAccount>;
    /**
     * Provides a {@link web3.Connection.getProgramAccounts} config builder,
     * to fetch accounts matching filters that can be specified via that builder.
     *
     * @param programId - the program that owns the accounts we are filtering
     */
    static gpaBuilder(programId?: web3.PublicKey): beetSolana.GpaBuilder<HourglassCreatorAccountArgs & {
        accountDiscriminator: number[];
    }>;
    /**
     * Deserializes the {@link HourglassCreatorAccount} from the provided data Buffer.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static deserialize(buf: Buffer, offset?: number): [HourglassCreatorAccount, number];
    /**
     * Serializes the {@link HourglassCreatorAccount} into a Buffer.
     * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
     */
    serialize(): [Buffer, number];
    /**
     * Returns the byteSize of a {@link Buffer} holding the serialized data of
     * {@link HourglassCreatorAccount} for the provided args.
     *
     * @param args need to be provided since the byte size for this account
     * depends on them
     */
    static byteSize(args: HourglassCreatorAccountArgs): number;
    /**
     * Fetches the minimum balance needed to exempt an account holding
     * {@link HourglassCreatorAccount} data from rent
     *
     * @param args need to be provided since the byte size for this account
     * depends on them
     * @param connection used to retrieve the rent exemption information
     */
    static getMinimumBalanceForRentExemption(args: HourglassCreatorAccountArgs, connection: web3.Connection, commitment?: web3.Commitment): Promise<number>;
    /**
     * Returns a readable version of {@link HourglassCreatorAccount} properties
     * and can be used to convert to JSON and/or logging
     */
    pretty(): {
        creator: string;
        totalEarned: number | {
            toNumber: () => number;
        };
        toWithdraw: number | {
            toNumber: () => number;
        };
        hourglasses: beet.bignum[];
    };
}
/**
 * @category Accounts
 * @category generated
 */
export declare const hourglassCreatorAccountBeet: beet.FixableBeetStruct<HourglassCreatorAccount, HourglassCreatorAccountArgs & {
    accountDiscriminator: number[];
}>;
