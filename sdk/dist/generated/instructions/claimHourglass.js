"use strict";
/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.claimHourglassInstructionDiscriminator = exports.claimHourglassStruct = void 0;
exports.createClaimHourglassInstruction = createClaimHourglassInstruction;
const splToken = __importStar(require("@solana/spl-token"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
/**
 * @category Instructions
 * @category ClaimHourglass
 * @category generated
 */
exports.claimHourglassStruct = new beet.BeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['hourglassId', beet.u64],
    ['auctionId', beet.u64],
    ['instantSellPrice', beet.u64],
], 'ClaimHourglassInstructionArgs');
exports.claimHourglassInstructionDiscriminator = [
    125, 128, 120, 86, 28, 61, 228, 90,
];
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
function createClaimHourglassInstruction(accounts, args, programId = new web3.PublicKey('83PYe3dvbceG6KH98pewdyxLfhLFTHQUc8sjJXiKAcij')) {
    var _a, _b;
    const [data] = exports.claimHourglassStruct.serialize(Object.assign({ instructionDiscriminator: exports.claimHourglassInstructionDiscriminator }, args));
    const keys = [
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
            pubkey: (_a = accounts.tokenProgram) !== null && _a !== void 0 ? _a : splToken.TOKEN_PROGRAM_ID,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: (_b = accounts.systemProgram) !== null && _b !== void 0 ? _b : web3.SystemProgram.programId,
            isWritable: false,
            isSigner: false,
        },
    ];
    if (accounts.anchorRemainingAccounts != null) {
        for (const acc of accounts.anchorRemainingAccounts) {
            keys.push(acc);
        }
    }
    const ix = new web3.TransactionInstruction({
        programId,
        keys,
        data,
    });
    return ix;
}