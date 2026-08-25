export const revalidate = 3600

import { fetchRegions } from "@/lib/api"
import RegionsTable from "./table"

export default async function RegionsPage() {
  const data = await fetchRegions()
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Regions</h1>
      <RegionsTable data={data} />
    </div>
  )
}
