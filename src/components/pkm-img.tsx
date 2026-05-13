const BASE = "/api/assets?path="

function assetUrl(path: string) {
  return BASE + encodeURIComponent(path)
}

export function pkmImgSrc(index: string, emotion = "Normal") {
  const parts = index.split("-")
  return assetUrl(`/assets/portraits/${parts.join("/")}/${emotion}.png`)
}

export function PkmImg({ name, index, size = 40 }: { name: string; index?: string; size?: number }) {
  if (!index) return null
  return (
    <img
      src={pkmImgSrc(index)}
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
      src={assetUrl(`/assets/item/${name}.png`)}
      alt={name}
      width={size}
      height={size}
      className="object-contain inline-block"
      loading="lazy"
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
    />
  )
}
