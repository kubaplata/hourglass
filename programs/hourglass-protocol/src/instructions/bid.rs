use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use crate::states::*;
use crate::errors::*;
use anchor_spl::token::{ 
    TokenAccount, 
    Mint,
    Transfer,
    transfer,
    Token
};

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
    let token_program = &mut ctx.accounts.token_program;
    let user_auction_account_vault = &mut ctx.accounts.user_auction_account_vault;
    let user_settlement_token_ata = &mut ctx.accounts.user_settlement_token_ata;
    let user = &mut ctx.accounts.user;

    // Check if bid is big enough.
    let minimum_bid = hourglass_associated_account.minimum_bid;

    msg!("bid: {:?}", bid);
    msg!("new_minimum_bid: {:?}", hourglass_auction.current_top_bid + minimum_bid);

    require!(
        bid >= hourglass_auction.current_top_bid + minimum_bid,
        HourglassError::BidTooLow
    );

    let user_current_bid = user_auction_account.bid;
    let bid_cancelled = user_auction_account.cancelled;

    // If previous bid was cancelled, transfer full bid value. Otherwise, just add the missing lamports.
    let amount: u64 = if (bid_cancelled) { bid } else { bid - user_current_bid };

    transfer(
        CpiContext::new(
            token_program.to_account_info(), 
            Transfer {
                authority: user.to_account_info(),
                to: user_auction_account_vault.to_account_info(),
                from: user_settlement_token_ata.to_account_info()
            }
        ), 
        amount
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
        space = UserAuctionAccount::SIZE

    )]
    pub user_auction_account: Account<'info, UserAuctionAccount>,

    #[account(
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
        init_if_needed,
        payer = user,
        associated_token::mint = settlement_token,
        associated_token::authority = user_auction_account
    )]
    pub user_auction_account_vault: Account<'info, TokenAccount>,

    #[account()]
    pub system_program: Program<'info, System>,

    #[account()]
    pub token_program: Program<'info, Token>,

    #[account()]
    pub associated_token_program: Program<'info, AssociatedToken>
}