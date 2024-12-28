"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountProviders = void 0;
__exportStar(require("./Hourglass"), exports);
__exportStar(require("./HourglassAssociatedAccount"), exports);
__exportStar(require("./HourglassAuction"), exports);
__exportStar(require("./HourglassCreatorAccount"), exports);
__exportStar(require("./Message"), exports);
__exportStar(require("./UserAuctionAccount"), exports);
__exportStar(require("./UserTaxAccount"), exports);
const HourglassAssociatedAccount_1 = require("./HourglassAssociatedAccount");
const HourglassAuction_1 = require("./HourglassAuction");
const HourglassCreatorAccount_1 = require("./HourglassCreatorAccount");
const Hourglass_1 = require("./Hourglass");
const Message_1 = require("./Message");
const UserAuctionAccount_1 = require("./UserAuctionAccount");
const UserTaxAccount_1 = require("./UserTaxAccount");
exports.accountProviders = {
    HourglassAssociatedAccount: HourglassAssociatedAccount_1.HourglassAssociatedAccount,
    HourglassAuction: HourglassAuction_1.HourglassAuction,
    HourglassCreatorAccount: HourglassCreatorAccount_1.HourglassCreatorAccount,
    Hourglass: Hourglass_1.Hourglass,
    Message: Message_1.Message,
    UserAuctionAccount: UserAuctionAccount_1.UserAuctionAccount,
    UserTaxAccount: UserTaxAccount_1.UserTaxAccount,
};
