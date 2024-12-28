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
exports.hourglassAssociatedAccountBeet = exports.HourglassAssociatedAccount = exports.hourglassAssociatedAccountDiscriminator = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
exports.hourglassAssociatedAccountDiscriminator = [
    244, 98, 244, 176, 83, 46, 242, 63,
];
/**
 * Holds the data for the {@link HourglassAssociatedAccount} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
class HourglassAssociatedAccount {
    constructor(service /* size: 8 */, isPublic, auctionLength, ownershipPeriod, gracePeriod, minimumSalePrice, minimumBid, taxRate, hourglass, creator, nextAuctionId, currentOwner, currentPrice, ownedTill, graceTill, ownershipPeriodIndex, royalties, messageId) {
        this.service = service;
        this.isPublic = isPublic;
        this.auctionLength = auctionLength;
        this.ownershipPeriod = ownershipPeriod;
        this.gracePeriod = gracePeriod;
        this.minimumSalePrice = minimumSalePrice;
        this.minimumBid = minimumBid;
        this.taxRate = taxRate;
        this.hourglass = hourglass;
        this.creator = creator;
        this.nextAuctionId = nextAuctionId;
        this.currentOwner = currentOwner;
        this.currentPrice = currentPrice;
        this.ownedTill = ownedTill;
        this.graceTill = graceTill;
        this.ownershipPeriodIndex = ownershipPeriodIndex;
        this.royalties = royalties;
        this.messageId = messageId;
    }
    /**
     * Creates a {@link HourglassAssociatedAccount} instance from the provided args.
     */
    static fromArgs(args) {
        return new HourglassAssociatedAccount(args.service, args.isPublic, args.auctionLength, args.ownershipPeriod, args.gracePeriod, args.minimumSalePrice, args.minimumBid, args.taxRate, args.hourglass, args.creator, args.nextAuctionId, args.currentOwner, args.currentPrice, args.ownedTill, args.graceTill, args.ownershipPeriodIndex, args.royalties, args.messageId);
    }
    /**
     * Deserializes the {@link HourglassAssociatedAccount} from the data of the provided {@link web3.AccountInfo}.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static fromAccountInfo(accountInfo, offset = 0) {
        return HourglassAssociatedAccount.deserialize(accountInfo.data, offset);
    }
    /**
     * Retrieves the account info from the provided address and deserializes
     * the {@link HourglassAssociatedAccount} from its data.
     *
     * @throws Error if no account info is found at the address or if deserialization fails
     */
    static fromAccountAddress(connection, address, commitmentOrConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountInfo = yield connection.getAccountInfo(address, commitmentOrConfig);
            if (accountInfo == null) {
                throw new Error(`Unable to find HourglassAssociatedAccount account at ${address}`);
            }
            return HourglassAssociatedAccount.fromAccountInfo(accountInfo, 0)[0];
        });
    }
    /**
     * Provides a {@link web3.Connection.getProgramAccounts} config builder,
     * to fetch accounts matching filters that can be specified via that builder.
     *
     * @param programId - the program that owns the accounts we are filtering
     */
    static gpaBuilder(programId = new web3.PublicKey('83PYe3dvbceG6KH98pewdyxLfhLFTHQUc8sjJXiKAcij')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.hourglassAssociatedAccountBeet);
    }
    /**
     * Deserializes the {@link HourglassAssociatedAccount} from the provided data Buffer.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static deserialize(buf, offset = 0) {
        return exports.hourglassAssociatedAccountBeet.deserialize(buf, offset);
    }
    /**
     * Serializes the {@link HourglassAssociatedAccount} into a Buffer.
     * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
     */
    serialize() {
        return exports.hourglassAssociatedAccountBeet.serialize(Object.assign({ accountDiscriminator: exports.hourglassAssociatedAccountDiscriminator }, this));
    }
    /**
     * Returns the byteSize of a {@link Buffer} holding the serialized data of
     * {@link HourglassAssociatedAccount}
     */
    static get byteSize() {
        return exports.hourglassAssociatedAccountBeet.byteSize;
    }
    /**
     * Fetches the minimum balance needed to exempt an account holding
     * {@link HourglassAssociatedAccount} data from rent
     *
     * @param connection used to retrieve the rent exemption information
     */
    static getMinimumBalanceForRentExemption(connection, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            return connection.getMinimumBalanceForRentExemption(HourglassAssociatedAccount.byteSize, commitment);
        });
    }
    /**
     * Determines if the provided {@link Buffer} has the correct byte size to
     * hold {@link HourglassAssociatedAccount} data.
     */
    static hasCorrectByteSize(buf, offset = 0) {
        return buf.byteLength - offset === HourglassAssociatedAccount.byteSize;
    }
    /**
     * Returns a readable version of {@link HourglassAssociatedAccount} properties
     * and can be used to convert to JSON and/or logging
     */
    pretty() {
        return {
            service: this.service,
            isPublic: this.isPublic,
            auctionLength: (() => {
                const x = this.auctionLength;
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
            ownershipPeriod: (() => {
                const x = this.ownershipPeriod;
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
            gracePeriod: (() => {
                const x = this.gracePeriod;
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
            minimumSalePrice: (() => {
                const x = this.minimumSalePrice;
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
            minimumBid: (() => {
                const x = this.minimumBid;
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
            taxRate: (() => {
                const x = this.taxRate;
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
            hourglass: this.hourglass.toBase58(),
            creator: this.creator.toBase58(),
            nextAuctionId: (() => {
                const x = this.nextAuctionId;
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
            currentOwner: this.currentOwner.toBase58(),
            currentPrice: (() => {
                const x = this.currentPrice;
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
            ownedTill: (() => {
                const x = this.ownedTill;
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
            graceTill: (() => {
                const x = this.graceTill;
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
            ownershipPeriodIndex: (() => {
                const x = this.ownershipPeriodIndex;
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
            royalties: (() => {
                const x = this.royalties;
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
            messageId: (() => {
                const x = this.messageId;
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
        };
    }
}
exports.HourglassAssociatedAccount = HourglassAssociatedAccount;
/**
 * @category Accounts
 * @category generated
 */
exports.hourglassAssociatedAccountBeet = new beet.BeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['service', beet.uniformFixedSizeArray(beet.bool, 8)],
    ['isPublic', beet.bool],
    ['auctionLength', beet.u64],
    ['ownershipPeriod', beet.u64],
    ['gracePeriod', beet.u64],
    ['minimumSalePrice', beet.u64],
    ['minimumBid', beet.u64],
    ['taxRate', beet.u64],
    ['hourglass', beetSolana.publicKey],
    ['creator', beetSolana.publicKey],
    ['nextAuctionId', beet.u64],
    ['currentOwner', beetSolana.publicKey],
    ['currentPrice', beet.u64],
    ['ownedTill', beet.u64],
    ['graceTill', beet.u64],
    ['ownershipPeriodIndex', beet.u64],
    ['royalties', beet.u64],
    ['messageId', beet.u64],
], HourglassAssociatedAccount.fromArgs, 'HourglassAssociatedAccount');