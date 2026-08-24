'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarDays, CheckCircle2, ChevronRight, Clock3, Lightbulb, ShieldCheck } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PawnCta } from '@/components/company/pawn-cta'
import { getArticleBySlug } from '@/lib/services/article.service'
import type { Article } from '@/lib/types'

type Section = { title: string; paragraphs: string[] }

function parseSections(content: string): Section[] {
  const sections: Section[] = []
  let current: Section = { title: 'Pembahasan', paragraphs: [] }

  content.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) return
    if (trimmed.startsWith('## ')) {
      if (current.paragraphs.length) sections.push(current)
      current = { title: trimmed.slice(3).trim(), paragraphs: [] }
    } else {
      current.paragraphs.push(trimmed)
    }
  })

  if (current.paragraphs.length || sections.length === 0) sections.push(current)
  return sections
}

export default function ArtikelDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getArticleBySlug(slug)
      .then(setArticle)
      .finally(() => setLoading(false))
  }, [slug])

  const sections = useMemo(() => parseSections(article?.content || ''), [article?.content])

  if (loading) {
    return <><Header /><main className="min-h-[70vh] bg-white py-20 text-center text-sm text-text-muted">Memuat artikel...</main><Footer /></>
  }

  if (!article) {
    return (
      <><Header /><main className="min-h-[70vh] bg-white py-20"><div className="mx-auto max-w-4xl px-5 text-center"><h1 className="text-3xl font-bold text-primary">Artikel tidak ditemukan</h1><Link href="/artikel" className="mt-5 inline-block font-semibold text-accent">Kembali ke Artikel</Link></div></main><Footer /></>
    )
  }

  return (
    <>
      <Header />
      <main className="bg-white">
        <article>
          <div className="mx-auto max-w-7xl px-5 pb-10 pt-7 sm:px-6 lg:px-8">
            <nav className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
              <Link href="/" className="hover:text-primary">Home</Link><ChevronRight size={12} />
              <Link href="/artikel" className="hover:text-primary">Artikel</Link><ChevronRight size={12} />
              <span className="line-clamp-1">{article.title}</span>
            </nav>

            <div className="mt-8 grid items-center gap-8 lg:grid-cols-[0.86fr_1.14fr]">
              <div>
                <span className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">{article.category}</span>
                <h1 className="mt-4 text-4xl font-extrabold leading-[1.06] text-primary md:text-5xl lg:text-[56px]">{article.title}</h1>
                <p className="mt-5 max-w-xl text-base leading-7 text-text-muted">{article.description}</p>
                <div className="mt-5 flex flex-wrap gap-5 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-2"><CalendarDays size={16} />{article.publishedAt.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  <span className="inline-flex items-center gap-2"><Clock3 size={16} />{article.readTime} menit baca</span>
                </div>
              </div>
              <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
                <img src={article.image || '/placeholder.jpg'} alt={article.title} className="aspect-[16/9] h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <div className="border-y border-slate-100 bg-slate-50/70 py-10">
            <div className="mx-auto grid max-w-7xl gap-7 px-5 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
              <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
                <h2 className="flex items-center gap-2 text-base font-bold text-primary"><Lightbulb size={18} className="text-accent" /> Daftar Isi</h2>
                <ol className="mt-4 space-y-3 text-xs leading-5 text-text-muted">
                  {sections.map((section, index) => <li key={section.title}><a href={`#bagian-${index + 1}`} className="flex gap-2 hover:text-primary"><span className="font-bold text-accent">{index + 1}.</span>{section.title}</a></li>)}
                </ol>
              </aside>

              <div className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
                <h2 className="text-2xl font-bold text-primary">Gadai Terdekat Bisa Jadi Langkah Sakti yang Lebih Terukur</h2>
                <p className="mt-3 text-sm leading-7 text-text-muted">Informasi pada artikel ini membantu Anda memahami pilihan sebelum mengambil keputusan. Selalu periksa nilai taksiran, biaya, dan jangka waktu transaksi secara jelas.</p>

                <div className="mt-8 space-y-9">
                  {sections.map((section, index) => (
                    <section key={section.title} id={`bagian-${index + 1}`} className="scroll-mt-28">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-extrabold text-accent">{index + 1}</div>
                        <div>
                          <h2 className="text-xl font-bold text-primary">{section.title}</h2>
                          {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex} className="mt-3 text-sm leading-7 text-text-muted">{paragraph}</p>)}
                        </div>
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: CheckCircle2, title: 'Proses jelas', text: 'Pahami nilai taksiran dan biaya sebelum transaksi dilanjutkan.' },
                { icon: ShieldCheck, title: 'Utamakan keamanan', text: 'Gunakan kanal dan cabang resmi untuk setiap proses gadai.' },
                { icon: Clock3, title: 'Rencanakan pelunasan', text: 'Catat tanggal jatuh tempo dan sesuaikan pinjaman dengan kemampuan.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-xl border border-slate-200 p-5">
                  <Icon className="text-accent" size={24} />
                  <h3 className="mt-3 text-base font-bold text-primary">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-text-muted">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-9"><PawnCta /></div>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-primary">Pertanyaan yang Sering Diajukan</h2>
              <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
                {[
                  ['Berapa lama proses gadai dilakukan?', 'Durasi bergantung pada jenis barang dan pemeriksaan di cabang.'],
                  ['Apakah taksiran simulasi merupakan nilai final?', 'Tidak. Taksiran final ditentukan setelah pemeriksaan fisik barang di cabang.'],
                  ['Bagaimana mencari cabang terdekat?', 'Buka halaman Lokasi Cabang dan gunakan pencarian atau lokasi perangkat.'],
                ].map(([question, answer]) => (
                  <details key={question} className="group p-4">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-primary">{question}</summary>
                    <p className="mt-3 text-sm leading-6 text-text-muted">{answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  )
}
