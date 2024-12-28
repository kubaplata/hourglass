use anchor_lang::prelude::*;

#[account]
pub struct Message {
    pub hourglass_id: u64,
    pub message_id: u64,
    pub author: Pubkey, // 32
    pub content: String, // 8 + size of the string
}

impl Message {
    pub fn size(content: String) -> usize {
        return 8 + 2 * 8 + 32 + 8 + content.len();
    }
}