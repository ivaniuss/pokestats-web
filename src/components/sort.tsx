import { useState, useMemo } from "react"

export type SortDir = "asc" | "desc"

export function useSort<T extends Record<string, any>>(
  items: T[],
  defaultKey: keyof T,
  defaultDir: SortDir = "asc",
  secondary?: { key: keyof T; dir: SortDir }
) {
  const [key, setKey] = useState(defaultKey)
  const [dir, setDir] = useState<SortDir>(defaultDir)

  const sorted = useMemo(() => {
    const copy = [...items]
    copy.sort((a, b) => {
      const va = a[key]
      const vb = b[key]
      let cmp = 0
      if (typeof va === "string" && typeof vb === "string") cmp = va.localeCompare(vb)
      else if (typeof va === "number" && typeof vb === "number") cmp = va - vb
      cmp = dir === "asc" ? cmp : -cmp

      if (cmp === 0 && secondary) {
        const sa = a[secondary.key]
        const sb = b[secondary.key]
        if (typeof sa === "number" && typeof sb === "number") {
          cmp = secondary.dir === "asc" ? sa - sb : sb - sa
        }
      }
      return cmp
    })
    return copy
  }, [items, key, dir, secondary])

  function toggle(k: keyof T) {
    if (k === key) setDir(dir === "asc" ? "desc" : "asc")
    else { setKey(k); setDir(defaultDir) }
  }

  return { sorted, key, dir, toggle }
}

export function SortTh<T>({
  sortKey,
  children,
  className,
  currentKey,
  currentDir,
  onToggle,
}: {
  sortKey: keyof T
  children: React.ReactNode
  className?: string
  currentKey: keyof T
  currentDir: SortDir
  onToggle: (k: keyof T) => void
}) {
  const active = currentKey === sortKey
  return (
    <th
      className={`cursor-pointer select-none ${active ? "text-yellow-400" : "text-slate-500"} hover:text-white transition-colors ${className ?? ""}`}
      onClick={() => onToggle(sortKey)}
    >
      {children} {active ? (currentDir === "asc" ? "▲" : "▼") : ""}
    </th>
  )
}
