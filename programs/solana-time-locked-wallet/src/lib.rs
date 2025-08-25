use anchor_lang::prelude::*;

declare_id!("AgrusQgGxVBPiKBjjNAQx82u1KWP1fwAJ1wmkxNVKHWQ");

#[program]
pub mod solana_time_locked_wallet {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
