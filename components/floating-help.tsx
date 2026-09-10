'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { ExternalLink, MessageCircle, RotateCcw, Send, X } from 'lucide-react'
import styles from './floating-help.module.css'

const STORAGE_KEY = 'gs_live_chat_token'
const CENTRAL_WHATSAPP_NUMBER = '6281125201419'
const WHATSAPP_MESSAGE = 'Halo Gadai Sakti, saya ingin bertanya mengenai layanan gadai.'

type ChatMessage = {
  id: number
  sender_type: 'customer' | 'admin' | 'bot'
  sender_admin_name?: string | null
  message: string
  is_auto_reply: number
  created_at: string
}

type Conversation = {
  id: number
  customer_name: string
  customer_phone: string
  status: 'open' | 'assigned' | 'closed'
  assigned_admin_name?: string | null
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
}

export function FloatingHelp() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [token, setToken] = useState('')
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [draft, setDraft] = useState('')
  const [starting, setStarting] = useState(false)
  const [sending, setSending] = useState(false)
  const [restoring, setRestoring] = useState(true)
  const [error, setError] = useState('')
  const [availability, setAvailability] = useState<'online' | 'busy' | 'offline'>('offline')
  const messageEndRef = useRef<HTMLDivElement | null>(null)
  const latestMessageIdRef = useRef(0)

  const disabled = pathname.startsWith('/internal') || pathname.startsWith('/karir/psikotes')
  const whatsappHref = `https://wa.me/${CENTRAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  const mergeMessages = useCallback((incoming: ChatMessage[]) => {
    if (!incoming.length) return
    setMessages((current) => {
      const byId = new Map<number, ChatMessage>(current.map((message) => [message.id, message]))
      incoming.forEach((message) => byId.set(message.id, message))
      const merged = Array.from(byId.values()).sort((a, b) => a.id - b.id)
      latestMessageIdRef.current = merged[merged.length - 1]?.id || latestMessageIdRef.current
      return merged
    })
  }, [])

  const fetchMessages = useCallback(async (sessionToken: string, after = latestMessageIdRef.current) => {
    if (!sessionToken) return false
    try {
      const response = await fetch(`/api/live-chat/messages?after=${after}`, {
        cache: 'no-store',
        headers: { 'x-live-chat-token': sessionToken },
      })
      const payload = await response.json()
      if (response.status === 404) {
        window.localStorage.removeItem(STORAGE_KEY)
        setToken('')
        setConversation(null)
        setMessages([])
        latestMessageIdRef.current = 0
        return false
      }
      if (!response.ok) throw new Error(payload.error || 'Gagal memuat chat.')
      setConversation(payload.conversation)
      mergeMessages(payload.messages || [])
      return true
    } catch {
      return false
    }
  }, [mergeMessages])

  useEffect(() => {
    if (disabled) return
    const saved = window.localStorage.getItem(STORAGE_KEY) || ''
    if (!saved) {
      setRestoring(false)
      return
    }
    setToken(saved)
    void fetchMessages(saved, 0).finally(() => setRestoring(false))
  }, [disabled, fetchMessages])

  useEffect(() => {
    if (disabled || !token) return
    const timer = window.setInterval(() => void fetchMessages(token), 2400)
    return () => window.clearInterval(timer)
  }, [disabled, fetchMessages, token])

  useEffect(() => {
    if (disabled) return
    const loadAvailability = async () => {
      try {
        const response = await fetch('/api/live-chat/availability', { cache: 'no-store' })
        const payload = await response.json()
        setAvailability(payload.online ? (payload.status === 'busy' ? 'busy' : 'online') : 'offline')
      } catch {
        setAvailability('offline')
      }
    }
    void loadAvailability()
    const timer = window.setInterval(() => void loadAvailability(), 30000)
    return () => window.clearInterval(timer)
  }, [disabled])

  useEffect(() => {
    if (!isOpen) return
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [isOpen, messages.length])

  async function startChat(event: FormEvent) {
    event.preventDefault()
    setStarting(true)
    setError('')
    try {
      const response = await fetch('/api/live-chat/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, sourcePage: pathname }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal memulai chat.')
      window.localStorage.setItem(STORAGE_KEY, payload.token)
      setToken(payload.token)
      setConversation(payload.conversation)
      setMessages(payload.messages || [])
      latestMessageIdRef.current = payload.messages?.[payload.messages.length - 1]?.id || 0
      setDraft('')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Gagal memulai chat.')
    } finally {
      setStarting(false)
    }
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim() || !token || sending) return
    setSending(true)
    setError('')
    try {
      const response = await fetch('/api/live-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, message: draft }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Pesan gagal dikirim.')
      mergeMessages(payload.messages || [])
      setDraft('')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Pesan gagal dikirim.')
    } finally {
      setSending(false)
    }
  }

  function startNewChat() {
    window.localStorage.removeItem(STORAGE_KEY)
    setToken('')
    setConversation(null)
    setMessages([])
    latestMessageIdRef.current = 0
    setName('')
    setPhone('')
    setDraft('')
    setError('')
  }

  if (disabled) return null

  const statusText = availability === 'online' ? 'Admin HO online' : availability === 'busy' ? 'Admin sedang sibuk' : 'Tinggalkan pesan'

  return (
    <div className={styles.root} aria-live="polite">
      {isOpen && (
        <section className={styles.panel} aria-label="Live Chat Gadai Sakti">
          <header className={styles.panelHeader}>
            <div className={styles.headerIdentity}>
              <span className={styles.headerAvatar} aria-hidden="true">
                <Image src="/images/help/floating-help.webp" alt="" fill sizes="42px" className={styles.avatarImage} />
                <span className={`${styles.statusDot} ${availability === 'offline' ? styles.statusDotOffline : ''}`} />
              </span>
              <div>
                <strong>Live Chat Gadai Sakti</strong>
                <span>{statusText}</span>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className={styles.closeButton} aria-label="Tutup live chat"><X size={18} /></button>
          </header>

          <div className={styles.panelBody}>
            {restoring ? (
              <div className={styles.loadingState}>Memuat percakapan...</div>
            ) : !conversation ? (
              <form onSubmit={startChat} className={styles.startForm}>
                <div className={styles.welcomeIcon}><MessageCircle size={24} /></div>
                <h2>Halo 👋</h2>
                <p>Silakan isi nama dan nomor HP/WhatsApp terlebih dahulu sebelum memulai chat dengan Admin HO.</p>
                <label><span>Nama</span><input required minLength={2} maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama Anda" autoComplete="name" /></label>
                <label><span>Nomor HP / WhatsApp</span><input required inputMode="tel" maxLength={20} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="08xxxxxxxxxx" autoComplete="tel" /></label>
                {error && <div className={styles.errorBox}>{error}</div>}
                <button type="submit" disabled={starting} className={styles.primaryButton}>{starting ? 'Menghubungkan...' : 'Mulai Chat'}</button>
                <p className={styles.privacyNote}>Data digunakan untuk membantu tindak lanjut percakapan Anda.</p>
              </form>
            ) : (
              <>
                <div className={styles.messages}>
                  {messages.map((message) => {
                    const own = message.sender_type === 'customer'
                    return (
                      <div key={message.id} className={`${styles.messageRow} ${own ? styles.messageRowOwn : ''}`}>
                        <div className={`${styles.messageBubble} ${own ? styles.messageOwn : message.sender_type === 'bot' ? styles.messageBot : styles.messageAdmin}`}>
                          {!own && <span className={styles.senderName}>{message.sender_type === 'bot' ? 'Gadai Sakti' : message.sender_admin_name || 'Admin HO'}</span>}
                          <p>{message.message}</p>
                          <time>{formatTime(message.created_at)}</time>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messageEndRef} />
                </div>

                <div className={styles.chatMeta}>
                  <span>{conversation.status === 'closed' ? 'Percakapan selesai' : conversation.assigned_admin_name ? `Ditangani ${conversation.assigned_admin_name}` : 'Menunggu Admin HO'}</span>
                  <span>+{conversation.customer_phone}</span>
                </div>

                {error && <div className={styles.chatError}>{error}</div>}

                {conversation.status === 'closed' ? (
                  <div className={styles.closedBox}>
                    <p>Percakapan ini sudah selesai.</p>
                    <button type="button" onClick={startNewChat}><RotateCcw size={15} />Mulai Chat Baru</button>
                  </div>
                ) : (
                  <form onSubmit={sendMessage} className={styles.composer}>
                    <textarea rows={1} maxLength={1200} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ketik pesan..." />
                    <button type="submit" disabled={sending || !draft.trim()} aria-label="Kirim pesan"><Send size={18} /></button>
                  </form>
                )}

                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={styles.whatsappFallback}>Butuh WhatsApp? Hubungi HO <ExternalLink size={13} /></a>
              </>
            )}
          </div>
        </section>
      )}

      <button type="button" onClick={() => setIsOpen((current) => !current)} className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`} aria-label={isOpen ? 'Tutup live chat' : 'Buka live chat'}>
        <span className={styles.avatar} aria-hidden="true">
          <Image src="/images/help/floating-help.webp" alt="" fill sizes="50px" className={styles.avatarImage} />
          <span className={`${styles.statusDot} ${availability === 'offline' ? styles.statusDotOffline : ''}`} />
        </span>
        <span className={styles.triggerText}><strong>Live Chat</strong><small>{statusText}</small></span>
      </button>
    </div>
  )
}
