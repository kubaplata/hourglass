use anchor_lang::system_program::{ transfer, Transfer };
use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::*;
use anchor_spl::token::{ TokenAccount, Mint };

pub fn bid(
    ctx: Context<Bid>,
    hourglass_id: u64, 
    auction_id: u64,
    bid: u64
) -> Result<()> {
    let hourglass_associated_account = &mut ctx.accounts.hourglass_associated_account;
    let hourglass_auction = &mut ctx.accounts.hourglass_auction;
    let user_auction_account = &mut ctx.accounts.user_auction_account;
    let system_program = &mut ctx.accounts.system_program;
    let user = &mut ctx.accounts.user;

    // Check if bid is big enough.
    let minimum_bid = hourglass_associated_account.minimum_bid;
    require!(
        bid >= hourglass_auction.current_top_bid + minimum_bid,
        HourglassError::BidTooLow
    );

    let user_current_bid = user_auction_account.bid;
    let bid_cancelled = user_auction_account.cancelled;

    // If previous bid was cancelled, transfer full bid value. Otherwise, just add the missing lamports.
    let lamports: u64 = if (bid_cancelled) { bid } else { bid - user_current_bid };

    transfer(
        CpiContext::new(
            system_program.to_account_info(), 
            Transfer {
                from: user.to_account_info(),
                to: user_auction_account.to_account_info()
            }
        ), 
        lamports
    )?;

    let clock = Clock::get()?;

    user_auction_account.bid = bid;
    user_auction_account.cancelled = false;
    user_auction_account.bid_timestamp = clock.unix_timestamp as u64;

    hourglass_auction.current_top_bid = bid;
    hourglass_auction.current_winner = user.key();

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    hourglass_id: u64, 
    auction_id: u64
)]
pub struct Bid<'info> {
    #[account(
        mut
    )]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [
            "hourglass_associated_account".as_bytes(), 
            &hourglass_id.to_be_bytes()
        ],
        bump,
    )]
    pub hourglass_associated_account: Box<Account<'info, HourglassAssociatedAccount>>,

    #[account(
        mut,
        seeds = [
            "hourglass_auction".as_bytes(),
            &hourglass_id.to_be_bytes(),
            &auction_id.to_be_bytes()
        ],
        bump,
        // Only allow bidding if the auction is running.
        constraint = hourglass_auction.ended > (Clock::get()?.unix_timestamp as u64)
    )]
    pub hourglass_auction: Account<'info, HourglassAuction>,

    #[account(
        init_if_needed,
        payer = user,
        seeds = [
            "user_auction_account".as_bytes(),
            &user.key().to_bytes(),
            &hourglass_id.to_be_bytes(),
            &auction_id.to_be_bytes()
        ],
        bump,
        space = 8 + 32 + (2 * 8) + 1

    )]
    pub user_auction_account: Account<'info, UserAuctionAccount>,

    pub system_program: Program<'info, System>,
}