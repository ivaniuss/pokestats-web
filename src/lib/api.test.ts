import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/pkm-index", () => ({ pkmIndex: {} }))

const fetchMock = vi.fn()

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

beforeEach(() => {
  vi.resetModules()
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
})

describe("fetchPokemonStats", () => {
  it("flattens tiers into a stat per pokemon", async () => {
    fetchMock.mockResolvedValue(jsonResponse([
      {
        tier: "MASTER_BALL",
        pokemons: {
          PIKACHU: { rank: 3.2, count: 1500, items: ["LIGHT_BALL"], item_count: 2 },
        },
      },
      {
        tier: "ULTRA_BALL",
        pokemons: {
          EEVEE: { rank: 4.0, count: 800 },
        },
      },
    ]))
    const { fetchPokemonStats } = await import("@/lib/api")
    const stats = await fetchPokemonStats()
    expect(stats).toEqual([
      { pokemon: "PIKACHU", tier: "MASTER_BALL", avg_rank: 3.2, count: 1500, items: ["LIGHT_BALL"], item_count: 2 },
      { pokemon: "EEVEE", tier: "ULTRA_BALL", avg_rank: 4.0, count: 800, items: [], item_count: 0 },
    ])
  })

  it("defaults missing numeric fields to zero", async () => {
    fetchMock.mockResolvedValue(jsonResponse([
      { tier: "LEVEL_BALL", pokemons: { MISSINGNO: {} } },
    ]))
    const { fetchPokemonStats } = await import("@/lib/api")
    const stats = await fetchPokemonStats()
    expect(stats[0]).toMatchObject({ avg_rank: 0, count: 0, items: [], item_count: 0 })
  })
})

describe("fetchPokemonItemRecs", () => {
  it("inverts the item→pokemon mapping and sorts by rank then count desc", async () => {
    fetchMock.mockResolvedValue(jsonResponse([
      {
        tier: "T1",
        items: {
          ORAN_BERRY: { rank: 3.0, count: 500, pokemons: ["A", "B"] },
          SITRUS_BERRY: { rank: 2.0, count: 100, pokemons: ["A"] },
        },
      },
    ]))
    const { fetchPokemonItemRecs } = await import("@/lib/api")
    const recs = await fetchPokemonItemRecs()
    expect(recs.A.map((e) => e.item)).toEqual(["SITRUS_BERRY", "ORAN_BERRY"])
    expect(recs.B).toEqual([{ item: "ORAN_BERRY", tier: "T1", avg_rank: 3.0, count: 500 }])
  })
})

describe("upstream error handling", () => {
  it("throws on non-OK responses", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "boom" }, 503))
    const { fetchPokemonStats } = await import("@/lib/api")
    await expect(fetchPokemonStats()).rejects.toThrow("/meta/pokemons returned 503")
  })

  it("caches responses within the TTL window", async () => {
    fetchMock.mockResolvedValue(jsonResponse([
      { tier: "T1", pokemons: { A: { rank: 1, count: 1 } } },
    ]))
    const { fetchPokemonStats } = await import("@/lib/api")
    await fetchPokemonStats()
    await fetchPokemonStats()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
