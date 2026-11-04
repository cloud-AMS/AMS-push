/**
 * Konten situs publik PT Anugrah Mitra Selaras (REMEDI) — dipindahkan dari situs
 * resmi perusahaan, https://www.remediams.com, pada 4 November 2026.
 *
 * Isi file ini murni DATA: teks, nama merek, grup katalog, alamat, dan tautan
 * sumber daya persis seperti yang ditayangkan situs rujukan. Tidak ada angka yang
 * dikarang — nomor izin edar, kelas risiko, dan harga yang tidak dipublikasikan
 * pada situs rujukan dibiarkan kosong ('-') agar dapat diverifikasi lewat
 * register Regulatory Affairs & Penanggung Jawab Teknis di aplikasi.
 *
 * Berkas aset (logo merek dan foto produk) tersimpan di public/brand dan
 * public/site sehingga situs terbit bersifat mandiri, tidak hotlink ke domain lain.
 */
import {
  ArtikelWebsite,
  FaqWebsite,
  InstitusiWebsite,
  KantorWebsite,
  KegiatanWebsite,
  LencanaKepercayaanWebsite,
  LangkahPerjalananWebsite,
  MerekWebsite,
  ProdukWebsite,
  PromoWebsite,
  SolusiWebsite,
  StatistikWebsite,
  GaleriWebsite
} from '../types';

/* -------------------------------------------------------------------------- */
/*  Identitas & tautan resmi                                                  */
/* -------------------------------------------------------------------------- */

export const IDENTITAS_RUJUKAN = {
  nama: 'PT Anugrah Mitra Selaras',
  namaLegalSitus: 'PT. Anugrahmitra Selaras',
  merekDagang: 'REMEDI',
  tagline: 'Every Life Matters',
  tahunBerdiri: '1994',
  alamat: 'Jl. Agung Niaga IV Blok G-4 No. 54, Sunter Agung, Jakarta Utara 14350',
  telepon: '(021) 640-6029',
  teleponSeluler: '081212282864',
  whatsapp: '6281212282864',
  pesanWhatsapp: 'Halo Remedi AMS',
  email: 'sales@remediams.com',
  tautanSitus: 'https://www.remediams.com',
  tautanPeta:
    'https://www.google.co.id/maps/?q=54+agung+niaga+iv%2c+sunter+agung%2c+jakarta+utara',
  tautanToko: 'https://www.remediams.com/store/',
  tautanTentang: 'https://www.remediams.com/about/about-ams/',
  tautanMerek: 'https://www.remediams.com/brand/',
  tautanPelanggan: 'https://www.remediams.com/customers/',
  tautanSertifikat: 'https://www.remediams.com/resources/certifications/',
  tautanFormulir: 'https://www.remediams.com/resources/forms/',
  tautanBerita: 'https://www.remediams.com/berita/',
  tautanKatalog: 'https://drive.google.com/file/d/1w2ATfJkJczNrtZn5Ajk4jpl9NGINB7fT/view?usp=drive_link',
  tautanDaftarHarga:
    'https://docs.google.com/spreadsheets/d/1cuo6d39fjD2-_b5plNgpyzInaSog3hpV/edit?usp=sharing&ouid=101573847339096922841&rtpof=true&sd=true',
  tautanPurchaseOrder: 'https://forms.gle/ZqUEPZ7PFrcri7QR9',
  tautanKartuGaransi: 'https://forms.gle/bGkbkdD3aJySbv266',
  tautanTwitter: 'https://twitter.com/remediams',
  tautanInstagram: 'https://www.instagram.com/remediams'
};

