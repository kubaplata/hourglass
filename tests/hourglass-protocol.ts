import {
    createBidInstruction,
    createCancelBidInstruction,
    createClaimHourglassInstruction,
    createCreateHourglassInstruction,
    createInitializeAuctionInstruction,
    createInitializeProtocolInstruction, createPayTaxInstruction,
    createPurchaseHourglassInstruction,
    createSendMessageInstruction,
    createValidateTaxInstruction,
    Hourglass,
    HourglassAssociatedAccount,
    HourglassAuction,
    Message,
    PROGRAM_ID,
    UserAuctionAccount
} from "../js/hourglass_protocol/sdk";
import {
    Keypair,
    Connection,
    Transaction,
    TransactionInstruction, PublicKey, SystemProgram,
    ComputeBudgetProgram,
    SYSVAR_RENT_PUBKEY,
    SYSVAR_INSTRUCTIONS_PUBKEY
} from "@solana/web3.js";
import bs58 from "bs58";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    createAssociatedTokenAccountIdempotentInstruction,
    createAssociatedTokenAccountInstruction, createInitializeMint2Instruction,
    createMintToCheckedInstruction, createTransferInstruction,
    getAssociatedTokenAddressSync, MINT_SIZE, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {keypairIdentity, Metaplex} from "@metaplex-foundation/js";
import { ClockworkProvider } from "@clockwork-xyz/sdk";

const METAPLEX = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
// const ENDPOINT = "https://devnet.helius-rpc.com/?api-key=b512dcfe-ee18-42ea-b3c7-82dab825d317";
const ENDPOINT = "https://mainnet.helius-rpc.com/?api-key=b512dcfe-ee18-42ea-b3c7-82dab825d317";
const keypair = Keypair.fromSecretKey(Uint8Array.from([]));
const connection = new Connection(ENDPOINT);
const metaplex = new Metaplex(connection);
const anchorProvider = new AnchorProvider(
    connection,
    {
        publicKey: keypair.publicKey,
        signTransaction: () => null,
        signAllTransactions: () => null,
    },
    {}
);
const clockwork = ClockworkProvider.fromAnchorProvider(anchorProvider);

metaplex.use(keypairIdentity(keypair));

const ALICE = Keypair.generate();
const BOB = Keypair.generate();

async function airdrop() {
    // const aliceAirdrop = await connection.requestAirdrop(
    //     ALICE.publicKey,
    //     2
    // );
    
    // const bobAirdrop = await connection.requestAirdrop(
    //     BOB.publicKey,
    //     2
    // );

    const aliceAirdrop = await signAndSend([], SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: ALICE.publicKey,
        lamports: 2_000_000_000,
    }));

    const bobAirdrop = await signAndSend([], SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: BOB.publicKey,
        lamports: 2_000_000_000,
    }))

    console.log([
        aliceAirdrop,
        bobAirdrop
    ]);
}

function sleep(ms: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(null);
        }, ms)
    });
}

async function createCollection() {
    const {
        nft,
        metadataAddress,
        response,
        mintAddress,
        tokenAddress,
        masterEditionAddress
    } = await metaplex
        .nfts()
        .create({
            isCollection: true,
            name: "Example Collection",
            symbol: "EXM",
            uri: "https://bafkreihlnuk7atlxspx65lvdfdxaddmlcap6xifejafzqeyqpgg7lsf3sa.ipfs.nftstorage.link/",
            sellerFeeBasisPoints: 0
        });

    console.log({
        nft,
        metadataAddress,
        response,
        mintAddress,
        tokenAddress,
        masterEditionAddress
    });

    return {
        nft,
        metadataAddress,
        response,
        mintAddress,
        tokenAddress,
        masterEditionAddress
    }
}

async function createUsdc() {
    const token = Keypair.generate();
    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

    const createAccountIx = SystemProgram.createAccount({
        newAccountPubkey: token.publicKey,
        fromPubkey: keypair.publicKey,
        lamports,
        programId: TOKEN_PROGRAM_ID,
        space: MINT_SIZE
    });

    const createMintIx = createInitializeMint2Instruction(
        token.publicKey,
        6,
        keypair.publicKey,
        keypair.publicKey,
    );

    const ata = getAssociatedTokenAddressSync(
        token.publicKey,
        keypair.publicKey
    );

    const ataIx = createAssociatedTokenAccountInstruction(
        keypair.publicKey,
        ata,
        keypair.publicKey,
        token.publicKey
    );

    const mintToWalletIx = createMintToCheckedInstruction(
        token.publicKey,
        ata,
        keypair.publicKey,
        5_000_000 * Math.pow(10, 6),
        6
    );

    await signAndSend(
        [token],
        createAccountIx,
        createMintIx,
        ataIx,
        mintToWalletIx
    );

    return token.publicKey;
}

