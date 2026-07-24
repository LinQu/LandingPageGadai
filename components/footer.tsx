import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-primary text-white" style={{ borderTop: '4px solid var(--accent)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Gadai Sakti" className="h-8 w-auto" />
            </div>
            <p className="text-sm opacity-90">
              PT Gadai Sakti Nusantara merupakan perseroan pergadaian swasta resmi yang berfokus memberikan kemudahan akses pinjaman dana mikro berbasis jaminan gadai elektronik terpercaya di Indonesia.
            </p>
            <br />
             <div className="ojk-badge-box">
                    <div className="ojk-logo-text">OJK<span>.</span></div>
                    <div className="ojk-info-text">
                        <strong>Berizin & Diawasi</strong>
                        <br />
                        <span>Otoritas Jasa Keuangan</span>
                    </div>
                </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-4">Layanan</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <Link href="/simulasi" className="hover:opacity-100 transition-opacity">
                  Simulasi Gadai
                </Link>
              </li>
              <li>
                <Link href="/cek-pemesanan" className="hover:opacity-100 transition-opacity">
                  Cek Pesanan
                </Link>
              </li>
              <li>
                <Link href="/arsip" className="hover:opacity-100 transition-opacity">
                  Arsip
                </Link>
              </li>
              <li>
                <Link href="/cabang" className="hover:opacity-100 transition-opacity">
                  Lokasi Cabang
                </Link>
              </li>
              <li>
                <Link href="/artikel" className="hover:opacity-100 transition-opacity">
                  Artikel & Tips
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:opacity-100 transition-opacity">
                  FAQ
                </a>
              </li>
              <li>
                <a href="tel:+62215555001" className="hover:opacity-100 transition-opacity">
                  Hubungi Kami
                </a>
              </li>
            </ul>
          </div>

          

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">Kontak</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <strong>Kantor Pusat Operasional</strong>
                <br />
                <span>Wisma 77 Tower 1 Lt. 5</span>
                            <span>Jl. Letjen S. Parman No.Kav 77, RT.6/RW.3, Slipi, Kec. Palmerah, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11410</span>
              </li>
              
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-light pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-90">
            <p>&copy; 2021 PT Gadai Sakti Indonesia . Semua hak dilindungi.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:opacity-100 transition-opacity">
                Kebijakan Privasi
              </a>
              <a href="#" className="hover:opacity-100 transition-opacity">
                Syarat & Ketentuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
