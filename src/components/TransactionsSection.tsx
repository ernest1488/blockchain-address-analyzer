'use client'
import { useState, useEffect } from 'react'
import { NETWORKS } from '@/lib/networks'

interface Transaction {
  hash: string
  from: string
  to: string | null
  value: number | null
  asset: string
  timestamp: string | null
  direction: 'in' | 'out'
  category: string
}

interface Props {
  address: string
}

function trunc(s: string, start = 6, end = 4): string {
  if (!s || s.length <= start + end + 3) return s
  return `${s.slice(0, start)}...${s.slice(-end)}`
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function ExplorerLink({ hash, networkId }: { hash: string; networkId: string }) {
  const explorers: Record<string, string> = {
    'eth-mainnet': 'https://etherscan.io/tx/',
    'polygon-mainnet': 'https://polygonscan.com/tx/',
    'arb-mainnet': 'https://arbiscan.io/tx/',
    'opt-mainnet': 'https://optimistic.etherscan.io/tx/',
    'base-mainnet': 'https://basescan.org/tx/',
  }
  const base = explorers[networkId]
  if (!base) return <span className="font-mono text-xs text-gray-400">{trunc(hash)}</span>
  return (
    <a
      href={`${base}${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs text-blue-500 hover:text-blue-700 hover:underline"
    >
      {trunc(hash)}
    </a>
  )
}

export default function TransactionsSection({ address }: Props) {
  const [selectedNetwork, setSelectedNetwork] = useState('eth-mainnet')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetch_ = async () => {
      setLoading(true)
      setError(null)
      setTransactions([])
      try {
        const res = await fetch(
          `/api/transactions?address=${address}&network=${selectedNetwork}`
        )
        const data = await res.json()
        if (cancelled) return
        if (data.error) throw new Error(data.error)
        setTransactions(data.transactions)
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetch_()
    return () => { cancelled = true }
  }, [address, selectedNetwork])

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-5">Transactions</h2>

      {/* Network tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {NETWORKS.map((network) => (
          <button
            key={network.id}
            onClick={() => setSelectedNetwork(network.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedNetwork === network.id
                ? 'text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            style={
              selectedNetwork === network.id
                ? { backgroundColor: network.color }
                : undefined
            }
          >
            {network.name}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">
          <p className="text-2xl mb-2">⚠</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm">No transactions found on this network</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx, i) => (
            <div
              key={`${tx.hash}-${i}`}
              className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm flex items-center gap-4"
            >
              {/* Direction badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                  tx.direction === 'in'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-red-100 text-red-500'
                }`}
              >
                {tx.direction === 'in' ? '↓' : '↑'}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <ExplorerLink hash={tx.hash} networkId={selectedNetwork} />
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tx.direction === 'in'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-red-50 text-red-500'
                    }`}
                  >
                    {tx.direction === 'in' ? 'Received' : 'Sent'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  {tx.direction === 'in' ? 'From' : 'To'}:{' '}
                  <span className="font-mono">
                    {trunc(tx.direction === 'in' ? tx.from : (tx.to ?? '—'))}
                  </span>
                </p>
              </div>

              {/* Value + time */}
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-gray-900 text-sm">
                  {tx.value !== null ? `${Number(tx.value).toFixed(4)} ${tx.asset}` : tx.asset}
                </p>
                {tx.timestamp && (
                  <p className="text-xs text-gray-400">{timeAgo(tx.timestamp)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