/** Delapan grup katalog pada menu Products situs rujukan. */
export const GRUP_KATALOG: { label: string; deskripsi: string }[] = [
  {
    label: 'Disposable',
    deskripsi:
      'Barang habis pakai: oxygen therapy (nebulizer mask, oxygen mask, nasal cannula), patient care (film dressing, gauze bandage, ID bracelet, orthoptic eye patch, plaster, tourniquet, umbilical cord clamp), respiratory, surgical wear, syringe–suture–needle, transfusion, dan urology.'
  },
  {
    label: 'General',
    deskripsi:
      'Peralatan umum rumah sakit: blood pressure monitor, gastric lavage machine, infrared thermometer, infusion pump, nebulizer, oxygen concentrator, patient monitor, suction unit, syringe pump, dan thermal ablation system.'
  },
  {
    label: 'Instrument',
    deskripsi:
      'Instrumen dan set bedah per spesialisasi: itemize (forceps, holder, scalpel, scissors, speculum), ENT, general instrument, neurology, obgyn, ophthalmology, orthopaedic, thorax & cardiovascular, dan urology instrument.'
  },
  {
    label: 'Laboratory',
    deskripsi:
      'Diagnostik laboratorium: blood glucose meter, blood lancet, chemistry analyzer, hematology analyzer, hemoglobin meter, micropipette, pharmacy refrigerator, dan urine analyzer.'
  },
  {
    label: 'Protective Equipment',
    deskripsi:
      'Alat pelindung diri: boots, examination glove, face mask (general, medical, respirator), face shield, google glass, hazmat coverall, shoe cover, dan surgical glove.'
  },
  {
    label: 'Vaccine Cooler & Syringe',
    deskripsi:
      'Rantai dingin vaksin dan spuit: auto-disable syringe, combi, freezer, refrigerator, dan transport box.'
  },
  {
    label: 'Vet',
    deskripsi:
      'Lini kedokteran hewan: chemistry analyzer vet, hematology analyzer vet, patient monitor vet, ultrasound vet, dan urine analyzer vet.'
  },
  {
    label: 'X-Ray System',
    deskripsi: 'Sistem sinar-x dengan pilihan instalasi mobile dan stationary.'
  }
];

type BarangKatalog = {
  nama: string;
  merek: string;
  grup: string;
  jalur: string;
  tipeModel?: string;
  harga?: string;
};

const BARANG_KATALOG: BarangKatalog[] = [
  {
    nama: '3M Orthoptic Eye Patch',
    merek: '3M',
    grup: 'Disposable',
    jalur: 'Disposable — Patient Care — Orthoptic Eye Patch',
    harga: 'Rp 62.493'
  },
  {
    nama: '3M Plaster Hypoallergenic',
    merek: '3M',
    grup: 'Disposable',
    jalur: 'Disposable — Patient Care — Plaster Hypoallergenic',
    harga: 'Rp 248.640'
  },
  {
    nama: 'Remedi Masker Medis (Face Mask Medical)',
    merek: 'Remedi',
    grup: 'Protective Equipment',
    jalur: 'Protective Equipment — Face Mask (medical)'
  },
  {
    nama: 'Remedi Iris Scissor',
    merek: 'Remedi',
    grup: 'Instrument',
    jalur: 'Instrument — @Itemize — Scissors'
  },
  {
    nama: 'Avner AutoDisable Syringe',
    merek: 'Avner',
    grup: 'Vaccine Cooler & Syringe',
    jalur: 'Vaccine Cooler & Syringe — AutoDisable Syringe',
    tipeModel: '0,5 mL',
    harga: 'Rp 99.900'
  },
  {
    nama: 'Avner Chemistry Analyzer',
    merek: 'Avner',
    grup: 'Laboratory',
    jalur: 'Laboratory — Chemistry Analyzer',
    tipeModel: '810'
  },
  {
    nama: 'Avner Hematology Analyzer',
    merek: 'Avner',
    grup: 'Laboratory',
    jalur: 'Laboratory — Hematology Analyzer',
    tipeModel: '3000Plus'
  },
  {
    nama: 'Avner Gastric Lavage Machine',
    merek: 'Avner',
    grup: 'General',
    jalur: 'General — Gastric Lavage Machine',
    tipeModel: 'SC-II'
  },
  {
    nama: 'Avner Chemistry Analyzer Vet',
    merek: 'Avner',
    grup: 'Vet',
    jalur: 'Vet — Chemistry Analyzer Vet',
    tipeModel: '880Vet'
  },
  {
    nama: 'Avner Hematology Analyzer Vet',
    merek: 'Avner',
    grup: 'Vet',
    jalur: 'Vet — Hematology Analyzer Vet',
    tipeModel: '2900Vet'
  },
  {
    nama: 'Avner Hematology Analyzer Vet',
    merek: 'Avner',
    grup: 'Vet',
    jalur: 'Vet — Hematology Analyzer Vet',
    tipeModel: '3000Vet'
  },
  {
    nama: 'AUCMA Deep Freezer',
    merek: 'AUCMA',
    grup: 'Vaccine Cooler & Syringe',
    jalur: 'Vaccine Cooler & Syringe — Freezer',
    tipeModel: '−40 °C s.d. −86 °C',
    harga: 'Rp 208.424.700'
  },
  {
    nama: 'AUCMA Freezer',
    merek: 'AUCMA',
    grup: 'Vaccine Cooler & Syringe',
    jalur: 'Vaccine Cooler & Syringe — Freezer',
    harga: 'Rp 20.146.500'
  },
  {
    nama: 'AUCMA Refrigerator',
    merek: 'AUCMA',
    grup: 'Vaccine Cooler & Syringe',
    jalur: 'Vaccine Cooler & Syringe — Refrigerator',
    tipeModel: '2 °C s.d. 8 °C',
    harga: 'Rp 85.603.200'
  }
];

