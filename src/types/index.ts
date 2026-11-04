export type DivisionId = 'regulatory' | 'operations' | 'commercial' | 'supporting';

export type ModuleId =
  // 1. Regulatory Affairs
  | 'ra-pjt'
  | 'qa-mutu'
  | 'qc-inspeksi'
  // 2. Operations & Technical
  | 'gudang-logistik'
  | 'teknisi-service'
  | 'produksi-cpakb'
  | 'purchasing-procurement'
  // 3. Commercial & Market
  | 'sales-marketing'
  | 'pms-vigilance'
  // 4. Supporting System
  | 'hrd-pelatihan'
  | 'finance-akuntansi'
  | 'it-traceability';

export type UserRole =
  | 'pjt' // Penanggung Jawab Teknis
  | 'qa_manager'
  | 'qc_officer'
  | 'kepala_gudang'
  | 'teknisi_elektromedik'
  | 'manajer_produksi'
  | 'purchasing'
  | 'sales_manager'
  | 'auditor_internal'
  | 'it_admin';

// 1. Regulatory Affairs (RA & PJT)
export interface IzinEdarAlkes {
  id: string;
  namaAlkes: string;
  tipeModel: string;
  nomorIzinEdar: string; // KEMENKES RI AKL/AKD ...
  kategori: 'Elektromedik Radiasi' | 'Elektromedik Non Radiasi' | 'Non Elektromedik Steril' | 'Non Elektromedik Non Steril' | 'Diagnostik In Vitro';
  kelasRisiko: 'Kelas A' | 'Kelas B' | 'Kelas C' | 'Kelas D';
  produsen: string;
  negaraAsal: string;
  tanggalTerbit: string;
  tanggalKedaluwarsa: string;
  status: 'Aktif' | 'Perpanjangan' | 'Menunggu Evaluasi' | 'Kedaluwarsa';
  statusPerpanjangan: 'Aman' | 'Harus Diperpanjang Segera' | 'Dalam Proses OSS';
  keterangan: string;
}

export interface SertifikatPerusahaan {
  id: string;
  jenis: 'SDAK (Sertifikat Standar Distribusi)' | 'IPAK' | 'Sertifikat CPAKB' | 'ISO 13485:2016';
  nomorSertifikat: string;
  penerbit: 'Kementerian Kesehatan RI' | 'Badan Sertifikasi Akreditasi KAN' | 'OSS-RBA';
  tanggalBerlaku: string;
  tanggalHabis: string;
  lingkup: string;
  status: 'Valid' | 'Audit Pengawasan' | 'Perpanjangan';
}

// 2. Quality Assurance (QA)
export interface DokumenMutu {
  id: string;
  kodeDokumen: string; // SOP-CDAKB-01, dll
  judul: string;
  kategori: 'Pedoman Mutu' | 'SOP' | 'Instruksi Kerja' | 'Formulir';
  revisi: number;
  tanggalEfektif: string;
  status: 'Berlaku' | 'Revisi Diusulkan' | 'Usang';
  penyusun: string;
  penyetujui: string; // PJT / Direktur
}

export interface CAPARecord {
  id: string;
  nomorCAPA: string;
  sumber: 'Audit Internal' | 'Inspeksi Kemenkes' | 'Keluhan Fasyankes' | 'Temuan QC' | 'Ketidaksesuaian Suhu';
  deskripsiMasalah: string;
  akarPenyebab: string;
  tindakanKorektif: string;
  tindakanPreventif: string;
  penanggungJawab: string;
  targetSelesai: string;
  status: 'Terbuka' | 'Penyelidikan' | 'Implementasi' | 'Efektif Diverifikasi' | 'Ditutup';
  verifikasiPJT: boolean;
}

export interface ProdukKembalian {
  id: string;
  nomorRetur: string;
  fasyankes: string;
  namaAlkes: string;
  nomorBets: string;
  jumlah: number;
  satuan: string;
  alasanRetur: 'Cacat Kemasan' | 'Salah Kirim' | 'Mendekati Kedaluwarsa' | 'Dugaan Kerusakan Fungsi';
  statusKarantina: 'Di Ruang Karantina' | 'Dimusnahkan' | 'Dikembalikan ke Pabrik' | 'Layak Jual Kembali';
  catatanInspeksiQA: string;
  tanggalMasukKarantina: string;
}

// 3. Quality Control (QC)
export interface InspeksiQC {
  id: string;
  nomorLaporan: string;
  jenisInspeksi: 'Bahan Baku Datang' | 'Produk Jadi Manufaktur' | 'Barang Masuk Gudang' | 'Pemeriksaan Pra-Kirim';
  namaBarang: string;
  nomorBets: string;
  jumlahDiperiksa: number;
  tanggalInspeksi: string;
  inspektur: string;
  kondisiFisik: 'Baik & Utuh' | 'Kemasan Rusak' | 'Label Tidak Jelas';
  kebersihan: 'Memenuhi Syarat' | 'Tercemar';
  tanggalKedaluwarsa: string;
  hasilPemeriksaan: 'Lolos (Released)' | 'Karantina (Hold)' | 'Tolak (Rejected)';
  catatanPJT: string;
}

// 4. Gudang & Logistik
export type StatusStokFisik = 'AVAILABLE' | 'RESERVED' | 'QUARANTINE' | 'DAMAGED' | 'EXPIRED_LOCK';

/** Trek jamak inventaris: A = alat habis pakai (bets & FEFO), B = alat berat (serial & perawatan). */
export type JalurInventaris = 'A' | 'B';

export interface StokGudang {
  id: string;
  kodeSKU: string;
  namaAlkes: string;
  nomorIzinEdar: string;
  nomorBets: string;
  lokasiPenyimpanan: string; // Rak A-02, Cold Room 01, dll
  zonaSuhu: 'Cold Chain (2°C - 8°C)' | 'Ruang Sejuk AC (15°C - 25°C)' | 'Suhu Kamar (< 30°C)';
  jumlahStok: number;
  satuan: string;
  tanggalMasuk: string;
  tanggalKedaluwarsa: string;
  statusFEFO: 'Aman' | 'Perhatian (< 6 Bulan)' | 'Kritis (< 2 Bulan)' | 'Kedaluwarsa';
  // --- Dual-track, bin mapping, dan kunci karantina (cetak biru Warehouse & Logistics) ---
  gudangId?: string;
  binId?: string;
  statusStok?: StatusStokFisik;
  qtyDipesan?: number; // terkunci pesanan aktif; bebas dialokasikan = jumlahStok - qtyDipesan
  jalur?: JalurInventaris;
  nomorSerial?: string;
  rfidTagId?: string;
  tanggalDikunci?: string;
  alasanKunci?: string;
}

export interface LogSuhu {
  id: string;
  sensor: string;
  zona: string;
  suhu: number;
  kelembaban: number;
  waktu: string;
  status: 'Normal' | 'Peringatan Suhu Tinggi' | 'Peringatan Suhu Rendah';
}

