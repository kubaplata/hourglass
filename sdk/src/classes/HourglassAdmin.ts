import {createInitializeProtocolInstruction, PROGRAM_ID} from "../generated";
import {BN} from "@coral-xyz/anchor";
import {PublicKey, SystemProgram} from "@solana/web3.js";
import {WRAPPED_SOL_MINT} from "@metaplex-foundation/js";
import {createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync} from "@solana/spl-token";

class HourglassAdmin {
    public hourglassProtocol: PublicKey;

    static initializeProtocol(
        signer: PublicKey,
        feeBps: BN,
    ) {

        const [hourglassProtocol] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("hourglass_protocol")
            ],
            PROGRAM_ID
        );

        const initializeProtocolInstruction = createInitializeProtocolInstruction(
            {
                admin: signer,
                hourglassProtocol,
                systemProgram: SystemProgram.programId,
                feeCollector: signer,
            },
            {
                fee: feeBps
            }
        );

        return [
            initializeProtocolInstruction
        ];
    }
}