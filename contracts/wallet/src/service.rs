#![cfg_attr(target_arch = "wasm32", no_main)]

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Request, Response, Schema};
use fungible::Parameters;
use linera_sdk::{
    abis::fungible::{FungibleOperation, FungibleTokenAbi},
    graphql::GraphQLMutationRoot as _,
    linera_base_types::{AccountOwner, WithServiceAbi},
    Service, ServiceRuntime,
};
use wallet_bridge::{AccountEntry, TICKER_SYMBOL};

#[derive(Clone)]
pub struct WalletBridgeService {
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(WalletBridgeService);

impl WithServiceAbi for WalletBridgeService {
    type Abi = FungibleTokenAbi;
}

impl Service for WalletBridgeService {
    type Parameters = Parameters;

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        WalletBridgeService { runtime: Arc::new(runtime) }
    }

    async fn handle_query(&self, request: Request) -> Response {
        let schema = Schema::build(
            self.clone(),
            FungibleOperation::mutation_root(self.runtime.clone()),
            EmptySubscription,
        )
        .finish();
        schema.execute(request).await
    }
}

struct Accounts {
    runtime: Arc<ServiceRuntime<WalletBridgeService>>,
}

#[Object]
impl Accounts {
    async fn entry(&self, key: AccountOwner) -> AccountEntry {
        let value = self.runtime.owner_balance(key);
        AccountEntry { key, value }
    }

    async fn entries(&self) -> Vec<AccountEntry> {
        self.runtime
            .owner_balances()
            .into_iter()
            .map(|(owner, amount)| AccountEntry { key: owner, value: amount })
            .collect()
    }

    async fn keys(&self) -> Vec<AccountOwner> {
        self.runtime.balance_owners()
    }
}

#[Object]
impl WalletBridgeService {
    async fn ticker_symbol(&self) -> Result<String, async_graphql::Error> {
        Ok(String::from(TICKER_SYMBOL))
    }

    async fn accounts(&self) -> Result<Accounts, async_graphql::Error> {
        Ok(Accounts { runtime: self.runtime.clone() })
    }
}