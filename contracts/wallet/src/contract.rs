#![cfg_attr(target_arch = "wasm32", no_main)]

use linera_sdk::{
    abis::fungible::{Account as FungibleAccount, FungibleOperation, FungibleResponse, FungibleTokenAbi, InitialState, Parameters},
    linera_base_types::{Account as BaseAccount, AccountOwner, ChainId, WithContractAbi},
    Contract, ContractRuntime,
};
use wallet_bridge::{Message, TICKER_SYMBOL};

pub struct WalletBridgeContract {
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(WalletBridgeContract);

impl WithContractAbi for WalletBridgeContract {
    type Abi = FungibleTokenAbi;
}

impl Contract for WalletBridgeContract {
    type Message = Message;
    type Parameters = Parameters;
    type InstantiationArgument = InitialState;
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        WalletBridgeContract { runtime }
    }

    async fn instantiate(&mut self, state: Self::InstantiationArgument) {
        for (owner, amount) in state.accounts {
            let account = BaseAccount { chain_id: self.runtime.chain_id(), owner };
            self.runtime.transfer(AccountOwner::CHAIN, account, amount);
        }
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation {
            FungibleOperation::Balance { owner } => {
                let balance = self.runtime.owner_balance(owner);
                FungibleResponse::Balance(balance)
            }

            FungibleOperation::TickerSymbol => {
                FungibleResponse::TickerSymbol(String::from(TICKER_SYMBOL))
            }

            FungibleOperation::Approve { .. } => {
                panic!("Approve operation is not supported by wallet bridge")
            }

            FungibleOperation::Transfer { owner, amount, target_account } => {
                self.runtime.check_account_permission(owner).expect("Permission for Transfer operation");
                let fungible_target_account = target_account;
                let target_account = self.normalize_account(target_account);
                self.runtime.transfer(owner, target_account, amount);
                self.transfer(fungible_target_account.chain_id);
                FungibleResponse::Ok
            }

            FungibleOperation::TransferFrom { .. } => {
                panic!("TransferFrom operation is not supported by wallet bridge")
            }

            FungibleOperation::Claim { source_account, amount, target_account } => {
                self.runtime.check_account_permission(source_account.owner).expect("Permission for Claim operation");
                let fungible_source_account = source_account;
                let fungible_target_account = target_account;
                let source_account = self.normalize_account(source_account);
                let target_account = self.normalize_account(target_account);
                self.runtime.claim(source_account, target_account, amount);
                self.claim(fungible_source_account.chain_id, fungible_target_account.chain_id);
                FungibleResponse::Ok
            }
        }
    }

    async fn execute_message(&mut self, message: Self::Message) {
        match message {
            Message::Notify => (),
        }
    }

    async fn store(self) {}
}

impl WalletBridgeContract {
    fn transfer(&mut self, chain_id: ChainId) {
        if chain_id != self.runtime.chain_id() {
            let message = Message::Notify;
            self.runtime.prepare_message(message).with_authentication().send_to(chain_id);
        }
    }

    fn claim(&mut self, source_chain_id: ChainId, target_chain_id: ChainId) {
        if source_chain_id == self.runtime.chain_id() {
            self.transfer(target_chain_id);
        } else {
            let message = Message::Notify;
            self.runtime.prepare_message(message).with_authentication().send_to(source_chain_id);
        }
    }

    fn normalize_account(&self, account: FungibleAccount) -> BaseAccount {
        BaseAccount { chain_id: account.chain_id, owner: account.owner }
    }
}