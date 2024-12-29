use anchor_lang::prelude::*;

#[error_code]
pub enum HourglassError {
    #[msg("Invalid Hourglass ID. Make sure Hourglass ID matches total_hourglass field in main Hourglass Protocol PDA.")]
    InvalidHoourglassID,

    #[msg("Invalid signers. Make sure Hourglass mint is signing the transaction.")]
    InvalidSigners,

    #[msg("Bid value is too low.")]
    BidTooLow,

    #[msg("Winning bid cannot be cancelled.")]
    CannotCancelWinningBid,

    #[msg("Auction already claimed.")]
    AuctionClaimed,

    #[msg("Auction has not been ended yet.")]
    AuctionRunning,

    #[msg("This user is not authorized to claim the auction.")]
    WinnerMismatch,

    #[msg("Ownership period for this user has ended.")]
    OwnershipPeriodEnded,

    #[msg("Ownership period has not ended yet. Tax cannot be validated before the end of ownership period.")]
    OwnershipPeriodNotEnded,

    #[msg("Invalid message ID provided in the instruction. Messages have to be inserted in a correct order.")]
    InvalidMessageOrder,

    #[msg("InvalidFeeBps")]
    InvalidFeeBps
}