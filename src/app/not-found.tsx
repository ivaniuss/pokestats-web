import Link from "next/link"

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h2 className="text-3xl font-bold text-yellow-400">404</h2>
      <p className="text-slate-400 mt-2">This page doesn&apos;t exist.</p>
      <Link
        href="/"
        className="inline-block mt-4 bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
      >
        Back home
      </Link>
    </div>
  )
}
