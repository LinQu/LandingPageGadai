'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import styles from './floating-help.module.css'

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
  const [isExpanded, setIsExpanded] = useState(false)
  const [suspended, setSuspended] = useState(false)

  const disabled = pathname.startsWith('/internal') || pathname.startsWith('/karir/psikotes')

  const whatsappHref = `https://wa.me/${CENTRAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    WHATSAPP_MESSAGE
  )}`

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
        if (!isEditableTarget(document.activeElement)) {
          setSuspended(false)
          setIsExpanded(true)
        }
      }, delay)
    }

    const markActivity = (event?: Event) => {
      if (event?.target && rootRef.current?.contains(event.target as Node)) return
      if (event?.target && isEditableTarget(event.target)) {
        clearIdleTimer()
        setIsExpanded(false)
        setSuspended(true)
        return
      }
      setSuspended(false)
      setIsExpanded(false)
      scheduleExpand()
    }

    const handleScroll = () => markActivity()
    const handlePointerDown = (event: PointerEvent) => markActivity(event)
    const handleTouchStart = (event: TouchEvent) => markActivity(event)

    const handleFocusIn = (event: FocusEvent) => {
      if (!isEditableTarget(event.target)) return
      clearIdleTimer()
      setIsExpanded(false)
      setSuspended(true)
    }

    const handleFocusOut = () => {
      setSuspended(false)
      scheduleExpand()
    }

    scheduleExpand(INITIAL_DELAY_MS)

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      clearIdleTimer()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [disabled])

  useEffect(() => {
    if (disabled) return
    setSuspended(false)
    setIsExpanded(false)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setIsExpanded(true), INITIAL_DELAY_MS)
  }, [disabled, pathname])

  if (disabled) return null

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${suspended ? styles.suspended : ''}`}
      aria-live="polite"
    >
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.trigger} ${isExpanded ? styles.triggerExpanded : styles.triggerCompact}`}
        aria-label="Hubungi Gadai Sakti via WhatsApp"
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
          <strong>Chat WhatsApp</strong>
          <small>Hubungi kami</small>
        </span>
      </a>
    </div>
  )
}
