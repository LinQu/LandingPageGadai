export function CareerHero() {
  return (
    <section className="border-b border-slate-200 bg-[#f4f5f6]">
      <div
        className="site-container relative min-h-[315px] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: "url('/Moodboard Web GADAII 1 -200kb.jpeg')",
        }}
      >
        <div className="flex min-h-[315px] items-center px-6 py-12 sm:px-8 lg:px-10">
          <div className="relative z-10 max-w-md rounded-r-xl bg-[#f4f5f6]/70 p-4 backdrop-blur-[1px] sm:p-6 lg:p-8">
          
            <h1 className="text-3xl font-extrabold uppercase leading-[1.12] text-primary sm:text-4xl lg:text-[42px]">
              Temukan Peluang Karir
              <br />
              di Gadai Sakti Indonesia
            </h1>

            <p className="mt-5 max-w-[500px] text-sm leading-6 text-text-muted sm:text-base">
              Kami membuka peluang bagi talenta terbaik untuk tumbuh,
              belajar, dan berkontribusi bersama Gadai Sakti di berbagai
              wilayah Indonesia.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}