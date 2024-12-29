use anchor_lang::prelude::*;

#[account]
pub struct Hourglass {
    pub admin: Pubkey, // 32
    pub fee_collector: Pubkey, // 32
    pub fee_bps: u64, // 8
    pub total_hourglasses: u64, // 8
    pub total_creators: u64, // 8
}

impl Hourglass {
    pub const SIZE: usize = 8 + 2 * 32 + 3 * 8;
}