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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hourglassAuctionBeet = exports.HourglassAuction = exports.hourglassAuctionDiscriminator = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
exports.hourglassAuctionDiscriminator = [
    162, 209, 159, 35, 43, 46, 89, 254,
];
/**
 * Holds the data for the {@link HourglassAuction} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
class HourglassAuction {
    constructor(index, hourglassId, claimed, started, ended, currentTopBid, currentWinner) {
        this.index = index;
        this.hourglassId = hourglassId;
        this.claimed = claimed;
        this.started = started;
        this.ended = ended;
        this.currentTopBid = currentTopBid;
        this.currentWinner = currentWinner;
    }
    /**
     * Creates a {@link HourglassAuction} instance from the provided args.
     */
    static fromArgs(args) {
        return new HourglassAuction(args.index, args.hourglassId, args.claimed, args.started, args.ended, args.currentTopBid, args.currentWinner);
    }
    /**
     * Deserializes the {@link HourglassAuction} from the data of the provided {@link web3.AccountInfo}.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static fromAccountInfo(accountInfo, offset = 0) {
        return HourglassAuction.deserialize(accountInfo.data, offset);
    }
    /**
     * Retrieves the account info from the provided address and deserializes
     * the {@link HourglassAuction} from its data.
     *
     * @throws Error if no account info is found at the address or if deserialization fails
     */
    static fromAccountAddress(connection, address, commitmentOrConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountInfo = yield connection.getAccountInfo(address, commitmentOrConfig);
            if (accountInfo == null) {
                throw new Error(`Unable to find HourglassAuction account at ${address}`);
            }
            return HourglassAuction.fromAccountInfo(accountInfo, 0)[0];
        });
    }
    /**
     * Provides a {@link web3.Connection.getProgramAccounts} config builder,
     * to fetch accounts matching filters that can be specified via that builder.
     *
     * @param programId - the program that owns the accounts we are filtering
     */
    static gpaBuilder(programId = new web3.PublicKey('HEwZhZFUgMAxHe5uP1jVRGKhNxdD7qZsoiypyifGrNq6')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.hourglassAuctionBeet);
    }
    /**
     * Deserializes the {@link HourglassAuction} from the provided data Buffer.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static deserialize(buf, offset = 0) {
        return exports.hourglassAuctionBeet.deserialize(buf, offset);
    }
    /**
     * Serializes the {@link HourglassAuction} into a Buffer.
     * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
     */
    serialize() {
        return exports.hourglassAuctionBeet.serialize(Object.assign({ accountDiscriminator: exports.hourglassAuctionDiscriminator }, this));
    }
    /**
     * Returns the byteSize of a {@link Buffer} holding the serialized data of
     * {@link HourglassAuction}
     */
    static get byteSize() {
        return exports.hourglassAuctionBeet.byteSize;
    }
    /**
     * Fetches the minimum balance needed to exempt an account holding
     * {@link HourglassAuction} data from rent
     *
     * @param connection used to retrieve the rent exemption information
     */
    static getMinimumBalanceForRentExemption(connection, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            return connection.getMinimumBalanceForRentExemption(HourglassAuction.byteSize, commitment);
        });
    }
    /**
     * Determines if the provided {@link Buffer} has the correct byte size to
     * hold {@link HourglassAuction} data.
     */
    static hasCorrectByteSize(buf, offset = 0) {
        return buf.byteLength - offset === HourglassAuction.byteSize;
    }
    /**
     * Returns a readable version of {@link HourglassAuction} properties
     * and can be used to convert to JSON and/or logging
     */
    pretty() {
        return {
            index: (() => {
                const x = this.index;
                if (typeof x.toNumber === 'function') {
                    try {
                        return x.toNumber();
                    }
                    catch (_) {
                        return x;
                    }
                }
                return x;
            })(),
            hourglassId: (() => {
                const x = this.hourglassId;
                if (typeof x.toNumber === 'function') {
                    try {
                        return x.toNumber();
                    }
                    catch (_) {
                        return x;
                    }
                }
                return x;
            })(),
            claimed: this.claimed,
            started: (() => {
                const x = this.started;
                if (typeof x.toNumber === 'function') {
                    try {
                        return x.toNumber();
                    }
                    catch (_) {
                        return x;
                    }
                }
                return x;
            })(),
            ended: (() => {
                const x = this.ended;
                if (typeof x.toNumber === 'function') {
                    try {
                        return x.toNumber();
                    }
                    catch (_) {
                        return x;
                    }
                }
                return x;
            })(),
            currentTopBid: (() => {
                const x = this.currentTopBid;
                if (typeof x.toNumber === 'function') {
                    try {
                        return x.toNumber();
                    }
                    catch (_) {
                        return x;
                    }
                }
                return x;
            })(),
            currentWinner: this.currentWinner.toBase58(),
        };
    }
}
exports.HourglassAuction = HourglassAuction;
/**
 * @category Accounts
 * @category generated
 */
exports.hourglassAuctionBeet = new beet.BeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['index', beet.u64],
    ['hourglassId', beet.u64],
    ['claimed', beet.bool],
    ['started', beet.u64],
    ['ended', beet.u64],
    ['currentTopBid', beet.u64],
    ['currentWinner', beetSolana.publicKey],
], HourglassAuction.fromArgs, 'HourglassAuction');
