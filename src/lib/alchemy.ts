const API_KEY = process.env.ALCHEMY_API_KEY

function getUrl(network: string): string {
  return `https://${network}.g.alchemy.com/v2/${API_KEY}`
}

async function rpc(network: string, method: string, params: unknown[]) {
  const res = await fetch(getUrl(network), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    cache: 'no-store',
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.result
}

export function formatUnits(value: bigint, decimals: number): number {
  if (decimals > 18) decimals = 18
  const d = BigInt(10 ** decimals)
  const whole = Number(value / d)
  const frac = Number(value % d) / Number(d)
  return whole + frac
}

export async function getNativeBalance(network: string, address: string): Promise<bigint> {
  const hex = await rpc(network, 'eth_getBalance', [address, 'latest'])
  return BigInt(hex)
}

export interface TokenBalance {
  contractAddress: string
  tokenBalance: string
}

export async function getTokenBalances(
  network: string,
  address: string
): Promise<TokenBalance[]> {
  const result = await rpc(network, 'alchemy_getTokenBalances', [address, 'erc20'])
  return (result.tokenBalances as TokenBalance[]).filter(
    (t) =>
      t.tokenBalance &&
      t.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
  )
}

export interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
  logo: string | null
}

export async function getTokenMetadata(
  network: string,
  contractAddress: string
): Promise<TokenMetadata> {
  return await rpc(network, 'alchemy_getTokenMetadata', [contractAddress])
}

export interface Transfer {
  hash: string
  from: string
  to: string
  value: number | null
  asset: string | null
  blockNum: string
  category: string
  direction: 'in' | 'out'
  metadata: { blockTimestamp: string | null } | null
}

export async function getAssetTransfers(
  network: string,
  address: string
): Promise<Transfer[]> {
  const categories = ['external', 'erc20', 'erc721', 'erc1155', 'specialnft']

  const [incoming, outgoing] = await Promise.all([
    rpc(network, 'alchemy_getAssetTransfers', [
      {
        toAddress: address,
        category: categories,
        maxCount: '0x19',
        withMetadata: true,
        order: 'desc',
      },
    ]),
    rpc(network, 'alchemy_getAssetTransfers', [
      {
        fromAddress: address,
        category: categories,
        maxCount: '0x19',
        withMetadata: true,
        order: 'desc',
      },
    ]),
  ])

  const all: Transfer[] = [
    ...incoming.transfers.map((t: Transfer) => ({ ...t, direction: 'in' as const })),
    ...outgoing.transfers.map((t: Transfer) => ({ ...t, direction: 'out' as const })),
  ]

  all.sort((a, b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16))
  return all.slice(0, 30)
}
