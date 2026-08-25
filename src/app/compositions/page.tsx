export const revalidate = 3600

import { fetchCompositions } from "@/lib/api"
import CompositionsExplorer from "./explorer"

export default async function CompositionsPage() {
  const data = await fetchCompositions()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Team Compositions</h1>
      <CompositionsExplorer data={data} />
    </div>
  )
}
