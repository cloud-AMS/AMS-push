/**
 * SITUS PUBLIK AMS — dibaca di route /web tanpa chrome ERP.
 *
 * Urutan sumber konten (paling baru lebih diutamakan):
 * 1. GET /api/website/published  → snapshot di server Express (dev & VPS/Caddy)
 * 2. GET /website-published.json → snapshot statis ikut build untuk hosting statis
 * 3. localStorage 'website_published' → hasil terbit pada perangkat ini
 * Bentuk JSON divalidasi sebelum dipakai karena hosting statis dapat mengembalikan
 * index.html (HTTP 200) untuk path yang tidak ada.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, Globe, LogIn, Menu, Phone, X, Mail } from 'lucide-react';
import { HalamanWebsite, KonfigurasiSitus } from '../../../../types';
import { PETA_HALAMAN, TampilkanSeksi, TombolSitus, type PropsSeksi } from './SiteSections';
import { hrefTautan } from '../../../../utils/website';

interface Rute {
  halaman: HalamanWebsite;
  kategoriKey?: string;
}

const DAFTAR_HALAMAN: HalamanWebsite[] = [
  'beranda',
  'produk',
  'solusi',
  'layanan',
  'sumber-daya',
  'tentang',
  'kontak'
];

/** Kelas dasar tombol pil header: CTA utama dan tombol Masuk harus terlihat sama ukurannya. */
const gayaTombolHeader =
  'inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-full text-xs font-bold transition-colors cursor-pointer';

const gayaTombolMasuk = `border border-teal-600 text-teal-700 hover:bg-teal-50 ${gayaTombolHeader}`;

const inisialLogo = (nama: string) =>
  nama
    .split(/\s+/)
    .filter((k) => k && k.toUpperCase() !== 'PT' && k.toUpperCase() !== 'CV')
    .slice(0, 3)
    .map((k) => k[0].toUpperCase())
    .join('') || 'AMS';

const adalahKonfigurasiSitus = (nilai: unknown): nilai is KonfigurasiSitus => {
  if (!nilai || typeof nilai !== 'object') return false;
  const kandidat = nilai as Record<string, unknown>;
  const identitas = kandidat.identitas as Record<string, unknown> | undefined;
  const hero = kandidat.hero as Record<string, unknown> | undefined;
  return Boolean(identitas && typeof identitas.nama === 'string' && hero && typeof hero.judul === 'string');
};

async function muatSnapshot(url: string): Promise<KonfigurasiSitus | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const teks = await res.text();
    const data = JSON.parse(teks) as unknown;
    if (adalahKonfigurasiSitus(data)) return data;
    const pembungkus = (data as { config?: unknown })?.config;
    return adalahKonfigurasiSitus(pembungkus) ? pembungkus : null;
  } catch {
    return null;
  }
}

function bacaQuery(): Rute {
  const halaman = new URLSearchParams(window.location.search).get('halaman') as HalamanWebsite | null;
  return { halaman: halaman && DAFTAR_HALAMAN.includes(halaman) ? halaman : 'beranda' };
}

