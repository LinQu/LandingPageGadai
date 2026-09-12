'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  CircleHelp,
  CreditCard,
  ExternalLink,
  LocateFixed,
  Loader2,
  Menu,
  MapPin,
  MessageCircle,
  Navigation,
  Package,
  RotateCcw,
  Search,
  Send,
  X,
} from 'lucide-react'
import { isCareerIntent, isNegotiationIntent, normalizeKeywordText } from '@/lib/live-chat-utils'
import { getBranches } from '@/lib/services/branch.service'
import { formatAddress, formatLocationName } from '@/lib/utils/format-location'
import type { Branch } from '@/lib/types'
import styles from './floating-help.module.css'

const STORAGE_KEY = 'gs_live_chat_token'
const HR_WHATSAPP_NUMBER = '6281128501741'
const HO_WHATSAPP_NUMBER = '6281125201419'
const HR_WHATSAPP_MESSAGE = 'Halo, saya ingin menanyakan lebih lanjut terkait lowongan pekerjaan Gadai Sakti'
const HO_WHATSAPP_MESSAGE = 'Halo Gadai Sakti, saya membutuhkan bantuan melalui WhatsApp.'
const FAQ_PAGE_SIZE = 4

const FAQ_CATEGORY_META = {
  'Barang & Syarat Gadai': { label: 'Barang dan Syarat Gadai', icon: Package },
  'Proses & Biaya Gadai': { label: 'Proses dan Biaya Gadai', icon: CircleDollarSign },
  'Pelunasan & Pembayaran': { label: 'Pelunasan dan Pembayaran', icon: CreditCard },
  'Lokasi & Kunjungan Cabang': { label: 'Lokasi dan Kunjungan Cabang', icon: MapPin },
  'Pertanyaan Lainnya': { label: 'Pertanyaan Lainnya', icon: CircleHelp },
} as const

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
  customer_domicile?: string | null
  customer_latitude?: number | null
  customer_longitude?: number | null
  status: 'open' | 'assigned' | 'closed'
  assigned_admin_name?: string | null
}

type PublicFaq = {
  id: number
  title: string
  category: string
}

type FaqView = 'categories' | 'questions' | 'feedback' | 'thanks'


type DomicileForm = {
  city: string
  district: string
  village: string
}

function formatWhatsappPhone(phone: string) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  return digits
}

function getBranchMapsUrl(branch: Branch) {
  return `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}&travelmode=driving`
}

function getBranchWhatsappUrl(branch: Branch) {
  const message = `Halo Gadai Sakti, saya mendapat rekomendasi cabang ${branch.NamaCabang} dari Live Chat website dan ingin bertanya lebih lanjut.`
  return `https://wa.me/${formatWhatsappPhone(branch.Phone)}?text=${encodeURIComponent(message)}`
}

function branchSearchScore(branch: Branch, form: DomicileForm) {
  const fields = normalizeKeywordText([
    branch.NamaCabang,
    branch.Kota,
    formatLocationName(branch.Kota),
    branch.Provinsi,
    formatLocationName(branch.Provinsi),
    branch.Alamat,
    formatAddress(branch.Alamat),
  ].filter(Boolean).join(' '))

  const city = normalizeKeywordText(form.city)
  const district = normalizeKeywordText(form.district)
  const village = normalizeKeywordText(form.village)
  let score = 0

  if (city) {
    const compactCity = city.replace(/\s+/g, '')
    const compactFields = fields.replace(/\s+/g, '')
    if (fields.includes(city) || compactFields.includes(compactCity)) score += 20
    else return -1
  }
  if (district && fields.includes(district)) score += 8
  if (village && fields.includes(village)) score += 6
  if (normalizeKeywordText(branch.NamaCabang).includes(city)) score += 4
  return score
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(date)
}

function getCategoryMeta(category: string) {
  return FAQ_CATEGORY_META[category as keyof typeof FAQ_CATEGORY_META] || { label: category, icon: CircleHelp }
}

