import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Check,
  ClipboardList,
  ExternalLink,
  FileText,
  Filter,
  Handshake,
  LayoutGrid,
  List,
  Microscope,
  Minus,
  PackageCheck,
  Plus,
  ScanLine,
  Scissors,
  Search,
  Shield,
  SlidersHorizontal,
  Stethoscope,
  ThermometerSnowflake,
  Trash2,
  X
} from 'lucide-react';
import { HalamanWebsite, KonfigurasiSitus, ProdukWebsite } from '../../../../types';
import { db, KOLEKSI_OPERASIONAL_SITUS } from '../../../../services/pocketbase';
import {
  cocokKategoriProduk,
  selaraskanKontenOperasional,
  selesaikanGambar,
  slugifyWebsite
} from '../../../../utils/website';
import { IDENTITAS_RUJUKAN } from '../../../../data/websiteRujukan';

export interface ItemRfqPublik {
  produkId: string;
  nama: string;
  tipeModel: string;
  kategori: string;
  nomorIzinEdar: string;
  produsen: string;
  satuan: string;
  jumlah: number;
  hargaTayang?: string;
}

export interface PropsKatalogProduk {
  cfg: KonfigurasiSitus;
  ke: (halaman: HalamanWebsite, kategoriKey?: string) => void;
  /** Jumlah kartu produk maksimal (dibatasi di beranda, penuh di halaman Produk). */
  batasProduk?: number;
  /** Filter kategori aktif dari navigasi mega-menu, kartu solusi, atau parameter URL. */
  kategoriAktif?: string;
  /** Kata kunci awal dari parameter URL. */
  kataKunciAwal?: string;
  /** Sinkronkan perubahan kategori ke router situs publik. */
  onPilihKategori?: (kategori?: string) => void;
  /** Keranjang permintaan penawaran (RFQ) lintas halaman. */
  daftarRfq?: ItemRfqPublik[];
  onTambahRfq?: (produk: ProdukWebsite, jumlah?: number) => void;
  onUbahJumlahRfq?: (produkId: string, jumlah: number) => void;
  onHapusRfq?: (produkId: string) => void;
  onAjukanPenawaranLangsung?: (produk: ProdukWebsite, jumlah?: number) => void;
}

type FilterKetersediaan = 'semua' | 'stok_tersedia' | 'nie_aktif' | 'harga_tercantum';
type UrutanProduk = 'unggulan' | 'stok_terbanyak' | 'nama_az' | 'merek_az';
type ModeTampilan = 'grid' | 'tabel';

const WADAH = 'mx-auto w-full max-w-[1200px] px-4 sm:px-6';