export interface LogPestControl {
  id: string;
  tanggal: string;
  area: string;
  petugas: string;
  metode: 'Perangkap Umpan' | 'Fogging Sanitasi' | 'Lampu UV Serangga' | 'Inspeksi Fisik';
  hasilTemuan: 'Bebas Hama' | 'Ditemukan Indikasi' | 'Perlu Penanganan Khusus';
  tindakan: string;
}

// ==================== GUDANG & LOGISTIK — cetak biru Warehouse & Logistics ====================
// Bentuk data mengikuti skema inventory_batches / inventory_serials / inventory_locations pada
// cetak biru arsitek, tetapi dijalankan di atas koleksi lokal aplikasi sehingga setiap
// pergerakan tetap tertangkap pada jejak audit Old Value / New Value.

export type TipeGudang =
  | 'Gudang Utama'
  | 'Gudang Karantina'
  | 'Gudang Retur'
  | 'Gudang Rusak (Bad Stock)'
  | 'Cold Room';

/** 1. Multi-warehouse setup: satu lokasi fisik dengan penanggung jawab tetap. */
export interface GudangFisik {
  id: string;
  nama: string;
  tipe: TipeGudang;
  alamat: string;
  penanggungJawab: string;
  zonaSuhu: StokGudang['zonaSuhu'];
  jumlahBin: number;
  isActive: boolean;
  catatan: string;
}

/** 1. Bin location tracking — kode Aisle-Row-Shelf-Bin mempercepat picking & putting-away. */
export interface LokasiBin {
  id: string;
  gudangId: string;
  lorong: string;
  baris: string;
  rak: string;
  laci: string;
  zonaSuhu: StokGudang['zonaSuhu'];
  kategoriTersimpan: string;
  kapasitas: number;
  terpakai: number;
  satuan: string;
  rfidTagId: string;
  jarakDariDockMeter: number;
}

/** 1 & 3. Directed put-away — aturan membaca atribut katalog lalu menentukan tujuan simpan. */
export interface AturanSimpan {
  id: string;
  namaAturan: string;
  kategoriProduk?: IzinEdarAlkes['kategori'];
  zonaSuhuDibutuhkan?: StokGudang['zonaSuhu'];
  butuhUjiFungsi?: boolean;
  steril?: boolean;
  /** Aturan hanya berlaku bila bets sedang recall/investigasi KTD; tanpa penanda ini aturan ikut menyeret barang sehat ke karantina. */
  terikatRecall?: boolean;
  gudangTujuanId: string;
  prioritas: number;
  isActive: boolean;
  alasanRegulasi: string;
}

/** 4. Inbound — satu baris barang datang di dalam satu dokumen penerimaan. */
export interface BarisTerima {
  kodeSKU: string;
  namaAlkes: string;
  nomorBets: string;
  tanggalKedaluwarsa: string;
  qtyDipesan: number;
  qtyDiterima: number;
  qtyDitolak: number;
  satuan: string;
  binTujuanId: string;
  alasanPenolakan: string;
}

export type StatusPencocokanTerima =
  | 'Belum Dicocokkan'
  | 'Cocok'
  | 'Selisih Jumlah'
  | 'Bets Tidak Sesuai PO'
  | 'Ditolak Penerimaan';

/** 4. Penerimaan: PO matching, QC incoming, uji fungsi/kalibrasi, lalu cetak label. */
export interface TerimaBarang {
  id: string;
  nomorTerima: string;
  tanggalTerima: string;
  purchaseOrderId: string;
  nomorPurchaseOrder: string;
  namaPemasok: string;
  statusMatching: StatusPencocokanTerima;
  baris: BarisTerima[];
  hasilQCMasuk: InspeksiQC['hasilPemeriksaan'];
  butuhUjiFungsi: boolean;
  hasilUjiFungsi: 'Lolos Parameter Klinis' | 'Perlu Penyetelan' | 'Tidak Layak Pakai' | 'Belum Diuji';
  nomorLaporanQC: string;
  labelDicetak: boolean;
  rfidDitempel: boolean;
  /** Penanda posting agar barang masuk tidak dua kali menaikkan kartu stok. */
  sudahDipostingKeStok?: boolean;
  petugas: string;
  catatan: string;
}

/** 4. Outbound — satu langkah pengambilan pada rute picking terurut. */
export interface LangkahPicking {
  urutan: number;
  binId: string;
  kodeBin: string;
  nomorBets: string;
  qty: number;
  jarakMeter: number;
}

export type StatusSuratJalan =
  | 'Antre Picking'
  | 'Rute Tersusun'
  | 'Sedang Picking'
  | 'Selesai Packing'
  | 'Dimuat'
  | 'Terkirim'
  | 'Diterima Penerima';

/** 4. Surat jalan (delivery order) beserta manifes, e-Faktur, dan rujukan hukum paket LKPP. */
export interface SuratJalan {
  id: string;
  nomorSuratJalan: string;
  nomorPesanan: string;
  penjualanId: string;
  fasyankesTujuan: string;
  tanggalTerbit: string;
  status: StatusSuratJalan;
  rute: LangkahPicking[];
  jarakTotalMeter: number;
  qtyTotal: number;
  satuan: string;
  pengangkut: 'Armada Internal' | '3PL Ekspedisi' | 'Kargo Udara';
  namaKurir: string;
  nomorLacak: string;
  statusEFaktur: 'Belum Terbit' | 'Terbit' | 'Ditolak';
  nomorFaktur: string;
  nomorPaketLkpp: string;
  statusSyncLkpp: 'Tidak Berlaku' | 'Belum Sinkron' | 'Antre' | 'Tersinkron' | 'Gagal';
  penanggungJawab: string;
  catatan: string;
}

/** 5. Stock opname — satu baris hitung fisik. */
export interface BarisOpname {
  kodeSKU: string;
  namaAlkes: string;
  nomorBets: string;
  binId: string;
  qtySistem: number;
  qtyFisik: number | null;
  status: 'Belum Dihitung' | 'Cocok' | 'Selisih';
  catatan: string;
}

/** 5. Cycle counting tanpa menghentikan operasional; blind count menyembunyikan angka sistem. */
export interface OpnameStok {
  id: string;
  nomorOpname: string;
  tanggal: string;
  gudangId: string;
  cakupanZona: string;
  petugas: string;
  metode: 'Blind Count' | 'Open Count';
  baris: BarisOpname[];
  status: 'Berjalan' | 'Terkunci' | 'Selisih Diajukan' | 'Selesai';
  selisihUnit: number;
  verifikasiPJT: boolean;
  alasanSelisih: string;
}

export type TipePergerakan =
  | 'Penerimaan'
  | 'Pemindahan Rak'
  | 'Picking'
  | 'Pengiriman'
  | 'Opname'
  | 'Karantina'
  | 'Pemusnahan'
  | 'Penyesuaian'
  | 'Penarikan Recall';

