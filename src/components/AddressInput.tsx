'use client'
import { useState } from 'react'

interface Props {
  onAnalyze: (address: string) => void
  isLoading: boolean
}

export default function AddressInput({ onAnalyze, isLoading }: Props) {
  const [value, setValue] = useState('')
  const isValid = /^0x[0-9a-fA-F]{40}$/.test(value.trim())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid && !isLoading) onAnalyze(value.trim())
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0x... wallet address"
          spellCheck={false}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl disabled:opacity-40 hover:bg-blue-700 active:bg-blue-800 transition-colors whitespace-nowrap"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      {value.length > 10 && !isValid && (
        <p className="mt-2 text-xs text-red-500 ml-1">
          Enter a valid EVM address (0x followed by 40 hex characters)
        </p>
      )}
    </div>
  )
}
