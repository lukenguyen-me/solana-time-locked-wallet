use anchor_lang::prelude::*;

declare_id!("AgrusQgGxVBPiKBjjNAQx82u1KWP1fwAJ1wmkxNVKHWQ");

#[program]
pub mod solana_time_locked_wallet {
    use super::*;

    pub fn initialize_lock(
        ctx: Context<InitializeLock>,
        amount: u64,
        unlock_timestamp: i64,
    ) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        let system_program = &ctx.accounts.system_program;

        let now = Clock::get()?.unix_timestamp;
        if now >= unlock_timestamp {
            return Err(ErrorCode::UnlockTimestampPassed.into());
        }

        let cpi_context = CpiContext::new(
            system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.user.to_account_info(),
                to: wallet.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, amount)?;

        wallet.owner = ctx.accounts.user.key();
        wallet.balance = amount;
        wallet.unlock_timestamp = unlock_timestamp;

        msg!(
            "Create time-locked wallet for {}, with {}, unlock at {}",
            wallet.owner,
            wallet.balance,
            wallet.unlock_timestamp
        );

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;

        let now = Clock::get()?.unix_timestamp;
        if now < wallet.unlock_timestamp {
            return Err(ErrorCode::WalletIsLocked.into());
        }

        Ok(())
    }
}

#[account]
#[derive(Default)]
pub struct WalletState {
    pub owner: Pubkey,
    pub balance: u64,
    pub unlock_timestamp: i64,
}

#[derive(Accounts)]
#[instruction(amount: u64, unlock_timestamp: i64)]
pub struct InitializeLock<'info> {
    #[account(init,
        payer = user,
        space = 8 + 32 + 8 + 8, // init + owner + balance + unlock_timestamp
        seeds = [b"wallet", user.key().as_ref()],
        bump,
    )]
    pub wallet: Account<'info, WalletState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction()]
pub struct Withdraw<'info> {
    #[account(mut,
        seeds = [b"wallet", user.key().as_ref()],
        close = user,
        bump,
    )]
    pub wallet: Account<'info, WalletState>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The unlock timestamp must be in the future.")]
    UnlockTimestampPassed,
    #[msg("The wallet is locked.")]
    WalletIsLocked,
}
