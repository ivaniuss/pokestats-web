"use client"

import { useForm, ValidationError } from "@formspree/react"

export default function ContactPage() {
  const [state, handleSubmit] = useForm("mnjwrknl")

  if (state.succeeded) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-green-400">Sent!</p>
        <p className="text-slate-400 mt-2">Thanks for the feedback.</p>
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
        <ValidationError field="email" errors={state.errors} />

        <textarea name="message" required placeholder="Message"
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 h-32" />
        <ValidationError field="message" errors={state.errors} />

        <button type="submit" disabled={state.submitting}
          className="bg-yellow-500 text-black font-semibold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50">
          {state.submitting ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  )
}
