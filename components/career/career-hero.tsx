export function CareerHero() {
  return (
    <section className="border-b border-slate-200 bg-[#f4f5f6]">
      <div className="mx-auto grid min-h-[315px] max-w-7xl overflow-hidden lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex items-center px-6 py-12 sm:px-8 lg:px-10">
          <div>
            <h1 className="max-w-xl text-3xl font-extrabold uppercase leading-[1.12] text-primary sm:text-4xl lg:text-[42px]">
              Temukan Peluang Karir<br />di Gadai Sakti Indonesia
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-6 text-text-muted sm:text-base">
              Kami membuka peluang bagi talenta terbaik untuk tumbuh, belajar, dan berkontribusi bersama Gadai Sakti di berbagai wilayah Indonesia.
            </p>
          </div>
        </div>
        <div className="relative min-h-[300px] lg:min-h-[315px]">
          <img src="/career-team.jpg" alt="Tim Gadai Sakti" className="absolute inset-0 h-full w-full object-cover object-center" />
        </div>
      </div>
    </section>
  )
}
