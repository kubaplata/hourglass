"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hourglass = void 0;
const generated_1 = require("../generated");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const bn_js_1 = __importDefault(require("bn.js"));
class Hourglass {
    constructor(connection) {
        this.connection = connection;
        const [hourglassProtocol] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("hourglass_protocol")
        ], generated_1.PROGRAM_ID);
        this.hourglassProtocol = hourglassProtocol;
    }
    static deriveHourglassCreatorAccount(creator) {
        const [address] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("hourglass_creator_account"),
            creator.toBuffer()
        ], generated_1.PROGRAM_ID);
        return address;
    }
    static deriveHourglassAssociatedAccount(hourglassId) {
        const [address] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("hourglass_associated_account"),
            hourglassId.toArrayLike(Buffer, "be", 8)
        ], generated_1.PROGRAM_ID);
        return address;
    }
    static deriveHourglassAuction(hourglassId, auctionId) {
        const [address] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("hourglass_auction"),
            hourglassId.toArrayLike(Buffer, "be", 8),
            auctionId.toArrayLike(Buffer, "be", 8),
        ], generated_1.PROGRAM_ID);
        return address;
    }
    static deriveUserAuctionAccount(user, hourglassId, auctionId) {
        const [address] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("user_auction_account"),
            user.toBuffer(),
            hourglassId.toArrayLike(Buffer, "be", 8),
            auctionId.toArrayLike(Buffer, "be", 8),
        ], generated_1.PROGRAM_ID);
        return address;
    }
    static deriveHourglassVault(hourglass, hourglassAssociatedAccount) {
        const hourglassVault = (0, spl_token_1.getAssociatedTokenAddressSync)(hourglass, hourglassAssociatedAccount, true, spl_token_1.TOKEN_2022_PROGRAM_ID);
        return hourglassVault;
    }
    static deriveUserTaxAccount(user, hourglassId, ownershipPeriodId) {
        const [address] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("user_tax_account"),
            user.toBuffer(),
            hourglassId.toArrayLike(Buffer, "be", 8),
            ownershipPeriodId.toArrayLike(Buffer, "be", 8),
        ], generated_1.PROGRAM_ID);
        return address;
    }
    accountFromBuffer(schema, accountInfo) {
        return schema.fromAccountInfo(accountInfo)[0];
    }
    getCurrentlyActiveAuctions() {
        return __awaiter(this, void 0, void 0, function* () {
            const unclaimedAuctions = yield generated_1.HourglassAuction
                .gpaBuilder()
                .addFilter("accountDiscriminator", generated_1.hourglassAuctionDiscriminator)
                .addFilter("claimed", false)
                .run(this.connection);
            const timestamp = Date.now();
            return unclaimedAuctions
                .map(({ account, pubkey }) => ({
                pubkey,
                account: this.accountFromBuffer(generated_1.HourglassAuction, account)
            }))
                .filter(({ account }) => new bn_js_1.default(account.ended).ltn(timestamp));
        });
    }
    getPastAuctions(hourglassId) {
        return __awaiter(this, void 0, void 0, function* () {
            const auctions = yield generated_1.HourglassAuction
                .gpaBuilder()
                .addFilter("accountDiscriminator", generated_1.hourglassAuctionDiscriminator)
                .addFilter("hourglassId", hourglassId.toNumber())
                .run(this.connection);
            return auctions
                .map(({ account, pubkey }) => ({
                pubkey,
                account: this.accountFromBuffer(generated_1.HourglassAuction, account)
            }));
        });
    }
    getAllHourglasses() {
        return __awaiter(this, void 0, void 0, function* () {
            const hourglasses = yield generated_1.HourglassAssociatedAccount
                .gpaBuilder()
                .addFilter("accountDiscriminator", generated_1.hourglassAssociatedAccountDiscriminator)
                .run(this.connection);
            return hourglasses
                .map(({ account, pubkey }) => ({
                pubkey,
                account: this.accountFromBuffer(generated_1.HourglassAssociatedAccount, account)
            }));
        });
    }
    getAllUserBids(user) {
        return __awaiter(this, void 0, void 0, function* () {
            const bids = yield generated_1.UserAuctionAccount
                .gpaBuilder()
                .addFilter("accountDiscriminator", generated_1.userAuctionAccountDiscriminator)
                .addFilter("user", user)
                .run(this.connection);
            return bids
                .map(({ account, pubkey }) => ({
                pubkey,
                account: this.accountFromBuffer(generated_1.UserAuctionAccount, account)
            }));
        });
    }
    getInvocations(hourglassId) {
        return __awaiter(this, void 0, void 0, function* () {
            const invocations = yield generated_1.Message
                .gpaBuilder()
                .addFilter("accountDiscriminator", generated_1.messageDiscriminator)
                .addFilter("hourglassId", hourglassId.toNumber())
                .run(this.connection);
            return invocations
                .map(({ account, pubkey }) => ({
                pubkey,
                account: this.accountFromBuffer(generated_1.Message, account)
            }));
        });
    }
    getHourglass(hourglassId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hourglass = Hourglass.deriveHourglassAssociatedAccount(hourglassId);
            const hourglassAssociatedAccount = yield generated_1.HourglassAssociatedAccount.fromAccountAddress(this.connection, hourglass);
            return hourglassAssociatedAccount;
        });
    }
    createHourglass(signer, keypair) {
        return __awaiter(this, void 0, void 0, function* () {
            let hourglassKeypair = keypair || web3_js_1.Keypair.generate();
            let finished = !!keypair;
            while (!finished) {
                hourglassKeypair = web3_js_1.Keypair.generate();
                finished = hourglassKeypair.publicKey.toString().toLowerCase().startsWith("hour");
            }
            const { feeSettlementToken, totalHourglasses } = yield generated_1.Hourglass.fromAccountAddress(this.connection, this.hourglassProtocol);
            const creatorFeeSettlementTokenAccount = (0, spl_token_1.getAssociatedTokenAddressSync)(feeSettlementToken, signer);
            const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(new bn_js_1.default(totalHourglasses));
            const hourglassVault = (0, spl_token_1.getAssociatedTokenAddressSync)(hourglassKeypair.publicKey, hourglassAssociatedAccount, true, spl_token_1.TOKEN_2022_PROGRAM_ID);
            const ix = (0, generated_1.createCreateHourglassInstruction)({
                hourglassProtocol: this.hourglassProtocol,
                creator: signer,
                hourglassMint: hourglassKeypair.publicKey,
                tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
                feeSettlementToken,
                creatorHourglassAccount: Hourglass.deriveHourglassCreatorAccount(signer),
                rentProgram: web3_js_1.SYSVAR_RENT_PUBKEY,
                systemProgram: web3_js_1.SystemProgram.programId,
                creatorFeeSettlementTokenAccount,
                hourglassAssociatedAccount,
                hourglassVault,
                associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID
            }, {
                args: {
                    hourglassId: totalHourglasses,
                    name: "Hourglass #1 - Toly",
                    auctionLength: 5 * 60,
                    gracePeriod: 0,
                    minimumBid: 0.1 * Math.pow(10, 6),
                    taxRate: 150,
                    ownershipPeriod: 7 * 60,
                    symbol: "HOURGLASS",
                    isPublic: true,
                    minimumSalePrice: 0.5 * Math.pow(10, 6),
                    service: [true, false, false, false, false, false, false, false],
                    metadataUri: "https://bafkreif4jnsgheen2vzjv4in76q2tegijggmzfijaplep45ir66gbygdui.ipfs.nftstorage.link/",
                    creatorName: "Anatoly Yakovenko",
                    description: "First Hourglass, initialized by Anatoly Yakovenko himself. Powered by Hourglass Protocol.",
                    image: "https://bafkreiefwviqmjyykws6k7oxckhr5lygywgau6ruscvhv5whyipyzrvwpi.ipfs.nftstorage.link/",
                    royalties: 500 // 5%
                }
            });
            return ix;
        });
    }
    initializeAuction(signer, hourglassId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(hourglassId);
            const { hourglass: hourglassMint, nextAuctionId } = yield generated_1.HourglassAssociatedAccount.fromAccountAddress(this.connection, hourglassAssociatedAccount);
            const hourglassVault = (0, spl_token_1.getAssociatedTokenAddressSync)(hourglassMint, hourglassAssociatedAccount, true, spl_token_1.TOKEN_2022_PROGRAM_ID);
            const hourglassAuction = Hourglass.deriveHourglassAuction(hourglassId, new bn_js_1.default(nextAuctionId));
            const ix = (0, generated_1.createInitializeAuctionInstruction)({
                creator: signer,
                tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
                hourglassAssociatedAccount,
                hourglassMint,
                hourglassVault,
                hourglassAuction
            }, {
                hourglassId
            }, generated_1.PROGRAM_ID);
            return ix;
        });
    }
    bidAuction(signer, bid, hourglassId, auctionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(hourglassId);
            const userAuctionAccount = Hourglass.deriveUserAuctionAccount(signer, hourglassId, auctionId);
            const hourglassAuction = Hourglass.deriveHourglassAuction(hourglassId, auctionId);
            const ix = (0, generated_1.createBidInstruction)({
                hourglassAssociatedAccount,
                userAuctionAccount,
                hourglassAuction,
                user: signer,
                systemProgram: web3_js_1.SystemProgram.programId
            }, {
                hourglassId,
                auctionId,
                bid
            });
            return ix;
        });
    }
    cancelBid(signer, hourglassId, auctionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(hourglassId);
            const userAuctionAccount = Hourglass.deriveUserAuctionAccount(signer, hourglassId, auctionId);
            const hourglassAuction = Hourglass.deriveHourglassAuction(hourglassId, auctionId);
            const ix = (0, generated_1.createCancelBidInstruction)({
                user: signer,
                hourglassAuction,
                userAuctionAccount,
                hourglassAssociatedAccount,
                systemProgram: web3_js_1.SystemProgram.programId
            }, {
                hourglassId,
                auctionId
            });
            return ix;
        });
    }
    claimHourglass(signer, hourglassId, auctionId, instantSellPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(hourglassId);
            const userAuctionAccount = Hourglass.deriveUserAuctionAccount(signer, hourglassId, auctionId);
            const hourglassAuction = Hourglass.deriveHourglassAuction(hourglassId, auctionId);
            const { hourglass: hourglassMint, creator, ownershipPeriodIndex } = yield generated_1.HourglassAssociatedAccount.fromAccountAddress(this.connection, hourglassAssociatedAccount);
            const hourglassVault = Hourglass.deriveHourglassVault(hourglassMint, hourglassAssociatedAccount);
            const hourglassCreatorAccount = Hourglass.deriveHourglassCreatorAccount(creator);
            const userHourglassAta = (0, spl_token_1.getAssociatedTokenAddressSync)(hourglassMint, signer);
            const userTaxAccount = Hourglass.deriveUserTaxAccount(signer, hourglassId, new bn_js_1.default(ownershipPeriodIndex));
            const ix = (0, generated_1.createClaimHourglassInstruction)({
                hourglassAssociatedAccount,
                userAuctionAccount,
                hourglassAuction,
                user: signer,
                hourglassVault,
                creator,
                hourglassMint,
                hourglassCreatorAccount,
                userHourglassAta,
                userTaxAccount,
                tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
            }, {
                hourglassId,
                auctionId,
                instantSellPrice
            });
            return ix;
        });
    }
    payTax(signer, hourglassId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(hourglassId);
            const { hourglass: hourglassMint, creator, ownershipPeriodIndex } = yield generated_1.HourglassAssociatedAccount.fromAccountAddress(this.connection, hourglassAssociatedAccount);
            const hourglassVault = Hourglass.deriveHourglassVault(hourglassMint, hourglassAssociatedAccount);
            const hourglassCreatorAccount = Hourglass.deriveHourglassCreatorAccount(creator);
            const userHourglassAta = (0, spl_token_1.getAssociatedTokenAddressSync)(hourglassMint, signer);
            const userTaxAccount = Hourglass.deriveUserTaxAccount(signer, hourglassId, new bn_js_1.default(ownershipPeriodIndex));
            const userNextTaxAccount = Hourglass.deriveUserTaxAccount(signer, hourglassId, new bn_js_1.default(ownershipPeriodIndex).addn(1));
            const ix = (0, generated_1.createPayTaxInstruction)({
                user: signer,
                userTaxAccount,
                userHourglassAta,
                creator,
                hourglassMint,
                hourglassVault,
                hourglassAssociatedAccount,
                creatorHourglassAccount: hourglassCreatorAccount,
                systemProgram: web3_js_1.SystemProgram.programId,
                tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
                userNextTaxAccount
            }, {
                hourglassId
            });
            return ix;
        });
    }
    purchaseHourglass(signer, hourglassId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(hourglassId);
            const { hourglass: hourglassMint, creator, ownershipPeriodIndex, currentOwner } = yield generated_1.HourglassAssociatedAccount.fromAccountAddress(this.connection, hourglassAssociatedAccount);
            const hourglassVault = Hourglass.deriveHourglassVault(hourglassMint, hourglassAssociatedAccount);
            const hourglassCreatorAccount = Hourglass.deriveHourglassCreatorAccount(creator);
            const userHourglassAta = (0, spl_token_1.getAssociatedTokenAddressSync)(hourglassMint, signer);
            const sellerHourglassAta = (0, spl_token_1.getAssociatedTokenAddressSync)(hourglassMint, currentOwner);
            const userTaxAccount = Hourglass.deriveUserTaxAccount(signer, hourglassId, new bn_js_1.default(ownershipPeriodIndex));
            const ix = (0, generated_1.createPurchaseHourglassInstruction)({
                user: signer,
                seller: currentOwner,
                creator,
                hourglassMint,
                hourglassVault,
                userHourglassAta,
                sellerHourglassAta,
                userTaxAccount,
                hourglassAssociatedAccount,
                creatorHourglassAccount: hourglassCreatorAccount,
                systemProgram: web3_js_1.SystemProgram.programId,
                tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
            }, {
                hourglassId
            });
            return ix;
        });
    }
}
exports.Hourglass = Hourglass;