async function signAndSendWithKeypair(signers: Keypair[], ...instructions: TransactionInstruction[]) {
    const transaction = new Transaction();

    const priorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1_000_000
    });

    const computeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 1_000_000
    });

    transaction.add(priorityFee);
    transaction.add(computeUnits);

    for (let ix of instructions) {
        transaction.add(ix);
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.feePayer = signers[0].publicKey;
    transaction.recentBlockhash = blockhash;

    transaction.sign(...signers);

    const signature = await connection.sendRawTransaction(transaction.serialize(), { skipPreflight: true });
    await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature
    });

    return signature;
}

async function signAndSend(additionalSigners: Keypair[], ...instructions: TransactionInstruction[]) {
    const transaction = new Transaction();

    const priorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 2_500_000
    });

    const computeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 1_000_000
    });

    transaction.add(priorityFee);
    transaction.add(computeUnits);

    for (let ix of instructions) {
        transaction.add(ix);
    }

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.feePayer = keypair.publicKey;
    transaction.recentBlockhash = blockhash;

    transaction.sign(keypair, ...additionalSigners);

    const signature = await connection.sendRawTransaction(transaction.serialize(), { skipPreflight: true });
    await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature
    });

    return signature;
}

const [HOURGLASS_PROTOCOL] = PublicKey.findProgramAddressSync(
    [
        Buffer.from("hourglass_protocol")
    ],
    PROGRAM_ID
);

async function initializeProtocol(
    collection: PublicKey,
    feeSettlement: PublicKey
) {
    const feeSettlementAta = getAssociatedTokenAddressSync(
        feeSettlement,
        HOURGLASS_PROTOCOL,
        true
    );

    const ataIx = createAssociatedTokenAccountInstruction(
        keypair.publicKey,
        feeSettlementAta,
        HOURGLASS_PROTOCOL,
        feeSettlement
    );

    const ix = createInitializeProtocolInstruction(
        {
            admin: keypair.publicKey,
            hourglassProtocol: HOURGLASS_PROTOCOL,
            feeSettlementToken: feeSettlement,
            feeCollector: feeSettlementAta
        },
        {
            fee: 30
        },
        PROGRAM_ID
    );

    return await signAndSend([], ataIx, ix);
}

async function createHourglass() {
    const hourglassProtocol = await Hourglass.fromAccountAddress(
        connection,
        HOURGLASS_PROTOCOL
    );

    const {
        feeSettlementToken,
        totalHourglasses
    } = hourglassProtocol;

    const hourglassMintKeypair = Keypair.generate();

    const [hourglassCreatorPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_creator_account"),
            keypair.publicKey.toBytes()
        ],
        PROGRAM_ID
    );

    const creatorFeeSettlementTokenAccount = getAssociatedTokenAddressSync(
        feeSettlementToken,
        keypair.publicKey
    );

    const [hourglassAssociatedAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_associated_account"),
            new BN(totalHourglasses).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const hourglassVault = getAssociatedTokenAddressSync(
        hourglassMintKeypair.publicKey,
        hourglassAssociatedAccount,
        true,
        TOKEN_2022_PROGRAM_ID
    );

    const ix = createCreateHourglassInstruction(
        {
            creator: keypair.publicKey,
            hourglassProtocol: HOURGLASS_PROTOCOL,
            feeSettlementToken,
            hourglassMint: hourglassMintKeypair.publicKey,
            creatorHourglassAccount: hourglassCreatorPda,
            creatorFeeSettlementTokenAccount,
            hourglassAssociatedAccount,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
            rentProgram: SYSVAR_RENT_PUBKEY,
            hourglassVault,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        },
        {
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
        },
        PROGRAM_ID
    );

    const txId =  await signAndSend([hourglassMintKeypair], ix);

    await sleep(15_000);
    const associatedAccountData = await HourglassAssociatedAccount.fromAccountAddress(
        connection,
        hourglassAssociatedAccount,
        "confirmed"
    );

    console.log(associatedAccountData);

    return {
        txId,
        totalHourglasses
    };
}

