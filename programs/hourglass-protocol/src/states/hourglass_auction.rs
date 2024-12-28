use anchor_lang::prelude::*;

#[account]
pub struct HourglassAuction {
    // Index of the auction. Initially starts at 0.
    pub index: u64, // 8
    pub hourglass_id: u64,
    // Is currently running
    pub claimed: bool, // 1
    // Unix timestamp of when auction started
    pub started: u64, // 8
    // Unix timestamp of when auction ends (or ended)
    pub ended: u64, // 8
    // Current winning bid
    pub current_top_bid: u64, // 8
    // Current winning wallet
    pub current_winner: Pubkey, // 32
}

impl HourglassAuction {
    pub const SIZE: usize = 8 + 5 * 8 + 32 + 1;
}