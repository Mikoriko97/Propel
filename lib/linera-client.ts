import type { Signer } from '../@linera/client/dist/linera_web';
import { getPublicKey, sign as secpSign, utils as secpUtils, hashes as secpHashes } from '@noble/secp256k1';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export class EvmSigner implements Signer {
  private privateKey: Uint8Array;
  public address: string;

  constructor(privateKey: Uint8Array, address: string) {
    this.privateKey = privateKey;
    this.address = address;
  }

  static async generate(): Promise<EvmSigner> {
    const priv = secpUtils.randomSecretKey();
    const pub = getPublicKey(priv, false);
    const { keccak_256 } = await import('@noble/hashes/sha3.js');
    const hash = keccak_256(pub.slice(1));
    const addr = '0x' + toHex(hash.slice(-20));
    return new EvmSigner(priv, addr.toLowerCase());
  }

  static async fromJson(json: string): Promise<EvmSigner> {
    const data = JSON.parse(json);
    const hex = (data.privateKeyHex as string) || '';
    const parts = hex.match(/.{1,2}/g) || [];
    const priv = new Uint8Array(parts.map((h: string) => parseInt(h, 16)));
    return new EvmSigner(priv, (data.address as string).toLowerCase());
  }

  async toJson(): Promise<string> {
    return JSON.stringify({ privateKeyHex: toHex(this.privateKey), address: this.address });
  }

  async sign(owner: string, value: Uint8Array): Promise<string> {
    const normalizedOwner = owner.toLowerCase().replace(/^user:/, '');
    const prefix = new TextEncoder().encode(`\x19Ethereum Signed Message:\n${value.length}`);
    const prefixed = new Uint8Array(prefix.length + value.length);
    prefixed.set(prefix);
    prefixed.set(value, prefix.length);
    const { keccak_256 } = await import('@noble/hashes/sha3.js');
    const msgHash = keccak_256(prefixed);
    const sigRec = await secpSign(msgHash, this.privateKey, { prehash: false, format: 'recovered' });
    const v = 27 + sigRec[64];
    const sigHex = toHex(sigRec.slice(0, 64)) + v.toString(16).padStart(2, '0');
    return sigHex;
  }

  async containsKey(owner: string): Promise<boolean> {
    const normalizedOwner = owner.toLowerCase().replace(/^user:/, '');
    return normalizedOwner === this.address.toLowerCase();
  }
}

export class LineraService {
  private static instance: LineraService;
  private wasmInitialized = false;
  private lineraModule: any = null;
  // private wallet: any = null; // Removed to prevent stale reference usage
  private ws: WebSocket | null = null;
  private wsReconnectTimer: any = null;
  private client: any = null;
  private validatorOverride: string | null = (process.env.NEXT_PUBLIC_LINERA_VALIDATOR_URL as string) || null;
  private resolveValidatorBase(): string | null {
    const o = this.validatorOverride;
    if (!o) return null;
    const host = (() => { try { return new URL(o).host; } catch { return ''; } })();
    // If faucet is provided, keep using faucet (public network only)
    if (host.includes('faucet.testnet-conway.linera.net')) {
      return 'https://faucet.testnet-conway.linera.net';
    }
    return o;
  }
  // Default host: public Conway faucet (browser-friendly only for faucet ops)
  private defaultHost = 'https://faucet.testnet-conway.linera.net';
  // Faucet URL for wallet creation and chain claiming
  private faucetUrl = 'https://faucet.testnet-conway.linera.net'; 
  private defaultWs = 'wss://faucet.testnet-conway.linera.net/ws';

  private constructor() {}

  static getInstance(): LineraService {
    if (!LineraService.instance) {
      LineraService.instance = new LineraService();
    }
    return LineraService.instance;
  }

