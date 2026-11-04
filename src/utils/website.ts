/**
 * WEBSITE (CMS) — lapisan konten situs publik.
 *
 * Isi default diambil dari situs resmi perusahaan (lihat data/websiteRujukan.ts).
 * Bagian yang tidak dipublikasikan pada situs rujukan dihitung dari koleksi AMS
 * (register izin edar, sertifikat, pemasok, pelanggan, kampanye, teritorial, stok,
 * skema harga). Prinsipnya sama: tidak ada angka yang dikarang — medan yang tidak
 * tersedia pada sumber diisi '-'.
 *
 * Gambar disimpan di luar konfigurasi (key terpisah) agar draf situs tidak cepat
 * menghabiskan kuota localStorage — pola yang sama dipakai dashboard website bejo-pos.
 */
import {
  GaransiInstalasi,
  IzinEdarAlkes,
  ItemWebsite,
  KampanyeAlkes,
  KonfigurasiSitus,
  PelangganB2B,
  PemasokAlkes,
  PengetahuanProdukAlkes,
  ProgramRebate,
  SeksiDaftar,
  SkemaHargaAlkes,
  SertifikatPerusahaan,
  StokGudang,
  TeritorialPenjualan,
  TautanWebsite
} from '../types';
import {
  GRUP_KATALOG,
  IDENTITAS_RUJUKAN,
  KONTEN_RUJUKAN,
  PARAGRAF_TENTANG
} from '../data/websiteRujukan';

/** Identitas resmi perusahaan — kontak sesuai situs resmi remediams.com. */
export const IDENTITAS_PERUSAHAAN = {
  nama: IDENTITAS_RUJUKAN.nama,
  alamat: IDENTITAS_RUJUKAN.alamat,
  telepon: IDENTITAS_RUJUKAN.telepon,
  email: IDENTITAS_RUJUKAN.email
};

export const WEBSITE_MEDIA_KEY = 'ams_alkes_website_media_v1';

/**
 * Naikkan setiap kali konten bawaan (rujukan situs resmi) berganti. Draf yang tersimpan pada
 * perangkat dengan versi lebih lama dibangun ulang dari konten bawaan terbaru — suntingan
 * terkunci dan item buatan tangan tetap dipertahankan.
 */
export const VERSI_KONTEN_WEBSITE = 2;

/** Kunci kategori izin edar untuk tautan filter katalog produk. */
export const KUNCI_KATEGORI: Record<IzinEdarAlkes['kategori'], string> = {
  'Elektromedik Radiasi': 'elektromedik-radiasi',
  'Elektromedik Non Radiasi': 'elektromedik-non-radiasi',
  'Non Elektromedik Steril': 'non-elektromedik-steril',
  'Non Elektromedik Non Steril': 'non-elektromedik-non-steril',
  'Diagnostik In Vitro': 'diagnostik-in-vitro'
};

