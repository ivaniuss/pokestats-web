#!/usr/bin/env node
const fs = require("fs")
const path = require("path")

const PAC = path.resolve(__dirname, "../../pokemonAutoChess")
const DEST = path.resolve(__dirname, "../public/assets")

const PKM_SRC = path.join(PAC, "app/public/src/assets/pokemons")
const ITEM_SRC = path.join(PAC, "app/public/src/assets/item{tps}")
const PORTRAIT_SRC = path.join(PAC, "app/public/src/assets/portraits")
const PKM_TS = path.join(PAC, "app/types/enum/Pokemon.ts")

const PKM_DEST = path.join(DEST, "pokemons")
const ITEM_DEST = path.join(DEST, "items")
const PORTRAIT_DEST = path.join(DEST, "portraits")

function copyFiles(src, dest, ext = ".png") {
  fs.mkdirSync(dest, { recursive: true })
  const files = fs.readdirSync(src).filter((f) => f.endsWith(ext))
  let copied = 0
  for (const f of files) {
    const srcPath = path.join(src, f)
    const dstPath = path.join(dest, f)
    if (!fs.existsSync(dstPath) || fs.statSync(srcPath).mtimeMs > fs.statSync(dstPath).mtimeMs) {
      fs.copyFileSync(srcPath, dstPath)
      copied++
    }
  }
  console.log(`Copied ${copied}/${files.length} ${ext} files to ${dest}`)
  return files.length
}

function copyPortraits(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  let total = 0
  let copied = 0
  const dirs = fs.readdirSync(src, { withFileTypes: true }).filter((d) => d.isDirectory())
  for (const dir of dirs) {
    const fromDir = path.join(src, dir.name)
    const toDir = path.join(dest, dir.name)
    fs.mkdirSync(toDir, { recursive: true })
    const items = fs.readdirSync(fromDir)
    for (const item of items) {
      if (!item.endsWith(".png")) continue
      total++
      const srcFile = path.join(fromDir, item)
      const dstFile = path.join(toDir, item)
      if (!fs.existsSync(dstFile) || fs.statSync(srcFile).mtimeMs > fs.statSync(dstFile).mtimeMs) {
        fs.copyFileSync(srcFile, dstFile)
        copied++
      }
    }
    // recurse into subdirs (for regional variants)
    const subdirs = items.filter((i) => {
      try { return fs.statSync(path.join(fromDir, i)).isDirectory() } catch { return false }
    })
    for (const sub of subdirs) {
      const subFrom = path.join(fromDir, sub)
      const subTo = path.join(toDir, sub)
      fs.mkdirSync(subTo, { recursive: true })
      const subItems = fs.readdirSync(subFrom).filter((f) => f.endsWith(".png"))
      for (const item of subItems) {
        total++
        const srcFile = path.join(subFrom, item)
        const dstFile = path.join(subTo, item)
        if (!fs.existsSync(dstFile) || fs.statSync(srcFile).mtimeMs > fs.statSync(dstFile).mtimeMs) {
          fs.copyFileSync(srcFile, dstFile)
          copied++
        }
      }
    }
  }
  console.log(`Copied ${copied}/${total} portrait files to ${dest}`)
}

function extractPkmIndex() {
  const content = fs.readFileSync(PKM_TS, "utf-8")
  const map = {}
  const regex = /\[Pkm\.(\w+)\]\s*:\s*"([\d-]+)"/g
  let match
  while ((match = regex.exec(content)) !== null) {
    map[match[1]] = match[2]
  }
  const outPath = path.join(DEST, "pkm-index.json")
  fs.writeFileSync(outPath, JSON.stringify(map, null, 2))
  console.log(`Extracted ${Object.keys(map).length} entries -> ${outPath}`)
  return map
}

if (!fs.existsSync(PKM_SRC)) {
  console.log("pokemonAutoChess not found at", PAC, "- skipping asset sync")
  console.log("Extracting pkm-index.json from existing data if available...")
  const idxPath = path.join(DEST, "pkm-index.json")
  if (!fs.existsSync(idxPath)) {
    extractPkmIndex()
  } else {
    console.log("pkm-index.json already exists, skipping")
  }
  process.exit(0)
}

console.log("=== Syncing Pokemon Auto Chess assets ===\n")

const pkmCount = copyFiles(PKM_SRC, PKM_DEST)
const itemCount = copyFiles(ITEM_SRC, ITEM_DEST)
copyPortraits(PORTRAIT_SRC, PORTRAIT_DEST)
extractPkmIndex()

console.log(`\nDone! ${pkmCount} pokemon + ${itemCount} item images + portraits synced.`)
