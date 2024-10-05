import {Connection, PublicKey} from "@solana/web3.js";
import {AnchorProvider} from "@coral-xyz/anchor";
import {ClockworkProvider} from "@clockwork-xyz/sdk";

class Hourglass {
    public connection: Connection;
    public clockwork: ClockworkProvider;
    constructor(
        connection: Connection,
        user: PublicKey
    ) {
        this.connection = connection;

        const anchorProvider = new AnchorProvider(
            connection,
            {
                publicKey: user,
                signTransaction: () => null,
                signAllTransactions: () => null,
            },
            {}
        );
        const clockwork = ClockworkProvider.fromAnchorProvider(anchorProvider);
        this.clockwork = clockwork;
    }


}