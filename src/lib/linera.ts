import * as linera from '@linera/client'
import { PrivateKey } from '@linera/signer'

type ClientState = {
  client?: linera.Client
  wallet?: unknown
  signer?: linera.Signer
  application?: linera.Frontend['application'] extends (id: string) => Promise<infer A> ? A : unknown
  owner?: string
  chainId?: string
  wasmReady: boolean
  debug?: boolean
}

const LS = {
  mnemonic: 'linera_mnemonic',
  chainId: 'linera_chain_id',
}

const state: ClientState = { wasmReady: false }

function isDebug(): boolean {
  if (typeof state.debug === 'boolean') return state.debug
  const env = (import.meta as unknown as { env?: Record<string, unknown> }).env
  const v = env?.['VITE_LINERA_DEBUG']
  const s = typeof v === 'string' ? v.toLowerCase() : v
  const enabled = s === '1' || s === 'true'
  state.debug = !!enabled
  return !!enabled
}

function log(...args: unknown[]) {
  if (isDebug()) console.info('[linera]', ...args)
}

function warn(...args: unknown[]) {
  if (isDebug()) console.warn('[linera]', ...args)
}

function getEnv() {
  const env = (import.meta as unknown as { env?: Record<string, unknown> }).env as { DEV?: boolean } & Record<string, unknown>
  const faucetUrl = (env?.['VITE_LINERA_FAUCET_URL'] as string | undefined) ?? 'https://faucet.testnet-conway.linera.net'
  const appId = env?.['VITE_LINERA_APPLICATION_ID'] as string | undefined
  return { faucetUrl, appId, dev: !!env?.DEV }
}

async function ensureWasm(): Promise<void> {
  if (state.wasmReady) return
  const init = (linera as unknown as { default?: (cfg?: Record<string, unknown>) => Promise<void> }).default
  if (typeof init === 'function') {
    log('init wasm')
    try {
      const env = (import.meta as unknown as { env?: Record<string, unknown> }).env as { DEV?: boolean }
      if (env?.DEV) {
        await init({ wasmUrl: '/node_modules/@linera/client/dist/linera_web_bg.wasm' })
      } else {
        await init()
      }
    } catch {
      await init()
    }
  }
  try {
    const iso = typeof window !== 'undefined' && (window as unknown as { crossOriginIsolated?: boolean }).crossOriginIsolated === true
    log('crossOriginIsolated', iso)
  } catch { void 0 }
  state.wasmReady = true
}

async function withTimeout<T>(p: Promise<T>, ms = 25000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms)),
  ]) as Promise<T>
}

async function retry<T>(op: () => Promise<T>, label: string, max = 5, delayMs = 1000): Promise<T> {
  let lastErr: unknown
  for (let i = 1; i <= max; i++) {
    try {
      const r = await op()
      if (i > 1) log('retry success', label, i)
      return r
    } catch (e) {
      lastErr = e
      warn('retry attempt', label, i, (e as Error)?.message ?? String(e))
      await new Promise(res => setTimeout(res, delayMs))
      delayMs = Math.min(Math.floor(delayMs * 1.7), 20000)
    }
  }
  throw lastErr as Error
}

async function ensureMnemonic(): Promise<string> {
  let m = localStorage.getItem(LS.mnemonic) ?? undefined
  if (!m) {
    const { ethers } = await import('ethers')
    const w = ethers.Wallet.createRandom()
    m = (w.mnemonic as unknown as { phrase: string }).phrase
    localStorage.setItem(LS.mnemonic, m)
    log('mnemonic created')
  } else {
    log('mnemonic loaded')
  }
  return m as string
}

async function ensureSigner(): Promise<{ signer: linera.Signer; owner: string }> {
  if (state.signer && state.owner) return { signer: state.signer, owner: state.owner as string }
  const mnemonic = await ensureMnemonic()
  const signer = PrivateKey.fromMnemonic(mnemonic) as unknown as linera.Signer
  const owner = (signer as unknown as { address: () => string }).address()
  state.signer = signer
  state.owner = owner
  log('signer ready', owner)
  return { signer, owner }
}

function getFaucet(url?: string) {
  return new (linera as unknown as { Faucet: new (u?: string) => unknown }).Faucet(url)
}

async function readWallet(): Promise<unknown | undefined> {
  const Reader = (linera as unknown as { InMemoryWallet: { read: () => Promise<unknown> } }).InMemoryWallet
  try {
    log('wallet read start')
    const w = await Reader.read()
    if (w) {
      log('wallet read success')
      state.wallet = w
      return w
    }
  } catch { void 0 }
  warn('wallet not found')
  return undefined
}

async function createWalletViaFaucet(faucetUrl?: string): Promise<unknown> {
  const { faucetUrl: envFaucet } = getEnv()
  const url = faucetUrl ?? envFaucet
  const faucet = getFaucet(url)
  log('create wallet via faucet', `\`${url}\``)
  const wallet = await retry(() => withTimeout((faucet as unknown as { createWallet: () => Promise<unknown> }).createWallet(), 60000), 'faucet.createWallet', 10, 2000)
  state.wallet = wallet
  log('wallet created')
  return wallet
}

