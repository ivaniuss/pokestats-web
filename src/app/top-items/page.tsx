export const revalidate = 3600

import { fetchItemStats } from "@/lib/api"
import TopItemsTable from "./table"

export default async function TopItemsPage() {
  const stats = await fetchItemStats()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Top Items</h1>
      <TopItemsTable stats={stats} />
    </div>
  )
}
