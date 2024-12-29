use anchor_lang::prelude::*;
use crate::states::*;
use anchor_spl::token::{ Mint, TokenAccount };
use crate::errors::HourglassError;

pub fn initialize_protocol(
    ctx: Context<InitializeProtocol>,
    fee_bps: u64
) -> Result<()> {
    let admin = &mut ctx.accounts.admin;
    let hourglass_protocol = &mut ctx.accounts.hourglass_protocol;
    let fee_collector = &mut ctx.accounts.fee_collector;

    require!(
        fee_bps <= 10_000,
        HourglassError::InvalidFeeBps
    );

    hourglass_protocol.admin = admin.key();
    hourglass_protocol.total_hourglasses = 0;
    hourglass_protocol.fee_bps = fee_bps;
    hourglass_protocol.fee_collector = fee_collector.key();

    Ok(())
}

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(
        mut
    )]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        seeds = [b"hourglass_protocol"],
        bump,
        space = Hourglass::SIZE,
    )]
    pub hourglass_protocol: Account<'info, Hourglass>,

    /// CHECK: Trust admin
    #[account(
        mut,
    )]
    pub fee_collector: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}