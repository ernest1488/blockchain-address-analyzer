'use client'

interface Token {
  mint: string
  symbol: string
  name: string
  balance: number
  logo: string | null
  price: number
  valueUsd: number
}

export interface SolanaPortfolioData {
  address: string
  solBalance: number
  solPrice: number
  solBalanceUsd: number
  tokens: Token[]
  totalUsd: number
  error?: string
}

interface Props {
  data: SolanaPortfolioData
}

function fmt(n: number, d = 4): string {
  if (n === 0) return '0'
  if (n < 0.0001) return '<0.0001'
  return n.toLocaleString('en-US', { maximumFractionDigits: d })
}

function fmtUsd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

export default function SolanaPortfolioSection({ data }: Props) {
  if (!data || data.error) {
    return (
      <div className="text-center py-16 text-red-400 text-sm">
        {data?.error ?? 'Failed to load portfolio data'}
      </div>
    )
  }

  const hasAnything = data.solBalance > 0 || data.tokens.length > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Portfolio · Solana</h2>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Total Value</p>
          <p className="text-2xl font-bold text-blue-600">{fmtUsd(data.totalUsd)}</p>
        </div>
      </div>

      {!hasAnything ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No SOL or SPL token balances found</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          {/* SOL row */}
          <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
                style={{ background: 'linear-gradient(135deg, #14F195 0%, #9945FF 100%)' }}
              >
                S
              </div>
              <div>
                <p className="text-gray-700 font-medium">SOL</p>
                <p className="text-xs text-gray-400">Solana</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{fmt(data.solBalance, 6)}</p>
              {data.solPrice > 0 && (
                <p className="text-xs text-gray-400">{fmtUsd(data.solBalanceUsd)}</p>
              )}
            </div>
          </div>

          {/* SPL tokens */}
          {data.tokens.map((t) => (
            <div
              key={t.mint}
              className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-b-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                {t.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.logo}
                    alt={t.symbol}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold flex-shrink-0">
                    {t.symbol.slice(0, 1)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-gray-700 font-medium truncate">{t.symbol}</p>
                  <p className="text-xs text-gray-400 truncate">{t.name}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-gray-900">{fmt(t.balance, 4)}</p>
                {t.price > 0 ? (
                  <p className="text-xs text-gray-400">{fmtUsd(t.valueUsd)}</p>
                ) : (
                  <p className="text-xs text-gray-300">no price</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