const bangunBarangKatalog = (): ProdukWebsite[] =>
  BARANG_KATALOG.map((b, i) => ({
    id: `rujuk-produk-${i + 1}`,
    sumberId: `rujuk-produk-${i + 1}`,
    isActive: true,
    nama: b.nama,
    tipeModel: b.tipeModel ?? 'Tipe sesuai katalog merek',
    kategori: b.grup,
    kelasRisiko: '-',
    nomorIzinEdar: '-',
    statusIzinEdar: 'Verifikasi Register RA',
    produsen: b.merek,
    negaraAsal: 'Prinsipal REMEDI',
    spesifikasi: b.harga
      ? `${b.jalur}. Harga tayang pada katalog daring REMEDI saat konten ini disalin: ${b.harga}.`
      : `${b.jalur}. Harga mengikuti daftar harga (Price List) resmi perusahaan.`,
    poinJual: [`Grup katalog: ${b.grup}`],
    badge: 'Katalog REMEDI'
  }));

/* -------------------------------------------------------------------------- */
/*  Isi tiap seksi situs, sumber: remediams.com                                */
/* -------------------------------------------------------------------------- */

const kepercayaan: LencanaKepercayaanWebsite[] = [
  {
    id: 'rujuk-lencana-iso-9001',
    sumberId: 'rujuk-lencana-iso-9001',
    isActive: true,
    teks: 'ISO 9001:2015',
    keterangan: 'Standar internasional sistem manajemen mutu sebagai supplier alat kesehatan'
  },
  {
    id: 'rujuk-lencana-iso-13485',
    sumberId: 'rujuk-lencana-iso-13485',
    isActive: true,
    teks: 'ISO 13485:2016',
    keterangan: 'Standar internasional sistem manajemen mutu khusus perangkat medis'
  },
  {
    id: 'rujuk-lencana-cdakb',
    sumberId: 'rujuk-lencana-cdakb',
    isActive: true,
    teks: 'CDAKB Kemenkes RI',
    keterangan: 'Cara Distribusi Alat Kesehatan yang Baik (Good Medical Device Distribution Practices), 2024–2029'
  },
  {
    id: 'rujuk-lencana-cakupan',
    sumberId: 'rujuk-lencana-cakupan',
    isActive: true,
    teks: 'Aceh hingga Papua',
    keterangan: 'Melayani rumah sakit pemerintah maupun swasta di seluruh Indonesia'
  }
];

const solusi: SolusiWebsite[] = GRUP_KATALOG.map((g, i) => ({
  id: `rujuk-solusi-${i + 1}`,
  sumberId: `rujuk-solusi-${i + 1}`,
  isActive: true,
  judul: g.label,
  deskripsi: g.deskripsi,
  kategoriKey: g.label
}));

