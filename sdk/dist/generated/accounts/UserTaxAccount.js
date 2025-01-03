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
exports.userTaxAccountBeet = exports.UserTaxAccount = exports.userTaxAccountDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const beet = __importStar(require("@metaplex-foundation/beet"));
exports.userTaxAccountDiscriminator = [132, 255, 212, 27, 95, 70, 32, 5];
/**
 * Holds the data for the {@link UserTaxAccount} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
class UserTaxAccount {
    constructor(user, paidTax) {
        this.user = user;
        this.paidTax = paidTax;
    }
    /**
     * Creates a {@link UserTaxAccount} instance from the provided args.
     */
    static fromArgs(args) {
        return new UserTaxAccount(args.user, args.paidTax);
    }
    /**
     * Deserializes the {@link UserTaxAccount} from the data of the provided {@link web3.AccountInfo}.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static fromAccountInfo(accountInfo, offset = 0) {
        return UserTaxAccount.deserialize(accountInfo.data, offset);
    }
    /**
     * Retrieves the account info from the provided address and deserializes
     * the {@link UserTaxAccount} from its data.
     *
     * @throws Error if no account info is found at the address or if deserialization fails
     */
    static fromAccountAddress(connection, address, commitmentOrConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountInfo = yield connection.getAccountInfo(address, commitmentOrConfig);
            if (accountInfo == null) {
                throw new Error(`Unable to find UserTaxAccount account at ${address}`);
            }
            return UserTaxAccount.fromAccountInfo(accountInfo, 0)[0];
        });
    }
    /**
     * Provides a {@link web3.Connection.getProgramAccounts} config builder,
     * to fetch accounts matching filters that can be specified via that builder.
     *
     * @param programId - the program that owns the accounts we are filtering
     */
    static gpaBuilder(programId = new web3.PublicKey('HEwZhZFUgMAxHe5uP1jVRGKhNxdD7qZsoiypyifGrNq6')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.userTaxAccountBeet);
    }
    /**
     * Deserializes the {@link UserTaxAccount} from the provided data Buffer.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static deserialize(buf, offset = 0) {
        return exports.userTaxAccountBeet.deserialize(buf, offset);
    }
    /**
     * Serializes the {@link UserTaxAccount} into a Buffer.
     * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
     */
    serialize() {
        return exports.userTaxAccountBeet.serialize(Object.assign({ accountDiscriminator: exports.userTaxAccountDiscriminator }, this));
    }
    /**
     * Returns the byteSize of a {@link Buffer} holding the serialized data of
     * {@link UserTaxAccount}
     */
    static get byteSize() {
        return exports.userTaxAccountBeet.byteSize;
    }
    /**
     * Fetches the minimum balance needed to exempt an account holding
     * {@link UserTaxAccount} data from rent
     *
     * @param connection used to retrieve the rent exemption information
     */
    static getMinimumBalanceForRentExemption(connection, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            return connection.getMinimumBalanceForRentExemption(UserTaxAccount.byteSize, commitment);
        });
    }
    /**
     * Determines if the provided {@link Buffer} has the correct byte size to
     * hold {@link UserTaxAccount} data.
     */
    static hasCorrectByteSize(buf, offset = 0) {
        return buf.byteLength - offset === UserTaxAccount.byteSize;
    }
    /**
     * Returns a readable version of {@link UserTaxAccount} properties
     * and can be used to convert to JSON and/or logging
     */
    pretty() {
        return {
            user: this.user.toBase58(),
            paidTax: this.paidTax,
        };
    }
}
exports.UserTaxAccount = UserTaxAccount;
/**
 * @category Accounts
 * @category generated
 */
exports.userTaxAccountBeet = new beet.BeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['user', beetSolana.publicKey],
    ['paidTax', beet.bool],
], UserTaxAccount.fromArgs, 'UserTaxAccount');