async function ensureClient(): Promise<linera.Client> {
  if (state.client) return state.client
  await ensureWasm()
  const wallet = (await readWallet()) ?? (await createWalletViaFaucet())
  const { signer } = await ensureSigner()
  log('client new')
  const client = new (linera as unknown as { Client: new (w: unknown, s?: linera.Signer) => linera.Client }).Client(wallet, signer)
  state.client = client
  try { await client.identity() } catch { void 0 }
  log('client ready')
  return client
}

async function ensureChainId(faucetUrl?: string): Promise<string> {
  if (state.chainId) return state.chainId
  const saved = localStorage.getItem(LS.chainId) ?? undefined
  if (saved) { state.chainId = saved; log('chainId loaded', saved); return saved }
  const client = await ensureClient()
  const { faucetUrl: envFaucet } = getEnv()
  const faucet = getFaucet(faucetUrl ?? envFaucet)
  const chainId = await retry(() => withTimeout((faucet as unknown as { claimChain: (c: linera.Client) => Promise<string> }).claimChain(client), 60000), 'faucet.claimChain', 10, 2500)
  state.chainId = chainId
  localStorage.setItem(LS.chainId, chainId)
  log('claim chain success', chainId)
  return chainId
}

async function ensureApplication(): Promise<linera.Frontend['application'] extends (id: string) => Promise<infer A> ? A : unknown> {
  if (state.application) return state.application
  const { appId } = getEnv()
  if (!appId) throw new Error('VITE_LINERA_APPLICATION_ID is not configured')
  const client = await ensureClient()
  log('application load', appId)
  const app = await client.frontend().application(appId)
  state.application = app
  log('application ready')
  return app
}

export function hasClient(): boolean { return !!state.client }
export function getState(): { address?: string; chainId?: string } { return { address: state.owner, chainId: state.chainId } }

export async function getClient(): Promise<linera.Client> {
  const c = await ensureClient()
  await ensureApplication().catch(() => void 0)
  return c
}

export async function initWalletPersist(faucetUrl?: string): Promise<{ address: string; chainId?: string }> {
  await ensureWasm()
  const { owner } = await ensureSigner()
  await createWalletViaFaucet(faucetUrl)
  let chainId = localStorage.getItem(LS.chainId) ?? undefined
  if (!chainId) {
    try { chainId = await ensureChainId(faucetUrl) } catch { void 0 }
  }
  log('initWalletPersist', owner, chainId)
  return { address: owner, chainId }
}

export async function requestMicrochainPersist(faucetUrl?: string): Promise<{ address: string; chainId: string }> {
  const { owner } = await ensureSigner()
  await ensureClient()
  const chainId = await ensureChainId(faucetUrl)
  log('requestMicrochainPersist', owner, chainId)
  return { address: owner, chainId }
}

export async function initWallet(faucetUrl?: string) {
  const info = await initWalletPersist(faucetUrl)
  return { address: info.address, chainId: info.chainId, createdAt: new Date().toISOString() }
}

export async function requestMicrochain(faucetUrl?: string) {
  const info = await requestMicrochainPersist(faucetUrl)
  return { address: info.address, chainId: info.chainId, createdAt: new Date().toISOString() }
}

export async function refreshBalances(): Promise<{ chainBalance?: string; accountBalance?: string }> {
  const app = await ensureApplication()
  const owner = state.owner as string
  let accountBalance: string | undefined
  try {
    const payload = JSON.stringify({ query: 'query ($owner: String!) { accounts { entry(key: $owner) { value } } }', variables: { owner } })
    const resp = await withTimeout((app as unknown as { query: (s: string) => Promise<unknown> }).query(payload), 15000)
    const data = typeof resp === 'string' ? JSON.parse(resp) : (resp as Record<string, unknown>)
    const container = (data as { data?: Record<string, unknown> }).data
    const acc = container?.['accounts'] as Record<string, unknown> | undefined
    const entry = acc?.['entry'] as Record<string, unknown> | undefined
    const value = entry?.['value'] as unknown
    accountBalance = typeof value === 'string' ? value : (typeof value === 'number' ? String(value) : undefined)
  } catch (e) { warn('balance query error', (e as Error)?.message ?? String(e)) }
  log('refreshBalances done', { accountBalance })
  return { chainBalance: undefined, accountBalance }
}

export async function transferToWallet(amount: string): Promise<void> {
  const client = await ensureClient()
  const owner = state.owner as string
  const opts = { recipient: owner, amount }
  log('transfer to wallet', amount)
  await withTimeout((client as unknown as { transfer: (o: unknown) => Promise<void> }).transfer(opts), 30000)
}

export async function transferToChain(amount: string): Promise<void> {
  const client = await ensureClient()
  const owner = state.owner as string
  const chainId = state.chainId as string
  const recipient = { chainId, owner }
  const opts = { recipient, amount }
  log('transfer to chain', amount)
  await withTimeout((client as unknown as { transfer: (o: unknown) => Promise<void> }).transfer(opts), 30000)
}

export async function subscribeNotifications(handler: () => Promise<void> | void): Promise<() => void> {
  const client = await ensureClient()
  client.onNotification((n: unknown) => { try { void Promise.resolve(handler()) } catch { void 0 } })
  log('notifications attached')
  return () => { /* no-op detach in current API */ }
}

export async function claimFaucetTokens(): Promise<void> {
  // Generic helper: for specific token apps, use application.mutate with your schema.
  warn('claimFaucetTokens: not implemented for generic app; use application-specific mutation')
}