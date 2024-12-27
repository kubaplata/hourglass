use anchor_lang::prelude::*;
use crate::states::*;
use anchor_spl::token::{ Mint, TokenAccount };

pub fn initialize_protocol(
    ctx: Context<InitializeProtocol>,
    fee: u64
) -> Result<()> {
    let admin = &mut ctx.accounts.admin;
    let hourglass_protocol = &mut ctx.accounts.hourglass_protocol;
    let fee_settlement_token = &mut ctx.accounts.fee_settlement_token;
    let fee_collector = &mut ctx.accounts.fee_collector;

    hourglass_protocol.admin = admin.key();
    hourglass_protocol.total_hourglasses = 0;
    // change to plain sol, no token support yet
    hourglass_protocol.fee_settlement_token = fee_settlement_token.key();
    hourglass_protocol.fee = fee;
    hourglass_protocol.fee_collector = fee_collector.key();

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(
        mut
    )]
    pub admin: Signer<'info>,

    // UNSAFE: `INIT_IF_NEEDED` TO `INIT` BEFORE MAINNET
    #[account(
        init_if_needed,
        payer = admin,
        seeds = [b"hourglass_protocol"],
        bump,
        space = 8 + (3 * 32) + (2 * 8),
    )]
    pub hourglass_protocol: Account<'info, Hourglass>,

    #[account(
        mut,
    )]
    pub fee_settlement_token: Account<'info, Mint>,

    #[account(
        mut,
        constraint = fee_collector.owner == hourglass_protocol.key(),
        constraint = fee_collector.mint == fee_settlement_token.key()
    )]
    pub fee_collector: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
}