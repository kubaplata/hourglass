"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generated_1 = require("../generated");
const web3_js_1 = require("@solana/web3.js");
class HourglassAdmin {
    static initializeProtocol(signer, feeBps) {
        const [hourglassProtocol] = web3_js_1.PublicKey.findProgramAddressSync([
            Buffer.from("hourglass_protocol")
        ], generated_1.PROGRAM_ID);
        const initializeProtocolInstruction = (0, generated_1.createInitializeProtocolInstruction)({
            admin: signer,
            hourglassProtocol,
            systemProgram: web3_js_1.SystemProgram.programId,
            feeCollector: signer,
        }, {
            fee: feeBps
        });
        return [
            initializeProtocolInstruction
        ];
    }
}
