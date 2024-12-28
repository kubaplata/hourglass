/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
type ErrorWithCode = Error & {
    code: number;
};
type MaybeErrorWithCode = ErrorWithCode | null | undefined;
/**
 * InvalidHoourglassID: 'Invalid Hourglass ID. Make sure Hourglass ID matches total_hourglass field in main Hourglass Protocol PDA.'
 *
 * @category Errors
 * @category generated
 */
export declare class InvalidHoourglassIDError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
/**
 * InvalidSigners: 'Invalid signers. Make sure Hourglass mint is signing the transaction.'
 *
 * @category Errors
 * @category generated
 */
export declare class InvalidSignersError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
/**
 * BidTooLow: 'Bid value is too low.'
 *
 * @category Errors
 * @category generated
 */
export declare class BidTooLowError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
/**
 * CannotCancelWinningBid: 'Winning bid cannot be cancelled.'
 *
 * @category Errors
 * @category generated
 */
export declare class CannotCancelWinningBidError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
/**
 * AuctionClaimed: 'Auction already claimed.'
 *
 * @category Errors
 * @category generated
 */
export declare class AuctionClaimedError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
/**
 * AuctionRunning: 'Auction has not been ended yet.'
 *
 * @category Errors
 * @category generated
 */
export declare class AuctionRunningError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
/**
 * WinnerMismatch: 'This user is not authorized to claim the auction.'
 *
 * @category Errors
 * @category generated
 */
export declare class WinnerMismatchError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
/**
 * OwnershipPeriodEnded: 'Ownership period for this user has ended.'
 *
 * @category Errors
 * @category generated
 */
export declare class OwnershipPeriodEndedError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
/**
 * OwnershipPeriodNotEnded: 'Ownership period has not ended yet. Tax cannot be validated before the end of ownership period.'
 *
 * @category Errors
 * @category generated
 */
export declare class OwnershipPeriodNotEndedError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
/**
 * InvalidMessageOrder: 'Invalid message ID provided in the instruction. Messages have to be inserted in a correct order.'
 *
 * @category Errors
 * @category generated
 */
export declare class InvalidMessageOrderError extends Error {
    readonly code: number;
    readonly name: string;
    constructor();
}
/**
 * Attempts to resolve a custom program error from the provided error code.
 * @category Errors
 * @category generated
 */
export declare function errorFromCode(code: number): MaybeErrorWithCode;
/**
 * Attempts to resolve a custom program error from the provided error name, i.e. 'Unauthorized'.
 * @category Errors
 * @category generated
 */
export declare function errorFromName(name: string): MaybeErrorWithCode;
export {};