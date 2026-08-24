import { PsychotestCandidate } from '@/components/career/psychotest-candidate'

export const dynamic = 'force-dynamic'
export default async function PsychotestPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  return <PsychotestCandidate token={token} />
}