async function initializeAuction(hourglassId: number | BN) {
    const [hourglassAssociatedAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_associated_account"),
            new BN(hourglassId).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    console.log("HAA:", hourglassAssociatedAccount.toString());

    const hourglassAssociatedAccountData = await HourglassAssociatedAccount.fromAccountAddress(
        connection,
        hourglassAssociatedAccount
    );

    const {
        hourglass: hourglassMint
    } = hourglassAssociatedAccountData;

    const hourglassVault = getAssociatedTokenAddressSync(
        hourglassMint,
        hourglassAssociatedAccount,
        true,
        TOKEN_2022_PROGRAM_ID
    );

    const [hourglassAuction] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_auction"),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                hourglassAssociatedAccountData.nextAuctionId
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    console.log("Auction:", hourglassAuction.toString());

    const ix = createInitializeAuctionInstruction(
        {
            creator: keypair.publicKey,
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

    const tx = await signAndSend([], ix);
    console.log({ tx });

    await sleep(15_000);

    return hourglassAssociatedAccountData.nextAuctionId;
}

async function testInitialization() {
  const token = await createUsdc();
  const collection = new PublicKey("HFvm7mBRFn5gBYiYxSPCTTa18RSGM6VSTZgRcf6c42hr");

  console.log("Created fake token and collection. Sleeping 30s for settlement & initializing protocol.");
  await sleep(30_000);

  const txId = await initializeProtocol(
      collection,
      token
  );
  console.log({ txId });
  console.log("Initialized protocol. Sleeping.");
  await sleep(30_000);
}

async function testHourglassCreation() {
    const {
        txId,
        totalHourglasses
    } = await createHourglass();
    console.log({ txId });

    return totalHourglasses;
}

async function getBid(hourglassId: number, bidder: Keypair) {
    const [hourglassAssociatedAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_associated_account"),
            new BN(hourglassId).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const [hourglassCreatorPda] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_creator_account"),
            keypair.publicKey.toBytes()
        ],
        PROGRAM_ID
    );

    console.log("HAA:", hourglassAssociatedAccount.toString());

    const hourglassAssociatedAccountData = await HourglassAssociatedAccount.fromAccountAddress(
        connection,
        hourglassAssociatedAccount
    );

    const auctionId = (typeof hourglassAssociatedAccountData.nextAuctionId == "number" ? hourglassAssociatedAccountData.nextAuctionId : hourglassAssociatedAccountData.nextAuctionId.toNumber()) - 1;

    const {
        hourglass: hourglassMint
    } = hourglassAssociatedAccountData;

    const [hourglassAuction] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_auction"),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                auctionId
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const auctionData = await HourglassAuction.fromAccountAddress(
        connection,
        hourglassAuction
    );

    const [userAuctionAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("user_auction_account"),
            bidder.publicKey.toBuffer(),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                auctionId
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const bidBalance = await connection.getBalance(userAuctionAccount);
    const auctionBalance = await connection.getBalance(hourglassAuction);
    const creatorBalance = await connection.getBalance(hourglassCreatorPda);
    const atabalance = await connection.getBalance(hourglassAssociatedAccount);

    const {
        bid,
    } = await UserAuctionAccount.fromAccountAddress(
        connection,
        userAuctionAccount
    );

    const locked = parseInt(bid.toString()) / Math.pow(10, 9);
    console.log({
        locked,
        bidBalance: bidBalance / Math.pow(10, 9),
        creatorBalance: creatorBalance / Math.pow(10, 9),
        creator: hourglassCreatorPda.toString(),
        auctionBalance,
        atabalance,
        hourglassAssociatedAccount: hourglassAssociatedAccount.toString(),
        hourglassCreatorPda: hourglassCreatorPda.toString(),
        hourglassAuction: hourglassAuction.toString(),
        userAuctionAccount: userAuctionAccount.toString()
    });

    if (locked > 0) {
        await cancelBid(
            hourglassId,
            auctionId,
            bidder
        );
    }
}

async function testBid(hourglassId: number, bidder: Keypair, sol: number) {
    const [hourglassAssociatedAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_associated_account"),
            new BN(hourglassId).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    console.log("HAA:", hourglassAssociatedAccount.toString());

    const hourglassAssociatedAccountData = await HourglassAssociatedAccount.fromAccountAddress(
        connection,
        hourglassAssociatedAccount
    );

    const auctionId = (typeof hourglassAssociatedAccountData.nextAuctionId == "number" ? hourglassAssociatedAccountData.nextAuctionId : hourglassAssociatedAccountData.nextAuctionId.toNumber()) - 1;

    const {
        hourglass: hourglassMint
    } = hourglassAssociatedAccountData;

    const [hourglassAuction] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_auction"),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                auctionId
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    console.log("Auction:", hourglassAuction.toString());

    const [userAuctionAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("user_auction_account"),
            bidder.publicKey.toBuffer(),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                auctionId
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const ix = createBidInstruction(
        {
            user: bidder.publicKey,
            hourglassAuction,
            hourglassAssociatedAccount,
            userAuctionAccount
        },
        {
            hourglassId,
            auctionId,
            bid: sol * Math.pow(10, 9)
        }
    );

    return await signAndSendWithKeypair([bidder], ix);
}

function getThreadId(
    authority: PublicKey,
    id: number
) {
    const [thread, bump] = clockwork.getThreadPDA(
        authority,
        `${id}`
    );

    return [thread, bump] as [PublicKey, number];
}

async function claimHourglass(hourglassId: number, auctionId: number, winner: Keypair, buyNow: number) {
    const [hourglassAssociatedAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_associated_account"),
            new BN(hourglassId).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const hourglassAssociatedAccountData = await HourglassAssociatedAccount.fromAccountAddress(
        connection,
        hourglassAssociatedAccount
    );

    const {
        hourglass: hourglassMint,
        creator,
        ownershipPeriodIndex
    } = hourglassAssociatedAccountData;

    const hourglassVault = getAssociatedTokenAddressSync(
        hourglassMint,
        hourglassAssociatedAccount,
        true,
        TOKEN_2022_PROGRAM_ID
    );

    const [hourglassCreatorAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_creator_account"),
            creator.toBytes()
        ],
        PROGRAM_ID
    );

    const [userAuctionAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("user_auction_account"),
            winner.publicKey.toBuffer(),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                auctionId
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const [hourglassAuction] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_auction"),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                auctionId
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const userHourglassAta = getAssociatedTokenAddressSync(
        hourglassMint,
        winner.publicKey,
        true,
        TOKEN_2022_PROGRAM_ID
    );

    const ataIx = createAssociatedTokenAccountInstruction(
        winner.publicKey,
        userHourglassAta,
        winner.publicKey,
        hourglassMint,
        TOKEN_2022_PROGRAM_ID
    );

    const [userTaxAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("user_tax_account"),
            winner.publicKey.toBuffer(),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                ownershipPeriodIndex
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const threadId = typeof hourglassAssociatedAccountData.clockworkThreadId === "number"
        ? hourglassAssociatedAccountData.clockworkThreadId
        : hourglassAssociatedAccountData.clockworkThreadId.toNumber();

    const [ thread ] = getThreadId(
        hourglassAssociatedAccount,
        threadId
    );

    const ix = createClaimHourglassInstruction(
        {
            clockworkProgram: clockwork.threadProgram.programId,
            creator: keypair.publicKey,
            hourglassAssociatedAccount,
            hourglassVault,
            hourglassMint,
            hourglassCreatorAccount,
            user: winner.publicKey,
            userAuctionAccount,
            hourglassAuction,
            userHourglassAta,
            userTaxAccount,
            thread,
            tokenProgram: TOKEN_2022_PROGRAM_ID
        },
        {
            auctionId,
            hourglassId,
            // Buy Now at 2 SOL
            instantSellPrice: buyNow * 1_000_000_000
        }
    );

    return await signAndSendWithKeypair([winner], ataIx, ix);
}

async function buyFromOpenMarket(hourglassId: number, buyer: Keypair) {
    const [hourglassAssociatedAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_associated_account"),
            new BN(hourglassId).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const hourglassAssociatedAccountData = await HourglassAssociatedAccount.fromAccountAddress(
        connection,
        hourglassAssociatedAccount
    );

    const {
        hourglass: hourglassMint,
        creator,
        ownershipPeriodIndex,
        currentOwner
    } = hourglassAssociatedAccountData;

    const hourglassVault = getAssociatedTokenAddressSync(
        hourglassMint,
        hourglassAssociatedAccount,
        true,
        TOKEN_2022_PROGRAM_ID
    );

    const [creatorHourglassAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_creator_account"),
            creator.toBytes()
        ],
        PROGRAM_ID
    );

    const userHourglassAta = getAssociatedTokenAddressSync(
        hourglassMint,
        buyer.publicKey,
        true,
        TOKEN_2022_PROGRAM_ID
    );

    const ataIx = createAssociatedTokenAccountInstruction(
        buyer.publicKey,
        userHourglassAta,
        buyer.publicKey,
        hourglassMint,
        TOKEN_2022_PROGRAM_ID
    );

    const sellerHourglassAta = getAssociatedTokenAddressSync(
        hourglassAssociatedAccount,
        currentOwner,
        false,
        TOKEN_2022_PROGRAM_ID
    );

    const [userTaxAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("user_tax_account"),
            buyer.publicKey.toBuffer(),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                (typeof ownershipPeriodIndex === "number" 
                    ? ownershipPeriodIndex 
                    : ownershipPeriodIndex.toNumber()
                )
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const threadId = typeof hourglassAssociatedAccountData.clockworkThreadId === "number"
        ? hourglassAssociatedAccountData.clockworkThreadId
        : hourglassAssociatedAccountData.clockworkThreadId.toNumber();

    const [ currentThread ] = getThreadId(
        hourglassAssociatedAccount,
        threadId - 1
    );

    const ix = createPurchaseHourglassInstruction(
        {
            clockworkProgram: clockwork.threadProgram.programId,
            creator,
            creatorHourglassAccount,
            hourglassMint,
            hourglassAssociatedAccount,
            hourglassVault,
            sellerHourglassAta,
            seller: currentOwner,
            user: buyer.publicKey,
            userTaxAccount,
            userHourglassAta,
            currentThread,
            tokenProgram: TOKEN_2022_PROGRAM_ID,
        },
        {
            hourglassId
        }
    );

    await signAndSendWithKeypair([buyer], ataIx, ix);
}

async function sendMessage(hourglassId: number, sender: Keypair, content: string) {
    const [hourglassAssociatedAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_associated_account"),
            new BN(hourglassId).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const hourglassAssociatedAccountData = await HourglassAssociatedAccount.fromAccountAddress(
        connection,
        hourglassAssociatedAccount
    );

    const {
        messageId
    } = hourglassAssociatedAccountData;

    const [ message ] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("message"),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                messageId
            ).toArrayLike(Buffer, "be", 8)
        ],
        PROGRAM_ID
    );

    const ix = createSendMessageInstruction(
        {
            message,
            hourglassAssociatedAccount,
            user: sender.publicKey
        },
        {
            hourglassId,
            messageId,
            messageContent: content
        }
    );

    await signAndSendWithKeypair([sender], ix);
}

async function payTax(
    hourglassId: number,
    payer: Keypair
) {
    const [hourglassAssociatedAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_associated_account"),
            new BN(hourglassId).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const hourglassAssociatedAccountData = await HourglassAssociatedAccount.fromAccountAddress(
        connection,
        hourglassAssociatedAccount
    );

    const {
        hourglass: hourglassMint,
        ownershipPeriodIndex,
        clockworkThreadId
    } = hourglassAssociatedAccountData;

    const hourglassVault = getAssociatedTokenAddressSync(
        hourglassMint,
        hourglassAssociatedAccount,
        true,
        TOKEN_2022_PROGRAM_ID
    );

    const userHourglassAta = getAssociatedTokenAddressSync(
        hourglassMint,
        payer.publicKey,
        true,
        TOKEN_2022_PROGRAM_ID
    );

    const [userTaxAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("user_tax_account"),
            payer.publicKey.toBuffer(),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                (typeof ownershipPeriodIndex === "number"
                        ? ownershipPeriodIndex
                        : ownershipPeriodIndex.toNumber()
                ) - 1
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const [userNextTaxAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("user_tax_account"),
            payer.publicKey.toBuffer(),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                (typeof ownershipPeriodIndex === "number"
                        ? ownershipPeriodIndex
                        : ownershipPeriodIndex.toNumber()
                )
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const threadId = typeof hourglassAssociatedAccountData.clockworkThreadId === "number"
        ? hourglassAssociatedAccountData.clockworkThreadId
        : hourglassAssociatedAccountData.clockworkThreadId.toNumber();

    const [ currentThread ] = getThreadId(
        hourglassAssociatedAccount,
        threadId - 1
    );

    // const ix = createPayTaxInstruction(
    //     {
    //         clockworkProgram: clockwork.threadProgram.programId,
    //         hourglassAssociatedAccount,
    //         hourglassMint,
    //         hourglassVault,
    //         user: payer.publicKey,
    //         userHourglassAta,
    //         tokenProgram: TOKEN_2022_PROGRAM_ID,
    //         userTaxAccount,
    //         userNextTaxAccount,
    //         currentThread,
    //     },
    //     {
    //         hourglassId
    //     }
    // );

    // return await signAndSendWithKeypair([payer], ix);
}

async function cancelBid(hourglassId: number, auctionId: number, bidder: Keypair) {
    const [hourglassAssociatedAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_associated_account"),
            new BN(hourglassId).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const [hourglassAuction] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_auction"),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                auctionId
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const [userAuctionAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("user_auction_account"),
            bidder.publicKey.toBuffer(),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                auctionId
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const ix = createCancelBidInstruction(
        {
            user: bidder.publicKey,
            hourglassAssociatedAccount,
            hourglassAuction,
            userAuctionAccount,
        },
        {
            auctionId,
            hourglassId
        }
    );

    return await signAndSendWithKeypair([bidder], ix);
}

async function getAuctionAccount(
    hourglassId: number,
    auctionId: number
) {
    const [hourglassAuction] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_auction"),
            new BN(
                hourglassId
            ).toArrayLike(Buffer, "be", 8),
            new BN(
                auctionId
            ).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const hourglassAuctionData = await HourglassAuction.fromAccountAddress(
        connection,
        hourglassAuction
    );

    return hourglassAuctionData;
}

async function getAssociatedHourglassAccount(
    hourglassId: number
) {
    const [hourglassAssociatedAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_associated_account"),
            new BN(hourglassId).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    const hourglassAssociatedAccountData = await HourglassAssociatedAccount.fromAccountAddress(
        connection,
        hourglassAssociatedAccount
    );

    return hourglassAssociatedAccountData;
}

async function reclaimHourglasses() {
    let index = 17;
    let ended = false;

    while (!ended) {
        console.log(index);
        const [hourglassAssociatedAccountPda] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("hourglass_associated_account"),
                new BN(index).toArrayLike(Buffer, "be", 8),
            ],
            PROGRAM_ID
        );

        let hourglassAssociatedAccount: HourglassAssociatedAccount | null = null;
        try {
            hourglassAssociatedAccount = await getAssociatedHourglassAccount(index);
        } catch (err) {
            hourglassAssociatedAccount = null;
        }
        if (!hourglassAssociatedAccount) continue;

        const now = Math.floor(Date.now() / 1000);

        const {
            ownedTill,
            hourglass,
            currentOwner,
            ownershipPeriodIndex
        } = hourglassAssociatedAccount;
        const parsedOwnedTill = typeof ownedTill === "number" ? ownedTill : ownedTill.toNumber();

        const hourglassOwnerAta = getAssociatedTokenAddressSync(
            hourglass,
            currentOwner,
            true,
            TOKEN_2022_PROGRAM_ID
        );

        const hourglassVault = getAssociatedTokenAddressSync(
            hourglass,
            hourglassAssociatedAccountPda,
            true,
            TOKEN_2022_PROGRAM_ID
        );

        const [userTaxAccount] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("user_tax_account"),
                currentOwner.toBuffer(),
                new BN(
                    index
                ).toArrayLike(Buffer, "be", 8),
                new BN(
                    (typeof ownershipPeriodIndex === "number"
                            ? ownershipPeriodIndex
                            : ownershipPeriodIndex.toNumber()
                    ) - 1
                ).toArrayLike(Buffer, "be", 8),
            ],
            PROGRAM_ID
        );

        if (parsedOwnedTill < now) {
            console.log(`Claiming ${index}`);
            const ix = createValidateTaxInstruction(
                {
                    tokenProgram: TOKEN_2022_PROGRAM_ID,
                    hourglassAssociatedAccount: hourglassAssociatedAccountPda,
                    hourglassMint: hourglass,
                    hourglassOwnerAta,
                    clockworkProgram: clockwork.threadProgram.programId,
                    hourglassVault,
                    userTaxAccount
                },
                {
                    hourglassId: index,
                    user: currentOwner
                }
            );

            try {
                const tx = await signAndSend([], ix);
                console.log(`Re-called Hourglass ${index}. TxId: ${ tx }`);
            } catch (err) {
                console.log(`Failed to claim. Error: ${err}`);
            }
        }

        index++;
    }
}

// Case 1
// Creator creates a Hourglass.
// Bob and Alice are bidding on the Hourglass, Alice wins.
// Bob cancels his bid and re-claims Solana.
// Alice lists the Hourglass & sends message.
// Bob tries to send message (should fail).
// Bob purchases the Hourglass. Should succeed.
// Bob does not pay the tax. Hourglass is brought back to the creator.
// Creator re-puts the Hourglass on the auction.
async function testCase1() {
    await airdrop();
    console.log("Airdropping to Alice & Bob. Awaiting 30 seconds for settlement.");
    await sleep(30_000);

    const id = await testHourglassCreation();
    console.log(`Created Hourglass #${id.toString()}. Awaiting 30 seconds for settlement.`);
    await sleep(30_000);

    const auctionId = await initializeAuction(id);
    console.log("Initializing auction. Awaiting 30 seconds for settlement.");
    await sleep(30_000);

    console.log("Testing Bids.")
    let aliceBalance = await connection.getBalance(ALICE.publicKey);
    console.log(`Alice balance is ${ Math.floor(aliceBalance / Math.pow(10, 9)) }. Alice is bidding 0.25 SOL.`);
    const aliceBid1 = await testBid(parseInt(id.toString()), ALICE, 0.25);
    console.log(`Alice bid has been sent. TxId: ${aliceBid1}. Awaiting 30 seconds for settlement`);
    await sleep(30_000);
    console.log("Alice bid settled. Refetching alice balance.");
    aliceBalance = await connection.getBalance(ALICE.publicKey);
    console.log(`Alice balance is: ${Math.floor(aliceBalance / Math.pow(10, 9))}`);
    console.log("Refetching auction account");
    let auctionAccount = await getAuctionAccount(parseInt(id.toString()), parseInt(auctionId.toString()));
    console.log(`Is alice current winner: ${ auctionAccount.currentWinner.toString() == ALICE.publicKey.toString() }`);
    console.log(`Is top bid 0.25 SOL: ${ auctionAccount.currentTopBid.toString() == `${0.25 * Math.pow(10, 9)}` }`);

    console.log("Bob is bidding. Is bidding 1 SOL");
    let bobBalance = await connection.getBalance(BOB.publicKey);
    console.log(`Bob balance pre-bid is: ${ bobBalance / Math.pow(10, 9) }`);
    const bobBid1 = await testBid(parseInt(id.toString()), BOB, 0.5);
    console.log(`Bob bid has been sent. TxId: ${bobBid1}. Awaiting 30 seconds for settlement`);
    await sleep(30_000);
    console.log("Bob bid settled. Refetching bob balance.");
    bobBalance = await connection.getBalance(BOB.publicKey);
    console.log(`Bob balance post-bid is: ${ bobBalance / Math.pow(10, 9) }`);
    console.log("Refetching auction account");
    auctionAccount = await getAuctionAccount(parseInt(id.toString()), parseInt(auctionId.toString()));
    console.log(`Is bob current winner: ${ auctionAccount.currentWinner.toString() == BOB.publicKey.toString() }`);
    console.log(`Is top bid 0.25 SOL: ${ auctionAccount.currentTopBid.toString() == `${1 * Math.pow(10, 9)}` }`);

    console.log(`Auction ends in: ${ (parseInt(auctionAccount.ended.toString()) - Math.floor(Date.now() / 1000)) / 60 } minutes`);
    console.log("Awaiting auction end. Sleeping for 5 minutes.");
    await sleep(5 * 60 * 1000);

    auctionAccount = await getAuctionAccount(parseInt(id.toString()), parseInt(auctionId.toString()));
    console.log(`Is auction ended: ${ Math.floor(Date.now() / 1000) > parseInt(auctionAccount.ended.toString()) }`);

    console.log("Now cancelling losing bid, and claiming Hourglass to the winner address.");
    const canceledAlice = await cancelBid(parseInt(id.toString()), parseInt(auctionId.toString()), ALICE);
    console.log("Cancelled alice bid. Txid: " + canceledAlice);
    console.log("Awaiting 30s settlement to verify balance changes");
    await sleep(30_000);
    aliceBalance = await connection.getBalance(ALICE.publicKey);
    console.log(`Alice balance is: ${Math.floor(aliceBalance / Math.pow(10, 9))}`);

    const claimed = await claimHourglass(parseInt(id.toString()), parseInt(auctionId.toString()), BOB, 1.5);
    console.log("Bob claimed the Hourglass. Txid: " + claimed);
    console.log("Awaiting 30s settlement to check state changes.");
    await sleep(30000);

    const hourglassAssociatedAccountData = await getAssociatedHourglassAccount(parseInt(id.toString()));
    console.log(`Is bob owner of the hourglass: ${ hourglassAssociatedAccountData.currentOwner.toString() === BOB.publicKey.toString() }`);
    console.log(`Hourglass is owned until: ${ (new Date(parseInt(hourglassAssociatedAccountData.ownedTill.toString()) * 1000)).toLocaleString() }`);
    console.log(`Hourglass ownership period increased: ${ hourglassAssociatedAccountData.ownershipPeriodIndex.toString() == "1" }`);
    console.log(`Tax validation thread initialized: ${ hourglassAssociatedAccountData.clockworkThreadId.toString() === "1" }`);

    const [hourglassAssociatedAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("hourglass_associated_account"),
            new BN(id).toArrayLike(Buffer, "be", 8),
        ],
        PROGRAM_ID
    );

    console.log("Verifying if thread has been initialized.");

    const [threadId] = getThreadId(
        hourglassAssociatedAccount,
        (typeof hourglassAssociatedAccountData.clockworkThreadId === "number" ? hourglassAssociatedAccountData.clockworkThreadId : hourglassAssociatedAccountData.clockworkThreadId.toNumber()) - 1
    );

    const thread = await clockwork.getThreadAccount(threadId);
    // @ts-ignore
    console.log(`Thread will invoke the transaction at: ${ (new Date(thread.trigger.timestamp.unixTs.toNumber())).toLocaleString() }`);
    // @ts-ignore
    console.log(`Thread will invoke the transaction at: ${ (new Date(thread.trigger.timestamp.unixTs.toNumber() * 1000)).toLocaleString() }`);

    console.log("Sending messages using BOB.")
    const bobMessage = await sendMessage(parseInt(id.toString()), BOB, "HEY HEY");
    await sleep(30_000);
    console.log("Bob sent the message");
    const [message0] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("message"),
            new BN(id).toArrayLike(Buffer, "be", 8),
            new BN(0).toArrayLike(Buffer, "be", 8),,
        ],
        PROGRAM_ID
    );
    const message0data = await Message.fromAccountAddress(connection, message0);
    console.log("Message 0 content: ", message0data.content);

    console.log("Responding using hourglass creator")
    const sent2 = await sendMessage(parseInt(id.toString()), keypair, "HEY HEY");
    await sleep(30_000);
    console.log("sent: ", sent2);
    const [message1] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("message"),
            new BN(id).toArrayLike(Buffer, "be", 8),
            new BN(0).toArrayLike(Buffer, "be", 8),,
        ],
        PROGRAM_ID
    );
    const message1data = await Message.fromAccountAddress(connection, message1);
    console.log("Message 1 content: ", message0data.content);

    const beforeTaxPayment = await getAssociatedHourglassAccount(parseInt(id.toString()));
    console.log("Before paying tax. Hourglass is owned till:", new Date(parseInt(beforeTaxPayment.ownedTill.toString()) * 1000).toLocaleString());
    const paidTax = await payTax(parseInt(id.toString()), BOB);
    console.log("Paid tax. Awaiting 30 seconds for settlement.");
    await sleep(30_000);
    const afterTaxPayment = await getAssociatedHourglassAccount(parseInt(id.toString()));
    console.log("After paying tax. Hourglass is owned till:", new Date(parseInt(afterTaxPayment.ownedTill.toString()) * 1000).toLocaleString());


}

// Case 2
// Creator creates a Hourglass. 
// Bob and Alice are bidding on the Hourglass, Alice wins.
// Bob cancels his bid and re-claims Solana.
// Alice sends message.
// Alice pays tax.

// Case 3
// Creator creates a Hourglass.
// Bob and Alice are bidding on the Hourglass, Alice wins.
// Alice does not pay the tax.

// (async () => {
//     // const id = await testHourglassCreation();
//     // await sleep(15_000);
//     // await initializeAuction(id);
//     // await testInitialization();
//     const hourglassProtocol = await Hourglass.fromAccountAddress(
//         connection,
//         HOURGLASS_PROTOCOL
//     );
//
//     const {
//         totalHourglasses
//     } = hourglassProtocol;
//
//     console.log(hourglassProtocol);
//
//     console.log(totalHourglasses);
//     console.log(typeof totalHourglasses === "number" ? totalHourglasses : totalHourglasses.toNumber());
//
//     console.log(await testBid(16));
// })();

// (async () => {
//     // const id = await testHourglassCreation();
//     // console.log("Hourglass Created. Awaiting 15s");
//     // await sleep(15_000);

//     // const auction = await initializeAuction(id);
//     // console.log("Auction Created. Awaiting 15s");
//     // await sleep(30_000);

//     // await testBid(
//     //     typeof id === "number" ? id : id.toNumber()
//     // );
//     // console.log("Bid Created. Test Ended.");

//     const hourglass = await HourglassAuction.fromAccountAddress(
//         connection,
//         new PublicKey("7CqHCcQ39e5yLaQNWTVQeac8PGe9af8YaWGeFivkWbLc")
//     );

//     // console.log(await HourglassAuction.fromAccountAddress(
//     //     connection,
//     //     new PublicKey("7CqHCcQ39e5yLaQNWTVQeac8PGe9af8YaWGeFivkWbLc")
//     // ));

//     console.log({
//         ...hourglass,
//         currentTopBid: hourglass.currentTopBid.toString(),
//         currentWinner: hourglass.currentWinner.toString(),
//         started: hourglass.started.toString(),
//         ended: hourglass.ended.toString()
//     });
// })();

// (async () => {
//     try {
//         // await testInitialization();
//         await testCase1();
//     } catch (err) {
//         console.log(err);
//     }
// })();

(async () => {
    let {
        totalHourglasses
    } = await Hourglass.fromAccountAddress(
        connection,
        HOURGLASS_PROTOCOL
    );

    totalHourglasses = parseInt(totalHourglasses.toString());
    console.log({ totalHourglasses });

    for (let i = 0; i < 4; i++) {
        try {
            const locked = await getBid(
                i,
                BOB
            );

            console.log({ locked });
        } catch (err) {
            console.log("did not bid.");
        }
    }
})();

// (async () => {
//     try {
//         await reclaimHourglasses();
//     } catch (err) {
//         console.log(err);
//     }
// })();