/** 5. Log pergerakan immutable: hash rantai membuat baris lama tidak bisa diubah diam-diam. */
export interface JejakPergerakan {
  id: string;
  waktu: string;
  kodeSKU: string;
  namaAlkes: string;
  nomorBets: string;
  dariBin: string;
  keBin: string;
  jumlah: number;
  satuan: string;
  tipe: TipePergerakan;
  pengguna: string;
  peran: string;
  dokumenRujukan: string;
  alasan: string;
  hashSebelum: string;
  hash: string;
}

/** 5. Min-max & reorder point per SKU sebagai pemicu notifikasi ke Purchasing. */
export interface AmbangStok {
  id: string;
  kodeSKU: string;
  namaAlkes: string;
  rataRataTerjualPerHari: number;
  leadTimeHari: number;
  safetyStockHari: number;
  minStok: number;
  maxStok: number;
  gudangId: string;
  namaPemasok: string;
  isActive: boolean;
}

/** Arsitektur 1. Perangkat handheld & gerbang RFID yang menulis langsung ke stok. */
export interface KejadianScanner {
  id: string;
  waktu: string;
  perangkat: string;
  tipePerangkat: 'Handheld PDA' | 'RFID Gate' | 'RFID Tunnel' | 'Printer Label';
  protokol: 'USB/Serial' | 'MQTT';
  mode: 'Penerimaan' | 'Pengiriman' | 'Pemindahan Rak' | 'Opname';
  binDipindai: string;
  produkDipindai: string;
  nomorBets: string;
  jumlah: number;
  rujukanDokumen: string;
  hasilValidasi:
    | 'Tervalidasi'
    | 'Bin Tidak Sesuai Zona'
    | 'Bets Tidak Terdaftar'
    | 'Jumlah Melebihi Manifes'
    | 'Stok Terkunci Karantina';
  catatan: string;
}

/** Arsitektur 3. Antrean webhook sinkronisasi stok ke e-Katalog LKPP. */
export interface SinkronisasiLkpp {
  id: string;
  waktu: string;
  kodeSKU: string;
  namaProduk: string;
  nomorPaketLkpp: string;
  qtyDilaporkan: number;
  pemicu: 'Perubahan Stok' | 'Kerusakan' | 'Karantina' | 'Recall' | 'Pengiriman';
  status: 'Antre' | 'Terkirim' | 'Gagal' | 'Ditolak';
  percobaan: number;
  pesanRespons: string;
}

/** Arsitektur 3. Kiriman HL7 FHIR ke SATUSEHAT Logistik (SMILE) Kemenkes. */
export interface KirimanSatuSehat {
  id: string;
  waktu: string;
  tipeSumberDaya: 'SupplyDelivery' | 'Device' | 'Immunization' | 'Organization';
  nomorRujukan: string;
  kodeFasyankes: string;
  namaFasyankes: string;
  nomorBets: string;
  nomorSerial: string;
  suhuRantaiDingin: string;
  status: 'Belum Terkirim' | 'Antre' | 'Diterima (201)' | 'Ditolak (OperationOutcome)';
  payloadJson: string;
  catatan: string;
}

/** Konfigurasi ambang & endpoint. Token API pemerintah tidak pernah disimpan di aplikasi. */
export interface KonfigurasiGudang {
  umurKunciEdHari: number;
  ambangSelisihOpnamePersen: number;
  coldChainMinSuhu: number;
  coldChainMaxSuhu: number;
  menitMaksimumDiLuarRentang: number;
  frekuensiLogSuhuPerHari: number;
  prefixSuratJalan: string;
  endpointLkpp: string;
  endpointSatuSehat: string;
  klienSatuSehatTerdaftar: boolean;
}

// 5. Teknisi & Layanan Purna Jual
export interface LayananTeknis {
  id: string;
  nomorTiket: string;
  jenisLayanan: 'Instalasi & Uji Fungsi' | 'Kalibrasi Berkala' | 'Pemeliharaan Preventif' | 'Perbaikan Kerusakan';
  fasyankes: string;
  namaAlkes: string;
  tipeModel: string;
  nomorSeri: string;
  teknisi: string;
  tanggalJadwal: string;
  tanggalSelesai?: string;
  status: 'Menunggu Jadwal' | 'Proses Pengerjaan' | 'Selesai & Berita Acara Terbit' | 'Menunggu Suku Cadang';
  nomorSertifikatKalibrasi?: string;
  hasilUjiFungsi: 'Lolos Parameter Klinis' | 'Perlu Penyetelan' | 'Tidak Layak Pakai';
  catatanTeknisi: string;
}

// 6. Produksi / Manufaktur
export interface BetsProduksi {
  id: string;
  nomorBMR: string; // Batch Manufacturing Record
  namaProduk: string;
  nomorBets: string;
  jumlahRencana: number;
  jumlahRealisasi: number;
  satuan: string;
  ruangBersih: 'Cleanroom Kelas C' | 'Cleanroom Kelas D' | 'Area Perakitan Terkendali';
  tanggalMulai: string;
  tanggalTarget: string;
  status: 'Penimbangan' | 'Perakitan' | 'Pengemasan Primer' | 'Sterilisasi' | 'Rilis QC';
  catatanSanitasi: string;
  penanggungJawab: string;
}

// 7. Purchasing & Procurement
export interface PemasokAlkes {
  id: string;
  namaPemasok: string;
  kategori: 'Pabrikan Dalam Negeri' | 'Prinsipal Luar Negeri' | 'Distributor Tunggal' | 'Bahan Baku Steril';
  nomorIzinPenyalur: string; // SDAK / Izin Edar Produsen
  negara: string;
  statusAuditMutu: 'Terkualifikasi' | 'Perlu Re-evaluasi' | 'Ditangguhkan';
  skorEvaluasi: number; // 0 - 100
  tanggalEvaluasiTerakhir: string;
  kontak: string;
}

export interface PurchaseOrderAlkes {
  id: string;
  nomorPO: string;
  pemasokId: string;
  namaPemasok: string;
  tanggalPO: string;
  estimasiTiba: string;
  totalNilai: number;
  status: 'Diajukan' | 'Disetujui PJT' | 'Dalam Pengiriman' | 'Tiba di Gudang';
  catatanPJT: string;
}

// 8. Sales & Marketing
export interface PenjualanAlkes {
  id: string;
  nomorPesanan: string;
  fasyankes: string; // RSUP / RSUD / Klinik
  jalurPenjualan: 'e-Katalog LKPP' | 'Tender RS Pemerintah' | 'Pembelian Langsung RS Swasta' | 'Klinik & Laboratorium';
  namaAlkes: string;
  nomorBets: string;
  jumlah: number;
  satuan: string;
  totalHarga: number;
  statusVerifikasiEtikaIklan: 'Memenuhi Etika Promosi' | 'Perlu Review PJT';
  statusKirim: 'Verifikasi Pesanan' | 'Menunggu Alokasi FEFO' | 'Terkirim' | 'Diterima Fasyankes' | 'Dibatalkan';
  tanggalPesanan: string;
  pelangganId?: string;
  nomorIzinEdar?: string;
  hargaSatuan?: number;
  diskonNilai?: number;
  ppnPersen?: number;
  nomorFaktur?: string;
  metodePembayaran?: 'Tunai' | 'TOP 30 Hari' | 'TOP 45 Hari' | 'TOP 60 Hari' | 'Termin Bertahap';
  tanggalJatuhTempo?: string;
  hasilValidasiRegulasi?: HasilValidasiSO;
}

