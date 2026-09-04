import { notFound, redirect } from 'next/navigation'
import { getCareerJobBySlug } from '@/lib/services/career.service'

export default async function ApplyCareerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const job = await getCareerJobBySlug(slug)
  if (!job) notFound()
  if (!job.applicationUrl) redirect(`/karir/${job.slug}`)
  redirect(job.applicationUrl)
}
