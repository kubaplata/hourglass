use anchor_lang::prelude::*;

#[account]
pub struct HourglassCreatorAccount {
    pub total_earned: u64, // 8
    pub to_withdraw: u64, // 8
    pub created: Vec<Pubkey>, // 4 + 10 * 32
    pub withdrawal_account: Pubkey, // 32
}