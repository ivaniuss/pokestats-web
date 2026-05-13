const REMOTE = "https://pokemon-auto-chess.com"

function useRemote() {
  return typeof window !== "undefined" && window.location.hostname !== "localhost"
}

export function pkmImgSrc(index: string, emotion = "Normal") {
  const parts = index.split("-")
  if (useRemote()) {
    return `${REMOTE}/assets/portraits/${parts.join("/")}/${emotion}.png`
  }
  return `/assets/portraits/${parts.join("/")}/${emotion}.png`
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
  const src = useRemote() ? `${REMOTE}/assets/item/${name}.png` : `/assets/items/${name}.png`
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="object-contain inline-block"
      loading="lazy"
      onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
    />
  )
}
