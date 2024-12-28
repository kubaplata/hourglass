"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generated_1 = require("../generated");
const bn_js_1 = __importDefault(require("bn.js"));
const web3_js_1 = require("@solana/web3.js");
const Hourglass_1 = require("./Hourglass");
const spl_token_1 = require("@solana/spl-token");
class HourglassCrank {
    constructor(connection) {
        this.connection = connection;
    }
    validateTax(hourglassId) {
        return __awaiter(this, void 0, void 0, function* () {
            const hourglassAssociatedAccount = Hourglass_1.Hourglass.deriveHourglassAssociatedAccount(hourglassId);
            const { hourglass: hourglassMint, creator, ownershipPeriodIndex, currentOwner } = yield generated_1.HourglassAssociatedAccount.fromAccountAddress(this.connection, hourglassAssociatedAccount);
            const hourglassVault = Hourglass_1.Hourglass.deriveHourglassVault(hourglassMint, hourglassAssociatedAccount);
            const hourglassCreatorAccount = Hourglass_1.Hourglass.deriveHourglassCreatorAccount(creator);
            const hourglassOwnerAta = (0, spl_token_1.getAssociatedTokenAddressSync)(hourglassMint, currentOwner, true, spl_token_1.TOKEN_2022_PROGRAM_ID);
            const userTaxAccount = Hourglass_1.Hourglass.deriveUserTaxAccount(currentOwner, hourglassId, new bn_js_1.default(ownershipPeriodIndex));
            const ix = (0, generated_1.createValidateTaxInstruction)({
                hourglassMint,
                hourglassVault,
                userTaxAccount,
                hourglassAssociatedAccount,
                hourglassOwnerAta,
                systemProgram: web3_js_1.SystemProgram.programId,
                tokenProgram: spl_token_1.TOKEN_2022_PROGRAM_ID,
            }, {
                hourglassId,
                user: currentOwner
            });
            return ix;
        });
    }
}
