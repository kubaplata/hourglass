use anchor_lang::prelude::*;

#[account]
pub struct UserTaxAccount {
    pub user: Pubkey, // 32 
    pub paid_tax: bool // 1
}