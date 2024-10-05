use anchor_lang::prelude::*;

#[account]
pub struct Hourglass {
    pub admin: Pubkey, // 32
    pub fee_settlement_token: Pubkey, // 32
    pub fee_collector: Pubkey, // 32
    pub fee: u64, // 8
    pub total_hourglasses: u64, // 8
}