function isBranchFinderIntent(message: unknown) {
  const normalized = normalizeKeywordText(message)
  if (!normalized) return false
  const text = ` ${normalized} `

  const schedulePhrases = [' jam buka ', ' jam operasional ', ' buka jam ', ' tutup jam ', ' hari buka ']
  if (schedulePhrases.some((phrase) => text.includes(phrase))) return false

  const locationPhrases = [
    ' cabang terdekat ',
    ' lokasi cabang ',
    ' alamat cabang ',
    ' cabang dimana ',
    ' cabang di mana ',
    ' cabang mana ',
    ' cabang di ',
    ' ada cabang ',
    ' outlet terdekat ',
    ' lokasi outlet ',
    ' alamat outlet ',
    ' dekat sini ',
    ' deket sini ',
    ' sekitar saya ',
    ' daerah saya ',
    ' di daerah ',
    ' cari cabang ',
    ' lokasi saya ',
    ' petunjuk arah ',
    ' maps ',
  ]

  return normalized === 'cabang' || normalized === 'lokasi' || locationPhrases.some((phrase) => text.includes(phrase))
}

export function FloatingHelp() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [token, setToken] = useState('')
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [faqs, setFaqs] = useState<PublicFaq[]>([])
  const [faqView, setFaqView] = useState<FaqView>('categories')
  const [activeFaqCategory, setActiveFaqCategory] = useState('')
  const [faqPage, setFaqPage] = useState(0)
  const [lastAskedFaqId, setLastAskedFaqId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [draft, setDraft] = useState('')
  const [starting, setStarting] = useState(false)
  const [sending, setSending] = useState(false)
  const [restoring, setRestoring] = useState(true)
  const [error, setError] = useState('')
  const [availability, setAvailability] = useState<'online' | 'busy' | 'offline'>('offline')
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [branchFinderOpen, setBranchFinderOpen] = useState(false)
  const [branchAutoOpenSuppressed, setBranchAutoOpenSuppressed] = useState(false)
  const [branchDomicile, setBranchDomicile] = useState<DomicileForm>({ city: '', district: '', village: '' })
  const [branchResults, setBranchResults] = useState<Branch[]>([])
  const [branchLoading, setBranchLoading] = useState(false)
  const [branchMessage, setBranchMessage] = useState('')
  const messageEndRef = useRef<HTMLDivElement | null>(null)
  const latestMessageIdRef = useRef(0)
  const branchAutoOpenedMessageIdRef = useRef(0)

  const disabled = pathname.startsWith('/internal') || pathname.startsWith('/karir/psikotes')
  const hrWhatsappHref = `https://wa.me/${HR_WHATSAPP_NUMBER}?text=${encodeURIComponent(HR_WHATSAPP_MESSAGE)}`
  const hoWhatsappHref = `https://wa.me/${HO_WHATSAPP_NUMBER}?text=${encodeURIComponent(HO_WHATSAPP_MESSAGE)}`

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
    if (disabled) return
    const loadFaqs = async () => {
      try {
        const response = await fetch('/api/live-chat/faqs', { cache: 'no-store' })
        const payload = await response.json()
        if (!response.ok) return
        const rows: PublicFaq[] = payload.data || []
        setFaqs(rows)
        setActiveFaqCategory((current) => current || rows[0]?.category || '')
      } catch {
        return
      }
    }
    void loadFaqs()
  }, [disabled])

  useEffect(() => {
    if (!isOpen) return
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [isOpen, messages.length, faqView])

  const faqCategories = useMemo(() => Array.from(new Set(faqs.map((faq) => faq.category))), [faqs])
  const categoryFaqs = useMemo(
    () => faqs.filter((faq) => faq.category === activeFaqCategory),
    [activeFaqCategory, faqs]
  )
  const faqPageCount = Math.max(1, Math.ceil(categoryFaqs.length / FAQ_PAGE_SIZE))
  const visibleFaqs = useMemo(
    () => categoryFaqs.slice(faqPage * FAQ_PAGE_SIZE, (faqPage + 1) * FAQ_PAGE_SIZE),
    [categoryFaqs, faqPage]
  )
  const lastCustomerEntry = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].sender_type === 'customer') return messages[index]
    }
    return null
  }, [messages])
  const lastCustomerMessage = lastCustomerEntry?.message || ''
  const lastCustomerMessageId = lastCustomerEntry?.id || 0
  const careerIntent = isCareerIntent(lastCustomerMessage)
  const negotiationIntent = isNegotiationIntent(lastCustomerMessage)
  const branchIntent = isBranchFinderIntent(lastCustomerMessage)

  useEffect(() => {
    if (!conversation?.id || !lastCustomerMessageId || !branchIntent || negotiationIntent || careerIntent || branchAutoOpenSuppressed) return
    if (branchAutoOpenedMessageIdRef.current === lastCustomerMessageId) return
    branchAutoOpenedMessageIdRef.current = lastCustomerMessageId
    setBranchFinderOpen(true)
    setShortcutsOpen(false)
  }, [branchAutoOpenSuppressed, branchIntent, careerIntent, conversation?.id, lastCustomerMessageId, negotiationIntent])

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
      setFaqView('categories')
      setFaqPage(0)
      setLastAskedFaqId(null)
      setShortcutsOpen(true)
      setBranchFinderOpen(false)
      setBranchAutoOpenSuppressed(false)
      branchAutoOpenedMessageIdRef.current = 0
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Gagal memulai chat.')
    } finally {
      setStarting(false)
    }
  }

  async function postMessage(message: string, quickReplyId?: number) {
    if (!message.trim() || !token || sending) return false
    setSending(true)
    setError('')
    try {
      const response = await fetch('/api/live-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, message, quickReplyId }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Pesan gagal dikirim.')
      mergeMessages(payload.messages || [])
      setDraft('')
      return true
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Pesan gagal dikirim.')
      return false
    } finally {
      setSending(false)
    }
  }

  function toggleShortcutMenu() {
    if (shortcutsOpen) {
      setShortcutsOpen(false)
      return
    }
    setBranchFinderOpen(false)
    setShortcutsOpen(true)
  }

  function toggleBranchFinder() {
    if (branchFinderOpen) {
      setBranchFinderOpen(false)
      setBranchAutoOpenSuppressed(true)
      if (lastCustomerMessageId) branchAutoOpenedMessageIdRef.current = lastCustomerMessageId
      return
    }
    setBranchAutoOpenSuppressed(false)
    setShortcutsOpen(false)
    setBranchFinderOpen(true)
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault()
    const outgoing = draft.trim()
    const outgoingBranchIntent = isBranchFinderIntent(outgoing)
    if (outgoingBranchIntent) {
      setBranchAutoOpenSuppressed(false)
      branchAutoOpenedMessageIdRef.current = 0
    }
    const sent = await postMessage(outgoing)
    if (!sent) return
    setShortcutsOpen(false)
    if (!outgoingBranchIntent) setBranchFinderOpen(false)
  }

  function selectFaqCategory(category: string) {
    setActiveFaqCategory(category)
    setFaqPage(0)
    setLastAskedFaqId(null)
    setFaqView('questions')
    setBranchFinderOpen(false)
    setShortcutsOpen(true)
  }

  async function askFaq(faq: PublicFaq) {
    const faqHasBranchIntent = isBranchFinderIntent(faq.title)
    if (faqHasBranchIntent) {
      setBranchAutoOpenSuppressed(false)
      branchAutoOpenedMessageIdRef.current = 0
    }
    const sent = await postMessage(faq.title, faq.id)
    if (!sent) return
    setLastAskedFaqId(faq.id)
    if (faqHasBranchIntent) {
      setBranchFinderOpen(true)
      setShortcutsOpen(false)
    } else {
      setFaqView('feedback')
    }
  }

  function resetFaqMenu() {
    setFaqView('categories')
    setFaqPage(0)
    setLastAskedFaqId(null)
    setBranchFinderOpen(false)
    setShortcutsOpen(true)
  }


  async function saveDomicileProfile(domicile: string, latitude?: number, longitude?: number) {
    if (!token) return
    try {
      const response = await fetch('/api/live-chat/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, domicile, latitude, longitude }),
      })
      if (!response.ok) return
      setConversation((current) => current ? { ...current, customer_domicile: domicile || null, customer_latitude: latitude ?? null, customer_longitude: longitude ?? null } : current)
    } catch {
      return
    }
  }

  async function findBranchesByDomicile(event: FormEvent) {
    event.preventDefault()
    const hasCity = branchDomicile.city.trim()
    if (!hasCity) {
      setBranchMessage('Isi minimal Kota/Kabupaten agar kami dapat mencarikan cabang yang sesuai.')
      return
    }

    setBranchLoading(true)
    setBranchMessage('')
    try {
      const branches = await getBranches()
      const ranked = branches
        .map((branch) => ({ branch, score: branchSearchScore(branch, branchDomicile) }))
        .filter((item) => item.score >= 0)
        .sort((a, b) => b.score - a.score || a.branch.NamaCabang.localeCompare(b.branch.NamaCabang))
        .map((item) => item.branch)
        .slice(0, 4)

      setBranchResults(ranked)
      const domicile = [
        branchDomicile.city.trim() ? `Kota/Kabupaten: ${branchDomicile.city.trim()}` : '',
        branchDomicile.district.trim() ? `Kecamatan: ${branchDomicile.district.trim()}` : '',
        branchDomicile.village.trim() ? `Kelurahan: ${branchDomicile.village.trim()}` : '',
      ].filter(Boolean).join(' | ')
      await saveDomicileProfile(domicile)
      setBranchMessage(ranked.length ? `Ditemukan ${ranked.length} rekomendasi cabang sesuai domisili Kakak.` : 'Cabang belum ditemukan dari domisili tersebut. Coba gunakan lokasi perangkat atau buka daftar semua cabang.')
    } catch {
      setBranchMessage('Data cabang sedang tidak dapat dimuat. Silakan coba beberapa saat lagi.')
    } finally {
      setBranchLoading(false)
    }
  }

  function findNearestBranches() {
    if (!navigator.geolocation) {
      setBranchMessage('Browser ini belum mendukung akses lokasi. Gunakan form domisili manual di bawah.')
      return
    }

    setBranchLoading(true)
    setBranchMessage('Meminta izin lokasi perangkat...')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          const branches = await getBranches(latitude, longitude)
          const nearest = [...branches]
            .filter((branch) => branch.distance !== undefined)
            .sort((a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY))
            .slice(0, 4)
          setBranchResults(nearest)
          setBranchMessage(nearest.length ? 'Berikut cabang terdekat berdasarkan lokasi perangkat Kakak.' : 'Jarak cabang belum dapat dihitung. Coba isi domisili secara manual.')
          await saveDomicileProfile('Lokasi perangkat dibagikan melalui Live Chat', latitude, longitude)
        } catch {
          setBranchMessage('Data cabang sedang tidak dapat dimuat. Silakan coba beberapa saat lagi.')
        } finally {
          setBranchLoading(false)
        }
      },
      () => {
        setBranchLoading(false)
        setBranchMessage('Lokasi tidak dapat diakses. Pastikan izin lokasi browser aktif atau isi domisili secara manual.')
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    )
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
    setShortcutsOpen(false)
    setBranchFinderOpen(false)
    setBranchAutoOpenSuppressed(false)
    branchAutoOpenedMessageIdRef.current = 0
    setBranchDomicile({ city: '', district: '', village: '' })
    setBranchResults([])
    setBranchMessage('')
    resetFaqMenu()
  }

  if (disabled) return null

  const statusText = availability === 'online' ? 'Admin HO online' : availability === 'busy' ? 'Admin sedang sibuk' : 'Tinggalkan pesan'
  const activeCategoryMeta = getCategoryMeta(activeFaqCategory)

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
            <div className={styles.headerActions}>
              {conversation && conversation.status !== 'closed' && faqs.length > 0 && (
                <button
                  type="button"
                  onClick={toggleShortcutMenu}
                  className={`${styles.headerMenuButton} ${shortcutsOpen ? styles.headerMenuButtonActive : ''}`}
                  aria-label={shortcutsOpen ? 'Tutup menu pertanyaan cepat' : 'Buka menu pertanyaan cepat'}
                  aria-expanded={shortcutsOpen}
                  title="Pertanyaan cepat"
                >
                  <Menu size={16} />
                  <span>Menu</span>
                </button>
              )}
              <button type="button" onClick={() => setIsOpen(false)} className={styles.closeButton} aria-label="Tutup live chat"><X size={18} /></button>
            </div>
          </header>

          <div className={styles.panelBody}>
            {restoring ? (
              <div className={styles.loadingState}>Memuat percakapan...</div>
            ) : !conversation ? (
              <form onSubmit={startChat} className={styles.startForm}>
                <div className={styles.welcomeIcon}><MessageCircle size={24} /></div>
                <h2>Halo!</h2>
                <p>Silakan isi nama dan nomor HP/WhatsApp terlebih dahulu. Setelah masuk, Kakak dapat memilih pertanyaan yang tersedia atau mengetik pertanyaan sendiri.</p>
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

                {faqs.length > 0 && conversation.status !== 'closed' && (
                  <div className={styles.shortcutArea}>
                    <button
                      type="button"
                      className={styles.shortcutToggle}
                      onClick={toggleShortcutMenu}
                      aria-expanded={shortcutsOpen}
                    >
                      <span className={styles.shortcutToggleText}>
                        <CircleHelp size={15} />
                        <span>
                          <strong>Pertanyaan Cepat</strong>
                          <small>{shortcutsOpen ? 'Tutup agar area chat lebih lega' : 'Buka kategori & FAQ'}</small>
                        </span>
                      </span>
                      {shortcutsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {shortcutsOpen && (
                      <div className={styles.faqFlow}>
                        {faqView === 'categories' && (
                          <>
                            <div className={styles.flowIntro}>
                              <strong>Pilih kategori pertanyaan</strong>
                              <span>Pilih kategori untuk jawaban cepat. Menu dapat ditutup kapan saja dan dibuka lagi melalui tombol menu di bagian atas chat.</span>
                            </div>
                            <div className={styles.categoryList}>
                              {faqCategories.map((category) => {
                                const meta = getCategoryMeta(category)
                                const Icon = meta.icon
                                return (
                                  <button key={category} type="button" disabled={sending} onClick={() => selectFaqCategory(category)} className={styles.menuButton}>
                                    <span className={styles.menuIcon}><Icon size={16} /></span>
                                    <span>{meta.label}</span>
                                    <ChevronRight size={15} />
                                  </button>
                                )
                              })}
                            </div>
                          </>
                        )}

                        {faqView === 'questions' && (
                          <>
                            <div className={styles.localChoice}><span>{activeCategoryMeta.label}</span></div>
                            <div className={styles.flowIntro}>
                              <strong>Gadai Sakti</strong>
                              <span>Berikut pertanyaan yang sering ditanyakan seputar {activeCategoryMeta.label}. Silakan pilih yang paling sesuai ya, Kak.</span>
                            </div>
                            <div className={styles.questionList}>
                              {visibleFaqs.map((faq) => (
                                <button key={faq.id} type="button" disabled={sending} onClick={() => void askFaq(faq)} className={styles.questionButton}>
                                  <span>{faq.title}</span>
                                  <ChevronRight size={15} />
                                </button>
                              ))}
                              {faqPage + 1 < faqPageCount && (
                                <button type="button" onClick={() => setFaqPage((current) => current + 1)} className={styles.questionButton}>
                                  <span>Lihat pertanyaan lainnya</span>
                                  <ChevronRight size={15} />
                                </button>
                              )}
                              <button type="button" onClick={() => faqPage > 0 ? setFaqPage((current) => Math.max(0, current - 1)) : resetFaqMenu()} className={styles.backMenuButton}>
                                <ArrowLeft size={14} />
                                <span>{faqPage > 0 ? 'Kembali ke pertanyaan sebelumnya' : 'Kembali ke menu sebelumnya'}</span>
                              </button>
                            </div>
                          </>
                        )}

                        {faqView === 'feedback' && lastAskedFaqId && (
                          <>
                            <div className={styles.feedbackPrompt}>
                              <strong>Apakah informasi ini sudah membantu, Kak?</strong>
                            </div>
                            <div className={styles.feedbackActions}>
                              <button type="button" onClick={() => setFaqView('thanks')} className={styles.feedbackButton}><CheckCircle2 size={15} />Sudah, terima kasih</button>
                              <button type="button" onClick={resetFaqMenu} className={styles.feedbackButton}><CircleHelp size={15} />Tanya pertanyaan lain</button>
                              <a href="/simulasi" className={`${styles.feedbackButton} ${styles.feedbackPrimary}`}><CircleDollarSign size={15} />Gadaikan Sekarang</a>
                            </div>
                          </>
                        )}

                        {faqView === 'thanks' && (
                          <div className={styles.thanksBox}>
                            <strong>Terima kasih, Kak.</strong>
                            <span>Senang bisa membantu. Jika masih ada yang ingin ditanyakan, silakan pilih pertanyaan lain.</span>
                            <button type="button" onClick={resetFaqMenu}>Tanya pertanyaan lain</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {(branchFinderOpen || (branchIntent && !branchAutoOpenSuppressed)) && conversation.status !== 'closed' && !negotiationIntent && !careerIntent && (
                  <div className={styles.branchArea}>
                    <button
                      type="button"
                      className={styles.branchToggle}
                      onClick={toggleBranchFinder}
                      aria-expanded={branchFinderOpen}
                    >
                      <span><MapPin size={15} />Cari Cabang Terdekat</span>
                      {branchFinderOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {branchFinderOpen && (
                      <div className={styles.branchPanel}>
                        <div className={styles.branchIntro}>
                          <strong>Cari cabang yang paling sesuai</strong>
                          <span>Gunakan lokasi perangkat untuk hasil terdekat, atau isi domisili. Kota/Kabupaten wajib diisi; Kecamatan dan Kelurahan membantu hasil lebih akurat.</span>
                        </div>

                        <button type="button" onClick={findNearestBranches} disabled={branchLoading} className={styles.locationButton}>
                          {branchLoading ? <Loader2 size={14} className={styles.spin} /> : <LocateFixed size={14} />}
                          Gunakan lokasi saya saat ini
                        </button>

                        <div className={styles.branchDivider}><span>atau isi domisili</span></div>

                        <form onSubmit={findBranchesByDomicile} className={styles.domicileForm}>
                          <input value={branchDomicile.city} onChange={(event) => setBranchDomicile((current) => ({ ...current, city: event.target.value }))} placeholder="Kota / Kabupaten (contoh: Semarang)" />
                          <input value={branchDomicile.district} onChange={(event) => setBranchDomicile((current) => ({ ...current, district: event.target.value }))} placeholder="Kecamatan (opsional)" />
                          <input value={branchDomicile.village} onChange={(event) => setBranchDomicile((current) => ({ ...current, village: event.target.value }))} placeholder="Kelurahan (opsional)" />
                          <button type="submit" disabled={branchLoading}>
                            {branchLoading ? <Loader2 size={14} className={styles.spin} /> : <Search size={14} />}
                            Cari Cabang
                          </button>
                        </form>

                        {branchMessage && <p className={styles.branchMessage}>{branchMessage}</p>}

                        {branchResults.length > 0 && (
                          <div className={styles.branchResults}>
                            {branchResults.map((branch) => (
                              <article key={branch.id} className={styles.branchCard}>
                                <div>
                                  <strong>{branch.NamaCabang}</strong>
                                  <span>{[formatLocationName(branch.Kota), formatLocationName(branch.Provinsi)].filter(Boolean).join(', ')}</span>
                                  <p>{formatAddress(branch.Alamat)}</p>
                                  <small>Jam layanan: {branch.hours || '08.30 - 20.30'}</small>
                                  {branch.distance !== undefined && <small className={styles.distanceText}><Navigation size={11} />± {branch.distance.toFixed(1)} km dari lokasi Kakak</small>}
                                </div>
                                <div className={styles.branchActions}>
                                  <a href={getBranchMapsUrl(branch)} target="_blank" rel="noopener noreferrer">Petunjuk Arah <ExternalLink size={11} /></a>
                                  {branch.Phone && <a href={getBranchWhatsappUrl(branch)} target="_blank" rel="noopener noreferrer">Chat Cabang <MessageCircle size={11} /></a>}
                                </div>
                              </article>
                            ))}
                          </div>
                        )}

                        {branchResults.length === 0 && branchMessage && !branchLoading && (
                          <a href="/cabang" className={styles.allBranchesLink}>Lihat semua lokasi cabang <ChevronRight size={12} /></a>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {negotiationIntent && (
                  <div className={styles.handoffNotice}>
                    <strong>Taksiran / negosiasi dilanjutkan via WhatsApp</strong>
                    <span>Admin HO akan menghubungi nomor WhatsApp yang Kakak daftarkan terlebih dahulu. Tidak perlu mengirim ulang pertanyaan.</span>
                  </div>
                )}

                {careerIntent && (
                  <div className={styles.hrActionBox}>
                    <span>Untuk informasi lowongan, silakan lanjut ke Tim HR Gadai Sakti.</span>
                    <a href={hrWhatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp Tim HR <ExternalLink size={13} /></a>
                  </div>
                )}

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
                  <>
                    <form onSubmit={sendMessage} className={styles.composer}>
                      <textarea rows={1} maxLength={1200} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ketik pesan..." />
                      <button type="submit" disabled={sending || !draft.trim()} aria-label="Kirim pesan"><Send size={18} /></button>
                    </form>
                    {!negotiationIntent && !careerIntent && (
                      <a className={styles.whatsappFallback} href={hoWhatsappHref} target="_blank" rel="noopener noreferrer">Butuh WhatsApp? Hubungi HO <ExternalLink size={11} /></a>
                    )}
                  </>
                )}
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
