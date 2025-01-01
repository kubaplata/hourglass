use anchor_lang::prelude::*;
use anchor_spl::token::{
    Mint,
    TokenAccount,
    Token,
    Transfer,
    transfer
};
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
    let token_program = &ctx.accounts.token_program;
    let user_settlement_token_ata = &ctx.accounts.user_settlement_token_ata;
    let user_auction_account_vault = &ctx.accounts.user_auction_account_vault;

    // If user is winning, bid cannot be cancelled.
    require!(
        hourglass_auction.current_top_bid != user_auction_account.bid,
        HourglassError::CannotCancelWinningBid
    );

    user_auction_account.cancelled = true;
    let bid = user_auction_account.bid;

    let signer_seeds = &[
        "user_auction_account".as_bytes(),
        &user.key().to_bytes(),
        &hourglass_id.to_be_bytes(),
        &auction_id.to_be_bytes(),
        &[ctx.bumps.user_auction_account]
    ];

    transfer(
        CpiContext::new_with_signer(
            token_program.to_account_info(), 
            Transfer {
                to: user_settlement_token_ata.to_account_info(),
                from: user_auction_account_vault.to_account_info(),
                authority: user_auction_account.to_account_info()
            }, 
            &[signer_seeds]
        ), 
        bid
    )?;

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
        has_one = settlement_token
    )]
    pub hourglass_associated_account: Box<Account<'info, HourglassAssociatedAccount>>,

    #[account(
        mut,
        address = hourglass_associated_account.settlement_token
    )]
    pub settlement_token: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = settlement_token,
        associated_token::authority = user
    )]
    pub user_settlement_token_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = settlement_token,
        associated_token::authority = user_auction_account
    )]
    pub user_auction_account_vault: Account<'info, TokenAccount>,

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

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}