/**
 * SKEMA EDITOR KONTEN WEBSITE — definisi medan tiap seksi.
 *
 * Dashboard memakai satu renderer generik yang membaca definisi ini, sehingga seluruh
 * isi situs (judul seksi, teks, gambar, urutan item, sakelar tampil) dapat diatur dari
 * menu Website tanpa menambah komponen per seksi.
 */
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  Contact,
  Globe,
  Handshake,
  Images,
  Info,
  LayoutGrid,
  ListTree,
  MapPinned,
  Megaphone,
  PackageCheck,
  Route,
  Share2,
  Sparkles,
  Quote,
  Tags
} from 'lucide-react';
import type { ComponentType } from 'react';
import { HalamanWebsite, ItemWebsite, KonfigurasiSitus } from '../../../types';

export type NilaiMedan = unknown;
export type ItemLoose = ItemWebsite & Record<string, unknown>;

export type Medan =
  | { kind: 'teks'; key: string; label: string; petunjuk?: string }
  | { kind: 'textarea'; key: string; label: string; rows?: number; petunjuk?: string }
  | { kind: 'daftarTeks'; key: string; label: string; petunjuk?: string }
  | { kind: 'gambar'; key: string; label: string; petunjuk?: string }
  | { kind: 'angka'; key: string; label: string; petunjuk?: string }
  | { kind: 'pilihan'; key: string; label: string; opsi: string[]; petunjuk?: string }
  | { kind: 'tautan'; key: string; label: string; petunjuk?: string }
  | {
      kind: 'bertingkat';
      key: string;
      label: string;
      petunjuk?: string;
      medan: Medan[];
      judulItem: (item: Record<string, unknown>) => string;
      pabrik: () => Record<string, unknown>;
    };

export type KunciDaftar =
  | 'slide'
  | 'kepercayaan'
  | 'solusi'
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
  | 'kantor'
  | 'sosial';

export type KunciObjek = 'identitas' | 'header' | 'hero' | 'konsultasi' | 'tentang' | 'kontak';

export type KunciPolos = 'menu' | 'footerKolom';

export interface BagianDefinisi {
  kunci: KunciDaftar;
  label: string;
  petunjuk: string;
  ikon: ComponentType<{ className?: string }>;
  medan: Medan[];
  judulItem: (item: ItemLoose) => string;
  pabrik: (nomor: number) => ItemLoose;
  /** true = isi seksi dibangkitkan dari data aplikasi (tombol sinkron tersedia) */
  dinamis?: boolean;
}

export interface ObjekDefinisi {
  kunci: KunciObjek;
  label: string;
  petunjuk: string;
  ikon: ComponentType<{ className?: string }>;
  medan: Medan[];
  /** objek punya sakelar isActive (hero, konsultasi, tentang) */
  punyaAktif?: boolean;
  /** objek punya blok kepala (eyebrow/judul/subjudul) — medannya ditambahkan otomatis */
  punyaKepala?: boolean;
}

export interface PolosDefinisi {
  kunci: KunciPolos;
  label: string;
  petunjuk: string;
  ikon: ComponentType<{ className?: string }>;
  medan: Medan[];
  judulItem: (item: Record<string, unknown>) => string;
  pabrik: (nomor: number) => Record<string, unknown>;
}

const HALAMAN: HalamanWebsite[] = ['beranda', 'produk', 'solusi', 'layanan', 'sumber-daya', 'tentang', 'kontak'];

const idBaru = (awalan: string) => `${awalan}-${Math.random().toString(36).slice(2, 8)}`;

/** Medan judul daftar (eyebrow/judul/subjudul/tautan "lihat semua") untuk semua seksi daftar. */
export const MEDAN_KEPALA: Medan[] = [
  { kind: 'teks', key: 'eyebrow', label: 'Label kecil (eyebrow)' },
  { kind: 'teks', key: 'judul', label: 'Judul seksi (H2)' },
  { kind: 'textarea', key: 'subjudul', label: 'Sub-judul', rows: 2 },
  { kind: 'teks', key: 'teksTautan', label: 'Teks tautan "lihat semua"' },
  { kind: 'tautan', key: 'tautan', label: 'Tujuan tautan "lihat semua"' }
];

