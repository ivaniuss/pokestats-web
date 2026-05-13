import Link from "next/link"

export default function Home() {
  const cards = [
    { href: "/pokemon", title: "Pokémon", desc: "Items and stats for any Pokémon, sorted by performance" },
    { href: "/top-pokemon", title: "Top Pokémon", desc: "Highest performing Pokémon by average rank" },
    { href: "/top-items", title: "Top Items", desc: "Highest performing items by average rank" },
    { href: "/compositions", title: "Compositions", desc: "Winning team compositions from the meta" },
  ]
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">PokéStats</h1>
      <p className="text-slate-400 mb-8">
        Live meta data from{" "}
        <a href="https://pokemon-auto-chess.com" className="text-yellow-400 underline">Pokémon Auto Chess</a>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href}
            className="block border border-slate-700 rounded-xl p-5 hover:border-yellow-500/50 hover:bg-slate-800/50 transition-all">
            <h2 className="text-lg font-semibold text-yellow-400">{c.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
