import { NextRequest, NextResponse } from 'next/server'
import { NETWORKS } from '@/lib/networks'
import { getNativeBalance, getTokenBalances, getTokenMetadata, formatUnits } from '@/lib/alchemy'
import { getMultiplePrices } from '@/lib/prices'

function isValidAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address)
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')

  if (!address || !isValidAddress(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  if (!process.env.ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY === 'your_alchemy_api_key_here') {
    return NextResponse.json({ error: 'Alchemy API key not configured' }, { status: 500 })
  }

  const coingeckoIds = [...new Set(NETWORKS.map((n) => n.coingeckoId))]
  const prices = await getMultiplePrices(coingeckoIds)

  const networkResults = await Promise.all(
    NETWORKS.map(async (network) => {
      try {
        const [nativeWei, rawTokens] = await Promise.all([
          getNativeBalance(network.id, address),
          getTokenBalances(network.id, address),
        ])

        const nativeBalance = formatUnits(nativeWei, 18)
        const price = prices[network.coingeckoId] ?? 0
        const nativeUsd = nativeBalance * price

        const topTokens = rawTokens.slice(0, 10)
        const tokens = (
          await Promise.all(
            topTokens.map(async (t) => {
              try {
                const meta = await getTokenMetadata(network.id, t.contractAddress)
                const decimals = meta.decimals ?? 18
                const balance = formatUnits(BigInt(t.tokenBalance || '0'), decimals)
                if (balance < 0.000001) return null
                return {
                  contractAddress: t.contractAddress,
                  symbol: meta.symbol || '???',
                  name: meta.name || 'Unknown Token',
                  balance,
                  logo: meta.logo ?? null,
                }
              } catch {
                return null
              }
            })
          )
        ).filter(Boolean)

        return {
          id: network.id,
          name: network.name,
          symbol: network.symbol,
          color: network.color,
          nativeBalance,
          nativeBalanceUsd: nativeUsd,
          price,
          tokens,
          totalUsd: nativeUsd,
        }
      } catch {
        return {
          id: network.id,
          name: network.name,
          symbol: network.symbol,
          color: network.color,
          nativeBalance: 0,
          nativeBalanceUsd: 0,
          price: 0,
          tokens: [],
          totalUsd: 0,
          error: true,
        }
      }
    })
  )

  const totalPortfolioUsd = networkResults.reduce((sum, n) => sum + n.totalUsd, 0)

  return NextResponse.json({ address, networks: networkResults, totalPortfolioUsd })
}
