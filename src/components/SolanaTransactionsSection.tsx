'use client'
import { useEffect, useState } from 'react'

interface ParsedTx {
  signature: string
  timestamp: number
  type: string
  source: string
  description: string
  fee: number
  feePayer: string
}

interface Props {
  address: string
}

function trunc(s: string, start = 6, end = 4): string {
  if (!s || s.length <= start + end + 3) return s
  return `${s.slice(0, start)}...${s.slice(-end)}`
}

function timeAgo(unixSec: number): string {
  if (!unixSec) return ''
  const diff = Date.now() - unixSec * 1000
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const DEX_SOURCES = new Set([
  'JUPITER', 'RAYDIUM', 'ORCA', 'METEORA', 'PHOENIX', 'LIFINITY', 'OPENBOOK',
  'PUMP_FUN', 'PUMP_AMM', 'ALDRIN', 'CROPPER', 'CYKURA', 'DRADEX', 'EXCHANGE_ART',
  'FOXY', 'GOOSEFX', 'HADESWAP', 'INVARIANT', 'MERCURIAL', 'OPENBOOK_V2',
  'SABER', 'SAROS', 'SERUM', 'STEPN', 'STAR_ATLAS', 'SOLEND', 'TENSOR',
  'MAGIC_EDEN', 'HYPERSPACE', 'SOLANART', 'SOLSEA', 'YAWWW',
])

function isDex(source: string): boolean {
  return DEX_SOURCES.has(source.toUpperCase())
}

function prettySource(source: string): string {
  return source
    .toLowerCase()
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

function prettyType(type: string): string {
  if (!type) return 'Unknown'
  return type
    .toLowerCase()
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

export default function SolanaTransactionsSection({ address }: Props) {
  const [transactions, setTransactions] = useState<ParsedTx[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      setTransactions([])
      try {
        const res = await fetch(`/api/sol/transactions?address=${address}`)
        const data = await res.json()
        if (cancelled) return
        if (data.error) throw new Error(data.error)
        setTransactions(data.transactions ?? [])
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [address])

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-5">Transactions · Solana</h2>

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
          <p className="text-sm">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const dex = isDex(tx.source)
            return (
              <div
                key={tx.signature}
                className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm flex items-start gap-4"
              >
                {/* Type icon */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold bg-purple-50 text-purple-600">
                  {tx.type === 'SWAP' ? '⇄' : tx.type === 'TRANSFER' ? '→' : '•'}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a
                      href={`https://solscan.io/tx/${tx.signature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-blue-500 hover:text-blue-700 hover:underline"
                    >
                      {trunc(tx.signature)}
                    </a>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                      {prettyType(tx.type)}
                    </span>
                    {dex && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {prettySource(tx.source)}
                      </span>
                    )}
                    {!dex && tx.source !== 'SYSTEM_PROGRAM' && tx.source && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-50 text-gray-500">
                        {prettySource(tx.source)}
                      </span>
                    )}
                  </div>
                  {tx.description && (
                    <p className="text-xs text-gray-500 mt-1 truncate" title={tx.description}>
                      {tx.description}
                    </p>
                  )}
                </div>

                {/* Time + fee */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{timeAgo(tx.timestamp)}</p>
                  <p className="text-xs text-gray-300 font-mono">
                    fee {tx.fee.toFixed(6)} SOL
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
