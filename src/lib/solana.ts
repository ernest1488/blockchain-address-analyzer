const HELIUS_KEY = process.env.HELIUS_API_KEY
const RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`
const PARSED_BASE = 'https://api.helius.xyz/v0'
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'

export const SOL_MINT = 'So11111111111111111111111111111111111111112'

interface RpcResponse<T> {
  result?: T
  error?: { message: string }
}

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    cache: 'no-store',
  })
  const json = (await res.json()) as RpcResponse<T>
  if (json.error) throw new Error(json.error.message)
  if (json.result === undefined) throw new Error('Empty RPC result')
  return json.result
}

export async function getSolBalance(address: string): Promise<number> {
  const result = await rpc<{ value: number }>('getBalance', [address])
  return result.value / 1e9
}

export interface SplTokenRaw {
  mint: string
  amount: number
  decimals: number
}

interface ParsedTokenAccount {
  account: {
    data: {
      parsed: {
        info: {
          mint: string
          tokenAmount: { uiAmount: number | null; decimals: number }
        }
      }
    }
  }
}

export async function getSplTokens(address: string): Promise<SplTokenRaw[]> {
  const result = await rpc<{ value: ParsedTokenAccount[] }>('getTokenAccountsByOwner', [
    address,
    { programId: TOKEN_PROGRAM_ID },
    { encoding: 'jsonParsed' },
  ])
  return result.value
    .map((acc) => {
      const info = acc.account.data.parsed.info
      return {
        mint: info.mint,
        amount: Number(info.tokenAmount.uiAmount ?? 0),
        decimals: info.tokenAmount.decimals,
      }
    })
    .filter((t) => t.amount > 0)
}

export interface JupToken {
  address: string
  symbol: string
  name: string
  logoURI?: string | null
  decimals: number
}

let tokenListCache: { map: Map<string, JupToken>; ts: number } | null = null
const TOKEN_LIST_TTL_MS = 60 * 60 * 1000

export async function getTokenList(): Promise<Map<string, JupToken>> {
  if (tokenListCache && Date.now() - tokenListCache.ts < TOKEN_LIST_TTL_MS) {
    return tokenListCache.map
  }
  try {
    const res = await fetch('https://token.jup.ag/strict', { cache: 'no-store' })
    if (!res.ok) throw new Error(`Jupiter token list ${res.status}`)
    const list = (await res.json()) as JupToken[]
    const map = new Map(list.map((t) => [t.address, t]))
    tokenListCache = { map, ts: Date.now() }
    return map
  } catch {
    return tokenListCache?.map ?? new Map()
  }
}

export async function getPrices(mints: string[]): Promise<Record<string, number>> {
  const unique = [...new Set(mints)]
  if (unique.length === 0) return {}
  const out: Record<string, number> = {}
  const chunks: string[][] = []
  for (let i = 0; i < unique.length; i += 100) chunks.push(unique.slice(i, i + 100))

  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const res = await fetch(
          `https://api.jup.ag/price/v3?ids=${chunk.join(',')}`,
          { cache: 'no-store' }
        )
        if (!res.ok) {
          for (const id of chunk) out[id] = 0
          return
        }
        const json = (await res.json()) as Record<string, { usdPrice?: number } | null>
        for (const id of chunk) {
          const price = json[id]?.usdPrice
          out[id] = typeof price === 'number' ? price : 0
        }
      } catch {
        for (const id of chunk) out[id] = 0
      }
    })
  )
  return out
}

export interface ParsedTx {
  signature: string
  timestamp: number
  type: string
  source: string
  description: string
  fee: number
  feePayer: string
}

interface HeliusParsedTx {
  signature: string
  timestamp: number
  type?: string
  source?: string
  description?: string
  fee?: number
  feePayer?: string
}

export async function getEnrichedTransactions(
  address: string,
  limit = 30
): Promise<ParsedTx[]> {
  const url = `${PARSED_BASE}/addresses/${address}/transactions/?api-key=${HELIUS_KEY}&limit=${limit}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Helius ${res.status}: ${body.slice(0, 120)}`)
  }
  const txs = (await res.json()) as HeliusParsedTx[]
  return txs.map((t) => ({
    signature: t.signature,
    timestamp: t.timestamp,
    type: t.type ?? 'UNKNOWN',
    source: t.source ?? 'SYSTEM_PROGRAM',
    description: t.description ?? '',
    fee: (t.fee ?? 0) / 1e9,
    feePayer: t.feePayer ?? '',
  }))
}
