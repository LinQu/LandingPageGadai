'use client'

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  CircleDot,
  Clock3,
  Edit3,
  LayoutDashboard,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Trash2,
  UserRoundCheck,
  X,
} from 'lucide-react'
import { sortSuggestedQuickReplies } from '@/lib/live-chat-utils'

type Conversation = {
  id: number
  customer_name: string
  customer_phone: string
  status: 'open' | 'assigned' | 'closed'
  assigned_admin_id: number | null
  assigned_admin_name: string | null
  last_message_at: string
  created_at: string
  closed_at: string | null
  source_page: string | null
  last_message?: string | null
  last_sender_type?: 'customer' | 'admin' | 'bot' | null
  unread_count?: number
}

type Message = {
  id: number
  sender_type: 'customer' | 'admin' | 'bot'
  sender_admin_name?: string | null
  message: string
  quick_reply_id?: number | null
  is_auto_reply: number
  created_at: string
}

type QuickReply = {
  id: number
  title: string
  category: string
  message: string
  keywords: string
  priority: number
  auto_send: number
  active: number
  created_at?: string
  updated_at?: string
}

type QuickReplyForm = {
  title: string
  category: string
  message: string
  keywords: string
  priority: number
  autoSend: boolean
  active: boolean
}

const emptyQuickReply = (): QuickReplyForm => ({
  title: '',
  category: 'Umum',
  message: '',
  keywords: '',
  priority: 10,
  autoSend: false,
  active: true,
})

const statusLabel: Record<Conversation['status'], string> = {
  open: 'Menunggu',
  assigned: 'Ditangani',
  closed: 'Selesai',
}

function formatTime(value: string | null | undefined) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function statusClass(status: Conversation['status']) {
  if (status === 'open') return 'bg-amber-50 text-amber-700 border-amber-200'
  if (status === 'assigned') return 'bg-sky-50 text-sky-700 border-sky-200'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
}

async function readApiPayload(response: Response) {
  const text = await response.text()
  if (!text) return {}

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    if (response.status === 404) {
      throw new Error('Endpoint balasan Live Chat tidak ditemukan (404). Pastikan route API messages sudah ada lalu restart/rebuild Next.js.')
    }
    throw new Error(`API mengembalikan respons non-JSON (${response.status}).`)
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`Respons API tidak valid (${response.status}).`)
  }
}

