use anchor_lang::system_program::{ transfer, Transfer };
use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::*;

pub fn cancel_bid(
    ctx: Context<CancelBid>,
    hourglass_id: u64, 
    auction_id: u64
) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let user_auction_account = &mut ctx.accounts.user_auction_account;
    let hourglass_auction = &mut ctx.accounts.hourglass_auction;

    // If user is winning, bid cannot be cancelled.
//     require!(
//         hourglass_auction.current_top_bid != user_auction_account.bid,
//         HourglassError::CannotCancelWinningBid
//     );

    user_auction_account.cancelled = true;
    let bid = user_auction_account.bid;

    user_auction_account.sub_lamports(bid)?;
    user.add_lamports(bid)?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    hourglass_id: u64, 
    auction_id: u64
)]
pub struct CancelBid<'info> {
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
    )]
    pub hourglass_auction: Account<'info, HourglassAuction>,

    #[account(
        mut,
        seeds = [
            "user_auction_account".as_bytes(),
            &user.key().to_bytes(),
            &hourglass_id.to_be_bytes(),
            &auction_id.to_be_bytes()
        ],
        bump,
        // Fail instruction if bid already cancelled.
        constraint = !user_auction_account.cancelled
    )]
    pub user_auction_account: Account<'info, UserAuctionAccount>,

    pub system_program: Program<'info, System>,
}