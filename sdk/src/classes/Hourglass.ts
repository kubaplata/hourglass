import {
    createCreateHourglassInstruction,
    PROGRAM_ID,
    Hourglass as HourglassProtocol,
    HourglassAssociatedAccount,
    createInitializeAuctionInstruction,
    createBidInstruction,
    createCancelBidInstruction,
    createClaimHourglassInstruction,
    createPayTaxInstruction,
    createPurchaseHourglassInstruction,
    createValidateTaxInstruction,
    HourglassAuction,
    hourglassAuctionDiscriminator,
    UserAuctionAccount,
    userAuctionAccountDiscriminator,
    Message,
    UserTaxAccount,
    HourglassCreatorAccount,
    hourglassAssociatedAccountDiscriminator, messageDiscriminator, HourglassAssociatedAccountArgs
} from "../generated";
import {AccountInfo, Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY} from "@solana/web3.js";
import {ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID} from "@solana/spl-token";
import BN from "bn.js";

type HourglassProtocolAccount =
    HourglassAuction |
    HourglassAssociatedAccount |
    Message |
    UserTaxAccount |
    UserAuctionAccount |
    HourglassCreatorAccount |
    HourglassProtocol;

class Hourglass {
    private hourglassProtocol: PublicKey;
    private connection: Connection;