const statistik: StatistikWebsite[] = [
  {
    id: 'rujuk-stat-berdiri',
    sumberId: 'rujuk-stat-berdiri',
    isActive: true,
    nilai: '1994',
    label: 'Tahun Berdiri',
    keterangan: 'PT Anugrah Mitra Selaras beroperasi sejak 1994 dengan merek dagang Remedi'
  },
  {
    id: 'rujuk-stat-pelanggan',
    sumberId: 'rujuk-stat-pelanggan',
    isActive: true,
    nilai: '400+',
    label: 'Pelanggan',
    keterangan: 'Individu, pusat kesehatan masyarakat, dan rumah sakit — berkembang bertahap sejak 2016'
  },
  {
    id: 'rujuk-stat-merek',
    sumberId: 'rujuk-stat-merek',
    isActive: true,
    nilai: '15',
    label: 'Merek & Prinsipal',
    keterangan: 'Ditampilkan pada halaman Brand situs resmi perusahaan'
  },
  {
    id: 'rujuk-stat-grup',
    sumberId: 'rujuk-stat-grup',
    isActive: true,
    nilai: '8',
    label: 'Grup Katalog',
    keterangan: 'Disposable, General, Instrument, Laboratory, Protective Equipment, Vaccine Cooler & Syringe, Vet, X-Ray System'
  },
  {
    id: 'rujuk-stat-pabrik',
    sumberId: 'rujuk-stat-pabrik',
    isActive: true,
    nilai: '3',
    label: 'Lokasi Produksi',
    keterangan: 'Brebes (Jawa Tengah), Sumedang (Jawa Barat), dan Zhangjiagang, Jiangsu (Tiongkok)'
  }
];

const merek: MerekWebsite[] = [
  '3M',
  'Avner',
  'Bioland',
  'Creative',
  'Dongmun',
  'Hospital Homecare',
  'Hohlkorpel',
  'HTL',
  'Jevamask',
  'Mofolomed',
  'Remedi',
  'Romed',
  'Safe Mask',
  'Sino',
  'Vasflow'
].map((nama, i) => {
  const berkas = [
    '3m',
    'avner',
    'bioland',
    'creative',
    'dongmun',
    'h-h',
    'hohlkorpel',
    'htl',
    'jevamask',
    'mofolomed',
    'remedi-brand',
    'romed',
    'safemask',
    'sino',
    'vasflow'
  ][i];
  const milikSendiri = nama === 'Remedi';
  return {
    id: `rujuk-merek-${i + 1}`,
    sumberId: `rujuk-merek-${i + 1}`,
    isActive: true,
    nama,
    kategori: milikSendiri ? 'Merek Dagang Sendiri' : 'Merek & Prinsipal',
    negara: milikSendiri ? 'Indonesia' : 'Prinsipal REMEDI',
    keterangan: milikSendiri
      ? 'Diproduksi pada fasilitas perusahaan di Brebes (Jawa Tengah) dan Sumedang (Jawa Barat)'
      : 'Disalurkan melalui delapan grup katalog REMEDI',
    imageUrl: `/brand/${berkas}.jpg`
  };
});

const institusi: InstitusiWebsite[] = [
  {
    id: 'rujuk-institusi-rs',
    sumberId: 'rujuk-institusi-rs',
    isActive: true,
    nama: 'Rumah Sakit Pemerintah & Swasta',
    deskripsi:
      'Rumah sakit rujukan dan swasta besar di Indonesia, dilayani dengan standar mutu ISO 9001:2015 dan ISO 13485:2016 serta distribusi yang comply CDAKB.',
    contoh:
      'RSCM Jakarta • RSUD Dr. Soetomo Surabaya • RSUP Dr. Kariadi Semarang • RS Fatmawati • RS Hermina • RS Siloam • RS Eka Hospital'
  },
  {
    id: 'rujuk-institusi-puskesmas',
    sumberId: 'rujuk-institusi-puskesmas',
    isActive: true,
    nama: 'Pusat Kesehatan Masyarakat',
    deskripsi:
      'Puskesmas dan fasilitas kesehatan tingkat pertama memperoleh barang habis pakai dari delapan grup katalog yang didistribusikan ke seluruh Indonesia.'
  },
  {
    id: 'rujuk-institusi-individu',
    sumberId: 'rujuk-institusi-individu',
    isActive: true,
    nama: 'Individu & Praktik Pelayanan Kesehatan',
    deskripsi:
      'Segmen pelanggan individu dan praktik pelayanan kesehatan yang berkembang bertahap bersama basis pelanggan institusi sejak 2016.'
  }
];

