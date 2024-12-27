use anchor_lang::prelude::*;

pub mod instructions;
pub use instructions::*;

pub mod states;
pub use states::*;

pub mod errors;
pub use errors::*;

declare_id!("83PYe3dvbceG6KH98pewdyxLfhLFTHQUc8sjJXiKAcij");

// TODO: Only interacting with the latest auction should be allowed.
// In all instructions involving auctions [except bid cancel, cause people have to be able to withdraw their funds], 
// we should not take auction_id as an input, but rather read latest auction id from the associated_hourglass_account.
// Auction accounts should be closed after claiming, so this should not influence the overall flow.

#[program]
pub mod hourglass_protocol {
    use super::*;

    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        fee: u64,
    ) -> Result<()> {
        instructions::initialize_protocol(ctx, fee)
    }

    pub fn create_hourglass(
        ctx: Context<CreateHourglass>,
        args: CreateHourglassArgs
    ) -> Result<()> {
        instructions::create_hourglass(
            ctx, 
            args
        )
    }

    pub fn initialize_auction(
        ctx: Context<InitializeAuction>,
        hourglass_id: u64
    ) -> Result<()> {
        instructions::initialize_auction(ctx, hourglass_id)
    }

    pub fn bid(
        ctx: Context<Bid>,
        hourglass_id: u64,
        auction_id: u64,
        bid: u64 // In lamports
    ) -> Result<()> {
        instructions::bid(ctx, hourglass_id, auction_id, bid)
    }

    pub fn cancel_bid(
        ctx: Context<CancelBid>,
        hourglass_id: u64,
        auction_id: u64,
    ) -> Result<()> {
        instructions::cancel_bid(ctx, hourglass_id, auction_id)
    }

    // After auction is ended, let winner claim.
    pub fn claim_hourglass(
        ctx: Context<'_, '_, '_, '_, ClaimHourglass<'_>>,
        hourglass_id: u64,
        auction_id: u64,
        instant_sell_price: u64,
    ) -> Result<()> {
        instructions::claim_hourglass(ctx, hourglass_id, auction_id, instant_sell_price)
    }

    // After hourglss is claimed by user & listed on open market, let people trade.
    pub fn purchase_hourglass(
        ctx: Context<PurchaseHourglass>,
        hourglass_id: u64
    ) -> Result<()> {
        instructions::purchase_hourglass(ctx, hourglass_id)
    }

    pub fn validate_tax(
        ctx: Context<ValidateTax>,
        hourglass_id: u64,
        user: Pubkey
    ) -> Result<()> {
        instructions::validate_tax(ctx, hourglass_id, user)
    }

    pub fn send_message(
        ctx: Context<SendMessage>,
        hourglass_id: u64,
        message_id: u64,
        message_content: String
    ) -> Result<()> {
        instructions::send_message(ctx, hourglass_id, message_id, message_content)
    }

    pub fn pay_tax(
        ctx: Context<PayTax>,
        hourglass_id: u64
    ) -> Result<()> {
        instructions::pay_tax(ctx, hourglass_id)
    }
}