  async init() {
    if (this.wasmInitialized) return;
    
    this.lineraModule = await import('../@linera/client/dist/linera_web.js');
    if (typeof this.lineraModule.default === 'function') {
      await this.lineraModule.default();
    }
    // Note: calling main() causes a WASM trap (unreachable), so we skip it for now.
    // Logs should be handled by the client internally or via custom hooks if available.
    /*
    if (typeof this.lineraModule.main === 'function') {
      try {
        this.lineraModule.main();
      } catch (e) {
        console.warn('[Linera] Main entry point execution failed', e);
      }
    }
    */
    try {
      const { sha256 } = await import('@noble/hashes/sha2.js');
      const { hmac } = await import('@noble/hashes/hmac.js');
      secpHashes.sha256 = (msg: Uint8Array) => sha256(msg);
      secpHashes.hmacSha256 = (key: Uint8Array, message: Uint8Array) => hmac(sha256, key, message);
    } catch {}
    this.wasmInitialized = true;
    console.log('[Linera] WASM initialized');
  }

  private validateSigner(signer: EvmSigner) {
    if (!signer) {
      throw new Error('[Linera] Missing signer');
    }
    const hasMethods = typeof (signer as any).sign === 'function' && typeof (signer as any).containsKey === 'function';
    if (!hasMethods || !signer.address) {
      throw new Error('[Linera] Invalid signer');
    }
  }

  private async ensureWalletReady(): Promise<any> {
    await this.init();
    // Always read from memory/storage to get a fresh wallet instance
    let wallet = await this.lineraModule.InMemoryWallet.read();
    
    if (!wallet) {
      console.warn('[Linera] No persisted wallet found. Please create a Linera wallet via faucet first.');
      return null;
    }
    return wallet;
  }

  async createWalletAndClaimChain(): Promise<{
    address: string;
    microchain: string;
    signer: EvmSigner;
  }> {
    await this.init();
    const signer = await EvmSigner.generate();
    const faucet = new this.lineraModule.Faucet(this.faucetUrl);
    // Create a fresh wallet for claiming
    const wallet = await faucet.createWallet();
    const ownerStr = signer.address;
    const chainId = await faucet.claimChain(wallet, ownerStr);
    console.log('[Linera] Wallet created and chain claimed', { owner: ownerStr, chainId });
    try {
      const client = new this.lineraModule.Client(wallet, signer, false);
      this.client = client;
      try { await client.identity(); } catch {}
      console.log('[Linera] Client prepared after claim');
    } catch (e) {
      console.warn('[Linera] Failed to prepare client after claim', e);
    }
    return { address: signer.address, microchain: chainId, signer };
  }


  async query<T>(
    signer: EvmSigner,
    query: string,
    variables: Record<string, any> = {},
    chainId?: string
  ): Promise<T> {
    await this.init();
    const client = await this.getClient(signer, chainId);
    if (typeof client.query === 'function') {
        return await client.query({ query, variables });
    }
    throw new Error("Client does not support generic queries");
  }

  async primeClientFromStorage(signer: EvmSigner): Promise<boolean> {
    await this.init();
    this.validateSigner(signer);
    try {
      const wallet = await this.lineraModule.InMemoryWallet.read();
      if (!wallet) return false;
      const client = new this.lineraModule.Client(wallet, signer, false);
      this.client = client;
      try { await client.identity(); } catch {}
      return true;
    } catch {
      return false;
    }
  }

  private async getClient(signer: EvmSigner, chainId?: string) {
    await this.init();
    this.validateSigner(signer);
    if (this.client) {
      return this.client;
    }
    
    const wallet = await this.ensureWalletReady();
    
    if (!wallet) {
        throw new Error('[Linera] Wallet is not initialized in persistent storage');
    }

    try {
      const client = new this.lineraModule.Client(wallet, signer, false);
      this.client = client;
      console.log('[Linera] Client initialized', { address: signer.address, chainId: chainId || 'default' });
      return client;
    } catch (e: any) {
      const msg = e?.message || String(e);
      console.error('[Linera] Client initialization failed', msg);
      throw new Error('[Linera] Client initialization failed');
    }
  }

  async getApplication(signer: EvmSigner, applicationId: string, chainId?: string) {
    // Direct GraphQL block removed per user directive to rely on WASM Client
    /*
    if (chainId) {
       // ... (removed)
    }
    */

    // Fallback to WASM Client (Standard Mode)
    try {
      await this.init();
      const client = await this.getClient(signer, chainId);
      const frontend = await client.frontend();
      const app = await frontend.application(applicationId);
      console.log('[Linera] Application loaded via WASM', { applicationId, chainId });
      return app;
    } catch (e) {
      console.error('[Linera] Application load failed', e);
      throw e;
    }
  }