export function slugifyWebsite(nilai: string): string {
  return String(nilai || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Data mentah yang dibaca pembangun konten. Diterima sebagai argumen agar util ini
 *  tidak mengimpor layanan db (db yang mengimpor util ini, bukan sebaliknya). */
export interface SumberKontenWebsite {
  izinEdar: IzinEdarAlkes[];
  sertifikat: SertifikatPerusahaan[];
  pemasok: PemasokAlkes[];
  pelanggan: PelangganB2B[];
  kampanye: KampanyeAlkes[];
  teritorial: TeritorialPenjualan[];
  stok: StokGudang[];
  pengetahuanProduk: PengetahuanProdukAlkes[];
  skemaHarga: SkemaHargaAlkes[];
  rebate: ProgramRebate[];
  garansi: GaransiInstalasi[];
}

/* -------------------------------------------------------------------------- */
/*  Bagian dinamis — semuanya turunan koleksi aplikasi                         */
/* -------------------------------------------------------------------------- */

/** Kartu produk: register izin edar digabung brosur digital dan sisa stok FEFO. */
export function bangunProduk(
  sumber: Pick<SumberKontenWebsite, 'izinEdar' | 'pengetahuanProduk' | 'stok'>
) {
  return sumber.izinEdar.map((ie) => {
    const brosur = sumber.pengetahuanProduk.find((p) => p.nomorIzinEdar === ie.nomorIzinEdar);
    const unitStok = sumber.stok
      .filter((s) => s.nomorIzinEdar === ie.nomorIzinEdar && s.statusFEFO !== 'Kedaluwarsa')
      .reduce((total, s) => total + s.jumlahStok, 0);
    return {
      id: `produk-${ie.id}`,
      sumberId: ie.id,
      isActive: true,
      nama: ie.namaAlkes,
      tipeModel: ie.tipeModel,
      kategori: ie.kategori,
      kelasRisiko: ie.kelasRisiko,
      nomorIzinEdar: ie.nomorIzinEdar,
      statusIzinEdar: ie.status,
      produsen: ie.produsen,
      negaraAsal: ie.negaraAsal,
      spesifikasi: brosur?.spesifikasiRingkas ?? ie.keterangan,
      poinJual: brosur?.poinJual ?? [],
      tautanBrosur: brosur?.tautanBrosur,
      tautanVideo: brosur?.tautanVideoDemo,
      stokTersedia: unitStok > 0 ? unitStok : undefined,
      satuan: sumber.stok.find((s) => s.nomorIzinEdar === ie.nomorIzinEdar)?.satuan,
      badge: ie.status === 'Aktif' ? 'Izin Edar Aktif' : `Izin Edar ${ie.status}`
    };
  });
}

/** Strip kepercayaan: nomor sertifikat perusahaan beserta masa berlakunya. */
export function bangunKepercayaan(sumber: Pick<SumberKontenWebsite, 'sertifikat'>) {
  return sumber.sertifikat.map((s) => ({
    id: `lencana-${s.id}`,
    sumberId: s.id,
    isActive: true,
    teks: s.jenis.replace(/\s*\(.*\)$/, ''),
    keterangan: `No. ${s.nomorSertifikat} • berlaku hingga ${s.tanggalHabis}`
  }));
}

/** Kartu solusi per kategori izin edar, jumlahnya dihitung dari register. */
export function bangunSolusi(sumber: Pick<SumberKontenWebsite, 'izinEdar'>) {
  const kategori = Array.from(new Set(sumber.izinEdar.map((ie) => ie.kategori)));
  return kategori.map((k) => {
    const daftar = sumber.izinEdar.filter((ie) => ie.kategori === k);
    return {
      id: `solusi-${KUNCI_KATEGORI[k] ?? slugifyWebsite(k)}`,
      sumberId: k,
      isActive: true,
      judul: k,
      deskripsi:
        daftar.length === 1
          ? `Terdaftar pada register izin edar: ${daftar[0].namaAlkes}.`
          : `${daftar.length} produk terdaftar pada register izin edar, antara lain ${daftar
              .slice(0, 2)
              .map((d) => d.namaAlkes)
              .join(', ')}.`,
      kategoriKey: KUNCI_KATEGORI[k] ?? slugifyWebsite(k),
      jumlahProduk: daftar.length
    };
  });
}

/** Merek/prinsipal yang hanya tampil bila lolos audit mutu pemasok. */
export function bangunMerek(sumber: Pick<SumberKontenWebsite, 'pemasok'>) {
  return sumber.pemasok
    .filter((p) => p.statusAuditMutu === 'Terkualifikasi')
    .map((p) => ({
      id: `merek-${p.id}`,
      sumberId: p.id,
      isActive: true,
      nama: p.namaPemasok,
      kategori: p.kategori,
      negara: p.negara,
      keterangan: `Skor evaluasi mutu ${p.skorEvaluasi}/100 (audit ${p.tanggalEvaluasiTerakhir})`
    }));
}

/** Institusi yang dilayani, dikelompokkan dari profil pelanggan B2B aktif. */
export function bangunInstitusi(sumber: Pick<SumberKontenWebsite, 'pelanggan'>) {
  const tipe = Array.from(new Set(sumber.pelanggan.filter((p) => p.statusPelanggan === 'Aktif').map((p) => p.tipeFasyankes)));
  return tipe.map((t) => {
    const daftar = sumber.pelanggan.filter((p) => p.statusPelanggan === 'Aktif' && p.tipeFasyankes === t);
    return {
      id: `institusi-${slugifyWebsite(t)}`,
      sumberId: t,
      isActive: true,
      nama: t,
      deskripsi: `Instansi bertipe ${t} yang terpelihara pada basis data pelanggan B2B, lengkap dengan verifikasi izin operasional dan akreditasi.`,
      jumlahPelanggan: daftar.length,
      contoh: daftar.slice(0, 2).map((d) => d.namaInstalasi).join(' • ')
    };
  });
}

/** Statistik: hanya angka yang dapat ditelusuri ke koleksi aplikasi. */
export function bangunStatistik(sumber: SumberKontenWebsite) {
  const izinAktif = sumber.izinEdar.filter((ie) => ie.status === 'Aktif').length;
  const provinsi = new Set(sumber.teritorial.flatMap((t) => t.provinsiDilayani));
  const pelangganAktif = sumber.pelanggan.filter((p) => p.statusPelanggan === 'Aktif').length;
  const pemasokTerkualifikasi = sumber.pemasok.filter((p) => p.statusAuditMutu === 'Terkualifikasi').length;
  const sertifikatValid = sumber.sertifikat.filter((s) => s.status !== 'Perpanjangan').length;
  return [
    {
      id: 'stat-izin-edar',
      sumberId: 'izin-edar',
      isActive: true,
      nilai: String(izinAktif),
      label: 'Izin Edar Aktif',
      keterangan: 'Produk ber-NIE Kemenkes RI status Aktif pada register RA & PJT'
    },
    {
      id: 'stat-fasyankes',
      sumberId: 'pelanggan',
      isActive: true,
      nilai: String(pelangganAktif),
      label: 'Fasyankes Mitra',
      keterangan: 'Instansi berstatus aktif pada profil pelanggan B2B'
    },
    {
      id: 'stat-provinsi',
      sumberId: 'teritorial',
      isActive: true,
      nilai: String(provinsi.size),
      label: 'Provinsi Terlayani',
      keterangan: 'Cakupan rayon distribusi pada mapping area penjualan'
    },
    {
      id: 'stat-merek',
      sumberId: 'pemasok',
      isActive: true,
      nilai: String(pemasokTerkualifikasi),
      label: 'Prinsipal Terkualifikasi',
      keterangan: 'Pemasok dengan status audit mutu Terkualifikasi'
    },
    {
      id: 'stat-sertifikat',
      sumberId: 'sertifikat',
      isActive: true,
      nilai: String(sertifikatValid),
      label: 'Sertifikat Perusahaan',
      keterangan: 'SDAK, CPAKB, dan ISO 13485:2016 yang masih berlaku'
    }
  ];
}

const LANGKAH_PERJALANAN: { judul: string; deskripsi: string }[] = [
  {
    judul: 'Konsultasi & Pemetaan Kebutuhan',
    deskripsi: 'Medical representative rayon memetakan kebutuhan alat kesehatan beserta anggaran dan spesifikasi teknis instansi.'
  },
  {
    judul: 'Verifikasi Kepatuhan oleh PJT',
    deskripsi: 'Penanggung Jawab Teknis memvalidasi nomor izin edar Kemenkes RI dan kesesuaian klaim promosi sebelum penawaran diterbitkan.'
  },
  {
    judul: 'Penawaran, e-Katalog & Tender',
    deskripsi: 'Pesanan masuk melalui e-Katalog LKPP, LPSE, atau kontrak harga dengan penguncian periode dan Top of Payment.'
  },
  {
    judul: 'Pengiriman FEFO & Cold Chain',
    deskripsi: 'Gudang mengalokasikan bets closest-expiry-first dengan pemantauan suhu cold room 2°C–8°C hingga surat jalan CDAKB.'
  },
  {
    judul: 'Instalasi, Uji Fungsi & Pelatihan',
    deskripsi: 'Teknisi elektromedik tersertifikasi memasang alat, menguji parameter klinis, dan menerbitkan berita acara serah terima.'
  },
  {
    judul: 'Kalibrasi & Pemeliharaan Berkala',
    deskripsi: 'Jadwal pemeliharaan preventif dan kalibrasi BPFK dipantau per nomor seri unit beserta masa garansi.'
  },
  {
    judul: 'Post-Market Surveillance',
    deskripsi: 'Keluhan, kejadian tidak diharapkan, dan penarikan bets dicatat pada modul vigilance untuk pelaporan ke Kemenkes RI.'
  }
];

export function bangunPerjalanan() {
  return LANGKAH_PERJALANAN.map((l, i) => ({
    id: `langkah-${i + 1}`,
    sumberId: `langkah-${i + 1}`,
    isActive: true,
    tahap: `Tahap ${i + 1}`,
    judul: l.judul,
    deskripsi: l.deskripsi
  }));
}

/** Kegiatan ilmiah: agenda yang belum selesai ditampilkan lebih dulu. */
export function bangunKegiatan(sumber: Pick<SumberKontenWebsite, 'kampanye'>): KampanyeWebsiteItem[] {
  const urutan: KampanyeAlkes['status'][] = ['Berjalan', 'Rencana', 'Selesai'];
  const tersusun = [...sumber.kampanye].sort(
    (a, b) => urutan.indexOf(a.status) - urutan.indexOf(b.status) || a.tanggalMulai.localeCompare(b.tanggalMulai)
  );
  return tersusun.map((k) => ({
    id: `kegiatan-${k.id}`,
    sumberId: k.id,
    isActive: true,
    judul: k.namaKegiatan,
    jenis: k.jenisKegiatan,
    lokasi: k.lokasi,
    tanggalMulai: k.tanggalMulai,
    tanggalSelesai: k.tanggalSelesai,
    deskripsi: `Penanggung jawab kegiatan: ${k.penanggungJawab}.`,
    status: k.status
  }));
}

/** Promo dari skema harga aktif: potongan dihitung dari tabel diskon kuantitas. */
export function bangunPromo(sumber: Pick<SumberKontenWebsite, 'skemaHarga' | 'rebate'>) {
  const promo = sumber.skemaHarga
    .filter((s) => s.status === 'Aktif')
    .map((s) => {
      const diskonTerbesar = s.potonganKuantitas.reduce(
        (maks, p) => Math.max(maks, p.diskonPersen),
        0
      );
      const ambang = s.potonganKuantitas.find((p) => p.diskonPersen === diskonTerbesar);
      const potongan =
        diskonTerbesar > 0
          ? `Hemat hingga ${diskonTerbesar}% untuk pembelian mulai ${ambang?.ambangMinUnit ?? 0} unit`
          : s.bonusUnit > 0
            ? `Bonus ${s.bonusUnit} unit per pembelian paket`
            : 'Harga skema aktif';
      return {
        id: `promo-${s.id}`,
        sumberId: s.id,
        isActive: true,
        judul: s.namaSkema,
        deskripsi: `${s.level} untuk ${s.pelangganTarget === 'Semua' ? 'seluruh pelanggan terdaftar' : 'pelanggan dengan kontrak aktif'}.`,
        namaAlkes: s.namaAlkes,
        potongan,
        periode: 'Skema harga aktif',
        badge: s.level
      };
    });

  const rebateAktif = sumber.rebate
    .filter((r) => r.statusPembayaran !== 'Terbayar')
    .map((r) => ({
      id: `promo-rebate-${r.id}`,
      sumberId: r.id,
      isActive: true,
      judul: `${r.namaProgram} (${r.periode})`,
      deskripsi: `Program volume mitra dengan target ${r.targetVolumeUnit} unit; rebate ${r.persenRebate}% dibayarkan setelah realisasi diverifikasi.`,
      potongan: `Rebate ${r.persenRebate}%`,
      periode: r.periode,
      badge: 'Program Mitra'
    }));

  return [...promo, ...rebateAktif];
}

/** FAQ berjawaban faktual: angka jawaban dihitung dari data, bukan diasumsikan. */
export function bangunFaq(sumber: SumberKontenWebsite) {
  const izinAktif = sumber.izinEdar.filter((ie) => ie.status === 'Aktif').length;
  const zonaSuhu = Array.from(new Set(sumber.stok.map((s) => s.zonaSuhu)));
  const masaGaransi = Array.from(new Set(sumber.garansi.map((g) => g.masaGaransiBulan))).sort((a, b) => a - b);
  return [
    {
      id: 'faq-izin-edar',
      sumberId: 'faq-izin-edar',
      isActive: true,
      pertanyaan: 'Apakah seluruh produk yang dijual memiliki izin edar Kemenkes RI?',
      jawaban: `Ya. Setiap produk dicatat pada register Regulatory Affairs & PJT dengan nomor izin edar berformat "KEMENKES RI AKL/AKD" diikuti 11 digit. Saat ini ${izinAktif} izin edar berstatus Aktif, dan penjualan ditolak otomatis bila nomor tidak terdaftar atau telah kedaluwarsa.`
    },
    {
      id: 'faq-e-katalog',
      sumberId: 'faq-e-katalog',
      isActive: true,
      pertanyaan: 'Bagaimana mekanisme pembelian untuk rumah sakit pemerintah?',
      jawaban: 'Pembelian rumah sakit pemerintah dilakukan melalui e-Katalog LKPP dan tata cara pengadaan LPSE. Harga terkunci dalam kontrak harga per periode, dan penagihan mengikuti Terms of Payment yang disepakati.'
    },
    {
      id: 'faq-cold-chain',
      sumberId: 'faq-cold-chain',
      isActive: true,
      pertanyaan: 'Apakah reagen diagnostik dikirim dengan rantai dingin?',
      jawaban: `Ya. Penyimpanan dan angkutan mengikuti zona suhu terdaftar pada kartu stok: ${zonaSuhu.join(', ')}. Setiap pengiriman memakai alokasi closest-expiry-first dan surat jalan comply CDAKB.`,
    },
    {
      id: 'faq-purna-jual',
      sumberId: 'faq-purna-jual',
      isActive: true,
      pertanyaan: 'Layanan purna jual apa saja yang disediakan?',
      jawaban: `Instalasi dan uji fungsi, kalibrasi berkala, pemeliharaan preventif, serta perbaikan kerusakan dikerjakan teknisi elektromedik dengan sertifikat kalibrasi. Garansi unit yang terpasang pada catatan instalasi berjalan ${masaGaransi.join(' / ') || 'sesuai kontrak'} bulan sejak berita acara instalasi.`
    },
    {
      id: 'faq-keluhan',
      sumberId: 'faq-keluhan',
      isActive: true,
      pertanyaan: 'Bagaimana pelaporan keluhan atau kejadian tidak diharapkan?',
      jawaban: 'Keluhan dan kejadian tidak diharapkan (KTD) dicatat pada modul Post-Market Surveillance, ditindaklanjuti CAPA, dan dilaporkan ke Kemenkes RI sesuai tenggat vigilance termasuk penarikan bets bila diperlukan.'
    }
  ];
}

/** Kantor: pusat dari kop dokumen, rayon dari mapping area penjualan. */
export function bangunKantor(sumber: Pick<SumberKontenWebsite, 'teritorial'>) {
  const pusat = {
    id: 'kantor-pusat',
    sumberId: 'kantor-pusat',
    isActive: true,
    nama: 'Kantor Pusat & Gudang Distribusi',
    alamat: IDENTITAS_PERUSAHAAN.alamat,
    telepon: IDENTITAS_PERUSAHAAN.telepon,
    email: IDENTITAS_PERUSAHAAN.email,
    penanggungJawab: 'Penanggung Jawab Teknis (PJT)'
  };
  const rayon = sumber.teritorial.map((t) => ({
    id: `kantor-${t.id}`,
    sumberId: t.id,
    isActive: true,
    nama: t.namaRayon,
    alamat: `Rayon ${t.kodeRayon}`,
    penanggungJawab: `Medical Representative: ${t.medRep}`,
    provinsiDilayani: t.provinsiDilayani.join(', ')
  }));
  return [pusat, ...rayon];
}

/** Menu header: kelompok produk (mega) + halaman tunggal, meniru struktur advisains.id. */
function bangunMenu(_sumber: Pick<SumberKontenWebsite, 'izinEdar'>): KonfigurasiSitus['menu'] {
  return [
    {
      id: 'menu-produk',
      isActive: true,
      label: 'Produk',
      tipe: 'mega',
      kolom: [
        {
          id: 'menu-produk-kategori',
          judul: 'Berdasarkan Grup Katalog',
          tautan: GRUP_KATALOG.map((g) => ({
            id: `menu-kategori-${slugifyWebsite(g.label)}`,
            isActive: true,
            label: g.label,
            halaman: 'produk' as const,
            kategoriKey: g.label
          }))
        },
        {
          id: 'menu-produk-layanan',
          judul: 'Sumber Daya & Formulir',
          tautan: [
            { id: 'menu-tautan-brosur', isActive: true, label: 'Katalog & Daftar Harga', halaman: 'sumber-daya' as const },
            { id: 'menu-tautan-kalibrasi', isActive: true, label: 'Purchase Order & Kartu Garansi', halaman: 'sumber-daya' as const }
          ]
        }
      ]
    },
    { id: 'menu-solusi', isActive: true, label: 'Solusi', tipe: 'link', halaman: 'solusi' },
    { id: 'menu-layanan', isActive: true, label: 'Layanan', tipe: 'link', halaman: 'layanan' },
    { id: 'menu-sumber', isActive: true, label: 'Sumber Daya', tipe: 'link', halaman: 'sumber-daya' },
    { id: 'menu-tentang', isActive: true, label: 'Tentang Kami', tipe: 'link', halaman: 'tentang' },
    { id: 'menu-kontak', isActive: true, label: 'Kontak', tipe: 'link', halaman: 'kontak' }
  ];
}

/* -------------------------------------------------------------------------- */
/*  Konfigurasi default                                                        */
/* -------------------------------------------------------------------------- */

export function bangunKontenDefault(sumber: SumberKontenWebsite): KonfigurasiSitus {
  const sekarang = Date.now();
  const produk = KONTEN_RUJUKAN.produk;
  const solusi = KONTEN_RUJUKAN.solusi;
  const identitasRujukan = IDENTITAS_RUJUKAN;

  return {
    isPublished: false,
    lastModifiedAt: sekarang,
    lastModifiedBy: 'Belum pernah disimpan',

    identitas: {
      nama: IDENTITAS_PERUSAHAAN.nama,
      tagline: `${identitasRujukan.merekDagang} — ${identitasRujukan.tagline}`,
      logoUrl: '/site/logo-remedi-new-bw.png',
      faviconUrl: undefined,
      judulSitus: `${IDENTITAS_PERUSAHAAN.nama} (REMEDI) — Produsen, Agen & Distributor Alat Kesehatan`,
      metaDeskripsi:
        'PT Anugrah Mitra Selaras (REMEDI) berdiri sejak 1994: produsen, agen, dan distributor peralatan kesehatan, instrument set, serta barang habis pakai. Bersertifikat ISO 9001:2015, ISO 13485:2016, dan CDAKB Kementerian Kesehatan RI 2024-2029.'
    },

    header: {
      utamaTeks: 'Request for Quotation',
      utamaTautan: { tipe: 'halaman', nilai: 'kontak' },
      cadanganTeks: 'Hubungi Kami',
      cadanganTautan: { tipe: 'telepon', nilai: IDENTITAS_PERUSAHAAN.telepon },
      portalTeks: 'Toko Online',
      portalUrl: identitasRujukan.tautanToko
    },

    menu: bangunMenu(sumber),

    hero: {
      isActive: true,
      badge: 'Sejak 1994 • Produsen, Agen & Distributor Alat Kesehatan • ISO 9001:2015 • ISO 13485:2016',
      judul: 'Every Life Matters',
      subjudul:
        'Kami adalah produsen, agen, dan distributor produk peralatan kesehatan, instrument set, dan barang habis pakai untuk kebutuhan fasilitas pelayanan kesehatan di seluruh Indonesia — bermerek dagang Remedi dengan dukungan 15 merek prinsipal.',
      gambarUrl: '/site/banner-hero-remedi.jpg',
      teksCtaUtama: 'Request for Quotation',
      tautanCtaUtama: { tipe: 'halaman', nilai: 'kontak' },
      teksCtaCadangan: 'Lihat Katalog Produk',
      tautanCtaCadangan: { tipe: 'halaman', nilai: 'produk' }
    },

    slide: {
      isActive: false,
      kepala: {
        eyebrow: 'UNGGULAN',
        judul: 'Sorotan Produk & Kegiatan',
        subjudul: 'Banner berganti otomatis di bagian paling atas beranda.'
      },
      item: produk.slice(0, 3).map((p) => ({
        id: `slide-${p.sumberId}`,
        sumberId: p.sumberId,
        isActive: true,
        eyebrow: p.kategori,
        judul: p.nama,
        subjudul: p.spesifikasi,
        teksCta: 'Lihat Detail',
        tautan: { tipe: 'halaman', nilai: 'produk' } as TautanWebsite,
        imageUrl: undefined
      }))
    },

    kepercayaan: {
      isActive: true,
      kepala: { judul: 'Legalitas & Standar Mutu', subjudul: '' },
      item: KONTEN_RUJUKAN.kepercayaan
    },

    solusi: {
      isActive: true,
      kepala: {
        eyebrow: 'KATALOG',
        judul: 'Delapan Grup Katalog dari Disposable hingga X-Ray System',
        subjudul:
          'Setiap grup dipecah kembali menjadi lini produk sesuai struktur katalog pada situs resmi perusahaan.',
        teksTautan: 'Semua Solusi',
        tautan: { tipe: 'halaman', nilai: 'solusi' }
      },
      item: solusi
    },

    konsultasi: {
      isActive: true,
      kepala: {
        judul: 'Ajukan Penawaran untuk Kebutuhan Alat Kesehatan Anda',
        subjudul:
          'Mohon mengisi formulir, dan tuliskan pada kolom pesan jenis produk yang ingin Anda tanyakan.'
      },
      catatan:
        'Katalog, daftar harga, formulir purchase order, dan kartu garansi tersedia pada halaman Resources situs resmi REMEDI.',
      teksCta: 'Request for Quotation',
      tautan: { tipe: 'halaman', nilai: 'kontak' }
    },

    statistik: {
      isActive: true,
      kepala: {
        eyebrow: 'CAPAIAN',
        judul: 'Tiga Dekade Melayani Fasilitas Kesehatan Indonesia',
        subjudul: 'Angka berikut dikutip dari profil resmi perusahaan pada remediams.com.'
      },
      item: KONTEN_RUJUKAN.statistik
    },

    produk: {
      isActive: true,
      kepala: {
        eyebrow: 'KATALOG PRODUK',
        judul: 'Lini Produk yang Dipasarkan REMEDI',
        subjudul:
          'Nomor izin edar dan kelas risiko setiap unit tercatat pada register Regulatory Affairs & Penanggung Jawab Teknis internal, sehingga tidak ditayangkan di halaman ini. Harga yang tercantum adalah harga tayang katalog daring saat konten disalin.',
        teksTautan: 'Semua Produk',
        tautan: { tipe: 'halaman', nilai: 'produk' }
      },
      item: produk
    },

    merek: {
      isActive: true,
      kepala: {
        eyebrow: 'BRAND',
        judul: `${KONTEN_RUJUKAN.merek.length} Merek & Prinsipal yang Disalurkan REMEDI`,
        subjudul: 'Daftar merek berikut diambil langsung dari halaman Brand pada situs resmi perusahaan.',
        teksTautan: 'Semua Brand',
        tautan: { tipe: 'url', nilai: identitasRujukan.tautanMerek }
      },
      item: KONTEN_RUJUKAN.merek
    },

    perjalanan: {
      isActive: true,
      kepala: {
        eyebrow: 'ALUR LAYANAN',
        judul: 'Dari Permintaan Penawaran hingga Dokumen Purna Jual',
        subjudul: 'Empat tahap pelayanan distribusi yang dijalankan REMEDI bersama pelanggannya.'
      },
      item: KONTEN_RUJUKAN.perjalanan
    },

    institusi: {
      isActive: true,
      kepala: {
        eyebrow: 'PELANGGAN',
        judul: 'Lebih dari 400 Pelanggan, dari Aceh hingga Papua',
        subjudul: 'Segmen pelanggan dan contoh institusi dikutip dari halaman About AMS dan Customers.'
      },
      item: KONTEN_RUJUKAN.institusi
    },

    kegiatan: {
      isActive: false,
      kepala: {
        eyebrow: 'KEGIATAN',
        judul: 'Simposium, Workshop & Pameran Alkes',
        subjudul:
          'Berita dan kegiatan perusahaan ditayangkan pada seksi Berita & Sumber Daya; seksi ini dapat diaktifkan kembali saat agenda kampanye dirilis ke publik.',
        teksTautan: 'Semua Kegiatan',
        tautan: { tipe: 'halaman', nilai: 'sumber-daya' }
      },
      item: KONTEN_RUJUKAN.kegiatan
    },

    promo: {
      isActive: false,
      kepala: {
        eyebrow: 'PENAWARAN',
        judul: 'Promo & Skema Harga Pilihan',
        subjudul:
          'Situs resmi REMEDI menayangkan permintaan penawaran (Request for Quotation) dan daftar harga, bukan promo berkala.',
        teksTautan: 'Semua Penawaran',
        tautan: { tipe: 'halaman', nilai: 'produk' }
      },
      item: KONTEN_RUJUKAN.promo
    },

    artikel: {
      isActive: true,
      kepala: {
        eyebrow: 'BERITA & SUMBER DAYA',
        judul: 'Kabar Perusahaan dan Berkas Sumber Daya Resmi',
        subjudul:
          'Berita diambil dari halaman Events/Berita; katalog, daftar harga, purchase order, kartu garansi, dan sertifikat diambil dari halaman Resources pada situs resmi perusahaan.'
      },
      item: KONTEN_RUJUKAN.artikel
    },

    galeri: {
      isActive: true,
      kepala: {
        eyebrow: 'DOKUMENTASI',
        judul: 'Galeri Produk & Legalitas',
        subjudul: 'Dokumentasi visual yang tersedia pada halaman depan dan Resources situs resmi REMEDI.'
      },
      item: KONTEN_RUJUKAN.galeri
    },

    testimoni: {
      isActive: false,
      kepala: {
        eyebrow: 'TESTIMONI',
        judul: 'Kata Pelanggan Kami',
        subjudul: 'Ulasan dimuat setelah pelanggan memberikan izin tayang.'
      },
      item: []
    },

    faq: {
      isActive: true,
      kepala: {
        eyebrow: 'PERTANYAAN UMUM',
        judul: 'Hal yang Paling Sering Ditanyakan',
        subjudul: 'Seluruh jawaban dirujuk pada profil, katalog, dan halaman Resources resmi perusahaan.'
      },
      item: KONTEN_RUJUKAN.faq
    },

    tentang: {
      isActive: true,
      kepala: {
        eyebrow: 'TENTANG KAMI',
        judul: 'Profil, Visi, Misi, dan Basis Pelanggan REMEDI',
        subjudul: 'Disalin dari halaman About AMS dan Company Profile pada situs resmi perusahaan.'
      },
      paragraf: PARAGRAF_TENTANG,
      imageUrl: '/site/company-profile-ams-thumb.jpg',
      capaian: KONTEN_RUJUKAN.statistik
        .slice(0, 4)
        .map((s) => ({ nilai: s.nilai, label: s.label }))
    },

    kantor: {
      isActive: true,
      kepala: {
        eyebrow: 'JARINGAN',
        judul: 'Kantor Pusat & Fasilitas Produksi',
        subjudul: 'Kantor pemasaran di Sunter Agung, Jakarta Utara, dengan fasilitas produksi di Brebes, Sumedang, dan Zhangjiagang.'
      },
      item: KONTEN_RUJUKAN.kantor
    },

    kontak: {
      telepon: IDENTITAS_RUJUKAN.telepon,
      email: IDENTITAS_RUJUKAN.email,
      whatsapp: IDENTITAS_RUJUKAN.whatsapp,
      pesanPembukaWA: IDENTITAS_RUJUKAN.pesanWhatsapp,
      jamOperasional: '',
      alamatKantor: IDENTITAS_RUJUKAN.alamat,
      tautanPeta: IDENTITAS_RUJUKAN.tautanPeta
    },

    sosial: {
      isActive: true,
      kepala: { judul: 'Ikuti Kami', subjudul: '' },
      item: [
        {
          id: 'rujuk-sosial-twitter',
          sumberId: 'rujuk-sosial-twitter',
          isActive: true,
          label: 'Twitter',
          url: IDENTITAS_RUJUKAN.tautanTwitter
        },
        {
          id: 'rujuk-sosial-instagram',
          sumberId: 'rujuk-sosial-instagram',
          isActive: true,
          label: 'Instagram',
          url: IDENTITAS_RUJUKAN.tautanInstagram
        }
      ]
    },

    footerKolom: [
      {
        id: 'footer-navigasi',
        judul: 'Navigasi',
        tautan: [
          { id: 'footer-beranda', isActive: true, label: 'Beranda', halaman: 'beranda' },
          { id: 'footer-produk', isActive: true, label: 'Produk', halaman: 'produk' },
          { id: 'footer-solusi', isActive: true, label: 'Solusi', halaman: 'solusi' },
          { id: 'footer-layanan', isActive: true, label: 'Layanan', halaman: 'layanan' },
          { id: 'footer-kontak', isActive: true, label: 'Kontak', halaman: 'kontak' }
        ]
      },
      {
        id: 'footer-kepatuhan',
        judul: 'Kepatuhan',
        tautan: KONTEN_RUJUKAN.kepercayaan.map((l) => ({
          id: `footer-kepatuhan-${l.id}`,
          isActive: true,
          label: l.teks,
          halaman: 'tentang' as const
        }))
      },
      {
        id: 'footer-sumber',
        judul: 'Sumber Daya',
        tautan: [
          { id: 'footer-katalog', isActive: true, label: 'Katalog Produk', halaman: 'sumber-daya' },
          { id: 'footer-harga', isActive: true, label: 'Daftar Harga (Price List)', halaman: 'sumber-daya' },
          { id: 'footer-po', isActive: true, label: 'Purchase Order & Kartu Garansi', halaman: 'sumber-daya' },
          { id: 'footer-artikel', isActive: true, label: 'Berita & Artikel', halaman: 'sumber-daya' },
          { id: 'footer-faq', isActive: true, label: 'Pertanyaan Umum', halaman: 'sumber-daya' },
          { id: 'footer-tentang', isActive: true, label: 'Tentang Kami', halaman: 'tentang' }
        ]
      }
    ],

    footerCatatan: `© ${new Date().getFullYear()} ${IDENTITAS_PERUSAHAAN.nama} (REMEDI). Seluruh hak cipta dilindungi. Produsen, agen, dan distributor alat kesehatan sejak ${IDENTITAS_RUJUKAN.tahunBerdiri} — distribusi dijalankan sesuai Cara Distribusi Alat Kesehatan yang Baik (CDAKB) Kementerian Kesehatan RI.`
  };
}

type KampanyeWebsiteItem = KonfigurasiSitus['kegiatan']['item'][number];

/* -------------------------------------------------------------------------- */
/*  Sinkronisasi: perbarui bagian dinamis, lindungi suntingan manual           */
/* -------------------------------------------------------------------------- */

const padukanItem = <T extends ItemWebsite>(lama: T[], baru: T[]): T[] => {
  const indeks = new Map(lama.map((item) => [item.id, item]));
  const tergabung = baru.map((item) => {
    const sebelumnya = indeks.get(item.id);
    if (!sebelumnya) return item;
    if (sebelumnya.dikunci) return sebelumnya;
    return { ...item, isActive: sebelumnya.isActive };
  });
  // item buatan tangan (tanpa sumberId) tetap dipertahankan
  const manual = lama.filter((item) => !item.sumberId);
  return [...tergabung, ...manual];
};

function pasSeksi<T extends ItemWebsite>(seksiLama: SeksiDaftar<T>, itemBaru: T[]): SeksiDaftar<T> {
  return { ...seksiLama, item: padukanItem(seksiLama.item, itemBaru) };
}

/**
 * Perbarui bagian yang bersumber dari data aplikasi tanpa menghapus hasil suntingan:
 * judul seksi, teks manual, urutan, dan `isActive` tiap item dipertahankan.
 * Selama konten rujukan (remediams.com) masih dipakai, seksi tersebut di-refresh
 * dari konten rujukan; seksi tanpa padanan pada sumber tetap dihitung dari aplikasi.
 */
export function sinkronkanKonten(draf: KonfigurasiSitus, sumber: SumberKontenWebsite): KonfigurasiSitus {
  return {
    ...draf,
    kepercayaan: pasSeksi(draf.kepercayaan, KONTEN_RUJUKAN.kepercayaan),
    solusi: pasSeksi(draf.solusi, KONTEN_RUJUKAN.solusi),
    statistik: pasSeksi(draf.statistik, KONTEN_RUJUKAN.statistik),
    produk: pasSeksi(draf.produk, KONTEN_RUJUKAN.produk),
    merek: pasSeksi(draf.merek, KONTEN_RUJUKAN.merek),
    institusi: pasSeksi(draf.institusi, KONTEN_RUJUKAN.institusi),
    kegiatan: pasSeksi(draf.kegiatan, KONTEN_RUJUKAN.kegiatan.length ? KONTEN_RUJUKAN.kegiatan : bangunKegiatan(sumber)),
    promo: pasSeksi(draf.promo, KONTEN_RUJUKAN.promo.length ? KONTEN_RUJUKAN.promo : bangunPromo(sumber)),
    faq: pasSeksi(draf.faq, KONTEN_RUJUKAN.faq),
    kantor: pasSeksi(draf.kantor, KONTEN_RUJUKAN.kantor),
    lastModifiedAt: Date.now()
  };
}

const KUNCI_SEKSI_DAFTAR: (keyof KonfigurasiSitus)[] = [
  'slide',
  'kepercayaan',
  'solusi',
  'statistik',
  'produk',
  'merek',
  'perjalanan',
  'institusi',
  'kegiatan',
  'promo',
  'artikel',
  'galeri',
  'testimoni',
  'faq',
  'kantor',
  'sosial'
];

/**
 * Pindahkan draf lama ke konten bawaan terbaru tanpa menghapus hasil suntingan: judul seksi dan
 * medan non-daftar memakai konten baru, sedangkan item terkunci dan item buatan tangan dari draf
 * lama tetap ikut. Dipakai saat VERSI_KONTEN_WEBSITE naik.
 */
export function padukanKonten(lama: KonfigurasiSitus, baru: KonfigurasiSitus): KonfigurasiSitus {
  const hasil = { ...baru } as unknown as Record<string, SeksiDaftar<ItemWebsite>>;
  for (const kunci of KUNCI_SEKSI_DAFTAR) {
    const seksiBaru = hasil[kunci];
    const seksiLama = (lama as unknown as Record<string, SeksiDaftar<ItemWebsite> | undefined>)[kunci];
    if (!seksiBaru || !Array.isArray(seksiBaru.item)) continue;
    hasil[kunci] = { ...seksiBaru, item: padukanItem(seksiLama?.item ?? [], seksiBaru.item) };
  }
  return hasil as unknown as KonfigurasiSitus;
}

/* -------------------------------------------------------------------------- */
/*  Diff untuk audit trail (Old Value / New Value)                             */
/* -------------------------------------------------------------------------- */

export interface JejakPerubahanWebsite {
  kolom: string;
  nilaiLama: string;
  nilaiBaru: string;
}

const tampilNilai = (nilai: unknown): string => {
  if (nilai === undefined || nilai === null || nilai === '') return '-';
  if (typeof nilai === 'object') return JSON.stringify(nilai);
  return String(nilai);
};

const adalahDaftarItem = (nilai: unknown): nilai is ItemWebsite[] =>
  Array.isArray(nilai) && nilai.every((e) => e !== null && typeof e === 'object' && 'id' in (e as object));

const BATAS_JEJAK = 40;

function diffRekursif(lama: unknown, baru: unknown, jalur: string, hasil: JejakPerubahanWebsite[]) {
  if (hasil.length >= BATAS_JEJAK) return;
  if (adalahDaftarItem(lama) && adalahDaftarItem(baru)) {
    diffDaftarItem(lama, baru, jalur, hasil);
    return;
  }
  if (lama && baru && typeof lama === 'object' && typeof baru === 'object' && !Array.isArray(lama)) {
    const a = lama as Record<string, unknown>;
    const b = baru as Record<string, unknown>;
    for (const kunci of Array.from(new Set([...Object.keys(a), ...Object.keys(b)]))) {
      diffRekursif(a[kunci], b[kunci], jalur ? `${jalur}.${kunci}` : kunci, hasil);
      if (hasil.length >= BATAS_JEJAK) return;
    }
    return;
  }
  if (JSON.stringify(lama) !== JSON.stringify(baru)) {
    hasil.push({ kolom: jalur || 'konfigurasi', nilaiLama: tampilNilai(lama), nilaiBaru: tampilNilai(baru) });
  }
}

function diffDaftarItem(
  lama: ItemWebsite[],
  baru: ItemWebsite[],
  jalur: string,
  hasil: JejakPerubahanWebsite[]
) {
  const indeksLama = new Map(lama.map((i) => [i.id, i]));
  const indeksBaru = new Map(baru.map((i) => [i.id, i]));

  for (const item of baru) {
    const sebelumnya = indeksLama.get(item.id);
    if (!sebelumnya) {
      hasil.push({ kolom: `${jalur}[${item.id}]`, nilaiLama: 'tidak ada', nilaiBaru: labelItemWebsite(item) });
      continue;
    }
    const { id: _id, ...sisaLama } = sebelumnya;
    const { id: _iid, ...sisaBaru } = item;
    diffRekursif(sisaLama, sisaBaru, `${jalur}[${item.id}]`, hasil);
  }
  for (const item of lama) {
    if (!indeksBaru.has(item.id)) {
      hasil.push({ kolom: `${jalur}[${item.id}]`, nilaiLama: labelItemWebsite(item), nilaiBaru: 'dihapus' });
    }
  }
}

/** Teks penamaan item untuk baris audit; tiap tipe konten memakai medan yang berbeda. */
function labelItemWebsite(item: ItemWebsite): string {
  const kandidat = item as unknown as Record<string, unknown>;
  const teks = ['label', 'nama', 'judul', 'teks', 'pertanyaan']
    .map((k) => kandidat[k])
    .find((v) => typeof v === 'string' && v.length > 0);
  return teks ? String(teks) : item.id;
}

/** Jejak perubahan setingkat kolom untuk audit trail; dipangkas saat terlalu banyak. */
export function diffKonfigurasi(lama: KonfigurasiSitus, baru: KonfigurasiSitus): JejakPerubahanWebsite[] {
  const hasil: JejakPerubahanWebsite[] = [];
  const { lastModifiedAt: _la, lastPublishedAt: _lp, isPublished: _ip, ...sayaLama } = lama;
  const { lastModifiedAt: _nb, lastPublishedAt: _np, isPublished: _ipb, ...sayaBaru } = baru;
  diffRekursif(sayaLama, sayaBaru, '', hasil);
  if (hasil.length >= BATAS_JEJAK) {
    hasil.push({
      kolom: 'catatan',
      nilaiLama: `${lama.produk.item.length} produk / ${lama.kegiatan.item.length} kegiatan`,
      nilaiBaru: `${baru.produk.item.length} produk / ${baru.kegiatan.item.length} kegiatan (rincian dipotong)`
    });
  }
  return hasil;
}

/* -------------------------------------------------------------------------- */
/*  Tautan & gambar                                                            */
/* -------------------------------------------------------------------------- */

/** href sebuah tautan situs; halaman internal memakai query agar aman dipakai <a>. */
export function hrefTautan(tautan: TautanWebsite | undefined, kontak: KonfigurasiSitus['kontak']): string {
  if (!tautan) return '#';
  switch (tautan.tipe) {
    case 'whatsapp': {
      const nomor = (tautan.nilai || kontak.whatsapp || '').replace(/[^0-9]/g, '');
      if (!nomor) return '#';
      const pesan = encodeURIComponent(tautan.nilai && tautan.nilai !== kontak.whatsapp ? tautan.nilai : kontak.pesanPembukaWA);
      return `https://wa.me/${nomor}${pesan ? `?text=${pesan}` : ''}`;
    }
    case 'url':
      return tautan.nilai && /^https?:\/\//i.test(tautan.nilai) ? tautan.nilai : '#';
    case 'email':
      return `mailto:${tautan.nilai || kontak.email}`;
    case 'telepon':
      return `tel:${(tautan.nilai || kontak.telepon).replace(/[^+0-9]/g, '')}`;
    case 'halaman':
      return `?halaman=${encodeURIComponent(tautan.nilai || 'beranda')}`;
    default:
      return '#';
  }
}

export interface MediaWebsite {
  id: string;
  nama: string;
  dataUrl: string;
  ukuran: number;
}

export function daftarMediaWebsite(): MediaWebsite[] {
  try {
    const tersimpan = localStorage.getItem(WEBSITE_MEDIA_KEY);
    return tersimpan ? (JSON.parse(tersimpan) as MediaWebsite[]) : [];
  } catch {
    return [];
  }
}

/** Simpan gambar terkompresi di luar konfigurasi agar draf situs tidak membengkak. */
export function simpanMediaWebsite(media: MediaWebsite): MediaWebsite[] {
  const daftar = daftarMediaWebsite().filter((m) => m.id !== media.id);
  const baru = [media, ...daftar];
  try {
    localStorage.setItem(WEBSITE_MEDIA_KEY, JSON.stringify(baru));
  } catch {
    return daftar;
  }
  return baru;
}

/** Nilai gambar bisa berupa URL biasa atau rujukan `media:<id>` ke penyimpanan lokal. */
export function selesaikanGambar(referensi?: string): string | undefined {
  if (!referensi) return undefined;
  if (!referensi.startsWith('media:')) return referensi;
  const media = daftarMediaWebsite().find((m) => m.id === referensi.slice('media:'.length));
  return media?.dataUrl;
}

/** Kompres ke lebar maksimal agar muat di penyimpanan browser. */
export async function kompresGambarWebsite(file: File, lebarMaks = 1280, kualitas = 0.82): Promise<string> {
  const asal = await new Promise<string>((selesai, gagal) => {
    const pemb = new FileReader();
    pemb.onload = () => selesai(String(pemb.result));
    pemb.onerror = () => gagal(new Error('gagal membaca berkas'));
    pemb.readAsDataURL(file);
  });
  const gambar = await new Promise<HTMLImageElement>((selesai, gagal) => {
    const el = new Image();
    el.onload = () => selesai(el);
    el.onerror = () => gagal(new Error('gagal memuat gambar'));
    el.src = asal;
  });
  const skala = Math.min(1, lebarMaks / (gambar.naturalWidth || lebarMaks));
  const kanvas = document.createElement('canvas');
  kanvas.width = Math.max(1, Math.round((gambar.naturalWidth || lebarMaks) * skala));
  kanvas.height = Math.max(1, Math.round((gambar.naturalHeight || lebarMaks) * skala));
  const konteks = kanvas.getContext('2d');
  if (!konteks) return asal;
  konteks.drawImage(gambar, 0, 0, kanvas.width, kanvas.height);
  return kanvas.toDataURL('image/jpeg', kualitas);
}