const perjalanan: LangkahPerjalananWebsite[] = [
  {
    id: 'rujuk-langkah-1',
    sumberId: 'rujuk-langkah-1',
    isActive: true,
    tahap: 'Tahap 1',
    judul: 'Request for Quotation',
    deskripsi:
      'Ajukan penawaran melalui formulir pada situs resmi, telepon (021) 640-6029, atau WhatsApp 081212282864. Tuliskan jenis produk yang ingin ditanyakan pada kolom pesan.'
  },
  {
    id: 'rujuk-langkah-2',
    sumberId: 'rujuk-langkah-2',
    isActive: true,
    tahap: 'Tahap 2',
    judul: 'Pemilihan Grup Katalog & Merek',
    deskripsi:
      'Delapan grup katalog dan 15 merek menjadi rujukan penyusunan kebutuhan. Katalog dan daftar harga lengkap tersedia pada halaman Resources situs resmi.'
  },
  {
    id: 'rujuk-langkah-3',
    sumberId: 'rujuk-langkah-3',
    isActive: true,
    tahap: 'Tahap 3',
    judul: 'Verifikasi Legalitas & Kepatuhan Distribusi',
    deskripsi:
      'Nomor izin edar dan kelas risiko tiap produk diverifikasi pada register Regulatory Affairs & Penanggung Jawab Teknis; distribusi berjalan sesuai CDAKB Kemenkes RI.'
  },
  {
    id: 'rujuk-langkah-4',
    sumberId: 'rujuk-langkah-4',
    isActive: true,
    tahap: 'Tahap 4',
    judul: 'Purchase Order, Pengiriman & Kartu Garansi',
    deskripsi:
      'Pesanan difinalkan melalui formulir Purchase Order, dikirim dari jaringan distribusi REMEDI, dan dilengkapi kartu garansi melalui formulir resmi perusahaan.'
  }
];

const faq: FaqWebsite[] = [
  {
    id: 'rujuk-faq-profil',
    sumberId: 'rujuk-faq-profil',
    isActive: true,
    pertanyaan: 'Siapa PT Anugrah Mitra Selaras dan merek apa yang dipakainya?',
    jawaban:
      'PT Anugrah Mitra Selaras, dikenal dengan merek dagang REMEDI, berdiri sejak 1994 dan bergerak di bidang pengadaan serta distribusi alat kesehatan medis dan barang habis pakai medis maupun nonmedis ke seluruh Indonesia. Perusahaan bertindak sebagai produsen, agen, dan distributor.'
  },
  {
    id: 'rujuk-faq-katalog',
    sumberId: 'rujuk-faq-katalog',
    isActive: true,
    pertanyaan: 'Kelompok produk apa saja yang tersedia?',
    jawaban:
      'Katalog disusun dalam delapan grup: Disposable, General, Instrument, Laboratory, Protective Equipment, Vaccine Cooler & Syringe, Vet, dan X-Ray System. Masing-masing grup dipecah lagi menjadi lini produk, misalnya Surgical Wear pada grup Disposable atau Chemistry Analyzer Vet pada grup Vet.'
  },
  {
    id: 'rujuk-faq-produksi',
    sumberId: 'rujuk-faq-produksi',
    isActive: true,
    pertanyaan: 'Apakah REMEDI memproduksi sendiri produknya?',
    jawaban:
      'Ya. Produk bermerek Remedi diproduksi pada fasilitas di Brebes (Jawa Tengah) dan Sumedang (Jawa Barat); perusahaan juga menjadi pemegang saham pada pabrik di Zhangjiagang, Jiangsu, Tiongkok. Sekitar 10% barang habis pakai yang didistribusikan telah diproduksi di dalam negeri.'
  },
  {
    id: 'rujuk-faq-pelanggan',
    sumberId: 'rujuk-faq-pelanggan',
    isActive: true,
    pertanyaan: 'Siapa pelanggan yang telah dilayani?',
    jawaban:
      'Lebih dari 400 pelanggan yang terdiri atas individu, pusat kesehatan masyarakat, dan rumah sakit dari Aceh hingga Papua. Antara lain RSCM Jakarta, RSUD Dr. Soetomo Surabaya, RSUP Dr. Kariadi Semarang, RS Fatmawati Jakarta, RS H. Adam Malik Medan, RS Wahidin Sudirohusodo Makassar, RS Hermina, RS Siloam, dan RS Eka Hospital.'
  },
  {
    id: 'rujuk-faq-harga',
    sumberId: 'rujuk-faq-harga',
    isActive: true,
    pertanyaan: 'Bagaimana memperoleh harga dan melakukan pemesanan?',
    jawaban:
      'Kirim Request for Quotation melalui formulir kontak atau WhatsApp resmi, lalu unduh katalog dan daftar harga (Price List) pada halaman Resources. Setelah penawaran disepakati, pesanan masuk melalui formulir Purchase Order; klaim dan dokumen purna jual memakai formulir Kartu Garansi, Form Keluhan, dan Form Pengembalian Barang.'
  },
  {
    id: 'rujuk-faq-legalitas',
    sumberId: 'rujuk-faq-legalitas',
    isActive: true,
    pertanyaan: 'Standar dan sertifikat apa yang dipegang perusahaan?',
    jawaban:
      'Perusahaan memenuhi standardisasi internasional ISO 9001:2015 dan ISO 13485:2016 sebagai supplier alat kesehatan, serta memiliki sertifikat resmi Kementerian Kesehatan RI sebagai distributor yang menerapkan Cara Distribusi Alat Kesehatan yang Baik (Good Medical Device Distribution Practices) dengan masa berlaku 2024–2029.'
  }
];

