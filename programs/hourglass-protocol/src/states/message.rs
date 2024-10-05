use anchor_lang::prelude::*;

#[account]
pub struct Message {
    pub author: Pubkey, // 32
    pub content: String, // 8 + size of the string
}