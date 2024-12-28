// Function triggered at the moment of ownership period ending.
// Will validate if tax has been paid. If not, Hourglass will be returned
// to Hourglass Associated Account, and will be re-auctioned by the creator.
// If tax has been paid, ownership period will be prolonged.

// Will have to introduce user_tax_account, that will be specific to a ownership period of the Hourglass.
// user_tax_account has to be specific for:
// - hourglass
// - ownership period
// - user pubkey
// user_tax_account PDA will hold Solana and transfer it to the creator at the end of the next ownership period.

use anchor_lang::{prelude::*, InstructionData};
use crate::states::*;
use crate::errors::HourglassError;
use anchor_spl::token_interface::{
    TokenInterface,
    TokenAccount,
    Mint,
    transfer_checked,
    TransferChecked
};

pub fn validate_tax(
    ctx: Context<ValidateTax>,
    hourglass_id: u64,
    user: Pubkey
) -> Result<()> {
    let hourglass_associated_account = &mut ctx.accounts.hourglass_associated_account;
    let user_tax_account = &mut ctx.accounts.user_tax_account;
    let hourglass_mint = &mut ctx.accounts.hourglass_mint;
    let hourglass_vault = &mut ctx.accounts.hourglass_vault;
    let hourglass_owner_ata = &mut ctx.accounts.hourglass_owner_ata;

    let token_program = &mut ctx.accounts.token_program;

    let clock = Clock::get()?;
    let time_now = clock.unix_timestamp as u64;

    require!(
        hourglass_associated_account.owned_till <= time_now,
        HourglassError::OwnershipPeriodNotEnded
    );

    if (!user_tax_account.paid_tax) {
        // Tax unpaid - bring back the hourglass.
        hourglass_associated_account.current_owner = hourglass_associated_account.key();

        let signer_bump = ctx.bumps.hourglass_associated_account;
        let signer_seeds = &[
            "hourglass_associated_account".as_bytes(), 
            &hourglass_id.to_be_bytes(),
            &[signer_bump]
        ];

        transfer_checked(
            CpiContext::new_with_signer(
                token_program.to_account_info(), 
                TransferChecked {
                    from: hourglass_owner_ata.to_account_info(),
                    mint: hourglass_mint.to_account_info(),
                    to: hourglass_vault.to_account_info(),
                    authority: hourglass_associated_account.to_account_info()
                }, 
                &[signer_seeds]
            ), 
            1,
            0
        )?;
    }

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    hourglass_id: u64,
    user: Pubkey
)]
pub struct ValidateTax<'info> {
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
            "user_tax_account".as_bytes(),
            user.key().as_ref(),
            &hourglass_id.to_be_bytes(),
            &(hourglass_associated_account.ownership_period_index - 1).to_be_bytes()
        ],
        bump
    )]
    pub user_tax_account: Account<'info, UserTaxAccount>,

    #[account(
        mut,
        token::token_program = token_program,
        constraint = hourglass_vault.mint == hourglass_associated_account.hourglass,
        constraint = hourglass_vault.owner == hourglass_associated_account.key(),
    )]
    pub hourglass_vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        constraint = hourglass_mint.key() == hourglass_associated_account.hourglass,
        mint::token_program = token_program
    )]
    pub hourglass_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        token::token_program = token_program,
        constraint = hourglass_owner_ata.mint == hourglass_associated_account.hourglass,
        constraint = hourglass_owner_ata.owner == user,
        constraint = hourglass_owner_ata.amount == 1
    )]
    pub hourglass_owner_ata: InterfaceAccount<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}