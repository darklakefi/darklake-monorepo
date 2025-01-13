use std::sync::{Mutex, OnceLock};

pub struct AmmParameters {
    token_x_decimals: u8,
    token_y_decimals: u8,
}

pub static GLOBAL_COUNTER: OnceLock<Mutex<AmmParameters>> = OnceLock::new();

pub fn get_token_x_decimals() -> u8
{
    let amm_params = GLOBAL_COUNTER.get_or_init(|| Mutex::new(AmmParameters { token_x_decimals: 6, token_y_decimals: 6 }));  // Initialize if not already set
    let decimals = amm_params.lock().unwrap();

    return decimals.token_x_decimals;
}

pub fn get_token_y_decimals() -> u8
{
    let amm_params = GLOBAL_COUNTER.get_or_init(|| Mutex::new(AmmParameters { token_x_decimals: 6, token_y_decimals: 6 }));  // Initialize if not already set
    let decimals = amm_params.lock().unwrap();

    return decimals.token_y_decimals;
}

pub fn set_token_decimals(x: u8, y: u8) {
    let amm_params = GLOBAL_COUNTER.get_or_init(|| Mutex::new(AmmParameters { token_x_decimals: 6, token_y_decimals: 6 }));  // Initialize if not already set
    let mut decimals = amm_params.lock().unwrap();

    decimals.token_x_decimals = x;
    decimals.token_y_decimals = y;
}