export interface HasilValidasiRegulasiItem {
  aturan: string;
  status: 'Lolos' | 'Ditolak';
  keterangan: string;
}

export interface HasilValidasiSO {
  status: 'Lolos' | 'Ditolak';
  tanggalValidasi: string;
  pengguna: string;
  pemeriksaan: HasilValidasiRegulasiItem[];
}

// 9. Post-Market Surveillance (PMS) / Vigilance
export interface LaporanKTD {
  id: string;
  nomorLaporanKTD: string;
  fasyankes: string;
  namaAlkes: string;
  nomorIzinEdar: string;
  nomorBets: string;
  nomorSeri?: string;
  tanggalKejadian: string;
  dampakPasien: 'Kematian' | 'Cedera Serius / Penurunan Fungsi Tubuh' | 'Cedera Ringan' | 'Malfungsi Tanpa Cedera';
  kronologi: string;
  statusLaporKemenkes: 'Belum Dilaporkan' | 'Terkirim ke e-Watch Alkes' | 'Investigasi Bersama Kemenkes' | 'Selesai';
  tindakanSegera: string;
  statusFSCA: 'Tidak Diperlukan' | 'Peringatan Keselamatan' | 'Rekomendasi Recall';
}

export interface PenarikanProduk {
  id: string;
  nomorRecall: string;
  namaAlkes: string;
  nomorBetsTerdampak: string;
  alasanRecall: string;
  klasifikasiRecall: 'Kelas I (Risiko Kematian/Cedera Serius)' | 'Kelas II (Risiko Medis Sementara)' | 'Kelas III (Tidak Menimbulkan Risiko Medis)';
  jumlahBeredar: number;
  jumlahTelahDitarik: number;
  fasyankesTerdampak: string[];
  tanggalMulaiRecall: string;
  targetSelesai: string;
  status: 'Pemberitahuan Dikirim' | 'Penarikan Lapangan' | 'Karantina Pusat' | 'Pemusnahan / Return Pabrik' | 'Ditutup';
}

// 10. HRD & Pelatihan
export interface PelatihanPersonil {
  id: string;
  judulPelatihan: string;
  standarRegulasi: 'CDAKB Permenkes 4/2014' | 'CPAKB Permenkes 20/2017' | 'ISO 13485:2016' | 'K3 & Higiene Medis' | 'Manajemen Suhu Dingin';
  tanggalPelaksanaan: string;
  instruktur: string;
  peserta: string[];
  jumlahPeserta: number;
  statusEvaluasi: 'Tuntas & Bersertifikat' | 'Jadwal Mendatang' | 'Perlu Ujian Ulang';
  skorKelulusanRataRata: number;
}

export interface SertifikasiPegawai {
  id: string;
  namaKaryawan: string;
  jabatan: string;
  divisi: string;
  nomorSIP_STR?: string; // Khusus PJT Apoteker / Elektromedis
  sertifikasiCDAKB: boolean;
  sertifikasiISO13485: boolean;
  tanggalMasaBerlakuSertifikat: string;
}

// 11. Finance & Accounting
export interface TransaksiKeuangan {
  id: string;
  nomorFaktur: string;
  kategori: 'Pendapatan Alkes' | 'Biaya Uji Kalibrasi' | 'Biaya Audit ISO/CDAKB' | 'Pengadaan Suku Cadang' | 'Biaya Retur Mutu';
  fasyankesAtauPemasok: string;
  tanggal: string;
  jumlah: number;
  statusPembayaran: 'Lunas' | 'Menunggu Jatuh Tempo' | 'Lewat Jatuh Tempo';
  ppnStatus: 'PPN 11% Terbit Faktur Pajak' | 'Bebas PPN';
}

// 12. IT & Traceability Hub
export interface LogAuditTrail {
  id: string;
  waktu: string;
  pengguna: string;
  peran: string;
  modul: string;
  aktivitas: string;
  nomorReferensi: string;
  statusIntegritas: 'Tervalidasi Digital' | 'Peringatan';
  // Jejak perubahan kolom untuk audit regulasi medis (CDAKB & ISO 13485 klausul 4.2.4 / data integrity ALCOA+)
  perubahan?: { kolom: string; nilaiLama: string; nilaiBaru: string }[];
}

export interface TraceabilityResult {
  nomorBets: string;
  namaAlkes: string;
  nomorIzinEdar: string;
  produsen: string;
  tanggalPenerimaan: string;
  hasilInspeksiQC: string;
  lokasiGudang: string;
  logSuhuStatus: string;
  fasyankesPenerima: {
    nama: string;
    nomorSuratJalan: string;
    tanggalKirim: string;
    jumlah: number;
  }[];
  statusRecall: 'Aman (Tidak Ada Recall)' | 'Dalam Pengawasan Recall';
}

// 13. HRIS (Human Resource Information System) Alkes
export type LokasiKerja = 'Pabrik Manufaktur' | 'Kantor Pusat' | 'Gudang Distribusi';

export interface RiwayatMutasi {
  id: string;
  karyawanId: string;
  tanggalEfektif: string;
  tanggalBerakhir: string | null;
  jabatan: string;
  divisi: string;
  lokasi: LokasiKerja;
  grade: string;
  alasanMutasi: string;
}

export interface GradeJabatan {
  id: string;
  kodeGrade: string;
  namaGrade: string;
  rentangGajiMin: number;
  rentangGajiMax: number;
  contohJabatan: string[];
  uraianTugasRingkas: string;
}

export interface KaryawanHRIS {
  id: string;
  nik: string;
  nama: string;
  jabatan: string;
  divisi: string;
  lokasi: LokasiKerja;
  grade: string;
  statusKaryawan: 'Tetap' | 'Kontrak (PKWT)' | 'Outsourcing';
  tanggalBergabung: string;
  tanggalLahir: string;
  statusRekamMedis: 'Fit to Work' | 'Fit with Restriction' | 'Perlu Evaluasi';
  gajiPokok: number;
  sertifikasi: { nama: string; nomor: string; masaBerlaku: string }[];
}

export type SumberAbsensi = 'Geofencing GPS (Mobile)' | 'Fingerprint (Pabrik)' | 'Face Recognition (Pabrik)' | 'Manual HR';

export interface JadwalShift {
  id: string;
  namaShift: 'Shift 1 (07.00-15.00)' | 'Shift 2 (15.00-23.00)' | 'Shift 3 (23.00-07.00)';
  area: string;
  tanggalMulai: string;
  tanggalBerakhir: string;
  polaRotasi: string;
  tim: string[];
}

