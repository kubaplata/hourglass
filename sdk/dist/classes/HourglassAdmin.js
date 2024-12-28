"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generated_1 = require("../generated");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
class HourglassAdmin {
    static initializeProtocol(signer, feeBps, settlementToken) {
        const [hourglassProtocol] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("hourglass_protocol")
        ], generated_1.PROGRAM_ID);
        const feeCollector = (0, spl_token_1.getAssociatedTokenAddressSync)(settlementToken, hourglassProtocol, true);
        const initializeFeeCollectorInstruction = (0, spl_token_1.createAssociatedTokenAccountInstruction)(signer, feeCollector, hourglassProtocol, settlementToken);
        const initializeProtocolInstruction = (0, generated_1.createInitializeProtocolInstruction)({
            admin: signer,
            hourglassProtocol,
            systemProgram: web3_js_1.SystemProgram.programId,
            feeSettlementToken: settlementToken,
            feeCollector,
        }, {
            fee: feeBps
        });
        return [
            initializeFeeCollectorInstruction,
            initializeProtocolInstruction
        ];
    }
}
