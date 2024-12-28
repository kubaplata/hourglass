use anchor_lang::prelude::*;

// To bid, user needs an unique PDA. Meaning new auction = new PDA.
// Otherwise, one global user auction PDA would confuse bids between different auctions.
#[account]
pub struct UserAuctionAccount {
    pub user: Pubkey,
    pub hourglass: u64,
    pub auction: u64,
    // Users current bid in lamports.
    pub bid: u64, // 8
    // After bid is cancelled (or auction ends and money is withdrew), this will turn true.
    pub cancelled: bool, // 1
    // Timestamp of last bid.
    pub bid_timestamp: u64, // 8
}

impl UserAuctionAccount {
    pub const SIZE: usize = 8 + 32 + 4 * 8 + 1;
}