/** Salin definisi medan dengan awalan jalur (mis. 'kepala' → 'kepala.judul'). */
export const denganPrefix = (prefix: string, medan: Medan[]): Medan[] =>
  medan.map((m) => ({ ...m, key: `${prefix}.${m.key}` }) as Medan);

export const BAGIAN_WEBSITE: BagianDefinisi[] = [
  {
    kunci: 'slide',
    label: 'Banner / Slider',
    petunjuk: 'Banner berganti otomatis di bawah hero. Rekomendasi gambar 1600 × 900 px.',
    ikon: Images,
    dinamis: false,
    medan: [
      { kind: 'teks', key: 'eyebrow', label: 'Label kecil' },
      { kind: 'textarea', key: 'judul', label: 'Judul banner', rows: 2 },
      { kind: 'textarea', key: 'subjudul', label: 'Sub-judul', rows: 2 },
      { kind: 'teks', key: 'teksCta', label: 'Teks tombol' },
      { kind: 'tautan', key: 'tautan', label: 'Tujuan tombol' },
      { kind: 'gambar', key: 'imageUrl', label: 'Gambar banner' }
    ],
    judulItem: (i) => String(i.judul || i.id),
    pabrik: (n) => ({
      id: idBaru('slide'),
      isActive: true,
      eyebrow: 'SOROTAN',
      judul: `Banner baru ${n}`,
      subjudul: '',
      teksCta: 'Selengkapnya',
      tautan: { tipe: 'halaman', nilai: 'produk' },
      imageUrl: undefined
    })
  },
  {
    kunci: 'kepercayaan',
    label: 'Legalitas & Sertifikat',
    petunjuk: 'Lencana SDAK, CPAKB, ISO 13485:2016 — dibangkitkan dari sertifikat perusahaan.',
    ikon: BadgeCheck,
    dinamis: true,
    medan: [
      { kind: 'teks', key: 'teks', label: 'Nama legalitas' },
      { kind: 'textarea', key: 'keterangan', label: 'Keterangan (nomor & masa berlaku)', rows: 2 }
    ],
    judulItem: (i) => String(i.teks || i.id),
    pabrik: (n) => ({ id: idBaru('lencana'), isActive: true, teks: `Lencana ${n}`, keterangan: '' })
  },
  {
    kunci: 'solusi',
    label: 'Solusi per Kategori',
    petunjuk: 'Kartu solusi per kelompok produk; jumlahnya dihitung dari register izin edar.',
    ikon: Sparkles,
    dinamis: true,
    medan: [
      { kind: 'teks', key: 'judul', label: 'Judul solusi' },
      { kind: 'textarea', key: 'deskripsi', label: 'Deskripsi', rows: 3 },
      { kind: 'teks', key: 'kategoriKey', label: 'Kunci kategori (filter katalog)' },
      { kind: 'angka', key: 'jumlahProduk', label: 'Jumlah produk' },
      { kind: 'gambar', key: 'imageUrl', label: 'Gambar solusi' }
    ],
    judulItem: (i) => String(i.judul || i.id),
    pabrik: (n) => ({ id: idBaru('solusi'), isActive: true, judul: `Solusi ${n}`, deskripsi: '', kategoriKey: '', jumlahProduk: 0 })
  },
  {
    kunci: 'statistik',
    label: 'Capaian Terukur',
    petunjuk: 'Angka capaian; sumbernya register izin edar, pelanggan, teritorial, pemasok, sertifikat.',
    ikon: LayoutGrid,
    dinamis: true,
    medan: [
      { kind: 'teks', key: 'nilai', label: 'Angka' },
      { kind: 'teks', key: 'label', label: 'Label' },
      { kind: 'textarea', key: 'keterangan', label: 'Sumber angka', rows: 2 }
    ],
    judulItem: (i) => `${i.nilai} ${i.label}`,
    pabrik: (n) => ({ id: idBaru('stat'), isActive: true, nilai: '0', label: `Capaian ${n}`, keterangan: '' })
  },
  {
    kunci: 'produk',
    label: 'Katalog Produk',
    petunjuk: 'Kartu produk hasil gabungan katalog resmi REMEDI, register izin edar, brosur digital, dan kartu stok FEFO.',
    ikon: PackageCheck,
    dinamis: true,
    medan: [
      { kind: 'teks', key: 'nama', label: 'Nama produk' },
      { kind: 'teks', key: 'tipeModel', label: 'Tipe / model' },
      { kind: 'teks', key: 'kategori', label: 'Grup katalog' },
      { kind: 'teks', key: 'kategoriRegulasi', label: 'Kategori izin edar Kemenkes' },
      { kind: 'teks', key: 'kelasRisiko', label: 'Kelas risiko' },
      { kind: 'teks', key: 'nomorIzinEdar', label: 'Nomor izin edar' },
      {
        kind: 'pilihan',
        key: 'statusIzinEdar',
        label: 'Status izin edar',
        opsi: ['Aktif', 'Verifikasi Register RA', 'Perpanjangan', 'Menunggu Evaluasi', 'Kedaluwarsa']
      },
      { kind: 'teks', key: 'produsen', label: 'Produsen / merek' },
      { kind: 'teks', key: 'negaraAsal', label: 'Negara asal' },
      { kind: 'teks', key: 'hargaTayang', label: 'Harga tayang / referensi' },
      { kind: 'textarea', key: 'spesifikasi', label: 'Spesifikasi ringkas', rows: 3 },
      { kind: 'daftarTeks', key: 'poinJual', label: 'Poin jual' },
      { kind: 'gambar', key: 'imageUrl', label: 'Foto produk' },
      { kind: 'teks', key: 'tautanBrosur', label: 'Tautan brosur' },
      { kind: 'teks', key: 'tautanVideo', label: 'Tautan video demo' },
      { kind: 'angka', key: 'stokTersedia', label: 'Stok siap kirim (FEFO)' },
      { kind: 'teks', key: 'satuan', label: 'Satuan' },
      { kind: 'teks', key: 'zonaSuhu', label: 'Zona suhu penyimpanan' },
      { kind: 'teks', key: 'badge', label: 'Lencana kartu' }
    ],
    judulItem: (i) => String(i.nama || i.id),
    pabrik: (n) => ({
      id: idBaru('produk'),
      isActive: true,
      nama: `Produk ${n}`,
      tipeModel: '',
      kategori: 'General',
      kategoriRegulasi: 'Elektromedik Non Radiasi',
      kelasRisiko: 'Kelas B',
      nomorIzinEdar: '',
      statusIzinEdar: 'Aktif',
      produsen: '',
      negaraAsal: '',
      hargaTayang: '',
      spesifikasi: '',
      poinJual: [],
      badge: ''
    })
  },
  {
    kunci: 'merek',
    label: 'Merek / Prinsipal',
    petunjuk: 'Merek yang ditampilkan berasal dari pemasok berstatus audit mutu Terkualifikasi.',
    ikon: Tags,
    dinamis: true,
    medan: [
      { kind: 'teks', key: 'nama', label: 'Nama merek' },
      { kind: 'teks', key: 'kategori', label: 'Kategori pemasok' },
      { kind: 'teks', key: 'negara', label: 'Negara' },
      { kind: 'textarea', key: 'keterangan', label: 'Keterangan audit mutu', rows: 2 },
      { kind: 'gambar', key: 'imageUrl', label: 'Logo merek' }
    ],
    judulItem: (i) => String(i.nama || i.id),
    pabrik: (n) => ({ id: idBaru('merek'), isActive: true, nama: `Merek ${n}`, kategori: '', negara: '', keterangan: '' })
  },
  {
    kunci: 'perjalanan',
    label: 'Tahap Perjalanan Layanan',
    petunjuk: 'Alur layanan end-to-end; setiap tahap merujuk modul yang benar-benar ada di sistem.',
    ikon: Route,
    dinamis: false,
    medan: [
      { kind: 'teks', key: 'tahap', label: 'Label tahap' },
      { kind: 'teks', key: 'judul', label: 'Judul tahap' },
      { kind: 'textarea', key: 'deskripsi', label: 'Deskripsi', rows: 3 }
    ],
    judulItem: (i) => String(i.judul || i.id),
    pabrik: (n) => ({ id: idBaru('langkah'), isActive: true, tahap: `Tahap ${n}`, judul: `Tahap baru ${n}`, deskripsi: '' })
  },
  {
    kunci: 'institusi',
    label: 'Institusi yang Dilayani',
    petunjuk: 'Segmen fasyankes yang dihitung dari profil pelanggan B2B aktif.',
    ikon: Building2,
    dinamis: true,
    medan: [
      { kind: 'teks', key: 'nama', label: 'Nama segmen' },
      { kind: 'textarea', key: 'deskripsi', label: 'Deskripsi', rows: 3 },
      { kind: 'angka', key: 'jumlahPelanggan', label: 'Jumlah instansi terdaftar' },
      { kind: 'teks', key: 'contoh', label: 'Contoh instansi' }
    ],
    judulItem: (i) => String(i.nama || i.id),
    pabrik: (n) => ({ id: idBaru('institusi'), isActive: true, nama: `Segmen ${n}`, deskripsi: '', jumlahPelanggan: 0, contoh: '' })
  },
  {
    kunci: 'kegiatan',
    label: 'Kegiatan & Seminar',
    petunjuk: 'Simposium, workshop, dan pameran yang tercatat pada modul kampanye pemasaran.',
    ikon: CalendarDays,
    dinamis: true,
    medan: [
      { kind: 'teks', key: 'judul', label: 'Nama kegiatan' },
      { kind: 'pilihan', key: 'jenis', label: 'Jenis kegiatan', opsi: ['Simposium', 'Pameran Internasional', 'Workshop Klinis', 'Edukasi Spesialis'] },
      { kind: 'teks', key: 'lokasi', label: 'Lokasi' },
      { kind: 'teks', key: 'tanggalMulai', label: 'Tanggal mulai (YYYY-MM-DD)' },
      { kind: 'teks', key: 'tanggalSelesai', label: 'Tanggal selesai (YYYY-MM-DD)' },
      { kind: 'textarea', key: 'deskripsi', label: 'Deskripsi', rows: 2 },
      { kind: 'pilihan', key: 'status', label: 'Status', opsi: ['Rencana', 'Berjalan', 'Selesai'] }
    ],
    judulItem: (i) => String(i.judul || i.id),
    pabrik: (n) => ({
      id: idBaru('kegiatan'),
      isActive: true,
      judul: `Kegiatan ${n}`,
      jenis: 'Simposium',
      lokasi: '',
      tanggalMulai: '',
      tanggalSelesai: '',
      deskripsi: '',
      status: 'Rencana'
    })
  },
  {
    kunci: 'promo',
    label: 'Promo & Skema Harga',
    petunjuk: 'Penawaran hasil turunan skema harga aktif dan program rebate mitra.',
    ikon: Megaphone,
    dinamis: true,
    medan: [
      { kind: 'teks', key: 'judul', label: 'Judul penawaran' },
      { kind: 'textarea', key: 'deskripsi', label: 'Deskripsi', rows: 3 },
      { kind: 'teks', key: 'namaAlkes', label: 'Produk terkait' },
      { kind: 'teks', key: 'potongan', label: 'Text potongan' },
      { kind: 'teks', key: 'periode', label: 'Periode' },
      { kind: 'teks', key: 'badge', label: 'Lencana' },
      { kind: 'tautan', key: 'tautan', label: 'Tujuan tombol' }
    ],
    judulItem: (i) => String(i.judul || i.id),
    pabrik: (n) => ({ id: idBaru('promo'), isActive: true, judul: `Penawaran ${n}`, deskripsi: '', potongan: '', periode: '', badge: 'Penawaran' })
  },
  {
    kunci: 'artikel',
    label: 'Berita & Artikel',
    petunjuk: 'Konten redaksional; ditulis manual karena tidak bersumber dari modul operasional.',
    ikon: ClipboardList,
    medan: [
      { kind: 'teks', key: 'judul', label: 'Judul artikel' },
      { kind: 'textarea', key: 'ringkasan', label: 'Ringkasan', rows: 3 },
      { kind: 'teks', key: 'kategori', label: 'Kategori' },
      { kind: 'teks', key: 'tanggal', label: 'Tanggal (YYYY-MM-DD)' },
      { kind: 'gambar', key: 'imageUrl', label: 'Gambar sampul' },
      { kind: 'tautan', key: 'tautan', label: 'Tautan baca selengkapnya' }
    ],
    judulItem: (i) => String(i.judul || i.id),
    pabrik: (n) => ({ id: idBaru('artikel'), isActive: true, judul: `Artikel ${n}`, ringkasan: '', kategori: 'Berita', tanggal: '', imageUrl: undefined })
  },
  {
    kunci: 'galeri',
    label: 'Galeri Fasilitas',
    petunjuk: 'Dokumentasi gudang, instalasi, dan kegiatan.',
    ikon: Images,
    medan: [
      { kind: 'teks', key: 'judul', label: 'Judul foto' },
      { kind: 'textarea', key: 'keterangan', label: 'Keterangan', rows: 2 },
      { kind: 'gambar', key: 'imageUrl', label: 'Foto' }
    ],
    judulItem: (i) => String(i.judul || i.id),
    pabrik: (n) => ({ id: idBaru('galeri'), isActive: true, judul: `Foto ${n}`, keterangan: '', imageUrl: undefined })
  },
  {
    kunci: 'testimoni',
    label: 'Testimoni Pelanggan',
    petunjuk: 'Hanya tayang bila pelanggan memberi izin; jangan mengarang kutipan instansi nyata.',
    ikon: Quote,
    medan: [
      { kind: 'textarea', key: 'kutipan', label: 'Kutipan', rows: 3 },
      { kind: 'teks', key: 'penulis', label: 'Nama penulis' },
      { kind: 'teks', key: 'jabatan', label: 'Jabatan' },
      { kind: 'teks', key: 'institusi', label: 'Institusi' }
    ],
    judulItem: (i) => `${i.penulis || i.id}`,
    pabrik: (n) => ({ id: idBaru('testimoni'), isActive: true, kutipan: '', penulis: `Pelanggan ${n}`, jabatan: '', institusi: '' })
  },
  {
    kunci: 'faq',
    label: 'Pertanyaan Umum',
    petunjuk: 'Jawaban mengikuti prosedur modul; angka jawaban ikut diperbarui saat sinkronisasi.',
    ikon: CircleHelp,
    dinamis: true,
    medan: [
      { kind: 'teks', key: 'pertanyaan', label: 'Pertanyaan' },
      { kind: 'textarea', key: 'jawaban', label: 'Jawaban', rows: 4 }
    ],
    judulItem: (i) => String(i.pertanyaan || i.id),
    pabrik: (n) => ({ id: idBaru('faq'), isActive: true, pertanyaan: `Pertanyaan ${n}`, jawaban: '' })
  },
  {
    kunci: 'kantor',
    label: 'Kantor & Rayon',
    petunjuk: 'Kantor pusat dari kop dokumen resmi; rayon dari mapping area penjualan.',
    ikon: MapPinned,
    dinamis: true,
    medan: [
      { kind: 'teks', key: 'nama', label: 'Nama kantor / rayon' },
      { kind: 'textarea', key: 'alamat', label: 'Alamat', rows: 2 },
      { kind: 'teks', key: 'telepon', label: 'Telepon' },
      { kind: 'teks', key: 'email', label: 'Surel' },
      { kind: 'teks', key: 'penanggungJawab', label: 'Penanggung jawab' },
      { kind: 'teks', key: 'provinsiDilayani', label: 'Cakupan provinsi' }
    ],
    judulItem: (i) => String(i.nama || i.id),
    pabrik: (n) => ({ id: idBaru('kantor'), isActive: true, nama: `Kantor ${n}`, alamat: '', telepon: '', email: '', penanggungJawab: '' })
  },
  {
    kunci: 'sosial',
    label: 'Media Sosial',
    petunjuk: 'Tautan resmi perusahaan; kosong berarti seksi tidak tampil.',
    ikon: Share2,
    medan: [
      { kind: 'teks', key: 'label', label: 'Nama platform' },
      { kind: 'teks', key: 'url', label: 'URL profil' }
    ],
    judulItem: (i) => String(i.label || i.id),
    pabrik: (n) => ({ id: idBaru('sosial'), isActive: true, label: `Platform ${n}`, url: 'https://' })
  }
];

