/**
 * RENDERER SITUS PUBLIK — susunan seksi meniru bentuk tampilan advisains.id
 * (header + mega menu + CTA, hero, strip kepercayaan, grid solusi, pita konsultasi,
 * capaian, katalog produk, baris merek, tahap perjalanan, institusi, kegiatan ilmiah,
 * promo, berita, galeri, testimoni, FAQ, kantor, kontak, footer multi-kolom).
 *
 * Tidak ada teks konten yang hard-code di sini: seluruhnya dibaca dari KonfigurasiSitus
 * yang dikelola lewat dashboard menu Website.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileText,
  Handshake,
  Mail,
  MapPin,
  Phone,
  Quote,
  ShieldCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { HalamanWebsite, KonfigurasiSitus, TautanWebsite } from '../../../../types';
import { hrefTautan, selesaikanGambar } from '../../../../utils/website';

export interface PropsSeksi {
  cfg: KonfigurasiSitus;
  ke: (halaman: HalamanWebsite, kategoriKey?: string) => void;
  /** jumlah kartu produk maksimal (dibatasi di beranda, penuh di halaman Produk) */
  batasProduk?: number;
}

/* -------------------------------------------------------------------------- */
/*  Primitif tampilan situs                                                     */
/* -------------------------------------------------------------------------- */

const WADAH = 'mx-auto w-full max-w-[1200px] px-4 sm:px-6';

