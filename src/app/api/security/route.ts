import { NextRequest, NextResponse } from 'next/server'
import { checkAddressSecurity, calculateRiskScore, SecurityResult } from '@/lib/goplus'

function isValidAddress(address: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(address)
}

function mergeResults(a: SecurityResult, b: SecurityResult): SecurityResult {
  return {
    cybercrime: a.cybercrime || b.cybercrime,
    money_laundering: a.money_laundering || b.money_laundering,
    phishing: a.phishing || b.phishing,
    darkweb: a.darkweb || b.darkweb,
    stealing: a.stealing || b.stealing,
    blacklisted: a.blacklisted || b.blacklisted,
    fake_kyc: a.fake_kyc || b.fake_kyc,
    financial_crime: a.financial_crime || b.financial_crime,
    mixer: a.mixer || b.mixer,
    sanctioned: a.sanctioned || b.sanctioned,
    malicious_contracts: Math.max(a.malicious_contracts, b.malicious_contracts),
    data_source: [...new Set([...a.data_source, ...b.data_source])],
  }
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')

  if (!address || !isValidAddress(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
  }

  // Check on ETH (1) and BSC (56) — widest coverage
  const [ethResult, bscResult] = await Promise.all([
    checkAddressSecurity(address, 1),
    checkAddressSecurity(address, 56),
  ])

  const result =
    ethResult && bscResult
      ? mergeResults(ethResult, bscResult)
      : ethResult ?? bscResult

  if (!result) {
    return NextResponse.json({
      address,
      riskScore: 0,
      riskLevel: 'unknown',
      details: null,
      error: 'Security data unavailable',
    })
  }

  const riskScore = calculateRiskScore(result)
  const riskLevel = riskScore >= 60 ? 'high' : riskScore >= 20 ? 'medium' : 'low'

  return NextResponse.json({ address, riskScore, riskLevel, details: result })
}
