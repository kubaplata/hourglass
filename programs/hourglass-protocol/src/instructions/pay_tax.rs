use anchor_lang::{prelude::*, InstructionData};
use anchor_lang::{
    system_program::{
        Transfer,
        transfer
    }
};
use solana_program::instruction::Instruction;
use crate::states::*;
use anchor_spl::token_interface::{
    Mint,
    TokenInterface,
    TokenAccount,
};

pub fn pay_tax(
    ctx: Context<PayTax>,
    hourglass_id: u64,
) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let user_tax_account = &mut ctx.accounts.user_tax_account;
    let hourglass_associated_account = &mut ctx.accounts.hourglass_associated_account;
    let hourglass_creator_account = &mut ctx.accounts.creator_hourglass_account;
    let system_program = &mut ctx.accounts.system_program;

    let tax_rate = hourglass_associated_account.tax_rate_bps as f64;
    let asset_value = hourglass_associated_account.current_price as f64;

    // Tax rate in base points * asset value / [base points], casted to int
    let lamports = (tax_rate * asset_value / (10_000 as f64)) as u64;
    transfer(
        CpiContext::new(
            system_program.to_account_info(),
            Transfer {
                from: user.to_account_info(),
                to: hourglass_creator_account.to_account_info()
            }
        ), 
        lamports,
    )?;

    user_tax_account.paid_tax = true;
    hourglass_associated_account.ownership_period_index += 1;
    hourglass_associated_account.owned_till += hourglass_associated_account.ownership_period;
    hourglass_associated_account.grace_till = hourglass_associated_account.owned_till + hourglass_associated_account.grace_period;

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    hourglass_id: u64
)]
pub struct PayTax<'info> {
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
        // Only allow the current owner to pay the tax.
        constraint = hourglass_associated_account.current_owner == user.key()
    )]
    pub hourglass_associated_account: Box<Account<'info, HourglassAssociatedAccount>>,

    #[account(
        mut,
        seeds = [
            "user_tax_account".as_bytes(),
            user.key().as_ref(),
            &hourglass_id.to_be_bytes(),
            &(hourglass_associated_account.ownership_period_index - 1).to_be_bytes()
        ],
        bump,
        // Only allow if tax not paid yet.
        constraint = !user_tax_account.paid_tax
    )]
    pub user_tax_account: Account<'info, UserTaxAccount>,

    #[account(
        init,
        payer = user,
        space = 8 + 32 + 1,
        seeds = [
            "user_tax_account".as_bytes(),
            user.key().as_ref(),
            &hourglass_id.to_be_bytes(),
            &(hourglass_associated_account.ownership_period_index).to_be_bytes()
        ],
        bump
    )]
    pub user_next_tax_account: Account<'info, UserTaxAccount>,

    #[account(
        mut,
        constraint = hourglass_mint.key() == hourglass_associated_account.hourglass,
        mint::token_program = token_program
    )]
    pub hourglass_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        token::token_program = token_program,
        constraint = hourglass_vault.mint == hourglass_mint.key(),
        constraint = hourglass_vault.owner == hourglass_associated_account.key(),
        constraint = hourglass_vault.amount == 0,
    )]
    pub hourglass_vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        token::token_program = token_program,
        constraint = user_hourglass_ata.mint == hourglass_mint.key(),
        constraint = user_hourglass_ata.owner == user.key(),
        constraint = user_hourglass_ata.amount == 1
    )]
    pub user_hourglass_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"hourglass_creator_account", creator.key().as_ref()],
        bump
    )]
    pub creator_hourglass_account: Box<Account<'info, HourglassCreatorAccount>>,
    
    /// CHECK: Safe, we check against specific pubkey.
    #[account(
        mut,
        constraint = creator.key() == hourglass_associated_account.creator
    )]
    pub creator: AccountInfo<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}