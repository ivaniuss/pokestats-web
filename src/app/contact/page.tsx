"use client"

import { useState } from "react"

const FORMSPREE_URL = process.env.NEXT_PUBLIC_FORMSPREE || "https://formspree.io/f/YOUR_FORM_ID"

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      })
      if (res.ok) setSent(true)
      else setError("Failed to send")
    } catch {
      setError("Network error")
    }
  }

  if (sent) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-green-400">Sent!</p>
        <p className="text-slate-400 mt-2">Thanks for the feedback.</p>
        <button onClick={() => setSent(false)} className="mt-4 text-sm text-yellow-400 underline">Send another</button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Contact / Feedback</h1>
      <p className="text-sm text-slate-400 mb-6">Bug reports, suggestions, or just say hi.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" name="email" placeholder="Your email (optional)"
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400" />
        <textarea name="message" required placeholder="Message"
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 h-32" />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors">
          Send
        </button>
      </form>
    </div>
  )
}
