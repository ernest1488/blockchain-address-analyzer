import { NextRequest, NextResponse } from 'next/server'
import { NETWORK_BY_ID } from '@/lib/networks'
import { getAssetTransfers } from '@/lib/alchemy'

function isValidAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address)
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')
  const networkId = req.nextUrl.searchParams.get('network') || 'eth-mainnet'

  if (!address || !isValidAddress(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  const network = NETWORK_BY_ID[networkId]
  if (!network) {
    return NextResponse.json({ error: 'Invalid network' }, { status: 400 })
  }

  if (!process.env.ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY === 'your_alchemy_api_key_here') {
    return NextResponse.json({ error: 'Alchemy API key not configured' }, { status: 500 })
  }

  try {
    const transfers = await getAssetTransfers(network.id, address)
    const transactions = transfers.map((t) => ({
      hash: t.hash,
      from: t.from,
      to: t.to,
      value: t.value,
      asset: t.asset || network.symbol,
      blockNum: t.blockNum,
      timestamp: t.metadata?.blockTimestamp ?? null,
      direction: t.direction,
      category: t.category,
    }))
    return NextResponse.json({ transactions, networkName: network.name })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch transactions'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
