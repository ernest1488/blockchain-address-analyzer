'use client'
import { useState } from 'react'

interface Props {
  onAnalyze: (address: string) => void
  isLoading: boolean
}

export default function AddressInput({ onAnalyze, isLoading }: Props) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const isValid = /^0x[0-9a-fA-F]{40}$/.test(value.trim())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid && !isLoading) onAnalyze(value.trim())
  }

  const active = isValid && !isLoading

  return (
    <div style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>

        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '0 14px',
          background: 'var(--surface2)',
          border: '1px solid',
          borderColor: focused ? 'var(--amber)' : 'var(--border2)',
          borderRight: 'none',
          borderRadius: '4px 0 0 4px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10, color: 'var(--text-muted)',
          letterSpacing: '0.1em', whiteSpace: 'nowrap',
          userSelect: 'none',
          transition: 'border-color 0.2s',
        }}>
          ADDR
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="0x... wallet address"
          spellCheck={false}
          style={{
            flex: 1,
            padding: '14px 16px',
            background: 'var(--surface)',
            border: '1px solid',
            borderColor: focused ? 'var(--amber)' : 'var(--border2)',
            borderRight: 'none',
            color: 'var(--text)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12, fontWeight: 400,
            outline: 'none',
            transition: 'border-color 0.2s',
            boxShadow: focused ? 'inset 0 0 30px rgba(240,165,0,0.03)' : 'none',
          }}
        />

        <button
          type="submit"
          disabled={!isValid || isLoading}
          style={{
            padding: '14px 28px',
            background: active ? 'var(--amber)' : 'var(--surface2)',
            border: '1px solid',
            borderColor: active ? 'var(--amber)' : 'var(--border2)',
            borderRadius: '0 4px 4px 0',
            color: active ? '#06080d' : 'var(--text-muted)',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700, fontSize: 11, letterSpacing: '0.12em',
            cursor: active ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            boxShadow: active ? '0 0 24px var(--amber-glow)' : 'none',
          }}
        >
          {isLoading ? 'SCANNING...' : 'ANALYZE →'}
        </button>
      </form>

      {value.length > 10 && !isValid && (
        <p style={{
          marginTop: 8, paddingLeft: 2,
          fontSize: 10, color: 'var(--danger)',
          fontFamily: 'JetBrains Mono, monospace',
          letterSpacing: '0.06em',
        }}>
          ✗ INVALID ADDRESS — expected 0x + 40 hex characters
        </p>
      )}
    </div>
  )
}
