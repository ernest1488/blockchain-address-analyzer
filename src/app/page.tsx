'use client'
import { useState } from 'react'
import AddressInput from '@/components/AddressInput'
import PortfolioSection from '@/components/PortfolioSection'
import TransactionsSection from '@/components/TransactionsSection'
import SecuritySection from '@/components/SecuritySection'

type Tab = 'portfolio' | 'transactions' | 'security'

const TABS: { id: Tab; label: string }[] = [
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'security', label: 'Security' },
]

const SUPPORTED_NETWORKS = ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base']

export default function Home() {
  const [address, setAddress] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('portfolio')
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [securityData, setSecurityData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async (addr: string) => {
    setLoading(true)
    setAddress(addr)
    setActiveTab('portfolio')
    setPortfolioData(null)
    setSecurityData(null)

    try {
      const [portfolio, security] = await Promise.all([
        fetch(`/api/portfolio?address=${addr}`).then((r) => r.json()),
        fetch(`/api/security?address=${addr}`).then((r) => r.json()),
      ])
      setPortfolioData(portfolio)
      setSecurityData(security)
    } catch {
      // errors are shown per-section
    } finally {
      setLoading(false)
    }
  }

  const isHighRisk = securityData?.riskLevel === 'high'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">
            Chain<span className="text-blue-600">Lens</span>
          </span>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 py-14 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Blockchain Address Analyzer
          </h1>
          <p className="text-gray-400 mb-10 text-sm sm:text-base">
            Portfolio · Transactions · Security — across all major EVM networks
          </p>
          <AddressInput onAnalyze={handleAnalyze} isLoading={loading} />

          {/* Supported networks chips */}
          <div className="flex items-center justify-center gap-2 mt-6 flex-wrap">
            {SUPPORTED_NETWORKS.map((n) => (
              <span
                key={n}
                className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100"
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {address && (
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Address bar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <p className="text-sm text-gray-400">Analyzing:</p>
            <code className="text-sm font-mono text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg break-all">
              {address}
            </code>
            {isHighRisk && (
              <span className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-full font-semibold">
                ⚠ High Risk Address
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.id === 'security' && isHighRisk && (
                  <span className="ml-2 inline-block w-1.5 h-1.5 bg-red-500 rounded-full align-middle" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-sm">Fetching data across all networks...</p>
              </div>
            ) : (
              <>
                {activeTab === 'portfolio' && portfolioData && (
                  <PortfolioSection data={portfolioData} />
                )}
                {activeTab === 'portfolio' && !portfolioData && !loading && (
                  <div className="text-center py-16 text-red-400 text-sm">
                    Failed to load portfolio data
                  </div>
                )}
                {activeTab === 'transactions' && (
                  <TransactionsSection address={address} />
                )}
                {activeTab === 'security' && securityData && (
                  <SecuritySection data={securityData} />
                )}
                {activeTab === 'security' && !securityData && !loading && (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    Failed to load security data
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