export const OBJEK_WEBSITE: ObjekDefinisi[] = [
  {
    kunci: 'identitas',
    label: 'Identitas & SEO',
    petunjuk: 'Nama, tagline, logo, favicon, judul tab, dan meta description.',
    ikon: Globe,
    medan: [
      { kind: 'teks', key: 'nama', label: 'Nama perusahaan' },
      { kind: 'teks', key: 'tagline', label: 'Tagline' },
      { kind: 'gambar', key: 'logoUrl', label: 'Logo (PNG transparan, 400 × 150 px)' },
      { kind: 'gambar', key: 'faviconUrl', label: 'Favicon (64 × 64 px)' },
      { kind: 'teks', key: 'judulSitus', label: 'Judul tab browser' },
      { kind: 'textarea', key: 'metaDeskripsi', label: 'Meta description (150–160 karakter)', rows: 3 }
    ]
  },
  {
    kunci: 'header',
    label: 'Tombol Header',
    petunjuk: 'CTA kanan header (mis. "Ajukan Penawaran" / "Hubungi Kami") dan tautan portal pelanggan.',
    ikon: Handshake,
    medan: [
      { kind: 'teks', key: 'utamaTeks', label: 'Teks tombol utama' },
      { kind: 'tautan', key: 'utamaTautan', label: 'Tujuan tombol utama' },
      { kind: 'teks', key: 'cadanganTeks', label: 'Teks tombol cadangan' },
      { kind: 'tautan', key: 'cadanganTautan', label: 'Tujuan tombol cadangan' },
      { kind: 'teks', key: 'portalTeks', label: 'Teks portal pelanggan' },
      { kind: 'teks', key: 'portalUrl', label: 'URL portal pelanggan' }
    ]
  },
  {
    kunci: 'hero',
    label: 'Hero Utama',
    petunjuk: 'Judul H1, sub-judul, gambar, dan dua tombol pada bagian paling atas beranda.',
    ikon: Sparkles,
    punyaAktif: true,
    medan: [
      { kind: 'teks', key: 'badge', label: 'Lencana di atas judul' },
      { kind: 'textarea', key: 'judul', label: 'Judul H1', rows: 2 },
      { kind: 'textarea', key: 'subjudul', label: 'Paragraf pembuka', rows: 4 },
      { kind: 'gambar', key: 'gambarUrl', label: 'Gambar hero' },
      { kind: 'teks', key: 'teksCtaUtama', label: 'Teks tombol utama' },
      { kind: 'tautan', key: 'tautanCtaUtama', label: 'Tujuan tombol utama' },
      { kind: 'teks', key: 'teksCtaCadangan', label: 'Teks tombol cadangan' },
      { kind: 'tautan', key: 'tautanCtaCadangan', label: 'Tujuan tombol cadangan' }
    ]
  },
  {
    kunci: 'konsultasi',
    label: 'Pita Konsultasi',
    petunjuk: 'Blok gelap ajakan konsultasi ala bagian "Konsultasikan Kebutuhan Anda".',
    ikon: Handshake,
    punyaAktif: true,
    punyaKepala: true,
    medan: [
      { kind: 'teks', key: 'teksCta', label: 'Teks tombol' },
      { kind: 'tautan', key: 'tautan', label: 'Tujuan tombol' },
      { kind: 'textarea', key: 'catatan', label: 'Catatan kepatuhan', rows: 3 }
    ]
  },
  {
    kunci: 'tentang',
    label: 'Tentang Kami',
    petunjuk: 'Profil perusahaan, paragraf isi, dan capaian ringkas.',
    ikon: Info,
    punyaAktif: true,
    punyaKepala: true,
    medan: [
      { kind: 'daftarTeks', key: 'paragraf', label: 'Paragraf isi', petunjuk: 'Satu baris untuk setiap paragraf.' },
      { kind: 'gambar', key: 'imageUrl', label: 'Gambar profil' },
      {
        kind: 'bertingkat',
        key: 'capaian',
        label: 'Capaian ringkas',
        medan: [
          { kind: 'teks', key: 'nilai', label: 'Angka' },
          { kind: 'teks', key: 'label', label: 'Label' }
        ],
        judulItem: (c) => `${c.nilai ?? ''} ${c.label ?? ''}`.trim() || 'capaian',
        pabrik: () => ({ nilai: '0', label: 'Capaian' })
      }
    ]
  },
  {
    kunci: 'kontak',
    label: 'Kontak & Alamat',
    petunjuk: 'Isi hanya data resmi perusahaan. WhatsApp kosong berarti tombol chat tidak ditampilkan.',
    ikon: Contact,
    medan: [
      { kind: 'teks', key: 'telepon', label: 'Telepon kantor' },
      { kind: 'teks', key: 'email', label: 'Surel resmi' },
      { kind: 'teks', key: 'whatsapp', label: 'Nomor WhatsApp (62812...)' },
      { kind: 'textarea', key: 'pesanPembukaWA', label: 'Pesan pembuka WhatsApp', rows: 2 },
      { kind: 'teks', key: 'jamOperasional', label: 'Jam operasional' },
      { kind: 'textarea', key: 'alamatKantor', label: 'Alamat kantor', rows: 2 },
      { kind: 'teks', key: 'tautanPeta', label: 'Tautan peta' }
    ]
  }
];

