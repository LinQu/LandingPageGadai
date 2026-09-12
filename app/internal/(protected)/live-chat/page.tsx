import { LiveChatManager } from '@/components/internal/live-chat-manager'
import { getCurrentAdmin } from '@/lib/internal/auth'

export const dynamic = 'force-dynamic'

export default async function InternalLiveChatPage() {
  const admin = await getCurrentAdmin()
  if (!admin) return null

  return <LiveChatManager currentAdmin={{ id: admin.id, name: admin.name }} />
}
