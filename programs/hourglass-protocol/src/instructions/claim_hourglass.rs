use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_lang::InstructionData;
use solana_program::instruction::Instruction;
use crate::errors::*;
use crate::states::*;
use anchor_lang::system_program::{
    transfer,
    Transfer
};
use anchor_spl::token_2022::{
    transfer_checked,
    TransferChecked,
};
use anchor_spl::token_interface::{
    TokenInterface,
    TokenAccount,
    Mint
};

pub fn claim_hourglass(
    ctx: Context<ClaimHourglass>,
    hourglass_id: u64,
    auction_id: u64,
    instant_sell_price: u64,
) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let hourglass_auction = &mut ctx.accounts.hourglass_auction;
    let hourglass_associated_account = &mut ctx.accounts.hourglass_associated_account;
    let user_auction_account = &mut ctx.accounts.user_auction_account;
    let user_tax_account = &mut ctx.accounts.user_tax_account;

    let token_program = &mut ctx.accounts.token_program;
    let system_program = &mut ctx.accounts.system_program;
    let clockwork_program = &mut ctx.accounts.clockwork_program;

    let hourglass_mint = &mut ctx.accounts.hourglass_mint;
    let hourglass_vault = &mut ctx.accounts.hourglass_vault;
    let user_hourglass_ata = &mut ctx.accounts.user_hourglass_ata;
    let hourglass_creator_account = &mut ctx.accounts.hourglass_creator_account;

    let thread = &mut ctx.accounts.thread;

    // Check if auction has already been claimed.
    require!(
        !hourglass_auction.claimed,
        HourglassError::AuctionClaimed
    );

    let clock = Clock::get()?;
    let time_now = clock.unix_timestamp;

    // Check if auction has been ended.
    require!(
        hourglass_auction.ended < (time_now as u64),
        HourglassError::AuctionRunning
    );

    // Check if auction winner is correct.
    require!(
        hourglass_auction.current_winner == user.key(),
        HourglassError::WinnerMismatch
    );

    // After the auction ends, ownership period starts. If not claimed till the end of that period,
    // ownership expires and user cannot claim the Hourglass anymore.
    require!(
        hourglass_auction.ended + hourglass_associated_account.ownership_period > (time_now as u64),
        HourglassError::OwnershipPeriodEnded
    );

    let signer_bump = ctx.bumps.hourglass_associated_account;
    let signer_seeds = &[
        "hourglass_associated_account".as_bytes(), 
        &hourglass_id.to_be_bytes(),
        &[signer_bump]
    ];

    // Transfer Hourglass to the winner.
    transfer_checked(
        CpiContext::new_with_signer(
            token_program.to_account_info(), 
            TransferChecked {
                mint: hourglass_mint.to_account_info(),
                from: hourglass_vault.to_account_info(),
                to: user_hourglass_ata.to_account_info(),
                authority: hourglass_associated_account.to_account_info()
            }, 
            &[signer_seeds]
        ), 
        1, 
        0
    )?;

    msg!("Hourglass has been transferred");

    // Transfer SOL from the winner account to creator account.
    let lamports = hourglass_auction.current_top_bid;
    user_auction_account.sub_lamports(lamports)?;
    hourglass_creator_account.add_lamports(lamports)?;

    msg!("Solana has been transferred");

    // Change state of the Associated Hourglass Account
    hourglass_associated_account.current_owner = user.key();
    hourglass_associated_account.owned_till = hourglass_auction.ended + hourglass_associated_account.ownership_period;
    hourglass_associated_account.grace_till = hourglass_associated_account.owned_till + hourglass_associated_account.grace_period;

    // List the Hourglass on the free market
    hourglass_associated_account.current_price = instant_sell_price;

    msg!(&thread.key().to_string());

    clockwork_sdk::cpi::thread_create(
        CpiContext::new_with_signer(
            clockwork_program.to_account_info(), 
            clockwork_sdk::cpi::ThreadCreate {
                payer: user.to_account_info(),
                authority: hourglass_associated_account.to_account_info(),
                system_program: system_program.to_account_info(),
                thread: thread.to_account_info()
            }, 
            &[signer_seeds]
        ),
        // Max two invocations, have to calculate exact amount.
        10_000_000,
        hourglass_associated_account.clockwork_thread_id.to_string().as_bytes().to_vec(),
        vec![
            Instruction {
                data: crate::instruction::ValidateTax{ hourglass_id, user: user.key() }.data(),
                program_id: ctx.program_id.clone(),
                accounts: crate::accounts::ValidateTax {
                    clockwork_program: clockwork_program.key(),
                    hourglass_associated_account: hourglass_associated_account.key(),
                    hourglass_mint: hourglass_mint.key(),
                    hourglass_owner_ata: user_hourglass_ata.key(),
                    hourglass_vault: hourglass_vault.key(),
                    user_tax_account: user_tax_account.key(),
                    system_program: system_program.key(),
                    token_program: token_program.key(),
                }.to_account_metas(None)
            }.into()
        ],
        clockwork_sdk::state::Trigger::Timestamp {
            unix_ts: hourglass_associated_account.owned_till as i64
        }
    )?;

    msg!("Thread initialized.");

    // After claiming auction, increase Clockwork thread ID by one.
    hourglass_associated_account.clockwork_thread_id += 1;

    // Also increase ownership period index.
    hourglass_associated_account.ownership_period_index += 1;

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    hourglass_id: u64,
    auction_id: u64,
)]
pub struct ClaimHourglass<'info> {
    #[account(
        mut
    )]
    pub user: Signer<'info>,

    /// CHECK: Not checking this account, since we'll validate it on hourglass_associated_account.
    #[account(
        mut
    )]
    pub creator: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [
            "hourglass_associated_account".as_bytes(), 
            &hourglass_id.to_be_bytes()
        ],
        bump,
        has_one = creator,
        // Can only be claimed if owned by program.
        constraint = hourglass_associated_account.current_owner == hourglass_associated_account.key()
    )]
    pub hourglass_associated_account: Box<Account<'info, HourglassAssociatedAccount>>,

    #[account(
        mut,
        seeds = [
            b"hourglass_creator_account", 
            creator.key().as_ref()
        ],
        bump
    )]
    pub hourglass_creator_account: Box<Account<'info, HourglassCreatorAccount>>,

    #[account(
        mut,
        seeds = [
            "hourglass_auction".as_bytes(),
            &hourglass_id.to_be_bytes(),
            &auction_id.to_be_bytes()
        ],
        bump,
        // Only allow instruction, if hourglass is not claimed yet.
        constraint = !hourglass_auction.claimed
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
        space = 8 + (2 * 8) + 1
    )]
    pub user_auction_account: Account<'info, UserAuctionAccount>,

    #[account(
        mut,
        constraint = hourglass_mint.key() == hourglass_associated_account.hourglass,
        mint::token_program = token_program
    )]
    pub hourglass_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init,
        payer = user,
        space = 8 + 32 + 1,
        seeds = [
            "user_tax_account".as_bytes(),
            user.key().as_ref(),
            &hourglass_id.to_be_bytes(),
            &hourglass_associated_account.ownership_period_index.to_be_bytes()
        ],
        bump
    )]
    pub user_tax_account: Box<Account<'info, UserTaxAccount>>,

    #[account(
        mut,
        token::token_program = token_program,
        constraint = hourglass_vault.mint == hourglass_mint.key(),
        constraint = hourglass_vault.owner == hourglass_associated_account.key(),
        constraint = hourglass_vault.amount == 1,
    )]
    pub hourglass_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        token::token_program = token_program,
        constraint = user_hourglass_ata.mint == hourglass_mint.key(),
        constraint = user_hourglass_ata.owner == user.key(),
    )]
    pub user_hourglass_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut, 
        address = clockwork_sdk::state::Thread::pubkey(
            hourglass_associated_account.key(), 
            hourglass_associated_account.clockwork_thread_id.to_string().as_bytes().to_vec()
        )
    )]
    pub thread: SystemAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub clockwork_program: Program<'info, clockwork_sdk::ThreadProgram>
}