export interface LogAbsensi {
  id: string;
  karyawanId: string;
  nama: string;
  tanggal: string;
  jamMasuk: string;
  jamKeluar: string;
  sumber: SumberAbsensi;
  status: 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Mangkir';
  lokasi: string;
}

export interface PerhitunganLembur {
  id: string;
  karyawanId: string;
  nama: string;
  tanggal: string;
  jamLembur: number;
  upahPerJam: number;
  totalLembur: number;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';
}

export interface SlipGaji {
  id: string;
  periode: string;
  karyawanId: string;
  nama: string;
  gajiPokok: number;
  tunjanganKehadiran: number;
  insentifSales: number;
  insentifProduksi: number;
  potonganAbsensi: number;
  lembur: number;
  bpjsKesehatanKaryawan: number;
  bpjsJhtKaryawan: number;
  bpjsJpKaryawan: number;
  pph21: number;
  tunjanganPajak: number;
  metodePph21: 'Gross' | 'Gross Up' | 'Net';
  takeHomePay: number;
  status: 'Draft' | 'Diproses' | 'Dibayar';
}

export interface KandidatATS {
  id: string;
  nama: string;
  posisiDilamar: string;
  tahap: 'Skrining CV' | 'Tes Teknis' | 'Wawancara User' | 'Background Check' | 'Offering' | 'Onboarding' | 'Ditolak';
  skorKataKunci: number;
  kataKunciTerdeteksi: string[];
  verifikasiLisensi: { jenis: string; nomor: string; status: 'Terverifikasi' | 'Menunggu' | 'Tidak Valid' }[];
  checklistOnboarding: { item: string; selesai: boolean }[];
  tanggalLamar: string;
}

export interface SkillMatrix {
  id: string;
  karyawanId: string;
  nama: string;
  mesinAtauProses: string;
  level: 'Trainee' | 'Operator' | 'Mahir' | 'Trainer';
  tanggalPenilaian: string;
  penilai: string;
}

export interface KpiKaryawan {
  id: string;
  karyawanId: string;
  nama: string;
  kerangka: 'Balanced Scorecard (Kantor/Sales)' | 'Efisiensi Manufaktur';
  periode: string;
  indikator: string;
  target: string;
  realisasi: string;
  capaianPersen: number;
}

export interface UmpanBalik360 {
  id: string;
  karyawanId: string;
  nama: string;
  periode: string;
  skorAtasan: number;
  skorRekan: number;
  skorBawahan: number;
  skorDiriSendiri: number;
  status: 'Berjalan' | 'Selesai';
}

export interface InsidenK3 {
  id: string;
  nomorLaporan: string;
  tanggal: string;
  area: string;
  jenis: 'Kecelakaan Kerja' | 'Near Miss' | 'Penyakit Akibat Kerja';
  kronologi: string;
  tingkatRisiko: 'Tinggi' | 'Sedang' | 'Rendah';
  tindakanKorektif: string;
  status: 'Investigasi' | 'CAPA Berjalan' | 'Ditutup';
  hariKehilangan: number;
}

export interface RekamMcu {
  id: string;
  karyawanId: string;
  nama: string;
  tanggalMcu: string;
  jenisPemeriksaan: string;
  paparan: string;
  hasil: 'Fit to Work' | 'Fit with Restriction' | 'Perlu Evaluasi';
  dokterPemeriksa: string;
  jadwalBerikutnya: string;
}

export interface DistribusiApd {
  id: string;
  karyawanId: string;
  nama: string;
  jenisApd: string;
  standar: string;
  tanggalDistribusi: string;
  jumlah: number;
  kondisi: 'Baru' | 'Penggantian Berkala';
  tandaTerima: boolean;
}

// ==================== SALES & MARKETING (Cetak Biru Divisi Komersial) ====================

export type TipeFasyankes =
  | 'RS Pemerintah'
  | 'RS Swasta'
  | 'Klinik'
  | 'Apotek'
  | 'Laboratorium'
  | 'Dinas Kesehatan';

export type StatusAkreditasi = 'Paripurna' | 'Utama' | 'Madya' | 'Pratama' | 'Belum Terakreditasi';

/** 1.1 B2B Customer Profiling — sekaligus dasar Credit Limit & TOP Control (4.3) */
export interface PelangganB2B {
  id: string;
  kodePelanggan: string;
  namaInstalasi: string;
  tipeFasyankes: TipeFasyankes;
  provinsi: string;
  rayonDistribusi: string;
  akreditasi: StatusAkreditasi;
  nomorIzinOperasional: string;
  tanggalBerlakuIzin: string;
  penanggungJawabPengadaan: string;
  namaDokterPenanggungJawab: string;
  spesialisasiDokter: string;
  batasKredit: number;
  piutangBerjalan: number;
  tanggalJatuhTempoPiutang: string;
  termsOfPaymentHari: number;
  statusPelanggan: 'Aktif' | 'Non-aktif';
}

export type TahapProspek =
  | 'Perkenalan Alat'
  | 'Demo Produk'
  | 'Negosiasi Harga'
  | 'Penawaran Resmi'
  | 'Pemenang'
  | 'Gagal';

/** 1.2 Lead & Opportunity Pipelines */
export interface ProspekAlkes {
  id: string;
  nomorProspek: string;
  namaProspek: string;
  tipeFasyankes: TipeFasyankes;
  sumberLead: 'Pameran' | 'Simposium' | 'Cold Call' | 'Rujukan' | 'LPSE' | 'e-Katalog LKPP' | 'E-Purchasing' | 'Situs Web';
  tahap: TahapProspek;
  produkDiminati: string;
  nilaiEstimasi: number;
  probabilitasPersen: number;
  medRep: string;
  rayonDistribusi: string;
  tanggalDibuat: string;
  tanggalTindakLanjut: string;
  catatan: string;
}

/** 1.3 Mapping Area & Sales Territory */
export interface TeritorialPenjualan {
  id: string;
  kodeRayon: string;
  namaRayon: string;
  provinsiDilayani: string[];
  medRep: string;
  nikMedRep: string;
  targetTahunan: number;
  realisasiYtd: number;
  daftarPelanggan: string[];
  catatanTumpangTindih: string;
}

/** 2.1 LPSE Scraper & Alert System */
export interface TenderAlkes {
  id: string;
  nomorPengumuman: string;
  namaPengadaan: string;
  sumber: 'LPSE' | 'e-Katalog LKPP' | 'E-Purchasing' | 'Tender Mandiri RS';
  instansiPembuat: string;
  provinsi: string;
  nilaiHps: number;
  batasAkhirPengajuan: string;
  statusTender: 'Aktif' | 'Hampir Tutup' | 'Sudah Tutup' | 'Dimenangkan' | 'Kalah';
  persyaratanKunci: string[];
  produkDitawarkan: string;
  nomorIzinEdarDipersyaratkan: string;
  tautanPengumuman: string;
}

