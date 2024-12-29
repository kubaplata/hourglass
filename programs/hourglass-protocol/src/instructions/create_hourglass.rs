use anchor_lang::solana_program::program::invoke;
use anchor_lang::{prelude::*, solana_program::program::invoke_signed};
use anchor_lang::system_program::{ transfer, Transfer };
use anchor_spl::associated_token::{self, AssociatedToken};
use anchor_spl::token::Token;
use anchor_spl::token_2022::spl_token_2022::instruction::AuthorityType;
use crate::{states::*, errors::*};
use anchor_spl::{token::{ Mint, TokenAccount }, token_interface::TokenInterface};
use anchor_spl::token_interface:: {
    InitializeMint,
    initialize_mint,
    set_authority,
    SetAuthority,
    spl_token_2022::{
        state,
        extension::ExtensionType,
        instruction::initialize_permanent_delegate,
        instruction::mint_to,
        extension::metadata_pointer,
    }
};
use spl_token_metadata_interface::state::TokenMetadata;
use spl_token_metadata_interface::state::Field;
use spl_pod::optional_keys::OptionalNonZeroPubkey;

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateHourglassArgs {
    pub hourglass_id: u64,
    pub name: String,
    pub symbol: String,
    pub metadata_uri: String,
    pub description: String,
    pub image: String,
    pub creator_name: String,
    pub auction_length: u64,
    pub ownership_period: u64,
    pub grace_period: u64,
    pub minimum_sale_price: u64,
    pub minimum_bid: u64,
    pub tax_rate_bps: u64,
    pub royalties: u64,
}

pub fn create_hourglass(
    ctx: Context<CreateHourglass>,
    args: CreateHourglassArgs
) -> Result<()> {

    let CreateHourglassArgs {
        hourglass_id,
        name,
        symbol,
        metadata_uri,
        description,
        image,
        creator_name,
        auction_length,
        ownership_period,
        grace_period,
        minimum_sale_price,
        minimum_bid,
        tax_rate_bps,
        royalties,
    } = args;

    let creator = &ctx.accounts.creator;
    let hourglass_protocol = &mut ctx.accounts.hourglass_protocol;
    let hourglass_associated_account = &mut ctx.accounts.hourglass_associated_account;
    let mint = &ctx.accounts.hourglass_mint;
    let token_program = &mut ctx.accounts.token_2022_program;
    let associated_token_program = &ctx.accounts.associated_token_program;
    let rent_program = &ctx.accounts.rent_program;
    let hourglass_vault = &ctx.accounts.hourglass_vault;
    let system_program = &ctx.accounts.system_program;
    
    require!(
        hourglass_id == hourglass_protocol.total_hourglasses,
        HourglassError::InvalidHoourglassID
    );

    require!(
        mint.is_signer,
        HourglassError::InvalidSigners
    );

    hourglass_protocol.total_hourglasses += 1;
    hourglass_associated_account.auction_length = auction_length;
    hourglass_associated_account.ownership_period = ownership_period;
    hourglass_associated_account.grace_period = grace_period;
    hourglass_associated_account.minimum_sale_price = minimum_sale_price;
    hourglass_associated_account.minimum_bid = minimum_bid;
    hourglass_associated_account.tax_rate_bps = tax_rate_bps;
    hourglass_associated_account.creator = creator.key();
    hourglass_associated_account.hourglass = mint.key();
    hourglass_associated_account.next_auction_id = 0;
    hourglass_associated_account.current_owner = hourglass_associated_account.key();
    hourglass_associated_account.royalties = royalties;
    hourglass_associated_account.current_price = 0;
    hourglass_associated_account.grace_till = 0;
    hourglass_associated_account.owned_till = 0;
    hourglass_associated_account.ownership_period_index = 0;
    hourglass_associated_account.message_id = 0;

    let token_metadata: TokenMetadata = TokenMetadata {
        mint: mint.key(),
        name: name.clone(),
        symbol: symbol.clone(),
        uri: metadata_uri.clone(),
        additional_metadata: vec![
            (
                String::from("creator_name"),
                creator_name
            ),
            (
                String::from("seller_fee_basis_points"),
                royalties.to_string()
            ),
            (
                String::from("image"),
                image
            ),
            (
                String::from("description"),
                description
            )
        ],
        update_authority: OptionalNonZeroPubkey
            ::try_from(Some(hourglass_associated_account.key()))?
    };

    let size_of_metadata: usize = token_metadata.tlv_size_of()?;

    transfer(
        CpiContext::new(
            system_program.to_account_info(), 
            Transfer {
                from: creator.to_account_info(),
                to: mint.to_account_info()
            }
        ), 
        Rent::get()?.minimum_balance(
            size_of_metadata
        ),
    )?;

    msg!("Transferred rent");

    let initialize_delegate_ix = initialize_permanent_delegate(
        &token_program.key(), 
        &mint.key(), 
        &hourglass_associated_account.key()
    )?;

    let initialize_metadata_pointer_ix = metadata_pointer::instruction::initialize(
        &token_program.key(), 
        &mint.key(),
        Some(hourglass_associated_account.key()), 
        Some(mint.key()),
    )?;

    let signer_bump = ctx.bumps.hourglass_associated_account;
    let signer_seeds = &[
        "hourglass_associated_account".as_bytes(), 
        &hourglass_id.to_be_bytes(),
        &[signer_bump]
    ];

    invoke_signed(
        &initialize_delegate_ix, 
        &[
            token_program.to_account_info(),
            hourglass_associated_account.to_account_info(),
            mint.to_account_info(),
        ],
        &[signer_seeds]
    )?;

    msg!("initialized delegate");

    invoke_signed(
        &initialize_metadata_pointer_ix, 
        &[
            token_program.to_account_info(),
            hourglass_associated_account.to_account_info(),
            mint.to_account_info(),
        ], 
        &[signer_seeds]
    )?;

    msg!("initialized metadata");
    
    initialize_mint(
        CpiContext::new(
            token_program.to_account_info(), 
            InitializeMint {
                mint: mint.to_account_info(),
                rent: rent_program.to_account_info()
            },
        ),
        0,
        &creator.key(),
        Some(&hourglass_associated_account.key())
    )?;

    msg!("initialized mint");

    let initialize_metadata_ix = spl_token_metadata_interface::instruction::initialize(
        &token_program.key(),
        &mint.key(),
        &hourglass_associated_account.key(),
        &mint.key(),
        &creator.key(),
        name.clone(),
        symbol.clone(),
        metadata_uri.clone()
    );

    invoke(
        &initialize_metadata_ix, 
        &[
            token_program.to_account_info(),
            mint.to_account_info(),
            hourglass_associated_account.to_account_info(),
            creator.to_account_info()
        ]
    )?;

    msg!("initialized metadata");

    for field in token_metadata.additional_metadata {
        invoke_signed(
            &spl_token_metadata_interface::instruction::update_field(
                &token_program.key(),
                &mint.key(),
                &hourglass_associated_account.key(),
                Field::Key(field.0),
                field.1
            ),
            &[
                token_program.to_account_info(),
                mint.to_account_info(),
                hourglass_associated_account.to_account_info(),
            ],
            &[signer_seeds]
        )?;
    }

    msg!("initialized optional metadata fields");

    associated_token::create(
        CpiContext::new(
            associated_token_program.to_account_info(),
            associated_token::Create{
                mint: mint.to_account_info(),
                payer: creator.to_account_info(),
                associated_token: hourglass_vault.to_account_info(),
                system_program: system_program.to_account_info(),
                token_program: token_program.to_account_info(),
                authority: hourglass_associated_account.to_account_info()
            }
        )
    )?;

    msg!("created hourglass vault");

    invoke(
        &mint_to(
            &token_program.key(),
            &mint.key(),
            &hourglass_vault.key(),
            &creator.key(),
            &[
                &creator.key()
            ],
            1
        )?, 
        &[
            token_program.to_account_info(),
            mint.to_account_info(),
            hourglass_vault.to_account_info(),
            hourglass_associated_account.to_account_info(),
            creator.to_account_info()
        ] 
    )?;

    msg!("minted hourglass");

    set_authority(
        CpiContext::new(
            token_program.to_account_info(), 
            SetAuthority { 
                account_or_mint: mint.to_account_info(),
                current_authority: creator.to_account_info(),
             }
        ),
        AuthorityType::MintTokens,
        None
    )?;

    msg!("frozen all minting in the future");

    Ok(())
}

