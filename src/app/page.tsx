'use client'
import { useState } from 'react'
import AddressInput from '@/components/AddressInput'
import PortfolioSection from '@/components/PortfolioSection'
import TransactionsSection from '@/components/TransactionsSection'
import SecuritySection from '@/components/SecuritySection'

type Tab = 'portfolio' | 'transactions' | 'security'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'portfolio',    label: 'Portfolio',    icon: '◈' },
  { id: 'transactions', label: 'Transactions', icon: '⟳' },
  { id: 'security',     label: 'Security',     icon: '⬡' },
]

const NETWORKS = ['Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base']

export default function Home() {
  const [address, setAddress]             = useState<string | null>(null)
  const [activeTab, setActiveTab]         = useState<Tab>('portfolio')
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [securityData, setSecurityData]   = useState<any>(null)
  const [loading, setLoading]             = useState(false)

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
      // errors shown per-section
    } finally {
      setLoading(false)
    }
  }

  const isHighRisk = securityData?.riskLevel === 'high'

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Ambient glow */}
      <div className="ambient-pulse" style={{
        position: 'fixed', top: -240, left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 500, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse, rgba(240,165,0,0.05) 0%, transparent 65%)',
      }} />

      {/* ── Header ── */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(6,8,13,0.88)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 54,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 26, height: 26, border: '1.5px solid var(--amber)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: 'rotate(45deg)',
              boxShadow: '0 0 14px var(--amber-glow)',
            }}>
              <span style={{ transform: 'rotate(-45deg)', fontSize: 11, color: 'var(--amber)', fontWeight: 700, lineHeight: 1 }}>⬡</span>
            </div>
            <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: '0.1em' }}>
              CHAIN<span style={{ color: 'var(--amber)' }}>LENS</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {NETWORKS.map((n) => (
              <span key={n} style={{
                fontSize: 9, fontFamily: 'JetBrains Mono, monospace', fontWeight: 500,
                color: 'var(--text-muted)', padding: '2px 7px',
                border: '1px solid var(--border)', borderRadius: 2,
                letterSpacing: '0.06em',
              }}>
                {n.slice(0, 3).toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{
        borderBottom: '1px solid var(--border)',
        padding: '80px 24px 70px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(240,165,0,0.025) 0%, transparent 50%)',
        }} />

        <div style={{ maxWidth: 660, margin: '0 auto', textAlign: 'center', position: 'relative' }}>

          <div className="animate-fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            border: '1px solid var(--border2)', borderRadius: 3,
            padding: '4px 14px', marginBottom: 32,
            fontSize: 10, letterSpacing: '0.14em',
            color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace',
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 8px var(--success)',
              display: 'inline-block',
            }} />
            EVM MULTI-CHAIN SCANNER
          </div>

          <h1 className="animate-fade-up-1" style={{
            fontWeight: 800, fontSize: 'clamp(2rem, 5vw, 3.4rem)',
            lineHeight: 1.06, letterSpacing: '-0.02em',
            marginBottom: 18,
          }}>
            Blockchain Address<br />
            <span style={{
              color: 'var(--amber)',
              textShadow: '0 0 50px rgba(240,165,0,0.25)',
            }}>Analyzer</span>
          </h1>

          <p className="animate-fade-up-2" style={{
            color: 'var(--text-muted)', fontSize: 13,
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: 44, letterSpacing: '0.03em',
          }}>
            portfolio · transactions · security — across all major EVM networks
          </p>

          <div className="animate-fade-up-3">
            <AddressInput onAnalyze={handleAnalyze} isLoading={loading} />
          </div>
        </div>
      </section>

      {/* ── Results ── */}
      {address && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', flex: 1 }}>

          <div className="animate-fade-up" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            marginBottom: 28, flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: 10, color: 'var(--text-dim)',
              fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em',
            }}>SCANNING</span>
            <code style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
              color: 'var(--amber)',
              background: 'rgba(240,165,0,0.07)',
              border: '1px solid rgba(240,165,0,0.18)',
              padding: '5px 14px', borderRadius: 3,
              wordBreak: 'break-all',
            }}>{address}</code>
            {isHighRisk && (
              <span style={{
                fontSize: 10, letterSpacing: '0.1em',
                fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                color: 'var(--danger)',
                background: 'rgba(255,71,87,0.08)',
                border: '1px solid rgba(255,71,87,0.25)',
                padding: '4px 12px', borderRadius: 3,
              }}>⚠ HIGH RISK</span>
            )}
          </div>

          {/* Tabs */}
          <div className="animate-fade-up-1" style={{
            display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 0,
          }}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '11px 22px',
                  fontWeight: active ? 700 : 500, fontSize: 11,
                  letterSpacing: '0.1em',
                  color: active ? 'var(--amber)' : 'var(--text-muted)',
                  background: 'transparent', border: 'none',
                  borderBottom: active ? '2px solid var(--amber)' : '2px solid transparent',
                  marginBottom: -1, cursor: 'pointer',
                  transition: 'color 0.2s',
                }}>
                  <span style={{ fontSize: 13 }}>{tab.icon}</span>
                  {tab.label.toUpperCase()}
                  {tab.id === 'security' && isHighRisk && (
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: 'var(--danger)',
                      boxShadow: '0 0 6px var(--danger)',
                    }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Panel */}
          <div className="animate-fade-up-2" style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)', borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            padding: 28, minHeight: 420,
          }}>
            {loading ? (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                height: 320, gap: 20,
              }}>
                <div style={{ position: 'relative', width: 48, height: 48 }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    border: '1.5px solid var(--border2)',
                    borderTop: '1.5px solid var(--amber)',
                    borderRadius: '50%',
                    boxShadow: '0 0 14px var(--amber-glow)',
                    animation: 'spinLoader 0.8s linear infinite',
                  }} />
                  <div style={{
                    position: 'absolute', inset: 10,
                    border: '1px solid var(--border)',
                    borderBottom: '1px solid var(--amber-dim)',
                    borderRadius: '50%',
                    animation: 'spinLoader 1.3s linear infinite reverse',
                  }} />
                </div>
                <p style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                  color: 'var(--text-muted)', letterSpacing: '0.12em',
                }}>
                  FETCHING DATA ACROSS ALL NETWORKS
                  <span className="cursor-blink">_</span>
                </p>
              </div>
            ) : (
              <>
                {activeTab === 'portfolio' && portfolioData && <PortfolioSection data={portfolioData} />}
                {activeTab === 'portfolio' && !portfolioData && !loading && (
                  <div style={{ textAlign: 'center', padding: '80px 0',
                    color: 'var(--danger)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.1em' }}>
                    FAILED TO LOAD PORTFOLIO DATA
                  </div>
                )}
                {activeTab === 'transactions' && <TransactionsSection address={address} />}
                {activeTab === 'security' && securityData && <SecuritySection data={securityData} />}
                {activeTab === 'security' && !securityData && !loading && (
                  <div style={{ textAlign: 'center', padding: '80px 0',
                    color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.1em' }}>
                    FAILED TO LOAD SECURITY DATA
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer style={{
        marginTop: 'auto', borderTop: '1px solid var(--border)',
        padding: '18px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: 'var(--text-dim)', letterSpacing: '0.1em',
        }}>CHAINLENS · EVM ANALYTICS · {new Date().getFullYear()}</span>
      </footer>
    </div>
  )
}
