import * as anchor from "@coral-xyz/anchor";
import {AnchorError, AnchorProvider, Program} from "@coral-xyz/anchor";
import { HourglassProtocol } from "../target/types/hourglass_protocol";
import BN from "bn.js";
import {
    ComputeBudgetProgram,
    Connection,
    Keypair, LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram, SYSVAR_RENT_PUBKEY,
    TransactionMessage,
    VersionedTransaction
} from "@solana/web3.js";
import {PROGRAM_ID, Hourglass, HourglassAssociatedAccount} from "../sdk/src/generated";
import { Hourglass as HourglassSdk } from "../sdk";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction,
    createInitializeMint2Instruction, createMintToInstruction, getAssociatedTokenAddressSync,
    MINT_SIZE, TOKEN_2022_PROGRAM_ID,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {expect} from "chai";
import {it} from "mocha";

function handleAnchorError(err: AnchorError) {
    console.log(err.logs);
    throw err;
}

async function createToken(
    provider: AnchorProvider,
    tokenKeypair: Keypair,
) {
    const ix3 = SystemProgram.createAccount({
        lamports: await provider.connection.getMinimumBalanceForRentExemption(MINT_SIZE),
        space: MINT_SIZE,
        fromPubkey: provider.publicKey,
        newAccountPubkey: tokenKeypair.publicKey,
        programId: TOKEN_PROGRAM_ID
    });

    const ix = createInitializeMint2Instruction(
        tokenKeypair.publicKey,
        6,
        provider.publicKey,
        provider.publicKey
    );

    const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();

    const message = new TransactionMessage({
        payerKey: provider.publicKey,
        instructions: [ix3, ix, ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200_000 })],
        recentBlockhash: blockhash
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);
    transaction.sign([tokenKeypair]);
    const signed = await provider.wallet.signTransaction(transaction);
    const signature = await provider.connection.sendRawTransaction(signed.serialize());

    await provider.connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature
    });

    return signature;
}

async function mintToken(
    user: PublicKey,
    mint: PublicKey,
    amount: number,
    provider: AnchorProvider
) {
    const ata = getAssociatedTokenAddressSync(
        mint,
        user
    );

    const ix = createAssociatedTokenAccountIdempotentInstruction(
        provider.publicKey,
        ata,
        user,
        mint
    );

    const mintIx = createMintToInstruction(
        mint,
        ata,
        provider.publicKey,
        amount * Math.pow(10, 6)
    );

    const { blockhash, lastValidBlockHeight } = await provider.connection.getLatestBlockhash();

    const message = new TransactionMessage({
        payerKey: provider.publicKey,
        instructions: [ix, mintIx, ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 200_000 })],
        recentBlockhash: blockhash
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);
    const signed = await provider.wallet.signTransaction(transaction);
    const signature = await provider.connection.sendRawTransaction(signed.serialize());

    await provider.connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature
    });

    return signature;
}

