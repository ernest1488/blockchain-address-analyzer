export type NetworkKind = 'evm' | 'svm'

export interface Network {
  id: string
  name: string
  symbol: string
  kind: NetworkKind
  chainId?: number
  color: string
  coingeckoId: string
}

export const NETWORKS: Network[] = [
  {
    id: 'eth-mainnet',
    name: 'Ethereum',
    symbol: 'ETH',
    kind: 'evm',
    chainId: 1,
    color: '#627EEA',
    coingeckoId: 'ethereum',
  },
  {
    id: 'polygon-mainnet',
    name: 'Polygon',
    symbol: 'POL',
    kind: 'evm',
    chainId: 137,
    color: '#8247E5',
    coingeckoId: 'matic-network',
  },
  {
    id: 'arb-mainnet',
    name: 'Arbitrum',
    symbol: 'ETH',
    kind: 'evm',
    chainId: 42161,
    color: '#28A0F0',
    coingeckoId: 'ethereum',
  },
  {
    id: 'opt-mainnet',
    name: 'Optimism',
    symbol: 'ETH',
    kind: 'evm',
    chainId: 10,
    color: '#FF0420',
    coingeckoId: 'ethereum',
  },
  {
    id: 'base-mainnet',
    name: 'Base',
    symbol: 'ETH',
    kind: 'evm',
    chainId: 8453,
    color: '#0052FF',
    coingeckoId: 'ethereum',
  },
]

export const NETWORK_BY_ID: Record<string, Network> = Object.fromEntries(
  NETWORKS.map((n) => [n.id, n])
)

export const SOLANA_NETWORK: Network = {
  id: 'solana-mainnet',
  name: 'Solana',
  symbol: 'SOL',
  kind: 'svm',
  color: '#14F195',
  coingeckoId: 'solana',
}
