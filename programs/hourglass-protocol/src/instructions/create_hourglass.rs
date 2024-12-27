use anchor_lang::solana_program::address_lookup_table::instruction;
use anchor_lang::solana_program::program::invoke;
use anchor_lang::{prelude::*, solana_program::program::invoke_signed, solana_program::system_instruction::transfer};
use anchor_spl::associated_token::{self, AssociatedToken};
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
    pub service: [bool; 8],
    pub is_public: bool,
    pub auction_length: u64,
    pub ownership_period: u64,
    pub grace_period: u64,
    pub minimum_sale_price: u64,
    pub minimum_bid: u64,
    pub tax_rate: u64,
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
        service,
        auction_length,
        ownership_period,
        grace_period,
        minimum_sale_price,
        minimum_bid,
        tax_rate,
        royalties,
        is_public
    } = args;

    let creator = &ctx.accounts.creator;
    let hourglass_protocol = &mut ctx.accounts.hourglass_protocol;
    let hourglass_associated_account = &mut ctx.accounts.hourglass_associated_account;
    let mint = &ctx.accounts.hourglass_mint;
    let token_program = &mut ctx.accounts.token_program;
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
    hourglass_associated_account.service = service;
    hourglass_associated_account.is_public = is_public;
    hourglass_associated_account.auction_length = auction_length;
    hourglass_associated_account.ownership_period = ownership_period;
    hourglass_associated_account.grace_period = grace_period;
    hourglass_associated_account.minimum_sale_price = minimum_sale_price;
    hourglass_associated_account.minimum_bid = minimum_bid;
    hourglass_associated_account.tax_rate = tax_rate;
    hourglass_associated_account.creator = creator.key();
    hourglass_associated_account.hourglass = mint.key();
    hourglass_associated_account.next_auction_id = 0;
    hourglass_associated_account.current_owner = hourglass_associated_account.key();
    hourglass_associated_account.royalties = royalties;
    hourglass_associated_account.clockwork_thread_id = 0;
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
                String::from("0")
            ),
            (
                String::from("seller_fee_basis_points"),
                String::from("0")
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

    let transfer_ix = transfer(
        &creator.key(),
        &mint.key(),
        Rent::get()?.minimum_balance(
            size_of_metadata
        )
    );

    invoke(
        &transfer_ix, 
        &[
            creator.to_account_info(), 
            mint.to_account_info(), 
            system_program.to_account_info()
        ]
    )?;

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

    invoke_signed(
        &initialize_metadata_pointer_ix, 
        &[
            token_program.to_account_info(),
            hourglass_associated_account.to_account_info(),
            mint.to_account_info(),
        ], 
        &[signer_seeds]
    )?;
    
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

    // Initialize doesn't let us insert additional metadata, so we're 
    // gonna do it in second instruction right away.
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
            
        owner = token_program.key(),
        mint::token_program = token_program,
    )]
    pub hourglass_mint: AccountInfo<'info>,

    #[account(
        mut,
        seeds = ["hourglass_protocol".as_bytes()],
        bump
    )]
    pub hourglass_protocol: Box<Account<'info, Hourglass>>,

    #[account(
        init_if_needed,
        payer = creator,
        space = 8 + (2 * 8) + 4 + (10 * 32) + 32,
        seeds = [b"hourglass_creator_account", creator.key().as_ref()],
        bump
    )]
    pub creator_hourglass_account: Box<Account<'info, HourglassCreatorAccount>>,

    #[account(
        init,
        payer = creator,
        space = 8 + (15 * 8) + 1 + (3 * 32),
        seeds = [
            "hourglass_associated_account".as_bytes(), 
            &hourglass_protocol.total_hourglasses.to_be_bytes()
        ],
        bump
    )]
    pub hourglass_associated_account: Box<Account<'info, HourglassAssociatedAccount>>,

    /// CHECK: Safe since CPI to Associated Token Program will check this account.
    #[account(
        mut,
    )]
    pub hourglass_vault: AccountInfo<'info>,
    
    #[account(
        mut,
        constraint = fee_settlement_token.key() == hourglass_protocol.fee_settlement_token
    )]
    pub fee_settlement_token: Box<Account<'info, Mint>>,

    #[account(
        mut,
        constraint = creator_fee_settlement_token_account.owner == creator.key(),
        constraint = creator_fee_settlement_token_account.mint == fee_settlement_token.key()
    )]
    pub creator_fee_settlement_token_account: Box<Account<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent_program: Sysvar<'info, Rent>,
}