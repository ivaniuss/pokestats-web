import { mkdir, writeFile, access } from "node:fs/promises"
import path from "node:path"

const GAME_RAW_BASE =
  "https://raw.githubusercontent.com/keldaanCommunity/pokemonAutoChess/master/app/models/precomputed"
const SITE_BASE = "https://pokemon-auto-chess.com"

const ROOT = path.resolve(new URL("..", import.meta.url).pathname)
const PUBLIC_ASSETS = path.join(ROOT, "public", "assets")
const PORTRAITS_DIR = path.join(PUBLIC_ASSETS, "portraits")
const ITEM_DIR = path.join(PUBLIC_ASSETS, "item")

const SPECIAL_ENTRIES = {
  DEFAULT: "0000",
  EGG: "0000-0004",
  SUBSTITUTE: "0000-0001",
}

const CONCURRENCY = 8
const force = process.argv.includes("--force")

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

function csvRows(text) {
  const [headerLine, ...lines] = text.trim().split("\n")
  const headers = headerLine.split(",")
  return lines.map((line) => {
    const cells = line.split(",")
    return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]))
  })
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { Referer: `${SITE_BASE}/`, "User-Agent": "pokestats-web-sync" },
  })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

async function pool(items, worker) {
  let i = 0
  const runners = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (i < items.length) {
      const item = items[i++]
      await worker(item)
    }
  })
  await Promise.all(runners)
}

async function downloadTo(url, dest) {
  if (!force && (await exists(dest))) return "skipped"
  try {
    const buf = await fetchBuffer(url)
    await mkdir(path.dirname(dest), { recursive: true })
    await writeFile(dest, buf)
    return "downloaded"
  } catch (err) {
    console.warn(`  ! failed: ${err.message}`)
    return "failed"
  }
}

async function main() {
  console.log("Fetching pokemons-data.csv from keldaanCommunity/pokemonAutoChess…")
  const csvRes = await fetch(`${GAME_RAW_BASE}/pokemons-data.csv`)
  if (!csvRes.ok) throw new Error(`CSV fetch failed: ${csvRes.status}`)
  const rows = csvRows(await csvRes.text())

  const indexMap = { ...SPECIAL_ENTRIES }
  for (const row of rows) {
    if (row.Index && row.Name) indexMap[row.Name] = row.Index
  }

  const indexPath = path.join(PUBLIC_ASSETS, "pkm-index.json")
  await mkdir(PUBLIC_ASSETS, { recursive: true })
  await writeFile(indexPath, JSON.stringify(indexMap, null, 2) + "\n")
  console.log(`Wrote ${Object.keys(indexMap).length} entries to public/assets/pkm-index.json`)

  const portraitTargets = []
  for (const idx of new Set(Object.values(indexMap))) {
    const parts = idx.split("-")
    portraitTargets.push({
      url: `${SITE_BASE}/assets/portraits/${parts.join("/")}/Normal.png`,
      dest: path.join(PORTRAITS_DIR, ...parts, "Normal.png"),
    })
  }
  console.log(`Syncing ${portraitTargets.length} portraits…`)
  let done = 0
  await pool(portraitTargets, async (t) => {
    const r = await downloadTo(t.url, t.dest)
    if (++done % 100 === 0) console.log(`  portraits ${done}/${portraitTargets.length}`)
    if (r === "failed") console.error(`  portrait failed: ${t.url}`)
  })

  console.log("Fetching item names from upstream meta API…")
  const itemsRes = await fetch(`${SITE_BASE}/meta/items`, {
    headers: { "User-Agent": "pokestats-web-sync" },
  })
  if (!itemsRes.ok) throw new Error(`/meta/items fetch failed: ${itemsRes.status}`)
  const tiers = await itemsRes.json()
  const itemNames = new Set()
  for (const tierData of tiers) {
    for (const name of Object.keys(tierData.items ?? {})) itemNames.add(name)
  }

  console.log(`Syncing ${itemNames.size} item sprites…`)
  await pool([...itemNames], async (name) => {
    const r = await downloadTo(
      `${SITE_BASE}/assets/item/${name}.png`,
      path.join(ITEM_DIR, `${name}.png`),
    )
    if (r === "failed") console.error(`  item failed: ${name}`)
  })

  console.log("Done.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
