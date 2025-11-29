import { NextResponse } from 'next/server'

function resolveValidatorBase(input?: string): string {
  const o = input || process.env.NEXT_PUBLIC_LINERA_VALIDATOR_URL || ''
  let host = ''
  try { host = new URL(o).host } catch {}
  // Public faucet only
  if (!host) return 'https://faucet.testnet-conway.linera.net'
  if (host.includes('faucet.testnet-conway.linera.net')) return 'https://faucet.testnet-conway.linera.net'
  return o
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const chainId = String(body?.chainId || '')
    if (!chainId) return NextResponse.json({ error: 'Missing chainId' }, { status: 400 })
    const base = resolveValidatorBase()
    const endpoint = `${base}/chains/${chainId}`
    const query = `query { chain(chainId: "${chainId}") { executionState { system { balance } } } }`
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    })
    const text = await res.text()
    let json: any
    try { json = JSON.parse(text) } catch { json = { text } }
    const balance = json?.data?.chain?.executionState?.system?.balance
    return NextResponse.json({ ok: res.ok, status: res.status, balance, data: json?.data ?? json })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
