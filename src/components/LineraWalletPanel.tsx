import { useCallback, useMemo, useState } from 'react';
import { initWallet, requestMicrochain, LineraWalletInfo, getClient } from '../lib/linera';

type Status = 'idle' | 'loading' | 'ready' | 'error';

// removed local timeout wrapper; internal retry/timeout logic is used

export default function LineraWalletPanel() {
  const faucetUrl = useMemo(() => import.meta.env.VITE_LINERA_FAUCET_URL as string | undefined, []);
  const [, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<LineraWalletInfo | null>(null);
  const [loadingInit, setLoadingInit] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const handleInitWallet = useCallback(async () => {
    console.log('Init wallet clicked');
    setLoadingInit(true);
    setError(null);
    try {
      const info = await initWallet(faucetUrl);
      await getClient();
      setWallet(info);
      setStatus('ready');
      console.log('Linera wallet initialized:', info);
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
      console.error('Linera wallet init error:', e);
    } finally {
      setLoadingInit(false);
    }
  }, [faucetUrl]);

  const handleRequestChain = useCallback(async () => {
    console.log('Request chain clicked');
    setLoadingRequest(true);
    setError(null);
    try {
      const info = await requestMicrochain(faucetUrl);
      setWallet(prev => ({ ...(prev ?? {}), ...info }));
      setStatus('ready');
      console.log('Linera microchain requested:', info);
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
      console.error('Linera microchain request error:', e);
    } finally {
      setLoadingRequest(false);
    }
  }, [faucetUrl]);

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Linera Wallet & Microchain</h3>
        <span className="text-xs text-zinc-500">Testnet Conway</span>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
        Faucet: {faucetUrl ?? 'not configured'}
      </p>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); void handleInitWallet(); }}
          className="px-3 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
          disabled={loadingInit}
        >
          {loadingInit ? 'Initializing…' : 'Initialize Wallet'}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); void handleRequestChain(); }}
          className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700"
          disabled={loadingRequest}
        >
          {loadingRequest ? 'Requesting…' : 'Request Microchain'}
        </button>
      </div>

      {wallet && (
        <div className="text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="rounded-md bg-zinc-50 dark:bg-zinc-800 p-2">
              <div className="text-xs text-zinc-500">Wallet Address</div>
              <div className="font-mono break-all">{wallet.address ?? '—'}</div>
            </div>
            <div className="rounded-md bg-zinc-50 dark:bg-zinc-800 p-2">
              <div className="text-xs text-zinc-500">Chain ID</div>
              <div className="font-mono break-all">{wallet.chainId ?? '—'}</div>
            </div>
            <div className="rounded-md bg-zinc-50 dark:bg-zinc-800 p-2">
              <div className="text-xs text-zinc-500">Balance</div>
              <div className="font-mono break-all">{wallet.balance ?? '—'}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-zinc-500">Created: {wallet.createdAt ?? '—'}</div>
        </div>
      )}

      {error && (
        <div className="mt-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}