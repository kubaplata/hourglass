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
exports.hourglassBeet = exports.Hourglass = exports.hourglassDiscriminator = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
exports.hourglassDiscriminator = [28, 165, 183, 62, 195, 115, 219, 182];
/**
 * Holds the data for the {@link Hourglass} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
class Hourglass {
    constructor(admin, feeCollector, feeBps, totalHourglasses, totalCreators) {
        this.admin = admin;
        this.feeCollector = feeCollector;
        this.feeBps = feeBps;
        this.totalHourglasses = totalHourglasses;
        this.totalCreators = totalCreators;
    }
    /**
     * Creates a {@link Hourglass} instance from the provided args.
     */
    static fromArgs(args) {
        return new Hourglass(args.admin, args.feeCollector, args.feeBps, args.totalHourglasses, args.totalCreators);
    }
    /**
     * Deserializes the {@link Hourglass} from the data of the provided {@link web3.AccountInfo}.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static fromAccountInfo(accountInfo, offset = 0) {
        return Hourglass.deserialize(accountInfo.data, offset);
    }
    /**
     * Retrieves the account info from the provided address and deserializes
     * the {@link Hourglass} from its data.
     *
     * @throws Error if no account info is found at the address or if deserialization fails
     */
    static fromAccountAddress(connection, address, commitmentOrConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountInfo = yield connection.getAccountInfo(address, commitmentOrConfig);
            if (accountInfo == null) {
                throw new Error(`Unable to find Hourglass account at ${address}`);
            }
            return Hourglass.fromAccountInfo(accountInfo, 0)[0];
        });
    }
    /**
     * Provides a {@link web3.Connection.getProgramAccounts} config builder,
     * to fetch accounts matching filters that can be specified via that builder.
     *
     * @param programId - the program that owns the accounts we are filtering
     */
    static gpaBuilder(programId = new web3.PublicKey('HEwZhZFUgMAxHe5uP1jVRGKhNxdD7qZsoiypyifGrNq6')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.hourglassBeet);
    }
    /**
     * Deserializes the {@link Hourglass} from the provided data Buffer.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static deserialize(buf, offset = 0) {
        return exports.hourglassBeet.deserialize(buf, offset);
    }
    /**
     * Serializes the {@link Hourglass} into a Buffer.
     * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
     */
    serialize() {
        return exports.hourglassBeet.serialize(Object.assign({ accountDiscriminator: exports.hourglassDiscriminator }, this));
    }
    /**
     * Returns the byteSize of a {@link Buffer} holding the serialized data of
     * {@link Hourglass}
     */
    static get byteSize() {
        return exports.hourglassBeet.byteSize;
    }
    /**
     * Fetches the minimum balance needed to exempt an account holding
     * {@link Hourglass} data from rent
     *
     * @param connection used to retrieve the rent exemption information
     */
    static getMinimumBalanceForRentExemption(connection, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            return connection.getMinimumBalanceForRentExemption(Hourglass.byteSize, commitment);
        });
    }
    /**
     * Determines if the provided {@link Buffer} has the correct byte size to
     * hold {@link Hourglass} data.
     */
    static hasCorrectByteSize(buf, offset = 0) {
        return buf.byteLength - offset === Hourglass.byteSize;
    }
    /**
     * Returns a readable version of {@link Hourglass} properties
     * and can be used to convert to JSON and/or logging
     */
    pretty() {
        return {
            admin: this.admin.toBase58(),
            feeCollector: this.feeCollector.toBase58(),
            feeBps: (() => {
                const x = this.feeBps;
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
            totalHourglasses: (() => {
                const x = this.totalHourglasses;
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
            totalCreators: (() => {
                const x = this.totalCreators;
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
exports.Hourglass = Hourglass;
/**
 * @category Accounts
 * @category generated
 */
exports.hourglassBeet = new beet.BeetStruct([
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['admin', beetSolana.publicKey],
    ['feeCollector', beetSolana.publicKey],
    ['feeBps', beet.u64],
    ['totalHourglasses', beet.u64],
    ['totalCreators', beet.u64],
], Hourglass.fromArgs, 'Hourglass');
