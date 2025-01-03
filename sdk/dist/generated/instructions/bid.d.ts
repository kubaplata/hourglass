/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
import * as beet from '@metaplex-foundation/beet';
import * as web3 from '@solana/web3.js';
/**
 * @category Instructions
 * @category Bid
 * @category generated
 */
export type BidInstructionArgs = {
    hourglassId: beet.bignum;
    auctionId: beet.bignum;
    bid: beet.bignum;
};
/**
 * @category Instructions
 * @category Bid
 * @category generated
 */
export declare const bidStruct: beet.BeetArgsStruct<BidInstructionArgs & {
    instructionDiscriminator: number[];
}>;
/**
 * Accounts required by the _bid_ instruction
 *
 * @property [_writable_, **signer**] user
 * @property [_writable_] hourglassAssociatedAccount
 * @property [_writable_] hourglassAuction
 * @property [_writable_] userAuctionAccount
 * @category Instructions
 * @category Bid
 * @category generated
 */
export type BidInstructionAccounts = {
    user: web3.PublicKey;
    hourglassAssociatedAccount: web3.PublicKey;
    hourglassAuction: web3.PublicKey;
    userAuctionAccount: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const bidInstructionDiscriminator: number[];
/**
 * Creates a _Bid_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category Bid
 * @category generated
 */
export declare function createBidInstruction(accounts: BidInstructionAccounts, args: BidInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
