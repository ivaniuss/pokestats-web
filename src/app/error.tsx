"use client"

import { useEffect } from "react"

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="py-16 text-center">
      <h2 className="text-xl font-bold text-yellow-400">Something went wrong</h2>
      <p className="text-slate-400 mt-2 text-sm">Failed to load data. The upstream API may be temporarily down.</p>
      <button
        onClick={() => unstable_retry()}
        className="mt-4 bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
