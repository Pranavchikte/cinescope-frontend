import { MovieDetailPage } from "@/components/movie-detail-page"

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MovieDetailPage movieId={id} />
}
