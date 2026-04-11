export interface SecurityResult {
  cybercrime: boolean
  money_laundering: boolean
  phishing: boolean
  darkweb: boolean
  stealing: boolean
  blacklisted: boolean
  fake_kyc: boolean
  financial_crime: boolean
  mixer: boolean
  sanctioned: boolean
  malicious_contracts: number
  data_source: string[]
}

export async function checkAddressSecurity(
  address: string,
  chainId: number
): Promise<SecurityResult | null> {
  try {
    const res = await fetch(
      `https://api.gopluslabs.io/api/v1/address_security/${address}?chain_id=${chainId}`,
      { next: { revalidate: 300 } }
    )
    const json = await res.json()
    if (json.code !== 1 || !json.result) return null
    const d = json.result

    return {
      cybercrime: d.cybercrime === '1',
      money_laundering: d.money_laundering === '1',
      phishing: d.phishing_activities === '1',
      darkweb: d.darkweb_transactions === '1',
      stealing: d.stealing_attack === '1',
      blacklisted: d.blacklist_doubt === '1',
      fake_kyc: d.fake_kyc === '1',
      financial_crime: d.financial_crime === '1',
      mixer: d.mixer === '1',
      sanctioned: d.sanctioned === '1',
      malicious_contracts: parseInt(d.number_of_malicious_contracts_created || '0'),
      data_source: Array.isArray(d.data_source) ? d.data_source : [],
    }
  } catch {
    return null
  }
}

export function calculateRiskScore(s: SecurityResult): number {
  let score = 0
  if (s.sanctioned) score += 40
  if (s.cybercrime) score += 30
  if (s.financial_crime) score += 25
  if (s.money_laundering) score += 25
  if (s.phishing) score += 25
  if (s.fake_kyc) score += 20
  if (s.darkweb) score += 20
  if (s.stealing) score += 20
  if (s.blacklisted) score += 15
  if (s.mixer) score += 10
  if (s.malicious_contracts > 0) score += Math.min(s.malicious_contracts * 10, 30)
  return Math.min(score, 100)
}
