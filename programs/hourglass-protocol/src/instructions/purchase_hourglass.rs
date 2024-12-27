use anchor_lang::prelude::*;
use anchor_lang::system_program::Transfer;
use anchor_lang::system_program::transfer;
use anchor_lang::InstructionData;
use anchor_spl::token_interface::{
    TokenInterface,
    TokenAccount,
    Mint,
    transfer_checked,
    TransferChecked
};
use crate::states::*;

pub fn purchase_hourglass(
    ctx: Context<PurchaseHourglass>,
    hourglass_id: u64,
) -> Result<()> {
    let hourglass_associated_account = &mut ctx.accounts.hourglass_associated_account;
    let seller = &mut ctx.accounts.seller;
    let user = &mut ctx.accounts.user;
    let creator_account = &mut ctx.accounts.creator_hourglass_account;
    let hourglass = &mut ctx.accounts.hourglass_mint;
    let price = hourglass_associated_account.current_price;
    let royalties_rate: u64 = hourglass_associated_account.royalties;
    let token_program = &mut ctx.accounts.token_program;
    let system_program = &mut ctx.accounts.system_program;
    let seller_ata = &mut ctx.accounts.seller_hourglass_ata;
    let buyer_ata = &mut ctx.accounts.user_hourglass_ata;

    // Since royalties rate is in base points (1/10_000), we have to divide by 10k.
    let royalties = (royalties_rate / 10_000) * price;

    let clock = Clock::get()?;
    let time_now = clock.unix_timestamp as u64;

    transfer(
        CpiContext::new(
            system_program.to_account_info(), 
            Transfer {
                from: user.to_account_info(),
                to: creator_account.to_account_info()
            }
        ), 
        royalties
    )?;

    transfer(
        CpiContext::new(
            system_program.to_account_info(), 
            Transfer {
                from: user.to_account_info(),
                to: seller.to_account_info()
            }
        ), 
        price - royalties
    )?;

    hourglass_associated_account.current_owner = user.key();
    hourglass_associated_account.owned_till = time_now + hourglass_associated_account.ownership_period;
    hourglass_associated_account.grace_till = hourglass_associated_account.owned_till + hourglass_associated_account.grace_period;

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
                from: seller_ata.to_account_info(),
                mint: hourglass.to_account_info(),
                to: buyer_ata.to_account_info(),
                authority: hourglass_associated_account.to_account_info()
            }, 
            &[signer_seeds]
        ), 
        1,
        0
    )?;

    // Increase ownership period index by 1.
    hourglass_associated_account.ownership_period_index += 1;

    Ok(())
}

#[derive(Accounts)]
#[instruction(
    hourglass_id: u64
)]
pub struct PurchaseHourglass<'info> {
    #[account(
        mut
    )]
    pub user: Signer<'info>,

    /// CHECK: We are always validating the seller against `current_owner`, so no need for more checks.
    #[account(
        mut,
        constraint = seller.key() == hourglass_associated_account.current_owner
    )]
    pub seller: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [
            "hourglass_associated_account".as_bytes(), 
            &hourglass_id.to_be_bytes()
        ],
        bump,
        has_one = creator,
        constraint = hourglass_associated_account.current_owner != hourglass_associated_account.key()
    )]
    pub hourglass_associated_account: Box<Account<'info, HourglassAssociatedAccount>>,

    #[account(
        mut,
        constraint = hourglass_mint.key() == hourglass_associated_account.hourglass,
        mint::token_program = token_program
    )]
    pub hourglass_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        token::token_program = token_program,
        constraint = user_hourglass_ata.mint == hourglass_mint.key(),
        constraint = user_hourglass_ata.owner == user.key(),
    )]
    pub user_hourglass_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        token::token_program = token_program,
        constraint = seller_hourglass_ata.mint == hourglass_mint.key(),
        constraint = seller_hourglass_ata.owner == seller.key(),
        constraint = seller_hourglass_ata.amount == 1,
    )]
    pub seller_hourglass_ata: InterfaceAccount<'info, TokenAccount>,

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
    pub user_tax_account: Account<'info, UserTaxAccount>,

    #[account(
        mut,
        token::token_program = token_program,
        constraint = hourglass_vault.mint == hourglass_mint.key(),
        constraint = hourglass_vault.owner == hourglass_associated_account.key(),
        // Only can purchase for a fixed price if the owner is not the program, but other user.
        constraint = hourglass_vault.amount == 0
    )]
    pub hourglass_vault: InterfaceAccount<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
}