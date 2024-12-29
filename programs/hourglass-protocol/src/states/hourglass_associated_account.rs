use anchor_lang::prelude::*;

// #[derive(AnchorDeserialize, AnchorSerialize, Clone, Copy)]
// pub struct HourglassOwnershipDetails {
//     pub owner: Pubkey,
//     pub owned_till: u64,
//     pub grace_till: u64,
//     pub instant_buy: u64,
// }

// impl HourglassOwnershipDetails {
//     pub const SIZE: usize = 32 + 3 * 8;
// }

// #[derive(AnchorDeserialize, AnchorSerialize, Clone, Copy)]
// pub struct HourglassSaleData {
//     pub auction_duration: u64,
//     pub grace_duration: u64,
//     pub minimum_bid: u64,
//     pub minimum_sale_price: u64,
//     pub tax_rate_bps: u64,
//     pub royalties_bps: u64
// }

// impl HourglassSaleData {
//     pub const SIZE: usize = 6 * 8;
// }

// #[derive(AnchorDeserialize, AnchorSerialize, Clone, Copy)]
// pub enum HourglassState {
//     Unavailable, // Kept in Hourglass vault. Not in auction.
//     Auction, // In auction
//     Occupied(HourglassOwnershipDetails), // Owned by auction winner. Available for sale OR in grace period.
//     Sunsetted // Unavailable forever
// }

// impl HourglassState {
//     pub const SIZE: usize = 1 + HourglassOwnershipDetails::SIZE;
// }

// This account manages Hourglass and is used for interactions with Clockwork.
#[account]
pub struct HourglassAssociatedAccount {
    pub hourglass: Pubkey, // 32
    pub creator: Pubkey, // 32
    pub settlement_token: Pubkey, // 32

    pub auction_length: u64, // 8
    pub ownership_period: u64, // 8
    pub grace_period: u64, // 8
    pub minimum_sale_price: u64, // 8
    pub minimum_bid: u64, // 8
    pub tax_rate_bps: u64, // 8

    // ID of the next auction.
    pub next_auction_id: u64, // 8

    // Ownership Status
    // If owned by program, all default to 0.
    pub current_owner: Pubkey, // 32
    pub current_price: u64, // 8
    pub owned_till: u64, // 8
    // Timestamp, until which the Hourglass can be re-claimed by paying the tax.
    pub grace_till: u64, // 8

    // Whenever new user purchases the hourglass, new ownership period is initialized.
    pub ownership_period_index: u64, // 8

    // Royalties
    pub royalties: u64, // 8

    // Messaging
    pub message_id: u64, // 8
}

impl HourglassAssociatedAccount {
    pub const SIZE: usize = 8 +
        3 * 32 +
        6 * 8 +
        8 +
        32 + 3 * 8 +
        3 * 8;
}