/** 2.2 Contract & Pricing Agreement — penguncian harga hasil tender */
export interface KontrakHarga {
  id: string;
  nomorKontrak: string;
  pelangganId: string;
  periodeMulai: string;
  periodeSelesai: string;
  statusKontrak: 'Aktif' | 'Habis Masa' | 'Dibatalkan';
  daftarHargaTerkunci: { namaAlkes: string; hargaTerkunci: number; satuan: string }[];
  ditandatanganiOleh: string;
  verifikasiEtikaPromosiPjt: 'Memenuhi Etika Promosi' | 'Perlu Review PJT';
}

/** 3.1 Visit Planner & Geo-Tagging */
export interface KunjunganMedRep {
  id: string;
  tanggal: string;
  medRep: string;
  pelangganId: string;
  tujuanKunjungan: 'Perkenalan Alat' | 'Demo Produk' | 'Negosiasi' | 'Pascapenjualan' | 'Pengumpulan Dokumen Tender';
  koordinatFasyankes: { lat: number; lon: number };
  koordinatCheckIn: { lat: number; lon: number } | null;
  radiusGeofenceMeter: number;
  jamCheckIn: string;
  jamCheckOut: string | null;
  hasilKunjungan: string;
  tindakLanjut: string;
}

/** 3.2 Product Knowledge & Digital Brochure */
export interface PengetahuanProdukAlkes {
  id: string;
  namaAlkes: string;
  tipeModel: string;
  kategori: IzinEdarAlkes['kategori'];
  nomorIzinEdar: string;
  tanggalKedaluwarsaNie: string;
  produsen: string;
  spesifikasiRingkas: string;
  poinJual: string[];
  tautanBrosur: string;
  tautanVideoDemo: string;
  pertanyaanTeknisUmum: { pertanyaan: string; jawaban: string }[];
}

/** 3.3 Mobile Order Taking (Pre-Order) */
export interface PraOrderMedRep {
  id: string;
  nomorPraOrder: string;
  pelangganId: string;
  medRep: string;
  tanggal: string;
  item: { namaAlkes: string; nomorBets: string; jumlah: number; hargaSatuan: number }[];
  statusPraOrder: 'Draf' | 'Terkirim ke Gudang' | 'Konversi Sales Order' | 'Ditolak';
}

/** 4.2 Multi-Level Pricing & Discount Engine */
export interface SkemaHargaAlkes {
  id: string;
  namaSkema: string;
  namaAlkes: string;
  level: 'Harga Eceran' | 'Harga Institusi' | 'Harga Distributor';
  pelangganTarget: string;
  hargaDasar: number;
  potonganKuantitas: { ambangMinUnit: number; diskonPersen: number }[];
  bonusUnit: number;
  status: 'Aktif' | 'Non-aktif';
}

/** 5.1 Batch/Lot & Serial Number Tracking */
export interface UnitSerialAlkes {
  id: string;
  nomorSerial: string;
  nomorBets: string;
  namaAlkes: string;
  pelangganId: string;
  nomorSalesOrder: string;
  nomorInvoice: string;
  tanggalKirim: string;
  statusUnit: 'Terjual' | 'Di Gudang' | 'Unit Demo' | 'Dalam Perbaikan' | 'Ditarik (Recall)';
  // --- Trek B: siklus hidup alat berat (penerimaan -> instalasi -> kalibrasi -> pemeliharaan -> decommissioning) ---
  tahapSiklusHidup?: 'Penerimaan Gudang' | 'Di Gudang' | 'Terinstalasi di Fasyankes' | 'Kalibrasi Berkala' | 'Pemeliharaan' | 'Decommissioning';
  kalibrasiBerikutnya?: string;
  tanggalInstalasi?: string;
  kodeFasyankesSatuSehat?: string;
}

/** 5.2 Warranty & Instalasi Base */
export interface GaransiInstalasi {
  id: string;
  nomorSerial: string;
  namaAlkes: string;
  pelangganId: string;
  tanggalInstalasi: string;
  teknisi: string;
  masaGaransiBulan: number;
  jadwalPemeliharaanBerikutnya: string;
  catatan: string;
}

/** 6.1 Event & Simposium Manager */
export interface KampanyeAlkes {
  id: string;
  namaKegiatan: string;
  jenisKegiatan: 'Simposium' | 'Pameran Internasional' | 'Workshop Klinis' | 'Edukasi Spesialis';
  lokasi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  anggaran: number;
  realisasiBiaya: number;
  prospekDihasilkan: number;
  nilaiKonversi: number;
  penanggungJawab: string;
  status: 'Rencana' | 'Berjalan' | 'Selesai';
}

/** 6.2 Sample & Demo Unit Tracking */
export interface UnitDemoAlkes {
  id: string;
  nomorUnit: string;
  namaAlkes: string;
  nomorBets: string;
  pelangganId: string;
  tanggalPinjam: string;
  tanggalHarusKembali: string;
  statusPinjam: 'Terpinjam' | 'Dikembalikan' | 'Konversi Jadi Penjualan' | 'Hilang';
  penanggungJawab: string;
  nomorBeritaAcara: string;
}

/** 6.3 Loyalty & Rebate Program */
export interface ProgramRebate {
  id: string;
  namaProgram: string;
  mitraId: string;
  periode: string;
  targetVolumeUnit: number;
  realisasiVolumeUnit: number;
  persenRebate: number;
  nilaiTransaksiPeriode: number;
  statusPembayaran: 'Belum Jatuh Tempo' | 'Terverifikasi' | 'Terbayar';
}

/** 7.2 Demand Forecasting — basis historis per produk, rayon, dan bulan */
export interface RiwayatPenjualanBulanan {
  id: string;
  namaAlkes: string;
  kategoriProduk: IzinEdarAlkes['kategori'];
  rayonDistribusi: string;
  bulan: string;
  unitTerjual: number;
  nilaiPenjualan: number;
}

// ==================== NEWSLETTER & MAILING LIST — mesin: listmonk ====================
// Nama entitas, status, dan enum mengikuti istilah asli listmonk (Subscriber, List,
// Campaign, Template, Media) supaya cocok dengan dashboard dan REST API-nya
// (knadh/listmonk — models/models.go + docs/api.md); penjelasan tetap berbahasa Indonesia.

export type TipeDaftarSurat = 'Private' | 'Public' | 'Group';
export type MetodeOptInSurat = 'single' | 'double';
/** Public list harus dikonfirmasi owner sebelum bisa dipakai mengirim. */
export type StatusDaftarSurat = 'unconfirmed' | 'confirmed';
/** Blocked diturunkan dari ambang bounce beruntun; Imported = belum pernah dikirim. */
export type StatusPelangganSurat = 'Enabled' | 'Unsubscribed' | 'Blocked' | 'Imported';
export type StatusKampanyeSurat =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'sending'
  | 'finished'
  | 'cancelled';
/** optin = kampanye konfirmasi keanggotaan, regular = buletin/blast. */
export type TipeKampanyeSurat = 'regular' | 'optin';
export type MimeKampanyeSurat = 'text/plain' | 'text/html' | 'multipart/alternative';
export type TipeTemplatSurat = 'campaign' | 'optin' | 'tx' | 'public-list';
export type SumberPelangganSurat = 'Impor CSV' | 'Public list' | 'Double opt-in' | 'API / CRM' | 'Entri manual';