describe("hourglass-protocol", () => {
    const provider: AnchorProvider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);
    const program = anchor.workspace.HourglassProtocol as Program<HourglassProtocol>;

    const [hourglassProtocol] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_protocol")
        ],
        PROGRAM_ID
    );

    const feeCollector = Keypair.generate();
    const user = Keypair.generate();
    let settlementToken: PublicKey;
    let auctionWinner = Keypair.generate();
    let buyer: Keypair;

    before(async () => {
        let d = Keypair.generate();
        await createToken(provider, d);
        settlementToken = d.publicKey;
    });

    it("Initializes protocol", async () => {
        await program
            .methods
            .initializeProtocol(
                new BN(500) // 5%
            )
            .accounts({
                admin: provider.publicKey,
                systemProgram: SystemProgram.programId,
                hourglassProtocol,
                feeCollector: feeCollector.publicKey,
            })
            .rpc();

        const {
            feeCollector: setFeeCollector,
            admin,
            totalHourglasses,
            totalCreators,
            feeBps
        } = await Hourglass.fromAccountAddress(
            provider.connection,
            hourglassProtocol
        );

        expect(feeBps.toString()).eq("500");
        expect(admin.toString()).eq(provider.publicKey.toString());
        expect(totalHourglasses.toString()).eq("0");
        expect(totalCreators.toString()).eq("0");
    });

    it("Creates a Hourglass", async () => {
        const {
            totalHourglasses
        } = await Hourglass.fromAccountAddress(
            provider.connection,
            hourglassProtocol
        );

        const hourglassMint = Keypair.generate();

        await provider.connection.requestAirdrop(
            user.publicKey,
            5 * LAMPORTS_PER_SOL
        );

        await new Promise(resolve => setTimeout(resolve, 5000));

        const hourglassAssociatedAccount = HourglassSdk.deriveHourglassAssociatedAccount(new BN(totalHourglasses))
        const hourglassVault = HourglassSdk.deriveHourglassVault(
            hourglassMint.publicKey,
            hourglassAssociatedAccount
        );

        await program
            .methods
            .createHourglass({
                hourglassId: new BN(totalHourglasses),
                name: "Hourglass #1 - Toly",
                auctionLength: new BN(1 * 60), // 1 minute
                gracePeriod: new BN(1 * 60), // minute
                minimumBid: new BN(100 * Math.pow(10, 6)),
                taxRateBps: new BN(150), // 1.5%
                ownershipPeriod: new BN(1 * 60), // minute
                symbol: "HOURGLASS",
                minimumSalePrice: new BN(1000 * Math.pow(10, 6)), // 1000 tokens
                metadataUri: "https://bafkreif4jnsgheen2vzjv4in76q2tegijggmzfijaplep45ir66gbygdui.ipfs.nftstorage.link/",
                creatorName: "Hourglass Creator",
                description: "Hourglass",
                image: "https://bafkreiefwviqmjyykws6k7oxckhr5lygywgau6ruscvhv5whyipyzrvwpi.ipfs.nftstorage.link/",
                royalties: new BN(500) // 5%
            })
            .accounts({
                hourglassProtocol,
                hourglassAssociatedAccount,
                hourglassMint: hourglassMint.publicKey,
                creator: user.publicKey,
                creatorHourglassAccount: HourglassSdk.deriveHourglassCreatorAccount(user.publicKey),
                hourglassVault,
                settlementToken,
                token2022Program: TOKEN_2022_PROGRAM_ID,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rentProgram: SYSVAR_RENT_PUBKEY
            })
            .signers([user, hourglassMint])
            .rpc();

        await new Promise(resolve => setTimeout(resolve, 5000));

        const {
            hourglass,
            creator,
            settlementToken: setSettlementToken,
            ownershipPeriodIndex,
            auctionLength,
            currentOwner,
            nextAuctionId,
            taxRateBps,
            ownedTill,
            gracePeriod,
            messageId,
            minimumBid,
            minimumSalePrice,
            currentPrice,
            ownershipPeriod,
            royalties,
            graceTill
        } = await HourglassAssociatedAccount
            .fromAccountAddress(
                provider.connection,
                hourglassAssociatedAccount
            );

        expect(hourglass.toString()).eq(hourglassMint.publicKey.toString());
        expect(creator.toString()).eq(user.publicKey.toString());
        expect(setSettlementToken.toString()).eq(setSettlementToken.toString());
        expect(ownershipPeriodIndex.toString()).eq("0");
        expect(auctionLength.toString()).eq("60");
        expect(currentOwner.toString()).eq(hourglassAssociatedAccount.toString());
        expect(nextAuctionId.toString()).eq("0");
        expect(taxRateBps.toString()).eq("150");
        expect(ownedTill.toString()).eq("0");
        expect(gracePeriod.toString()).eq("60");
        expect(messageId.toString()).eq("0");
        expect(minimumBid.toString()).eq(`${100 * Math.pow(10, 6)}`);
        expect(minimumSalePrice.toString()).eq(`${1000 * Math.pow(10, 6)}`);
        expect(currentPrice.toString()).eq("0");
        expect(ownershipPeriod.toString()).eq("60");
        expect(royalties.toString()).eq("500");
        expect(graceTill.toString()).eq("0");
    });

    it("Puts hourglass on an auction", async () => {
        const hourglassId = new BN(0);
        const hourglassAssociatedAccount = HourglassSdk.deriveHourglassAssociatedAccount(hourglassId);

        const {
            hourglass: hourglassMint,
            nextAuctionId
        } = await HourglassAssociatedAccount.fromAccountAddress(
            provider.connection,
            hourglassAssociatedAccount
        );

        const hourglassVault = HourglassSdk.deriveHourglassVault(
            hourglassMint,
            hourglassAssociatedAccount
        );

        const hourglassAuction = HourglassSdk.deriveHourglassAuction(
            hourglassId,
            new BN(nextAuctionId)
        );

        await program
            .methods
            .initializeAuction(hourglassId)
            .accounts({
                creator: user.publicKey,
                hourglassAssociatedAccount,
                hourglassMint,
                hourglassVault,
                hourglassAuction,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .signers([user])
            .rpc();
    });

    it('Creates fake users and makes bids.', async () => {
        const hourglassId = new BN(0);
        const hourglassAssociatedAccount = HourglassSdk.deriveHourglassAssociatedAccount(hourglassId);

        const {
            hourglass: hourglassMint,
            nextAuctionId
        } = await HourglassAssociatedAccount.fromAccountAddress(
            provider.connection,
            hourglassAssociatedAccount
        );

        const currentAuctionId = new BN(nextAuctionId).subn(1);
        const hourglassAuction = HourglassSdk.deriveHourglassAuction(hourglassId, currentAuctionId);

        const users: Keypair[] = [];

        for (let i = 0; i < 10; i++) {
            const user = Keypair.generate();

            await provider.connection.requestAirdrop(
                user.publicKey,
                5 * LAMPORTS_PER_SOL
            );

            await mintToken(
                user.publicKey,
                settlementToken,
                100_000,
                provider
            );

            users.push(user);
        }

        await new Promise(resolve => setTimeout(resolve, 5000));

        for (let i = 0; i < 10; i++) {
            const user = users[i];
            const amount = new BN((i + 1) * 1000 * Math.pow(10, 6));

            const userAuctionAccount = HourglassSdk.deriveUserAuctionAccount(
                user.publicKey,
                hourglassId,
                currentAuctionId
            );

            const userSettlementTokenAta = getAssociatedTokenAddressSync(
                settlementToken,
                user.publicKey
            );

            const userAuctionAccountVault = getAssociatedTokenAddressSync(
                settlementToken,
                userAuctionAccount,
                true
            );

            await program
                .methods
                .bid(
                    new BN(hourglassId),
                    currentAuctionId,
                    amount
                )
                .accounts({
                    user: user.publicKey,
                    hourglassAssociatedAccount,
                    hourglassAuction,
                    userAuctionAccount,
                    settlementToken,
                    userSettlementTokenAta,
                    userAuctionAccountVault,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                })
                .signers([user])
                .rpc();
        }

        auctionWinner = users.at(-1);
    });

    it("Claim hourglass from the auction", async () => {
        const instantSalePrice = new BN(50_000 * Math.pow(10, 6));
        const hourglassId = new BN(0);
        const hourglassAssociatedAccount = HourglassSdk
            .deriveHourglassAssociatedAccount(hourglassId);

        const {
            hourglass: hourglassMint,
            nextAuctionId,
            creator,
            ownershipPeriodIndex,
            auctionLength
        } = await HourglassAssociatedAccount.fromAccountAddress(
            provider.connection,
            hourglassAssociatedAccount
        );

        await new Promise(resolve => setTimeout(resolve, new BN(auctionLength).toNumber() * 1000));

        const hourglassCreatorAccount = HourglassSdk.deriveHourglassCreatorAccount(creator);
        const currentAuctionId = new BN(nextAuctionId).subn(1);
        const hourglassAuction = HourglassSdk.deriveHourglassAuction(hourglassId, currentAuctionId);

        const userAuctionAccount = HourglassSdk.deriveUserAuctionAccount(auctionWinner.publicKey, hourglassId, currentAuctionId);
        const userTaxAccount = HourglassSdk.deriveUserTaxAccount(
            auctionWinner.publicKey,
            hourglassId,
            new BN(ownershipPeriodIndex)
        );

        const hourglassVault = HourglassSdk.deriveHourglassVault(
            hourglassMint,
            hourglassAssociatedAccount
        );

        const userHourglassAta = getAssociatedTokenAddressSync(
            hourglassMint,
            auctionWinner.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID
        );

        const initializeAtaIx = createAssociatedTokenAccountIdempotentInstruction(
            auctionWinner.publicKey,
            userHourglassAta,
            auctionWinner.publicKey,
            hourglassMint,
            TOKEN_2022_PROGRAM_ID
        );

        const userAuctionAccountAta = getAssociatedTokenAddressSync(
            settlementToken,
            userAuctionAccount,
            true,
            TOKEN_PROGRAM_ID
        );

        const hourglassCreatorAccountAta = getAssociatedTokenAddressSync(
            settlementToken,
            hourglassCreatorAccount,
            true,
            TOKEN_PROGRAM_ID
        );

        await program
            .methods
            .claimHourglass(
                hourglassId,
                currentAuctionId,
                instantSalePrice
            )
            .accounts({
                user: auctionWinner.publicKey,
                creator,
                hourglassAssociatedAccount,
                hourglassCreatorAccount,
                hourglassAuction,
                userAuctionAccount,
                hourglassMint,
                userTaxAccount,
                hourglassVault,
                userHourglassAta,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                token2022Program: TOKEN_2022_PROGRAM_ID,
                settlementToken,
                userAuctionAccountAta,
                hourglassCreatorAccountAta,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            })
            .preInstructions([initializeAtaIx])
            .signers([auctionWinner])
            .rpc()
            .catch(err => handleAnchorError(err));
    });

    it('Buys hourglass from the open market.', async () => {
        const hourglassId = new BN(0);
        buyer = Keypair.generate();

        const instantSalePrice = new BN(50_000 * Math.pow(10, 6));
        const hourglassAssociatedAccount = HourglassSdk
            .deriveHourglassAssociatedAccount(hourglassId);

        const {
            hourglass: hourglassMint,
            nextAuctionId,
            creator,
            ownershipPeriodIndex,
            currentOwner
        } = await HourglassAssociatedAccount.fromAccountAddress(
            provider.connection,
            hourglassAssociatedAccount
        );

        await provider.connection.requestAirdrop(
            buyer.publicKey,
            5 * LAMPORTS_PER_SOL
        );

        await mintToken(
            buyer.publicKey,
            settlementToken,
            instantSalePrice.toNumber(),
            provider
        );

        await new Promise(resolve => setTimeout(resolve, 5000));

        const userHourglassAta = getAssociatedTokenAddressSync(
            hourglassMint,
            buyer.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID
        );

        const userSettlementTokenAta = getAssociatedTokenAddressSync(
            settlementToken,
            buyer.publicKey,
            false,
            TOKEN_PROGRAM_ID
        );

        const sellerSettlementTokenAta = getAssociatedTokenAddressSync(
            settlementToken,
            currentOwner,
            false,
            TOKEN_PROGRAM_ID
        );

        const hourglassCreatorAccount = HourglassSdk
            .deriveHourglassCreatorAccount(creator);

        const creatorHourglassAccountSettlementTokenAta = getAssociatedTokenAddressSync(
            settlementToken,
            hourglassCreatorAccount,
            true,
            TOKEN_PROGRAM_ID
        );

        const sellerHourglassAta = getAssociatedTokenAddressSync(
            hourglassMint,
            currentOwner,
            true,
            TOKEN_2022_PROGRAM_ID
        );

        const userTaxAccount = HourglassSdk
            .deriveUserTaxAccount(
                buyer.publicKey,
                hourglassId,
                new BN(ownershipPeriodIndex)
            );

        const hourglassVault = HourglassSdk
            .deriveHourglassVault(
                hourglassMint,
                hourglassAssociatedAccount
            );

        await program
            .methods
            .purchaseHourglass(
                hourglassId,
            )
            .accounts({
                user: buyer.publicKey,
                seller: currentOwner,
                hourglassAssociatedAccount,
                settlementToken,
                hourglassMint,
                userHourglassAta,
                userSettlementTokenAta,
                sellerSettlementTokenAta,
                creatorHourglassAccountSettlementTokenAta,
                sellerHourglassAta,
                creatorHourglassAccount: hourglassCreatorAccount,
                creator,
                userTaxAccount,
                hourglassVault,
                systemProgram: SystemProgram.programId,
                token2022Program: TOKEN_2022_PROGRAM_ID,
                tokenProgram: TOKEN_PROGRAM_ID,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            })
            .signers([buyer])
            .rpc()
            .catch(err => handleAnchorError(err));
    });

    it('Pays tax after purchase.', async () => {
        const hourglassId = new BN(0);

        const hourglassAssociatedAccount = HourglassSdk
            .deriveHourglassAssociatedAccount(hourglassId);

        const {
            ownershipPeriodIndex,
            hourglass: hourglassMint,
            creator
        } = await HourglassAssociatedAccount
            .fromAccountAddress(
                provider.connection,
                hourglassAssociatedAccount
            );

        const userTaxAccount = HourglassSdk
            .deriveUserTaxAccount(
                buyer.publicKey,
                hourglassId,
                new BN(ownershipPeriodIndex).subn(1)
            );

        const nextUserTaxAccount = HourglassSdk
            .deriveUserTaxAccount(
                buyer.publicKey,
                hourglassId,
                new BN(ownershipPeriodIndex)
            );

        const hourglassVault = HourglassSdk
            .deriveHourglassVault(
                hourglassMint,
                hourglassAssociatedAccount
            );

        const userHourglassAta = getAssociatedTokenAddressSync(
            hourglassMint,
            buyer.publicKey,
            true,
            TOKEN_2022_PROGRAM_ID
        );

        const userSettlementTokenAta = getAssociatedTokenAddressSync(
            settlementToken,
            buyer.publicKey,
            true,
            TOKEN_PROGRAM_ID
        );

        const creatorHourglassAccount = HourglassSdk
            .deriveHourglassCreatorAccount(creator);

        const hourglassCreatorAccountSettlementTokenAta = getAssociatedTokenAddressSync(
            settlementToken,
            creatorHourglassAccount,
            true,
            TOKEN_PROGRAM_ID
        );

        await program
            .methods
            .payTax(hourglassId)
            .accounts({
                user: buyer.publicKey,
                hourglassAssociatedAccount,
                userTaxAccount,
                userNextTaxAccount: nextUserTaxAccount,
                hourglassMint,
                hourglassVault,
                userHourglassAta,
                creatorHourglassAccount,
                creator,
                token2022Program: TOKEN_2022_PROGRAM_ID,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                settlementToken,
                userSettlementTokenAta,
                hourglassCreatorAccountSettlementTokenAta,
            })
            .signers([buyer])
            .rpc();
    });

    it("Validates tax, fails with OwnershipPeriodNotEnded.", async () => {
        const hourglassId = new BN(0);
        const hourglassAssociatedAccount = HourglassSdk
            .deriveHourglassAssociatedAccount(hourglassId);

        const {
            ownershipPeriodIndex,
            hourglass: hourglassMint,
            ownershipPeriod,
            ownedTill
        } = await HourglassAssociatedAccount
            .fromAccountAddress(
                provider.connection,
                hourglassAssociatedAccount
            );

        const userTaxAccount = HourglassSdk
            .deriveUserTaxAccount(
                buyer.publicKey,
                hourglassId,
                new BN(ownershipPeriodIndex).subn(1)
            );

        const hourglassVault = HourglassSdk
            .deriveHourglassVault(
                hourglassMint,
                hourglassAssociatedAccount
            );

        const hourglassOwnerAta = getAssociatedTokenAddressSync(
            hourglassMint,
            buyer.publicKey,
            true,
            TOKEN_2022_PROGRAM_ID
        );

        // Wait for the old ownership period to end.
        await new Promise(resolve => setTimeout(resolve, new BN(ownershipPeriod).muln(1000).toNumber()));

        let error: AnchorError;
        await program
            .methods
            .validateTax(
                hourglassId,
                buyer.publicKey // holder of the hourglass
            )
            .accounts({
                hourglassAssociatedAccount,
                userTaxAccount,
                hourglassVault,
                hourglassMint,
                hourglassOwnerAta,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
            })
            .rpc()
            .catch(err => error = err);

        expect(error?.message).to.include("OwnershipPeriodNotEnded");
    });

    it("Validates tax. Brings hourglass back to the owner.", async () => {
        const hourglassId = new BN(0);
        const hourglassAssociatedAccount = HourglassSdk
            .deriveHourglassAssociatedAccount(hourglassId);

        const {
            ownershipPeriodIndex,
            hourglass: hourglassMint,
            ownershipPeriod,
            ownedTill
        } = await HourglassAssociatedAccount
            .fromAccountAddress(
                provider.connection,
                hourglassAssociatedAccount
            );

        const userTaxAccount = HourglassSdk
            .deriveUserTaxAccount(
                buyer.publicKey,
                hourglassId,
                new BN(ownershipPeriodIndex).subn(1)
            );

        const hourglassVault = HourglassSdk
            .deriveHourglassVault(
                hourglassMint,
                hourglassAssociatedAccount
            );

        const hourglassOwnerAta = getAssociatedTokenAddressSync(
            hourglassMint,
            buyer.publicKey,
            true,
            TOKEN_2022_PROGRAM_ID
        );

        // Wait for the old ownership period to end.
        await new Promise(resolve => setTimeout(resolve, new BN(ownershipPeriod).muln(1000).toNumber()));

        let error: AnchorError;
        await program
            .methods
            .validateTax(
                hourglassId,
                buyer.publicKey // holder of the hourglass
            )
            .accounts({
                hourglassAssociatedAccount,
                userTaxAccount,
                hourglassVault,
                hourglassMint,
                hourglassOwnerAta,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
            })
            .rpc();
    });

    it('Reauctions the hourglass.', async () => {
        const hourglassId = new BN(0);
        const hourglassAssociatedAccount = HourglassSdk.deriveHourglassAssociatedAccount(hourglassId);

        const {
            hourglass: hourglassMint,
            nextAuctionId
        } = await HourglassAssociatedAccount.fromAccountAddress(
            provider.connection,
            hourglassAssociatedAccount
        );

        const hourglassVault = HourglassSdk.deriveHourglassVault(
            hourglassMint,
            hourglassAssociatedAccount
        );

        const hourglassAuction = HourglassSdk.deriveHourglassAuction(
            hourglassId,
            new BN(nextAuctionId)
        );

        await program
            .methods
            .initializeAuction(hourglassId)
            .accounts({
                creator: user.publicKey,
                hourglassAssociatedAccount,
                hourglassMint,
                hourglassVault,
                hourglassAuction,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
                systemProgram: SystemProgram.programId
            })
            .signers([user])
            .rpc();
    });

    it('Makes bids and wins the new auction. Cancels losing bids.', async () => {
        const hourglassId = new BN(0);
        const hourglassAssociatedAccount = HourglassSdk.deriveHourglassAssociatedAccount(hourglassId);

        const {
            hourglass: hourglassMint,
            nextAuctionId
        } = await HourglassAssociatedAccount.fromAccountAddress(
            provider.connection,
            hourglassAssociatedAccount
        );

        const currentAuctionId = new BN(nextAuctionId).subn(1);
        const hourglassAuction = HourglassSdk.deriveHourglassAuction(hourglassId, currentAuctionId);

        const users: Keypair[] = [];

        for (let i = 0; i < 10; i++) {
            const user = Keypair.generate();

            await provider.connection.requestAirdrop(
                user.publicKey,
                5 * LAMPORTS_PER_SOL
            );

            await mintToken(
                user.publicKey,
                settlementToken,
                100_000,
                provider
            );

            users.push(user);
        }

        await new Promise(resolve => setTimeout(resolve, 5000));

        for (let i = 0; i < 10; i++) {
            const user = users[i];
            const amount = new BN((i + 1) * 1000 * Math.pow(10, 6));

            const userAuctionAccount = HourglassSdk.deriveUserAuctionAccount(
                user.publicKey,
                hourglassId,
                currentAuctionId
            );

            const userSettlementTokenAta = getAssociatedTokenAddressSync(
                settlementToken,
                user.publicKey
            );

            const userAuctionAccountVault = getAssociatedTokenAddressSync(
                settlementToken,
                userAuctionAccount,
                true
            );

            await program
                .methods
                .bid(
                    new BN(hourglassId),
                    currentAuctionId,
                    amount
                )
                .accounts({
                    user: user.publicKey,
                    hourglassAssociatedAccount,
                    hourglassAuction,
                    userAuctionAccount,
                    settlementToken,
                    userSettlementTokenAta,
                    userAuctionAccountVault,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                })
                .signers([user])
                .rpc();
        }

        for (let i = 0; i < 9; i++) {
            const user = users[i];

            const userAuctionAccount = HourglassSdk.deriveUserAuctionAccount(
                user.publicKey,
                hourglassId,
                currentAuctionId
            );

            const userSettlementTokenAta = getAssociatedTokenAddressSync(
                settlementToken,
                user.publicKey
            );

            const userAuctionAccountVault = getAssociatedTokenAddressSync(
                settlementToken,
                userAuctionAccount,
                true
            );

            await program
                .methods
                .cancelBid(
                    hourglassId,
                    currentAuctionId
                )
                .accounts({
                    user: user.publicKey,
                    hourglassAssociatedAccount,
                    hourglassAuction,
                    userAuctionAccount,
                    settlementToken,
                    userSettlementTokenAta,
                    userAuctionAccountVault,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .signers([user])
                .rpc()
                .catch(err => handleAnchorError(err));
        }

        auctionWinner = users.at(-1);
    });

    it("Claims hourglass from the auction", async () => {
        const instantSalePrice = new BN(50_000 * Math.pow(10, 6));
        const hourglassId = new BN(0);
        const hourglassAssociatedAccount = HourglassSdk
            .deriveHourglassAssociatedAccount(hourglassId);

        const {
            hourglass: hourglassMint,
            nextAuctionId,
            creator,
            ownershipPeriodIndex,
            auctionLength
        } = await HourglassAssociatedAccount.fromAccountAddress(
            provider.connection,
            hourglassAssociatedAccount
        );

        await new Promise(resolve => setTimeout(resolve, new BN(auctionLength).toNumber() * 1000));

        const hourglassCreatorAccount = HourglassSdk.deriveHourglassCreatorAccount(creator);
        const currentAuctionId = new BN(nextAuctionId).subn(1);
        const hourglassAuction = HourglassSdk.deriveHourglassAuction(hourglassId, currentAuctionId);

        const userAuctionAccount = HourglassSdk.deriveUserAuctionAccount(auctionWinner.publicKey, hourglassId, currentAuctionId);
        const userTaxAccount = HourglassSdk.deriveUserTaxAccount(
            auctionWinner.publicKey,
            hourglassId,
            new BN(ownershipPeriodIndex)
        );

        const hourglassVault = HourglassSdk.deriveHourglassVault(
            hourglassMint,
            hourglassAssociatedAccount
        );

        const userHourglassAta = getAssociatedTokenAddressSync(
            hourglassMint,
            auctionWinner.publicKey,
            false,
            TOKEN_2022_PROGRAM_ID
        );

        const initializeAtaIx = createAssociatedTokenAccountIdempotentInstruction(
            auctionWinner.publicKey,
            userHourglassAta,
            auctionWinner.publicKey,
            hourglassMint,
            TOKEN_2022_PROGRAM_ID
        );

        const userAuctionAccountAta = getAssociatedTokenAddressSync(
            settlementToken,
            userAuctionAccount,
            true,
            TOKEN_PROGRAM_ID
        );

        const hourglassCreatorAccountAta = getAssociatedTokenAddressSync(
            settlementToken,
            hourglassCreatorAccount,
            true,
            TOKEN_PROGRAM_ID
        );

        await program
            .methods
            .claimHourglass(
                hourglassId,
                currentAuctionId,
                instantSalePrice
            )
            .accounts({
                user: auctionWinner.publicKey,
                creator,
                hourglassAssociatedAccount,
                hourglassCreatorAccount,
                hourglassAuction,
                userAuctionAccount,
                hourglassMint,
                userTaxAccount,
                hourglassVault,
                userHourglassAta,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID,
                token2022Program: TOKEN_2022_PROGRAM_ID,
                settlementToken,
                userAuctionAccountAta,
                hourglassCreatorAccountAta,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            })
            .preInstructions([initializeAtaIx])
            .signers([auctionWinner])
            .rpc()
            .catch(err => handleAnchorError(err));
    });

    it('Sends message.', async () => {
        const hourglassId = new BN(0);
        const hourglassAssociatedAccount = HourglassSdk
            .deriveHourglassAssociatedAccount(hourglassId);

        const {
            messageId
        } = await HourglassAssociatedAccount.fromAccountAddress(
            provider.connection,
            hourglassAssociatedAccount
        );

        const [message] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("message"),
                hourglassId.toArrayLike(Buffer, "be", 8),
                new BN(messageId).toArrayLike(Buffer, "be", 8),
            ],
            PROGRAM_ID
        );

        await program
            .methods
            .sendMessage(
                hourglassId,
                new BN(messageId),
                "sending test message"
            )
            .accounts({
                user: auctionWinner.publicKey,
                hourglassAssociatedAccount,
                message,
                systemProgram: SystemProgram.programId
            })
            .signers([auctionWinner])
            .rpc();
    });
});