const kantor: KantorWebsite[] = [
  {
    id: 'rujuk-kantor-pusat',
    sumberId: 'rujuk-kantor-pusat',
    isActive: true,
    nama: 'Kantor Pusat — Sunter Agung',
    alamat: IDENTITAS_RUJUKAN.alamat,
    telepon: IDENTITAS_RUJUKAN.telepon,
    email: IDENTITAS_RUJUKAN.email,
    penanggungJawab: 'Tim Penjualan — Request for Quotation'
  },
  {
    id: 'rujuk-kantor-brebes',
    sumberId: 'rujuk-kantor-brebes',
    isActive: true,
    nama: 'Fasilitas Produksi Brebes',
    alamat: 'Brebes, Jawa Tengah',
    penanggungJawab: 'Produksi barang habis pakai merek Remedi'
  },
  {
    id: 'rujuk-kantor-sumedang',
    sumberId: 'rujuk-kantor-sumedang',
    isActive: true,
    nama: 'Fasilitas Produksi Sumedang',
    alamat: 'Sumedang, Jawa Barat',
    penanggungJawab: 'Produksi alat kesehatan merek Remedi'
  },
  {
    id: 'rujuk-kantor-china',
    sumberId: 'rujuk-kantor-china',
    isActive: true,
    nama: 'Pabrik Partisipasi Zhangjiagang',
    alamat: 'Zhangjiagang, Jiangsu, Tiongkok',
    penanggungJawab: 'Kepemilikan saham PT Anugrah Mitra Selaras'
  }
];

const galeri: GaleriWebsite[] = [
  {
    id: 'rujuk-galeri-1',
    sumberId: 'rujuk-galeri-1',
    isActive: true,
    judul: 'Fasilitas & Produk Peralatan Kesehatan',
    keterangan: 'Foto utama halaman depan situs resmi REMEDI',
    imageUrl: '/site/medical-2a.jpg'
  },
  {
    id: 'rujuk-galeri-2',
    sumberId: 'rujuk-galeri-2',
    isActive: true,
    judul: 'Masker Medis Merek Remedi',
    keterangan: 'Lini Protective Equipment — Face Mask (medical)',
    imageUrl: '/site/remedi-mask.jpg'
  },
  {
    id: 'rujuk-galeri-3',
    sumberId: 'rujuk-galeri-3',
    isActive: true,
    judul: 'Avner Chemistry Analyzer 810',
    keterangan: 'Lini Laboratory — Chemistry Analyzer',
    imageUrl: '/site/avner-810.jpg'
  },
  {
    id: 'rujuk-galeri-4',
    sumberId: 'rujuk-galeri-4',
    isActive: true,
    judul: 'Iris Scissor',
    keterangan: 'Lini Instrument — @Itemize — Scissors',
    imageUrl: '/site/iris-scissor.jpg'
  },
  {
    id: 'rujuk-galeri-5',
    sumberId: 'rujuk-galeri-5',
    isActive: true,
    judul: 'Produk Merek Sino',
    keterangan: 'Sino SN-1500H ditampilkan pada halaman depan situs resmi',
    imageUrl: '/site/sino-sn-1500h.jpg'
  },
  {
    id: 'rujuk-galeri-6',
    sumberId: 'rujuk-galeri-6',
    isActive: true,
    judul: 'Produk Merek Dongmun',
    keterangan: 'Ditampilkan pada halaman depan situs resmi',
    imageUrl: '/site/dongmun.jpg'
  },
  {
    id: 'rujuk-galeri-7',
    sumberId: 'rujuk-galeri-7',
    isActive: true,
    judul: 'Sertifikat CDAKB Kemenkes RI',
    keterangan: 'Good Medical Device Distribution Practices, masa berlaku 2024–2029',
    imageUrl: '/site/cdakb-ams-2024-2029.jpg'
  }
];