/** listmonk: List (POST /api/lists). Group tidak punya halaman langganan sendiri. */
export interface DaftarSurat {
  id: string;
  nama: string;
  tipe: TipeDaftarSurat;
  optin: MetodeOptInSurat;
  status: StatusDaftarSurat;
  tag: string[];
  templatDefaultId: string;
  keterangan: string;
}

/** listmonk: Subscriber (int64 id + uuid + email unik + attributes JSONB). */
export interface PelangganSurat {
  id: string;
  uuid: string;
  surel: string;
  nama: string;
  status: StatusPelangganSurat;
  daftarIds: string[];
  atribut: Record<string, string | number>;
  sumber: SumberPelangganSurat;
  tanggalBerlangganan: string;
  bounceBeruntun: number;
  catatan: string;
}

/** listmonk: Link tracking — total dan unik dilaporkan terpisah. */
export interface TautanTerlacak {
  url: string;
  klikTotal: number;
  klikUnik: number;
}

/** listmonk: Campaign (POST /api/campaigns). Hanya satu kampanye boleh berstatus mengirim. */
export interface KampanyeSurat {
  id: string;
  nomorKampanye: string;
  nama: string;
  subjek: string;
  dariNama: string;
  dariSurel: string;
  tipe: TipeKampanyeSurat;
  mime: MimeKampanyeSurat;
  daftarIds: string[];
  templatId: string;
  status: StatusKampanyeSurat;
  jadwalKirim: string;
  jadwalSelesai: string;
  targetTotal: number;
  terkirim: number;
  dibukaTotal: number;
  dibukaUnik: number;
  klikTotal: number;
  klikUnik: number;
  bounce: number;
  keluhan: number;
  berhentiLangganan: number;
  lajuPerDetik: number;
  tautan: TautanTerlacak[];
  penanggungJawab: string;
  catatan: string;
}

/** listmonk: Template — body memakai Go template, mis. {{ WrapText .Content }} dan {{ L "Unsubscribe" }}. */
export interface TemplatSurat {
  id: string;
  nama: string;
  tipe: TipeTemplatSurat;
  bodyHtml: string;
  isActive: boolean;
  catatan: string;
}

/** listmonk: Media library — gambar/lampiran yang dirujuk templat. */
export interface MediaSurat {
  id: string;
  namaFile: string;
  tipeMime: string;
  ukuranKB: number;
  url: string;
  diunggahPada: string;
  penanggungJawab: string;
}

/** listmonk: Transactional messages — POST /api/message-email, tanpa statistik campaign. */
export interface PesanTransaksional {
  id: string;
  surel: string;
  subjek: string;
  status: 'queued' | 'sent' | 'failed';
  dikirimPada: string;
  keperluan: string;
}

/** Kunci settings listmonk (app.*, smtp.*, bounce.*). Kredensial SMTP tidak pernah
 *  disimpan di aplikasi — password dan API key hanya ada di instance listmonk. */
export interface KonfigurasiSurat {
  appFromName: string;
  appFromEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpAuth: 'none' | 'plain' | 'login' | 'cram';
  smtpEncryption: 'none' | 'tls' | 'starttls';
  smtpUser: string;
  /** app.rate — batas pesan per detik per pekerja. */
  appRate: number;
  /** app.batch_size — harus lebih besar dari laju x jumlah thread. */
  batchSize: number;
  /** app.concurrency — jumlah pekerja pengirim. */
  concurrency: number;
  /** app.max_send_errors — kelebihan kesalahan menjeda kampanye otomatis. */
  maxSendErrors: number;
  /** bounce.* — jumlah bounce beruntun sebelum aksi. */
  ambangBounce: number;
  aksiBounce: 'blocklist' | 'unsubscribe' | 'delete';
  optInDefault: MetodeOptInSurat;
  lacakTautan: boolean;
  urlInstance: string;
}

// ==================== WEBSITE (CMS) — Konten Situs Publik ====================
// Pola mengikuti dashboard website bejo-pos: satu konfigurasi akar, pemisahan draf
// dan versi terbit, setiap item punya id + isActive, dan seluruh perubahan tercatat
// pada audit trail (Old Value / New Value).

export type HalamanWebsite =
  | 'beranda'
  | 'produk'
  | 'solusi'
  | 'layanan'
  | 'sumber-daya'
  | 'tentang'
  | 'kontak';

export type TipeTautanWebsite = 'whatsapp' | 'url' | 'halaman' | 'email' | 'telepon';

/** Tujuan tombol/tautan: chat WA, URL luar, halaman internal, surel, atau telepon. */
export interface TautanWebsite {
  tipe: TipeTautanWebsite;
  nilai?: string;
}

/** Dasar item konten yang bisa disusun ulang, disembunyikan, dan ditelusuri asal datanya. */
export interface ItemWebsite {
  id: string;
  isActive: boolean;
  /** id entitas aplikasi asal (mis. id izin edar) — dipakai saat sinkronisasi konten */
  sumberId?: string;
  /** true = sudah disunting manual, tidak ditimpa saat sinkron dari data aplikasi */
  dikunci?: boolean;
}

/** Judul sebuah seksi: label kecil, judul H2, sub-judul, dan tautan "lihat semua". */
export interface KepalaSeksi {
  eyebrow?: string;
  judul: string;
  subjudul?: string;
  teksTautan?: string;
  tautan?: TautanWebsite;
}

/** Seksi berisi daftar kartu: dapat dimatikan seutuhnya, punya judul, dan daftar item. */
export interface SeksiDaftar<T extends ItemWebsite> {
  isActive: boolean;
  kepala: KepalaSeksi;
  item: T[];
}

/** Identitas merek pada header, footer, dan tab browser. */
export interface IdentitasSitus {
  nama: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  judulSitus: string;
  metaDeskripsi: string;
}

export interface TautanMenuWebsite extends ItemWebsite {
  label: string;
  halaman?: HalamanWebsite;
  kategoriKey?: string;
}

export interface KolomMenuWebsite {
  id: string;
  judul: string;
  tautan: TautanMenuWebsite[];
}

/** Item navigasi header; 'mega' membuka panel kolom, 'link' menuju satu halaman. */
export interface ItemMenuWebsite extends ItemWebsite {
  label: string;
  tipe: 'mega' | 'link';
  halaman?: HalamanWebsite;
  kolom?: KolomMenuWebsite[];
}

export interface AksiHeaderWebsite {
  /** tombol pil utama header, mis. "Pesan Oligo" pada situs referensi */
  utamaTeks: string;
  utamaTautan: TautanWebsite;
  /** tombol sekunder, mis. "Hubungi Kami" */
  cadanganTeks: string;
  cadanganTautan: TautanWebsite;
  /** tautan login klien, mis. "Portal Pelanggan" */
  portalTeks?: string;
  portalUrl?: string;
}

