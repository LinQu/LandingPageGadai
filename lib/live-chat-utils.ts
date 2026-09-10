export type LiveChatQuickReplyLike = {
  id: number
  title: string
  category: string
  message: string
  keywords: string
  priority: number
  auto_send?: number | boolean
  active?: number | boolean
}

export function normalizeKeywordText(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function splitKeywords(value: unknown) {
  return String(value || '')
    .split(/[\n,;|]+/)
    .map((item) => normalizeKeywordText(item))
    .filter(Boolean)
}

export function quickReplyKeywordScore(message: unknown, keywords: unknown) {
  const haystack = ` ${normalizeKeywordText(message)} `
  if (haystack.trim().length === 0) return 0

  let score = 0
  for (const keyword of splitKeywords(keywords)) {
    const needle = ` ${keyword} `
    if (haystack.includes(needle)) {
      score += keyword.includes(' ') ? 5 : 3
      continue
    }

    if (keyword.length >= 4 && haystack.includes(keyword)) score += 1
  }
  return score
}

export function sortSuggestedQuickReplies<T extends LiveChatQuickReplyLike>(message: unknown, replies: T[]) {
  return replies
    .map((reply) => ({ reply, score: quickReplyKeywordScore(message, reply.keywords) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return Number(b.reply.priority || 0) - Number(a.reply.priority || 0)
    })
    .map((item) => item.reply)
}

export function normalizeCustomerPhone(value: unknown) {
  let digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`
  return digits.slice(0, 18)
}

export function isValidCustomerPhone(value: unknown) {
  const digits = normalizeCustomerPhone(value)
  return /^\d{9,18}$/.test(digits)
}
