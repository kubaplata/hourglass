import {createValidateTaxInstruction, HourglassAssociatedAccount} from "../generated";
import BN from "bn.js";
import {Connection, SystemProgram} from "@solana/web3.js";
import { Hourglass } from "./Hourglass";
import {getAssociatedTokenAddressSync, TOKEN_2022_PROGRAM_ID} from "@solana/spl-token";

class HourglassCrank {
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    async validateTax(
        hourglassId: BN
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

        const hourglassOwnerAta = getAssociatedTokenAddressSync(
            hourglassMint,
            currentOwner,
            true,
            TOKEN_2022_PROGRAM_ID
        );

        const userTaxAccount = Hourglass.deriveUserTaxAccount(
            currentOwner,
            hourglassId,
            new BN(ownershipPeriodIndex)
        );

        const ix = createValidateTaxInstruction(
            {
                hourglassMint,
                hourglassVault,
                userTaxAccount,
                hourglassAssociatedAccount,
                hourglassOwnerAta,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_2022_PROGRAM_ID,
            },
            {
                hourglassId,
                user: currentOwner
            }
        );

        return ix;
    }
}