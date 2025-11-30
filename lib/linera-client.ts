import type { Signer } from '../@linera/client/dist/linera_web';
import { getPublicKey, sign as secpSign, utils as secpUtils, hashes as secpHashes } from '@noble/secp256k1';
import { loadLineraModule } from './linera-loader';

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

export class LineraSignerHelper {
    static async loadMnemonic(): Promise<string | null> {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('linera_mnemonic');
    }

    static async createSigner(mnemonic: string): Promise<any> {
        try {
            const { PrivateKey } = await import('@linera/signer');
            const signer = PrivateKey.fromMnemonic(mnemonic);
            return signer;
        } catch {
            const { sha256 } = await import('@noble/hashes/sha2.js');
            const encoder = new TextEncoder();
            const hash = sha256(encoder.encode(mnemonic));
            const priv = hash;
            const { getPublicKey } = await import('@noble/secp256k1');
            const pub = getPublicKey(priv, false);
            const { keccak_256 } = await import('@noble/hashes/sha3.js');
            const addrHash = keccak_256(pub.slice(1));
            const addr = '0x' + Array.from(addrHash.slice(-20)).map(b => b.toString(16).padStart(2, '0')).join('');
            return new EvmSigner(priv, addr.toLowerCase());
        }
    }
}

export class LineraService {
  private static instance: LineraService;
  private wasmInitialized = false;
  private lineraModule: any = null;
  private client: any = null;
  private faucetUrl = 'https://faucet.testnet-conway.linera.net';

  private constructor() {}

  static getInstance(): LineraService {
    if (!LineraService.instance) {
      LineraService.instance = new LineraService();
    }
    return LineraService.instance;
  }

