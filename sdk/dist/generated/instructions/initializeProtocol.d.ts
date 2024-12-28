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
 * @category InitializeProtocol
 * @category generated
 */
export type InitializeProtocolInstructionArgs = {
    fee: beet.bignum;
};
/**
 * @category Instructions
 * @category InitializeProtocol
 * @category generated
 */
export declare const initializeProtocolStruct: beet.BeetArgsStruct<InitializeProtocolInstructionArgs & {
    instructionDiscriminator: number[];
}>;
/**
 * Accounts required by the _initializeProtocol_ instruction
 *
 * @property [_writable_, **signer**] admin
 * @property [_writable_] hourglassProtocol
 * @property [_writable_] feeSettlementToken
 * @property [_writable_] feeCollector
 * @category Instructions
 * @category InitializeProtocol
 * @category generated
 */
export type InitializeProtocolInstructionAccounts = {
    admin: web3.PublicKey;
    hourglassProtocol: web3.PublicKey;
    feeSettlementToken: web3.PublicKey;
    feeCollector: web3.PublicKey;
    systemProgram?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};
export declare const initializeProtocolInstructionDiscriminator: number[];
/**
 * Creates a _InitializeProtocol_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category InitializeProtocol
 * @category generated
 */
export declare function createInitializeProtocolInstruction(accounts: InitializeProtocolInstructionAccounts, args: InitializeProtocolInstructionArgs, programId?: web3.PublicKey): web3.TransactionInstruction;