    constructor(
        connection: Connection,
    ) {
        this.connection = connection;

        const [hourglassProtocol] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("hourglass_protocol")
            ],
            PROGRAM_ID
        );
        this.hourglassProtocol = hourglassProtocol;
    }

    static deriveHourglassCreatorAccount(creator: PublicKey) {
        const [address] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("hourglass_creator_account"),
                creator.toBuffer()
            ],
            PROGRAM_ID
        );

        return address;
    }

    static deriveHourglassAssociatedAccount(hourglassId: BN) {
        const [address] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("hourglass_associated_account"),
                hourglassId.toArrayLike(Buffer, "be", 8)
            ],
            PROGRAM_ID
        );

        return address;
    }

    static deriveHourglassAuction(hourglassId: BN, auctionId: BN) {
        const [address] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("hourglass_auction"),
                hourglassId.toArrayLike(Buffer, "be", 8),
                auctionId.toArrayLike(Buffer, "be", 8),
            ],
            PROGRAM_ID
        );

        return address;
    }

    static deriveUserAuctionAccount(user: PublicKey, hourglassId: BN, auctionId: BN) {
        const [address] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("user_auction_account"),
                user.toBuffer(),
                hourglassId.toArrayLike(Buffer, "be", 8),
                auctionId.toArrayLike(Buffer, "be", 8),
            ],
            PROGRAM_ID
        );

        return address;
    }

    static deriveHourglassVault(
        hourglass: PublicKey,
        hourglassAssociatedAccount: PublicKey
    ) {
        const hourglassVault = getAssociatedTokenAddressSync(
            hourglass,
            hourglassAssociatedAccount,
            true,
            TOKEN_2022_PROGRAM_ID
        );

        return hourglassVault;
    }

    static deriveUserTaxAccount(
        user: PublicKey,
        hourglassId: BN,
        ownershipPeriodId: BN
    ) {
        const [address] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("user_tax_account"),
                user.toBuffer(),
                hourglassId.toArrayLike(Buffer, "be", 8),
                ownershipPeriodId.toArrayLike(Buffer, "be", 8),
            ],
            PROGRAM_ID
        );

        return address;
    }

    accountFromBuffer<T extends HourglassProtocolAccount>(
        schema: { fromAccountInfo: (accountInfo: AccountInfo<Buffer>) => [T, number] },
        accountInfo: AccountInfo<Buffer>
    ): T {
        return schema.fromAccountInfo(accountInfo)[0];
    }

    async getCurrentlyActiveAuctions() {
        const unclaimedAuctions = await HourglassAuction
            .gpaBuilder()
            .addFilter("accountDiscriminator", hourglassAuctionDiscriminator)
            .addFilter("claimed", false)
            .run(this.connection);

        const timestamp = Date.now();

        return unclaimedAuctions
            .map(({ account, pubkey }) => ({
                pubkey,
                account: this.accountFromBuffer(HourglassAuction, account)
            }))
            .filter(({ account }) => new BN(account.ended).ltn(timestamp));
    }

    async getAuction(hourglassId: BN, auctionId: BN) {
        const address = Hourglass.deriveHourglassAuction(hourglassId, auctionId);
        const auctionData = await HourglassAuction.fromAccountAddress(
            this.connection,
            address
        );
        return auctionData;
    }

    async getBids(hourglassId: BN, auctionId: BN) {
        const bids = await UserAuctionAccount
            .gpaBuilder()
            .addFilter("accountDiscriminator", userAuctionAccountDiscriminator)
            .addFilter("hourglass", hourglassId)
            .addFilter("auction", auctionId)
            .run(this.connection);

        return bids
            .map(({ account, pubkey }) => ({
                pubkey,
                account: this.accountFromBuffer(UserAuctionAccount, account)
            }));
    }

    async getPastAuctions(hourglassId: BN) {
        const auctions = await HourglassAuction
            .gpaBuilder()
            .addFilter("accountDiscriminator", hourglassAuctionDiscriminator)
            .addFilter("hourglassId", hourglassId.toNumber())
            .run(this.connection);

        return auctions
            .map(({ account, pubkey }) => ({
                pubkey,
                account: this.accountFromBuffer(HourglassAuction, account)
            }));
    }

    async getAllHourglasses() {
        const hourglasses = await HourglassAssociatedAccount
            .gpaBuilder()
            .addFilter("accountDiscriminator", hourglassAssociatedAccountDiscriminator)
            .run(this.connection);

        return hourglasses
            .map(({ account, pubkey }) => ({
                pubkey,
                account: this.accountFromBuffer(HourglassAssociatedAccount, account)
            }));
    }

    async getAllUserBids(user: PublicKey) {
        const bids = await UserAuctionAccount
            .gpaBuilder()
            .addFilter("accountDiscriminator", userAuctionAccountDiscriminator)
            .addFilter("user", user)
            .run(this.connection);

        return bids
            .map(({ account, pubkey }) => ({
                pubkey,
                account: this.accountFromBuffer(UserAuctionAccount, account)
            }));
    }

    async getInvocations(hourglassId: BN) {
        const invocations = await Message
            .gpaBuilder()
            .addFilter("accountDiscriminator", messageDiscriminator)
            .addFilter("hourglassId", hourglassId.toNumber())
            .run(this.connection);

        return invocations
            .map(({ account, pubkey }) => ({
                pubkey,
                account: this.accountFromBuffer(Message, account)
            }));
    }

    async getHourglass(hourglassId: BN) {
        const hourglass = Hourglass.deriveHourglassAssociatedAccount(hourglassId);
        const hourglassAssociatedAccount = await HourglassAssociatedAccount.fromAccountAddress(
            this.connection,
            hourglass
        );

        return hourglassAssociatedAccount;
    }

    async getOwnedHourglasses(owner: PublicKey) {
        const hourglasses = await HourglassAssociatedAccount
            .gpaBuilder()
            .addFilter("accountDiscriminator", hourglassAssociatedAccountDiscriminator)
            .addFilter("currentOwner", owner)
            .run(this.connection);

        return hourglasses
            .map(({ account, pubkey }) => ({
                pubkey,
                account: this.accountFromBuffer(HourglassAssociatedAccount, account)
            }));
    }

    async createHourglass(
        signer: PublicKey,
        settlementToken: PublicKey,
        keypair?: Keypair
    ) {
        let hourglassKeypair = keypair || Keypair.generate();
        let finished: boolean = !!keypair;

        while (!finished) {
            hourglassKeypair = Keypair.generate();
            finished = hourglassKeypair.publicKey.toString().toLowerCase().startsWith("hour");
        }

        const {
            totalHourglasses
        } = await HourglassProtocol.fromAccountAddress(
            this.connection,
            this.hourglassProtocol
        );

        const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(
            new BN(totalHourglasses)
        );

        const hourglassVault = getAssociatedTokenAddressSync(
            hourglassKeypair.publicKey,
            hourglassAssociatedAccount,
            true,
            TOKEN_2022_PROGRAM_ID
        );

        const ix = createCreateHourglassInstruction(
            {
                hourglassProtocol: this.hourglassProtocol,
                creator: signer,
                hourglassMint: hourglassKeypair.publicKey,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                creatorHourglassAccount: Hourglass.deriveHourglassCreatorAccount(signer),
                rentProgram: SYSVAR_RENT_PUBKEY,
                systemProgram: SystemProgram.programId,
                hourglassAssociatedAccount,
                hourglassVault,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                settlementToken
            },
            {
                args: {
                    hourglassId: totalHourglasses,
                    name: "Hourglass #1 - Toly",
                    auctionLength: 5 * 60,
                    gracePeriod: 0,
                    minimumBid: 0.1 * Math.pow(10, 6),
                    taxRateBps: 150,
                    ownershipPeriod: 7 * 60,
                    symbol: "HOURGLASS",
                    minimumSalePrice: 0.5 * Math.pow(10, 6),
                    metadataUri: "https://bafkreif4jnsgheen2vzjv4in76q2tegijggmzfijaplep45ir66gbygdui.ipfs.nftstorage.link/",
                    creatorName: "Anatoly Yakovenko",
                    description: "First Hourglass, initialized by Anatoly Yakovenko himself. Powered by Hourglass Protocol.",
                    image: "https://bafkreiefwviqmjyykws6k7oxckhr5lygywgau6ruscvhv5whyipyzrvwpi.ipfs.nftstorage.link/",
                    royalties: 500 // 5%
                }
            },
        );

        return ix;
    }

    async initializeAuction(signer: PublicKey, hourglassId: BN) {
        const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(hourglassId);

        const {
            hourglass: hourglassMint,
            nextAuctionId
        } = await HourglassAssociatedAccount.fromAccountAddress(
            this.connection,
            hourglassAssociatedAccount
        );

        const hourglassVault = getAssociatedTokenAddressSync(
            hourglassMint,
            hourglassAssociatedAccount,
            true,
            TOKEN_2022_PROGRAM_ID
        );

        const hourglassAuction = Hourglass.deriveHourglassAuction(hourglassId, new BN(nextAuctionId));

        const ix = createInitializeAuctionInstruction(
            {
                creator: signer,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                hourglassAssociatedAccount,
                hourglassMint,
                hourglassVault,
                hourglassAuction
            },
            {
                hourglassId
            },
            PROGRAM_ID
        );

        return ix;
    }

    async bidAuction(
        signer: PublicKey,
        bid: BN,
        hourglassId: BN,
        auctionId: BN
    ) {
        const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(hourglassId);
        const userAuctionAccount = Hourglass.deriveUserAuctionAccount(
            signer,
            hourglassId,
            auctionId
        );
        const hourglassAuction = Hourglass.deriveHourglassAuction(hourglassId, auctionId);

        const ix = createBidInstruction(
            {
                hourglassAssociatedAccount,
                userAuctionAccount,
                hourglassAuction,
                user: signer,
                systemProgram: SystemProgram.programId
            },
            {
                hourglassId,
                auctionId,
                bid
            }
        );

        return ix;
    }

    async cancelBid(
        signer: PublicKey,
        hourglassId: BN,
        auctionId: BN
    ) {
        const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(hourglassId);
        const userAuctionAccount = Hourglass.deriveUserAuctionAccount(
            signer,
            hourglassId,
            auctionId
        );
        const hourglassAuction = Hourglass.deriveHourglassAuction(hourglassId, auctionId);

        const ix = createCancelBidInstruction(
            {
                user: signer,
                hourglassAuction,
                userAuctionAccount,
                hourglassAssociatedAccount,
                systemProgram: SystemProgram.programId
            },
            {
                hourglassId,
                auctionId
            }
        );

        return ix;
    }

    async claimHourglass(
        signer: PublicKey,
        hourglassId: BN,
        auctionId: BN,
        instantSellPrice: BN
    ) {
        const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(hourglassId);
        const userAuctionAccount = Hourglass.deriveUserAuctionAccount(
            signer,
            hourglassId,
            auctionId
        );
        const hourglassAuction = Hourglass.deriveHourglassAuction(hourglassId, auctionId);

        const {
            hourglass: hourglassMint,
            creator,
            ownershipPeriodIndex
        } = await HourglassAssociatedAccount.fromAccountAddress(
            this.connection,
            hourglassAssociatedAccount
        );

        const hourglassVault = Hourglass.deriveHourglassVault(
            hourglassMint,
            hourglassAssociatedAccount
        );

        const hourglassCreatorAccount = Hourglass.deriveHourglassCreatorAccount(creator);

        const userHourglassAta = getAssociatedTokenAddressSync(
            hourglassMint,
            signer,
        );

        const userTaxAccount = Hourglass.deriveUserTaxAccount(signer, hourglassId, new BN(ownershipPeriodIndex));

        const ix = createClaimHourglassInstruction(
            {
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
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            },
            {
                hourglassId,
                auctionId,
                instantSellPrice
            }
        );

        return ix;
    }

    async payTax(
        signer: PublicKey,
        hourglassId: BN,
    ) {
        const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(hourglassId);

        const {
            hourglass: hourglassMint,
            creator,
            ownershipPeriodIndex
        } = await HourglassAssociatedAccount.fromAccountAddress(
            this.connection,
            hourglassAssociatedAccount
        );

        const hourglassVault = Hourglass.deriveHourglassVault(
            hourglassMint,
            hourglassAssociatedAccount
        );

        const hourglassCreatorAccount = Hourglass.deriveHourglassCreatorAccount(creator);

        const userHourglassAta = getAssociatedTokenAddressSync(
            hourglassMint,
            signer,
        );

        const userTaxAccount = Hourglass.deriveUserTaxAccount(
            signer,
            hourglassId,
            new BN(ownershipPeriodIndex)
        );

        const userNextTaxAccount = Hourglass.deriveUserTaxAccount(
            signer,
            hourglassId,
            new BN(ownershipPeriodIndex).addn(1)
        );

        const ix = createPayTaxInstruction(
            {
                user: signer,
                userTaxAccount,
                userHourglassAta,
                creator,
                hourglassMint,
                hourglassVault,
                hourglassAssociatedAccount,
                creatorHourglassAccount: hourglassCreatorAccount,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                userNextTaxAccount
            },
            {
                hourglassId
            }
        );

        return ix;
    }

    async purchaseHourglass(
        signer: PublicKey,
        hourglassId: BN,
    ) {
        const hourglassAssociatedAccount = Hourglass.deriveHourglassAssociatedAccount(hourglassId);

        const {
            hourglass: hourglassMint,
            creator,
            ownershipPeriodIndex,
            currentOwner
        } = await HourglassAssociatedAccount.fromAccountAddress(
            this.connection,
            hourglassAssociatedAccount
        );

        const hourglassVault = Hourglass.deriveHourglassVault(
            hourglassMint,
            hourglassAssociatedAccount
        );

        const hourglassCreatorAccount = Hourglass.deriveHourglassCreatorAccount(creator);

        const userHourglassAta = getAssociatedTokenAddressSync(
            hourglassMint,
            signer,
        );

        const sellerHourglassAta = getAssociatedTokenAddressSync(
            hourglassMint,
            currentOwner,
        );

        const userTaxAccount = Hourglass.deriveUserTaxAccount(
            signer,
            hourglassId,
            new BN(ownershipPeriodIndex)
        );

        const ix = createPurchaseHourglassInstruction(
            {
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
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
            },
            {
                hourglassId
            }
        );

        return ix;
    }
}

export {
    Hourglass
}