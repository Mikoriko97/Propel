use async_graphql::SimpleObject;
use linera_sdk::linera_base_types::{AccountOwner, Amount};
use serde::{Deserialize, Serialize};

pub const TICKER_SYMBOL: &str = "TLINERA";

#[derive(Deserialize, SimpleObject)]
pub struct AccountEntry {
    pub key: AccountOwner,
    pub value: Amount,
}

#[derive(Debug, Deserialize, Serialize)]
pub enum Message {
    Notify,
}