const artikel: ArtikelWebsite[] = [
  {
    id: 'rujuk-artikel-berita-1',
    sumberId: 'rujuk-artikel-berita-1',
    isActive: true,
    judul: 'Bertrand Antolin Tetap Setia',
    ringkasan:
      'Bertrand Antolin selalu mempercayakan perlindungan saluran pernapasannya kepada Remedi sebagai pionir masker medis di Indonesia.',
    kategori: 'Berita',
    tanggal: '21 Apr 2021',
    tautan: { tipe: 'url', nilai: 'https://www.remediams.com/berita/bertrand-antolin-tetap-setia/' }
  },
  {
    id: 'rujuk-artikel-berita-2',
    sumberId: 'rujuk-artikel-berita-2',
    isActive: true,
    judul: 'Remedi Mendukung Pemerintah, Organisasi, dan Masyarakat Memutus Mata Rantai Penyebaran COVID-19',
    ringkasan:
      'Relawan Borobudur Anies–Sandi menyerahkan bantuan alat kesehatan kepada Gubernur DKI Jakarta Anies Baswedan.',
    kategori: 'Berita',
    tanggal: '6 Apr 2020',
    tautan: {
      tipe: 'url',
      nilai:
        'https://www.remediams.com/berita/remedi-mendukung-pemerintah-organisasi-dan-masyarakat-memutus-mata-rantai-penyebaran-covid-19/'
    }
  },
  {
    id: 'rujuk-artikel-katalog',
    sumberId: 'rujuk-artikel-katalog',
    isActive: true,
    judul: 'Katalog Produk REMEDI',
    ringkasan: 'Katalog delapan grup katalog dan 15 merek prinsipal dalam satu berkas unduhan.',
    kategori: 'Sumber Daya',
    tanggal: 'Diperbarui berkala',
    tautan: { tipe: 'url', nilai: IDENTITAS_RUJUKAN.tautanKatalog }
  },
  {
    id: 'rujuk-artikel-harga',
    sumberId: 'rujuk-artikel-harga',
    isActive: true,
    judul: 'Daftar Harga (Price List)',
    ringkasan: 'Lembar daftar harga resmi yang dipakai tim penjualan untuk penyusunan penawaran.',
    kategori: 'Sumber Daya',
    tanggal: 'Diperbarui berkala',
    tautan: { tipe: 'url', nilai: IDENTITAS_RUJUKAN.tautanDaftarHarga }
  },
  {
    id: 'rujuk-artikel-po',
    sumberId: 'rujuk-artikel-po',
    isActive: true,
    judul: 'Formulir Purchase Order',
    ringkasan: 'Formulir pemesanan yang diisi pelanggan setelah penawaran disetujui.',
    kategori: 'Formulir',
    tanggal: 'Tersedia',
    tautan: { tipe: 'url', nilai: IDENTITAS_RUJUKAN.tautanPurchaseOrder }
  },
  {
    id: 'rujuk-artikel-garansi',
    sumberId: 'rujuk-artikel-garansi',
    isActive: true,
    judul: 'Kartu Garansi',
    ringkasan: 'Formulir penerbitan kartu garansi produk yang dibeli melalui REMEDI.',
    kategori: 'Formulir',
    tanggal: 'Tersedia',
    tautan: { tipe: 'url', nilai: IDENTITAS_RUJUKAN.tautanKartuGaransi }
  },
  {
    id: 'rujuk-artikel-sertifikat',
    sumberId: 'rujuk-artikel-sertifikat',
    isActive: true,
    judul: 'Sertifikat CDAKB — Good Medical Device Distribution Practices',
    ringkasan:
      'Sertifikat resmi Kementerian Kesehatan RI sebagai distributor yang menerapkan Cara Distribusi Alat Kesehatan yang Baik, masa berlaku 2024–2029.',
    kategori: 'Sertifikat',
    tanggal: '2024–2029',
    imageUrl: '/site/cdakb-ams-2024-2029.jpg',
    tautan: { tipe: 'url', nilai: IDENTITAS_RUJUKAN.tautanSertifikat }
  }
];

