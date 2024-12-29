import { Hourglass as HourglassProtocol, HourglassAssociatedAccount, HourglassAuction, UserAuctionAccount, Message, UserTaxAccount, HourglassCreatorAccount } from "../generated";
import { AccountInfo, Connection, Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
type HourglassProtocolAccount = HourglassAuction | HourglassAssociatedAccount | Message | UserTaxAccount | UserAuctionAccount | HourglassCreatorAccount | HourglassProtocol;
declare class Hourglass {
    private hourglassProtocol;
    private connection;
    constructor(connection: Connection);
    static deriveHourglassCreatorAccount(creator: PublicKey): PublicKey;
    static deriveHourglassAssociatedAccount(hourglassId: BN): PublicKey;
    static deriveHourglassAuction(hourglassId: BN, auctionId: BN): PublicKey;
    static deriveUserAuctionAccount(user: PublicKey, hourglassId: BN, auctionId: BN): PublicKey;
    static deriveHourglassVault(hourglass: PublicKey, hourglassAssociatedAccount: PublicKey): PublicKey;
    static deriveUserTaxAccount(user: PublicKey, hourglassId: BN, ownershipPeriodId: BN): PublicKey;
    accountFromBuffer<T extends HourglassProtocolAccount>(schema: {
        fromAccountInfo: (accountInfo: AccountInfo<Buffer>) => [T, number];
    }, accountInfo: AccountInfo<Buffer>): T;
    getCurrentlyActiveAuctions(): Promise<{
        pubkey: PublicKey;
        account: HourglassAuction;
    }[]>;
    getAuction(hourglassId: BN, auctionId: BN): Promise<HourglassAuction>;
    getBids(hourglassId: BN, auctionId: BN): Promise<{
        pubkey: PublicKey;
        account: UserAuctionAccount;
    }[]>;
    getPastAuctions(hourglassId: BN): Promise<{
        pubkey: PublicKey;
        account: HourglassAuction;
    }[]>;
    getAllHourglasses(): Promise<{
        pubkey: PublicKey;
        account: HourglassAssociatedAccount;
    }[]>;
    getAllUserBids(user: PublicKey): Promise<{
        pubkey: PublicKey;
        account: UserAuctionAccount;
    }[]>;
    getInvocations(hourglassId: BN): Promise<{
        pubkey: PublicKey;
        account: Message;
    }[]>;
    getHourglass(hourglassId: BN): Promise<HourglassAssociatedAccount>;
    getOwnedHourglasses(owner: PublicKey): Promise<{
        pubkey: PublicKey;
        account: HourglassAssociatedAccount;
    }[]>;
    createHourglass(signer: PublicKey, settlementToken: PublicKey, keypair?: Keypair): Promise<import("@solana/web3.js").TransactionInstruction>;
    initializeAuction(signer: PublicKey, hourglassId: BN): Promise<import("@solana/web3.js").TransactionInstruction>;
    bidAuction(signer: PublicKey, bid: BN, hourglassId: BN, auctionId: BN): Promise<import("@solana/web3.js").TransactionInstruction>;
    cancelBid(signer: PublicKey, hourglassId: BN, auctionId: BN): Promise<import("@solana/web3.js").TransactionInstruction>;
    claimHourglass(signer: PublicKey, hourglassId: BN, auctionId: BN, instantSellPrice: BN): Promise<import("@solana/web3.js").TransactionInstruction>;
    payTax(signer: PublicKey, hourglassId: BN): Promise<import("@solana/web3.js").TransactionInstruction>;
    purchaseHourglass(signer: PublicKey, hourglassId: BN): Promise<import("@solana/web3.js").TransactionInstruction>;
}
export { Hourglass };