  async getTokenBalance(owner: string, applicationId: string, signer: EvmSigner, chainId?: string): Promise<string> {
    // Direct GraphQL block removed
    /*
    if (chainId) {
       // ... (removed)
    }
    */

    // Use WASM Client
    try {
      const app = await this.getApplication(signer, applicationId, chainId);
      // Try multiple key shapes to accommodate GraphQL input expectations
      const shapes = [
        `query { accounts { entry(key: "${owner}") { value } } }`,
        `query { accounts { entry(key: { Address: "${owner}" }) { value } } }`,
        `query { accounts { entry(key: { owner: { Address: "${owner}" }, index: 0 }) { value } } }`,
      ];
      for (const q of shapes) {
        try {
          const res = await app.query(q);
          const parsed = typeof res === 'string' ? JSON.parse(res) : res;
          const val = parsed?.data?.accounts?.entry?.value;
          if (val != null) {
            console.log('[Linera] Token balance query result', { owner, applicationId, value: val });
            return String(val);
          }
        } catch {}
      }
      console.warn('[Linera] Token balance not found with known key shapes');
      return '0';
    } catch (e) {
      console.error('[Linera] Token balance query failed', e);
      return '0';
    }
  }

  async getTickerSymbol(applicationId: string, signer: EvmSigner, chainId?: string): Promise<string> {
    // Direct GraphQL block removed
    /*
    if (chainId) {
        // ...
    }
    */

    // Use WASM Client
    try {
      const app = await this.getApplication(signer, applicationId, chainId);
      const query = `query { ticker_symbol }`;
      const res = await app.query(query);
      const parsed = typeof res === 'string' ? JSON.parse(res) : res;
      const val = parsed?.data?.ticker_symbol;
      console.log('[Linera] Ticker symbol', { applicationId, ticker: val });
      return String(val ?? 'TLINERA');
    } catch (e) {
      console.error('[Linera] Ticker symbol query failed', e);
      return 'TLINERA';
    }
  }