/** Sumber daya formulir lain pada halaman Resources — dipakai seksi kontak & footer. */
export const FORMULIR_RUJUKAN = [
  { label: 'Data Pelanggan', url: 'https://forms.gle/t8H5fMcMkRo8j186A' },
  { label: 'Survey Kepuasan Pelanggan', url: 'https://forms.gle/gDHn92HqBVEdHHux5' },
  {
    label: 'Form Keluhan',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSe0XI7lNdP1-6gjh234B8fl0rw0Cdim46qo_xlVDU_3irX4mQ/viewform?usp=sf_link'
  },
  {
    label: 'Form Pengembalian Barang',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLScq5jPuVkw3VYfl88-uUdEPUWTWCDUi93toX8M_tyUZ_qzV_A/viewform?usp=sf_link'
  }
];

/**
 * Isi tiap seksi yang dipindahkan dari situs rujukan. Seksi yang tidak memiliki
 * padanan pada situs rujukan (promo, kegiatan, testimoni) dikosongkan.
 */
export const KONTEN_RUJUKAN = {
  kategoriKatalog: GRUP_KATALOG.map((g) => g.label),
  kepercayaan,
  solusi,
  statistik,
  produk: bangunBarangKatalog(),
  merek,
  institusi,
  perjalanan,
  faq,
  kantor,
  galeri,
  artikel,
  kegiatan: [] as KegiatanWebsite[],
  promo: [] as PromoWebsite[]
};

export const PARAGRAF_TENTANG = [
  'PT Anugrah Mitra Selaras — dikenal dengan merek dagang REMEDI — berdiri sejak 1994 dan bergerak di bidang pengadaan serta distribusi alat kesehatan medis dan barang habis pakai medis maupun nonmedis ke seluruh Indonesia. Perusahaan memproduksi dan memasok peralatan kesehatan, instrument set, dan consumables dengan mereknya sendiri, Remedi, sekaligus bertindak sebagai agen dan distributor.',
  'Fasilitas produksi berada di Brebes (Jawa Tengah) dan Sumedang (Jawa Barat), ditambah keterlibatan saham pada sebuah pabrik di Zhangjiagang, Jiangsu, Tiongkok. Melalui fasilitas tersebut, sekitar 10% barang habis pakai yang didistribusikan telah diproduksi di dalam negeri.',
  'Visi: menjadi penyedia solusi utama dan acuan (benchmark) untuk kebutuhan pelayanan kesehatan di Indonesia maupun dunia.',
  'Misi: (1) memberikan kepuasan pelanggan melalui informasi yang komprehensif, produk berkualitas, sumber daya profesional, dan layanan terbaik; (2) mematuhi seluruh standar, persyaratan, dan regulasi serta menjadi mitra strategis pemerintah; (3) membina hubungan dan kolaborasi yang baik dengan perkumpulan tenaga medis maupun komunitas kesehatan; (4) memberi kontribusi positif bagi masyarakat dan lingkungan untuk meningkatkan kualitas hidup; (5) memperluas jangkauan pasar agar menjadi produk Indonesia yang terkemuka di dunia.',
  'Komitmen perusahaan adalah memaksimalkan manfaat bagi konsumen dengan berfokus pada produk bermutu dan berstandar aman, efisiensi, layanan unggul, dan penerimaan global — seluruhnya pada harga yang wajar.',
  'Pelanggan terdiri atas individu, pusat kesehatan masyarakat, dan rumah sakit, bertumbuh menjadi lebih dari 400 pelanggan sejak 2016. Produk perusahaan dipakai rumah sakit pemerintah maupun swasta dari Aceh hingga Papua, antara lain RSCM Jakarta, RSUD Dr. Soetomo Surabaya, RSUP Dr. Kariadi Semarang, RS Fatmawati Jakarta, RS H. Adam Malik Medan, RS Wahidin Sudirohusodo Makassar, RS Hermina, RS Siloam, dan RS Eka Hospital.'
];
