import { useEffect, useMemo, useState, useCallback } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw } from 'lucide-react';
import {
  getClient,
  getState,
  hasClient,
  refreshBalances,
  transferToWallet,
  transferToChain,
  initWalletPersist,
  requestMicrochainPersist,
  claimFaucetTokens,
} from '../lib/linera';

type Status = 'idle' | 'loading' | 'ready' | 'error';

function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms)),
  ]) as Promise<T>;
}

export default function WalletCard() {
  const faucetUrl = useMemo(() => import.meta.env.VITE_LINERA_FAUCET_URL as string | undefined, []);
  const [, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [{ address, chainId }, setIdentity] = useState<{ address?: string; chainId?: string }>(() => getState());
  const [{ chainBalance, accountBalance }, setBalances] = useState<{ chainBalance?: string; accountBalance?: string }>({});
  const [amountToWallet, setAmountToWallet] = useState<string>('');
  const [amountToChain, setAmountToChain] = useState<string>('');
  const [amountToWalletError, setAmountToWalletError] = useState<string | null>(null);
  const [amountToChainError, setAmountToChainError] = useState<string | null>(null);

  const isWholeAmount = useCallback((s: string) => /^\d+(\.0+)?$/.test((s ?? '').toString().trim()), []);

  const formatTLINERA = useCallback((s?: string) => {
    const t = (s ?? '').toString().trim();
    if (!t) return '—';
    let nStr = t;
    if (/^\d+\.$/.test(t)) nStr = t.slice(0, -1);
    else if (/^\d+$/.test(t)) nStr = t;
    else if (/^\d+\.0+$/.test(t)) nStr = t.split('.')[0];
    else return `${t} TLINERA`;
    try {
      const n = BigInt(nStr);
      const withSep = n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return `${withSep} TLINERA`;
    } catch {
      return `${nStr} TLINERA`;
    }
  }, []);

  // Decoupled loading states per action to avoid blocking all buttons
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [loadingInit, setLoadingInit] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [loadingDeposit, setLoadingDeposit] = useState(false);

  const load = useCallback(async () => {
    setLoadingRefresh(true);
    setError(null);
    try {
      await withTimeout(getClient(), 12000);
      setIdentity(getState());
      const balances = await withTimeout(refreshBalances(), 20000);
      setBalances(balances);
      setStatus('ready');
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
    } finally {
      setLoadingRefresh(false);
    }
  }, []);

  useEffect(() => {
    // On first render, do a light refresh without forcing client creation
    setIdentity(getState());
    if (hasClient()) {
      void load();
      void (async () => {
        const { subscribeNotifications } = await import('../lib/linera');
        await subscribeNotifications(async () => {
          try {
            setIdentity(getState());
            const balances = await refreshBalances();
            setBalances(balances);
            setStatus('ready');
          } catch (e) {
            setError((e as Error).message);
            setStatus('error');
          }
        });
      })();
    } else {
      setStatus('idle');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInitWallet = useCallback(async () => {
    setLoadingInit(true);
    setError(null);
    try {
      const info = await initWalletPersist(faucetUrl);
      setIdentity({ address: info.address, chainId: info.chainId });
      await getClient();
      const balances = await refreshBalances();
      setBalances(balances);
      setStatus('ready');
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
    } finally {
      setLoadingInit(false);
    }
  }, [faucetUrl]);

  const handleRequestChain = useCallback(async () => {
    setLoadingRequest(true);
    setError(null);
    try {
      const info = await requestMicrochainPersist(faucetUrl);
      setIdentity({ address: info.address, chainId: info.chainId });
      await getClient();
      const balances = await refreshBalances();
      setBalances(balances);
      setStatus('ready');
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
    } finally {
      setLoadingRequest(false);
    }
  }, [faucetUrl]);

  const onWithdrawToWallet = useCallback(async () => {
    if (!amountToWallet || Number(amountToWallet) <= 0) return;
    if (!isWholeAmount(amountToWallet)) {
      setError('Amount must be a whole number');
      return;
    }
    setLoadingWithdraw(true);
    setError(null);
    try {
      await withTimeout(transferToWallet(amountToWallet), 15000);
      const balances = await withTimeout(refreshBalances(), 20000);
      setBalances(balances);
      setAmountToWallet('');
      setAmountToWalletError(null);
      setStatus('ready');
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
    } finally {
      setLoadingWithdraw(false);
    }
  }, [amountToWallet, isWholeAmount]);

  const onDepositToChain = useCallback(async () => {
    if (!amountToChain || Number(amountToChain) <= 0) return;
    if (!isWholeAmount(amountToChain)) {
      setError('Amount must be a whole number');
      return;
    }
    setLoadingDeposit(true);
    setError(null);
    try {
      await withTimeout(transferToChain(amountToChain), 15000);
      const balances = await withTimeout(refreshBalances(), 12000);
      setBalances(balances);
      setAmountToChain('');
      setAmountToChainError(null);
      setStatus('ready');
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
    } finally {
      setLoadingDeposit(false);
    }
  }, [amountToChain, isWholeAmount]);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-6 bg-[var(--bg-secondary)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Linera Wallet</h3>
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:text-emerald-light border border-gray-200 dark:border-gray-700 rounded-lg hover:border-emerald-light transition-colors disabled:opacity-50"
          onClick={(e) => { e.stopPropagation(); void load(); }}
          disabled={loadingRefresh || !hasClient()}
          title="Refresh balances"
        >
          <RefreshCw className={`w-4 h-4 ${loadingRefresh ? 'animate-spin' : ''}`} />
          <span>{loadingRefresh ? 'Refreshing…' : 'Refresh'}</span>
        </button>
        <button
          type="button"
          className="ml-2 text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 text-[var(--text-secondary)] hover:text-emerald-light"
          onClick={(e) => { e.stopPropagation(); void claimFaucetTokens().then(async () => { const balances = await refreshBalances(); setBalances(balances); }); }}
          disabled={!hasClient()}
          title="Claim faucet tokens to wallet"
        >
          Claim Tokens
        </button>
      </div>

      {/* Wallet Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs font-medium text-[var(--text-muted)] mb-1">Wallet Address</div>
          <div className="text-sm font-mono break-all text-[var(--text-primary)]">{address ?? '—'}</div>
        </div>
        <div className="rounded-lg bg-[var(--bg-primary)] border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs font-medium text-[var(--text-muted)] mb-1">Microchain ID</div>
          <div className="text-sm font-mono break-all text-[var(--text-primary)]">{chainId ?? '—'}</div>
        </div>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg bg-emerald-light/5 border border-emerald-light/20 p-4">
          <div className="text-xs font-medium text-emerald-dark dark:text-emerald-light mb-1">Microchain Balance</div>
          <div className="text-lg font-bold text-emerald-dark dark:text-emerald-light">{formatTLINERA(chainBalance)}</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Available on microchain</p>
        </div>
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4">
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Wallet Account Balance</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatTLINERA(accountBalance)}</div>
          <p className="text-xs text-[var(--text-muted)] mt-1">Available in wallet</p>
        </div>
      </div>

      {/* Transfer Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-lg p-4 border-2 border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center gap-2 mb-3">
            <ArrowDownToLine className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="font-bold text-[var(--text-primary)]">To Wallet Account</div>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-3">Move TLINERA from microchain to your wallet account</p>
          <div className="space-y-2">
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amountToWallet}
              onChange={(e) => {
                const v = e.target.value;
                setAmountToWallet(v);
                if (!v) {
                  setAmountToWalletError(null);
                } else if (!isWholeAmount(v)) {
                  setAmountToWalletError('Amount must be a whole number');
                } else if (Number(v) <= 0) {
                  setAmountToWalletError('Amount must be greater than 0');
                } else {
                  setAmountToWalletError(null);
                }
              }}
              placeholder="Enter amount (whole numbers only)"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {amountToWalletError && (
              <div className="text-xs text-red-600 dark:text-red-400">{amountToWalletError}</div>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); void onWithdrawToWallet(); }}
              className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loadingWithdraw || !!amountToWalletError || !amountToWallet}
            >
              {loadingWithdraw ? 'Transferring…' : 'Transfer to Wallet'}
            </button>
          </div>
        </div>

        <div className="rounded-lg p-4 border-2 border-emerald-light/30 bg-emerald-light/5">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUpFromLine className="w-5 h-5 text-emerald-dark dark:text-emerald-light" />
            <div className="font-bold text-[var(--text-primary)]">To Microchain</div>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-3">Move TLINERA from wallet account to microchain</p>
          <div className="space-y-2">
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              pattern="[0-9]*"
              value={amountToChain}
              onChange={(e) => {
                const v = e.target.value;
                setAmountToChain(v);
                if (!v) {
                  setAmountToChainError(null);
                } else if (!isWholeAmount(v)) {
                  setAmountToChainError('Amount must be a whole number');
                } else if (Number(v) <= 0) {
                  setAmountToChainError('Amount must be greater than 0');
                } else {
                  setAmountToChainError(null);
                }
              }}
              placeholder="Enter amount (whole numbers only)"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-emerald-light"
            />
            {amountToChainError && (
              <div className="text-xs text-red-600 dark:text-red-400">{amountToChainError}</div>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); void onDepositToChain(); }}
              className="w-full px-4 py-2 rounded-lg bg-emerald-light hover:bg-emerald-dark text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loadingDeposit || !!amountToChainError || !amountToChain}
            >
              {loadingDeposit ? 'Transferring…' : 'Transfer to Microchain'}
            </button>
          </div>
        </div>
      </div>

      {/* Initialization Actions */}
      {(!address || !chainId) && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm text-[var(--text-muted)] mb-3">Get started by initializing your wallet and requesting a microchain:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); void handleInitWallet(); }}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loadingInit}
            >
              {loadingInit ? 'Initializing…' : 'Initialize Wallet'}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); void handleRequestChain(); }}
              className="px-4 py-2 rounded-lg bg-emerald-light hover:bg-emerald-dark text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loadingRequest}
            >
              {loadingRequest ? 'Requesting…' : 'Request Microchain'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Error:</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}