  // Helper to prevent hanging promises
  private async withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms))
    ]);
  }

  // New Method: Check Chain Status directly
  async getChainInfo(chainId: string): Promise<any> {
      console.warn('[Linera] getChainInfo via direct fetch is disabled. Returning mock/empty to prevent errors.');
      return null;
  }

  async queryApplicationDirect(chainId: string, applicationId: string, query: string): Promise<any> {
    throw new Error('Direct application GraphQL not supported on public faucet');
  }

  async checkConnectivity(): Promise<boolean> {
    try {
      console.log('[Linera] Checking connectivity...');
      await this.init();
      
      // Optimistic check: if we have a client and wallet, we are "ready"
      // We will try to ping validators, but if it times out, we might still be "connected" to the local state.
      // However, for "Linera status" in UI, we want network connectivity.
      
      if (this.client) {
        try {
          const frontend = await this.client.frontend();
          // Timeout after 5 seconds
          const info = await this.withTimeout(frontend.validatorVersionInfo(), 5000, 'validatorVersionInfo');
          const ok = Array.isArray(info?.validators) ? info.validators.length > 0 : Boolean(info);
          console.log('[Linera] Connectivity check result:', ok);
          return ok;
        } catch (e) {
          console.warn('[Linera] Connectivity check failed (validators unreachable or timeout)', e);
          return false;
        }
      }
      
      // If no client yet, check if wallet exists in storage
      const wallet = await this.lineraModule.InMemoryWallet.read();
      const hasWallet = Boolean(wallet);
      console.log('[Linera] Connectivity check: No client, wallet exists:', hasWallet);
      return hasWallet;
    } catch (e) {
      console.warn('[Linera] Connectivity check fatal error', e);
      return false;
    }
  }

  async getBalance(
    address: string, 
    microchain: string, 
    signer: EvmSigner
  ): Promise<string> {
    console.log('[Linera] getBalance called', { address, microchain });
    const query = `
      query GetBalance($chainId: ChainId!) {
        chain(chainId: $chainId) {
          executionState {
            system {
              balance
            }
          }
        }
      }
    `;

    try {
      await this.init();
      console.log('[Linera] getBalance: WASM initialized');
      const client = await this.getClient(signer, microchain);
      console.log('[Linera] Requesting balance via SDK client...');
      
      // Timeout after 10 seconds for balance check
      const b = await this.withTimeout(client.balance(), 10000, 'client.balance');
      
      console.log('[Linera] Client SDK balance', { chainId: microchain, balance: b });
      return b && b.length ? b : '0';
    } catch (e) {
      console.warn('[Linera] SDK balance check failed', e);
      try {
        // Fallback is likely to fail if faucet doesn't proxy, but leaving it just in case
        const res = await fetch('/api/linera-balance', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chainId: microchain }) });
        const json = await res.json();
        if (json?.balance != null) {
          console.log('[Linera] Fallback API balance', { chainId: microchain, balance: json.balance });
          return String(json.balance);
        }
      } catch (e2) {
        console.warn('[Linera] Fallback API balance failed', e2);
      }
      return '0';
    }
  }

  async queryChainDirect(chainId: string, query: string, variables?: Record<string, any>): Promise<any> {
    // Public faucet does not support chain GraphQL. Use WASM client.
    throw new Error('Direct chain GraphQL not supported on public faucet');
  }

  subscribeNotifications(
    chainId: string,
    wsUrl: string,
    onStatus?: (status: string) => void,
    onNotification?: (payload: any) => void
  ): { unsubscribe: () => void } {
    const finalWs = wsUrl || this.defaultWs;
    if (!finalWs || !chainId) {
      console.warn('[Linera] Missing wsUrl or chainId for subscription');
      return { unsubscribe: () => {} };
    }
    const protocol = 'graphql-transport-ws';
    const ws = new WebSocket(finalWs, protocol);
    this.ws = ws;
    const heartbeatInterval = 15000;
    let hb: any = null;
    const send = (msg: any) => ws.readyState === ws.OPEN && ws.send(JSON.stringify(msg));
    const startHeartbeat = () => {
      hb = setInterval(() => send({ type: 'ping' }), heartbeatInterval);
    };
    const stopHeartbeat = () => { if (hb) { clearInterval(hb); hb = null; } };
    ws.onopen = () => {
      onStatus?.('🟢 WebSocket connected');
      send({ type: 'connection_init' });
      startHeartbeat();
    };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'connection_ack') {
          onStatus?.('✅ Connection acknowledged');
          const sub = {
            id: 'chain_notifications',
            type: 'subscribe',
            payload: { query: `subscription { notifications(chainId: "${chainId}") }` }
          };
          console.log('[Linera] Subscribing to chain notifications', sub);
          send(sub);
        } else if (msg.type === 'next' && msg.id === 'chain_notifications') {
          console.log('[Linera] Notification', msg.payload);
          onNotification?.(msg.payload);
        } else if (msg.type === 'error') {
          console.error('[Linera] WS error message', msg);
          const errMsg = Array.isArray(msg.payload?.errors) && msg.payload.errors.length ? msg.payload.errors[0]?.message : 'Unknown error';
          if (String(errMsg).includes('Schema is not configured for subscriptions')) {
            onStatus?.('⚠️ Subscriptions not supported on this endpoint');
            try { send({ id: 'chain_notifications', type: 'complete' }); } catch {}
            try { ws.close(); } catch {}
            stopHeartbeat();
            this.ws = null;
            return;
          }
          onStatus?.('❌ WebSocket error');
        } else if (msg.type === 'complete') {
          onStatus?.('🟡 Subscription completed');
        }
      } catch (e) {
        console.error('[Linera] WS parse error', e);
      }
    };
    ws.onclose = () => {
      onStatus?.('🔴 WebSocket disconnected');
      stopHeartbeat();
      // Simple reconnect
      if (!this.wsReconnectTimer) {
        this.wsReconnectTimer = setTimeout(() => {
          this.wsReconnectTimer = null;
          this.subscribeNotifications(chainId, wsUrl, onStatus, onNotification);
        }, 5000);
      }
    };
    ws.onerror = (err) => {
      console.error('[Linera] WebSocket error', err);
    };
    const unsubscribe = () => {
      try { send({ id: 'chain_notifications', type: 'complete' }); } catch {}
      try { ws.close(); } catch {}
      stopHeartbeat();
      this.ws = null;
    };
    return { unsubscribe };
  }
}
