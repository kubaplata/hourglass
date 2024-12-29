use anchor_lang::prelude::*;

#[account]
pub struct HourglassCreatorAccount {
    pub creator: Pubkey, // 32
    pub total_earned: u64, // 8
    pub to_withdraw: u64, // 8
    // Indices of the created assets
    pub hourglasses: Vec<u64>, // 4 + 10 * 8
}

impl HourglassCreatorAccount {
    pub const SIZE: usize = 8 + 32 + 2 * 8 + (4 + 10 * 8);
}