export const POLOS_WEBSITE: PolosDefinisi[] = [
  {
    kunci: 'menu',
    label: 'Navigasi Header',
    petunjuk: 'Menu utama dan mega menu. Tipe "mega" memakai kolom berisi tautan.',
    ikon: ListTree,
    medan: [
      { kind: 'teks', key: 'label', label: 'Teks menu' },
      { kind: 'pilihan', key: 'tipe', label: 'Tipe', opsi: ['link', 'mega'] },
      { kind: 'pilihan', key: 'halaman', label: 'Halaman tujuan', opsi: HALAMAN },
      {
        kind: 'bertingkat',
        key: 'kolom',
        label: 'Kolom mega menu',
        petunjuk: 'Setiap kolom memuat daftar tautan ke halaman atau filter kategori.',
        medan: [
          { kind: 'teks', key: 'judul', label: 'Judul kolom' },
          {
            kind: 'bertingkat',
            key: 'tautan',
            label: 'Tautan dalam kolom',
            medan: [
              { kind: 'teks', key: 'label', label: 'Teks tautan' },
              { kind: 'pilihan', key: 'halaman', label: 'Halaman tujuan', opsi: HALAMAN },
              { kind: 'teks', key: 'kategoriKey', label: 'Kunci kategori (opsional)' }
            ],
            judulItem: (t) => String(t.label || 'tautan'),
            pabrik: () => ({ id: idBaru('menu-tautan'), isActive: true, label: 'Tautan baru', halaman: 'produk', kategoriKey: '' })
          }
        ],
        judulItem: (k) => String(k.judul || 'kolom'),
        pabrik: () => ({
          id: idBaru('menu-kolom'),
          judul: 'Kolom baru',
          tautan: [{ id: idBaru('menu-tautan'), isActive: true, label: 'Tautan baru', halaman: 'produk', kategoriKey: '' }]
        })
      }
    ],
    judulItem: (i) => String(i.label || i.id),
    pabrik: (n) => ({ id: idBaru('menu'), isActive: true, label: `Menu ${n}`, tipe: 'link', halaman: 'produk' })
  },
  {
    kunci: 'footerKolom',
    label: 'Kolom Footer',
    petunjuk: 'Kelompok tautan footer; setiap kolom punya judul dan daftar tautan.',
    ikon: ListTree,
    medan: [
      { kind: 'teks', key: 'judul', label: 'Judul kolom' },
      {
        kind: 'bertingkat',
        key: 'tautan',
        label: 'Tautan footer',
        medan: [
          { kind: 'teks', key: 'label', label: 'Teks tautan' },
          { kind: 'pilihan', key: 'halaman', label: 'Halaman tujuan', opsi: HALAMAN }
        ],
        judulItem: (t) => String(t.label || 'tautan'),
        pabrik: () => ({ id: idBaru('footer-tautan'), isActive: true, label: 'Tautan baru', halaman: 'beranda' })
      }
    ],
    judulItem: (i) => String(i.judul || i.id),
    pabrik: (n) => ({
      id: idBaru('footer-kolom'),
      judul: `Kolom ${n}`,
      tautan: [{ id: idBaru('footer-tautan'), isActive: true, label: 'Tautan baru', halaman: 'beranda' }]
    })
  }
];

