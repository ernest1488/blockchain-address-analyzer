import { NextRequest, NextResponse } from 'next/server'
import {
  SOL_MINT,
  getPrices,
  getSolBalance,
  getSplTokens,
  getTokenList,
} from '@/lib/solana'

const SVM_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')
  if (!address || !SVM_RE.test(address)) {
    return NextResponse.json({ error: 'Invalid Solana address' }, { status: 400 })
  }
  if (!process.env.HELIUS_API_KEY) {
    return NextResponse.json(
      { error: 'HELIUS_API_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    const [solBalance, splRaw, tokenList] = await Promise.all([
      getSolBalance(address),
      getSplTokens(address),
      getTokenList(),
    ])

    const mintsForPricing = [SOL_MINT, ...splRaw.map((t) => t.mint)]
    const prices = await getPrices(mintsForPricing)

    const solPrice = prices[SOL_MINT] ?? 0
    const solBalanceUsd = solBalance * solPrice

    const tokens = splRaw
      .map((t) => {
        const meta = tokenList.get(t.mint)
        const price = prices[t.mint] ?? 0
        const valueUsd = t.amount * price
        return {
          mint: t.mint,
          symbol: meta?.symbol ?? `${t.mint.slice(0, 4)}…`,
          name: meta?.name ?? 'Unknown Token',
          balance: t.amount,
          logo: meta?.logoURI ?? null,
          price,
          valueUsd,
        }
      })
      .sort((a, b) => b.valueUsd - a.valueUsd)

    const tokensTotalUsd = tokens.reduce((s, t) => s + t.valueUsd, 0)
    const totalUsd = solBalanceUsd + tokensTotalUsd

    return NextResponse.json({
      address,
      solBalance,
      solPrice,
      solBalanceUsd,
      tokens,
      totalUsd,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to load portfolio'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
