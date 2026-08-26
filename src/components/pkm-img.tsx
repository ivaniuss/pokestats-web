"use client"

import { getPkmIndex } from "@/lib/pkm-index"

function pkmImgSrc(index: string, emotion = "Normal") {
  const parts = index.split("-")
  return `/assets/portraits/${parts.join("/")}/${emotion}.png`
}

export function PkmImg({ name, index, size = 40 }: { name: string; index?: string; size?: number }) {
  const resolved = index ?? getPkmIndex(name)
  return (
    <img
      src={pkmImgSrc(resolved)}
      alt={name}
      width={size}
      height={size}
      className="object-contain inline-block"
      loading="lazy"
      onError={(e) => {
        const img = e.target as HTMLImageElement
        if (!img.dataset.retry) {
          img.dataset.retry = "1"
          img.src = pkmImgSrc("0000")
        }
      }}
    />
  )
}

export function ItemImg({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <img
      src={`/assets/item/${name}.png`}
      alt={name}
      width={size}
      height={size}
      className="object-contain inline-block"
      loading="lazy"
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
    />
  )
}