export function LiveChatManager() {
  const [tab, setTab] = useState<'inbox' | 'quick-replies'>('inbox')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([])
  const [statusFilter, setStatusFilter] = useState<'active' | 'open' | 'assigned' | 'closed' | 'all'>('active')
  const [query, setQuery] = useState('')
  const [replyText, setReplyText] = useState('')
  const [selectedQuickReplyId, setSelectedQuickReplyId] = useState<number | null>(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [presence, setPresence] = useState<'online' | 'busy' | 'offline'>('online')
  const [showQuickReplyForm, setShowQuickReplyForm] = useState(false)
  const [editingQuickReplyId, setEditingQuickReplyId] = useState<number | null>(null)
  const [quickReplyForm, setQuickReplyForm] = useState<QuickReplyForm>(emptyQuickReply())
  const messageEndRef = useRef<HTMLDivElement | null>(null)

  const showNotice = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setNotice({ text, type })
    window.setTimeout(() => setNotice(null), 3500)
  }, [])

  const loadQuickReplies = useCallback(async () => {
    try {
      const response = await fetch('/api/internal/live-chat/quick-replies', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal memuat balas cepat.')
      setQuickReplies(payload.data || [])
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Gagal memuat balas cepat.', 'error')
    }
  }, [showNotice])

  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setLoadingList(true)
    try {
      const params = new URLSearchParams({ status: statusFilter })
      if (query.trim()) params.set('q', query.trim())
      const response = await fetch(`/api/internal/live-chat/conversations?${params.toString()}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal memuat live chat.')
      const rows: Conversation[] = payload.data || []
      setConversations(rows)
      if (selectedId && !rows.some((row) => row.id === selectedId) && statusFilter !== 'all') {
        setSelectedId(null)
        setSelectedConversation(null)
        setMessages([])
      }
    } catch (error) {
      if (!silent) showNotice(error instanceof Error ? error.message : 'Gagal memuat live chat.', 'error')
    } finally {
      if (!silent) setLoadingList(false)
    }
  }, [query, selectedId, showNotice, statusFilter])

  const loadConversation = useCallback(async (id: number, silent = false) => {
    if (!silent) setLoadingDetail(true)
    try {
      const response = await fetch(`/api/internal/live-chat/conversations/${id}`, { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal memuat percakapan.')
      setSelectedConversation(payload.conversation)
      setMessages(payload.messages || [])
      setConversations((current) => current.map((row) => row.id === id ? { ...row, unread_count: 0, ...payload.conversation } : row))
    } catch (error) {
      if (!silent) showNotice(error instanceof Error ? error.message : 'Gagal memuat percakapan.', 'error')
    } finally {
      if (!silent) setLoadingDetail(false)
    }
  }, [showNotice])

  useEffect(() => {
    void loadConversations()
  }, [loadConversations])

  useEffect(() => {
    void loadQuickReplies()
  }, [loadQuickReplies])

  useEffect(() => {
    const listTimer = window.setInterval(() => void loadConversations(true), 3000)
    return () => window.clearInterval(listTimer)
  }, [loadConversations])

  useEffect(() => {
    if (!selectedId) return
    void loadConversation(selectedId)
    const detailTimer = window.setInterval(() => void loadConversation(selectedId, true), 2200)
    return () => window.clearInterval(detailTimer)
  }, [loadConversation, selectedId])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages.length, selectedId])

  useEffect(() => {
    const ping = async () => {
      try {
        await fetch('/api/internal/live-chat/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: presence }),
        })
      } catch {
        return
      }
    }
    void ping()
    const timer = window.setInterval(() => void ping(), 30000)
    return () => window.clearInterval(timer)
  }, [presence])

  const lastCustomerMessage = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].sender_type === 'customer') return messages[index].message
    }
    return ''
  }, [messages])

  const suggestedReplies = useMemo(() => {
    const activeReplies = quickReplies.filter((reply) => Boolean(reply.active))
    return sortSuggestedQuickReplies(lastCustomerMessage, activeReplies).slice(0, 5)
  }, [lastCustomerMessage, quickReplies])

  async function conversationAction(action: 'assign' | 'close' | 'reopen') {
    if (!selectedId) return
    try {
      const response = await fetch(`/api/internal/live-chat/conversations/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal memperbarui percakapan.')
      setSelectedConversation(payload.conversation)
      showNotice(action === 'close' ? 'Percakapan ditandai selesai.' : 'Percakapan siap ditangani.')
      await loadConversations(true)
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Gagal memperbarui percakapan.', 'error')
    }
  }

  async function sendReply(event: FormEvent) {
    event.preventDefault()
    if (!selectedId || !replyText.trim()) return
    setSending(true)
    try {
      const response = await fetch(`/api/internal/live-chat/conversations/${selectedId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyText, quickReplyId: selectedQuickReplyId }),
      })
      const payload = await readApiPayload(response)
      if (!response.ok) throw new Error(payload.error || `Balasan gagal dikirim (${response.status}).`)
      setMessages((current) => [...current, payload.message])
      setReplyText('')
      setSelectedQuickReplyId(null)
      await loadConversations(true)
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Balasan gagal dikirim.', 'error')
    } finally {
      setSending(false)
    }
  }

  function useQuickReply(reply: QuickReply) {
    setReplyText(reply.message)
    setSelectedQuickReplyId(reply.id)
  }

  function openQuickReplyForm(reply?: QuickReply) {
    if (reply) {
      setEditingQuickReplyId(reply.id)
      setQuickReplyForm({
        title: reply.title,
        category: reply.category,
        message: reply.message,
        keywords: reply.keywords,
        priority: Number(reply.priority || 0),
        autoSend: Boolean(reply.auto_send),
        active: Boolean(reply.active),
      })
    } else {
      setEditingQuickReplyId(null)
      setQuickReplyForm(emptyQuickReply())
    }
    setShowQuickReplyForm(true)
  }

  async function saveQuickReply(event: FormEvent) {
    event.preventDefault()
    const endpoint = editingQuickReplyId
      ? `/api/internal/live-chat/quick-replies/${editingQuickReplyId}`
      : '/api/internal/live-chat/quick-replies'
    try {
      const response = await fetch(endpoint, {
        method: editingQuickReplyId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quickReplyForm),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal menyimpan balas cepat.')
      setShowQuickReplyForm(false)
      setEditingQuickReplyId(null)
      setQuickReplyForm(emptyQuickReply())
      showNotice('Balas cepat berhasil disimpan.')
      await loadQuickReplies()
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Gagal menyimpan balas cepat.', 'error')
    }
  }

  async function deleteQuickReply(reply: QuickReply) {
    if (!window.confirm(`Hapus balas cepat "${reply.title}"?`)) return
    try {
      const response = await fetch(`/api/internal/live-chat/quick-replies/${reply.id}`, { method: 'DELETE' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal menghapus balas cepat.')
      showNotice('Balas cepat berhasil dihapus.')
      await loadQuickReplies()
    } catch (error) {
      showNotice(error instanceof Error ? error.message : 'Gagal menghapus balas cepat.', 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] min-h-[640px] overflow-hidden bg-white">
      {notice && (
        <div className={`fixed right-5 top-5 z-[160] max-w-md rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {notice.text}
        </div>
      )}

      {tab === 'inbox' ? (
        <div className="flex h-full min-h-0 flex-col bg-white">
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <a href="/internal" className="flex shrink-0 items-center" aria-label="Kembali ke dashboard internal">
                <img src="/logo.png" alt="Gadai Sakti" className="h-auto w-[128px] object-contain md:w-[150px]" />
              </a>
              <div className="hidden h-7 w-px bg-slate-200 sm:block" />
              <div className="min-w-0">
                <h1 className="truncate text-sm font-extrabold text-primary md:text-base">Live Chat HO</h1>
                <p className="hidden text-[10px] text-slate-400 sm:block">Inbox Customer Service</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
                <CircleDot size={14} className={presence === 'online' ? 'text-emerald-500' : presence === 'busy' ? 'text-amber-500' : 'text-slate-400'} />
                <span className="text-[11px] font-semibold text-slate-500">Status</span>
                <select value={presence} onChange={(event) => setPresence(event.target.value as typeof presence)} className="bg-transparent text-xs font-bold text-primary outline-none">
                  <option value="online">Online</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <a href="/internal" className="hidden h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[11px] font-bold text-slate-600 hover:bg-slate-50 lg:inline-flex">
                <LayoutDashboard size={14} />Dashboard
              </a>
              <button type="button" onClick={() => void loadConversations()} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Refresh live chat">
                <RefreshCw size={16} />
              </button>
              <button type="button" onClick={() => setTab('quick-replies')} className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-bold text-white md:px-4">
                <Sparkles size={15} />
                <span className="hidden sm:inline">Master Balas Cepat</span>
                <span className="sm:hidden">Balas Cepat</span>
              </button>
            </div>
          </header>

          <div className="grid min-h-0 flex-1 md:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[330px_minmax(0,1fr)_310px]">
            <section className={`${selectedId ? 'hidden' : 'flex'} min-h-0 flex-col border-r border-slate-200 bg-white md:flex`}>
              <div className="shrink-0 border-b border-slate-200 px-4 pb-3 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">Livechat</p>
                    <h2 className="mt-0.5 text-base font-extrabold text-primary">Semua Chat</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">{conversations.length} chat</span>
                </div>
                <div className="relative mt-3">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama / nomor HP" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" />
                </div>
                <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                  {([
                    ['active', 'Aktif'],
                    ['open', 'Menunggu'],
                    ['assigned', 'Ditangani'],
                    ['closed', 'Selesai'],
                    ['all', 'Semua'],
                  ] as const).map(([value, label]) => (
                    <button key={value} type="button" onClick={() => setStatusFilter(value)} className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[10px] font-bold transition ${statusFilter === value ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loadingList ? (
                  <div className="p-6 text-sm text-slate-500">Memuat percakapan...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-sm text-slate-500">Belum ada live chat pada filter ini.</div>
                ) : conversations.map((conversation) => (
                  <button key={conversation.id} type="button" onClick={() => setSelectedId(conversation.id)} className={`block w-full border-b border-slate-100 px-4 py-3.5 text-left transition ${selectedId === conversation.id ? 'bg-sky-50' : 'bg-white hover:bg-slate-50'}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold uppercase text-primary">
                        {conversation.customer_name.trim().slice(0, 2) || 'GS'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <strong className="truncate text-sm text-slate-800">{conversation.customer_name}</strong>
                              {Number(conversation.unread_count || 0) > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold text-white">{conversation.unread_count}</span>}
                            </div>
                            <span className="mt-0.5 block truncate text-[10px] text-slate-400">+{conversation.customer_phone}</span>
                          </div>
                          <span className="shrink-0 text-[9px] text-slate-400">{formatTime(conversation.last_message_at)}</span>
                        </div>
                        <p className="mt-1.5 line-clamp-1 text-[11px] leading-5 text-slate-600">{conversation.last_message || 'Percakapan baru'}</p>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${statusClass(conversation.status)}`}>{statusLabel[conversation.status]}</span>
                          {conversation.assigned_admin_name && <span className="truncate text-[9px] text-slate-400">{conversation.assigned_admin_name}</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className={`${selectedId ? 'flex' : 'hidden'} min-h-0 min-w-0 flex-col bg-[#eef2f3] md:flex`}>
              {!selectedId || !selectedConversation ? (
                <div className="flex flex-1 items-center justify-center p-8 text-center">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-sm"><MessageCircle size={28} /></div>
                    <h2 className="mt-4 text-lg font-bold text-primary">Pilih percakapan</h2>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Pilih chat konsumen di sebelah kiri untuk melihat pesan dan mulai membalas.</p>
                  </div>
                </div>
              ) : (
                <>
                  <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 md:px-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <button type="button" onClick={() => { setSelectedId(null); setSelectedConversation(null); setMessages([]) }} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Kembali ke daftar chat">
                        <ChevronLeft size={20} />
                      </button>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-extrabold uppercase text-primary">
                        {selectedConversation.customer_name.trim().slice(0, 2) || 'GS'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <h2 className="truncate text-sm font-extrabold text-slate-800 md:text-base">{selectedConversation.customer_name}</h2>
                          <span className={`hidden rounded-full border px-2 py-0.5 text-[9px] font-bold sm:inline-flex ${statusClass(selectedConversation.status)}`}>{statusLabel[selectedConversation.status]}</span>
                        </div>
                        <p className="mt-0.5 truncate text-[10px] text-slate-400">+{selectedConversation.customer_phone} · {selectedConversation.assigned_admin_name ? `Ditangani ${selectedConversation.assigned_admin_name}` : 'Belum diambil admin'}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {selectedConversation.status === 'open' && <button type="button" onClick={() => void conversationAction('assign')} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 text-[10px] font-bold text-sky-700 md:px-3"><UserRoundCheck size={14} /><span className="hidden sm:inline">Ambil Chat</span></button>}
                      {selectedConversation.status !== 'closed' ? <button type="button" onClick={() => void conversationAction('close')} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[10px] font-bold text-emerald-700 md:px-3"><CheckCircle2 size={14} /><span className="hidden sm:inline">Selesai</span></button> : <button type="button" onClick={() => void conversationAction('reopen')} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[10px] font-bold text-primary md:px-3"><RefreshCw size={14} /><span className="hidden sm:inline">Buka Lagi</span></button>}
                    </div>
                  </header>

                  <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(18,62,84,0.07) 1px, transparent 0)', backgroundSize: '22px 22px' }}>
                    <div className="mx-auto max-w-4xl">
                      {loadingDetail && messages.length === 0 ? <div className="text-sm text-slate-500">Memuat pesan...</div> : messages.map((message) => {
                        const isCustomer = message.sender_type === 'customer'
                        const isBot = message.sender_type === 'bot'
                        return (
                          <div key={message.id} className={`mb-2.5 flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[88%] rounded-xl px-3.5 py-2.5 shadow-sm md:max-w-[72%] ${isCustomer ? 'rounded-bl-sm border border-slate-200 bg-white text-slate-700' : isBot ? 'rounded-br-sm bg-[#d9f2ec] text-slate-800' : 'rounded-br-sm bg-primary text-white'}`}>
                              <div className="mb-1 flex items-center gap-1.5 text-[9px] font-bold opacity-65">
                                {isBot && <Sparkles size={10} />}
                                <span>{isCustomer ? selectedConversation.customer_name : isBot ? 'Auto Reply' : message.sender_admin_name || 'Admin HO'}</span>
                              </div>
                              <p className="whitespace-pre-wrap break-words text-[13px] leading-5">{message.message}</p>
                              <span className="mt-1 block text-right text-[8px] opacity-55">{formatTime(message.created_at)}</span>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messageEndRef} />
                    </div>
                  </div>

                  <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 md:px-4">
                    {selectedConversation.status === 'closed' ? (
                      <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-xs font-semibold text-slate-500">Percakapan sudah selesai. Buka kembali jika perlu membalas.</div>
                    ) : (
                      <>
                        {suggestedReplies.length > 0 && (
                          <div className="mb-2 flex gap-2 overflow-x-auto pb-1 2xl:hidden">
                            {suggestedReplies.map((reply) => <button key={reply.id} type="button" onClick={() => useQuickReply(reply)} className="shrink-0 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[10px] font-bold text-sky-700 hover:bg-sky-100">{reply.title}</button>)}
                          </div>
                        )}
                        <form onSubmit={sendReply} className="flex items-end gap-2">
                          <textarea value={replyText} onChange={(event) => { setReplyText(event.target.value); setSelectedQuickReplyId(null) }} rows={1} maxLength={1200} placeholder="Ketik balasan Admin HO..." className="max-h-32 min-h-[44px] flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10" />
                          <button type="submit" disabled={sending || !replyText.trim()} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40" aria-label="Kirim balasan"><Send size={18} /></button>
                        </form>
                        <div className="mt-1.5 flex items-center justify-between gap-3 text-[9px] text-slate-400"><span className="truncate">{selectedQuickReplyId ? 'Balas cepat dipilih, teks masih bisa diedit.' : 'Balasan dikirim atas nama Admin HO.'}</span><span className="shrink-0">{replyText.length}/1200</span></div>
                      </>
                    )}
                  </div>
                </>
              )}
            </section>

            <aside className="hidden min-h-0 flex-col border-l border-slate-200 bg-white 2xl:flex">
              {!selectedConversation ? (
                <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-slate-400">Informasi chat akan tampil setelah percakapan dipilih.</div>
              ) : (
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className="border-b border-slate-200 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Chat</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-extrabold uppercase text-primary">{selectedConversation.customer_name.trim().slice(0, 2) || 'GS'}</div>
                      <div className="min-w-0"><strong className="block truncate text-sm text-slate-800">{selectedConversation.customer_name}</strong><span className="mt-0.5 block truncate text-[11px] text-slate-400">+{selectedConversation.customer_phone}</span></div>
                    </div>
                    <div className="mt-4 space-y-3 text-xs">
                      <div className="flex items-start justify-between gap-4"><span className="text-slate-400">Status</span><span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${statusClass(selectedConversation.status)}`}>{statusLabel[selectedConversation.status]}</span></div>
                      <div className="flex items-start justify-between gap-4"><span className="text-slate-400">Admin</span><span className="max-w-[160px] text-right font-semibold text-slate-600">{selectedConversation.assigned_admin_name || 'Belum diambil'}</span></div>
                      <div className="flex items-start justify-between gap-4"><span className="flex items-center gap-1 text-slate-400"><Clock3 size={12} />Mulai</span><span className="text-right font-semibold text-slate-600">{formatTime(selectedConversation.created_at)}</span></div>
                      <div className="flex items-start justify-between gap-4"><span className="text-slate-400">Sumber</span><span className="max-w-[170px] break-all text-right font-semibold text-slate-600">{selectedConversation.source_page || 'Website'}</span></div>
                    </div>
                  </div>

                  <div className="border-b border-slate-200 p-5">
                    <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Balas Cepat</p><h3 className="mt-1 text-sm font-extrabold text-primary">Saran Keyword</h3></div><Sparkles size={17} className="text-accent" /></div>
                    {lastCustomerMessage && <div className="mt-3 rounded-xl bg-slate-50 p-3"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Pertanyaan terakhir</p><p className="mt-1.5 line-clamp-3 text-[11px] leading-5 text-slate-600">{lastCustomerMessage}</p></div>}
                    <div className="mt-3 space-y-2">
                      {suggestedReplies.length > 0 ? suggestedReplies.map((reply) => (
                        <button key={reply.id} type="button" onClick={() => useQuickReply(reply)} className="block w-full rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5 text-left transition hover:border-sky-200 hover:bg-sky-100">
                          <span className="block text-[11px] font-bold text-sky-800">{reply.title}</span>
                          <span className="mt-1 line-clamp-2 block text-[10px] leading-4 text-sky-700/70">{reply.message}</span>
                        </button>
                      )) : <p className="rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-400">Belum ada shortcut yang cocok dengan pertanyaan terakhir.</p>}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-extrabold text-primary">Shortcut Lainnya</h3><button type="button" onClick={() => setTab('quick-replies')} className="text-[10px] font-bold text-accent hover:underline">Kelola</button></div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {quickReplies.filter((reply) => Boolean(reply.active) && !suggestedReplies.some((suggestion) => suggestion.id === reply.id)).slice(0, 8).map((reply) => <button key={reply.id} type="button" onClick={() => useQuickReply(reply)} className="rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:border-primary/30 hover:bg-slate-50">{reply.title}</button>)}
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      ) : (
        <div className="flex h-full min-h-0 flex-col bg-slate-100">
          <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 md:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <button type="button" onClick={() => setTab('inbox')} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Kembali ke inbox"><ChevronLeft size={18} /></button>
              <div className="min-w-0"><h1 className="truncate text-base font-extrabold text-primary md:text-lg">Master Balas Cepat & Auto Reply</h1><p className="hidden text-[11px] text-slate-400 sm:block">Kelola keyword, rekomendasi balasan, dan auto reply Live Chat.</p></div>
            </div>
            <button type="button" onClick={() => openQuickReplyForm()} className="inline-flex h-9 items-center gap-2 rounded-lg bg-accent px-3 text-xs font-bold text-white md:px-4"><Plus size={15} />Tambah Balasan</button>
          </header>
          <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Balasan</th><th className="px-5 py-3">Keyword</th><th className="px-5 py-3">Mode</th><th className="px-5 py-3">Prioritas</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{quickReplies.map((reply) => <tr key={reply.id} className={!reply.active ? 'opacity-55' : ''}><td className="px-5 py-4"><strong className="block text-sm text-primary">{reply.title}</strong><span className="mt-1 block text-xs text-slate-400">{reply.category}</span><p className="mt-2 max-w-xl line-clamp-2 text-xs leading-5 text-slate-600">{reply.message}</p></td><td className="px-5 py-4"><div className="max-w-[300px] text-xs leading-5 text-slate-600">{reply.keywords || '-'}</div></td><td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${reply.auto_send ? 'bg-violet-50 text-violet-700' : 'bg-sky-50 text-sky-700'}`}>{reply.auto_send ? 'AUTO REPLY' : 'QUICK REPLY'}</span><span className={`ml-1 rounded-full px-2 py-1 text-[10px] font-bold ${reply.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{reply.active ? 'AKTIF' : 'NONAKTIF'}</span></td><td className="px-5 py-4 text-sm font-bold text-slate-600">{reply.priority}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => openQuickReplyForm(reply)} className="rounded-lg border border-slate-200 p-2 text-primary" aria-label="Edit"><Edit3 size={15} /></button><button type="button" onClick={() => void deleteQuickReply(reply)} className="rounded-lg border border-red-200 p-2 text-red-600" aria-label="Hapus"><Trash2 size={15} /></button></div></td></tr>)}</tbody>
                </table>
                {quickReplies.length === 0 && <div className="p-8 text-sm text-slate-500">Belum ada balas cepat.</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {showQuickReplyForm && <div className="fixed inset-0 z-[180] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowQuickReplyForm(false) }}>
        <form onSubmit={saveQuickReply} className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-accent">Master Live Chat</p><h2 className="mt-1 text-2xl font-extrabold text-primary">{editingQuickReplyId ? 'Edit Balas Cepat' : 'Tambah Balas Cepat'}</h2></div><button type="button" onClick={() => setShowQuickReplyForm(false)} className="rounded-lg border border-slate-200 p-2 text-slate-500"><X size={18} /></button></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Judul"><input required value={quickReplyForm.title} onChange={(event) => setQuickReplyForm((current) => ({ ...current, title: event.target.value }))} className="input-internal" placeholder="Syarat Gadai HP" /></Field>
            <Field label="Kategori"><input value={quickReplyForm.category} onChange={(event) => setQuickReplyForm((current) => ({ ...current, category: event.target.value }))} className="input-internal" placeholder="Syarat / Produk / Cabang" /></Field>
            <div className="md:col-span-2"><Field label="Keyword (pisahkan koma)"><input value={quickReplyForm.keywords} onChange={(event) => setQuickReplyForm((current) => ({ ...current, keywords: event.target.value }))} className="input-internal" placeholder="syarat, persyaratan, ktp" /></Field><p className="mt-1 text-[11px] text-slate-400">Keyword ini menentukan rekomendasi dan auto reply. Gunakan kata yang benar-benar relevan.</p></div>
            <div className="md:col-span-2"><Field label="Isi Balasan"><textarea required rows={6} value={quickReplyForm.message} onChange={(event) => setQuickReplyForm((current) => ({ ...current, message: event.target.value }))} className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" /></Field></div>
            <Field label="Prioritas"><input type="number" min={0} max={999} value={quickReplyForm.priority} onChange={(event) => setQuickReplyForm((current) => ({ ...current, priority: Number(event.target.value) }))} className="input-internal" /></Field>
            <div className="flex flex-col justify-end gap-3 pb-1"><label className="flex items-center gap-2 text-sm font-semibold text-slate-600"><input type="checkbox" checked={quickReplyForm.autoSend} onChange={(event) => setQuickReplyForm((current) => ({ ...current, autoSend: event.target.checked }))} className="h-4 w-4 accent-primary" />Kirim otomatis saat keyword cocok</label><label className="flex items-center gap-2 text-sm font-semibold text-slate-600"><input type="checkbox" checked={quickReplyForm.active} onChange={(event) => setQuickReplyForm((current) => ({ ...current, active: event.target.checked }))} className="h-4 w-4 accent-primary" />Aktif</label></div>
          </div>
          <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setShowQuickReplyForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Batal</button><button type="submit" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white">Simpan</button></div>
        </form>
      </div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>{children}</label>
}
