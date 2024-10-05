use anchor_lang::{prelude::*, InstructionData};
use anchor_lang::{
    system_program::{
        Transfer,
        transfer
    }
};
use solana_program::instruction::Instruction;
use crate::states::*;
use clockwork_sdk::cpi::{
    ThreadUpdate,
};
use anchor_spl::token_interface::{
    Mint,
    TokenInterface,
    TokenAccount,
};
use clockwork_sdk::state::ThreadSettings;

pub fn pay_tax(
    ctx: Context<PayTax>,
    hourglass_id: u64,
) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let user_tax_account = &mut ctx.accounts.user_tax_account;
    let user_next_tax_account = &mut ctx.accounts.user_next_tax_account;
    let hourglass_associated_account = &mut ctx.accounts.hourglass_associated_account;
    
    let hourglass_creator_account = &mut ctx.accounts.creator_hourglass_account;

    let system_program = &mut ctx.accounts.system_program;
    let clockwork_program = &mut ctx.accounts.clockwork_program;
    let token_program = &mut ctx.accounts.token_program;

    let hourglass_mint = &mut ctx.accounts.hourglass_mint;
    let hourglass_vault = &mut ctx.accounts.hourglass_vault;
    let user_hourglass_ata = &mut ctx.accounts.user_hourglass_ata;

    let current_thread = &mut ctx.accounts.current_thread;

    let tax_rate = hourglass_associated_account.tax_rate as f64;
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

    msg!("CPI to system program succeeded. Transferred sol to the tax account.");

    user_tax_account.paid_tax = true;
    hourglass_associated_account.ownership_period_index += 1;
    hourglass_associated_account.owned_till += hourglass_associated_account.ownership_period;
    hourglass_associated_account.grace_till = hourglass_associated_account.owned_till + hourglass_associated_account.grace_period;

    let signer_bump = ctx.bumps.hourglass_associated_account;
    let signer_seeds = &[
        "hourglass_associated_account".as_bytes(), 
        &hourglass_id.to_be_bytes(),
        &[signer_bump]
    ];

    // Since user paid the tax, we don't need to validate tax at the end of the ownership period.
    // We can update current thread to validate after the newly initialized ownership period ends.
    clockwork_sdk::cpi::thread_update(
        CpiContext::new_with_signer(
            clockwork_program.to_account_info(), 
            ThreadUpdate {
                authority: hourglass_associated_account.to_account_info(),
                thread: current_thread.to_account_info(),
                system_program: system_program.to_account_info()
            }, 
            &[signer_seeds]
        ),
        ThreadSettings {
            rate_limit: None,
            trigger: Some(
                clockwork_sdk::state::Trigger::Timestamp {
                    unix_ts: hourglass_associated_account.owned_till as i64
                }
            ),
            fee: None,
            instructions: Some(
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
                            user_tax_account: user_next_tax_account.key(),
                            system_program: system_program.key(),
                            token_program: token_program.key()
                        }.to_account_metas(None)
                    }.into()
                ],
            ),
            name: None
        }
    )?;

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
        address = clockwork_sdk::state::Thread::pubkey(
            hourglass_associated_account.key(), 
            (hourglass_associated_account.clockwork_thread_id - 1).to_string().as_bytes().to_vec()
        )
    )]
    pub current_thread: Account<'info, clockwork_sdk::state::Thread>,

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
    pub clockwork_program: Program<'info, clockwork_sdk::ThreadProgram>
}