#[derive(Accounts)]
#[instruction(args: CreateHourglassArgs)]
pub struct CreateHourglass<'info> {
    #[account(
        mut
    )]
    pub creator: Signer<'info>,

    /// CHECK: We don't need to check this account.
    #[account(
        init,
        payer = creator,
        space = ExtensionType
            ::try_calculate_account_len
            ::<state::Mint>(&[
                ExtensionType::MetadataPointer, 
                ExtensionType::PermanentDelegate
            ])?,
            
        owner = token_2022_program.key(),
        mint::token_program = token_2022_program,
    )]
    pub hourglass_mint: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [
            "hourglass_protocol".as_bytes()
        ],
        bump
    )]
    pub hourglass_protocol: Box<Account<'info, Hourglass>>,

    #[account(
        init_if_needed,
        payer = creator,
        space = HourglassCreatorAccount::SIZE,
        seeds = [
            "hourglass_creator_account".as_bytes(), 
            creator.key().as_ref()
        ],
        bump
    )]
    pub creator_hourglass_account: Box<Account<'info, HourglassCreatorAccount>>,

    #[account(
        init,
        payer = creator,
        space = HourglassAssociatedAccount::SIZE,
        seeds = [
            "hourglass_associated_account".as_bytes(), 
            &hourglass_protocol.total_hourglasses.to_be_bytes()
        ],
        bump
    )]
    pub hourglass_associated_account: Box<Account<'info, HourglassAssociatedAccount>>,

    /// CHECK: Will be checked by CPI later
    #[account(
        mut,
    )]
    pub hourglass_vault: AccountInfo<'info>,
    
    // Any mint that creator wants their hourglass traded in.
    #[account(
        mut,
        mint::token_program = token_program,
    )]
    pub settlement_token: Box<Account<'info, Mint>>,

    pub token_2022_program: Interface<'info, TokenInterface>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent_program: Sysvar<'info, Rent>,
}