  async init() {
    if (this.wasmInitialized) return;
    
    try {
      // Use the loader instead of direct import
      this.lineraModule = await loadLineraModule();
      if (!this.lineraModule) {
          throw new Error("Failed to load Linera module");
      }
    } catch (e) {
      console.error('[Linera] Module load failed, trying fallback import', e);
      // Fallback to direct import if loader fails (e.g. SSR)
      this.lineraModule = await import('../@linera/client/dist/linera_web.js');
      if (typeof this.lineraModule.default === 'function') {
        await this.lineraModule.default();
      }
    }

    try {
      const { sha256 } = await import('@noble/hashes/sha2.js');
      const { hmac } = await import('@noble/hashes/hmac.js');
      secpHashes.sha256 = (msg: Uint8Array) => sha256(msg);
      secpHashes.hmacSha256 = (key: Uint8Array, message: Uint8Array) => hmac(sha256, key, message);
    } catch {}
    
    this.wasmInitialized = true;
    console.log('[Linera] WASM initialized');
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms))
    ]);
  }

  async createWalletAndClaimChain(): Promise<{
    address: string;
    microchain: string;
    signer: any; // Changed to any to allow PrivateKey or EvmSigner
  }> {
    await this.init();
    
    let signer: any;
    let ownerStr: string;
    
    let mnemonic = typeof window !== 'undefined' ? localStorage.getItem('linera_mnemonic') : null;
    if (!mnemonic) {
        try {
            const { Wallet } = await import('ethers');
            const w = Wallet.createRandom();
            mnemonic = w.mnemonic!.phrase;
            if (typeof window !== 'undefined') localStorage.setItem('linera_mnemonic', mnemonic);
        } catch {
            signer = await EvmSigner.generate();
        }
    }
    if (!signer) {
        signer = await LineraSignerHelper.createSigner(mnemonic as string);
    }
    ownerStr = typeof (signer as any).address === 'function' ? (signer as any).address() : (signer as any).address;

    const faucet = new this.lineraModule.Faucet(this.faucetUrl);
    
    const wallet = await faucet.createWallet();
    const chainId = await faucet.claimChain(wallet, ownerStr);
    console.log('[Linera] Wallet created and chain claimed', { owner: ownerStr, chainId });

    // Persist client
    const clientRet = new this.lineraModule.Client(wallet, signer, false);
    const isClientInstance = clientRet && typeof clientRet === 'object' && typeof (clientRet as any).balance === 'function';
    if (isClientInstance) {
        this.client = clientRet;
    } else if (typeof clientRet === 'number') {
        this.client = this.lineraModule.Client.__wrap(clientRet);
    } else if (clientRet && typeof (clientRet as any).then === 'function') {
        const awaited = await (clientRet as Promise<any>);
        this.client = awaited && typeof awaited === 'number' ? this.lineraModule.Client.__wrap(awaited) : awaited;
    } else {
        throw new Error('Unexpected Client constructor return value');
    }
    
    try { await this.client.identity(); } catch {}
    
    return { address: (typeof (signer as any).address === 'function' ? (signer as any).address() : (signer as any).address), microchain: chainId, signer };
  }

  async primeClientFromStorage(signer: any): Promise<boolean> {
    try {
        await this.init();
        const wallet = await this.lineraModule.InMemoryWallet.read();
        if (wallet) {
            const clientRet = new this.lineraModule.Client(wallet, signer, false);
            const isClientInstance = clientRet && typeof clientRet === 'object' && typeof (clientRet as any).balance === 'function';
            if (isClientInstance) {
                this.client = clientRet;
            } else if (typeof clientRet === 'number') {
                this.client = this.lineraModule.Client.__wrap(clientRet);
            } else if (clientRet && typeof (clientRet as any).then === 'function') {
                const awaited = await (clientRet as Promise<any>);
                this.client = awaited && typeof awaited === 'number' ? this.lineraModule.Client.__wrap(awaited) : awaited;
            } else {
                throw new Error('Unexpected Client constructor return value');
            }
            return true;
        }
        return false;
    } catch (e) {
        console.warn('[Linera] primeClientFromStorage failed', e);
        return false;
    }
  }

  async getBalance(
    address: string, 
    microchain: string, 
    signer: any
  ): Promise<string> {
    try {
        await this.init();
        if (!this.client) {
             await this.primeClientFromStorage(signer);
        }
        if (!this.client) throw new Error('Client not initialized');

        console.log('[Linera] Requesting balance via SDK client...');
        const b = String(await this.withTimeout(this.client.balance(), 10000, 'client.balance'));
        console.log('[Linera] Client SDK balance', { chainId: microchain, balance: b });
        return b && b.length ? b : '0';
    } catch (e) {
        console.warn('[Linera] getBalance failed', e);
        return '0';
    }
  }

  async getApplication(signer: any, applicationId: string, chainId?: string) {
      await this.init();
      if (!this.client) await this.primeClientFromStorage(signer);
      const frontend = await this.client.frontend();
      const app = await frontend.application(applicationId);
      console.log('[Linera] Application loaded via WASM', { applicationId });
      return app;
  }

  async getTokenBalance(owner: string, applicationId: string, signer: any, chainId?: string): Promise<string> {
      try {
          const app = await this.getApplication(signer, applicationId, chainId);
          // Try standard query shapes
          const shapes = [
            `query { accounts { entry(key: "${owner}") { value } } }`,
            `query { accounts { entry(key: { Address: "${owner}" }) { value } } }`,
          ];
          for (const q of shapes) {
              try {
                  const res = await app.query(q);
                  const parsed = typeof res === 'string' ? JSON.parse(res) : res;
                  const val = parsed?.data?.accounts?.entry?.value;
                  if (val != null) return String(val);
              } catch {}
          }
          return '0';
      } catch (e) {
          console.warn('[Linera] getTokenBalance failed', e);
          return '0';
      }
  }
  
  async getTickerSymbol(applicationId: string, signer: any, chainId?: string): Promise<string> {
      try {
          const app = await this.getApplication(signer, applicationId, chainId);
          const res = await app.query('query { ticker_symbol }');
          const parsed = typeof res === 'string' ? JSON.parse(res) : res;
          return String(parsed?.data?.ticker_symbol ?? 'TLINERA');
      } catch (e) {
          return 'TLINERA';
      }
  }

  async checkConnectivity(): Promise<boolean> {
      try {
          await this.init();
          if (this.client) {
              try {
                  const b = await this.withTimeout(this.client.balance(), 5000, 'ping-balance');
                  return typeof b === 'string' ? b.length > 0 : Boolean(b);
              } catch {
                  return false;
              }
          }
          const wallet = await this.lineraModule.InMemoryWallet.read();
          return Boolean(wallet);
      } catch {
          return false;
      }
  }

  onNotification(callback: (n: any) => void) {
      if (this.client) {
          this.client.onNotification(callback);
      }
  }
}
