use anchor_lang::{prelude::*, InstructionData};
use anchor_spl::token::{
    transfer, Mint, Token, TokenAccount, Transfer
};
use crate::states::*;
use anchor_spl::token_interface::{
    Mint as Token2022Mint,
    TokenInterface,
    TokenAccount as Token2022TokenAccount,
};
use crate::errors::HourglassError;

pub fn pay_tax(
    ctx: Context<PayTax>,
    hourglass_id: u64,
) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let user_tax_account = &mut ctx.accounts.user_tax_account;
    let hourglass_associated_account = &mut ctx.accounts.hourglass_associated_account;

    let user_settlement_token_ata = &ctx.accounts.user_settlement_token_ata;
    let hourglass_creator_account_settlement_token_ata = &ctx.accounts.hourglass_creator_account_settlement_token_ata;
    let token_program = &ctx.accounts.token_program;

    let tax_rate = hourglass_associated_account.tax_rate_bps as u64;
    
    let tax_amount = tax_rate
        .checked_mul(hourglass_associated_account.current_price)
        .ok_or(HourglassError::MathOverflow)?
        .checked_div(10_000)
        .ok_or(HourglassError::MathOverflow)?;

    transfer(
        CpiContext::new(
            token_program.to_account_info(),
            Transfer {
                from: user_settlement_token_ata.to_account_info(),
                to: hourglass_creator_account_settlement_token_ata.to_account_info(),
                authority: user.to_account_info()
            }
        ), 
        tax_amount,
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
        constraint = hourglass_associated_account.current_owner == user.key(),
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
        associated_token::token_program = token_program,
        associated_token::mint = settlement_token,
        associated_token::authority = user,
    )]
    pub user_settlement_token_ata: Account<'info, TokenAccount>,

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
        mint::token_program = token_2022_program
    )]
    pub hourglass_mint: InterfaceAccount<'info, Token2022Mint>,

    #[account(
        mut,
        token::token_program = token_2022_program,
        constraint = hourglass_vault.mint == hourglass_mint.key(),
        constraint = hourglass_vault.owner == hourglass_associated_account.key(),
        constraint = hourglass_vault.amount == 0,
    )]
    pub hourglass_vault: InterfaceAccount<'info, Token2022TokenAccount>,

    #[account(
        mut,
        token::token_program = token_2022_program,
        constraint = user_hourglass_ata.mint == hourglass_mint.key(),
        constraint = user_hourglass_ata.owner == user.key(),
        constraint = user_hourglass_ata.amount == 1
    )]
    pub user_hourglass_ata: InterfaceAccount<'info, Token2022TokenAccount>,

    #[account(
        mut,
        seeds = [b"hourglass_creator_account", creator.key().as_ref()],
        bump
    )]
    pub creator_hourglass_account: Box<Account<'info, HourglassCreatorAccount>>,

    #[account(
        mut,
        associated_token::authority = creator_hourglass_account,
        associated_token::mint = settlement_token,
        associated_token::token_program = token_program
    )]
    pub hourglass_creator_account_settlement_token_ata: Account<'info, TokenAccount>,
    
    /// CHECK: Safe, we check against specific pubkey.
    #[account(
        mut,
        constraint = creator.key() == hourglass_associated_account.creator
    )]
    pub creator: AccountInfo<'info>,

    pub token_2022_program: Interface<'info, TokenInterface>,

    pub token_program: Program<'info, Token>,

    pub system_program: Program<'info, System>,
}