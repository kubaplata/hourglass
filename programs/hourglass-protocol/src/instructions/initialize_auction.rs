use anchor_lang::prelude::*;
use crate::states::*;
use anchor_spl::token_interface::{Mint, TokenInterface, TokenAccount};

pub fn initialize_auction(
    ctx: Context<InitializeAuction>,
    hourglass_id: u64,
) -> Result<()> {
    let hourglass_associated_account = &mut ctx.accounts.hourglass_associated_account;
    let hourglass_auction = &mut ctx.accounts.hourglass_auction;

    let clock = Clock::get()?;
    let time_now = clock.unix_timestamp as u64;

    hourglass_auction.index = hourglass_associated_account.next_auction_id;
    hourglass_auction.started = time_now;
    hourglass_auction.claimed = false;
    hourglass_auction.ended = time_now + hourglass_associated_account.auction_length;
    hourglass_auction.current_top_bid = 0;

    hourglass_associated_account.next_auction_id += 1;

    Ok(())
}

#[derive(Accounts)]
#[instruction(hourglass_id: u64)]
pub struct InitializeAuction<'info> {
    #[account(
        mut
    )]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [
            "hourglass_associated_account".as_bytes(), 
            &hourglass_id.to_be_bytes()
        ],
        bump,
        has_one = creator
    )]
    pub hourglass_associated_account: Box<Account<'info, HourglassAssociatedAccount>>,

    #[account(
        mut,
        constraint = hourglass_mint.key() == hourglass_associated_account.hourglass,
        mint::token_program = token_program
    )]
    pub hourglass_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        token::token_program = token_program,
        constraint = hourglass_vault.mint == hourglass_associated_account.hourglass,
        constraint = hourglass_vault.owner == hourglass_associated_account.key(),
        // Auction cannot be initialized, if program-owned vault does not own the Hourglass.
        // This means hourglass is owned by someone else at the moment.
        constraint = hourglass_vault.amount == 1,

    )]
    pub hourglass_vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        init,
        payer = creator,
        space = HourglassAuction::SIZE,
        seeds = [
            "hourglass_auction".as_bytes(),
            &hourglass_id.to_be_bytes(),
            &hourglass_associated_account.next_auction_id.to_be_bytes()
        ],
        bump
    )]
    pub hourglass_auction: Account<'info, HourglassAuction>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}