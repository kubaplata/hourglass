import * as anchor from "@coral-xyz/anchor";
import {AnchorProvider, Program} from "@coral-xyz/anchor";
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

describe("insurance-fund", () => {
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
                auctionLength: new BN(5 * 60), // 5 minutes
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

        await Promise.all(users.map(async (user, index) => {
            const amount = new BN(index * 1000 * Math.pow(10, 6));
            const userAuctionAccount = HourglassSdk.deriveUserAuctionAccount(
                user.publicKey,
                hourglassId,
                currentAuctionId
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
                    userAuctionAccount
                })
                .signers([user])
                .rpc()
                .catch(err => console.log(err.logs));
        }));
    });
});