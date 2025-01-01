use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::{ HourglassError };

pub fn send_message(
    ctx: Context<SendMessage>,
    hourglass_id: u64,
    message_id: u64,
    message_content: String
) -> Result<()> {
    let user = &mut ctx.accounts.user;
    let hourglass_associated_account = &mut ctx.accounts.hourglass_associated_account;
    let message = &mut ctx.accounts.message;
    
    let expected_message_id = hourglass_associated_account.message_id;
    require!(
        message_id == expected_message_id,
        HourglassError::InvalidMessageOrder
    );

    message.author = user.key();
    message.content = message_content;

    hourglass_associated_account.message_id += 1;

    Ok(())
}

#[derive(Accounts)]
#[instruction(hourglass_id: u64, message_id: u64, message_content: String)]
pub struct SendMessage<'info> {
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
        // Whoever sends the transaction, must be either current owner of the Hourglass or creator (in case of replies)
        constraint = user.key() == hourglass_associated_account.current_owner || user.key() == hourglass_associated_account.creator,
    )]
    pub hourglass_associated_account: Box<Account<'info, HourglassAssociatedAccount>>,

    #[account(
        init,
        space = Message::size(&message_content),
        seeds = [
            "message".as_bytes(),
            &hourglass_id.to_be_bytes(),
            &message_id.to_be_bytes(),
        ],
        bump,
        payer = user
    )]
    pub message: Account<'info, Message>,
    pub system_program: Program<'info, System>,
}