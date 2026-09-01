'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Calculator, MapPin, MessageCircle, X } from 'lucide-react'
import styles from './floating-help.module.css'

type HelpMode = 'compact' | 'expanded' | 'menu'

const INITIAL_DELAY_MS = 1800
const IDLE_DELAY_MS = 1700

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tagName = target.tagName
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT'
}

const CENTRAL_WHATSAPP_NUMBER = '6281125201419'
const WHATSAPP_MESSAGE = 'Halo Gadai Sakti, saya ingin bertanya mengenai layanan gadai.'

export function FloatingHelp() {
  const pathname = usePathname()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modeRef = useRef<HelpMode>('compact')
  const [mode, setMode] = useState<HelpMode>('compact')
  const [suspended, setSuspended] = useState(false)

  const disabled = pathname.startsWith('/internal') || pathname.startsWith('/karir/psikotes')

  const whatsappHref = `https://wa.me/${CENTRAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`

  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  useEffect(() => {
    if (disabled) return

    const clearIdleTimer = () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
    }

    const scheduleExpand = (delay = IDLE_DELAY_MS) => {
      clearIdleTimer()
      if (isEditableTarget(document.activeElement)) return
      idleTimerRef.current = setTimeout(() => {
        if (modeRef.current !== 'menu' && !isEditableTarget(document.activeElement)) {
          setSuspended(false)
          setMode('expanded')
        }
      }, delay)
    }

    const markActivity = (event?: Event) => {
      if (modeRef.current === 'menu') return
      if (event?.target && rootRef.current?.contains(event.target as Node)) return
      if (event?.target && isEditableTarget(event.target)) {
        clearIdleTimer()
        setMode('compact')
        setSuspended(true)
        return
      }
      setSuspended(false)
      setMode('compact')
      scheduleExpand()
    }

    const handleScroll = () => markActivity()
    const handlePointerDown = (event: PointerEvent) => markActivity(event)
    const handleTouchStart = (event: TouchEvent) => markActivity(event)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modeRef.current === 'menu') {
        setMode('compact')
        scheduleExpand()
        return
      }
      markActivity(event)
    }

    const handleFocusIn = (event: FocusEvent) => {
      if (!isEditableTarget(event.target)) return
      clearIdleTimer()
      if (modeRef.current !== 'menu') {
        setMode('compact')
        setSuspended(true)
      }
    }

    const handleFocusOut = () => {
      setSuspended(false)
      if (modeRef.current !== 'menu') scheduleExpand()
    }

    scheduleExpand(INITIAL_DELAY_MS)

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      clearIdleTimer()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [disabled])

  useEffect(() => {
    if (disabled) return
    setSuspended(false)
    setMode('compact')
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setMode('expanded'), INITIAL_DELAY_MS)
  }, [disabled, pathname])

  if (disabled) return null

  const openMenu = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    setSuspended(false)
    setMode('menu')
  }

  const closeMenu = () => {
    setMode('compact')
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setMode('expanded'), IDLE_DELAY_MS)
  }

  const isMenuOpen = mode === 'menu'
  const isExpanded = mode === 'expanded'

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${suspended ? styles.suspended : ''}`}
      aria-live="polite"
    >
      {isMenuOpen ? (
        <div className={styles.menu} role="dialog" aria-label="Bantuan Gadai Sakti">
          <div className={styles.menuHeader}>
            <div>
              <p className={styles.menuEyebrow}>Pusat bantuan</p>
              <h2 className={styles.menuTitle}>Ada yang bisa kami bantu?</h2>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeMenu}
              aria-label="Tutup bantuan"
            >
              <X size={18} />
            </button>
          </div>

          <div className={styles.menuActions}>
            <a
              href={whatsappHref}
              className={styles.menuAction}
              onClick={() => setMode('compact')}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.menuIcon}><MessageCircle size={19} /></span>
              <span>
                <strong>Chat WhatsApp</strong>
                <small>Tanya langsung ke tim pusat Gadai Sakti</small>
              </span>
            </a>

            <Link href="/cabang" className={styles.menuAction} onClick={() => setMode('compact')}>
              <span className={styles.menuIcon}><MapPin size={19} /></span>
              <span>
                <strong>Temukan Cabang</strong>
                <small>Cari Gadai Sakti terdekat</small>
              </span>
            </Link>

            <Link href="/simulasi" className={styles.menuAction} onClick={() => setMode('compact')}>
              <span className={styles.menuIcon}><Calculator size={19} /></span>
              <span>
                <strong>Simulasi Gadai</strong>
                <small>Cek estimasi nilai barang</small>
              </span>
            </Link>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className={`${styles.trigger} ${isExpanded ? styles.triggerExpanded : styles.triggerCompact}`}
        onClick={openMenu}
        aria-expanded={isMenuOpen}
        aria-label="Buka bantuan Gadai Sakti"
      >
        <span className={styles.avatar} aria-hidden="true">
          <Image
            src="/images/help/floating-help.webp"
            alt=""
            fill
            sizes="56px"
            className={styles.avatarImage}
          />
          <span className={styles.onlineDot} />
        </span>

        <span className={styles.triggerText}>
          <strong>Ada pertanyaan?</strong>
          <small>Hubungi kami</small>
        </span>
      </button>
    </div>
  )
}