export interface HeroSitus {
  isActive: boolean;
  badge: string;
  judul: string;
  subjudul: string;
  gambarUrl?: string;
  teksCtaUtama: string;
  tautanCtaUtama: TautanWebsite;
  teksCtaCadangan: string;
  tautanCtaCadangan: TautanWebsite;
}

/** Banner utama (slider). Rekomendasi gambar 1600 x 900 px. */
export interface SlideSitus extends ItemWebsite {
  eyebrow: string;
  judul: string;
  subjudul?: string;
  teksCta?: string;
  tautan?: TautanWebsite;
  imageUrl?: string;
}

/** Lencana pada strip kepercayaan di bawah hero (nomor sertifikat, skema mutu). */
export interface LencanaKepercayaanWebsite extends ItemWebsite {
  teks: string;
  keterangan: string;
}

/** Kartu solusi per kelompok kebutuhan (merujuk kategori izin edar alkes). */
export interface SolusiWebsite extends ItemWebsite {
  judul: string;
  deskripsi: string;
  kategoriKey?: string;
  jumlahProduk?: number;
  imageUrl?: string;
}

/** Kartu produk katalog — sumbernya register izin edar + stok gudang + brochure hub. */
export interface ProdukWebsite extends ItemWebsite {
  nama: string;
  tipeModel: string;
  kategori: string;
  kelasRisiko: string;
  nomorIzinEdar: string;
  statusIzinEdar: string;
  produsen: string;
  negaraAsal: string;
  spesifikasi: string;
  poinJual: string[];
  tautanBrosur?: string;
  tautanVideo?: string;
  stokTersedia?: number;
  satuan?: string;
  badge?: string;
}

/** Tahap perjalanan laboratorium/klien yang dilayani perusahaan. */
export interface LangkahPerjalananWebsite extends ItemWebsite {
  tahap: string;
  judul: string;
  deskripsi: string;
}

/** Jenis institusi yang dilayani, dihitung dari profil pelanggan B2B. */
export interface InstitusiWebsite extends ItemWebsite {
  nama: string;
  deskripsi: string;
  jumlahPelanggan?: number;
  contoh?: string;
}

/** Merek/prinsipal yang disalurkan, diambil dari data pemasok terverifikasi. */
export interface MerekWebsite extends ItemWebsite {
  nama: string;
  kategori: string;
  negara: string;
  keterangan: string;
  imageUrl?: string;
}

export interface StatistikWebsite extends ItemWebsite {
  nilai: string;
  label: string;
  keterangan: string;
}

/** Kegiatan ilmiah: simposium, pameran, workshop (sumber: KampanyeAlkes). */
export interface KegiatanWebsite extends ItemWebsite {
  judul: string;
  jenis: string;
  lokasi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsi?: string;
  status: string;
}

/** Penawaran/promo produk — sumbernya skema harga & program rebate. */
export interface PromoWebsite extends ItemWebsite {
  judul: string;
  deskripsi: string;
  namaAlkes?: string;
  potongan?: string;
  periode?: string;
  badge?: string;
  tautan?: TautanWebsite;
}

/** Berita & sumber daya (artikel, brosur, sertifikat elektronik). */
export interface ArtikelWebsite extends ItemWebsite {
  judul: string;
  ringkasan: string;
  kategori: string;
  tanggal: string;
  imageUrl?: string;
  tautan?: TautanWebsite;
}

export interface TestimoniWebsite extends ItemWebsite {
  kutipan: string;
  penulis: string;
  jabatan: string;
  institusi: string;
}

export interface GaleriWebsite extends ItemWebsite {
  judul: string;
  keterangan?: string;
  imageUrl?: string;
}

export interface FaqWebsite extends ItemWebsite {
  pertanyaan: string;
  jawaban: string;
}

/** Kantor pusat, cabang, dan rayon distribusi (sumber: TeritorialPenjualan). */
export interface KantorWebsite extends ItemWebsite {
  nama: string;
  alamat: string;
  telepon?: string;
  email?: string;
  penanggungJawab?: string;
  provinsiDilayani?: string;
}

export interface KontakSitus {
  telepon: string;
  email: string;
  whatsapp?: string;
  pesanPembukaWA: string;
  jamOperasional: string;
  alamatKantor: string;
  tautanPeta?: string;
}

export interface SosialWebsite extends ItemWebsite {
  label: string;
  url: string;
}

export interface TautanFooter extends ItemWebsite {
  label: string;
  halaman?: HalamanWebsite;
  kategoriKey?: string;
}

export interface KolomFooterWebsite {
  id: string;
  judul: string;
  tautan: TautanFooter[];
}

export interface CapaianTentang {
  nilai: string;
  label: string;
}

/** Halaman/seksi "Tentang Kami" — profil perusahaan, portofolio, kepatuhan. */
export interface TentangSitus {
  isActive: boolean;
  kepala: KepalaSeksi;
  paragraf: string[];
  imageUrl?: string;
  capaian: CapaianTentang[];
}

/** Seksi konsultasi satu-kesatu ala blok "Konsultasikan Kebutuhan Anda". */
export interface KonsultasiSitus {
  isActive: boolean;
  kepala: KepalaSeksi;
  catatan: string;
  teksCta: string;
  tautan: TautanWebsite;
}

/** Seluruh isi situs publik. Tidak ada teks hard-code di komponen renderer. */
export interface KonfigurasiSitus {
  /** true = konten tampil di situs publik; false = tahan (on hold) */
  isPublished: boolean;
  lastModifiedAt: number;
  lastModifiedBy?: string;
  lastPublishedAt?: number;
  identitas: IdentitasSitus;
  header: AksiHeaderWebsite;
  menu: ItemMenuWebsite[];
  hero: HeroSitus;
  slide: SeksiDaftar<SlideSitus>;
  kepercayaan: SeksiDaftar<LencanaKepercayaanWebsite>;
  solusi: SeksiDaftar<SolusiWebsite>;
  konsultasi: KonsultasiSitus;
  statistik: SeksiDaftar<StatistikWebsite>;
  produk: SeksiDaftar<ProdukWebsite>;
  merek: SeksiDaftar<MerekWebsite>;
  perjalanan: SeksiDaftar<LangkahPerjalananWebsite>;
  institusi: SeksiDaftar<InstitusiWebsite>;
  kegiatan: SeksiDaftar<KegiatanWebsite>;
  promo: SeksiDaftar<PromoWebsite>;
  artikel: SeksiDaftar<ArtikelWebsite>;
  galeri: SeksiDaftar<GaleriWebsite>;
  testimoni: SeksiDaftar<TestimoniWebsite>;
  faq: SeksiDaftar<FaqWebsite>;
  tentang: TentangSitus;
  kantor: SeksiDaftar<KantorWebsite>;
  kontak: KontakSitus;
  sosial: SeksiDaftar<SosialWebsite>;
  footerKolom: KolomFooterWebsite[];
  footerCatatan: string;
}