export default function PublicWebsite({
  konfigurasi,
  adaAksesDashboard = false,
  pratinjau = false,
  landasan = '/web/',
  padaMasuk
}: {
  konfigurasi: KonfigurasiSitus;
  adaAksesDashboard?: boolean;
  pratinjau?: boolean;
  /** Dasar URL yang ditulis router; halaman depan aplikasi memakai '/' supaya tautan tetap di dalam gerbang login. */
  landasan?: string;
  /** Tanpa callback ini tombol Masuk tidak dirender (mis. pratinjau draf di dashboard). */
  padaMasuk?: () => void;
}) {
  const [rute, setRute] = useState<Rute>(bacaQuery);
  const [menuTerbuka, setMenuTerbuka] = useState(false);
  const [megaAktif, setMegaAktif] = useState<string | null>(null);
  const atasRef = useRef<HTMLDivElement>(null);

  const ke = useCallback((halaman: HalamanWebsite, kategoriKey?: string) => {
    setRute({ halaman, kategoriKey });
    setMenuTerbuka(false);
    setMegaAktif(null);
    if (!pratinjau) {
      const url = halaman === 'beranda' ? landasan : `${landasan}?halaman=${encodeURIComponent(halaman)}`;
      window.history.replaceState({}, '', url);
    }
    atasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [pratinjau, landasan]);

  useEffect(() => {
    document.title = konfigurasi.identitas.judulSitus || konfigurasi.identitas.nama;
    const meta =
      document.querySelector('meta[name="description"]') ??
      (() => {
        const baru = document.createElement('meta');
        baru.name = 'description';
        document.head.appendChild(baru);
        return baru;
      })();
    meta.setAttribute('content', konfigurasi.identitas.metaDeskripsi || '');
    const og =
      document.querySelector('meta[property="og:title"]') ??
      (() => {
        const baru = document.createElement('meta');
        baru.setAttribute('property', 'og:title');
        document.head.appendChild(baru);
        return baru;
      })();
    og.setAttribute('content', konfigurasi.identitas.judulSitus || konfigurasi.identitas.nama);
  }, [konfigurasi.identitas]);

  const seksi = PETA_HALAMAN[rute.halaman] ?? PETA_HALAMAN.beranda;
  const labelBeranda = konfigurasi.menu.find((m) => m.halaman === 'beranda')?.label || 'Beranda';
  const propsSeksi: PropsSeksi = useMemo(
    () => ({
      cfg: konfigurasi,
      ke,
      batasProduk: rute.halaman === 'beranda' ? 6 : undefined
    }),
    [konfigurasi, ke, rute.halaman]
  );

  const menu = konfigurasi.menu.filter((m) => m.isActive);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-600 selection:text-white" ref={atasRef}>
      {/* Header: identitas + navigasi + CTA (meniru advisains.id) */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
          <div className="flex items-center gap-4 py-3">
            <button type="button" onClick={() => ke('beranda')} className="flex items-center gap-3 cursor-pointer">
              {konfigurasi.identitas.logoUrl ? (
                <img src={konfigurasi.identitas.logoUrl} alt={konfigurasi.identitas.nama} className="h-10 w-auto object-contain" />
              ) : (
                <span className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-base font-bold">
                  {inisialLogo(konfigurasi.identitas.nama)}
                </span>
              )}
              <span className="text-left">
                <span className="block text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {konfigurasi.identitas.nama}
                </span>
                <span className="block text-2xs sm:text-xs text-slate-500 leading-tight">
                  {konfigurasi.identitas.tagline}
                </span>
              </span>
            </button>

            <nav className="hidden lg:flex items-center gap-1 ml-auto">
              {menu.map((item) =>
                item.tipe === 'mega' && item.kolom?.length ? (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setMegaAktif(item.id)}
                    onMouseLeave={() => setMegaAktif(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setMegaAktif(megaAktif === item.id ? null : item.id)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-teal-700 cursor-pointer"
                    >
                      {item.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${megaAktif === item.id ? 'rotate-180' : ''}`} />
                    </button>
                    {megaAktif === item.id && (
                      <div className="absolute left-0 top-full pt-2 z-50">
                        <div className="w-[560px] bg-white border border-slate-200 rounded-2xl shadow-lg p-5 grid grid-cols-2 gap-5">
                          {item.kolom.map((kolom) => (
                            <div key={kolom.id}>
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{kolom.judul}</p>
                              <ul className="mt-2 space-y-1">
                                {kolom.tautan
                                  .filter((t) => t.isActive)
                                  .map((t) => (
                                    <li key={t.id}>
                                      <button
                                        type="button"
                                        onClick={() => ke(t.halaman || 'produk', t.kategoriKey)}
                                        className="text-left text-sm text-slate-600 hover:text-teal-700 cursor-pointer"
                                      >
                                        {t.label}
                                      </button>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => ke(item.halaman || 'beranda')}
                    className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-teal-700 cursor-pointer"
                  >
                    {item.label}
                  </button>
                )
              )}
            </nav>

            <div className="hidden lg:flex items-center gap-2 ml-2">
              {konfigurasi.header.portalTeks && konfigurasi.header.portalUrl && (
                <a
                  href={konfigurasi.header.portalUrl}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2"
                >
                  {konfigurasi.header.portalTeks}
                </a>
              )}
              <HeaderAksi teks={konfigurasi.header.utamaTeks} cfg={konfigurasi} ke={ke} varian="isi" />
              {padaMasuk && (
                <button
                  type="button"
                  onClick={padaMasuk}
                  className={gayaTombolMasuk}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Masuk
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuTerbuka((b) => !b)}
              className="ml-auto lg:hidden p-2 rounded-lg border border-slate-300 text-slate-700 cursor-pointer"
              aria-label="Buka navigasi"
            >
              {menuTerbuka ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {menuTerbuka && (
            <div className="lg:hidden pb-4 space-y-1">
              {menu.map((item) => (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => ke(item.halaman || (item.tipe === 'mega' ? 'produk' : 'beranda'))}
                    className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    {item.label}
                  </button>
                  {item.tipe === 'mega' &&
                    item.kolom?.flatMap((k) => k.tautan).filter((t) => t.isActive).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => ke(t.halaman || 'produk', t.kategoriKey)}
                        className="w-full text-left pl-8 pr-3 py-1.5 text-xs text-slate-500 hover:text-teal-700 cursor-pointer"
                      >
                        {t.label}
                      </button>
                    ))}
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <HeaderAksi teks={konfigurasi.header.utamaTeks} cfg={konfigurasi} ke={ke} varian="isi" />
                {padaMasuk && (
                  <button
                    type="button"
                    onClick={padaMasuk}
                    className={gayaTombolMasuk}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Masuk
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Isi halaman */}
      <main>
        {rute.halaman !== 'beranda' && (
          <div className="bg-white border-b border-slate-200">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => ke('beranda')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {labelBeranda}
              </button>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{rute.halaman}</span>
              {rute.kategoriKey && (
                <span className="ml-auto text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2.5 py-0.5">
                  {rute.kategoriKey}
                </span>
              )}
            </div>
          </div>
        )}
        {seksi.map((kunci) => (
          <TampilkanSeksi key={kunci} kunci={kunci} propsSeksi={propsSeksi} />
        ))}
        {(rute.halaman === 'kontak' || rute.halaman === 'beranda') && <SeksiSosial cfg={konfigurasi} ke={ke} />}
      </main>

      {/* Footer multi-kolom */}
      <footer className="bg-slate-900 text-slate-300">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-[1.3fr_repeat(3,0.9fr)] gap-8">
            <div>
              <p className="text-base font-bold text-white">{konfigurasi.identitas.nama}</p>
              <p className="text-xs text-slate-400 mt-1">{konfigurasi.identitas.tagline}</p>
              <div className="mt-4 space-y-2 text-xs text-slate-400">
                <p className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {konfigurasi.kontak.telepon}
                </p>
                <p className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {konfigurasi.kontak.email}
                </p>
                <p className="flex items-start gap-2">
                  <Globe className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  {konfigurasi.kontak.alamatKantor}
                </p>
              </div>
              {adaAksesDashboard && (
                <a
                  href="/"
                  className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Kelola konten lewat dashboard Website
                </a>
              )}
            </div>
            {konfigurasi.footerKolom.map((kolom) => (
              <div key={kolom.id}>
                <p className="text-xs font-bold uppercase tracking-wider text-white">{kolom.judul}</p>
                <ul className="mt-3 space-y-1.5">
                  {kolom.tautan
                    .filter((t) => t.isActive)
                    .map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => ke(t.halaman || 'beranda', t.kategoriKey)}
                          className="text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          {t.label}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-8 border-t border-slate-800 pt-4">{konfigurasi.footerCatatan}</p>
        </div>
      </footer>
    </div>
  );
}

function HeaderAksi({
  teks,
  cfg,
  ke,
  varian
}: {
  teks: string;
  cfg: KonfigurasiSitus;
  ke: (h: HalamanWebsite, k?: string) => void;
  varian: 'isi' | 'garis';
}) {
  if (!teks) return null;
  const tautan = varian === 'isi' ? cfg.header.utamaTautan : cfg.header.cadanganTautan;
  const kelas =
    varian === 'isi'
      ? 'bg-teal-600 text-white hover:bg-teal-700 border border-teal-600'
      : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-300';

  if (tautan?.tipe === 'halaman') {
    return (
      <button
        type="button"
        onClick={() => ke((tautan.nilai as HalamanWebsite) || 'beranda')}
        className={`${gayaTombolHeader} ${kelas}`}
      >
        {teks}
      </button>
    );
  }
  const href = tautan ? hrefTautan(tautan, cfg.kontak) : '#';
  return (
    <a
      href={href}
      onClick={(e) => {
        if (!tautan?.tipe || href === '#') {
          e.preventDefault();
          ke('kontak');
        }
      }}
      className={`${gayaTombolHeader} ${kelas}`}
      target={tautan?.tipe === 'url' ? '_blank' : undefined}
      rel={tautan?.tipe === 'url' ? 'noopener noreferrer' : undefined}
    >
      {teks}
    </a>
  );
}

function SeksiSosial({ cfg, ke }: PropsSeksi) {
  const daftar = cfg.sosial.item.filter((s) => s.isActive);
  if (!cfg.sosial.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-8 flex flex-wrap items-center gap-3">
        <p className="text-sm font-bold text-slate-800">{cfg.sosial.kepala.judul}</p>
        {daftar.map((s) => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            {s.label}
          </a>
        ))}
        {cfg.sosial.kepala.teksTautan && (
          <div className="ml-auto">
            <TombolSitus teks={cfg.sosial.kepala.teksTautan} tautan={cfg.sosial.kepala.tautan} cfg={cfg} ke={ke} />
          </div>
        )}
      </div>
    </section>
  );
}

export { muatSnapshot, adalahKonfigurasiSitus };
