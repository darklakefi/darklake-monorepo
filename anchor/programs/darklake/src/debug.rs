#[macro_export]
macro_rules! debug {
    ($($rest:tt)*) => {
        #[cfg(feature="verbose")]
        {
            use anchor_lang::solana_program::msg;
            msg!($($rest)*)
        }
    };
}