/** Semua kunci daftar yang nilainya bertipe SeksiDaftar (punya isActive + kepala + item). */
export const KUNCI_KEPALA: KunciDaftar[] = BAGIAN_WEBSITE.map((b) => b.kunci);

export function ambilBagian(kunci: string): BagianDefinisi | undefined {
  return BAGIAN_WEBSITE.find((b) => b.kunci === kunci);
}

export function ambilObjek(kunci: string): ObjekDefinisi | undefined {
  return OBJEK_WEBSITE.find((b) => b.kunci === kunci);
}

export function ambilPolos(kunci: string): PolosDefinisi | undefined {
  return POLOS_WEBSITE.find((b) => b.kunci === kunci);
}

export type KunciEditorSitus = KunciDaftar | KunciObjek | KunciPolos | 'footerCatatan';

export function jumlahButir(cfg: KonfigurasiSitus, kunci: KunciEditorSitus): number {
  const nilai = (cfg as unknown as Record<string, unknown>)[kunci];
  if (!nilai) return 0;
  if (Array.isArray(nilai)) return nilai.length;
  if (typeof nilai === 'string') return nilai ? 1 : 0;
  const seksi = nilai as { item?: unknown[] };
  if (Array.isArray(seksi.item)) return seksi.item.length;
  const objek = nilai as { paragraf?: unknown[]; capaian?: unknown[] };
  if (Array.isArray(objek.paragraf)) return objek.paragraf.length;
  return 1;
}
