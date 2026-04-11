'use client'

interface Token {
  contractAddress: string
  symbol: string
  name: string
  balance: number
  logo: string | null
}

interface NetworkData {
  id: string
  name: string
  symbol: string
  color: string
  nativeBalance: number
  nativeBalanceUsd: number
  price: number
  tokens: Token[]
  totalUsd: number
  error?: boolean
}

interface PortfolioData {
  address: string
  networks: NetworkData[]
  totalPortfolioUsd: number
  error?: string
}

interface Props {
  data: PortfolioData
}

function fmt(n: number, d = 4): string {
  if (n === 0) return '0'
  if (n < 0.0001) return '<0.0001'
  return n.toLocaleString('en-US', { maximumFractionDigits: d })
}

function fmtUsd(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

function NetworkCircle({ color, name }: { color: string; name: string }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function PortfolioSection({ data }: Props) {
  if (!data?.networks) {
    return (
      <div className="text-center py-16 text-red-400 text-sm">
        {data?.error ?? 'Failed to load portfolio data'}
      </div>
    )
  }
  const active = data.networks.filter((n) => n.nativeBalance > 0 || n.tokens.length > 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Portfolio</h2>
        <div className="text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Total Value</p>
          <p className="text-2xl font-bold text-blue-600">{fmtUsd(data.totalPortfolioUsd)}</p>
        </div>
      </div>

      {active.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p>No balances found across supported networks</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.networks.map((network) => {
            const hasBalance = network.nativeBalance > 0 || network.tokens.length > 0
            return (
              <div
                key={network.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-opacity ${
                  hasBalance ? 'border-gray-100 opacity-100' : 'border-gray-50 opacity-40'
                }`}
              >
                {/* Network header */}
                <div className="flex items-center gap-3 mb-4">
                  <NetworkCircle color={network.color} name={network.name} />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{network.name}</p>
                    {network.error && (
                      <p className="text-xs text-red-400">Failed to load</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">{fmtUsd(network.totalUsd)}</p>
                  </div>
                </div>

                {/* Native token row */}
                <div className="flex items-center justify-between text-sm py-2 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: network.color }}
                    >
                      {network.symbol.slice(0, 1)}
                    </div>
                    <span className="text-gray-700 font-medium">{network.symbol}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{fmt(network.nativeBalance, 6)}</p>
                    {network.price > 0 && network.nativeBalance > 0 && (
                      <p className="text-xs text-gray-400">{fmtUsd(network.nativeBalanceUsd)}</p>
                    )}
                  </div>
                </div>

                {/* ERC20 tokens */}
                {network.tokens.slice(0, 5).map((token) => (
                  <div
                    key={token.contractAddress}
                    className="flex items-center justify-between text-sm py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      {token.logo ? (
                        <img
                          src={token.logo}
                          alt={token.symbol}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold">
                          {token.symbol.slice(0, 1)}
                        </div>
                      )}
                      <span className="text-gray-600">{token.symbol}</span>
                    </div>
                    <p className="font-medium text-gray-800">{fmt(token.balance, 4)}</p>
                  </div>
                ))}

                {network.tokens.length > 5 && (
                  <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-50 mt-2">
                    +{network.tokens.length - 5} more tokens
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