function adalahUrlEksternal(tautan?: string): boolean {
  return Boolean(tautan && /^https?:\/\//i.test(tautan.trim()));
}

function adalahNieTerdaftar(nomor?: string): boolean {
  return Boolean(nomor && nomor.trim() !== '' && nomor.trim() !== '-');
}

function punyaHargaNominal(harga?: string): boolean {
  return Boolean(harga && /rp\s*[\d.]+/i.test(harga));
}

function ikonKategoriAlkes(kategori: string) {
  const k = kategori.toLowerCase();
  if (k.includes('lab') || k.includes('vitro') || k.includes('diagnostik')) {
    return <Microscope className="w-7 h-7 text-teal-700" />;
  }
  if (k.includes('instrument') || k.includes('bedah')) {
    return <Scissors className="w-7 h-7 text-teal-700" />;
  }
  if (k.includes('vaccine') || k.includes('cooler') || k.includes('cold')) {
    return <ThermometerSnowflake className="w-7 h-7 text-teal-700" />;
  }
  if (k.includes('protective') || k.includes('apd')) {
    return <Shield className="w-7 h-7 text-teal-700" />;
  }
  if (k.includes('x-ray') || k.includes('radiasi')) {
    return <ScanLine className="w-7 h-7 text-teal-700" />;
  }
  if (k.includes('vet')) {
    return <Stethoscope className="w-7 h-7 text-teal-700" />;
  }
  if (k.includes('disposable') || k.includes('steril')) {
    return <PackageCheck className="w-7 h-7 text-teal-700" />;
  }
  return <Activity className="w-7 h-7 text-teal-700" />;
}

/**
 * Perkaya daftar produk situs secara real-time dengan status stok gudang FEFO, recall, izin edar,
 * serta skema/kontrak harga terkini dari modul operasional, tanpa mengabaikan visibilitas CMS Website.
 */
function useProdukKatalogPublik(cfg: KonfigurasiSitus): ProdukWebsite[] {
  const [versiData, setVersiData] = useState(0);

  useEffect(() => {
    return db.subscribeKoleksi(KOLEKSI_OPERASIONAL_SITUS, () => {
      setVersiData((v) => v + 1);
    });
  }, []);

  return useMemo(() => {
    void versiData;
    const terselaraskan = selaraskanKontenOperasional(cfg, db.getSumberOperasionalWebsite());
    return terselaraskan.produk.item.filter((p) => p.isActive);
  }, [cfg, versiData]);
}

function cariLogoMerek(cfg: KonfigurasiSitus, produsen: string): string | undefined {
  const target = produsen.trim().toLowerCase();
  if (!target) return undefined;
  const cocok = cfg.merek.item.find((m) => {
    const namaMerek = m.nama.trim().toLowerCase();
    return target === namaMerek || target.includes(namaMerek) || namaMerek.includes(target);
  });
  return selesaikanGambar(cocok?.imageUrl);
}

function VisualProduk({
  produk,
  cfg,
  tinggiKelas = 'h-44'
}: {
  produk: ProdukWebsite;
  cfg: KonfigurasiSitus;
  tinggiKelas?: string;
}) {
  const [gagalFoto, setGagalFoto] = useState(false);
  const [gagalLogo, setGagalLogo] = useState(false);
  const fotoUrl = selesaikanGambar(produk.imageUrl);
  const logoMerekUrl = useMemo(() => cariLogoMerek(cfg, produk.produsen), [cfg, produk.produsen]);

  if (fotoUrl && !gagalFoto) {
    return (
      <div className={`relative w-full ${tinggiKelas} bg-white border-b border-slate-100 overflow-hidden`}>
        <img
          src={fotoUrl}
          alt={produk.nama}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setGagalFoto(true)}
          className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${tinggiKelas} bg-slate-50/90 border-b border-slate-100 px-5 py-4 flex flex-col justify-between overflow-hidden`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-2xs font-mono text-slate-400 uppercase tracking-wider truncate">
          {produk.kategoriRegulasi || produk.kategori}
        </span>
        {produk.kelasRisiko && produk.kelasRisiko !== '-' && (
          <span className="text-2xs font-mono font-semibold text-slate-500 shrink-0">
            {produk.kelasRisiko}
          </span>
        )}
      </div>

      <div className="my-auto flex flex-col items-center justify-center text-center py-2">
        {logoMerekUrl && !gagalLogo ? (
          <div className="bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 shadow-2xs">
            <img
              src={logoMerekUrl}
              alt={produk.produsen}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setGagalLogo(true)}
              className="h-9 w-auto max-w-[140px] object-contain"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
            {ikonKategoriAlkes(produk.kategori)}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-2xs text-slate-500">
        <span className="font-semibold text-slate-600 truncate">{produk.produsen}</span>
        {produk.tipeModel && produk.tipeModel !== 'Tipe sesuai katalog merek' && (
          <span className="font-mono text-slate-500 truncate max-w-[55%] text-right">
            {produk.tipeModel}
          </span>
        )}
      </div>
    </div>
  );
}

export function SeksiProdukPublik({
  cfg,
  ke,
  batasProduk,
  kategoriAktif,
  kataKunciAwal = '',
  onPilihKategori,
  daftarRfq = [],
  onTambahRfq,
  onUbahJumlahRfq,
  onHapusRfq,
  onAjukanPenawaranLangsung
}: PropsKatalogProduk) {
  const semua = useProdukKatalogPublik(cfg);
  const modeRingkas = typeof batasProduk === 'number';

  const kategoriTersedia = useMemo(() => {
    const grupUnik = Array.from(new Set(semua.map((p) => p.kategori)));
    return grupUnik.map((label) => ({
      label,
      jumlah: semua.filter((p) => cocokKategoriProduk(p, label)).length
    }));
  }, [semua]);

  const resolusiKategoriAwal = (kunci?: string): string => {
    if (!kunci || kunci === 'Semua') return 'Semua';
    const cocokGrup = kategoriTersedia.find(
      (k) =>
        k.label.toLowerCase() === kunci.trim().toLowerCase() ||
        slugifyWebsite(k.label) === slugifyWebsite(kunci)
    );
    return cocokGrup ? cocokGrup.label : kunci;
  };

  const [kategori, setKategori] = useState<string>(() => resolusiKategoriAwal(kategoriAktif));
  const [kataKunci, setKataKunci] = useState(kataKunciAwal);
  const [merekFilter, setMerekFilter] = useState<string>('Semua');
  const [ketersediaanFilter, setKetersediaanFilter] = useState<FilterKetersediaan>('semua');
  const [urutan, setUrutan] = useState<UrutanProduk>('unggulan');
  const [modeTampilan, setModeTampilan] = useState<ModeTampilan>('grid');
  const [produkDetail, setProdukDetail] = useState<ProdukWebsite | null>(null);
  const [panelRfqTerbuka, setPanelRfqTerbuka] = useState(false);

  useEffect(() => {
    setKategori(resolusiKategoriAwal(kategoriAktif));
  }, [kategoriAktif, semua.length]);

  useEffect(() => {
    if (kataKunciAwal) setKataKunci(kataKunciAwal);
  }, [kataKunciAwal]);

  const daftarMerek = useMemo(
    () => Array.from(new Set(semua.map((p) => p.produsen).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'id')),
    [semua]
  );

  const statistikKatalog = useMemo(() => {
    const siapKirim = semua.filter((p) => typeof p.stokTersedia === 'number' && p.stokTersedia > 0).length;
    const nieAktif = semua.filter((p) => adalahNieTerdaftar(p.nomorIzinEdar) && p.statusIzinEdar === 'Aktif').length;
    return {
      totalProduk: semua.length,
      totalGrup: kategoriTersedia.length,
      totalMerek: daftarMerek.length,
      siapKirim,
      nieAktif
    };
  }, [semua, kategoriTersedia.length, daftarMerek.length]);

  const pilihKategori = (baru: string) => {
    setKategori(baru);
    if (!modeRingkas && onPilihKategori) {
      onPilihKategori(baru === 'Semua' ? undefined : baru);
    }
  };

  const resetSemuaFilter = () => {
    setKategori('Semua');
    setKataKunci('');
    setMerekFilter('Semua');
    setKetersediaanFilter('semua');
    setUrutan('unggulan');
    if (!modeRingkas && onPilihKategori) {
      onPilihKategori(undefined);
    }
  };

  const hasilFilter = useMemo(() => {
    const q = kataKunci.trim().toLowerCase();

    const tersaring = semua.filter((p) => {
      if (kategori !== 'Semua' && !cocokKategoriProduk(p, kategori)) return false;
      if (!modeRingkas && merekFilter !== 'Semua' && p.produsen !== merekFilter) return false;

      if (!modeRingkas) {
        if (ketersediaanFilter === 'stok_tersedia' && !(typeof p.stokTersedia === 'number' && p.stokTersedia > 0)) {
          return false;
        }
        if (ketersediaanFilter === 'nie_aktif' && !(adalahNieTerdaftar(p.nomorIzinEdar) && p.statusIzinEdar === 'Aktif')) {
          return false;
        }
        if (ketersediaanFilter === 'harga_tercantum' && !punyaHargaNominal(p.hargaTayang)) {
          return false;
        }
      }

      if (q) {
        const hay = [
          p.nama,
          p.tipeModel,
          p.kategori,
          p.kategoriRegulasi,
          p.produsen,
          p.negaraAsal,
          p.nomorIzinEdar,
          p.spesifikasi,
          ...(p.poinJual ?? [])
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });

    if (modeRingkas || urutan === 'unggulan') return tersaring;

    const salinan = [...tersaring];
    if (urutan === 'stok_terbanyak') {
      salinan.sort((a, b) => (b.stokTersedia ?? -1) - (a.stokTersedia ?? -1) || a.nama.localeCompare(b.nama, 'id'));
    } else if (urutan === 'nama_az') {
      salinan.sort((a, b) => a.nama.localeCompare(b.nama, 'id'));
    } else if (urutan === 'merek_az') {
      salinan.sort((a, b) => a.produsen.localeCompare(b.produsen, 'id') || a.nama.localeCompare(b.nama, 'id'));
    }
    return salinan;
  }, [semua, kategori, merekFilter, ketersediaanFilter, kataKunci, urutan, modeRingkas]);

  const daftarTampil = useMemo(
    () => (batasProduk ? hasilFilter.slice(0, batasProduk) : hasilFilter),
    [hasilFilter, batasProduk]
  );

  const petaRfq = useMemo(
    () => new Map(daftarRfq.map((item) => [item.produkId, item])),
    [daftarRfq]
  );

  const totalUnitRfq = useMemo(
    () => daftarRfq.reduce((acc, item) => acc + item.jumlah, 0),
    [daftarRfq]
  );

  const adaFilterAktif =
    kategori !== 'Semua' ||
    kataKunci.trim() !== '' ||
    merekFilter !== 'Semua' ||
    ketersediaanFilter !== 'semua';

  if (!cfg.produk.isActive || semua.length === 0) return null;

  const tanganiTambahRfq = (produk: ProdukWebsite, jumlah = 1) => {
    if (onTambahRfq) {
      onTambahRfq(produk, jumlah);
    } else {
      ke('kontak');
    }
  };

  const tanganiPenawaranLangsung = (produk: ProdukWebsite, jumlah = 1) => {
    if (onAjukanPenawaranLangsung) {
      onAjukanPenawaranLangsung(produk, jumlah);
    } else {
      if (onTambahRfq) onTambahRfq(produk, jumlah);
      ke('kontak');
    }
  };

  return (
    <section className="bg-slate-50 border-b border-slate-200" id="katalog-produk-publik">
      <div className={`${WADAH} py-12`}>
        {/* Kepala Seksi */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            {cfg.produk.kepala.eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                {cfg.produk.kepala.eyebrow}
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 leading-tight">
              {cfg.produk.kepala.judul}
            </h2>
            {cfg.produk.kepala.subjudul && (
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {cfg.produk.kepala.subjudul}
              </p>
            )}
          </div>

          {modeRingkas ? (
            <button
              type="button"
              onClick={() => ke('produk', kategori === 'Semua' ? undefined : kategori)}
              className="inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full bg-white text-slate-800 hover:bg-slate-100 border border-slate-300 text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
            >
              Telusuri Seluruh Katalog ({semua.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <a
                href={IDENTITAS_RUJUKAN.tautanKatalog}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-full bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-teal-700" />
                Unduh Katalog PDF
              </a>
              <a
                href={IDENTITAS_RUJUKAN.tautanDaftarHarga}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-full bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-teal-700" />
                Price List Resmi
              </a>
            </div>
          )}
        </div>

        {/* Ringkasan Katalog Penuh (Hanya pada Halaman Produk) */}
        {!modeRingkas && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Total Alat Kesehatan</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">{statistikKatalog.totalProduk}</p>
              <p className="text-2xs text-slate-500 mt-0.5">Unit elektromedik, instrumen & BMHP</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Grup Katalog</p>
              <p className="text-xl font-bold text-teal-700 mt-0.5 tabular-nums">{statistikKatalog.totalGrup}</p>
              <p className="text-2xs text-slate-500 mt-0.5">Dari Disposable hingga X-Ray System</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Merek & Prinsipal</p>
              <p className="text-xl font-bold text-slate-900 mt-0.5 tabular-nums">{statistikKatalog.totalMerek}</p>
              <p className="text-2xs text-slate-500 mt-0.5">Merek dagang sendiri & agen resmi</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Stok Siap Kirim (FEFO)</p>
              <p className="text-xl font-bold text-emerald-700 mt-0.5 tabular-nums">{statistikKatalog.siapKirim}</p>
              <p className="text-2xs text-slate-500 mt-0.5">Tersedia di gudang distribusi CDAKB</p>
            </div>
          </div>
        )}

        {/* Panel Pencarian & Filter Katalog */}
        <div className={`mt-6 ${modeRingkas ? '' : 'bg-white border border-slate-200 rounded-2xl p-4 sm:p-5'}`}>
          {!modeRingkas && (
            <div className="grid lg:grid-cols-[1fr_auto] gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={kataKunci}
                  onChange={(e) => setKataKunci(e.target.value)}
                  placeholder="Cari nama alat kesehatan, tipe/model, merek prinsipal, nomor izin edar (AKL/AKD), atau spesifikasi…"
                  aria-label="Cari alat kesehatan"
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                {kataKunci && (
                  <button
                    type="button"
                    onClick={() => setKataKunci('')}
                    aria-label="Bersihkan kata kunci"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700">
                  <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={merekFilter}
                    onChange={(e) => setMerekFilter(e.target.value)}
                    aria-label="Filter merek atau prinsipal"
                    className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="Semua">Semua Merek ({daftarMerek.length})</option>
                    {daftarMerek.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={ketersediaanFilter}
                    onChange={(e) => setKetersediaanFilter(e.target.value as FilterKetersediaan)}
                    aria-label="Filter status ketersediaan"
                    className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="stok_tersedia">Stok Gudang Tersedia</option>
                    <option value="nie_aktif">NIE Kemenkes Aktif</option>
                    <option value="harga_tercantum">Harga Katalog Tercantum</option>
                  </select>
                </label>

                <label className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700">
                  <span className="text-slate-400">Urut:</span>
                  <select
                    value={urutan}
                    onChange={(e) => setUrutan(e.target.value as UrutanProduk)}
                    aria-label="Urutkan produk"
                    className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="unggulan">Urutan Katalog</option>
                    <option value="stok_terbanyak">Stok Siap Kirim</option>
                    <option value="nama_az">Nama Produk (A–Z)</option>
                    <option value="merek_az">Merek / Prinsipal</option>
                  </select>
                </label>

                <div
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-slate-50 p-0.5"
                  role="group"
                  aria-label="Mode tampilan katalog"
                >
                  <button
                    type="button"
                    onClick={() => setModeTampilan('grid')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      modeTampilan === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Kartu
                  </button>
                  <button
                    type="button"
                    onClick={() => setModeTampilan('tabel')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      modeTampilan === 'tabel' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    Tabel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Baris Grup Katalog */}
          <div className={`flex flex-wrap items-center gap-2 ${modeRingkas ? '' : 'mt-4 pt-3.5 border-t border-slate-100'}`}>
            <button
              type="button"
              onClick={() => pilihKategori('Semua')}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                kategori === 'Semua'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              Semua Grup
              <span className={`tabular-nums text-2xs ${kategori === 'Semua' ? 'text-slate-300' : 'text-slate-400'}`}>
                ({semua.length})
              </span>
            </button>
            {kategoriTersedia.map((k) => {
              const aktif = cocokKategoriProduk({ kategori: k.label }, kategori) && kategori !== 'Semua';
              return (
                <button
                  key={k.label}
                  type="button"
                  onClick={() => pilihKategori(k.label)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    aktif
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {k.label}
                  <span className={`tabular-nums text-2xs ${aktif ? 'text-teal-100' : 'text-slate-400'}`}>
                    ({k.jumlah})
                  </span>
                </button>
              );
            })}
          </div>

          {!modeRingkas && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <p className="tabular-nums">
                Menampilkan <strong className="text-slate-800">{hasilFilter.length}</strong> dari{' '}
                <strong className="text-slate-800">{semua.length}</strong> alat kesehatan
                {kategori !== 'Semua' ? ` pada grup "${kategori}"` : ''}
              </p>
              {adaFilterAktif && (
                <button
                  type="button"
                  onClick={resetSemuaFilter}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                >
                  Atur ulang filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Kondisi Kosong */}
        {daftarTampil.length === 0 ? (
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-sm font-bold text-slate-900">Tidak ada produk yang cocok dengan pencarian Anda</p>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
              Coba ubah kata kunci, pilih grup katalog lain, atau kirimkan spesifikasi kebutuhan instansi Anda secara langsung kepada tim penjualan REMEDI.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={resetSemuaFilter}
                className="px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Tampilkan Semua Produk
              </button>
              <button
                type="button"
                onClick={() => ke('kontak')}
                className="px-4 py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white cursor-pointer"
              >
                Konsultasikan Kebutuhan Khusus
              </button>
            </div>
          </div>
        ) : !modeRingkas && modeTampilan === 'tabel' ? (
          /* Mode Tabel Spesifikasi Pengadaan B2B */
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-2xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Alat Kesehatan & Model</th>
                    <th className="py-3 px-4">Grup & Klasifikasi</th>
                    <th className="py-3 px-4">Merek / Asal</th>
                    <th className="py-3 px-4">Registrasi Kemenkes RI</th>
                    <th className="py-3 px-4">Ketersediaan & Zona</th>
                    <th className="py-3 px-4">Referensi Harga</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {daftarTampil.map((p) => {
                    const diRfq = petaRfq.get(p.id);
                    const nieAda = adalahNieTerdaftar(p.nomorIzinEdar);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 align-top max-w-[260px]">
                          <button
                            type="button"
                            onClick={() => setProdukDetail(p)}
                            className="text-left font-bold text-slate-900 hover:text-teal-700 leading-snug cursor-pointer"
                          >
                            {p.nama}
                          </button>
                          <p className="text-2xs font-mono text-slate-500 mt-0.5">{p.tipeModel}</p>
                        </td>
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <p className="font-semibold text-teal-700">{p.kategori}</p>
                          <p className="text-2xs text-slate-500 mt-0.5">
                            {p.kategoriRegulasi ? `${p.kategoriRegulasi}` : 'Lini Katalog REMEDI'}
                            {p.kelasRisiko && p.kelasRisiko !== '-' ? ` · ${p.kelasRisiko}` : ''}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 align-top">
                          <p className="font-semibold text-slate-800">{p.produsen}</p>
                          <p className="text-2xs text-slate-500 mt-0.5">{p.negaraAsal}</p>
                        </td>
                        <td className="py-3.5 px-4 align-top">
                          {nieAda ? (
                            <>
                              <p className="font-mono text-2xs text-slate-800 whitespace-nowrap">{p.nomorIzinEdar}</p>
                              <p
                                className={`text-2xs font-semibold mt-0.5 ${
                                  p.statusIzinEdar === 'Aktif' ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {p.statusIzinEdar}
                              </p>
                            </>
                          ) : (
                            <p className="text-2xs text-slate-500">Verifikasi Register RA & PJT</p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 align-top tabular-nums">
                          {p.statusIzinEdar === 'Perpanjangan' || p.statusIzinEdar === 'Kedaluwarsa' ? (
                            <p className="text-2xs font-semibold text-amber-700">Menunggu rilis NIE</p>
                          ) : typeof p.stokTersedia === 'number' && p.stokTersedia > 0 ? (
                            <p className="font-semibold text-emerald-700 whitespace-nowrap">
                              {p.stokTersedia} {p.satuan || 'Unit'} siap kirim
                            </p>
                          ) : (
                            <p className="text-slate-600">Konfirmasi stok / PO</p>
                          )}
                          {p.zonaSuhu && <p className="text-2xs text-slate-500 mt-0.5">{p.zonaSuhu}</p>}
                        </td>
                        <td className="py-3.5 px-4 align-top tabular-nums">
                          <p className="font-semibold text-slate-800">{p.hargaTayang || 'Sesuai Price List'}</p>
                        </td>
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setProdukDetail(p)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer"
                            >
                              Detail
                            </button>
                            <button
                              type="button"
                              onClick={() => tanganiTambahRfq(p, 1)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                diRfq
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-teal-600 text-white hover:bg-teal-700'
                              }`}
                            >
                              {diRfq ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  RFQ ({diRfq.jumlah})
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  RFQ
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Mode Grid Kartu Produk */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {daftarTampil.map((p) => {
              const diRfq = petaRfq.get(p.id);
              const nieAda = adalahNieTerdaftar(p.nomorIzinEdar);
              return (
                <article
                  key={p.id}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:border-teal-300 hover:shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setProdukDetail(p)}
                    className="text-left block w-full cursor-pointer"
                    aria-label={`Lihat spesifikasi ${p.nama}`}
                  >
                    <VisualProduk produk={p} cfg={cfg} />
                  </button>

                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-2xs font-bold uppercase tracking-wider text-teal-700">
                      {p.kategori}
                      {p.produsen ? ` · ${p.produsen}` : ''}
                      {p.kelasRisiko && p.kelasRisiko !== '-' ? (
                        <span className="text-slate-500"> · {p.kelasRisiko}</span>
                      ) : null}
                    </p>

                    <button
                      type="button"
                      onClick={() => setProdukDetail(p)}
                      className="text-left mt-1.5 cursor-pointer"
                    >
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors leading-snug">
                        {p.nama}
                      </h3>
                    </button>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">{p.tipeModel}</p>

                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-2">
                      {p.spesifikasi}
                    </p>

                    <dl className="mt-auto pt-3.5 border-t border-slate-100 space-y-1.5 text-2xs text-slate-500">
                      <div className="flex items-baseline justify-between gap-2">
                        <dt className="shrink-0">Registrasi</dt>
                        {nieAda ? (
                          <dd className="font-mono text-slate-800 text-right truncate">
                            {p.nomorIzinEdar}{' '}
                            <span
                              className={`font-sans font-semibold ${
                                p.statusIzinEdar === 'Aktif' ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              ({p.statusIzinEdar})
                            </span>
                          </dd>
                        ) : (
                          <dd className="text-slate-600 text-right">Verifikasi Register RA</dd>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between gap-2 tabular-nums">
                        <dt className="shrink-0">Ketersediaan</dt>
                        {p.statusIzinEdar === 'Perpanjangan' || p.statusIzinEdar === 'Kedaluwarsa' ? (
                          <dd className="text-amber-700 font-semibold text-right">Perpanjangan NIE berjalan</dd>
                        ) : typeof p.stokTersedia === 'number' && p.stokTersedia > 0 ? (
                          <dd className="text-emerald-700 font-semibold text-right">
                            Siap kirim · {p.stokTersedia} {p.satuan || 'Unit'}
                          </dd>
                        ) : (
                          <dd className="text-slate-600 text-right">Pemesanan B2B / Konfirmasi</dd>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between gap-2 tabular-nums">
                        <dt className="shrink-0">Referensi Harga</dt>
                        <dd className="text-slate-800 font-semibold text-right truncate">
                          {p.hargaTayang || 'Sesuai Daftar Harga Resmi'}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setProdukDetail(p)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        Spesifikasi
                      </button>
                      <button
                        type="button"
                        onClick={() => tanganiTambahRfq(p, 1)}
                        className={`flex-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          diRfq
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-teal-600 text-white hover:bg-teal-700 border border-teal-600'
                        }`}
                      >
                        {diRfq ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Di RFQ ({diRfq.jumlah})
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            Tambah RFQ
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Baris Aksi Bawah pada Beranda */}
        {modeRingkas && semua.length > daftarTampil.length && (
          <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Butuh mencari tipe spesifikasi, merek prinsipal, atau status stok gudang lainnya?
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Buka halaman katalog penuh untuk memfilter {semua.length} produk, melihat tabel spesifikasi pengadaan, dan menyusun daftar permintaan penawaran (RFQ).
              </p>
            </div>
            <button
              type="button"
              onClick={() => ke('produk', kategori === 'Semua' ? undefined : kategori)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
            >
              Buka Katalog Lengkap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bar Ringkasan Daftar Permintaan Penawaran (RFQ) */}
        {daftarRfq.length > 0 && (
          <div className="mt-6 sticky bottom-4 z-30">
            <div className="bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs tabular-nums shrink-0">
                    {daftarRfq.length}
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      Daftar Permintaan Penawaran (RFQ) ·{' '}
                      <span className="tabular-nums text-teal-300">{totalUnitRfq} item/unit</span>
                    </p>
                    <p className="text-2xs text-slate-300">
                      Produk terpilih akan otomatis dimuat ke formulir penawaran resmi tim komersial & PJT.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setPanelRfqTerbuka((b) => !b)}
                    className="whitespace-nowrap px-3 py-2 rounded-full border border-slate-600 hover:bg-slate-800 text-xs font-semibold text-slate-200 cursor-pointer"
                  >
                    {panelRfqTerbuka ? 'Tutup Rincian' : 'Rincian Item'}
                  </button>
                  <button
                    type="button"
                    onClick={() => ke('kontak')}
                    className="inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Lanjut Ajukan Penawaran
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {panelRfqTerbuka && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 max-h-56 overflow-y-auto">
                  {daftarRfq.map((item) => (
                    <div
                      key={item.produkId}
                      className="flex flex-wrap items-center justify-between gap-2 bg-slate-800/80 rounded-xl px-3 py-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white truncate">{item.nama}</p>
                        <p className="text-2xs text-slate-400 font-mono truncate">
                          {item.tipeModel} · {item.produsen}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {onUbahJumlahRfq && (
                          <div className="inline-flex items-center rounded-lg border border-slate-600 bg-slate-900">
                            <button
                              type="button"
                              onClick={() => onUbahJumlahRfq(item.produkId, Math.max(1, item.jumlah - 1))}
                              aria-label="Kurangi jumlah"
                              className="p-1.5 text-slate-300 hover:text-white cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold tabular-nums text-white">
                              {item.jumlah} {item.satuan}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUbahJumlahRfq(item.produkId, item.jumlah + 1)}
                              aria-label="Tambah jumlah"
                              className="p-1.5 text-slate-300 hover:text-white cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {onHapusRfq && (
                          <button
                            type="button"
                            onClick={() => onHapusRfq(item.produkId)}
                            aria-label={`Hapus ${item.nama} dari daftar penawaran`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-slate-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail Spesifikasi & Kepatuhan Alat Kesehatan */}
      {produkDetail && (() => {
        const produkSegar = semua.find((p) => p.id === produkDetail.id) ?? produkDetail;
        return (
          <ModalDetailProduk
            produk={produkSegar}
            cfg={cfg}
            jumlahRfqSaatIni={petaRfq.get(produkSegar.id)?.jumlah}
            onTutup={() => setProdukDetail(null)}
            onTambahRfq={(jumlah) => {
              tanganiTambahRfq(produkSegar, jumlah);
            }}
            onAjukanLangsung={(jumlah) => {
              setProdukDetail(null);
              tanganiPenawaranLangsung(produkSegar, jumlah);
            }}
          />
        );
      })()}
    </section>
  );
}

function ModalDetailProduk({
  produk,
  cfg,
  jumlahRfqSaatIni,
  onTutup,
  onTambahRfq,
  onAjukanLangsung
}: {
  produk: ProdukWebsite;
  cfg: KonfigurasiSitus;
  jumlahRfqSaatIni?: number;
  onTutup: () => void;
  onTambahRfq: (jumlah: number) => void;
  onAjukanLangsung: (jumlah: number) => void;
}) {
  const [jumlah, setJumlah] = useState<number>(jumlahRfqSaatIni ?? 1);
  const [ditambahkan, setDitambahkan] = useState(false);
  const nieAda = adalahNieTerdaftar(produk.nomorIzinEdar);

  useEffect(() => {
    const padaKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onTutup();
    };
    window.addEventListener('keydown', padaKey);
    return () => window.removeEventListener('keydown', padaKey);
  }, [onTutup]);

  const simpanKeDaftar = () => {
    onTambahRfq(Math.max(1, jumlah));
    setDitambahkan(true);
    window.setTimeout(() => setDitambahkan(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-detail-produk"
      onClick={onTutup}
    >
      <div
        className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-teal-700">
              {produk.kategori}
              {produk.kategoriRegulasi ? ` · ${produk.kategoriRegulasi}` : ''}
              {produk.kelasRisiko && produk.kelasRisiko !== '-' ? ` · ${produk.kelasRisiko}` : ''}
            </p>
            <h3 id="judul-detail-produk" className="text-lg font-bold text-slate-900 mt-0.5 leading-snug">
              {produk.nama}
            </h3>
            <p className="text-xs font-mono text-slate-500 mt-0.5">Model / Tipe: {produk.tipeModel}</p>
          </div>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup detail produk"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Isi Modal */}
        <div className="p-5 sm:p-6 grid md:grid-cols-[0.9fr_1.1fr] gap-6">
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <VisualProduk produk={produk} cfg={cfg} tinggiKelas="h-56" />
            </div>

            {/* Kotak Legalitas & Distribusi CDAKB */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <BadgeCheck className="w-4 h-4 text-teal-600 shrink-0" />
                Informasi Kepatuhan & Distribusi
              </div>
              <dl className="space-y-1.5 text-2xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Nomor Izin Edar</dt>
                  <dd className="font-mono font-semibold text-slate-800 text-right">
                    {nieAda ? produk.nomorIzinEdar : 'Terdaftar pada Register RA'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Status Registrasi</dt>
                  <dd
                    className={`font-semibold text-right ${
                      produk.statusIzinEdar === 'Aktif'
                        ? 'text-emerald-700'
                        : produk.statusIzinEdar === 'Verifikasi Register RA'
                          ? 'text-teal-700'
                          : 'text-amber-700'
                    }`}
                  >
                    {produk.statusIzinEdar}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Produsen / Prinsipal</dt>
                  <dd className="text-slate-800 font-semibold text-right">{produk.produsen}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Negara Asal</dt>
                  <dd className="text-slate-700 text-right">{produk.negaraAsal}</dd>
                </div>
                {produk.zonaSuhu && (
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Zona Penyimpanan</dt>
                    <dd className="text-slate-700 text-right">{produk.zonaSuhu}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-2 tabular-nums">
                  <dt className="text-slate-500">Stok Bebas Gudang</dt>
                  <dd className="font-semibold text-slate-800 text-right">
                    {produk.statusIzinEdar === 'Perpanjangan' || produk.statusIzinEdar === 'Kedaluwarsa'
                      ? 'Ditahan selama perpanjangan NIE'
                      : typeof produk.stokTersedia === 'number' && produk.stokTersedia > 0
                        ? `${produk.stokTersedia} ${produk.satuan || 'Unit'} (Alokasi FEFO)`
                        : 'Sesuai jadwal PO / Inden'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Berkas Pendukung */}
            <div className="space-y-2">
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-500">Dokumen & Sumber Daya</p>
              <div className="flex flex-wrap gap-2">
                {adalahUrlEksternal(produk.tautanBrosur) ? (
                  <a
                    href={produk.tautanBrosur}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-teal-700"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Buka Katalog / Brosur
                  </a>
                ) : produk.tautanBrosur ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-2xs text-slate-600">
                    <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    Brosur teknis dilampirkan bersama penawaran resmi
                  </span>
                ) : null}

                {adalahUrlEksternal(produk.tautanVideo) && (
                  <a
                    href={produk.tautanVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    <ClipboardList className="w-3.5 h-3.5" />
                    Video Demonstrasi
                  </a>
                )}

                <a
                  href={IDENTITAS_RUJUKAN.tautanDaftarHarga}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Daftar Harga REMEDI
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="bg-teal-50/60 border border-teal-200 rounded-xl px-4 py-3">
              <p className="text-2xs font-bold uppercase tracking-wider text-teal-800">Referensi Harga & Pengadaan</p>
              <p className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
                {produk.hargaTayang || 'Sesuai Daftar Harga Resmi / Kontrak'}
              </p>
              <p className="text-2xs text-slate-600 mt-1">
                Melayani pengadaan RS Pemerintah & Swasta melalui e-Katalog LKPP, LPSE, maupun Purchase Order B2B.
              </p>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Spesifikasi Teknis</h4>
              <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">{produk.spesifikasi}</p>
            </div>

            {produk.poinJual && produk.poinJual.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Keunggulan Utama</h4>
                <ul className="mt-2 space-y-1.5">
                  {produk.poinJual.map((poin) => (
                    <li key={poin} className="text-xs text-slate-700 flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span>{poin}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {produk.tanyaJawabTeknis && produk.tanyaJawabTeknis.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tanya Jawab Teknis</h4>
                <div className="mt-2 space-y-2.5">
                  {produk.tanyaJawabTeknis.map((tj) => (
                    <div key={tj.pertanyaan} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-slate-800">{tj.pertanyaan}</p>
                      <p className="text-2xs text-slate-600 mt-1 leading-relaxed">{tj.jawaban}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bar Permintaan Penawaran (RFQ) */}
            <div className="mt-auto pt-5 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <span>Estimasi Kebutuhan:</span>
                  <span className="inline-flex items-center rounded-xl border border-slate-300 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setJumlah((j) => Math.max(1, j - 1))}
                      aria-label="Kurangi jumlah unit"
                      className="p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={jumlah}
                      onChange={(e) => setJumlah(Math.max(1, Number(e.target.value) || 1))}
                      aria-label="Jumlah unit"
                      className="w-14 text-center bg-transparent text-xs font-bold text-slate-900 tabular-nums outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setJumlah((j) => j + 1)}
                      aria-label="Tambah jumlah unit"
                      className="p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </span>
                  <span className="text-slate-500">{produk.satuan || 'Unit'}</span>
                </label>
              </div>

              <div className="mt-3 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={simpanKeDaftar}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2.5 rounded-full border border-teal-600 text-teal-700 hover:bg-teal-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  {ditambahkan ? (
                    <>
                      <Check className="w-4 h-4" />
                      Tersimpan di Daftar RFQ
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Masukkan ke Daftar RFQ
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => onAjukanLangsung(Math.max(1, jumlah))}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Handshake className="w-4 h-4" />
                  Ajukan Penawaran Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
