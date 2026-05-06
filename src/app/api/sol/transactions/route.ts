import { NextRequest, NextResponse } from 'next/server'
import { getEnrichedTransactions } from '@/lib/solana'

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
    const transactions = await getEnrichedTransactions(address, 30)
    return NextResponse.json({ transactions })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to load transactions'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
