export default function Loading() {
  return (
    <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 bg-slate-800 rounded" />
      <div className="h-10 w-full bg-slate-800 rounded-lg" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-9 w-full bg-slate-800/60 rounded" />
      ))}
    </div>
  )
}
