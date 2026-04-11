'use client'

interface SecurityDetails {
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

interface SecurityData {
  address: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'unknown'
  details: SecurityDetails | null
  error?: string
}

interface Props {
  data: SecurityData
}

const FLAGS: { key: keyof SecurityDetails; label: string; desc: string }[] = [
  { key: 'sanctioned', label: 'Sanctioned', desc: 'Under government or international sanctions' },
  { key: 'cybercrime', label: 'Cybercrime', desc: 'Associated with cybercrime activities' },
  { key: 'financial_crime', label: 'Financial Crime', desc: 'Involved in financial crime' },
  { key: 'money_laundering', label: 'Money Laundering', desc: 'Money laundering activity detected' },
  { key: 'phishing', label: 'Phishing', desc: 'Known phishing/scam address' },
  { key: 'fake_kyc', label: 'Fake KYC', desc: 'Fake identity or KYC fraud' },
  { key: 'darkweb', label: 'Dark Web', desc: 'Dark web transactions detected' },
  { key: 'stealing', label: 'Theft Attack', desc: 'Associated with theft attacks' },
  { key: 'blacklisted', label: 'Blacklisted', desc: 'Present on known blacklists' },
  { key: 'mixer', label: 'Mixer Usage', desc: 'Uses cryptocurrency mixing services' },
]

const RISK_CONFIG = {
  low: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    text: 'text-green-600',
    stroke: '#22c55e',
    label: 'Low Risk',
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-100',
    text: 'text-yellow-600',
    stroke: '#eab308',
    label: 'Medium Risk',
  },
  high: {
    bg: 'bg-red-50',
    border: 'border-red-100',
    text: 'text-red-600',
    stroke: '#ef4444',
    label: 'High Risk',
  },
  unknown: {
    bg: 'bg-gray-50',
    border: 'border-gray-100',
    text: 'text-gray-500',
    stroke: '#9ca3af',
    label: 'Unknown',
  },
}

const CIRCUMFERENCE = 2 * Math.PI * 40

export default function SecuritySection({ data }: Props) {
  const cfg = RISK_CONFIG[data.riskLevel]
  const { details } = data

  const activeFlags = details
    ? FLAGS.filter((f) => {
        const val = details[f.key]
        return typeof val === 'boolean' ? val : false
      })
    : []

  const hasMalicious = details && details.malicious_contracts > 0

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Analysis</h2>

      {data.error && !details ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-3xl mb-2">⚠</p>
          <p className="text-sm">{data.error}</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Score circle */}
          <div
            className={`${cfg.bg} border ${cfg.border} rounded-2xl p-6 flex flex-col items-center justify-center min-w-[200px]`}
          >
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke={cfg.stroke}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - data.riskScore / 100)}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${cfg.text}`}>{data.riskScore}</span>
                <span className="text-xs text-gray-400">/100</span>
              </div>
            </div>
            <p className={`mt-3 font-semibold ${cfg.text}`}>{cfg.label}</p>
            <p className="text-xs text-gray-400 mt-1 text-center">
              Based on on-chain history
            </p>
          </div>

          {/* Flags panel */}
          <div className="flex-1">
            {activeFlags.length === 0 && !hasMalicious ? (
              <div className="h-full flex items-center justify-center min-h-[160px]">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                    ✓
                  </div>
                  <p className="font-semibold text-green-700">No threats detected</p>
                  <p className="text-sm text-gray-400 mt-1">Address appears clean</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {hasMalicious && details && (
                  <div className="flex items-start gap-3 bg-orange-50 border border-orange-100 rounded-xl p-3">
                    <span className="text-orange-500 mt-0.5 text-lg">⚠</span>
                    <div>
                      <p className="font-semibold text-orange-700 text-sm">Malicious Contracts</p>
                      <p className="text-xs text-orange-500 mt-0.5">
                        Created {details.malicious_contracts} malicious contract(s)
                      </p>
                    </div>
                  </div>
                )}
                {activeFlags.map((flag) => (
                  <div
                    key={flag.key as string}
                    className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-3"
                  >
                    <span className="text-red-500 mt-0.5 text-lg">⚠</span>
                    <div>
                      <p className="font-semibold text-red-700 text-sm">{flag.label}</p>
                      <p className="text-xs text-red-400 mt-0.5">{flag.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {details?.data_source && details.data_source.length > 0 && (
              <p className="text-xs text-gray-300 mt-4">
                Sources: {details.data_source.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
