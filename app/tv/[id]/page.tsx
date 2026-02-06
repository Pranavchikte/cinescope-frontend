import { TVDetailPage } from "@/components/tv-detail-page"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function TVDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <TVDetailPage tvId={id} />
}