function KepalaSeksiTampil({
  kepala,
  cfg,
  ke,
  rata = 'kiri'
}: {
  kepala: KonfigurasiSitus['solusi']['kepala'];
  cfg: KonfigurasiSitus;
  ke: (h: HalamanWebsite, k?: string) => void;
  rata?: 'kiri' | 'tengah';
}) {
  return (
    <div className={`flex flex-col gap-3 ${rata === 'tengah' ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'}`}>
      <div className="max-w-2xl">
        {kepala.eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">{kepala.eyebrow}</p>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 leading-tight">{kepala.judul}</h2>
        {kepala.subjudul && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{kepala.subjudul}</p>}
      </div>
      {kepala.teksTautan && kepala.tautan && (
        <TombolSitus teks={kepala.teksTautan} tautan={kepala.tautan} cfg={cfg} ke={ke} varian="garis" kecil />
      )}
    </div>
  );
}

export function TombolSitus({
  teks,
  tautan,
  cfg,
  ke,
  varian = 'isi',
  kecil = false
}: {
  teks?: string;
  tautan?: TautanWebsite;
  cfg: KonfigurasiSitus;
  ke: (h: HalamanWebsite, k?: string) => void;
  varian?: 'isi' | 'garis' | 'terang';
  kecil?: boolean;
}) {
  const label = teks || tautan?.nilai || 'Selengkapnya';
  const kelas = {
    isi: 'bg-teal-600 text-white hover:bg-teal-700 border border-teal-600',
    garis: 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-300',
    terang: 'bg-white text-slate-900 hover:bg-slate-100 border border-white'
  }[varian];
  const dasar = `inline-flex items-center gap-2 font-semibold rounded-full transition-colors cursor-pointer ${
    kecil ? 'px-3.5 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'
  } ${kelas}`;

  if (tautan?.tipe === 'halaman') {
    return (
      <button type="button" className={dasar} onClick={() => ke((tautan.nilai as HalamanWebsite) || 'beranda')}>
        {label}
        <ArrowRight className="w-4 h-4" />
      </button>
    );
  }
  return (
    <a
      href={hrefTautan(tautan, cfg.kontak)}
      className={dasar}
      target={tautan?.tipe === 'url' ? '_blank' : undefined}
      rel={tautan?.tipe === 'url' ? 'noopener noreferrer' : undefined}
    >
      {label}
      <ArrowRight className="w-4 h-4" />
    </a>
  );
}

function GambarSitus({
  rujukan,
  alt,
  kelas,
  prioritas = false
}: {
  rujukan?: string;
  alt: string;
  kelas: string;
  prioritas?: boolean;
}) {
  const url = selesaikanGambar(rujukan);
  if (!url) {
    return (
      <div className={`${kelas} bg-slate-100 border border-slate-200 flex items-center justify-center`}>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-3 text-center">{alt}</span>
      </div>
    );
  }
  return (
    <img
      src={url}
      alt={alt}
      loading={prioritas ? 'eager' : 'lazy'}
      fetchPriority={prioritas ? 'high' : 'auto'}
      className={`${kelas} object-cover`}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Seksi per bagian konten                                                    */
/* -------------------------------------------------------------------------- */

export function SeksiHero({ cfg, ke }: PropsSeksi) {
  const hero = cfg.hero;
  if (!hero.isActive) return null;
  return (
    <section className="bg-white border-b border-slate-200">
      <div className={`${WADAH} py-10 sm:py-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center`}>
        <div>
          {hero.badge && (
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {hero.badge}
            </p>
          )}
          <h1 className="text-4xl sm:text-5xl leading-tight font-bold text-slate-900 mt-4">{hero.judul}</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed max-w-2xl">{hero.subjudul}</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <TombolSitus teks={hero.teksCtaUtama} tautan={hero.tautanCtaUtama} cfg={cfg} ke={ke} />
            <TombolSitus teks={hero.teksCtaCadangan} tautan={hero.tautanCtaCadangan} cfg={cfg} ke={ke} varian="garis" />
          </div>
        </div>
        <div className="relative">
          <GambarSitus rujukan={hero.gambarUrl} alt="Foto produk atau fasilitas" kelas="w-full rounded-2xl" prioritas />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {cfg.kepercayaan.item
              .filter((l) => l.isActive)
              .slice(0, 4)
              .map((l) => (
                <div key={l.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{l.teks}</p>
                  <p className="text-2xs text-slate-500 mt-1 leading-snug">{l.keterangan}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SeksiSlide({ cfg, ke }: PropsSeksi) {
  const daftar = cfg.slide.item.filter((s) => s.isActive);
  const [indeks, setIndeks] = useState(0);

  useEffect(() => {
    if (daftar.length < 2) return;
    const timer = window.setInterval(() => setIndeks((i) => (i + 1) % daftar.length), 6000);
    return () => window.clearInterval(timer);
  }, [daftar.length]);

  if (!cfg.slide.isActive || daftar.length === 0) return null;
  const slide = daftar[indeks % daftar.length];

  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className={`${WADAH} py-8`}>
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900">
          <GambarSitus rujukan={slide.imageUrl} alt={slide.judul} kelas="w-full h-[220px] sm:h-[320px] opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/45 to-transparent flex items-center">
            <div className="p-6 sm:p-10 max-w-xl">
              {slide.eyebrow && (
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">{slide.eyebrow}</p>
              )}
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-2 whitespace-pre-line">{slide.judul}</h3>
              {slide.subjudul && <p className="text-xs sm:text-sm text-slate-200 mt-2 leading-relaxed">{slide.subjudul}</p>}
              {slide.teksCta && (
                <div className="mt-4">
                  <TombolSitus teks={slide.teksCta} tautan={slide.tautan} cfg={cfg} ke={ke} varian="terang" kecil />
                </div>
              )}
            </div>
          </div>
        </div>
        {daftar.length > 1 && (
          <div className="flex items-center gap-2 mt-3 justify-center">
            {daftar.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Tampilkan banner ${i + 1}`}
                onClick={() => setIndeks(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${i === indeks ? 'w-6 bg-teal-600' : 'w-2 bg-slate-300'}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function SeksiKepercayaan({ cfg }: { cfg: KonfigurasiSitus }) {
  const daftar = cfg.kepercayaan.item.filter((l) => l.isActive);
  if (!cfg.kepercayaan.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-white border-b border-slate-200">
      <div className={`${WADAH} py-6`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          {cfg.kepercayaan.kepala.judul}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          {daftar.map((l) => (
            <div key={l.id} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <BadgeCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-800">{l.teks}</p>
                <p className="text-xs text-slate-500 mt-0.5">{l.keterangan}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeksiSolusi({ cfg, ke }: PropsSeksi) {
  const daftar = cfg.solusi.item.filter((s) => s.isActive);
  if (!cfg.solusi.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.solusi.kepala} cfg={cfg} ke={ke} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
          {daftar.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => ke('produk', s.kategoriKey)}
              className="text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-teal-300 hover:shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <Sparkles className="w-5 h-5 text-teal-600" />
                {typeof s.jumlahProduk === 'number' && (
                  <span className="text-2xs font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                    {s.jumlahProduk} produk
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-3">{s.judul}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.deskripsi}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeksiKonsultasi({ cfg, ke }: PropsSeksi) {
  const seksi = cfg.konsultasi;
  if (!seksi.isActive) return null;
  return (
    <section className="bg-slate-900 text-white">
      <div className={`${WADAH} py-12 grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-center`}>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold leading-snug">{seksi.kepala.judul}</h2>
          {seksi.kepala.subjudul && <p className="text-sm text-slate-300 mt-2 leading-relaxed">{seksi.kepala.subjudul}</p>}
          {seksi.catatan && <p className="text-xs text-slate-400 mt-3 leading-relaxed">{seksi.catatan}</p>}
        </div>
        <div className="flex lg:justify-end">
          <TombolSitus teks={seksi.teksCta} tautan={seksi.tautan} cfg={cfg} ke={ke} varian="terang" />
        </div>
      </div>
    </section>
  );
}

export function SeksiStatistik({ cfg }: { cfg: KonfigurasiSitus }) {
  const daftar = cfg.statistik.item.filter((s) => s.isActive);
  if (!cfg.statistik.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-white border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.statistik.kepala} cfg={cfg} ke={() => undefined} />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-7">
          {daftar.map((s) => (
            <div key={s.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
              <p className="text-3xl font-bold text-teal-700">{s.nilai}</p>
              <p className="text-xs font-bold text-slate-800 mt-1">{s.label}</p>
              <p className="text-2xs text-slate-500 mt-1 leading-snug">{s.keterangan}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeksiProduk({ cfg, ke, batasProduk }: PropsSeksi) {
  const semua = cfg.produk.item.filter((p) => p.isActive);
  const [kategori, setKategori] = useState<string | 'Semua'>('Semua');
  const daftar = useMemo(
    () => (batasProduk ? semua.slice(0, batasProduk) : semua),
    [semua, batasProduk]
  );
  const kategoriList = Array.from(new Set(semua.map((p) => p.kategori)));

  if (!cfg.produk.isActive || semua.length === 0) return null;
  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.produk.kepala} cfg={cfg} ke={ke} />
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            type="button"
            onClick={() => setKategori('Semua')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
              kategori === 'Semua' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Semua Kategori
          </button>
          {kategoriList.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKategori(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                kategori === k ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {daftar
            .filter((p) => kategori === 'Semua' || p.kategori === kategori)
            .map((p) => (
              <article key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-2xs font-bold uppercase tracking-wider text-teal-700">{p.kategori}</span>
                  <span className="text-2xs font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2 py-0.5">
                    {p.kelasRisiko}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">{p.nama}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{p.tipeModel}</p>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{p.spesifikasi}</p>
                {p.poinJual.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {p.poinJual.map(( poin) => (
                      <li key={poin} className="text-xs text-slate-600 flex gap-1.5">
                        <span className="text-teal-600 font-bold">•</span>
                        {poin}
                      </li>
                    ))}
                  </ul>
                )}
                <dl className="mt-4 text-2xs text-slate-500 space-y-1 border-t border-slate-100 pt-3">
                  <div className="flex justify-between gap-2">
                    <dt>Nomor Izin Edar</dt>
                    <dd className="font-mono text-slate-700">{p.nomorIzinEdar}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Status Izin</dt>
                    <dd className={p.statusIzinEdar === 'Aktif' ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      {p.statusIzinEdar}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Produsen</dt>
                    <dd className="text-right text-slate-700">{p.produsen} · {p.negaraAsal}</dd>
                  </div>
                  {typeof p.stokTersedia === 'number' && (
                    <div className="flex justify-between gap-2">
                      <dt>Stok Gudang</dt>
                      <dd className="text-slate-700 font-bold">
                        {p.stokTersedia} {p.satuan || 'unit'}
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="flex flex-wrap gap-2 mt-4">
                  {p.tautanBrosur && (
                    <a
                      href={p.tautanBrosur}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Brosur
                    </a>
                  )}
                  {p.tautanVideo && (
                    <a
                      href={p.tautanVideo}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      Video Demo
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => ke('kontak')}
                    className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
                  >
                    <Handshake className="w-3.5 h-3.5" />
                    Ajukan Penawaran
                  </button>
                </div>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}

export function SeksiMerek({ cfg, ke }: PropsSeksi) {
  const daftar = cfg.merek.item.filter((m) => m.isActive);
  if (!cfg.merek.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-white border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.merek.kepala} cfg={cfg} ke={ke} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-7">
          {daftar.map((m) => (
            <div key={m.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50">
              {m.imageUrl ? (
                <GambarSitus rujukan={m.imageUrl} alt={m.nama} kelas="w-full h-16 rounded-xl mb-3" />
              ) : (
                <div className="w-full h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-slate-700">{m.nama.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <p className="text-xs font-bold text-slate-900 leading-snug">{m.nama}</p>
              <p className="text-2xs text-slate-500 mt-1">
                {m.kategori} · {m.negara}
              </p>
              <p className="text-2xs text-slate-600 mt-2 leading-snug">{m.keterangan}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeksiPerjalanan({ cfg }: { cfg: KonfigurasiSitus }) {
  const daftar = cfg.perjalanan.item.filter((p) => p.isActive);
  if (!cfg.perjalanan.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.perjalanan.kepala} cfg={cfg} ke={() => undefined} />
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
          {daftar.map((p, i) => (
            <li key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5">
              <span className="inline-flex w-8 h-8 rounded-full bg-teal-600 text-white text-xs font-bold items-center justify-center">
                {i + 1}
              </span>
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 mt-3">{p.tahap}</p>
              <h3 className="text-base font-bold text-slate-900 mt-1">{p.judul}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.deskripsi}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function SeksiInstitusi({ cfg, ke }: PropsSeksi) {
  const daftar = cfg.institusi.item.filter((i) => i.isActive);
  if (!cfg.institusi.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-white border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.institusi.kepala} cfg={cfg} ke={ke} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
          {daftar.map((i) => (
            <div key={i.id} className="border border-slate-200 rounded-2xl p-5">
              <Building2 className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900 mt-3">{i.nama}</h3>
              {typeof i.jumlahPelanggan === 'number' && (
                <p className="text-xs font-semibold text-emerald-700 mt-1">
                  {i.jumlahPelanggan} instansi terdaftar
                </p>
              )}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{i.deskripsi}</p>
              {i.contoh && <p className="text-2xs text-slate-500 mt-2">Contoh: {i.contoh}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

function tanggalPendek(iso: string) {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return { hari: '-', bulan: '-', tahun: '' };
  return { hari: String(t.getDate()).padStart(2, '0'), bulan: BULAN[t.getMonth()], tahun: String(t.getFullYear()) };
}

export function SeksiKegiatan({ cfg, ke }: PropsSeksi) {
  const daftar = cfg.kegiatan.item.filter((k) => k.isActive);
  if (!cfg.kegiatan.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.kegiatan.kepala} cfg={cfg} ke={ke} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
          {daftar.map((k) => {
            const tgl = tanggalPendek(k.tanggalMulai);
            return (
              <article key={k.id} className="bg-white border border-slate-200 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-14 rounded-xl bg-teal-50 border border-teal-200 text-center py-1.5">
                    <p className="text-base font-bold text-teal-800 leading-none">{tgl.hari}</p>
                    <p className="text-2xs font-semibold text-teal-700 mt-0.5">{tgl.bulan}</p>
                    <p className="text-2xs text-slate-500">{tgl.tahun}</p>
                  </div>
                  <div>
                    <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">{k.jenis}</p>
                    <h3 className="text-base font-bold text-slate-900 leading-snug mt-1">{k.judul}</h3>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mt-3 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  {k.lokasi}
                </p>
                <p className="text-xs text-slate-600 mt-1.5 flex items-start gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  {k.tanggalMulai} s.d. {k.tanggalSelesai}
                </p>
                {k.deskripsi && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{k.deskripsi}</p>}
                <span className="inline-block mt-3 text-2xs font-bold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
                  {k.status}
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SeksiPromo({ cfg, ke }: PropsSeksi) {
  const daftar = cfg.promo.item.filter((p) => p.isActive);
  if (!cfg.promo.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-white border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.promo.kepala} cfg={cfg} ke={ke} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
          {daftar.map((p) => (
            <article key={p.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
              <div className="flex items-center justify-between gap-2">
                <span className="text-2xs font-bold uppercase tracking-wider text-white bg-teal-600 rounded-full px-2.5 py-0.5">
                  {p.badge || 'Penawaran'}
                </span>
                {p.periode && <span className="text-2xs text-slate-500">{p.periode}</span>}
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-3">{p.judul}</h3>
              {p.namaAlkes && <p className="text-xs text-slate-600 mt-1">{p.namaAlkes}</p>}
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.deskripsi}</p>
              {p.potongan && (
                <p className="text-sm font-bold text-emerald-700 mt-3">{p.potongan}</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeksiArtikel({ cfg }: { cfg: KonfigurasiSitus }) {
  const daftar = cfg.artikel.item.filter((a) => a.isActive);
  if (!cfg.artikel.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.artikel.kepala} cfg={cfg} ke={() => undefined} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
          {daftar.map((a) => (
            <article key={a.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <GambarSitus rujukan={a.imageUrl} alt={a.judul} kelas="w-full h-40" />
              <div className="p-5">
                <p className="text-2xs font-bold uppercase tracking-wider text-teal-700">
                  {a.kategori} · {a.tanggal}
                </p>
                <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">{a.judul}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{a.ringkasan}</p>
                {a.tautan && (
                  <div className="mt-4">
                    <TombolSitus cfg={cfg} ke={() => undefined} tautan={a.tautan} teks="Selengkapnya" kecil varian="garis" />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeksiGaleri({ cfg }: { cfg: KonfigurasiSitus }) {
  const daftar = cfg.galeri.item.filter((g) => g.isActive);
  if (!cfg.galeri.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-white border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.galeri.kepala} cfg={cfg} ke={() => undefined} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">
          {daftar.map((g) => (
            <figure key={g.id} className="border border-slate-200 rounded-2xl overflow-hidden">
              <GambarSitus rujukan={g.imageUrl} alt={g.judul} kelas="w-full h-36" />
              <figcaption className="p-3">
                <p className="text-xs font-bold text-slate-800">{g.judul}</p>
                {g.keterangan && <p className="text-2xs text-slate-500 mt-0.5">{g.keterangan}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeksiTestimoni({ cfg }: { cfg: KonfigurasiSitus }) {
  const daftar = cfg.testimoni.item.filter((t) => t.isActive);
  if (!cfg.testimoni.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.testimoni.kepala} cfg={cfg} ke={() => undefined} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
          {daftar.map((t) => (
            <blockquote key={t.id} className="bg-white border border-slate-200 rounded-2xl p-5">
              <Quote className="w-5 h-5 text-teal-200" />
              <p className="text-xs text-slate-700 mt-3 leading-relaxed">{t.kutipan}</p>
              <footer className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-xs font-bold text-slate-900">{t.penulis}</p>
                <p className="text-2xs text-slate-500">
                  {t.jabatan} — {t.institusi}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeksiFaq({ cfg }: { cfg: KonfigurasiSitus }) {
  const daftar = cfg.faq.item.filter((f) => f.isActive);
  const [terbuka, setTerbuka] = useState<string | null>(daftar[0]?.id ?? null);
  if (!cfg.faq.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-white border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.faq.kepala} cfg={cfg} ke={() => undefined} />
        <div className="mt-7 divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
          {daftar.map((f) => {
            const aktif = terbuka === f.id;
            return (
              <div key={f.id}>
                <button
                  type="button"
                  onClick={() => setTerbuka(aktif ? null : f.id)}
                  className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <CircleHelp className={`w-4 h-4 shrink-0 ${aktif ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-semibold text-slate-800 flex-1">{f.pertanyaan}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${aktif ? 'rotate-180' : ''}`} />
                </button>
                {aktif && <p className="px-5 pb-4 text-xs text-slate-600 leading-relaxed">{f.jawaban}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SeksiTentang({ cfg }: { cfg: KonfigurasiSitus }) {
  const seksi = cfg.tentang;
  if (!seksi.isActive) return null;
  const paragraf = seksi.paragraf.filter((p) => p.trim());
  if (paragraf.length === 0) return null;
  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className={`${WADAH} py-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-8`}>
        <div>
          <KepalaSeksiTampil kepala={seksi.kepala} cfg={cfg} ke={() => undefined} />
          <div className="mt-5 space-y-3">
            {paragraf.map((p, i) => (
              <p key={i} className="text-sm text-slate-600 leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
        <div>
          <GambarSitus rujukan={seksi.imageUrl} alt="Profil perusahaan" kelas="w-full h-56 rounded-2xl" />
          {seksi.capaian.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {seksi.capaian.map((c, i) => (
                <div key={`${c.label}-${i}`} className="bg-white border border-slate-200 rounded-xl p-3">
                  <p className="text-xl font-bold text-teal-700">{c.nilai}</p>
                  <p className="text-xs font-semibold text-slate-700">{c.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function SeksiKantor({ cfg }: { cfg: KonfigurasiSitus }) {
  const daftar = cfg.kantor.item.filter((k) => k.isActive);
  if (!cfg.kantor.isActive || daftar.length === 0) return null;
  return (
    <section className="bg-white border-b border-slate-200">
      <div className={`${WADAH} py-12`}>
        <KepalaSeksiTampil kepala={cfg.kantor.kepala} cfg={cfg} ke={() => undefined} />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
          {daftar.map((k) => (
            <div key={k.id} className="border border-slate-200 rounded-2xl p-5">
              <p className="text-base font-bold text-slate-900">{k.nama}</p>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                {k.alamat}
              </p>
              {k.provinsiDilayani && (
                <p className="text-xs text-slate-500 mt-2">Cakupan: {k.provinsiDilayani}</p>
              )}
              {k.penanggungJawab && (
                <p className="text-xs text-slate-500 mt-1">Penanggung jawab: {k.penanggungJawab}</p>
              )}
              {k.telepon && (
                <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {k.telepon}
                </p>
              )}
              {k.email && (
                <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {k.email}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SeksiKontak({ cfg }: { cfg: KonfigurasiSitus }) {
  const kontak = cfg.kontak;
  const [subjek, setSubjek] = useState('');
  const [pesan, setPesan] = useState('');
  const surel = encodeURIComponent(`${subjek || 'Permintaan informasi alat kesehatan'}\n\n${pesan}`);

  return (
    <section className="bg-slate-50 border-b border-slate-200">
      <div className={`${WADAH} py-12 grid lg:grid-cols-[0.9fr_1.1fr] gap-8`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">HUBUNGI KAMI</p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Mari Bahas Kebutuhan Instansi Anda</h2>
          <div className="mt-6 space-y-3">
            <BarisKontak ikon={<Phone className="w-4 h-4" />} label="Telepon Kantor" nilai={kontak.telepon} />
            <BarisKontak ikon={<Mail className="w-4 h-4" />} label="Surel Resmi" nilai={kontak.email} />
            {kontak.whatsapp && <BarisKontak ikon={<Phone className="w-4 h-4" />} label="WhatsApp" nilai={kontak.whatsapp} />}
            {kontak.jamOperasional && <BarisKontak ikon={<CalendarDays className="w-4 h-4" />} label="Jam Operasional" nilai={kontak.jamOperasional} />}
            <BarisKontak ikon={<MapPin className="w-4 h-4" />} label="Alamat" nilai={kontak.alamatKantor} />
            {kontak.tautanPeta && (
              <a href={kontak.tautanPeta} className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-block">
                Buka lokasi di peta
              </a>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
          <h3 className="text-base font-bold text-slate-900">Kirim Permintaan Penawaran</h3>
          <p className="text-xs text-slate-500 mt-1">
            Isian ini membuka aplikasi surel dengan rincian yang tersimpan sebagai jejak permintaan; penawaran resmi tetap
            diverifikasi Penanggung Jawab Teknis.
          </p>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="web-subjek">
                Subjek
              </label>
              <input
                id="web-subjek"
                value={subjek}
                onChange={(e) => setSubjek(e.target.value)}
                placeholder="Contoh: Kebutuhan patient monitor ICU"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="web-pesan">
                Rincian kebutuhan
              </label>
              <textarea
                id="web-pesan"
                value={pesan}
                onChange={(e) => setPesan(e.target.value)}
                rows={5}
                placeholder="Nama instansi, jenis alat, jumlah unit, dan target pemasangan."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${kontak.email}?subject=${surel}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
              >
                <Mail className="w-4 h-4" />
                Kirim lewat Surel
              </a>
              {kontak.whatsapp && (
                <a
                  href={hrefTautan({ tipe: 'whatsapp', nilai: kontak.whatsapp }, kontak)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-sm font-semibold transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Chat WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BarisKontak({ ikon, label, nilai }: { ikon: ReactNode; label: string; nilai: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
        {ikon}
      </span>
      <div>
        <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm text-slate-800">{nilai}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Peta halaman: seksi mana yang tampil per halaman internal                  */
/* -------------------------------------------------------------------------- */

export type KunciSeksi =
  | 'slide'
  | 'hero'
  | 'kepercayaan'
  | 'solusi'
  | 'konsultasi'
  | 'statistik'
  | 'produk'
  | 'merek'
  | 'perjalanan'
  | 'institusi'
  | 'kegiatan'
  | 'promo'
  | 'artikel'
  | 'galeri'
  | 'testimoni'
  | 'faq'
  | 'tentang'
  | 'kantor'
  | 'kontak';

export const PETA_HALAMAN: Record<HalamanWebsite, KunciSeksi[]> = {
  beranda: [
    'hero',
    'slide',
    'kepercayaan',
    'solusi',
    'konsultasi',
    'statistik',
    'produk',
    'merek',
    'perjalanan',
    'institusi',
    'kegiatan',
    'promo',
    'artikel',
    'testimoni',
    'faq'
  ],
  produk: ['produk', 'promo', 'faq'],
  solusi: ['solusi', 'statistik', 'perjalanan', 'institusi'],
  layanan: ['perjalanan', 'kantor', 'faq', 'kontak'],
  'sumber-daya': ['artikel', 'kegiatan', 'galeri', 'testimoni', 'faq'],
  tentang: ['tentang', 'statistik', 'merek', 'institusi', 'kantor'],
  kontak: ['kontak', 'kantor', 'faq']
};

export function TampilkanSeksi({
  kunci,
  propsSeksi
}: {
  kunci: KunciSeksi;
  propsSeksi: { cfg: KonfigurasiSitus; ke: (h: HalamanWebsite, k?: string) => void; batasProduk?: number };
}) {
  switch (kunci) {
    case 'hero':
      return <SeksiHero {...propsSeksi} />;
    case 'slide':
      return <SeksiSlide {...propsSeksi} />;
    case 'kepercayaan':
      return <SeksiKepercayaan {...propsSeksi} />;
    case 'solusi':
      return <SeksiSolusi {...propsSeksi} />;
    case 'konsultasi':
      return <SeksiKonsultasi {...propsSeksi} />;
    case 'statistik':
      return <SeksiStatistik {...propsSeksi} />;
    case 'produk':
      return <SeksiProduk {...propsSeksi} />;
    case 'merek':
      return <SeksiMerek {...propsSeksi} />;
    case 'perjalanan':
      return <SeksiPerjalanan {...propsSeksi} />;
    case 'institusi':
      return <SeksiInstitusi {...propsSeksi} />;
    case 'kegiatan':
      return <SeksiKegiatan {...propsSeksi} />;
    case 'promo':
      return <SeksiPromo {...propsSeksi} />;
    case 'artikel':
      return <SeksiArtikel {...propsSeksi} />;
    case 'galeri':
      return <SeksiGaleri {...propsSeksi} />;
    case 'testimoni':
      return <SeksiTestimoni {...propsSeksi} />;
    case 'faq':
      return <SeksiFaq {...propsSeksi} />;
    case 'tentang':
      return <SeksiTentang {...propsSeksi} />;
    case 'kantor':
      return <SeksiKantor {...propsSeksi} />;
    case 'kontak':
      return <SeksiKontak {...propsSeksi} />;
    default:
      return null;
  }
}
