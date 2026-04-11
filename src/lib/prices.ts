export async function getMultiplePrices(ids: string[]): Promise<Record<string, number>> {
  const unique = [...new Set(ids)]
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${unique.join(',')}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) return Object.fromEntries(unique.map((id) => [id, 0]))
    const data = await res.json()
    return Object.fromEntries(unique.map((id) => [id, data[id]?.usd ?? 0]))
  } catch {
    return Object.fromEntries(unique.map((id) => [id, 0]))
  }
}
