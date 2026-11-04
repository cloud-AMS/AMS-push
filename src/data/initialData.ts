import {
  IzinEdarAlkes,
  SertifikatPerusahaan,
  DokumenMutu,
  CAPARecord,
  ProdukKembalian,
  InspeksiQC,
  StokGudang,
  LogSuhu,
  LogPestControl,
  LayananTeknis,
  BetsProduksi,
  PemasokAlkes,
  PurchaseOrderAlkes,
  PenjualanAlkes,
  LaporanKTD,
  PenarikanProduk,
  PelatihanPersonil,
  SertifikasiPegawai,
  TransaksiKeuangan,
  LogAuditTrail,
  KaryawanHRIS,
  GradeJabatan,
  RiwayatMutasi,
  JadwalShift,
  LogAbsensi,
  PerhitunganLembur,
  SlipGaji,
  KandidatATS,
  SkillMatrix,
  KpiKaryawan,
  UmpanBalik360,
  InsidenK3,
  RekamMcu,
  DistribusiApd,
  PelangganB2B,
  ProspekAlkes,
  TeritorialPenjualan,
  TenderAlkes,
  KontrakHarga,
  KunjunganMedRep,
  PengetahuanProdukAlkes,
  PraOrderMedRep,
  SkemaHargaAlkes,
  UnitSerialAlkes,
  GaransiInstalasi,
  KampanyeAlkes,
  UnitDemoAlkes,
  ProgramRebate,
  RiwayatPenjualanBulanan,
  DaftarSurat,
  PelangganSurat,
  KampanyeSurat,
  TemplatSurat,
  MediaSurat,
  PesanTransaksional,
  KonfigurasiSurat,
  GudangFisik,
  LokasiBin,
  AturanSimpan,
  TerimaBarang,
  SuratJalan,
  OpnameStok,
  JejakPergerakan,
  AmbangStok,
  KejadianScanner,
  SinkronisasiLkpp,
  KirimanSatuSehat,
  KonfigurasiGudang
} from '../types';

export const INITIAL_IZIN_EDAR: IzinEdarAlkes[] = [
  {
    id: 'NIE-001',
    namaAlkes: 'Patient Monitor Multi-Parameter (ECG, SpO2, NIBP, Temp)',
    tipeModel: 'AMS-V12 Pro',
    nomorIzinEdar: 'KEMENKES RI AKL 20501819203',
    kategori: 'Elektromedik Non Radiasi',
    kelasRisiko: 'Kelas C',
    produsen: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    negaraAsal: 'Tiongkok',
    tanggalTerbit: '2023-04-15',
    tanggalKedaluwarsa: '2028-04-15',
    status: 'Aktif',
    statusPerpanjangan: 'Aman',
    keterangan: 'Telah terdaftar e-Katalog LKPP dan lolos uji keselamatan listrik IEC 60601-1'
  },
  {
    id: 'NIE-002',
    namaAlkes: 'Syringe Pump Presisi Tinggi',
    tipeModel: 'AMS-SP500',
    nomorIzinEdar: 'KEMENKES RI AKD 20501910234',
    kategori: 'Elektromedik Non Radiasi',
    kelasRisiko: 'Kelas B',
    produsen: 'PT Anugrah Mitra Selaras',
    negaraAsal: 'Indonesia',
    tanggalTerbit: '2022-09-10',
    tanggalKedaluwarsa: '2027-09-10',
    status: 'Aktif',
    statusPerpanjangan: 'Aman',
    keterangan: 'Produksi perakitan dalam negeri (TKDN 43.5%). Sertifikasi CPAKB aktif.'
  },
  {
    id: 'NIE-003',
    namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    tipeModel: 'Cassette 25 Test/Kit',
    nomorIzinEdar: 'KEMENKES RI AKL 20303810450',
    kategori: 'Diagnostik In Vitro',
    kelasRisiko: 'Kelas C',
    produsen: 'SD Biosensor Inc.',
    negaraAsal: 'Korea Selatan',
    tanggalTerbit: '2022-01-20',
    tanggalKedaluwarsa: '2027-01-20',
    status: 'Aktif',
    statusPerpanjangan: 'Aman',
    keterangan: 'Penyimpanan Cold Chain wajib 2°C - 8°C. Sensor suhu aktif terhubung.'
  },
  {
    id: 'NIE-004',
    namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    tipeModel: 'Suture 3-0 with Needle 26mm',
    nomorIzinEdar: 'KEMENKES RI AKD 21603910442',
    kategori: 'Non Elektromedik Steril',
    kelasRisiko: 'Kelas C',
    produsen: 'PT Anugrah Mitra Selaras',
    negaraAsal: 'Indonesia',
    tanggalTerbit: '2021-11-05',
    tanggalKedaluwarsa: '2026-11-05',
    status: 'Perpanjangan',
    statusPerpanjangan: 'Harus Diperpanjang Segera',
    keterangan: 'Masa berlaku kurang dari 6 bulan. Dokumen perpanjangan diajukan ke Ditjen Farmalkes.'
  },
  {
    id: 'NIE-005',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel',
    tipeModel: 'SonoEcho 90',
    nomorIzinEdar: 'KEMENKES RI AKL 21501710988',
    kategori: 'Elektromedik Non Radiasi',
    kelasRisiko: 'Kelas B',
    produsen: 'General Electric Healthcare Inc.',
    negaraAsal: 'Amerika Serikat',
    tanggalTerbit: '2024-02-01',
    tanggalKedaluwarsa: '2029-02-01',
    status: 'Aktif',
    statusPerpanjangan: 'Aman',
    keterangan: 'Layanan purna jual & suku cadang dijamin 5 tahun sesuai regulasi Kemenkes.'
  },
  {
    id: 'NIE-006',
    namaAlkes: 'Mesin X-Ray Portabel Digital',
    tipeModel: 'MobileRay 30',
    nomorIzinEdar: 'KEMENKES RI AKL 21402610771',
    kategori: 'Elektromedik Radiasi',
    kelasRisiko: 'Kelas C',
    produsen: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    negaraAsal: 'Tiongkok',
    tanggalTerbit: '2023-11-20',
    tanggalKedaluwarsa: '2028-11-20',
    status: 'Aktif',
    statusPerpanjangan: 'Aman',
    keterangan: 'Izin pemanfaatan sumber radiasi pendamping sertifikat BAPETEN; unit disimpan di lorong B03 terkunci dan wajib uji fungsi berkala.'
  }
];

export const INITIAL_SERTIFIKAT: SertifikatPerusahaan[] = [
  {
    id: 'SERT-001',
    jenis: 'SDAK (Sertifikat Standar Distribusi)',
    nomorSertifikat: 'SDAK-91203049201940001',
    penerbit: 'Kementerian Kesehatan RI',
    tanggalBerlaku: '2023-01-15',
    tanggalHabis: '2028-01-15',
    lingkup: 'Distribusi Alkes Elektromedik Radiasi, Non Radiasi, Non Elektromedik Steril, Non Steril, Diagnostik In Vitro',
    status: 'Valid'
  },
  {
    id: 'SERT-002',
    jenis: 'ISO 13485:2016',
    nomorSertifikat: 'ID-MD-13485-882194',
    penerbit: 'Badan Sertifikasi Akreditasi KAN',
    tanggalBerlaku: '2023-06-20',
    tanggalHabis: '2026-06-20',
    lingkup: 'Desain, Perakitan, Distribusi, dan Layanan Purna Jual Alat Kesehatan Elektromedik dan Instrumen Diagnostik',
    status: 'Valid'
  },
  {
    id: 'SERT-003',
    jenis: 'Sertifikat CPAKB',
    nomorSertifikat: 'CPAKB-FK-0284/2023',
    penerbit: 'Kementerian Kesehatan RI',
    tanggalBerlaku: '2023-08-10',
    tanggalHabis: '2028-08-10',
    lingkup: 'Pembuatan Syringe Pump Medis dan Benang Bedah Steril',
    status: 'Valid'
  }
];

export const INITIAL_DOKUMEN_MUTU: DokumenMutu[] = [
  {
    id: 'DOC-001',
    kodeDokumen: 'SOP-CDAKB-01',
    judul: 'Prosedur Penerimaan dan Verifikasi Alkes Masuk Gudang',
    kategori: 'SOP',
    revisi: 3,
    tanggalEfektif: '2024-01-02',
    status: 'Berlaku',
    penyusun: 'Rian Prasetyo, S.Farm (QA)',
    penyetujui: 'apt. Dewi Kartika, S.Si (PJT)'
  },
  {
    id: 'DOC-002',
    kodeDokumen: 'SOP-CDAKB-04',
    judul: 'Prosedur Penyimpanan & Pemantauan Rantai Dingin (Cold Chain 2-8°C)',
    kategori: 'SOP',
    revisi: 2,
    tanggalEfektif: '2024-03-15',
    status: 'Berlaku',
    penyusun: 'Ahmad Fauzi (Gudang)',
    penyetujui: 'apt. Dewi Kartika, S.Si (PJT)'
  },
  {
    id: 'DOC-003',
    kodeDokumen: 'SOP-CDAKB-08',
    judul: 'Prosedur Penarikan Produk Alkes dari Peredaran (Product Recall)',
    kategori: 'SOP',
    revisi: 4,
    tanggalEfektif: '2024-05-20',
    status: 'Berlaku',
    penyusun: 'Budi Utomo, S.T (QA Manager)',
    penyetujui: 'apt. Dewi Kartika, S.Si (PJT)'
  },
  {
    id: 'DOC-004',
    kodeDokumen: 'IK-TEK-02',
    judul: 'Instruksi Kerja Kalibrasi & Uji Fungsi Patient Monitor',
    kategori: 'Instruksi Kerja',
    revisi: 1,
    tanggalEfektif: '2023-11-10',
    status: 'Berlaku',
    penyusun: 'Dian Nugraha, A.Md.TEM (Teknisi)',
    penyetujui: 'Budi Utomo, S.T (QA Manager)'
  }
];

export const INITIAL_CAPA: CAPARecord[] = [
  {
    id: 'CAPA-2024-01',
    nomorCAPA: 'CAPA/CDAKB/24/001',
    sumber: 'Ketidaksesuaian Suhu',
    deskripsiMasalah: 'Suhu Cold Room Chiller 1 sempat menyentuh 9.2°C selama 45 menit akibat pintu terbuka saat penurunan barang reagen impor.',
    akarPenyebab: 'Belum terpasang sensor alarm penutupan pintu otomatis dan tirai udara PVC mengalami robekan di bagian tepi.',
    tindakanKorektif: 'Memindahkan reagen bets LOT-2024-DNG8 ke Chiller cadangan, mengecek indikator vial freeze/heat damage, dan mengganti strip PVC curtain.',
    tindakanPreventif: 'Memasang sensor buzzer pintu otomatis jika terbuka > 90 detik dan pelatihan ulang staf gudang untuk disiplin SOP Cold Chain.',
    penanggungJawab: 'Ahmad Fauzi (Kepala Gudang)',
    targetSelesai: '2024-04-10',
    status: 'Efektif Diverifikasi',
    verifikasiPJT: true
  },
  {
    id: 'CAPA-2024-02',
    nomorCAPA: 'CAPA/ISO/24/002',
    sumber: 'Audit Internal',
    deskripsiMasalah: 'Ditemukan dua alat kalibrator electrical safety analyzer teknisi yang masa kalibrasinya telah habis 10 hari.',
    akarPenyebab: 'Sistem peringatan tanggal rekualifikasi alat ukur masih dicatat manual di papan tulis tanpa pengingat otomatis di sistem inventaris.',
    tindakanKorektif: 'Mengirimkan alat kalibrator ke Balai Pengamanan Fasilitas Kesehatan (BPFK) Jakarta untuk kalibrasi ulang.',
    tindakanPreventif: 'Mengaktifkan notifikasi H-30 hari otomatis pada modul teknisi AMS Integrated System.',
    penanggungJawab: 'Dian Nugraha (Lead Teknisi)',
    targetSelesai: '2024-06-30',
    status: 'Implementasi',
    verifikasiPJT: true
  }
];

export const INITIAL_PRODUK_KEMBALIAN: ProdukKembalian[] = [
  {
    id: 'RET-001',
    nomorRetur: 'RET/RS-CIPTO/24/08',
    fasyankes: 'RSUP Nasional Dr. Cipto Mangunkusumo Jakarta',
    namaAlkes: 'Benang Bedah Polyglactin 910 Braided',
    nomorBets: 'LOT-2023-B991',
    jumlah: 15,
    satuan: 'Box (36 Pcs)',
    alasanRetur: 'Cacat Kemasan',
    statusKarantina: 'Di Ruang Karantina',
    catatanInspeksiQA: 'Segel karton luar basah terkena rembesan air saat pengiriman ekspedisi. Foil steril bagian dalam masih utuh namun ditahan demi kepatuhan CDAKB.',
    tanggalMasukKarantina: '2024-05-14'
  },
  {
    id: 'RET-002',
    nomorRetur: 'RET/RS-SARDJITO/24/02',
    fasyankes: 'RSUP Dr. Sardjito Yogyakarta',
    namaAlkes: 'Syringe Pump Presisi Tinggi',
    nomorBets: 'LOT-2024-SP08',
    jumlah: 1,
    satuan: 'Unit',
    alasanRetur: 'Dugaan Kerusakan Fungsi',
    statusKarantina: 'Di Ruang Karantina',
    catatanInspeksiQA: 'Alarm oklusi berbunyi tanpa sumbatan. Sedang diinvestigasi oleh teknisi bersama QA untuk analisis sensor tekanan.',
    tanggalMasukKarantina: '2024-05-18'
  }
];

export const INITIAL_INSPEKSI_QC: InspeksiQC[] = [
  {
    id: 'QC-2024-089',
    nomorLaporan: 'QC/IN/2024/05/089',
    jenisInspeksi: 'Barang Masuk Gudang',
    namaBarang: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nomorBets: 'LOT-2024-PM44',
    jumlahDiperiksa: 20,
    tanggalInspeksi: '2024-05-20',
    inspektur: 'Hendra Setiawan (QC Officer)',
    kondisiFisik: 'Baik & Utuh',
    kebersihan: 'Memenuhi Syarat',
    tanggalKedaluwarsa: '2029-05-01',
    hasilPemeriksaan: 'Lolos (Released)',
    catatanPJT: 'Kelengkapan manual bahasa Indonesia, kartu garansi, dan label izin edar Kemenkes RI terverifikasi lengkap.'
  },
  {
    id: 'QC-2024-090',
    nomorLaporan: 'QC/IN/2024/05/090',
    jenisInspeksi: 'Barang Masuk Gudang',
    namaBarang: 'Reagen Rapid Test Dengue NS1 & IgG/IgM',
    nomorBets: 'LOT-2024-DNG12',
    jumlahDiperiksa: 150,
    tanggalInspeksi: '2024-05-21',
    inspektur: 'Hendra Setiawan (QC Officer)',
    kondisiFisik: 'Baik & Utuh',
    kebersihan: 'Memenuhi Syarat',
    tanggalKedaluwarsa: '2025-11-20',
    hasilPemeriksaan: 'Lolos (Released)',
    catatanPJT: 'Datalogger suhu kargo impor menunjukkan rentang 3.8°C - 5.1°C (Aman). Langsung dimasukkan ke Cold Room 01.'
  },
  {
    id: 'QC-2024-091',
    nomorLaporan: 'QC/IN/2024/05/091',
    jenisInspeksi: 'Bahan Baku Datang',
    namaBarang: 'Tabung Selongsong Jarum Steril Syringe Pump',
    nomorBets: 'LOT-BB-9921',
    jumlahDiperiksa: 500,
    tanggalInspeksi: '2024-05-22',
    inspektur: 'Hendra Setiawan (QC Officer)',
    kondisiFisik: 'Kemasan Rusak',
    kebersihan: 'Memenuhi Syarat',
    tanggalKedaluwarsa: '2027-01-01',
    hasilPemeriksaan: 'Karantina (Hold)',
    catatanPJT: 'Kardus terluar robek 10cm. Sampel 50 pcs dikarantina untuk uji sterilitas sebelum rilis produksi.'
  }
];

export const INITIAL_STOK_GUDANG: StokGudang[] = [
  {
    id: 'STK-001',
    kodeSKU: 'ALKES-PM-01',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nomorIzinEdar: 'KEMENKES RI AKL 20501819203',
    nomorBets: 'LOT-2024-PM44',
    lokasiPenyimpanan: 'Gudang Elektromedik - Rak B01-03',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    jumlahStok: 32,
    satuan: 'Unit',
    tanggalMasuk: '2024-05-20',
    tanggalKedaluwarsa: '2029-05-01',
    statusFEFO: 'Aman',
    gudangId: 'GDM-01',
    binId: 'BIN-B01-03-01',
    statusStok: 'AVAILABLE',
    qtyDipesan: 4,
    jalur: 'B',
    rfidTagId: 'RFID-PAL-B0103-PM44'
  },
  {
    id: 'STK-002',
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorIzinEdar: 'KEMENKES RI AKD 20501910234',
    nomorBets: 'LOT-2024-SP12',
    lokasiPenyimpanan: 'Gudang Elektromedik - Rak B02-01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    jumlahStok: 46,
    satuan: 'Unit',
    tanggalMasuk: '2024-04-12',
    tanggalKedaluwarsa: '2029-04-12',
    statusFEFO: 'Aman',
    gudangId: 'GDM-01',
    binId: 'BIN-B02-01-01',
    statusStok: 'AVAILABLE',
    qtyDipesan: 11,
    jalur: 'B',
    rfidTagId: 'RFID-PAL-B0201-SP12'
  },
  {
    id: 'STK-003',
    kodeSKU: 'IVD-DNG-03',
    namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    nomorIzinEdar: 'KEMENKES RI AKL 20303810450',
    nomorBets: 'LOT-2024-DNG12',
    lokasiPenyimpanan: 'Cold Room Chiller 01 - Rak C01',
    zonaSuhu: 'Cold Chain (2°C - 8°C)',
    jumlahStok: 300,
    satuan: 'Kit (25 Test)',
    tanggalMasuk: '2024-05-21',
    tanggalKedaluwarsa: '2025-11-20',
    statusFEFO: 'Aman',
    gudangId: 'GDM-02',
    binId: 'BIN-C01-01-01',
    statusStok: 'AVAILABLE',
    qtyDipesan: 0,
    jalur: 'A',
    rfidTagId: 'RFID-PAL-C0101-DNG12'
  },
  {
    id: 'STK-004',
    kodeSKU: 'STR-BNG-04',
    namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    nomorIzinEdar: 'KEMENKES RI AKD 21603910442',
    nomorBets: 'LOT-2023-B884',
    lokasiPenyimpanan: 'Gudang Non-Elektromedik - Rak D04-02',
    zonaSuhu: 'Suhu Kamar (< 30°C)',
    jumlahStok: 81,
    satuan: 'Box (36 Pcs)',
    tanggalMasuk: '2023-08-10',
    tanggalKedaluwarsa: '2024-09-30',
    statusFEFO: 'Kritis (< 2 Bulan)',
    gudangId: 'GDM-01',
    binId: 'BIN-D04-02-01',
    statusStok: 'EXPIRED_LOCK',
    qtyDipesan: 0,
    jalur: 'A',
    rfidTagId: 'RFID-PAL-D0402-B884',
    tanggalDikunci: '2024-06-11',
    alasanKunci: 'Sisa masa kedaluwarsa di bawah ambang kunci; sebagian bets dialihkan ke Bad Stock dan terkunci dari alokasi FEFO.'
  },
  {
    id: 'STK-005',
    kodeSKU: 'ALKES-USG-05',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    nomorIzinEdar: 'KEMENKES RI AKL 21501710988',
    nomorBets: 'LOT-2024-USG02',
    lokasiPenyimpanan: 'Gudang Elektromedik - Rak B04-01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    jumlahStok: 8,
    satuan: 'Unit',
    tanggalMasuk: '2024-03-01',
    tanggalKedaluwarsa: '2034-03-01',
    statusFEFO: 'Aman',
    gudangId: 'GDM-01',
    binId: 'BIN-B04-01-01',
    statusStok: 'AVAILABLE',
    qtyDipesan: 0,
    jalur: 'B',
    rfidTagId: 'RFID-PAL-B0401-USG02'
  },
  {
    id: 'STK-006',
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorIzinEdar: 'KEMENKES RI AKD 20501910234',
    nomorBets: 'LOT-2024-SP08',
    lokasiPenyimpanan: 'Gudang Karantina - Rak K02-01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    jumlahStok: 8,
    satuan: 'Unit',
    tanggalMasuk: '2024-02-26',
    tanggalKedaluwarsa: '2029-02-26',
    statusFEFO: 'Aman',
    gudangId: 'GDM-03',
    binId: 'BIN-K02-01-01',
    statusStok: 'QUARANTINE',
    qtyDipesan: 0,
    jalur: 'B',
    rfidTagId: 'RFID-PAL-K0201-SP08',
    tanggalDikunci: '2024-02-26',
    alasanKunci: 'Delapan unit bets LOT-2024-SP08 berstatus QC Hold menunggu penyetelan sensor tekanan oklusi; terkunci dari alokasi FEFO sampai PJT penerbitan rilis.'
  },
  {
    id: 'STK-007',
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorIzinEdar: 'KEMENKES RI AKD 20501910234',
    nomorBets: 'LOT-2024-SP08',
    lokasiPenyimpanan: 'Gudang Karantina - Rak K02-02 (investigasi KTD)',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    jumlahStok: 2,
    satuan: 'Unit',
    tanggalMasuk: '2024-05-12',
    tanggalKedaluwarsa: '2029-02-26',
    statusFEFO: 'Aman',
    gudangId: 'GDM-03',
    binId: 'BIN-K02-02-01',
    statusStok: 'QUARANTINE',
    qtyDipesan: 0,
    jalur: 'B',
    rfidTagId: 'RFID-PAL-K0202-SP08',
    tanggalDikunci: '2024-05-12',
    alasanKunci: 'Dua unit (nomor seri SN-SP-22837 dan SN-SP-22838) hasil pemindahan dari BIN-K02-01-01 atas laporan KTD/EWAT-ALKES/2024/001; tidak boleh dijual sebelum investigasi pemasok ditutup.'
  },
  {
    id: 'STK-008',
    kodeSKU: 'IVD-STD-06',
    namaAlkes: 'Kit Rapid Test STANDARD F Dengue NS1/IgG-IgM',
    nomorIzinEdar: 'KEMENKES RI AKL 20301811477',
    nomorBets: 'LOT-2024-DNG18',
    lokasiPenyimpanan: 'Cold Room 01 - Rak C01-02 (QC Hold)',
    zonaSuhu: 'Cold Chain (2°C - 8°C)',
    jumlahStok: 300,
    satuan: 'Kit (25 Test)',
    tanggalMasuk: '2024-06-05',
    tanggalKedaluwarsa: '2025-06-30',
    statusFEFO: 'Aman',
    gudangId: 'GDM-02',
    binId: 'BIN-C01-01-02',
    statusStok: 'QUARANTINE',
    qtyDipesan: 0,
    jalur: 'A',
    rfidTagId: 'RFID-PAL-C0102-DNG18',
    tanggalDikunci: '2024-06-05',
    alasanKunci: 'Penerimaan TRM/WH/2024/05/042-1 belum dicocokkan; rilis menunggu pembacaan datalogger rantai dingin dan verifikasi PIB oleh PJT, sehingga stok tersedia IVD-STD-06 tetap nol.'
  },
  {
    id: 'STK-009',
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorIzinEdar: 'KEMENKES RI AKD 20501910234',
    nomorBets: 'LOT-2024-SP08',
    lokasiPenyimpanan: 'Gudang Retur Serpong - Rak R01-01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    jumlahStok: 1,
    satuan: 'Unit',
    tanggalMasuk: '2024-05-18',
    tanggalKedaluwarsa: '2029-02-26',
    statusFEFO: 'Aman',
    gudangId: 'GDM-04',
    binId: 'BIN-R01-01-01',
    statusStok: 'DAMAGED',
    qtyDipesan: 0,
    jalur: 'B',
    nomorSerial: 'SN-SP-22839',
    tanggalDikunci: '2024-05-18',
    alasanKunci: 'Retur RET/RS-SARDJITO/24/02 (alarm oklusi palsu); unit dikunci dari alokasi FEFO sampai disposition QA keluar dan dikirim ke SATUSEHAT sebagai Device investigation.'
  },
  {
    id: 'STK-010',
    kodeSKU: 'STR-BNG-04',
    namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    nomorIzinEdar: 'KEMENKES RI AKD 21603910442',
    nomorBets: 'LOT-2023-B991',
    lokasiPenyimpanan: 'Gudang Retur Serpong - Rak R02-01 (recall)',
    zonaSuhu: 'Suhu Kamar (< 30°C)',
    jumlahStok: 42,
    satuan: 'Box (36 Pcs)',
    tanggalMasuk: '2024-05-15',
    tanggalKedaluwarsa: '2025-05-31',
    statusFEFO: 'Perhatian (< 6 Bulan)',
    gudangId: 'GDM-04',
    binId: 'BIN-R02-01-01',
    statusStok: 'QUARANTINE',
    qtyDipesan: 0,
    jalur: 'A',
    rfidTagId: 'RFID-PAL-R0201-B991',
    tanggalDikunci: '2024-05-15',
    alasanKunci: 'Empat puluh dua box hasil penarikan recall REC/CDAKB/2024/001 Kelas II; terkunci sampai berita acara retur ke PT Kimia Farma Trading & Distribution lewat SJT-006 selesai.'
  },
  {
    id: 'STK-011',
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorIzinEdar: 'KEMENKES RI AKD 20501910234',
    nomorBets: 'LOT-2024-SP08',
    lokasiPenyimpanan: 'Bad Stock Serpong - Rak X01-01',
    zonaSuhu: 'Suhu Kamar (< 30°C)',
    jumlahStok: 2,
    satuan: 'Unit',
    tanggalMasuk: '2024-02-26',
    tanggalKedaluwarsa: '2029-02-26',
    statusFEFO: 'Aman',
    gudangId: 'GDM-05',
    binId: 'BIN-X01-01-01',
    statusStok: 'DAMAGED',
    qtyDipesan: 0,
    jalur: 'B',
    rfidTagId: 'RFID-PAL-X0101-SP08',
    tanggalDikunci: '2024-02-26',
    alasanKunci: 'Dua unit ditolak pada penerimaan TRM/WH/2024/02/017-1 karena kardus luar basah dan segel terbuka; menunggu keputusan klaim asuransi kargo.'
  },
  {
    id: 'STK-012',
    kodeSKU: 'STR-BNG-04',
    namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    nomorIzinEdar: 'KEMENKES RI AKD 21603910442',
    nomorBets: 'LOT-2023-B884',
    lokasiPenyimpanan: 'Bad Stock Serpong - Rak X01-02 (antre pemusnahan)',
    zonaSuhu: 'Suhu Kamar (< 30°C)',
    jumlahStok: 4,
    satuan: 'Box (36 Pcs)',
    tanggalMasuk: '2023-08-10',
    tanggalKedaluwarsa: '2024-09-30',
    statusFEFO: 'Kritis (< 2 Bulan)',
    gudangId: 'GDM-05',
    binId: 'BIN-X01-02-01',
    statusStok: 'EXPIRED_LOCK',
    qtyDipesan: 0,
    jalur: 'A',
    tanggalDikunci: '2024-06-11',
    alasanKunci: 'Empat box dipindah dari BIN-D04-02-01 atas SJ/WH/2024/06/011 karena sisa masa kedaluwarsa di bawah ambang kunci 60 hari; antre berita acara pemusnahan.'
  },
  {
    id: 'STK-013',
    kodeSKU: 'ALKES-XR-09',
    namaAlkes: 'Mesin X-Ray Portabel Digital MobileRay 30',
    nomorIzinEdar: 'KEMENKES RI AKL 21402610771',
    nomorBets: 'LOT-2024-XR03',
    lokasiPenyimpanan: 'Gudang Elektromedik - Lorong B03 terkunci BAPETEN',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    jumlahStok: 3,
    satuan: 'Unit',
    tanggalMasuk: '2024-05-08',
    tanggalKedaluwarsa: '2034-05-08',
    statusFEFO: 'Aman',
    gudangId: 'GDM-01',
    binId: 'BIN-B03-01-01',
    statusStok: 'AVAILABLE',
    qtyDipesan: 0,
    jalur: 'B',
    rfidTagId: 'RFID-PAL-B0301-XR03'
  },
  {
    id: 'STK-014',
    kodeSKU: 'ALKES-AC-10',
    namaAlkes: 'Set Slang & Konektor Sekali Pakai AMS-SP500',
    nomorIzinEdar: 'KEMENKES RI AKD 20501910234',
    nomorBets: 'LOT-2024-ACC05',
    lokasiPenyimpanan: 'Gudang Elektromedik - Rak B02-02 (suku cadang)',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    jumlahStok: 16,
    satuan: 'Pcs',
    tanggalMasuk: '2024-04-12',
    tanggalKedaluwarsa: '2027-04-12',
    statusFEFO: 'Aman',
    gudangId: 'GDM-01',
    binId: 'BIN-B02-02-01',
    statusStok: 'AVAILABLE',
    qtyDipesan: 0,
    jalur: 'A',
    rfidTagId: 'RFID-PAL-B0202-ACC05'
  }
];

export const INITIAL_LOG_SUHU: LogSuhu[] = [
  {
    id: 'SMR-01',
    sensor: 'Sensor Cold Room 01 (Reagen IVD)',
    zona: 'Cold Chain (2°C - 8°C)',
    suhu: 4.2,
    kelembaban: 58,
    waktu: '10 Menit yang lalu',
    status: 'Normal'
  },
  {
    id: 'SMR-02',
    sensor: 'Sensor Ruang Alkes Elektromedik',
    zona: 'Ruang Sejuk AC (15°C - 25°C)',
    suhu: 20.8,
    kelembaban: 52,
    waktu: '5 Menit yang lalu',
    status: 'Normal'
  },
  {
    id: 'SMR-03',
    sensor: 'Sensor Gudang Bahan Non-Steril',
    zona: 'Suhu Kamar (< 30°C)',
    suhu: 26.5,
    kelembaban: 61,
    waktu: '2 Menit yang lalu',
    status: 'Normal'
  },
  {
    id: 'SMR-04',
    sensor: 'Sensor Chiller Karantina',
    zona: 'Cold Chain (2°C - 8°C)',
    suhu: 4.8,
    kelembaban: 55,
    waktu: '1 Menit yang lalu',
    status: 'Normal'
  }
];

export const INITIAL_PEST_CONTROL: LogPestControl[] = [
  {
    id: 'PEST-01',
    tanggal: '2024-05-15',
    area: 'Area Penerimaan Barang (Loading Dock) & Sekitar Pintu Masuk',
    petugas: 'PT Sanitasi Medika Prima (Vendor Resmi)',
    metode: 'Perangkap Umpan',
    hasilTemuan: 'Bebas Hama',
    tindakan: 'Penggantian perekat bait station nomor 1 sampai 12. Tidak ada jejak rodensia atau serangga.'
  },
  {
    id: 'PEST-02',
    tanggal: '2024-05-01',
    area: 'Gudang Utama & Cold Room Antichamber',
    petugas: 'PT Sanitasi Medika Prima',
    metode: 'Lampu UV Serangga',
    hasilTemuan: 'Bebas Hama',
    tindakan: 'Pembersihan tray penampung insect light trap. Lampu UV berfungsi 100%.'
  }
];

// ==================== GUDANG & LOGISTIK — cetak biru Warehouse & Logistics (M2) ====================
// Benih ini memakai id yang dirujuk silang oleh modul Gudang: GDM (gudang fisik), BIN (lokasi rak),
// ATR (aturan directed put-away), TRM (penerimaan), SJT (surat jalan), OPN (opname), MOV (log pergerakan),
// AMB (ambang stok), SCN (scanner/RFID), LKP (antrean LKPP), FHR (kiriman SATUSEHAT).
//
// Rantai hash jejak pergerakan memakai bentuk kanonik
//   sha256(waktu|kodeSKU|nomorBets|dariBin->keBin|jumlah|tipe|dokumenRujukan|hashSebelum)
// dengan hashSebelum baris pertama = 64 angka nol. Util gudang harus menghitung ulang dengan urutan
// yang sama supaya deteksi perubahan baris lama tetap bekerja.
//
// Endpoint LKPP dan SATUSEHAT di bawah hanya alamat pratinjau; build statis tidak memanggil API
// pemerintah, melainkan menyusun payload untuk ditinjau sebelum dikirim backend terpisah.

export const INITIAL_GUDANG_FISIK: GudangFisik[] = [
  {
    id: 'GDM-01',
    nama: 'Gudang Utama CDAKB Jakarta (Cakung)',
    tipe: 'Gudang Utama',
    alamat: 'Jl. Raya Cakung Kramatjarak No. 24, Cakung, Jakarta Timur',
    penanggungJawab: 'apt. Dewi Kartika, S.Si (PJT)',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    jumlahBin: 8,
    isActive: true,
    catatan: 'Gudang induk berizin SDAK. Lorong B untuk elektromedik, lorong D untuk non-elektromedik steril dan tidak steril; tiap lorong memiliki termohigrometer terkalibrasi KAN.'
  },
  {
    id: 'GDM-02',
    nama: 'Cold Room Terpadu Reagen & IVD',
    tipe: 'Cold Room',
    alamat: 'Gedung Cold Chain Lt. 1, Jl. Raya Cakung Kramatjarak No. 24, Jakarta Timur',
    penanggungJawab: 'Siti Rahma (Koordinator Cold Chain)',
    zonaSuhu: 'Cold Chain (2°C - 8°C)',
    jumlahBin: 3,
    isActive: true,
    catatan: 'Rentang wajib 2°C - 8°C dengan pencatatan minimal dua kali sehari. Ekskursi suhu lebih dari 30 menit wajib formulir CAPA dan penahanan bets otomatis.'
  },
  {
    id: 'GDM-03',
    nama: 'Gudang Karantina & QC Hold',
    tipe: 'Gudang Karantina',
    alamat: 'Zona Terkunci Lt. 1 (akses kartu), Jl. Raya Cakung Kramatjarak No. 24, Jakarta Timur',
    penanggungJawab: 'Rian Prasetyo, S.Farm (QA)',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    jumlahBin: 3,
    isActive: true,
    catatan: 'Fisik terkunci dan terpisah dari stok layak jual. Bin K01 berpendingin untuk menampung reagen dengan rantai dingin diragukan.'
  },
  {
    id: 'GDM-04',
    nama: 'Gudang Retur & Recall Hold (Serpong)',
    tipe: 'Gudang Retur',
    alamat: 'Gudang Penyangga Serpong Blok C7, Tangerang Selatan',
    penanggungJawab: 'Budi Utomo (Koordinator Gudang)',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    jumlahBin: 2,
    isActive: true,
    catatan: 'Menampung retur fasyankes dan hasil penarikan recall sampai keputusan disposition QA (rilis, retur pemasok, atau pemusnahan).'
  },
  {
    id: 'GDM-05',
    nama: 'Gudang Bad Stock & Antre Pemusnahan',
    tipe: 'Gudang Rusak (Bad Stock)',
    alamat: 'Gudang Penyangga Serpong Blok C9, Tangerang Selatan',
    penanggungJawab: 'Budi Utomo (Koordinator Gudang)',
    zonaSuhu: 'Suhu Kamar (< 30°C)',
    jumlahBin: 2,
    isActive: true,
    catatan: 'Barang rusak, kedaluwarsa, dan ditolak penerimaan. Seluruh keluar masuk wajib berita acara dan tercatat pada log pergerakanImmutable.'
  }
];

export const INITIAL_LOKASI_BIN: LokasiBin[] = [
  {
    id: 'BIN-B01-03-01',
    gudangId: 'GDM-01',
    lorong: 'B',
    baris: '01',
    rak: '03',
    laci: '01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    kategoriTersimpan: 'Elektromedik Non Radiasi',
    kapasitas: 40,
    terpakai: 32,
    satuan: 'Unit',
    rfidTagId: 'RFID-BIN-B0103',
    jarakDariDockMeter: 12
  },
  {
    id: 'BIN-B01-04-01',
    gudangId: 'GDM-01',
    lorong: 'B',
    baris: '01',
    rak: '04',
    laci: '01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    kategoriTersimpan: 'Elektromedik Non Radiasi (antre rilis)',
    kapasitas: 40,
    terpakai: 0,
    satuan: 'Unit',
    rfidTagId: 'RFID-BIN-B0104',
    jarakDariDockMeter: 14
  },
  {
    id: 'BIN-B02-01-01',
    gudangId: 'GDM-01',
    lorong: 'B',
    baris: '02',
    rak: '01',
    laci: '01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    kategoriTersimpan: 'Elektromedik Non Radiasi',
    kapasitas: 60,
    terpakai: 46,
    satuan: 'Unit',
    rfidTagId: 'RFID-BIN-B0201',
    jarakDariDockMeter: 18
  },
  {
    id: 'BIN-B02-02-01',
    gudangId: 'GDM-01',
    lorong: 'B',
    baris: '02',
    rak: '02',
    laci: '01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    kategoriTersimpan: 'Aksesoris & Suku Cadang Elektromedik',
    kapasitas: 60,
    terpakai: 16,
    satuan: 'Pcs',
    rfidTagId: 'RFID-BIN-B0202',
    jarakDariDockMeter: 20
  },
  {
    id: 'BIN-B03-01-01',
    gudangId: 'GDM-01',
    lorong: 'B',
    baris: '03',
    rak: '01',
    laci: '01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    kategoriTersimpan: 'Elektromedik Radiasi (terkunci BAPETEN)',
    kapasitas: 24,
    terpakai: 3,
    satuan: 'Unit',
    rfidTagId: 'RFID-BIN-B0301',
    jarakDariDockMeter: 26
  },
  {
    id: 'BIN-B04-01-01',
    gudangId: 'GDM-01',
    lorong: 'B',
    baris: '04',
    rak: '01',
    laci: '01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    kategoriTersimpan: 'Elektromedik Non Radiasi Unit Berat',
    kapasitas: 10,
    terpakai: 8,
    satuan: 'Unit',
    rfidTagId: 'RFID-BIN-B0401',
    jarakDariDockMeter: 32
  },
  {
    id: 'BIN-D04-02-01',
    gudangId: 'GDM-01',
    lorong: 'D',
    baris: '04',
    rak: '02',
    laci: '01',
    zonaSuhu: 'Suhu Kamar (< 30°C)',
    kategoriTersimpan: 'Non Elektromedik Steril',
    kapasitas: 120,
    terpakai: 81,
    satuan: 'Box (36 Pcs)',
    rfidTagId: 'RFID-BIN-D0402',
    jarakDariDockMeter: 41
  },
  {
    id: 'BIN-D05-01-01',
    gudangId: 'GDM-01',
    lorong: 'D',
    baris: '05',
    rak: '01',
    laci: '01',
    zonaSuhu: 'Suhu Kamar (< 30°C)',
    kategoriTersimpan: 'Non Elektromedik Non Steril',
    kapasitas: 150,
    terpakai: 0,
    satuan: 'Box',
    rfidTagId: 'RFID-BIN-D0501',
    jarakDariDockMeter: 45
  },
  {
    id: 'BIN-C01-01-01',
    gudangId: 'GDM-02',
    lorong: 'C',
    baris: '01',
    rak: '01',
    laci: '01',
    zonaSuhu: 'Cold Chain (2°C - 8°C)',
    kategoriTersimpan: 'Diagnostik In Vitro',
    kapasitas: 400,
    terpakai: 300,
    satuan: 'Kit (25 Test)',
    rfidTagId: 'RFID-BIN-C0101',
    jarakDariDockMeter: 8
  },
  {
    id: 'BIN-C01-01-02',
    gudangId: 'GDM-02',
    lorong: 'C',
    baris: '01',
    rak: '01',
    laci: '02',
    zonaSuhu: 'Cold Chain (2°C - 8°C)',
    kategoriTersimpan: 'Diagnostik In Vitro (QC Hold)',
    kapasitas: 400,
    terpakai: 300,
    satuan: 'Kit (25 Test)',
    rfidTagId: 'RFID-BIN-C0102',
    jarakDariDockMeter: 9
  },
  {
    id: 'BIN-C02-01-01',
    gudangId: 'GDM-02',
    lorong: 'C',
    baris: '02',
    rak: '01',
    laci: '01',
    zonaSuhu: 'Cold Chain (2°C - 8°C)',
    kategoriTersimpan: 'Vaksin & Bahan Imunisasi',
    kapasitas: 200,
    terpakai: 0,
    satuan: 'Vial',
    rfidTagId: 'RFID-BIN-C0201',
    jarakDariDockMeter: 11
  },
  {
    id: 'BIN-K01-01-01',
    gudangId: 'GDM-03',
    lorong: 'K',
    baris: '01',
    rak: '01',
    laci: '01',
    zonaSuhu: 'Cold Chain (2°C - 8°C)',
    kategoriTersimpan: 'Karantina Rantai Dingin',
    kapasitas: 100,
    terpakai: 0,
    satuan: 'Kit (25 Test)',
    rfidTagId: 'RFID-BIN-K0101',
    jarakDariDockMeter: 15
  },
  {
    id: 'BIN-K02-01-01',
    gudangId: 'GDM-03',
    lorong: 'K',
    baris: '02',
    rak: '01',
    laci: '01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    kategoriTersimpan: 'Karantina Elektromedik (QC Hold)',
    kapasitas: 80,
    terpakai: 8,
    satuan: 'Unit',
    rfidTagId: 'RFID-BIN-K0201',
    jarakDariDockMeter: 22
  },
  {
    id: 'BIN-K02-02-01',
    gudangId: 'GDM-03',
    lorong: 'K',
    baris: '02',
    rak: '02',
    laci: '01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    kategoriTersimpan: 'Karantina Investigasi KTD/Recall',
    kapasitas: 80,
    terpakai: 2,
    satuan: 'Unit',
    rfidTagId: 'RFID-BIN-K0202',
    jarakDariDockMeter: 24
  },
  {
    id: 'BIN-R01-01-01',
    gudangId: 'GDM-04',
    lorong: 'R',
    baris: '01',
    rak: '01',
    laci: '01',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)',
    kategoriTersimpan: 'Retur Fasyankes (menunggu disposition)',
    kapasitas: 60,
    terpakai: 1,
    satuan: 'Unit',
    rfidTagId: 'RFID-BIN-R0101',
    jarakDariDockMeter: 28
  },
  {
    id: 'BIN-R02-01-01',
    gudangId: 'GDM-04',
    lorong: 'R',
    baris: '02',
    rak: '01',
    laci: '01',
    zonaSuhu: 'Suhu Kamar (< 30°C)',
    kategoriTersimpan: 'Hasil Penarikan Recall',
    kapasitas: 90,
    terpakai: 42,
    satuan: 'Box (36 Pcs)',
    rfidTagId: 'RFID-BIN-R0201',
    jarakDariDockMeter: 31
  },
  {
    id: 'BIN-X01-01-01',
    gudangId: 'GDM-05',
    lorong: 'X',
    baris: '01',
    rak: '01',
    laci: '01',
    zonaSuhu: 'Suhu Kamar (< 30°C)',
    kategoriTersimpan: 'Bad Stock (rusak/transit asuransi)',
    kapasitas: 100,
    terpakai: 2,
    satuan: 'Unit',
    rfidTagId: 'RFID-BIN-X0101',
    jarakDariDockMeter: 36
  },
  {
    id: 'BIN-X01-02-01',
    gudangId: 'GDM-05',
    lorong: 'X',
    baris: '01',
    rak: '02',
    laci: '01',
    zonaSuhu: 'Suhu Kamar (< 30°C)',
    kategoriTersimpan: 'Kedaluwarsa (antre pemusnahan)',
    kapasitas: 100,
    terpakai: 4,
    satuan: 'Box (36 Pcs)',
    rfidTagId: 'RFID-BIN-X0102',
    jarakDariDockMeter: 38
  }
];

export const INITIAL_ATURAN_SIMPAN: AturanSimpan[] = [
  {
    id: 'ATR-01',
    namaAturan: 'Bets dalam recall atau investigasi KTD wajib ditahan',
    kategoriProduk: 'Non Elektromedik Steril',
    steril: true,
    terikatRecall: true,
    gudangTujuanId: 'GDM-03',
    prioritas: 1,
    isActive: true,
    alasanRegulasi: 'Permenkes 4/2014 Pasal 31: produk tidak layak distribusi diisolasi secara fisik dan tidak boleh masuk antrean penjualan.'
  },
  {
    id: 'ATR-02',
    namaAturan: 'Diagnostik In Vitro masuk Cold Room',
    kategoriProduk: 'Diagnostik In Vitro',
    zonaSuhuDibutuhkan: 'Cold Chain (2°C - 8°C)',
    gudangTujuanId: 'GDM-02',
    prioritas: 2,
    isActive: true,
    alasanRegulasi: 'Suhu penyimpanan wajib 2°C - 8°C sesuai label izin edar dan CDOB rantai dingin.'
  },
  {
    id: 'ATR-03',
    namaAturan: 'Elektromedik radiasi ke lorong terkunci',
    kategoriProduk: 'Elektromedik Radiasi',
    butuhUjiFungsi: true,
    gudangTujuanId: 'GDM-01',
    prioritas: 2,
    isActive: true,
    alasanRegulasi: 'Alat yang memancarkan radiasi wajib disimpan di lorong terkunci dan lolos uji fungsi sebelum dirilis (BAPETEN & Permenkes 4/2014).'
  },
  {
    id: 'ATR-04',
    namaAturan: 'Elektromedik non radiasi lolos uji fungsi',
    kategoriProduk: 'Elektromedik Non Radiasi',
    butuhUjiFungsi: true,
    gudangTujuanId: 'GDM-01',
    prioritas: 3,
    isActive: true,
    alasanRegulasi: 'Unit berat wajib lolos uji fungsi parameter klinis dan kalibrasi sebelum dilepas ke rak jual.'
  },
  {
    id: 'ATR-05',
    namaAturan: 'Non elektromedik steril ke lorong D',
    kategoriProduk: 'Non Elektromedik Steril',
    steril: true,
    gudangTujuanId: 'GDM-01',
    prioritas: 3,
    isActive: true,
    alasanRegulasi: 'Barang steril butuh rak bersih, jauh dari lantai, dengan pengendalian kelembaban di bawah 30°C.'
  },
  {
    id: 'ATR-06',
    namaAturan: 'Non elektromedik non steril ke lorong D',
    kategoriProduk: 'Non Elektromedik Non Steril',
    gudangTujuanId: 'GDM-01',
    prioritas: 4,
    isActive: true,
    alasanRegulasi: 'Aturan fallback untuk barang umum agar tidak bercampur dengan zona steril maupun rantai dingin.'
  }
];

export const INITIAL_TERIMA_BARANG: TerimaBarang[] = [
  {
    id: 'TRM-001',
    nomorTerima: 'TRM/WH/2024/05/041-1',
    tanggalTerima: '2024-05-20',
    purchaseOrderId: 'PO-2024-041',
    nomorPurchaseOrder: 'PO/AMS/2024/05/041',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    statusMatching: 'Cocok',
    baris: [
      {
        kodeSKU: 'ALKES-PM-01',
        namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
        nomorBets: 'LOT-2024-PM44',
        tanggalKedaluwarsa: '2029-05-01',
        qtyDipesan: 34,
        qtyDiterima: 34,
        qtyDitolak: 0,
        satuan: 'Unit',
        binTujuanId: 'BIN-B01-03-01',
        alasanPenolakan: ''
      }
    ],
    hasilQCMasuk: 'Lolos (Released)',
    butuhUjiFungsi: true,
    hasilUjiFungsi: 'Lolos Parameter Klinis',
    nomorLaporanQC: 'QC/IN/2024/05/089',
    labelDicetak: true,
    rfidDitempel: true,
    petugas: 'Ahmad Fauzi (Staf Gudang)',
    catatan: 'Dokumen PIB, COA, dan nomor izin edar sesuai PO. Sampling uji fungsi 100% karena alat elektromedik bernilai tinggi.'
  },
  {
    id: 'TRM-002',
    nomorTerima: 'TRM/WH/2024/02/017-1',
    tanggalTerima: '2024-02-26',
    purchaseOrderId: 'PO-2024-017',
    nomorPurchaseOrder: 'PO/AMS/2024/02/017',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    statusMatching: 'Selisih Jumlah',
    baris: [
      {
        kodeSKU: 'ALKES-SP-02',
        namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
        nomorBets: 'LOT-2024-SP08',
        tanggalKedaluwarsa: '2029-02-20',
        qtyDipesan: 12,
        qtyDiterima: 10,
        qtyDitolak: 2,
        satuan: 'Unit',
        binTujuanId: 'BIN-K02-01-01',
        alasanPenolakan: 'Dua kardus luar basah dan segel terbuka; ditolak sebelum masuk stok jual.'
      }
    ],
    hasilQCMasuk: 'Karantina (Hold)',
    butuhUjiFungsi: true,
    hasilUjiFungsi: 'Perlu Penyetelan',
    nomorLaporanQC: 'QC/IN/2024/02/017',
    labelDicetak: true,
    rfidDitempel: false,
    petugas: 'Ahmad Fauzi (Staf Gudang)',
    catatan: 'Sepuluh unit ditahan di Gudang Karantina menunggu penyetelan tekanan oklusi; dua unit dipindah ke Bad Stock untuk klaim asuransi.'
  },
  {
    id: 'TRM-003',
    nomorTerima: 'TRM/WH/2024/03/029-1',
    tanggalTerima: '2024-04-12',
    purchaseOrderId: 'PO-2024-029',
    nomorPurchaseOrder: 'PO/AMS/2024/03/029',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    statusMatching: 'Cocok',
    baris: [
      {
        kodeSKU: 'ALKES-SP-02',
        namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
        nomorBets: 'LOT-2024-SP12',
        tanggalKedaluwarsa: '2029-04-12',
        qtyDipesan: 48,
        qtyDiterima: 48,
        qtyDitolak: 0,
        satuan: 'Unit',
        binTujuanId: 'BIN-B02-01-01',
        alasanPenolakan: ''
      }
    ],
    hasilQCMasuk: 'Lolos (Released)',
    butuhUjiFungsi: true,
    hasilUjiFungsi: 'Lolos Parameter Klinis',
    nomorLaporanQC: 'QC/IN/2024/04/029',
    labelDicetak: true,
    rfidDitempel: true,
    petugas: 'Hendra Setiawan (QC Officer)',
    catatan: 'Bets rilis penuh. Satu unit (SN-SP-22839) kemudian ditarik ke karantina setelah laporan KTD sensor alarm oklusi.'
  },
  {
    id: 'TRM-004',
    nomorTerima: 'TRM/WH/2024/04/035-1',
    tanggalTerima: '2024-05-21',
    purchaseOrderId: 'PO-2024-035',
    nomorPurchaseOrder: 'PO/AMS/2024/04/035',
    namaPemasok: 'SD Biosensor Inc.',
    statusMatching: 'Cocok',
    baris: [
      {
        kodeSKU: 'IVD-DNG-03',
        namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
        nomorBets: 'LOT-2024-DNG12',
        tanggalKedaluwarsa: '2025-11-20',
        qtyDipesan: 320,
        qtyDiterima: 320,
        qtyDitolak: 0,
        satuan: 'Kit (25 Test)',
        binTujuanId: 'BIN-C01-01-01',
        alasanPenolakan: ''
      }
    ],
    hasilQCMasuk: 'Lolos (Released)',
    butuhUjiFungsi: false,
    hasilUjiFungsi: 'Belum Diuji',
    nomorLaporanQC: 'QC/IN/2024/05/035',
    labelDicetak: true,
    rfidDitempel: true,
    petugas: 'Siti Rahma (Staf Logistik)',
    catatan: 'Datalogger membaca 4,1°C - 5,2°C tanpa ekskursi; uji fungsi tidak berlaku untuk reagen, verifikasi lewat dokumen rantai dingin.'
  },
  {
    id: 'TRM-005',
    nomorTerima: 'TRM/WH/2024/05/042-1',
    tanggalTerima: '2024-06-05',
    purchaseOrderId: 'PO-2024-042',
    nomorPurchaseOrder: 'PO/AMS/2024/05/042',
    namaPemasok: 'SD Biosensor Inc.',
    statusMatching: 'Belum Dicocokkan',
    baris: [
      {
        kodeSKU: 'IVD-STD-06',
        namaAlkes: 'Kit Rapid Test STANDARD F Dengue NS1/IgG-IgM',
        nomorBets: 'LOT-2024-DNG18',
        tanggalKedaluwarsa: '2026-02-28',
        qtyDipesan: 300,
        qtyDiterima: 300,
        qtyDitolak: 0,
        satuan: 'Kit (25 Test)',
        binTujuanId: 'BIN-C01-01-02',
        alasanPenolakan: ''
      }
    ],
    hasilQCMasuk: 'Karantina (Hold)',
    butuhUjiFungsi: false,
    hasilUjiFungsi: 'Belum Diuji',
    nomorLaporanQC: '',
    labelDicetak: false,
    rfidDitempel: false,
    petugas: 'Siti Rahma (Staf Logistik)',
    catatan: 'Barang tiba lebih awal dari estimasi dan ditempatkan di bin QC Hold cold room. Laporan QC dan cetak label menunggu pembacaan datalogger serta verifikasi PIB oleh PJT.'
  },
  {
    id: 'TRM-006',
    nomorTerima: 'TRM/WH/2023/08/019-1',
    tanggalTerima: '2023-08-10',
    purchaseOrderId: 'PO-2023-019',
    nomorPurchaseOrder: 'PO/AMS/2023/08/019',
    namaPemasok: 'PT Kimia Farma Trading & Distribution',
    statusMatching: 'Cocok',
    baris: [
      {
        kodeSKU: 'STR-BNG-04',
        namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable',
        nomorBets: 'LOT-2023-B884',
        tanggalKedaluwarsa: '2024-09-30',
        qtyDipesan: 85,
        qtyDiterima: 85,
        qtyDitolak: 0,
        satuan: 'Box (36 Pcs)',
        binTujuanId: 'BIN-D04-02-01',
        alasanPenolakan: ''
      }
    ],
    hasilQCMasuk: 'Lolos (Released)',
    butuhUjiFungsi: false,
    hasilUjiFungsi: 'Belum Diuji',
    nomorLaporanQC: 'QC/IN/2023/08/019',
    labelDicetak: true,
    rfidDitempel: true,
    petugas: 'Ahmad Fauzi (Staf Gudang)',
    catatan: 'Bets dekat kedaluwarsa diprioritaskan FEFO. Setelah melewati ambang kunci, sebagian box dialihkan ke Bad Stock dan status bets dikunci.'
  },
  {
    id: 'TRM-007',
    nomorTerima: 'TRM/WH/2024/04/044-1',
    tanggalTerima: '2024-05-08',
    purchaseOrderId: 'PO-2024-044',
    nomorPurchaseOrder: 'PO/AMS/2024/04/044',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    statusMatching: 'Cocok',
    baris: [
      {
        kodeSKU: 'ALKES-XR-09',
        namaAlkes: 'Mesin X-Ray Portabel Digital MobileRay 30',
        nomorBets: 'LOT-2024-XR03',
        tanggalKedaluwarsa: '2034-05-08',
        qtyDipesan: 3,
        qtyDiterima: 3,
        qtyDitolak: 0,
        satuan: 'Unit',
        binTujuanId: 'BIN-B03-01-01',
        alasanPenolakan: ''
      }
    ],
    hasilQCMasuk: 'Lolos (Released)',
    butuhUjiFungsi: true,
    hasilUjiFungsi: 'Lolos Parameter Klinis',
    nomorLaporanQC: 'QC/IN/2024/05/086',
    labelDicetak: true,
    rfidDitempel: true,
    petugas: 'Ahmad Fauzi (Staf Gudang)',
    catatan: 'Directed put-away mengirim seluruh unit ke lorong B03 terkunci karena kategori Elektromedik Radiasi; sertifikat BAPETEN dan hasil uji kebocoran tabung diperiksa PJT sebelum rilis.'
  },
  {
    id: 'TRM-008',
    nomorTerima: 'TRM/WH/2024/03/045-1',
    tanggalTerima: '2024-04-12',
    purchaseOrderId: 'PO-2024-045',
    nomorPurchaseOrder: 'PO/AMS/2024/03/045',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    statusMatching: 'Cocok',
    baris: [
      {
        kodeSKU: 'ALKES-AC-10',
        namaAlkes: 'Set Slang & Konektor Sekali Pakai AMS-SP500',
        nomorBets: 'LOT-2024-ACC05',
        tanggalKedaluwarsa: '2027-04-12',
        qtyDipesan: 16,
        qtyDiterima: 16,
        qtyDitolak: 0,
        satuan: 'Pcs',
        binTujuanId: 'BIN-B02-02-01',
        alasanPenolakan: ''
      }
    ],
    hasilQCMasuk: 'Lolos (Released)',
    butuhUjiFungsi: false,
    hasilUjiFungsi: 'Belum Diuji',
    nomorLaporanQC: 'QC/IN/2024/04/045',
    labelDicetak: true,
    rfidDitempel: false,
    petugas: 'Siti Rahma (Staf Logistik)',
    catatan: 'Bahan habis pakai jalur A: tanpa nomor seri, dikendalikan FEFO per bets, dan disimpan di rak suku cadang B02-02 dekat rak induk syringe pump.'
  },
  {
    id: 'TRM-009',
    nomorTerima: 'TRM/WH/2024/02/024-1',
    tanggalTerima: '2024-03-01',
    purchaseOrderId: 'PO-2024-024',
    nomorPurchaseOrder: 'PO/AMS/2024/02/024',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    statusMatching: 'Cocok',
    baris: [
      {
        kodeSKU: 'ALKES-USG-05',
        namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
        nomorBets: 'LOT-2024-USG02',
        tanggalKedaluwarsa: '2034-03-01',
        qtyDipesan: 8,
        qtyDiterima: 8,
        qtyDitolak: 0,
        satuan: 'Unit',
        binTujuanId: 'BIN-B04-01-01',
        alasanPenolakan: ''
      }
    ],
    hasilQCMasuk: 'Lolos (Released)',
    butuhUjiFungsi: true,
    hasilUjiFungsi: 'Lolos Parameter Klinis',
    nomorLaporanQC: 'QC/IN/2024/02/024',
    labelDicetak: true,
    rfidDitempel: true,
    petugas: 'Ahmad Fauzi (Staf Gudang)',
    catatan: 'Delapan unit berat lolos uji fungsi transduser dan kalibrasi probe; directed put-away menempatkannya di rak unit berat B04-01 agar tidak perlu dipindah saat picking.'
  }
];

export const INITIAL_SURAT_JALAN: SuratJalan[] = [
  {
    id: 'SJT-001',
    nomorSuratJalan: 'SJ/CDAKB/2024/SP-EKAT-2024-118',
    nomorPesanan: 'SP-EKAT-2024-118',
    penjualanId: 'SO-2024-118',
    fasyankesTujuan: 'RSUD Pasar Minggu Jakarta Selatan',
    tanggalTerbit: '2024-05-20',
    status: 'Diterima Penerima',
    rute: [
      {
        urutan: 1,
        binId: 'BIN-B01-03-01',
        kodeBin: 'B-01-03-01',
        nomorBets: 'LOT-2024-PM44',
        qty: 2,
        jarakMeter: 12
      }
    ],
    jarakTotalMeter: 12,
    qtyTotal: 2,
    satuan: 'Unit',
    pengangkut: 'Armada Internal',
    namaKurir: 'Budi Utomo / Armada AMS-01',
    nomorLacak: '-',
    statusEFaktur: 'Terbit',
    nomorFaktur: '50.001-24.0001180',
    nomorPaketLkpp: 'Paket LKPP/2024/0091873',
    statusSyncLkpp: 'Tersinkron',
    penanggungJawab: 'apt. Dewi Kartika, S.Si (PJT)',
    catatan: 'Berita acara serah terima ditandatangani penerima barang; dua unit patient monitor beserta sertifikat kalibrasi terlampir.'
  },
  {
    id: 'SJT-002',
    nomorSuratJalan: 'SJ/CDAKB/2024/SP-RS-2024-119',
    nomorPesanan: 'SP-RS-2024-119',
    penjualanId: 'SO-2024-119',
    fasyankesTujuan: 'RSUP Fatmawati Jakarta',
    tanggalTerbit: '2024-05-23',
    status: 'Antre Picking',
    rute: [],
    jarakTotalMeter: 0,
    qtyTotal: 5,
    satuan: 'Unit',
    pengangkut: 'Armada Internal',
    namaKurir: '',
    nomorLacak: '',
    statusEFaktur: 'Belum Terbit',
    nomorFaktur: '',
    nomorPaketLkpp: '',
    statusSyncLkpp: 'Tidak Berlaku',
    penanggungJawab: 'apt. Dewi Kartika, S.Si (PJT)',
    catatan: 'Alokasi FEFO ditahan: bets LOT-2024-SP08 berkunci karantina sehingga sistem hanya boleh mengambil bets berstatus AVAILABLE dari LOT-2024-SP12.'
  },
  {
    id: 'SJT-003',
    nomorSuratJalan: 'SJ/CDAKB/2024/SP-KLINIK-2024-120',
    nomorPesanan: 'SP-KLINIK-2024-120',
    penjualanId: 'SO-2024-120',
    fasyankesTujuan: 'Klinik Utama Sehat Paripurna Bandung',
    tanggalTerbit: '2024-05-22',
    status: 'Terkirim',
    rute: [
      {
        urutan: 1,
        binId: 'BIN-C01-01-01',
        kodeBin: 'C-01-01-01',
        nomorBets: 'LOT-2024-DNG12',
        qty: 20,
        jarakMeter: 9
      }
    ],
    jarakTotalMeter: 9,
    qtyTotal: 20,
    satuan: 'Kit (25 Test)',
    pengangkut: '3PL Ekspedisi',
    namaKurir: 'JNE Cold Chain',
    nomorLacak: 'JNECC2405220091',
    statusEFaktur: 'Terbit',
    nomorFaktur: '50.001-24.0001203',
    nomorPaketLkpp: '',
    statusSyncLkpp: 'Tidak Berlaku',
    penanggungJawab: 'Siti Rahma (Koordinator Cold Chain)',
    catatan: 'Pengiriman rantai dingin dengan cooldown box terkalibrasi; kurva suhu dilampirkan pada bukti kirim.'
  },
  {
    id: 'SJT-004',
    nomorSuratJalan: 'SJ/CDAKB/2024/SP-EKAT-2024-108',
    nomorPesanan: 'SP-EKAT-2024-108',
    penjualanId: 'SO-2024-108',
    fasyankesTujuan: 'RSUD Dr. Soetomo Surabaya',
    tanggalTerbit: '2024-03-06',
    status: 'Terkirim',
    rute: [
      {
        urutan: 1,
        binId: 'BIN-B04-01-01',
        kodeBin: 'B-04-01-01',
        nomorBets: 'LOT-2024-USG02',
        qty: 2,
        jarakMeter: 32
      }
    ],
    jarakTotalMeter: 32,
    qtyTotal: 2,
    satuan: 'Unit',
    pengangkut: 'Kargo Udara',
    namaKurir: 'Garuda Indonesia Cargo',
    nomorLacak: 'GA-727-44120',
    statusEFaktur: 'Terbit',
    nomorFaktur: '50.001-24.0000108',
    nomorPaketLkpp: 'Paket LKPP/2024/0087412',
    statusSyncLkpp: 'Tersinkron',
    penanggungJawab: 'Budi Utomo (Koordinator Gudang)',
    catatan: 'Alat berat dengan wooden casing dan peredam getah; instalasi dan uji fungsi menyusul oleh tim teknisi purna jual.'
  },
  {
    id: 'SJT-005',
    nomorSuratJalan: 'SJ/CDAKB/2024/SP-EKAT-2024-121',
    nomorPesanan: 'SP-EKAT-2024-121',
    penjualanId: 'SO-2024-121',
    fasyankesTujuan: 'RS Hasan Sadikin Bandung',
    tanggalTerbit: '2024-06-12',
    status: 'Selesai Packing',
    rute: [
      {
        urutan: 1,
        binId: 'BIN-B01-03-01',
        kodeBin: 'B-01-03-01',
        nomorBets: 'LOT-2024-PM44',
        qty: 4,
        jarakMeter: 12
      },
      {
        urutan: 2,
        binId: 'BIN-B02-01-01',
        kodeBin: 'B-02-01-01',
        nomorBets: 'LOT-2024-SP12',
        qty: 6,
        jarakMeter: 18
      },
      {
        urutan: 3,
        binId: 'BIN-D04-02-01',
        kodeBin: 'D-04-02-01',
        nomorBets: 'LOT-2023-B884',
        qty: 10,
        jarakMeter: 41
      }
    ],
    jarakTotalMeter: 71,
    qtyTotal: 20,
    satuan: 'Unit',
    pengangkut: '3PL Ekspedisi',
    namaKurir: 'DHL Medical Express',
    nomorLacak: 'DHLME2406120077',
    statusEFaktur: 'Belum Terbit',
    nomorFaktur: '',
    nomorPaketLkpp: 'Paket LKPP/2024/0092045',
    statusSyncLkpp: 'Antre',
    penanggungJawab: 'Budi Utomo (Koordinator Gudang)',
    catatan: 'Rute picking disusun terurut dari bin terdekat ke dock agar perjalanan picking menurun; bets LOT-2023-B884 seharusnya terblokir kunci kedaluwarsa dan menunggu keputusan PJT.'
  },
  {
    id: 'SJT-006',
    nomorSuratJalan: 'SJ/CDAKB/2024/REC-001',
    nomorPesanan: 'REC/CDAKB/2024/001',
    penjualanId: '-',
    fasyankesTujuan: 'PT Kimia Farma Trading & Distribution (Retur Recall Pemasok)',
    tanggalTerbit: '2024-06-14',
    status: 'Dimuat',
    rute: [
      {
        urutan: 1,
        binId: 'BIN-R02-01-01',
        kodeBin: 'R-02-01-01',
        nomorBets: 'LOT-2023-B991',
        qty: 42,
        jarakMeter: 31
      }
    ],
    jarakTotalMeter: 31,
    qtyTotal: 42,
    satuan: 'Box (36 Pcs)',
    pengangkut: '3PL Ekspedisi',
    namaKurir: 'Mes Logistics (Retur Pemasok)',
    nomorLacak: 'MES-RT-20240614',
    statusEFaktur: 'Belum Terbit',
    nomorFaktur: '',
    nomorPaketLkpp: '',
    statusSyncLkpp: 'Tidak Berlaku',
    penanggungJawab: 'Rian Prasetyo, S.Farm (QA)',
    catatan: 'Hasil penarikan recall Kelas II dikembalikan ke prinsipal dengan berita acara pemusnahan tertunda; e-Faktur retur diterbitkan setelah persetujuan pajak.'
  }
];

export const INITIAL_OPNAME_STOK: OpnameStok[] = [
  {
    id: 'OPN-001',
    nomorOpname: 'OPN/WH/2024/05/001',
    tanggal: '2024-05-28',
    gudangId: 'GDM-01',
    cakupanZona: 'Lorong B - Elektromedik Non Radiasi',
    petugas: 'Ahmad Fauzi & Nur Hidayah (Staf Gudang)',
    metode: 'Blind Count',
    baris: [
      {
        kodeSKU: 'ALKES-PM-01',
        namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
        nomorBets: 'LOT-2024-PM44',
        binId: 'BIN-B01-03-01',
        qtySistem: 32,
        qtyFisik: 32,
        status: 'Cocok',
        catatan: 'Tidak ada selisih setelah pengiriman dua unit dibukukan.'
      },
      {
        kodeSKU: 'ALKES-SP-02',
        namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
        nomorBets: 'LOT-2024-SP12',
        binId: 'BIN-B02-01-01',
        qtySistem: 48,
        qtyFisik: 46,
        status: 'Selisih',
        catatan: 'Dua unit keluar sebagai pengganti KTD tanpa dokumen pemindahan.'
      },
      {
        kodeSKU: 'ALKES-USG-05',
        namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
        nomorBets: 'LOT-2024-USG02',
        binId: 'BIN-B04-01-01',
        qtySistem: 8,
        qtyFisik: 8,
        status: 'Cocok',
        catatan: 'Unit fisik cocok dengan tag RFID dan nomor seri pada kartu alat.'
      }
    ],
    status: 'Selesai',
    selisihUnit: -2,
    verifikasiPJT: true,
    alasanSelisih: 'Peminjaman unit pengganti KTD tidak melalui dokumen pemindahan. CAPA: wajib surat jalan internal untuk pengeluaran non-penjualan.'
  },
  {
    id: 'OPN-002',
    nomorOpname: 'OPN/WH/2024/06/002',
    tanggal: '2024-06-04',
    gudangId: 'GDM-02',
    cakupanZona: 'Cold Room - Diagnostik In Vitro',
    petugas: 'Siti Rahma & Teknisi Chiller',
    metode: 'Blind Count',
    baris: [
      {
        kodeSKU: 'IVD-DNG-03',
        namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
        nomorBets: 'LOT-2024-DNG12',
        binId: 'BIN-C01-01-01',
        qtySistem: 300,
        qtyFisik: 300,
        status: 'Cocok',
        catatan: 'Pintu chiller dibuka minimal mungkin saat penghitungan.'
      },
      {
        kodeSKU: 'IVD-STD-06',
        namaAlkes: 'Kit Rapid Test STANDARD F Dengue NS1/IgG-IgM',
        nomorBets: 'LOT-2024-DNG18',
        binId: 'BIN-C01-01-02',
        qtySistem: 300,
        qtyFisik: null,
        status: 'Belum Dihitung',
        catatan: 'Bets masih QC Hold; penghitungan menunggu pelepasan laporan QC.'
      }
    ],
    status: 'Selisih Diajukan',
    selisihUnit: 0,
    verifikasiPJT: false,
    alasanSelisih: 'Tidak ada selisih fisik; pengajuan tertutup menunggu verifikasi PJT atas baris bets QC Hold.'
  },
  {
    id: 'OPN-003',
    nomorOpname: 'OPN/WH/2024/06/003',
    tanggal: '2024-06-10',
    gudangId: 'GDM-03',
    cakupanZona: 'Zona Karantina & Investigasi KTD',
    petugas: 'Rian Prasetyo, S.Farm (QA)',
    metode: 'Open Count',
    baris: [
      {
        kodeSKU: 'ALKES-SP-02',
        namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
        nomorBets: 'LOT-2024-SP08',
        binId: 'BIN-K02-01-01',
        qtySistem: 8,
        qtyFisik: 8,
        status: 'Cocok',
        catatan: 'Rak terkunci; penghitungan disaksikan dua petugas.'
      },
      {
        kodeSKU: 'ALKES-SP-02',
        namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
        nomorBets: 'LOT-2024-SP08',
        binId: 'BIN-K02-02-01',
        qtySistem: 2,
        qtyFisik: 2,
        status: 'Cocok',
        catatan: 'Dua unit investigasi KTD diberi label merah JANGAN DIJUAL.'
      }
    ],
    status: 'Terkunci',
    selisihUnit: 0,
    verifikasiPJT: true,
    alasanSelisih: 'Tidak ditemukan selisih. Zona karantina terkunci sampai investigasi pemasok selesai.'
  },
  {
    id: 'OPN-004',
    nomorOpname: 'OPN/WH/2024/06/004',
    tanggal: '2024-06-12',
    gudangId: 'GDM-01',
    cakupanZona: 'Lorong D - Non Elektromedik Steril (siklus harian)',
    petugas: 'Nur Hidayah (Staf Gudang)',
    metode: 'Blind Count',
    baris: [
      {
        kodeSKU: 'STR-BNG-04',
        namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable',
        nomorBets: 'LOT-2023-B884',
        binId: 'BIN-D04-02-01',
        qtySistem: 81,
        qtyFisik: null,
        status: 'Belum Dihitung',
        catatan: 'Penghitungan berjalan; sistem menyembunyikan angka stok karena metode blind count.'
      },
      {
        kodeSKU: 'ALKES-RT-07',
        namaAlkes: 'Rapid Test Malaria Ag Pf Pantho',
        nomorBets: 'LOT-2024-MAL05',
        binId: 'BIN-D05-01-01',
        qtySistem: 0,
        qtyFisik: null,
        status: 'Belum Dihitung',
        catatan: 'Laporan pembelian belum diterima dari petugas lorong.'
      }
    ],
    status: 'Berjalan',
    selisihUnit: 0,
    verifikasiPJT: false,
    alasanSelisih: ''
  }
];

export const INITIAL_JEJAK_PERGERAKAN: JejakPergerakan[] = [
  {
    id: 'MOV-001',
    waktu: '2023-08-10 09:15',
    kodeSKU: 'STR-BNG-04',
    namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    nomorBets: 'LOT-2023-B884',
    dariBin: 'DOCK-01',
    keBin: 'BIN-D04-02-01',
    jumlah: 85,
    satuan: 'Box (36 Pcs)',
    tipe: 'Penerimaan',
    pengguna: 'Ahmad Fauzi (Staf Gudang)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'TRM/WH/2023/08/019-1',
    alasan: 'Penerimaan dari distributor tunggal; keutuhan blister sterilitas dan nomor izin edar diperiksa sebelum bets dirilis ke rak jual.',
    hashSebelum: '0000000000000000000000000000000000000000000000000000000000000000',
    hash: 'd90cffd24f121e2aa2e3f87597396fd192fe837219b5851a4689e8631d16d70e',
  },
  {
    id: 'MOV-002',
    waktu: '2024-02-26 10:02',
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorBets: 'LOT-2024-SP08',
    dariBin: 'DOCK-01',
    keBin: 'BIN-K02-01-01',
    jumlah: 10,
    satuan: 'Unit',
    tipe: 'Karantina',
    pengguna: 'Ahmad Fauzi (Staf Gudang)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'TRM/WH/2024/02/017-1',
    alasan: 'Sepuluh unit ditahan di Gudang Karantina dengan status QC Hold karena tekanan oklusi perlu penyetelan sebelum rilis jual.',
    hashSebelum: 'd90cffd24f121e2aa2e3f87597396fd192fe837219b5851a4689e8631d16d70e',
    hash: '7403dc00a836e18b31ad9a84efd886b6585a41563b21d4892664c63e35ae4b3c',
  },
  {
    id: 'MOV-003',
    waktu: '2024-02-26 10:26',
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorBets: 'LOT-2024-SP08',
    dariBin: 'DOCK-01',
    keBin: 'BIN-X01-01-01',
    jumlah: 2,
    satuan: 'Unit',
    tipe: 'Karantina',
    pengguna: 'Rian Prasetyo, S.Farm (QA)',
    peran: 'Penanggung Jawab Mutu',
    dokumenRujukan: 'TRM/WH/2024/02/017-1',
    alasan: 'Dua unit ditolak saat penerimaan: kardus luar basah dan segel terbuka. Dipindahkan ke Bad Stock menunggu keputusan klaim asuransi kargo.',
    hashSebelum: '7403dc00a836e18b31ad9a84efd886b6585a41563b21d4892664c63e35ae4b3c',
    hash: 'c187b474aa67b8c4cb4d0fc2ac346c3675905ad1a712149924872876115858a4',
  },
  {
    id: 'MOV-004',
    waktu: '2024-03-01 13:25',
    kodeSKU: 'ALKES-USG-05',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    nomorBets: 'LOT-2024-USG02',
    dariBin: 'DOCK-01',
    keBin: 'BIN-B04-01-01',
    jumlah: 8,
    satuan: 'Unit',
    tipe: 'Penerimaan',
    pengguna: 'Ahmad Fauzi (Staf Gudang)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'TRM/WH/2024/02/024-1',
    alasan: 'Delapan unit USG hasil uji fungsi transduser langsung diarahkan ke rak unit berat B04-01; tag RFID per pallet ditempel agar picking alat berat tidak melewati rak lain.',
    hashSebelum: 'c187b474aa67b8c4cb4d0fc2ac346c3675905ad1a712149924872876115858a4',
    hash: '120f14f936ebacefc63ed73c07f9f79955577ce5e0025267b98d784fd31bef65',
  },
  {
    id: 'MOV-005',
    waktu: '2024-04-12 10:05',
    kodeSKU: 'ALKES-AC-10',
    namaAlkes: 'Set Slang & Konektor Sekali Pakai AMS-SP500',
    nomorBets: 'LOT-2024-ACC05',
    dariBin: 'DOCK-01',
    keBin: 'BIN-B02-02-01',
    jumlah: 16,
    satuan: 'Pcs',
    tipe: 'Penerimaan',
    pengguna: 'Siti Rahma (Staf Logistik)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'TRM/WH/2024/03/045-1',
    alasan: 'Enam belas set slang diterima bersama syringe pump bets LOT-2024-SP12 dan langsung masuk rak suku cadang B02-02; nomor bets dicetak pada label primer.',
    hashSebelum: '120f14f936ebacefc63ed73c07f9f79955577ce5e0025267b98d784fd31bef65',
    hash: 'f9f5da396cfb41f31d32d705543f1b764457b3f456db978001c3ac58c775f47d',
  },
  {
    id: 'MOV-006',
    waktu: '2024-04-12 11:20',
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorBets: 'LOT-2024-SP12',
    dariBin: 'DOCK-01',
    keBin: 'BIN-B02-01-01',
    jumlah: 48,
    satuan: 'Unit',
    tipe: 'Penerimaan',
    pengguna: 'Ahmad Fauzi (Staf Gudang)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'TRM/WH/2024/03/029-1',
    alasan: 'Bets rilis setelah QC melepas (Lolos Released) dan uji fungsi seluruh unit lolos parameter klinis; label bets serta tag RFID ditempel per unit.',
    hashSebelum: 'f9f5da396cfb41f31d32d705543f1b764457b3f456db978001c3ac58c775f47d',
    hash: '5058639e5e5474c75e472da433ad81f4aa2508a8162bce4c668ba00d5eaff87a',
  },
  {
    id: 'MOV-007',
    waktu: '2024-05-08 09:40',
    kodeSKU: 'ALKES-XR-09',
    namaAlkes: 'Mesin X-Ray Portabel Digital MobileRay 30',
    nomorBets: 'LOT-2024-XR03',
    dariBin: 'DOCK-01',
    keBin: 'BIN-B03-01-01',
    jumlah: 3,
    satuan: 'Unit',
    tipe: 'Penerimaan',
    pengguna: 'Ahmad Fauzi (Staf Gudang)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'TRM/WH/2024/04/044-1',
    alasan: 'Directed put-away mengirim tiga unit radiasi ke lorong B03 terkunci; akses lorong hanya terbuka dengan kartu BAPETEN dan pencatatan uji kebocoran tabung.',
    hashSebelum: '5058639e5e5474c75e472da433ad81f4aa2508a8162bce4c668ba00d5eaff87a',
    hash: 'aa20c0c0c56983f46a826933a876bbdd59b1e4229d0a11b452eedc012af0b575',
  },
  {
    id: 'MOV-008',
    waktu: '2024-05-12 11:07',
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorBets: 'LOT-2024-SP08',
    dariBin: 'BIN-K02-01-01',
    keBin: 'BIN-K02-02-01',
    jumlah: 2,
    satuan: 'Unit',
    tipe: 'Karantina',
    pengguna: 'Rian Prasetyo, S.Farm (QA)',
    peran: 'Penanggung Jawab Mutu',
    dokumenRujukan: 'KTD/EWAT-ALKES/2024/001',
    alasan: 'Menindaklanjuti laporan KTD, dua unit bets LOT-2024-SP08 dipindah ke bin karantina khusus menunggu investigasi sensor tekanan bersama pemasok.',
    hashSebelum: 'aa20c0c0c56983f46a826933a876bbdd59b1e4229d0a11b452eedc012af0b575',
    hash: 'fcd2c254d21eca24ecf9f36364190478aa8dc6455ea424c95d7323ccecf21c20',
  },
  {
    id: 'MOV-009',
    waktu: '2024-05-18 09:33',
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorBets: 'LOT-2024-SP08',
    dariBin: 'OUT-FASYANKES',
    keBin: 'BIN-R01-01-01',
    jumlah: 1,
    satuan: 'Unit',
    tipe: 'Penerimaan',
    pengguna: 'Siti Rahma (Staf Logistik)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'RET/RS-SARDJITO/24/02',
    alasan: 'Unit retur RSUP Dr. Sardjito diterima di Gudang Retur dan dikunci dari alokasi FEFO sampai investigasi QA selesai.',
    hashSebelum: 'fcd2c254d21eca24ecf9f36364190478aa8dc6455ea424c95d7323ccecf21c20',
    hash: '66e06fd4b463ca84ba80daf4d70de898612b6afc36ebddc4af6b65eee8bf07da',
  },
  {
    id: 'MOV-010',
    waktu: '2024-05-20 08:14',
    kodeSKU: 'ALKES-PM-01',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nomorBets: 'LOT-2024-PM44',
    dariBin: 'DOCK-01',
    keBin: 'BIN-B01-03-01',
    jumlah: 34,
    satuan: 'Unit',
    tipe: 'Penerimaan',
    pengguna: 'Ahmad Fauzi (Staf Gudang)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'TRM/WH/2024/05/041-1',
    alasan: 'Penerimaan 34 unit atas PO/AMS/2024/05/041 setelah laporan QC/IN/2024/05/089 melepas bets dan uji fungsi lolos parameter klinis.',
    hashSebelum: '66e06fd4b463ca84ba80daf4d70de898612b6afc36ebddc4af6b65eee8bf07da',
    hash: 'f541aca4efd58c1658230c5151ead9cff50644d46cfa3a74cbf18a6b08cd366e',
  },
  {
    id: 'MOV-011',
    waktu: '2024-05-20 13:31',
    kodeSKU: 'ALKES-PM-01',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nomorBets: 'LOT-2024-PM44',
    dariBin: 'BIN-B01-03-01',
    keBin: 'DOCK-03',
    jumlah: 2,
    satuan: 'Unit',
    tipe: 'Picking',
    pengguna: 'Ahmad Fauzi (Staf Gudang)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'SJ/CDAKB/2024/SP-EKAT-2024-118',
    alasan: 'FEFO: LOT-2024-PM44 adalah bets dengan tanggal kedaluwarsa terdekat yang berstatus AVAILABLE untuk alokasi pesanan e-Katalog LKPP.',
    hashSebelum: 'f541aca4efd58c1658230c5151ead9cff50644d46cfa3a74cbf18a6b08cd366e',
    hash: 'e4bef16b7fe2e6b0f0e026e3bc43ad8eb30b4076528686e6a7205387c1ad744d',
  },
  {
    id: 'MOV-012',
    waktu: '2024-05-21 07:48',
    kodeSKU: 'IVD-DNG-03',
    namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    nomorBets: 'LOT-2024-DNG12',
    dariBin: 'DOCK-02',
    keBin: 'BIN-C01-01-01',
    jumlah: 320,
    satuan: 'Kit (25 Test)',
    tipe: 'Penerimaan',
    pengguna: 'Siti Rahma (Staf Logistik)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'TRM/WH/2024/04/035-1',
    alasan: 'Rantai dingin utuh: datalogger membaca 4,1 - 5,2 derajat Celcius tanpa ekskursi. Bets diarahkan ke Cold Room sesuai aturan simpan Diagnostik In Vitro.',
    hashSebelum: 'e4bef16b7fe2e6b0f0e026e3bc43ad8eb30b4076528686e6a7205387c1ad744d',
    hash: '55ad473aee29ad16db9921c352e95b298e74c607d850c85ce9058ce75f3685d0',
  },
  {
    id: 'MOV-013',
    waktu: '2024-05-21 08:05',
    kodeSKU: 'ALKES-PM-01',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nomorBets: 'LOT-2024-PM44',
    dariBin: 'DOCK-03',
    keBin: 'OUT-FASYANKES',
    jumlah: 2,
    satuan: 'Unit',
    tipe: 'Pengiriman',
    pengguna: 'Budi Utomo (Koordinator Gudang)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'SJ/CDAKB/2024/SP-EKAT-2024-118',
    alasan: 'Dimuat armada internal dengan surat jalan bertanda tangan dan berita acara kondisi fisik alat saat serah terima.',
    hashSebelum: '55ad473aee29ad16db9921c352e95b298e74c607d850c85ce9058ce75f3685d0',
    hash: '6af809e7f32331b07370035670d5132578dda0e78d1ec515bd3fde7b1fe2c42c',
  },
  {
    id: 'MOV-014',
    waktu: '2024-05-22 15:20',
    kodeSKU: 'IVD-DNG-03',
    namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    nomorBets: 'LOT-2024-DNG12',
    dariBin: 'BIN-C01-01-01',
    keBin: 'DOCK-03',
    jumlah: 20,
    satuan: 'Kit (25 Test)',
    tipe: 'Picking',
    pengguna: 'Siti Rahma (Staf Logistik)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'SJ/CDAKB/2024/SP-KLINIK-2024-120',
    alasan: 'Pengambilan cold chain dengan cooldown box terkalibrasi; waktu di luar chiller 11 menit dari batas maksimum 30 menit.',
    hashSebelum: '6af809e7f32331b07370035670d5132578dda0e78d1ec515bd3fde7b1fe2c42c',
    hash: '618c5d61ec834c18f7bee91f155b794f2dfd8c30a5a5c79341c2878f91fcb189',
  },
  {
    id: 'MOV-015',
    waktu: '2024-05-23 09:12',
    kodeSKU: 'IVD-DNG-03',
    namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    nomorBets: 'LOT-2024-DNG12',
    dariBin: 'DOCK-03',
    keBin: 'OUT-FASYANKES',
    jumlah: 20,
    satuan: 'Kit (25 Test)',
    tipe: 'Pengiriman',
    pengguna: 'Budi Utomo (Koordinator Gudang)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'SJ/CDAKB/2024/SP-KLINIK-2024-120',
    alasan: 'Diserahkan ke 3PL ekspedisi berpendingin dengan nomor lacak dan lampiran kurva suhu pengiriman.',
    hashSebelum: '618c5d61ec834c18f7bee91f155b794f2dfd8c30a5a5c79341c2878f91fcb189',
    hash: '32e517ad205ed8a904d184e7719449057779c52d5ceaf3f604c81faaf439fec6',
  },
  {
    id: 'MOV-016',
    waktu: '2024-05-27 14:18',
    kodeSKU: 'STR-BNG-04',
    namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    nomorBets: 'LOT-2023-B991',
    dariBin: 'OUT-FASYANKES',
    keBin: 'BIN-R02-01-01',
    jumlah: 42,
    satuan: 'Box (36 Pcs)',
    tipe: 'Penarikan Recall',
    pengguna: 'Budi Utomo (Koordinator Gudang)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'REC/CDAKB/2024/001',
    alasan: 'Hasil penarikan lapangan recall Kelas II dari empat fasyankes; fisik ditahan terpisah dari stok jual menunggu keputusan pemusnahan bersama PJT.',
    hashSebelum: '32e517ad205ed8a904d184e7719449057779c52d5ceaf3f604c81faaf439fec6',
    hash: 'f35fabb7c277ba84776aaeb9f2c2f9bcb4494b9cb5e238234cb8a1c5f3213d43',
  },
  {
    id: 'MOV-017',
    waktu: '2024-05-28 16:40',
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorBets: 'LOT-2024-SP12',
    dariBin: 'BIN-B02-01-01',
    keBin: 'OPNAME',
    jumlah: 2,
    satuan: 'Unit',
    tipe: 'Penyesuaian',
    pengguna: 'Rian Prasetyo, S.Farm (QA)',
    peran: 'Penanggung Jawab Mutu',
    dokumenRujukan: 'OPN/WH/2024/05/001',
    alasan: 'Selisih opname blind count: dua unit keluar sebagai unit pengganti KTD tanpa dokumen pemindahan. Penyesuaian stok disahkan PJT.',
    hashSebelum: 'f35fabb7c277ba84776aaeb9f2c2f9bcb4494b9cb5e238234cb8a1c5f3213d43',
    hash: '49c17cc9fb0a791278be3c0081fea6107606d8ec1be3c1c0414d1167224698e5',
  },
  {
    id: 'MOV-018',
    waktu: '2024-06-05 07:20',
    kodeSKU: 'IVD-STD-06',
    namaAlkes: 'Kit Rapid Test STANDARD F Dengue NS1/IgG-IgM',
    nomorBets: 'LOT-2024-DNG18',
    dariBin: 'DOCK-02',
    keBin: 'BIN-C01-01-02',
    jumlah: 300,
    satuan: 'Kit (25 Test)',
    tipe: 'Karantina',
    pengguna: 'Siti Rahma (Staf Logistik)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'TRM/WH/2024/05/042-1',
    alasan: 'Barang masuk bin QC Hold cold room; rilis menunggu pembacaan datalogger dan verifikasi dokumen PIB oleh PJT.',
    hashSebelum: '49c17cc9fb0a791278be3c0081fea6107606d8ec1be3c1c0414d1167224698e5',
    hash: 'b800bb707c85d6b669150010e2350af21d12e97eae642f7d0f8e658eff8d3cf7',
  },
  {
    id: 'MOV-019',
    waktu: '2024-06-11 10:55',
    kodeSKU: 'STR-BNG-04',
    namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    nomorBets: 'LOT-2023-B884',
    dariBin: 'BIN-D04-02-01',
    keBin: 'BIN-X01-02-01',
    jumlah: 4,
    satuan: 'Box (36 Pcs)',
    tipe: 'Pemindahan Rak',
    pengguna: 'Ahmad Fauzi (Staf Gudang)',
    peran: 'Operator Gudang',
    dokumenRujukan: 'SJ/WH/2024/06/011',
    alasan: 'Empat box dengan sisa masa kedaluwarsa di bawah ambang kunci dialihkan ke Bad Stock dan status stok dikunci agar tidak lagi terpilih FEFO.',
    hashSebelum: 'b800bb707c85d6b669150010e2350af21d12e97eae642f7d0f8e658eff8d3cf7',
    hash: 'e5e371028343f0fc68a344723c592c084c6dd732efde306c816b80eb0a9a19d0',
  }
];

export const INITIAL_AMBANG_STOK: AmbangStok[] = [
  {
    id: 'AMB-01',
    kodeSKU: 'ALKES-PM-01',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    rataRataTerjualPerHari: 0.4,
    leadTimeHari: 21,
    safetyStockHari: 14,
    minStok: 14,
    maxStok: 26,
    gudangId: 'GDM-01',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    isActive: true
  },
  {
    id: 'AMB-02',
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    rataRataTerjualPerHari: 0.6,
    leadTimeHari: 21,
    safetyStockHari: 10,
    minStok: 19,
    maxStok: 37,
    gudangId: 'GDM-01',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    isActive: true
  },
  {
    id: 'AMB-03',
    kodeSKU: 'IVD-DNG-03',
    namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    rataRataTerjualPerHari: 6,
    leadTimeHari: 14,
    safetyStockHari: 7,
    minStok: 126,
    maxStok: 306,
    gudangId: 'GDM-02',
    namaPemasok: 'SD Biosensor Inc.',
    isActive: true
  },
  {
    id: 'AMB-04',
    kodeSKU: 'STR-BNG-04',
    namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    rataRataTerjualPerHari: 1.2,
    leadTimeHari: 30,
    safetyStockHari: 21,
    minStok: 61,
    maxStok: 97,
    gudangId: 'GDM-01',
    namaPemasok: 'PT Kimia Farma Trading & Distribution',
    isActive: true
  },
  {
    id: 'AMB-05',
    kodeSKU: 'ALKES-USG-05',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    rataRataTerjualPerHari: 0.1,
    leadTimeHari: 60,
    safetyStockHari: 30,
    minStok: 9,
    maxStok: 12,
    gudangId: 'GDM-01',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    isActive: true
  },
  {
    id: 'AMB-06',
    kodeSKU: 'IVD-STD-06',
    namaAlkes: 'Kit Rapid Test STANDARD F Dengue NS1/IgG-IgM',
    rataRataTerjualPerHari: 4,
    leadTimeHari: 45,
    safetyStockHari: 14,
    minStok: 236,
    maxStok: 356,
    gudangId: 'GDM-02',
    namaPemasok: 'SD Biosensor Inc.',
    isActive: true
  },
  {
    id: 'AMB-07',
    kodeSKU: 'ALKES-RT-07',
    namaAlkes: 'Rapid Test Malaria Ag Pf Pantho',
    rataRataTerjualPerHari: 2,
    leadTimeHari: 14,
    safetyStockHari: 7,
    minStok: 42,
    maxStok: 102,
    gudangId: 'GDM-01',
    namaPemasok: 'PT Kimia Farma Trading & Distribution',
    isActive: true
  },
  {
    id: 'AMB-08',
    kodeSKU: 'ALKES-O2-08',
    namaAlkes: 'Regulator Oksigen dengan Flowmeter',
    rataRataTerjualPerHari: 0.8,
    leadTimeHari: 21,
    safetyStockHari: 10,
    minStok: 25,
    maxStok: 49,
    gudangId: 'GDM-01',
    namaPemasok: 'PT Kimia Farma Trading & Distribution',
    isActive: false
  }
];

export const INITIAL_KEJADIAN_SCANNER: KejadianScanner[] = [
  {
    id: 'SCN-001',
    waktu: '2024-05-20 08:02',
    perangkat: 'Zebra TC22 (PDA-GUDANG-01)',
    tipePerangkat: 'Handheld PDA',
    protokol: 'USB/Serial',
    mode: 'Penerimaan',
    binDipindai: 'DOCK-01',
    produkDipindai: 'Patient Monitor AMS-V12 Pro (pallet PM44)',
    nomorBets: 'LOT-2024-PM44',
    jumlah: 34,
    rujukanDokumen: 'TRM/WH/2024/05/041-1',
    hasilValidasi: 'Tervalidasi',
    catatan: 'Jumlah pallet sama dengan manifes PO; arahan put-away ke lorong B diterima.'
  },
  {
    id: 'SCN-002',
    waktu: '2024-05-21 07:35',
    perangkat: 'RFID Gate Dock 02',
    tipePerangkat: 'RFID Gate',
    protokol: 'MQTT',
    mode: 'Penerimaan',
    binDipindai: 'BIN-D05-01-01',
    produkDipindai: 'Reagen Rapid Test Dengue (pallet DNG12)',
    nomorBets: 'LOT-2024-DNG12',
    jumlah: 320,
    rujukanDokumen: 'TRM/WH/2024/04/035-1',
    hasilValidasi: 'Bin Tidak Sesuai Zona',
    catatan: 'Pintu RFID menolak arahan ke lorong suhu kamar; sistem mengembalikan usulan BIN-C01-01-01 sesuai aturan simpan Diagnostik In Vitro.'
  },
  {
    id: 'SCN-003',
    waktu: '2024-05-22 15:22',
    perangkat: 'Honeywell EDA51 (PDA-GUDANG-02)',
    tipePerangkat: 'Handheld PDA',
    protokol: 'USB/Serial',
    mode: 'Pengiriman',
    binDipindai: 'BIN-C01-01-01',
    produkDipindai: 'Reagen Rapid Test Dengue',
    nomorBets: 'LOT-2024-DNG12',
    jumlah: 24,
    rujukanDokumen: 'SJ/CDAKB/2024/SP-KLINIK-2024-120',
    hasilValidasi: 'Jumlah Melebihi Manifes',
    catatan: 'Pemindaian 24 kit ditolak karena manifes surat jalan hanya 20 kit; operator memindai ulang 20 kit.'
  },
  {
    id: 'SCN-004',
    waktu: '2024-05-23 10:05',
    perangkat: 'Zebra TC22 (PDA-GUDANG-01)',
    tipePerangkat: 'Handheld PDA',
    protokol: 'USB/Serial',
    mode: 'Pengiriman',
    binDipindai: 'BIN-K02-01-01',
    produkDipindai: 'Syringe Pump AMS-SP500',
    nomorBets: 'LOT-2024-SP08',
    jumlah: 5,
    rujukanDokumen: 'SJ/CDAKB/2024/SP-RS-2024-119',
    hasilValidasi: 'Stok Terkunci Karantina',
    catatan: 'Picking diblokir karena bets dalam status karantina; FEFO dialihkan ke LOT-2024-SP12 yang berstatus AVAILABLE.'
  },
  {
    id: 'SCN-005',
    waktu: '2024-06-05 07:12',
    perangkat: 'RFID Gate Dock 02',
    tipePerangkat: 'RFID Gate',
    protokol: 'MQTT',
    mode: 'Penerimaan',
    binDipindai: 'DOCK-02',
    produkDipindai: 'Kit Rapid Test (karton tanpa label AMS)',
    nomorBets: 'LOT-2024-DNG19',
    jumlah: 50,
    rujukanDokumen: 'TRM/WH/2024/05/042-1',
    hasilValidasi: 'Bets Tidak Terdaftar',
    catatan: 'Nomor bets tidak ada pada dokumen penerimaan mana pun; karton dipisahkan dan dibuatkan CAPA bersama pemasok.'
  },
  {
    id: 'SCN-006',
    waktu: '2024-04-12 11:41',
    perangkat: 'Zebra ZT411 (LABEL-PRINTER-01)',
    tipePerangkat: 'Printer Label',
    protokol: 'MQTT',
    mode: 'Penerimaan',
    binDipindai: 'BIN-B02-01-01',
    produkDipindai: 'Syringe Pump AMS-SP500',
    nomorBets: 'LOT-2024-SP12',
    jumlah: 48,
    rujukanDokumen: 'TRM/WH/2024/03/029-1',
    hasilValidasi: 'Tervalidasi',
    catatan: 'Empat puluh delapan label bets beserta tag RFID unit dicetak setelah QC melepas bets.'
  },
  {
    id: 'SCN-007',
    waktu: '2024-05-28 15:10',
    perangkat: 'RFID Tunnel Cold Room',
    tipePerangkat: 'RFID Tunnel',
    protokol: 'MQTT',
    mode: 'Opname',
    binDipindai: 'BIN-C01-01-01',
    produkDipindai: 'Reagen Rapid Test Dengue',
    nomorBets: 'LOT-2024-DNG12',
    jumlah: 300,
    rujukanDokumen: 'OPN/WH/2024/06/002',
    hasilValidasi: 'Tervalidasi',
    catatan: 'Tunnel membaca seluruh isi rak tanpa membuka kemasan; angka diserahkan sebagai blind count.'
  },
  {
    id: 'SCN-008',
    waktu: '2024-06-11 10:40',
    perangkat: 'Honeywell EDA51 (PDA-GUDANG-02)',
    tipePerangkat: 'Handheld PDA',
    protokol: 'USB/Serial',
    mode: 'Pemindahan Rak',
    binDipindai: 'BIN-D04-02-01',
    produkDipindai: 'Benang Bedah Polyglactin 910',
    nomorBets: 'LOT-2023-B884',
    jumlah: 4,
    rujukanDokumen: 'SJ/WH/2024/06/011',
    hasilValidasi: 'Tervalidasi',
    catatan: 'Empat box dipindah ke Bad Stock; status bets langsung dikunci dari alokasi FEFO.'
  }
];

export const INITIAL_SINKRONISASI_LKPP: SinkronisasiLkpp[] = [
  {
    id: 'LKP-001',
    waktu: '2024-05-21 09:00',
    kodeSKU: 'ALKES-PM-01',
    namaProduk: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nomorPaketLkpp: 'Paket LKPP/2024/0091873',
    qtyDilaporkan: 32,
    pemicu: 'Perubahan Stok',
    status: 'Terkirim',
    percobaan: 1,
    pesanRespons: 'HTTP 200 - katalog terpembarui; stok tampil pada etalase e-Katalog dalam 4 menit.'
  },
  {
    id: 'LKP-002',
    waktu: '2024-05-23 09:20',
    kodeSKU: 'IVD-DNG-03',
    namaProduk: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    nomorPaketLkpp: 'Paket LKPP/2024/0091802',
    qtyDilaporkan: 285,
    pemicu: 'Pengiriman',
    status: 'Terkirim',
    percobaan: 1,
    pesanRespons: 'HTTP 200 - pengurangan stok tercatat; sisa bets tetap tersedia untuk pesanan lain.'
  },
  {
    id: 'LKP-003',
    waktu: '2024-05-18 10:02',
    kodeSKU: 'ALKES-SP-02',
    namaProduk: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorPaketLkpp: 'Paket LKPP/2024/0090155',
    qtyDilaporkan: 46,
    pemicu: 'Kerusakan',
    status: 'Ditolak',
    percobaan: 1,
    pesanRespons: 'HTTP 422 - nomor bets tidak terikat pada paket kontrak; verifikasi ulang oleh Admin Penjualan.'
  },
  {
    id: 'LKP-004',
    waktu: '2024-05-27 15:00',
    kodeSKU: 'STR-BNG-04',
    namaProduk: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    nomorPaketLkpp: 'Paket LKPP/2023/0080119',
    qtyDilaporkan: 0,
    pemicu: 'Recall',
    status: 'Terkirim',
    percobaan: 1,
    pesanRespons: 'HTTP 200 - status katalog bets LOT-2023-B991 ditandai ditangguhkan sehingga tidak dapat dipesan.'
  },
  {
    id: 'LKP-005',
    waktu: '2024-06-05 07:25',
    kodeSKU: 'IVD-STD-06',
    namaProduk: 'Kit Rapid Test STANDARD F Dengue NS1/IgG-IgM',
    nomorPaketLkpp: 'Paket LKPP/2024/0092441',
    qtyDilaporkan: 0,
    pemicu: 'Karantina',
    status: 'Gagal',
    percobaan: 3,
    pesanRespons: 'HTTP 503 - gateway LKPP tidak merespons; antrean diulang pada siklus berikutnya.'
  },
  {
    id: 'LKP-006',
    waktu: '2024-06-12 18:00',
    kodeSKU: 'ALKES-PM-01',
    namaProduk: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nomorPaketLkpp: 'Paket LKPP/2024/0091873',
    qtyDilaporkan: 28,
    pemicu: 'Perubahan Stok',
    status: 'Antre',
    percobaan: 0,
    pesanRespons: 'Menunggu siklus sinkronisasi berikutnya (setiap 15 menit).'
  }
];

export const INITIAL_KIRIMAN_SATU_SEHAT: KirimanSatuSehat[] = [
  {
    id: 'FHR-001',
    waktu: '2024-05-21 08:40',
    tipeSumberDaya: 'SupplyDelivery',
    nomorRujukan: 'SJ/CDAKB/2024/SP-EKAT-2024-118',
    kodeFasyankes: 'FKN-RS-0041',
    namaFasyankes: 'RSUD Pasar Minggu Jakarta Selatan',
    nomorBets: 'LOT-2024-PM44',
    nomorSerial: 'AMS-V12P-2406-0031',
    suhuRantaiDingin: '-',
    status: 'Diterima (201)',
    payloadJson: '{"resourceType":"Bundle","type":"transaction","entry":[{"resource":{"resourceType":"SupplyDelivery","identifier":{"system":"https://ams-alkes.example/sj","value":"SJ/CDAKB/2024/SP-EKAT-2024-118"},"status":"completed","type":{"coding":[{"code":"2","display":"Alat Kesehatan"}]},"extension":[{"url":"https://sso.kemkes.go.id/fhir/StructureDefinition/lot-number","valueString":"LOT-2024-PM44"},{"url":"https://sso.kemkes.go.id/fhir/StructureDefinition/serial-number","valueString":"AMS-V12P-2406-0031"}]}}]}',
    catatan: 'Serah terima dua unit patient monitor dilaporkan sebagai SupplyDelivery; nomor izin edar dan kode fasyankes sudah terpetakan pada master data.'
  },
  {
    id: 'FHR-002',
    waktu: '2024-05-23 10:05',
    tipeSumberDaya: 'SupplyDelivery',
    nomorRujukan: 'SJ/CDAKB/2024/SP-KLINIK-2024-120',
    kodeFasyankes: 'FKN-KL-0188',
    namaFasyankes: 'Klinik Utama Sehat Paripurna Bandung',
    nomorBets: 'LOT-2024-DNG12',
    nomorSerial: '-',
    suhuRantaiDingin: '4,3°C (dalam rentang 2°C - 8°C)',
    status: 'Diterima (201)',
    payloadJson: '{"resourceType":"Bundle","type":"transaction","entry":[{"resource":{"resourceType":"SupplyDelivery","status":"completed","extension":[{"url":"https://sso.kemkes.go.id/fhir/StructureDefinition/lot-number","valueString":"LOT-2024-DNG12"},{"url":"https://sso.kemkes.go.id/fhir/StructureDefinition/storage-temperature","valueString":"4.3"}]}}]}',
    catatan: 'Kiriman reagen menyertakan suhu penerimaan; validasi menolak kiriman bila rantai dingin di luar rentang.'
  },
  {
    id: 'FHR-003',
    waktu: '2024-06-12 09:15',
    tipeSumberDaya: 'Device',
    nomorRujukan: 'SNS-001',
    kodeFasyankes: 'FKN-RS-0041',
    namaFasyankes: 'RSUD Pasar Minggu Jakarta Selatan',
    nomorBets: 'LOT-2024-PM44',
    nomorSerial: 'AMS-V12P-2406-0031',
    suhuRantaiDingin: '-',
    status: 'Antre',
    payloadJson: '{"resourceType":"Device","status":"active","serialNumber":"AMS-V12P-2406-0031","distinctIdentifier":"LOT-2024-PM44","type":{"coding":[{"system":"https://sso.kemkes.go.id/fhir/NamingSystem/alkes","code":"AKD-PM-12"}]}}',
    catatan: 'Registrasi unit alat kesehatan; antrean jalan terus meski klien SATUSEHAT belum terdaftar resmi, karena pratinjau payload memakai tenant sandbox.'
  },
  {
    id: 'FHR-004',
    waktu: '2024-06-13 14:20',
    tipeSumberDaya: 'Device',
    nomorRujukan: 'KTD/EWAT-ALKES/2024/001',
    kodeFasyankes: 'FKN-RS-0132',
    namaFasyankes: 'RSUD Tarakan Jakarta Pusat',
    nomorBets: 'LOT-2024-SP08',
    nomorSerial: 'SN-SP-22838',
    suhuRantaiDingin: '-',
    status: 'Ditolak (OperationOutcome)',
    payloadJson: '{"resourceType":"OperationOutcome","issue":[{"severity":"error","code":"not-found","diagnostics":"Organization reference kode fasyankes tidak ditemukan pada master SATUSEHAT Logistik."}]}',
    catatan: 'Penolakan karena kode fasyankes belum dipetakan; unit yang dilaporkan adalah salah satu dari dua unit investigasi KTD di BIN-K02-02-01, perlu perbaikan master data sebelum kirim ulang.'
  },
  {
    id: 'FHR-005',
    waktu: '2024-06-14 08:00',
    tipeSumberDaya: 'Organization',
    nomorRujukan: 'SDAK-KEMENKES-910248201',
    kodeFasyankes: 'FKN-PD-0007',
    namaFasyankes: 'PT Anugrah Mitra Selaras (REMEDI)',
    nomorBets: '-',
    nomorSerial: '-',
    suhuRantaiDingin: '-',
    status: 'Diterima (201)',
    payloadJson: '{"resourceType":"Organization","name":"PT Anugrah Mitra Selaras","identifier":[{"system":"https://sso.kemkes.go.id/fhir/NamingSystem/sdak","value":"SDAK-KEMENKES-910248201"}],"active":true}',
    catatan: 'Sinkronisasi profil penyalur alkes; sumber daya Organization wajib valid sebelum kiriman SupplyDelivery diterima.'
  },
  {
    id: 'FHR-006',
    waktu: '2024-06-15 07:30',
    tipeSumberDaya: 'Immunization',
    nomorRujukan: 'IDN-COLD-2024-01',
    kodeFasyankes: 'FKN-Pusk-1204',
    namaFasyankes: 'Puskesmas Cipayung Jakarta Timur',
    nomorBets: 'LOT-2024-VAC09',
    nomorSerial: '-',
    suhuRantaiDingin: '5,1°C',
    status: 'Belum Terkirim',
    payloadJson: '{"resourceType":"Immunization","status":"completed","lotNumber":"LOT-2024-VAC09","occurrenceDateTime":"2024-06-15T07:30:00+07:00"}',
    catatan: 'Sumber daya cadangan untuk kebutuhan vaksin; PT AMS belum menyalurkan vaksin sehingga kiriman disimpan sebagai pratinjau.'
  }
];

export const KONFIGURASI_GUDANG_AWAL: KonfigurasiGudang = {
  umurKunciEdHari: 60,
  ambangSelisihOpnamePersen: 0.5,
  coldChainMinSuhu: 2,
  coldChainMaxSuhu: 8,
  menitMaksimumDiLuarRentang: 30,
  frekuensiLogSuhuPerHari: 2,
  prefixSuratJalan: 'SJ/CDAKB',
  endpointLkpp: 'https://apio.lkpp.go.id/v1/sinkronisasi-inventaris',
  endpointSatuSehat: 'https://api-satusehat.kemkes.go.id/v2/fhir/Bundle',
  klienSatuSehatTerdaftar: false
};

export const INITIAL_LAYANAN_TEKNIS: LayananTeknis[] = [
  {
    id: 'SRV-001',
    nomorTiket: 'TK-2024-05-01',
    jenisLayanan: 'Instalasi & Uji Fungsi',
    fasyankes: 'RSUD Pasar Minggu Jakarta Selatan',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    tipeModel: 'AMS-V12 Pro',
    nomorSeri: 'SN-V12-99014',
    teknisi: 'Dian Nugraha, A.Md.TEM (Elektromedis STR Terdaftar)',
    tanggalJadwal: '2024-05-24',
    tanggalSelesai: '2024-05-24',
    status: 'Selesai & Berita Acara Terbit',
    nomorSertifikatKalibrasi: 'BAI-PSM-2024-041',
    hasilUjiFungsi: 'Lolos Parameter Klinis',
    catatanTeknisi: 'Instalasi di Ruang ICU Bed 3. Uji fungsi parameter NIBP, SpO2, dan EKG 12-lead normal. Pelatihan user dokter & perawat terlaksana.'
  },
  {
    id: 'SRV-002',
    nomorTiket: 'TK-2024-05-02',
    jenisLayanan: 'Kalibrasi Berkala',
    fasyankes: 'RSUP Fatmawati Jakarta Selatan',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    tipeModel: 'AMS-SP500',
    nomorSeri: 'SN-SP-22841',
    teknisi: 'Rizky Pratama (Teknisi Medis)',
    tanggalJadwal: '2024-05-26',
    status: 'Menunggu Jadwal',
    hasilUjiFungsi: 'Lolos Parameter Klinis',
    catatanTeknisi: 'Kalibrasi tahunan wajib sesuai regulasi BPFK. Simulator laju alir (infusion analyzer) telah dikalibrasi.'
  },
  {
    id: 'SRV-003',
    nomorTiket: 'TK-2024-05-03',
    jenisLayanan: 'Perbaikan Kerusakan',
    fasyankes: 'RS Pelni Jakarta Barat',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    tipeModel: 'SonoEcho 90',
    nomorSeri: 'SN-USG-8812',
    teknisi: 'Dian Nugraha, A.Md.TEM',
    tanggalJadwal: '2024-05-23',
    status: 'Proses Pengerjaan',
    hasilUjiFungsi: 'Perlu Penyetelan',
    catatanTeknisi: 'Kabel probe konveks mengalami intermittent signal. Penggantian kabel probe original dalam proses.'
  }
];

export const INITIAL_BETS_PRODUKSI: BetsProduksi[] = [
  {
    id: 'BMR-2024-05',
    nomorBMR: 'BMR/CPAKB/24/005',
    namaProduk: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorBets: 'LOT-2024-SP12',
    jumlahRencana: 50,
    jumlahRealisasi: 48,
    satuan: 'Unit',
    ruangBersih: 'Area Perakitan Terkendali',
    tanggalMulai: '2024-04-01',
    tanggalTarget: '2024-04-12',
    status: 'Rilis QC',
    catatanSanitasi: 'Pembersihan meja kerja alkohol 70%, tekanan udara +12 Pa, pakaian antistatik ESD compliant.',
    penanggungJawab: 'Ir. Agus Santoso (Manajer Manufaktur)'
  },
  {
    id: 'BMR-2024-06',
    nomorBMR: 'BMR/CPAKB/24/006',
    namaProduk: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    nomorBets: 'LOT-2024-B102',
    jumlahRencana: 500,
    jumlahRealisasi: 495,
    satuan: 'Box (36 Pcs)',
    ruangBersih: 'Cleanroom Kelas C',
    tanggalMulai: '2024-05-15',
    tanggalTarget: '2024-05-28',
    status: 'Sterilisasi',
    catatanSanitasi: 'Validasi proses sterilisasi Gas Etilen Oksida (ETO). Indikator biologi Bacillus atrophaeus.',
    penanggungJawab: 'Ir. Agus Santoso (Manajer Manufaktur)'
  }
];

export const INITIAL_PEMASOK: PemasokAlkes[] = [
  {
    id: 'SPL-01',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    kategori: 'Prinsipal Luar Negeri',
    nomorIzinPenyalur: 'SDAK & LOA Prinsipal No. MR-ID-2023',
    negara: 'Tiongkok',
    statusAuditMutu: 'Terkualifikasi',
    skorEvaluasi: 96,
    tanggalEvaluasiTerakhir: '2024-01-10',
    kontak: 'medical-asia@mindray.com'
  },
  {
    id: 'SPL-02',
    namaPemasok: 'SD Biosensor Inc.',
    kategori: 'Prinsipal Luar Negeri',
    nomorIzinPenyalur: 'SDAK & LOA Prinsipal No. SDB-ID-442',
    negara: 'Korea Selatan',
    statusAuditMutu: 'Terkualifikasi',
    skorEvaluasi: 94,
    tanggalEvaluasiTerakhir: '2024-02-15',
    kontak: 'global-support@sdbiosensor.com'
  },
  {
    id: 'SPL-03',
    namaPemasok: 'PT Kimia Farma Trading & Distribution',
    kategori: 'Distributor Tunggal',
    nomorIzinPenyalur: 'SDAK-KEMENKES-910248201',
    negara: 'Indonesia',
    statusAuditMutu: 'Terkualifikasi',
    skorEvaluasi: 92,
    tanggalEvaluasiTerakhir: '2024-03-01',
    kontak: 'distribusi@kftd.co.id'
  }
];

export const INITIAL_PURCHASE_ORDER: PurchaseOrderAlkes[] = [
  {
    id: 'PO-2023-019',
    nomorPO: 'PO/AMS/2023/08/019',
    pemasokId: 'SPL-03',
    namaPemasok: 'PT Kimia Farma Trading & Distribution',
    tanggalPO: '2023-08-01',
    estimasiTiba: '2023-08-10',
    totalNilai: 97750000,
    status: 'Tiba di Gudang',
    catatanPJT: 'Delapan puluh lima box benang bedah bets LOT-2023-B884. Blister sterilitas dan nomor bets wajib cocok dengan COA sebelum masuk lorong D.'
  },
  {
    id: 'PO-2024-017',
    nomorPO: 'PO/AMS/2024/02/017',
    pemasokId: 'SPL-01',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    tanggalPO: '2024-02-01',
    estimasiTiba: '2024-02-26',
    totalNilai: 402000000,
    status: 'Tiba di Gudang',
    catatanPJT: 'Dua belas unit syringe pump bets LOT-2024-SP08. Dua unit ditolak saat penerimaan (kardus basah) dan sepuluh unit masuk karantina QC Hold.'
  },
  {
    id: 'PO-2024-024',
    nomorPO: 'PO/AMS/2024/02/024',
    pemasokId: 'SPL-01',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    tanggalPO: '2024-02-10',
    estimasiTiba: '2024-03-01',
    totalNilai: 11120000000,
    status: 'Tiba di Gudang',
    catatanPJT: 'Delapan unit mesin USG portabel bets LOT-2024-USG02. Uji fungsi transduser dan kalibrasi probe wajib sebelum unit masuk rak unit berat B04-01.'
  },
  {
    id: 'PO-2024-029',
    nomorPO: 'PO/AMS/2024/03/029',
    pemasokId: 'SPL-01',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    tanggalPO: '2024-03-20',
    estimasiTiba: '2024-04-12',
    totalNilai: 1632000000,
    status: 'Tiba di Gudang',
    catatanPJT: 'Empat puluh delapan unit bets LOT-2024-SP12 lengkap dengan uji fungsi parameter klinis 100% dan penempelan tag RFID per unit.'
  },
  {
    id: 'PO-2024-035',
    nomorPO: 'PO/AMS/2024/04/035',
    pemasokId: 'SPL-02',
    namaPemasok: 'SD Biosensor Inc.',
    tanggalPO: '2024-04-25',
    estimasiTiba: '2024-05-21',
    totalNilai: 552000000,
    status: 'Tiba di Gudang',
    catatanPJT: 'Tiga ratus dua puluh kit reagen dengue bets LOT-2024-DNG12. Datalogger kargo harus berada di rentang 2°C - 8°C sepanjang perjalanan.'
  },
  {
    id: 'PO-2024-041',
    nomorPO: 'PO/AMS/2024/05/041',
    pemasokId: 'SPL-01',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    tanggalPO: '2024-05-02',
    estimasiTiba: '2024-05-20',
    totalNilai: 480000000,
    status: 'Tiba di Gudang',
    catatanPJT: 'Verifikasi kesesuaian dokumen PIB, COA (Certificate of Analysis), dan nomor izin edar Kemenkes RI.'
  },
  {
    id: 'PO-2024-042',
    nomorPO: 'PO/AMS/2024/05/042',
    pemasokId: 'SPL-02',
    namaPemasok: 'SD Biosensor Inc.',
    tanggalPO: '2024-05-10',
    estimasiTiba: '2024-06-05',
    totalNilai: 265000000,
    status: 'Tiba di Gudang',
    catatanPJT: 'Wajib pengiriman berpendingin dengan datalogger terkalibrasi internasional.'
  },
  {
    id: 'PO-2024-044',
    nomorPO: 'PO/AMS/2024/04/044',
    pemasokId: 'SPL-01',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    tanggalPO: '2024-04-20',
    estimasiTiba: '2024-05-08',
    totalNilai: 2340000000,
    status: 'Tiba di Gudang',
    catatanPJT: 'Tiga unit mesin X-ray portabel bets LOT-2024-XR03. Penyimpanan wajib di lorong B03 terkunci dan sertifikat BAPETEN diperiksa sebelum rilis.'
  },
  {
    id: 'PO-2024-045',
    nomorPO: 'PO/AMS/2024/03/045',
    pemasokId: 'SPL-01',
    namaPemasok: 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    tanggalPO: '2024-03-28',
    estimasiTiba: '2024-04-12',
    totalNilai: 29600000,
    status: 'Tiba di Gudang',
    catatanPJT: 'Enam belas set slang & konektor sekali pakai bets LOT-2024-ACC05 untuk rak suku cadang B02-02; dihitung dengan FEFO seperti bahan habis pakai.'
  }
];

export const INITIAL_PENJUALAN: PenjualanAlkes[] = [
  {
    id: 'SO-2024-118',
    nomorPesanan: 'SP-EKAT-2024-118',
    fasyankes: 'RSUD Pasar Minggu Jakarta Selatan',
    jalurPenjualan: 'e-Katalog LKPP',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nomorBets: 'LOT-2024-PM44',
    jumlah: 2,
    satuan: 'Unit',
    totalHarga: 120000000,
    statusVerifikasiEtikaIklan: 'Memenuhi Etika Promosi',
    statusKirim: 'Diterima Fasyankes',
    tanggalPesanan: '2024-05-18'
  },
  {
    id: 'SO-2024-119',
    nomorPesanan: 'SP-RS-2024-119',
    fasyankes: 'RSUP Fatmawati Jakarta',
    jalurPenjualan: 'Tender RS Pemerintah',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorBets: 'LOT-2024-SP12',
    jumlah: 5,
    satuan: 'Unit',
    totalHarga: 175000000,
    statusVerifikasiEtikaIklan: 'Memenuhi Etika Promosi',
    statusKirim: 'Menunggu Alokasi FEFO',
    tanggalPesanan: '2024-05-22'
  },
  {
    id: 'SO-2024-120',
    nomorPesanan: 'SP-KLINIK-2024-120',
    fasyankes: 'Klinik Utama Sehat Paripurna Bandung',
    jalurPenjualan: 'Pembelian Langsung RS Swasta',
    namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    nomorBets: 'LOT-2024-DNG12',
    jumlah: 20,
    satuan: 'Kit (25 Test)',
    totalHarga: 38000000,
    statusVerifikasiEtikaIklan: 'Memenuhi Etika Promosi',
    statusKirim: 'Terkirim',
    tanggalPesanan: '2024-05-21'
  }
];

export const INITIAL_LAPORAN_KTD: LaporanKTD[] = [
  {
    id: 'KTD-2024-01',
    nomorLaporanKTD: 'KTD/EWAT-ALKES/2024/001',
    fasyankes: 'RSUD Tarakan Jakarta Pusat',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorIzinEdar: 'KEMENKES RI AKD 20501910234',
    nomorBets: 'LOT-2024-SP08',
    nomorSeri: 'SN-SP-22839',
    tanggalKejadian: '2024-05-12',
    dampakPasien: 'Malfungsi Tanpa Cedera',
    kronologi: 'Saat pemberian obat inotropik, sensor alarm oklusi terpicu palsu sehingga penginfusan sempat terhenti 2 menit. Perawat segera memindahkan ke syringe pump cadangan tanpa dampak klinis pada hemodinamik pasien.',
    statusLaporKemenkes: 'Terkirim ke e-Watch Alkes',
    tindakanSegera: 'Unit diamankan di karantina RS, unit pengganti baru dipasang pada hari yang sama. Tim teknisi dan QA melakukan investigasi sensor kalibrasi.',
    statusFSCA: 'Peringatan Keselamatan'
  }
];

export const INITIAL_RECALL: PenarikanProduk[] = [
  {
    id: 'RCL-2024-01',
    nomorRecall: 'REC/CDAKB/2024/001',
    namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    nomorBetsTerdampak: 'LOT-2023-B991',
    alasanRecall: 'Temuan kemasan luar basah pada batch kirim ekspedisi regional barat dengan potensi kompromi kelembaban jangka panjang.',
    klasifikasiRecall: 'Kelas II (Risiko Medis Sementara)',
    jumlahBeredar: 50,
    jumlahTelahDitarik: 42,
    fasyankesTerdampak: [
      'RSUP Nasional Dr. Cipto Mangunkusumo Jakarta (15 Box - Ditarik)',
      'RSUD Kota Tangerang (15 Box - Ditarik)',
      'RS Hasan Sadikin Bandung (12 Box - Ditarik)',
      'RSUD Dr. Soetomo Surabaya (8 Box - Proses Pengambilan)'
    ],
    tanggalMulaiRecall: '2024-05-15',
    targetSelesai: '2024-05-30',
    status: 'Penarikan Lapangan'
  }
];

export const INITIAL_PELATIHAN: PelatihanPersonil[] = [
  {
    id: 'TRN-01',
    judulPelatihan: 'Penerapan Praktis CDAKB Permenkes RI No. 4/2014 & GDPMD',
    standarRegulasi: 'CDAKB Permenkes 4/2014',
    tanggalPelaksanaan: '2024-02-18',
    instruktur: 'apt. Dewi Kartika, S.Si (PJT Bersertifikat Kemenkes)',
    peserta: ['Ahmad Fauzi (Gudang)', 'Hendra Setiawan (QC)', 'Siti Rahma (Logistik)', 'Budi Utomo (QA)'],
    jumlahPeserta: 12,
    statusEvaluasi: 'Tuntas & Bersertifikat',
    skorKelulusanRataRata: 92.5
  },
  {
    id: 'TRN-02',
    judulPelatihan: 'Manajemen Mutu ISO 13485:2016 & Pengendalian CAPA',
    standarRegulasi: 'ISO 13485:2016',
    tanggalPelaksanaan: '2024-04-10',
    instruktur: 'Ir. Hendro Wijaya, M.M (Lead Auditor ISO)',
    peserta: ['Budi Utomo, S.T', 'Rian Prasetyo, S.Farm', 'Ir. Agus Santoso'],
    jumlahPeserta: 8,
    statusEvaluasi: 'Tuntas & Bersertifikat',
    skorKelulusanRataRata: 89.0
  },
  {
    id: 'TRN-03',
    judulPelatihan: 'Prosedur Rantai Dingin (Cold Chain) & Penanganan Reagen IVD',
    standarRegulasi: 'Manajemen Suhu Dingin',
    tanggalPelaksanaan: '2024-06-15',
    instruktur: 'apt. Dewi Kartika, S.Si',
    peserta: ['Seluruh Staf Gudang & Ekspedisi'],
    jumlahPeserta: 15,
    statusEvaluasi: 'Jadwal Mendatang',
    skorKelulusanRataRata: 0
  }
];

export const INITIAL_SERTIFIKASI_PEGAWAI: SertifikasiPegawai[] = [
  {
    id: 'EMP-01',
    namaKaryawan: 'apt. Dewi Kartika, S.Si',
    jabatan: 'Penanggung Jawab Teknis (PJT Alkes)',
    divisi: 'Regulatory Affairs',
    nomorSIP_STR: 'STRA: 19880415/STRA-IAI/2014/2109',
    sertifikasiCDAKB: true,
    sertifikasiISO13485: true,
    tanggalMasaBerlakuSertifikat: '2028-04-15'
  },
  {
    id: 'EMP-02',
    namaKaryawan: 'Dian Nugraha, A.Md.TEM',
    jabatan: 'Teknisi Elektromedis Senior',
    divisi: 'After-Sales Service',
    nomorSIP_STR: 'STR-TEM: 140261118-294021',
    sertifikasiCDAKB: true,
    sertifikasiISO13485: true,
    tanggalMasaBerlakuSertifikat: '2027-08-20'
  },
  {
    id: 'EMP-03',
    namaKaryawan: 'Hendra Setiawan',
    jabatan: 'Lead QC Inspector',
    divisi: 'Quality Control',
    sertifikasiCDAKB: true,
    sertifikasiISO13485: true,
    tanggalMasaBerlakuSertifikat: '2026-12-10'
  },
  {
    id: 'EMP-04',
    namaKaryawan: 'Ahmad Fauzi',
    jabatan: 'Kepala Gudang & Rantai Pasok',
    divisi: 'Gudang & Logistik',
    sertifikasiCDAKB: true,
    sertifikasiISO13485: false,
    tanggalMasaBerlakuSertifikat: '2026-03-15'
  }
];

export const INITIAL_TRANSAKSI: TransaksiKeuangan[] = [
  {
    id: 'INV-2024-098',
    nomorFaktur: 'INV/AMS/2024/05/098',
    kategori: 'Pendapatan Alkes',
    fasyankesAtauPemasok: 'RSUD Pasar Minggu Jakarta',
    tanggal: '2024-05-18',
    jumlah: 120000000,
    statusPembayaran: 'Lunas',
    ppnStatus: 'PPN 11% Terbit Faktur Pajak'
  },
  {
    id: 'INV-2024-099',
    nomorFaktur: 'INV/AMS/2024/05/099',
    kategori: 'Biaya Uji Kalibrasi',
    fasyankesAtauPemasok: 'BPFK Jakarta (Balai Pengamanan Fasilitas Kesehatan)',
    tanggal: '2024-05-20',
    jumlah: 14500000,
    statusPembayaran: 'Lunas',
    ppnStatus: 'Bebas PPN'
  },
  {
    id: 'INV-2024-100',
    nomorFaktur: 'INV/AMS/2024/05/100',
    kategori: 'Biaya Audit ISO/CDAKB',
    fasyankesAtauPemasok: 'Lembaga Sertifikasi Akreditasi KAN',
    tanggal: '2024-05-15',
    jumlah: 35000000,
    statusPembayaran: 'Lunas',
    ppnStatus: 'PPN 11% Terbit Faktur Pajak'
  }
];

export const INITIAL_AUDIT_TRAIL: LogAuditTrail[] = [
  {
    id: 'LOG-001',
    waktu: '2024-05-22 14:32:10 WIB',
    pengguna: 'apt. Dewi Kartika, S.Si',
    peran: 'PJT Alkes',
    modul: 'Regulatory Affairs',
    aktivitas: 'Verifikasi & persetujuan rilis nomor izin edar KEMENKES RI AKL 20501819203',
    nomorReferensi: 'NIE-001',
    statusIntegritas: 'Tervalidasi Digital'
  },
  {
    id: 'LOG-002',
    waktu: '2024-05-22 15:10:04 WIB',
    pengguna: 'Hendra Setiawan',
    peran: 'QC Inspector',
    modul: 'Quality Control',
    aktivitas: 'Rilis hasil inspeksi Lolos (Released) untuk bets LOT-2024-DNG12',
    nomorReferensi: 'QC/IN/2024/05/090',
    statusIntegritas: 'Tervalidasi Digital'
  },
  {
    id: 'LOG-003',
    waktu: '2024-05-22 16:45:22 WIB',
    pengguna: 'Budi Utomo, S.T',
    peran: 'QA Manager',
    modul: 'Post-Market Surveillance',
    aktivitas: 'Sinkronisasi laporan Kejadian Tidak Diinginkan (KTD) ke portal e-Watch Alkes Kemenkes',
    nomorReferensi: 'KTD-2024-01',
    statusIntegritas: 'Tervalidasi Digital'
  }
];

// ============================================================================
// HRIS (Human Resource Information System) — Modul 1 s.d. 7
// ============================================================================

export const PARAMETER_PAYROLL_2026 = {
  pembagiUpahPerJam: 173,
  faktorLemburJamPertama: 1.5,
  faktorLemburJamBerikutnya: 2,
  toleransiKeterlambatanMenit: 10,
  potonganPerJamTerlambat: 25000,
  ptkpTK0: 54000000,
  biayaJabatanPersen: 5,
  biayaJabatanMaksTahunan: 6000000,
  bpjsKesehatanKaryawanPersen: 1,
  bpjsKesehatanPerusahaanPersen: 4,
  bpjsJhtKaryawanPersen: 2,
  bpjsJhtPerusahaanPersen: 3.7,
  bpjsJpKaryawanPersen: 1,
  bpjsJpPerusahaanPersen: 2,
  batasAtasUpahJp: 10042300,
  tarifPph21Berlapis: [
    { sampaiDengan: 60000000, tarifPersen: 5 },
    { sampaiDengan: 250000000, tarifPersen: 15 },
    { sampaiDengan: 500000000, tarifPersen: 25 },
    { sampaiDengan: 5000000000, tarifPersen: 30 },
    { sampaiDengan: Infinity, tarifPersen: 35 }
  ]
};

export const INITIAL_GRADING_JABATAN: GradeJabatan[] = [
  {
    id: 'GRD-M2',
    kodeGrade: 'M2',
    namaGrade: 'Manajemen Senior / Penanggung Jawab',
    rentangGajiMin: 16000000,
    rentangGajiMax: 28000000,
    contohJabatan: ['Penanggung Jawab Teknis (PJT) Alkes', 'QA Manager', 'Direktur Operasional'],
    uraianTugasRingkas: 'Menetapkan kebijakan mutu, menandatangani rilis produk & dokumen registrasi, bertanggung jawab penuh atas kepatuhan CDAKB dan ISO 13485 di hadapan Kemenkes.'
  },
  {
    id: 'GRD-M1',
    kodeGrade: 'M1',
    namaGrade: 'Manajemen Lini',
    rentangGajiMin: 13000000,
    rentangGajiMax: 18000000,
    contohJabatan: ['Kepala Produksi (CPAKB)', 'Kepala Gudang Distribusi', 'Kepala HSE/K3'],
    uraianTugasRingkas: 'Menerjemahkan kebijakan mutu menjadi rencana kerja harian lintas shift, mengendalikan OEE dan target produksi, serta menyetujui lembur operasional.'
  },
  {
    id: 'GRD-SP2',
    kodeGrade: 'SP2',
    namaGrade: 'Supervisor Senior / Spesialis',
    rentangGajiMin: 10000000,
    rentangGajiMax: 13500000,
    contohJabatan: ['Lead QC Inspector', 'Apoteker Pendamping', 'Senior Teknisi Elektromedis'],
    uraianTugasRingkas: 'Pemegang otorisasi teknis (rilis bets, kalibrasi, verifikasi STR), membimbing operator, dan menjadi auditor internal ISO 13485.'
  },
  {
    id: 'GRD-SP1',
    kodeGrade: 'SP1',
    namaGrade: 'Supervisor',
    rentangGajiMin: 8000000,
    rentangGajiMax: 12000000,
    contohJabatan: ['Supervisor Purchasing', 'Supervisor Logistik', 'Supervisor Sales e-Katalog'],
    uraianTugasRingkas: 'Mengawasi pelaksanaan SOP di area kerja, melakukan verifikasi dokumen (BMR, surat jalan, PO), dan mengusulkan CAPA atas penyimpangan.'
  },
  {
    id: 'GRD-ST2',
    kodeGrade: 'ST2',
    namaGrade: 'Staf Terampil',
    rentangGajiMin: 6000000,
    rentangGajiMax: 9000000,
    contohJabatan: ['Staf Registrasi Alkes', 'Sales Executive', 'Staf Logistik Rantai Dingin'],
    uraianTugasRingkas: 'Melaksanakan pekerjaan administratif dan operasional sesuai SOP terdokumentasi, wajib memiliki sertifikat pelatihan CDAKB/K3 yang masih berlaku.'
  },
  {
    id: 'GRD-ST1',
    kodeGrade: 'ST1',
    namaGrade: 'Staf Pelaksana',
    rentangGajiMin: 5200000,
    rentangGajiMax: 6500000,
    contohJabatan: ['Admin Gudang', 'Admin Keuangan', 'Resepsionis'],
    uraianTugasRingkas: 'Mendukung pencatatan dokumen mutu dan transaksi harian; wajib mengikuti pelatihan wajib tahun berjalan.'
  },
  {
    id: 'GRD-OP1',
    kodeGrade: 'OP1',
    namaGrade: 'Operator Produksi',
    rentangGajiMin: 5000000,
    rentangGajiMax: 6500000,
    contohJabatan: ['Operator Perakitan', 'Operator Cleanroom', 'Operator Pengemasan'],
    uraianTugasRingkas: 'Mengoperasikan lini perakitan sesuai Batch Manufacturing Record (BMR), menjaga higiene & APD, dan mencatat parameter proses setiap bets.'
  }
];

export const INITIAL_KARYAWAN_HRIS: KaryawanHRIS[] = [
  {
    id: 'EMP-01',
    nik: 'AMS-2019-001',
    nama: 'apt. Dewi Kartika, S.Si',
    jabatan: 'Penanggung Jawab Teknis (PJT Alkes)',
    divisi: 'Regulatory Affairs',
    lokasi: 'Kantor Pusat',
    grade: 'M2',
    statusKaryawan: 'Tetap',
    tanggalBergabung: '2019-03-01',
    tanggalLahir: '1988-04-15',
    statusRekamMedis: 'Fit to Work',
    gajiPokok: 18500000,
    sertifikasi: [
      { nama: 'STRA Apoteker', nomor: '19880415/STRA-IAI/2014/2109', masaBerlaku: '2028-04-15' },
      { nama: 'Sertifikat CDAKB Kemenkes RI', nomor: 'CDAKB/PJT/2024/0117', masaBerlaku: '2027-06-30' },
      { nama: 'Lead Auditor ISO 13485:2016 (IRCA)', nomor: 'IRCA-13485-2021-8842', masaBerlaku: '2026-11-20' }
    ]
  },
  {
    id: 'EMP-02',
    nik: 'AMS-2018-002',
    nama: 'Budi Utomo, S.T',
    jabatan: 'QA Manager',
    divisi: 'Quality Assurance',
    lokasi: 'Kantor Pusat',
    grade: 'M2',
    statusKaryawan: 'Tetap',
    tanggalBergabung: '2018-07-16',
    tanggalLahir: '1985-02-10',
    statusRekamMedis: 'Fit to Work',
    gajiPokok: 16000000,
    sertifikasi: [
      { nama: 'Internal Auditor ISO 13485:2016', nomor: 'IA-13485/2023/0451', masaBerlaku: '2027-01-15' },
      { nama: 'Pelatihan CDAKB Permenkes 4/2014', nomor: 'CDAKB/TRN/2022/0089', masaBerlaku: '2026-12-05' }
    ]
  },
  {
    id: 'EMP-03',
    nik: 'AMS-2020-003',
    nama: 'Hendra Setiawan',
    jabatan: 'Lead QC Inspector',
    divisi: 'Quality Control',
    lokasi: 'Pabrik Manufaktur',
    grade: 'SP2',
    statusKaryawan: 'Tetap',
    tanggalBergabung: '2020-01-06',
    tanggalLahir: '1992-11-30',
    statusRekamMedis: 'Fit to Work',
    gajiPokok: 11500000,
    sertifikasi: [
      { nama: 'Sertifikat CDAKB (Pengawasan Mutu)', nomor: 'CDAKB/QC/2023/0210', masaBerlaku: '2026-12-10' },
      { nama: 'Kompetensi Uji Sterilitas & Endotoksin', nomor: 'BPFK/STR/2024/0033', masaBerlaku: '2027-09-01' }
    ]
  },
  {
    id: 'EMP-04',
    nik: 'AMS-2019-004',
    nama: 'Ahmad Fauzi',
    jabatan: 'Kepala Gudang & Rantai Pasok',
    divisi: 'Warehouse & Logistics',
    lokasi: 'Gudang Distribusi',
    grade: 'M1',
    statusKaryawan: 'Tetap',
    tanggalBergabung: '2019-09-02',
    tanggalLahir: '1990-05-22',
    statusRekamMedis: 'Fit to Work',
    gajiPokok: 13200000,
    sertifikasi: [
      { nama: 'Pelatihan CDAKB (Penyimpanan & Distribusi)', nomor: 'CDAKB/GDG/2022/0145', masaBerlaku: '2026-03-15' },
      { nama: 'Sertifikat Ahli K3 Umum Kemnaker', nomor: 'K3U/2023/118874', masaBerlaku: '2028-02-28' }
    ]
  },
  {
    id: 'EMP-05',
    nik: 'AMS-2018-005',
    nama: 'Dian Nugraha, A.Md.TEM',
    jabatan: 'Teknisi Elektromedis Senior',
    divisi: 'After-Sales Service',
    lokasi: 'Kantor Pusat',
    grade: 'SP2',
    statusKaryawan: 'Tetap',
    tanggalBergabung: '2018-02-05',
    tanggalLahir: '1994-02-14',
    statusRekamMedis: 'Fit to Work',
    gajiPokok: 10200000,
    sertifikasi: [
      { nama: 'STR Elektromedis (STRT)', nomor: 'STR-TEM: 140261118-294021', masaBerlaku: '2027-08-20' },
      { nama: 'Sertifikat Kalibrasi IEC 60601-1', nomor: 'KAL/IEC/2023/0771', masaBerlaku: '2026-10-10' }
    ]
  },
  {
    id: 'EMP-06',
    nik: 'AMS-2017-006',
    nama: 'Ir. Agus Santoso',
    jabatan: 'Kepala Produksi (CPAKB)',
    divisi: 'Manufacture',
    lokasi: 'Pabrik Manufaktur',
    grade: 'M1',
    statusKaryawan: 'Tetap',
    tanggalBergabung: '2017-05-02',
    tanggalLahir: '1983-08-09',
    statusRekamMedis: 'Fit to Work',
    gajiPokok: 15000000,
    sertifikasi: [
      { nama: 'Pelatihan CPAKB Permenkes 20/2017', nomor: 'CPAKB/2023/0064', masaBerlaku: '2027-03-18' },
      { nama: 'Sertifikat Ahli K3 Umum Kemnaker', nomor: 'K3U/2021/094211', masaBerlaku: '2028-01-20' },
      { nama: 'Pelatihan Manajemen Cleanroom Kelas C', nomor: 'CLR/2024/0012', masaBerlaku: '2026-12-30' }
    ]
  },
  {
    id: 'EMP-07',
    nik: 'AMS-2021-007',
    nama: 'Dewi Anggraini, S.E',
    jabatan: 'Supervisor Purchasing & Procurement',
    divisi: 'Purchasing & Procurement',
    lokasi: 'Kantor Pusat',
    grade: 'SP1',
    statusKaryawan: 'Tetap',
    tanggalBergabung: '2021-01-11',
    tanggalLahir: '1993-12-03',
    statusRekamMedis: 'Fit to Work',
    gajiPokok: 9500000,
    sertifikasi: [
      { nama: 'Sertifikat Pengadaan Barang/Jasa Level 1 (LKPP)', nomor: 'LKPP/PBJ/2022/30911', masaBerlaku: '2027-11-30' }
    ]
  },
  {
    id: 'EMP-08',
    nik: 'AMS-2023-008',
    nama: 'Farhan Maulana',
    jabatan: 'Sales Executive (e-Katalog LKPP)',
    divisi: 'Sales & Marketing',
    lokasi: 'Kantor Pusat',
    grade: 'ST2',
    statusKaryawan: 'Kontrak (PKWT)',
    tanggalBergabung: '2023-03-06',
    tanggalLahir: '1996-07-19',
    statusRekamMedis: 'Fit to Work',
    gajiPokok: 7500000,
    sertifikasi: [
      { nama: 'Pelatihan Produk Elektromedik Dasar', nomor: 'TRN/PROD/2023/0442', masaBerlaku: '2026-12-18' }
    ]
  },
  {
    id: 'EMP-09',
    nik: 'AMS-2022-009',
    nama: 'Siti Rahma',
    jabatan: 'Staf Logistik & Rantai Dingin',
    divisi: 'Warehouse & Logistics',
    lokasi: 'Gudang Distribusi',
    grade: 'ST2',
    statusKaryawan: 'Kontrak (PKWT)',
    tanggalBergabung: '2022-08-15',
    tanggalLahir: '1998-03-25',
    statusRekamMedis: 'Fit with Restriction',
    gajiPokok: 6200000,
    sertifikasi: [
      { nama: 'Pelatihan Cold Chain Reagen IVD (2-8°C)', nomor: 'CC/IVD/2024/0077', masaBerlaku: '2027-04-30' },
      { nama: 'Sertifikat K3 & Higiene Medis', nomor: 'K3/HIG/2023/1208', masaBerlaku: '2026-11-25' }
    ]
  },
  {
    id: 'EMP-10',
    nik: 'AMS-2020-010',
    nama: 'Rian Prasetyo, S.Farm',
    jabatan: 'Apoteker Pendamping / Staf QA',
    divisi: 'Quality Assurance',
    lokasi: 'Kantor Pusat',
    grade: 'SP1',
    statusKaryawan: 'Tetap',
    tanggalBergabung: '2020-11-02',
    tanggalLahir: '1991-06-14',
    statusRekamMedis: 'Fit to Work',
    gajiPokok: 11000000,
    sertifikasi: [
      { nama: 'STRA Apoteker', nomor: '19910614/STRA-IAI/2016/4471', masaBerlaku: '2027-05-30' },
      { nama: 'Internal Auditor ISO 13485:2016', nomor: 'IA-13485/2024/0912', masaBerlaku: '2028-03-31' }
    ]
  },
  {
    id: 'EMP-11',
    nik: 'AMS-2024-011',
    nama: 'Joko Susilo',
    jabatan: 'Operator Perakitan Syringe Pump',
    divisi: 'Manufacture',
    lokasi: 'Pabrik Manufaktur',
    grade: 'OP1',
    statusKaryawan: 'Kontrak (PKWT)',
    tanggalBergabung: '2024-02-19',
    tanggalLahir: '1999-10-08',
    statusRekamMedis: 'Fit to Work',
    gajiPokok: 5600000,
    sertifikasi: [
      { nama: 'Pelatihan K3 & Penggunaan APD Lini Perakitan', nomor: 'K3/APD/2024/0301', masaBerlaku: '2027-02-14' },
      { nama: 'Kompetensi Pengisian BMR (Batch Manufacturing Record)', nomor: 'BMR/2024/0118', masaBerlaku: '2026-12-01' }
    ]
  },
  {
    id: 'EMP-12',
    nik: 'AMS-2024-012',
    nama: 'Mega Puspita',
    jabatan: 'Operator Cleanroom & Pengemasan',
    divisi: 'Manufacture',
    lokasi: 'Pabrik Manufaktur',
    grade: 'OP1',
    statusKaryawan: 'Outsourcing',
    tanggalBergabung: '2024-06-03',
    tanggalLahir: '2000-01-27',
    statusRekamMedis: 'Perlu Evaluasi',
    gajiPokok: 5200000,
    sertifikasi: [
      { nama: 'Pelatihan Sanitasi & Gowning Cleanroom Kelas C', nomor: 'CLR/2024/0233', masaBerlaku: '2026-12-20' }
    ]
  }
];

// Riwayat mutasi memakai pola tabel temporal (system-versioned):
// baris aktif ditandai tanggalBerakhir = null.
export const INITIAL_RIWAYAT_MUTASI: RiwayatMutasi[] = [
  {
    id: 'MUT-001',
    karyawanId: 'EMP-01',
    tanggalEfektif: '2019-03-01',
    tanggalBerakhir: '2022-06-30',
    jabatan: 'Staf Registrasi Alkes',
    divisi: 'Regulatory Affairs',
    lokasi: 'Kantor Pusat',
    grade: 'ST2',
    alasanMutasi: 'Perekrutan awal (karyawan tetap)'
  },
  {
    id: 'MUT-002',
    karyawanId: 'EMP-01',
    tanggalEfektif: '2022-07-01',
    tanggalBerakhir: null,
    jabatan: 'Penanggung Jawab Teknis (PJT Alkes)',
    divisi: 'Regulatory Affairs',
    lokasi: 'Kantor Pusat',
    grade: 'M2',
    alasanMutasi: 'Promosi setelah lulus sertifikasi CDAKB Kemenkes & memiliki STRA aktif'
  },
  {
    id: 'MUT-003',
    karyawanId: 'EMP-03',
    tanggalEfektif: '2020-01-06',
    tanggalBerakhir: '2023-03-31',
    jabatan: 'QC Inspector',
    divisi: 'Quality Control',
    lokasi: 'Pabrik Manufaktur',
    grade: 'ST2',
    alasanMutasi: 'Perekrutan awal (karyawan tetap)'
  },
  {
    id: 'MUT-004',
    karyawanId: 'EMP-03',
    tanggalEfektif: '2023-04-01',
    tanggalBerakhir: null,
    jabatan: 'Lead QC Inspector',
    divisi: 'Quality Control',
    lokasi: 'Pabrik Manufaktur',
    grade: 'SP2',
    alasanMutasi: 'Promosi berdasarkan hasil CPM 2022 (skor 4,3/5) & sertifikasi uji sterilitas'
  },
  {
    id: 'MUT-005',
    karyawanId: 'EMP-06',
    tanggalEfektif: '2017-05-02',
    tanggalBerakhir: '2021-12-31',
    jabatan: 'Supervisor Produksi',
    divisi: 'Manufacture',
    lokasi: 'Pabrik Manufaktur',
    grade: 'SP2',
    alasanMutasi: 'Perekrutan awal (karyawan tetap)'
  },
  {
    id: 'MUT-006',
    karyawanId: 'EMP-06',
    tanggalEfektif: '2022-01-01',
    tanggalBerakhir: null,
    jabatan: 'Kepala Produksi (CPAKB)',
    divisi: 'Manufacture',
    lokasi: 'Pabrik Manufaktur',
    grade: 'M1',
    alasanMutasi: 'Mutasi struktural pasca perolehan sertifikat CPAKB Permenkes 20/2017'
  },
  {
    id: 'MUT-007',
    karyawanId: 'EMP-09',
    tanggalEfektif: '2022-08-15',
    tanggalBerakhir: '2024-05-31',
    jabatan: 'Staf Gudang',
    divisi: 'Warehouse & Logistics',
    lokasi: 'Gudang Distribusi',
    grade: 'ST1',
    alasanMutasi: 'Perekrutan awal (PKWT 1 tahun)'
  },
  {
    id: 'MUT-008',
    karyawanId: 'EMP-09',
    tanggalEfektif: '2024-06-01',
    tanggalBerakhir: null,
    jabatan: 'Staf Logistik & Rantai Dingin',
    divisi: 'Warehouse & Logistics',
    lokasi: 'Gudang Distribusi',
    grade: 'ST2',
    alasanMutasi: 'Rotasi ke tim cold chain reagen IVD setelah lulus pelatihan suhu 2-8°C'
  },
  {
    id: 'MUT-009',
    karyawanId: 'EMP-11',
    tanggalEfektif: '2024-02-19',
    tanggalBerakhir: '2025-08-31',
    jabatan: 'Operator Pengemasan',
    divisi: 'Manufacture',
    lokasi: 'Pabrik Manufaktur',
    grade: 'OP1',
    alasanMutasi: 'Perekrutan awal (PKWT 1 tahun)'
  },
  {
    id: 'MUT-010',
    karyawanId: 'EMP-11',
    tanggalEfektif: '2025-09-01',
    tanggalBerakhir: null,
    jabatan: 'Operator Perakitan Syringe Pump',
    divisi: 'Manufacture',
    lokasi: 'Pabrik Manufaktur',
    grade: 'OP1',
    alasanMutasi: 'Rotasi lintas lini & perpanjangan PKWT berdasarkan evaluasi skill matrix level Mahir'
  }
];

export const INITIAL_JADWAL_SHIFT: JadwalShift[] = [
  {
    id: 'SHF-01',
    namaShift: 'Shift 1 (07.00-15.00)',
    area: 'Lini Perakitan Syringe Pump (AMS-SP500)',
    tanggalMulai: '2026-11-01',
    tanggalBerakhir: '2026-11-30',
    polaRotasi: 'Rotasi 4-2 (4 hari kerja, 2 libur) — bergilir ke Shift 2 setiap 2 minggu',
    tim: ['Ir. Agus Santoso', 'Joko Susilo', 'Hendra Setiawan']
  },
  {
    id: 'SHF-02',
    namaShift: 'Shift 2 (15.00-23.00)',
    area: 'Lini Perakitan & Pengemasan Primer',
    tanggalMulai: '2026-11-01',
    tanggalBerakhir: '2026-11-30',
    polaRotasi: 'Rotasi 4-2 dengan premi shift sore 7,5% dari upah pokok',
    tim: ['Mega Puspita', 'Joko Susilo (cadangan)']
  },
  {
    id: 'SHF-03',
    namaShift: 'Shift 3 (23.00-07.00)',
    area: 'Gudang Cold Chain Reagen IVD (2-8°C)',
    tanggalMulai: '2026-11-01',
    tanggalBerakhir: '2026-12-31',
    polaRotasi: 'Rotasi 3-1 (3 malam kerja, 1 libur) — wajib MCU paparan suhu dingin tiap 6 bulan',
    tim: ['Siti Rahma', 'Ahmad Fauzi (on-call)']
  }
];

export const INITIAL_ABSENSI: LogAbsensi[] = [
  {
    id: 'ABS-001',
    karyawanId: 'EMP-06',
    nama: 'Ir. Agus Santoso',
    tanggal: '2026-11-02',
    jamMasuk: '06:52',
    jamKeluar: '15:41',
    sumber: 'Fingerprint (Pabrik)',
    status: 'Hadir',
    lokasi: 'Gate Produksi Pabrik Cikarang — Device FP-02, ID perangkat terverifikasi'
  },
  {
    id: 'ABS-002',
    karyawanId: 'EMP-11',
    nama: 'Joko Susilo',
    tanggal: '2026-11-02',
    jamMasuk: '06:58',
    jamKeluar: '15:05',
    sumber: 'Face Recognition (Pabrik)',
    status: 'Hadir',
    lokasi: 'Turnstile Cleanroom — kecocokan wajah 97,4%, suhu tubuh 36,4°C'
  },
  {
    id: 'ABS-003',
    karyawanId: 'EMP-12',
    nama: 'Mega Puspita',
    tanggal: '2026-11-02',
    jamMasuk: '07:24',
    jamKeluar: '15:10',
    sumber: 'Face Recognition (Pabrik)',
    status: 'Terlambat',
    lokasi: 'Turnstile Cleanroom — melewati toleransi 10 menit (terlambat 14 menit)'
  },
  {
    id: 'ABS-004',
    karyawanId: 'EMP-08',
    nama: 'Farhan Maulana',
    tanggal: '2026-11-02',
    jamMasuk: '08:04',
    jamKeluar: '17:32',
    sumber: 'Geofencing GPS (Mobile)',
    status: 'Hadir',
    lokasi: 'GPS -6,2297 / 107,1571 — radius 42 m dari titik Kantor Pusat (kunjungan RSUD Bekasi)'
  },
  {
    id: 'ABS-005',
    karyawanId: 'EMP-09',
    nama: 'Siti Rahma',
    tanggal: '2026-11-02',
    jamMasuk: '22:55',
    jamKeluar: '07:02',
    sumber: 'Fingerprint (Pabrik)',
    status: 'Hadir',
    lokasi: 'Gudang Cold Chain — Device FP-05, shift malam 23.00-07.00'
  },
  {
    id: 'ABS-006',
    karyawanId: 'EMP-03',
    nama: 'Hendra Setiawan',
    tanggal: '2026-11-03',
    jamMasuk: '06:47',
    jamKeluar: '-',
    sumber: 'Fingerprint (Pabrik)',
    status: 'Hadir',
    lokasi: 'Laboratorium QC Pabrik Cikarang — Device FP-02'
  },
  {
    id: 'ABS-007',
    karyawanId: 'EMP-05',
    nama: 'Dian Nugraha, A.Md.TEM',
    tanggal: '2026-11-03',
    jamMasuk: '07:51',
    jamKeluar: '-',
    sumber: 'Geofencing GPS (Mobile)',
    status: 'Hadir',
    lokasi: 'GPS -6,1754 / 106,8271 — radius 18 m dari RSUD Tarakan (kunjungan kalibrasi)'
  },
  {
    id: 'ABS-008',
    karyawanId: 'EMP-12',
    nama: 'Mega Puspita',
    tanggal: '2026-11-03',
    jamMasuk: '-',
    jamKeluar: '-',
    sumber: 'Manual HR',
    status: 'Sakit',
    lokasi: 'Surat keterangan klinik dilampirkan — iritasi kulit, menunggu jadwal MCU ulang'
  },
  {
    id: 'ABS-009',
    karyawanId: 'EMP-07',
    nama: 'Dewi Anggraini, S.E',
    tanggal: '2026-11-03',
    jamMasuk: '08:12',
    jamKeluar: '-',
    sumber: 'Manual HR',
    status: 'Terlambat',
    lokasi: 'Koreksi manual HR — clock-in GPS ditolak sistem (radius 210 m di luar pagar geofence Kantor Pusat 150 m), kehadiran diverifikasi atasan langsung'
  },
  {
    id: 'ABS-010',
    karyawanId: 'EMP-01',
    nama: 'apt. Dewi Kartika, S.Si',
    tanggal: '2026-11-03',
    jamMasuk: '-',
    jamKeluar: '-',
    sumber: 'Manual HR',
    status: 'Izin',
    lokasi: 'Izin resmi — menghadiri sidang panel registrasi alkes di Ditjen Farmalkes'
  }
];

export const INITIAL_LEMBUR: PerhitunganLembur[] = [
  {
    id: 'LMB-2026-041',
    karyawanId: 'EMP-06',
    nama: 'Ir. Agus Santoso',
    tanggal: '2026-10-28',
    jamLembur: 1,
    upahPerJam: 86705,
    totalLembur: 130058,
    status: 'Disetujui'
  },
  {
    id: 'LMB-2026-042',
    karyawanId: 'EMP-11',
    nama: 'Joko Susilo',
    tanggal: '2026-10-29',
    jamLembur: 3,
    upahPerJam: 32370,
    totalLembur: 178035,
    status: 'Disetujui'
  },
  {
    id: 'LMB-2026-043',
    karyawanId: 'EMP-03',
    nama: 'Hendra Setiawan',
    tanggal: '2026-10-30',
    jamLembur: 2,
    upahPerJam: 66474,
    totalLembur: 232659,
    status: 'Disetujui'
  },
  {
    id: 'LMB-2026-044',
    karyawanId: 'EMP-09',
    nama: 'Siti Rahma',
    tanggal: '2026-10-31',
    jamLembur: 4,
    upahPerJam: 35838,
    totalLembur: 268785,
    status: 'Menunggu Persetujuan'
  },
  {
    id: 'LMB-2026-045',
    karyawanId: 'EMP-12',
    nama: 'Mega Puspita',
    tanggal: '2026-10-31',
    jamLembur: 2,
    upahPerJam: 30058,
    totalLembur: 105203,
    status: 'Menunggu Persetujuan'
  },
  {
    id: 'LMB-2026-046',
    karyawanId: 'EMP-08',
    nama: 'Farhan Maulana',
    tanggal: '2026-10-31',
    jamLembur: 2,
    upahPerJam: 43353,
    totalLembur: 151736,
    status: 'Ditolak'
  }
];

export const INITIAL_SLIP_GAJI: SlipGaji[] = [
  {
    id: 'SLIP-2026-10-001',
    periode: '2026-10',
    karyawanId: 'EMP-01',
    nama: 'apt. Dewi Kartika, S.Si',
    gajiPokok: 18500000,
    tunjanganKehadiran: 1850000,
    insentifSales: 0,
    insentifProduksi: 0,
    potonganAbsensi: 0,
    lembur: 0,
    bpjsKesehatanKaryawan: 185000,
    bpjsJhtKaryawan: 370000,
    bpjsJpKaryawan: 100400,
    pph21: 1731938,
    tunjanganPajak: 0,
    metodePph21: 'Gross',
    takeHomePay: 17962662,
    status: 'Dibayar'
  },
  {
    id: 'SLIP-2026-10-006',
    periode: '2026-10',
    karyawanId: 'EMP-06',
    nama: 'Ir. Agus Santoso',
    gajiPokok: 15000000,
    tunjanganKehadiran: 1500000,
    insentifSales: 0,
    insentifProduksi: 2400000,
    potonganAbsensi: 0,
    lembur: 130058,
    bpjsKesehatanKaryawan: 150000,
    bpjsJhtKaryawan: 300000,
    bpjsJpKaryawan: 100400,
    pph21: 1816975,
    tunjanganPajak: 1816975,
    metodePph21: 'Gross Up',
    takeHomePay: 18479658,
    status: 'Dibayar'
  },
  {
    id: 'SLIP-2026-10-003',
    periode: '2026-10',
    karyawanId: 'EMP-03',
    nama: 'Hendra Setiawan',
    gajiPokok: 11500000,
    tunjanganKehadiran: 1150000,
    insentifSales: 0,
    insentifProduksi: 0,
    potonganAbsensi: 0,
    lembur: 232659,
    bpjsKesehatanKaryawan: 115000,
    bpjsJhtKaryawan: 230000,
    bpjsJpKaryawan: 100400,
    pph21: 632838,
    tunjanganPajak: 0,
    metodePph21: 'Gross',
    takeHomePay: 11804421,
    status: 'Diproses'
  },
  {
    id: 'SLIP-2026-10-008',
    periode: '2026-10',
    karyawanId: 'EMP-08',
    nama: 'Farhan Maulana',
    gajiPokok: 7500000,
    tunjanganKehadiran: 750000,
    insentifSales: 3200000,
    insentifProduksi: 0,
    potonganAbsensi: 0,
    lembur: 0,
    bpjsKesehatanKaryawan: 75000,
    bpjsJhtKaryawan: 150000,
    bpjsJpKaryawan: 75000,
    pph21: 0,
    tunjanganPajak: 0,
    metodePph21: 'Net',
    takeHomePay: 11150000,
    status: 'Diproses'
  },
  {
    id: 'SLIP-2026-10-011',
    periode: '2026-10',
    karyawanId: 'EMP-11',
    nama: 'Joko Susilo',
    gajiPokok: 5600000,
    tunjanganKehadiran: 300000,
    insentifSales: 0,
    insentifProduksi: 1150000,
    potonganAbsensi: 95000,
    lembur: 178035,
    bpjsKesehatanKaryawan: 56000,
    bpjsJhtKaryawan: 112000,
    bpjsJpKaryawan: 56000,
    pph21: 105417,
    tunjanganPajak: 0,
    metodePph21: 'Gross',
    takeHomePay: 6803618,
    status: 'Draft'
  },
  {
    id: 'SLIP-2026-10-012',
    periode: '2026-10',
    karyawanId: 'EMP-12',
    nama: 'Mega Puspita',
    gajiPokok: 5200000,
    tunjanganKehadiran: 250000,
    insentifSales: 0,
    insentifProduksi: 820000,
    potonganAbsensi: 0,
    lembur: 105203,
    bpjsKesehatanKaryawan: 52000,
    bpjsJhtKaryawan: 104000,
    bpjsJpKaryawan: 52000,
    pph21: 70021,
    tunjanganPajak: 0,
    metodePph21: 'Gross',
    takeHomePay: 6097182,
    status: 'Draft'
  },
  {
    id: 'SLIP-2026-10-009',
    periode: '2026-10',
    karyawanId: 'EMP-09',
    nama: 'Siti Rahma',
    gajiPokok: 6200000,
    tunjanganKehadiran: 400000,
    insentifSales: 0,
    insentifProduksi: 0,
    potonganAbsensi: 0,
    lembur: 268785,
    bpjsKesehatanKaryawan: 62000,
    bpjsJhtKaryawan: 124000,
    bpjsJpKaryawan: 62000,
    pph21: 91967,
    tunjanganPajak: 0,
    metodePph21: 'Gross',
    takeHomePay: 6528818,
    status: 'Draft'
  },
  {
    id: 'SLIP-2026-10-002',
    periode: '2026-10',
    karyawanId: 'EMP-02',
    nama: 'Budi Utomo, S.T',
    gajiPokok: 16000000,
    tunjanganKehadiran: 1600000,
    insentifSales: 0,
    insentifProduksi: 0,
    potonganAbsensi: 0,
    lembur: 0,
    bpjsKesehatanKaryawan: 160000,
    bpjsJhtKaryawan: 320000,
    bpjsJpKaryawan: 100400,
    pph21: 1326938,
    tunjanganPajak: 0,
    metodePph21: 'Gross',
    takeHomePay: 15692662,
    status: 'Dibayar'
  }
];

export const INITIAL_KANDIDAT_ATS: KandidatATS[] = [
  {
    id: 'ATS-2026-031',
    nama: 'Ns. Larasati Putri, S.Kep',
    posisiDilamar: 'Staf QA / Dokumentasi Mutu',
    tahap: 'Wawancara User',
    skorKataKunci: 88,
    kataKunciTerdeteksi: ['ISO 13485', 'CDAKB', 'CAPA', 'Dokumen Mutu', 'Audit Internal'],
    verifikasiLisensi: [
      { jenis: 'STR Perawat (STRN)', nomor: 'STRN/2021/338920', status: 'Menunggu' },
      { jenis: 'Sertifikat Pelatihan ISO 13485', nomor: 'IA-13485/2025/1120', status: 'Terverifikasi' }
    ],
    checklistOnboarding: [
      { item: 'Penandatanganan Pakta Integritas & Kerahasiaan Data Pasien', selesai: false },
      { item: 'Pelatihan CDAKB Permenkes 4/2014 (angkatan berikutnya)', selesai: false },
      { item: 'Pemeriksaan MCU pra-kerja', selesai: true },
      { item: 'Penerbitan NIK & akses modul QA', selesai: false }
    ],
    tanggalLamar: '2026-10-12'
  },
  {
    id: 'ATS-2026-032',
    nama: 'Rangga Pratama, A.Md.TEM',
    posisiDilamar: 'Teknisi Elektromedis (After-Sales)',
    tahap: 'Background Check',
    skorKataKunci: 92,
    kataKunciTerdeteksi: ['Elektromedis', 'Kalibrasi', 'IEC 60601-1', 'CDAKB', 'Preventive Maintenance'],
    verifikasiLisensi: [
      { jenis: 'STR Elektromedis (STRT)', nomor: 'STRT/2022/140261118', status: 'Terverifikasi' },
      { jenis: 'Sertifikat Kalibrasi BPFK', nomor: 'KAL/BPFK/2024/0219', status: 'Terverifikasi' }
    ],
    checklistOnboarding: [
      { item: 'Verifikasi STR ke portal KTKI', selesai: true },
      { item: 'Penandatanganan Pakta Integritas', selesai: false },
      { item: 'Pelatihan K3 & Higiene Medis', selesai: false },
      { item: 'Penerbitan APD lapangan (safety shoes & kacamata)', selesai: false }
    ],
    tanggalLamar: '2026-10-18'
  },
  {
    id: 'ATS-2026-033',
    nama: 'Ayu Wandira',
    posisiDilamar: 'Operator Perakitan (Shift 2)',
    tahap: 'Skrining CV',
    skorKataKunci: 61,
    kataKunciTerdeteksi: ['GMP', 'K3', '5R', 'Perakitan'],
    verifikasiLisensi: [
      { jenis: 'Sertifikat K3 Dasar', nomor: 'K3/DSR/2025/8812', status: 'Menunggu' }
    ],
    checklistOnboarding: [
      { item: 'Pelatihan gowning & sanitasi cleanroom', selesai: false },
      { item: 'MCU pra-kerja (termasuk audiometri)', selesai: false },
      { item: 'Penandatanganan Pakta Integritas', selesai: false },
      { item: 'Penerbitan NIK PKWT', selesai: false }
    ],
    tanggalLamar: '2026-10-27'
  },
  {
    id: 'ATS-2026-034',
    nama: 'dr. Hendra Gunawan, Sp.Ok',
    posisiDilamar: 'Dokter Perusahaan (MCU & Hiperkes)',
    tahap: 'Offering',
    skorKataKunci: 95,
    kataKunciTerdeteksi: ['Hiperkes', 'MCU', 'Penyakit Akibat Kerja', 'OKKUPASI', 'APD'],
    verifikasiLisensi: [
      { jenis: 'STRA Dokter Spesialis Okupasi', nomor: 'STRA-DSP/2019/4471', status: 'Terverifikasi' },
      { jenis: 'Sertifikat Hiperkes Kemnaker', nomor: 'HIPERKES/2020/2210', status: 'Terverifikasi' }
    ],
    checklistOnboarding: [
      { item: 'Verifikasi STR & SIP ke KKI/Dinkes', selesai: true },
      { item: 'Penandatanganan Pakta Integritas & rekam medis karyawan', selesai: true },
      { item: 'Orientasi paparan bahan kimia & cleanroom', selesai: false },
      { item: 'Penerbitan akses modul HSE/K3', selesai: false }
    ],
    tanggalLamar: '2026-09-30'
  },
  {
    id: 'ATS-2026-035',
    nama: 'Ilham Ramadhan',
    posisiDilamar: 'Sales Executive (e-Katalog LKPP)',
    tahap: 'Ditolak',
    skorKataKunci: 34,
    kataKunciTerdeteksi: ['Sales', 'Tender'],
    verifikasiLisensi: [],
    checklistOnboarding: [],
    tanggalLamar: '2026-10-05'
  }
];

export const INITIAL_SKILL_MATRIX: SkillMatrix[] = [
  {
    id: 'SKL-001',
    karyawanId: 'EMP-11',
    nama: 'Joko Susilo',
    mesinAtauProses: 'Perakitan Syringe Pump AMS-SP500 (Lini 2)',
    level: 'Mahir',
    tanggalPenilaian: '2026-08-14',
    penilai: 'Ir. Agus Santoso'
  },
  {
    id: 'SKL-002',
    karyawanId: 'EMP-12',
    nama: 'Mega Puspita',
    mesinAtauProses: 'Sanitasi & Gowning Cleanroom Kelas C',
    level: 'Operator',
    tanggalPenilaian: '2026-09-02',
    penilai: 'Hendra Setiawan'
  },
  {
    id: 'SKL-003',
    karyawanId: 'EMP-03',
    nama: 'Hendra Setiawan',
    mesinAtauProses: 'Uji Kebocoran Kemasan & Inspeksi Visual Kelas A',
    level: 'Trainer',
    tanggalPenilaian: '2026-07-21',
    penilai: 'Budi Utomo, S.T'
  },
  {
    id: 'SKL-004',
    karyawanId: 'EMP-05',
    nama: 'Dian Nugraha, A.Md.TEM',
    mesinAtauProses: 'Kalibrasi Patient Monitor & Electrical Safety Tester',
    level: 'Trainer',
    tanggalPenilaian: '2026-06-30',
    penilai: 'apt. Dewi Kartika, S.Si'
  },
  {
    id: 'SKL-005',
    karyawanId: 'EMP-09',
    nama: 'Siti Rahma',
    mesinAtauProses: 'Penanganan Cold Chain Reagen IVD (2-8°C)',
    level: 'Mahir',
    tanggalPenilaian: '2026-08-05',
    penilai: 'Ahmad Fauzi'
  },
  {
    id: 'SKL-006',
    karyawanId: 'EMP-06',
    nama: 'Ir. Agus Santoso',
    mesinAtauProses: 'Pengisian Batch Manufacturing Record (BMR) & Validasi Proses',
    level: 'Trainer',
    tanggalPenilaian: '2026-05-19',
    penilai: 'Budi Utomo, S.T'
  },
  {
    id: 'SKL-007',
    karyawanId: 'EMP-12',
    nama: 'Mega Puspita',
    mesinAtauProses: 'Pengoperasian Autoclave & Sterilisasi EtO',
    level: 'Trainee',
    tanggalPenilaian: '2026-10-08',
    penilai: 'Ir. Agus Santoso'
  },
  {
    id: 'SKL-008',
    karyawanId: 'EMP-04',
    nama: 'Ahmad Fauzi',
    mesinAtauProses: 'Pengelolaan Stok FIFO/FEFO & Karantina Produk',
    level: 'Mahir',
    tanggalPenilaian: '2026-04-11',
    penilai: 'apt. Dewi Kartika, S.Si'
  }
];

export const INITIAL_KPI_KARYAWAN: KpiKaryawan[] = [
  {
    id: 'KPI-001',
    karyawanId: 'EMP-08',
    nama: 'Farhan Maulana',
    kerangka: 'Balanced Scorecard (Kantor/Sales)',
    periode: '2026-Q3',
    indikator: 'Realisasi penjualan melalui e-Katalog LKPP',
    target: 'Rp 12.000.000.000 / tahun',
    realisasi: 'Rp 9.400.000.000 (s.d. Q3)',
    capaianPersen: 78
  },
  {
    id: 'KPI-002',
    karyawanId: 'EMP-02',
    nama: 'Budi Utomo, S.T',
    kerangka: 'Balanced Scorecard (Kantor/Sales)',
    periode: '2026-Q3',
    indikator: 'Ketepatan waktu penutupan CAPA (≤ 30 hari)',
    target: '≥ 95%',
    realisasi: '92%',
    capaianPersen: 97
  },
  {
    id: 'KPI-003',
    karyawanId: 'EMP-07',
    nama: 'Dewi Anggraini, S.E',
    kerangka: 'Balanced Scorecard (Kantor/Sales)',
    periode: '2026-Q3',
    indikator: 'Efisiensi biaya pengadaan komponen (cost saving)',
    target: '8% dari nilai PO',
    realisasi: '6,5%',
    capaianPersen: 81
  },
  {
    id: 'KPI-004',
    karyawanId: 'EMP-01',
    nama: 'apt. Dewi Kartika, S.Si',
    kerangka: 'Balanced Scorecard (Kantor/Sales)',
    periode: '2026-Q3',
    indikator: 'Kepatuhan perpanjangan izin edar sebelum kedaluwarsa',
    target: '100%',
    realisasi: '100%',
    capaianPersen: 100
  },
  {
    id: 'KPI-005',
    karyawanId: 'EMP-06',
    nama: 'Ir. Agus Santoso',
    kerangka: 'Efisiensi Manufaktur',
    periode: '2026-Q3',
    indikator: 'OEE Lini Perakitan (Availability × Performance × Quality)',
    target: '≥ 85%',
    realisasi: '81,4%',
    capaianPersen: 96
  },
  {
    id: 'KPI-006',
    karyawanId: 'EMP-03',
    nama: 'Hendra Setiawan',
    kerangka: 'Efisiensi Manufaktur',
    periode: '2026-Q3',
    indikator: 'Defect rate (reject) inspeksi akhir',
    target: '≤ 1,5%',
    realisasi: '1,9%',
    capaianPersen: 79
  },
  {
    id: 'KPI-007',
    karyawanId: 'EMP-11',
    nama: 'Joko Susilo',
    kerangka: 'Efisiensi Manufaktur',
    periode: '2026-10',
    indikator: 'Output unit rakitan per shift',
    target: '1.200 unit',
    realisasi: '1.140 unit',
    capaianPersen: 95
  },
  {
    id: 'KPI-008',
    karyawanId: 'EMP-12',
    nama: 'Mega Puspita',
    kerangka: 'Efisiensi Manufaktur',
    periode: '2026-10',
    indikator: 'Scrap material kemasan primer',
    target: '≤ 2%',
    realisasi: '1,6%',
    capaianPersen: 100
  }
];

export const INITIAL_UMPAN_BALIK_360: UmpanBalik360[] = [
  {
    id: 'FB360-001',
    karyawanId: 'EMP-02',
    nama: 'Budi Utomo, S.T',
    periode: 'CPM Semester II 2026',
    skorAtasan: 4.4,
    skorRekan: 4.2,
    skorBawahan: 4.0,
    skorDiriSendiri: 4.5,
    status: 'Selesai'
  },
  {
    id: 'FB360-002',
    karyawanId: 'EMP-03',
    nama: 'Hendra Setiawan',
    periode: 'CPM Semester II 2026',
    skorAtasan: 4.1,
    skorRekan: 4.3,
    skorBawahan: 4.2,
    skorDiriSendiri: 3.8,
    status: 'Selesai'
  },
  {
    id: 'FB360-003',
    karyawanId: 'EMP-06',
    nama: 'Ir. Agus Santoso',
    periode: 'CPM Semester II 2026',
    skorAtasan: 4.3,
    skorRekan: 4.0,
    skorBawahan: 3.7,
    skorDiriSendiri: 4.2,
    status: 'Berjalan'
  },
  {
    id: 'FB360-004',
    karyawanId: 'EMP-08',
    nama: 'Farhan Maulana',
    periode: 'CPM Semester II 2026',
    skorAtasan: 3.9,
    skorRekan: 4.1,
    skorBawahan: 0,
    skorDiriSendiri: 4.0,
    status: 'Berjalan'
  }
];

export const INITIAL_INSIDEN_K3: InsidenK3[] = [
  {
    id: 'K3-014',
    nomorLaporan: 'K3/AMS/2026/014',
    tanggal: '2026-10-21',
    area: 'Gudang Cold Chain Reagen IVD',
    jenis: 'Near Miss',
    kronologi: 'Palet reagen IVD miring saat dipindahkan forklift karena susunan karton tidak rata; tidak ada korban, produk diamankan ke area karantina.',
    tingkatRisiko: 'Sedang',
    tindakanKorektif: 'Pelatihan ulang stacking & handling palet, pemasangan barrier pembatas jalur forklift, penambahan checklist pra-angkat.',
    status: 'CAPA Berjalan',
    hariKehilangan: 0
  },
  {
    id: 'K3-012',
    nomorLaporan: 'K3/AMS/2026/012',
    tanggal: '2026-09-28',
    area: 'Lini Perakitan Syringe Pump',
    jenis: 'Kecelakaan Kerja',
    kronologi: 'Tangan operator terjepit mold saat membersihkan sisa injeksi karena mesin belum sepenuhnya berhenti (LOTO tidak diterapkan).',
    tingkatRisiko: 'Tinggi',
    tindakanKorektif: 'Penerapan Lock-Out Tag-Out wajib, pemasangan interlock pada cover mold, retraining seluruh operator Shift 1 & 2, dilaporkan ke BPJS Ketenagakerjaan (JKK).',
    status: 'Investigasi',
    hariKehilangan: 3
  },
  {
    id: 'K3-009',
    nomorLaporan: 'K3/AMS/2026/009',
    tanggal: '2026-08-14',
    area: 'Cleanroom Kelas C (Pengemasan)',
    jenis: 'Penyakit Akibat Kerja',
    kronologi: 'Iritasi kulit berulang pada operator akibat paparan Isopropil Alkohol (IPA) saat pembersihan permukaan tanpa sarung tangan nitril ganda.',
    tingkatRisiko: 'Sedang',
    tindakanKorektif: 'Penggantian IPA dengan disinfektan rendah iritasi, wajib sarung tangan nitril ganda, MCU dermatologi ulang tiap 6 bulan bagi operator cleanroom.',
    status: 'Ditutup',
    hariKehilangan: 1
  },
  {
    id: 'K3-015',
    nomorLaporan: 'K3/AMS/2026/015',
    tanggal: '2026-10-30',
    area: 'Ruang Server Kantor Pusat',
    jenis: 'Near Miss',
    kronologi: 'Kabel UPS melintang di jalur evakuasi dan menutup akses APAR saat inspeksi mendadak tim K3.',
    tingkatRisiko: 'Rendah',
    tindakanKorektif: 'Pemasangan cable tray di atas lantai, penandaan jalur evakuasi ulang, audit APD & APAR bulanan.',
    status: 'Ditutup',
    hariKehilangan: 0
  }
];

export const INITIAL_REKAM_MCU: RekamMcu[] = [
  {
    id: 'MCU-021',
    karyawanId: 'EMP-11',
    nama: 'Joko Susilo',
    tanggalMcu: '2026-06-12',
    jenisPemeriksaan: 'MCU Berkala Tahunan + Audiometri',
    paparan: 'Bising lini perakitan 82 dB(A), gerakan berulang',
    hasil: 'Fit to Work',
    dokterPemeriksa: 'dr. Hendra Gunawan, Sp.Ok',
    jadwalBerikutnya: '2027-06-12'
  },
  {
    id: 'MCU-022',
    karyawanId: 'EMP-12',
    nama: 'Mega Puspita',
    tanggalMcu: '2026-10-08',
    jenisPemeriksaan: 'MCU Khusus (Dermatologi Okupasi)',
    paparan: 'Isopropil Alkohol (IPA), sterilisasi EtO, suhu cleanroom 20-22°C',
    hasil: 'Fit with Restriction',
    dokterPemeriksa: 'dr. Hendra Gunawan, Sp.Ok',
    jadwalBerikutnya: '2027-01-08'
  },
  {
    id: 'MCU-023',
    karyawanId: 'EMP-03',
    nama: 'Hendra Setiawan',
    tanggalMcu: '2026-05-20',
    jenisPemeriksaan: 'MCU Berkala Tahunan + Spirometri',
    paparan: 'Reagen laboratorium QC, uap pelarut',
    hasil: 'Fit to Work',
    dokterPemeriksa: 'Klinik Medoka Occupational Health',
    jadwalBerikutnya: '2027-05-20'
  },
  {
    id: 'MCU-024',
    karyawanId: 'EMP-09',
    nama: 'Siti Rahma',
    tanggalMcu: '2026-09-03',
    jenisPemeriksaan: 'MCU Khusus Paparan Suhu Dingin',
    paparan: 'Gudang cold chain 2-8°C, shift malam berulang',
    hasil: 'Perlu Evaluasi',
    dokterPemeriksa: 'dr. Hendra Gunawan, Sp.Ok',
    jadwalBerikutnya: '2026-12-03'
  }
];

export const INITIAL_DISTRIBUSI_APD: DistribusiApd[] = [
  {
    id: 'APD-101',
    karyawanId: 'EMP-11',
    nama: 'Joko Susilo',
    jenisApd: 'Sarung Tangan Nitril (Cleanroom) + Earplug',
    standar: 'EN 374-2 / SNI ISO 4869-1',
    tanggalDistribusi: '2026-11-01',
    jumlah: 60,
    kondisi: 'Penggantian Berkala',
    tandaTerima: true
  },
  {
    id: 'APD-102',
    karyawanId: 'EMP-12',
    nama: 'Mega Puspita',
    jenisApd: 'Gown Cleanroom Kelas C + Masker N95',
    standar: 'ISO 14644-4 / NIOSH N95',
    tanggalDistribusi: '2026-11-01',
    jumlah: 4,
    kondisi: 'Baru',
    tandaTerima: true
  },
  {
    id: 'APD-103',
    karyawanId: 'EMP-05',
    nama: 'Dian Nugraha, A.Md.TEM',
    jenisApd: 'Safety Shoes Dielektrik + Kacamata Safety',
    standar: 'SNI 7079 / ANSI Z87.1',
    tanggalDistribusi: '2026-10-15',
    jumlah: 2,
    kondisi: 'Penggantian Berkala',
    tandaTerima: true
  },
  {
    id: 'APD-104',
    karyawanId: 'EMP-09',
    nama: 'Siti Rahma',
    jenisApd: 'Jaket Thermal Gudang Cold Chain + Sarung Tangan Dingin',
    standar: 'EN 511 (Cold Protection)',
    tanggalDistribusi: '2026-10-20',
    jumlah: 2,
    kondisi: 'Baru',
    tandaTerima: true
  },
  {
    id: 'APD-105',
    karyawanId: 'EMP-06',
    nama: 'Ir. Agus Santoso',
    jenisApd: 'Helm Safety + Face Shield Lini Perakitan',
    standar: 'SNI 8031 / ANSI Z87.1',
    tanggalDistribusi: '2026-09-28',
    jumlah: 2,
    kondisi: 'Penggantian Berkala',
    tandaTerima: true
  },
  {
    id: 'APD-106',
    karyawanId: 'EMP-03',
    nama: 'Hendra Setiawan',
    jenisApd: 'Sarung Tangan Anti Bahan Kimia + Apron Lab',
    standar: 'EN 374-3 (Kimia) / EN 13034',
    tanggalDistribusi: '2026-11-02',
    jumlah: 20,
    kondisi: 'Baru',
    tandaTerima: false
  }
];

// ==================== SALES & MARKETING (Cetak Biru Divisi Komersial) ====================
// Periode demo mengikuti tanggal berjalan sistem (2026) agar gerbang kepatuhan
// (NIE, izin operasional, jatuh tempo piutang, FEFO) menghasilkan kasus lolos & ditolak.

export const INITIAL_PELANGGAN_B2B: PelangganB2B[] = [
  {
    id: 'PLG-001',
    kodePelanggan: 'PLG-2026-001',
    namaInstalasi: 'RSUD Pasar Minggu Jakarta Selatan',
    tipeFasyankes: 'RS Pemerintah',
    provinsi: 'DKI Jakarta',
    rayonDistribusi: 'Rayon Jabodetabek',
    akreditasi: 'Paripurna',
    nomorIzinOperasional: 'DJK-2024-1188/RSUD-PM',
    tanggalBerlakuIzin: '2027-06-30',
    penanggungJawabPengadaan: 'Dra. Hesti Wardani (Kabag Pengadaan)',
    namaDokterPenanggungJawab: 'dr. Anwar Fadillah, Sp.An',
    spesialisasiDokter: 'Anestesiologi & Terapi Intensif',
    batasKredit: 500000000,
    piutangBerjalan: 120000000,
    tanggalJatuhTempoPiutang: '2026-12-15',
    termsOfPaymentHari: 45,
    statusPelanggan: 'Aktif'
  },
  {
    id: 'PLG-002',
    kodePelanggan: 'PLG-2026-002',
    namaInstalasi: 'RSUP Fatmawati Jakarta',
    tipeFasyankes: 'RS Pemerintah',
    provinsi: 'DKI Jakarta',
    rayonDistribusi: 'Rayon Jabodetabek',
    akreditasi: 'Paripurna',
    nomorIzinOperasional: 'DJK-2023-0452/RSUP-FTM',
    tanggalBerlakuIzin: '2028-03-31',
    penanggungJawabPengadaan: 'Ir. Bambang Sutoyo (Pejabat Pengadaan)',
    namaDokterPenanggungJawab: 'dr. Rina Kartika, Sp.RM',
    spesialisasiDokter: 'Rekam Medis & Informatika Kesehatan',
    batasKredit: 850000000,
    piutangBerjalan: 260000000,
    tanggalJatuhTempoPiutang: '2026-11-30',
    termsOfPaymentHari: 60,
    statusPelanggan: 'Aktif'
  },
  {
    id: 'PLG-003',
    kodePelanggan: 'PLG-2026-003',
    namaInstalasi: 'Klinik Utama Sehat Paripurna Bandung',
    tipeFasyankes: 'Klinik',
    provinsi: 'Jawa Barat',
    rayonDistribusi: 'Rayon Jawa Barat',
    akreditasi: 'Utama',
    nomorIzinOperasional: 'UKL-2021-0917/KU-SP',
    tanggalBerlakuIzin: '2026-08-31',
    penanggungJawabPengadaan: 'Henny Puspita, A.Md.Kes (Manajer Operasional)',
    namaDokterPenanggungJawab: 'dr. Teguh Prasetyo, Sp.PK',
    spesialisasiDokter: 'Patologi Klinik',
    batasKredit: 150000000,
    piutangBerjalan: 95000000,
    tanggalJatuhTempoPiutang: '2026-10-15',
    termsOfPaymentHari: 30,
    statusPelanggan: 'Aktif'
  },
  {
    id: 'PLG-004',
    kodePelanggan: 'PLG-2026-004',
    namaInstalasi: 'RS Harapan Bunda Surabaya',
    tipeFasyankes: 'RS Swasta',
    provinsi: 'Jawa Timur',
    rayonDistribusi: 'Rayon Jawa Timur & Bali',
    akreditasi: 'Madya',
    nomorIzinOperasional: 'DJK-2025-2210/RS-HB',
    tanggalBerlakuIzin: '2027-12-12',
    penanggungJawabPengadaan: 'Lilik Sumarni, S.Kep (Kepala Pengadaan)',
    namaDokterPenanggungJawab: 'dr. Prakash Nanda, Sp.Rad',
    spesialisasiDokter: 'Radiologi',
    batasKredit: 250000000,
    piutangBerjalan: 88000000,
    tanggalJatuhTempoPiutang: '2027-01-20',
    termsOfPaymentHari: 45,
    statusPelanggan: 'Aktif'
  },
  {
    id: 'PLG-005',
    kodePelanggan: 'PLG-2026-005',
    namaInstalasi: 'Dinas Kesehatan Kabupaten Bogor',
    tipeFasyankes: 'Dinas Kesehatan',
    provinsi: 'Jawa Barat',
    rayonDistribusi: 'Rayon Jawa Barat',
    akreditasi: 'Belum Terakreditasi',
    nomorIzinOperasional: 'DINKES-BOGOR-2022/501-IX',
    tanggalBerlakuIzin: '2029-01-31',
    penanggungJawabPengadaan: 'Drs. Yaya Sunarya (Pejabat Pembuat Komitmen)',
    namaDokterPenanggungJawab: 'dr. Lestari Wulandari, M.Kes',
    spesialisasiDokter: 'Kesehatan Masyarakat / Puskemas Rujukan',
    batasKredit: 400000000,
    piutangBerjalan: 310000000,
    tanggalJatuhTempoPiutang: '2026-12-28',
    termsOfPaymentHari: 60,
    statusPelanggan: 'Aktif'
  },
  {
    id: 'PLG-006',
    kodePelanggan: 'PLG-2026-006',
    namaInstalasi: 'Apotek Kimia Sentosa Semarang',
    tipeFasyankes: 'Apotek',
    provinsi: 'Jawa Tengah',
    rayonDistribusi: 'Rayon Jawa Tengah & DIY',
    akreditasi: 'Belum Terakreditasi',
    nomorIzinOperasional: 'SIA-2023-0774/APT-KS',
    tanggalBerlakuIzin: '2026-07-19',
    penanggungJawabPengadaan: 'Apoteker Penanggung Jawab: Fitria Sari, S.Farm., Apt.',
    namaDokterPenanggungJawab: '-',
    spesialisasiDokter: '-',
    batasKredit: 75000000,
    piutangBerjalan: 18000000,
    tanggalJatuhTempoPiutang: '2026-11-25',
    termsOfPaymentHari: 30,
    statusPelanggan: 'Non-aktif'
  },
  {
    id: 'PLG-007',
    kodePelanggan: 'PLG-2026-007',
    namaInstalasi: 'Laboratorium Klinis Medilab Medan',
    tipeFasyankes: 'Laboratorium',
    provinsi: 'Sumatera Utara',
    rayonDistribusi: 'Rayon Sumatera',
    akreditasi: 'Madya',
    nomorIzinOperasional: 'LABKES-2024-1188/LK-MLB',
    tanggalBerlakuIzin: '2028-05-05',
    penanggungJawabPengadaan: 'Rizal Ananda, A.Md.AK (Kepala Laboratorium)',
    namaDokterPenanggungJawab: 'dr. Yuniar Putri, Sp.PK',
    spesialisasiDokter: 'Patologi Klinik',
    batasKredit: 180000000,
    piutangBerjalan: 42000000,
    tanggalJatuhTempoPiutang: '2027-01-10',
    termsOfPaymentHari: 30,
    statusPelanggan: 'Aktif'
  },
  {
    id: 'PLG-008',
    kodePelanggan: 'PLG-2026-008',
    namaInstalasi: 'RSUD Zainoel Abidin Banda Aceh',
    tipeFasyankes: 'RS Pemerintah',
    provinsi: 'Aceh',
    rayonDistribusi: 'Rayon Sumatera',
    akreditasi: 'Paripurna',
    nomorIzinOperasional: 'DJK-2025-0921/RSUD-ZAB',
    tanggalBerlakuIzin: '2027-09-01',
    penanggungJawabPengadaan: 'Mukhlis, S.KM (Kabag Umum & Pengadaan)',
    namaDokterPenanggungJawab: 'dr. Cut Rahmawati, Sp.B',
    spesialisasiDokter: 'Bedah Umum',
    batasKredit: 300000000,
    piutangBerjalan: 0,
    tanggalJatuhTempoPiutang: '2027-02-01',
    termsOfPaymentHari: 45,
    statusPelanggan: 'Aktif'
  }
];

export const INITIAL_PROSPEK_ALKES: ProspekAlkes[] = [
  {
    id: 'LDP-001',
    nomorProspek: 'LDP/2026/07/041',
    namaProspek: 'RSUD Kota Bekasi (Unit Radiologi)',
    tipeFasyankes: 'RS Pemerintah',
    sumberLead: 'Simposium',
    tahap: 'Demo Produk',
    produkDiminati: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    nilaiEstimasi: 780000000,
    probabilitasPersen: 55,
    medRep: 'Asep Nugraha',
    rayonDistribusi: 'Rayon Jawa Barat',
    tanggalDibuat: '2026-07-12',
    tanggalTindakLanjut: '2026-11-08',
    catatan: 'Demo unit SonoEcho 90 dijadwalkan 8 November, didampingi teknisi elektromedik.'
  },
  {
    id: 'LDP-002',
    nomorProspek: 'LDP/2026/08/052',
    namaProspek: 'RS Islam Sakinah Mojokerto',
    tipeFasyankes: 'RS Swasta',
    sumberLead: 'Rujukan',
    tahap: 'Negosiasi Harga',
    produkDiminati: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nilaiEstimasi: 240000000,
    probabilitasPersen: 70,
    medRep: 'Maya Anggraini',
    rayonDistribusi: 'Rayon Jawa Timur & Bali',
    tanggalDibuat: '2026-08-03',
    tanggalTindakLanjut: '2026-11-06',
    catatan: 'Meminta harga terkunci 4 unit + bonus 1 unit untuk ruang NICU.'
  },
  {
    id: 'LDP-003',
    nomorProspek: 'LDP/2026/09/063',
    namaProspek: 'Puskesmas Kec. Cibinong (Dinkes Bogor)',
    tipeFasyankes: 'Dinas Kesehatan',
    sumberLead: 'E-Purchasing',
    tahap: 'Penawaran Resmi',
    produkDiminati: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nilaiEstimasi: 165000000,
    probabilitasPersen: 60,
    medRep: 'Asep Nugraha',
    rayonDistribusi: 'Rayon Jawa Barat',
    tanggalDibuat: '2026-09-18',
    tanggalTindakLanjut: '2026-11-12',
    catatan: 'Berkas penawaran melalui E-Purchasing Lokal Dinas Kesehatan sudah diunggah.'
  },
  {
    id: 'LDP-004',
    nomorProspek: 'LDP/2026/09/071',
    namaProspek: 'Klinik Prodia Cabang Depok',
    tipeFasyankes: 'Laboratorium',
    sumberLead: 'Situs Web',
    tahap: 'Perkenalan Alat',
    produkDiminati: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    nilaiEstimasi: 48000000,
    probabilitasPersen: 25,
    medRep: 'Asep Nugraha',
    rayonDistribusi: 'Rayon Jawa Barat',
    tanggalDibuat: '2026-09-28',
    tanggalTindakLanjut: '2026-11-20',
    catatan: 'Seasonality dengue rendah — ikuti setelah rilis peta kewaspadaan Kemenkes.'
  },
  {
    id: 'LDP-005',
    nomorProspek: 'LDP/2026/10/084',
    namaProspek: 'RSU Muhammadiyah Lamongan',
    tipeFasyankes: 'RS Swasta',
    sumberLead: 'Pameran',
    tahap: 'Demo Produk',
    produkDiminati: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    nilaiEstimasi: 690000000,
    probabilitasPersen: 40,
    medRep: 'Maya Anggraini',
    rayonDistribusi: 'Rayon Jawa Timur & Bali',
    tanggalDibuat: '2026-10-05',
    tanggalTindakLanjut: '2026-11-15',
    catatan: 'Lead dari pameran CARE Indonesia; butuh brosur resmi bernomor izin edar.'
  },
  {
    id: 'LDP-006',
    nomorProspek: 'LDP/2026/06/028',
    namaProspek: 'RSUD Dr. Pirampu Buleleng Bali',
    tipeFasyankes: 'RS Pemerintah',
    sumberLead: 'LPSE',
    tahap: 'Pemenang',
    produkDiminati: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nilaiEstimasi: 300000000,
    probabilitasPersen: 100,
    medRep: 'Maya Anggraini',
    rayonDistribusi: 'Rayon Jawa Timur & Bali',
    tanggalDibuat: '2026-06-22',
    tanggalTindakLanjut: '2026-11-04',
    catatan: 'Kontrak harga aktif, menunggu Berita Acara Serah Terima instalasi.'
  },
  {
    id: 'LDP-007',
    nomorProspek: 'LDP/2026/05/019',
    namaProspek: 'Klinik Pratama Sejahtera Tebet',
    tipeFasyankes: 'Klinik',
    sumberLead: 'Cold Call',
    tahap: 'Gagal',
    produkDiminati: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    nilaiEstimasi: 22000000,
    probabilitasPersen: 0,
    medRep: 'Rudi Hartono',
    rayonDistribusi: 'Rayon Jabodetabek',
    tanggalDibuat: '2026-05-30',
    tanggalTindakLanjut: '2026-07-15',
    catatan: 'Gagal: klinik tidak memiliki kamar bedah, kebutuhan tidak relevan.'
  },
  {
    id: 'LDP-008',
    nomorProspek: 'LDP/2026/10/090',
    namaProspek: 'RSUP H. Adam Malik Medan',
    tipeFasyankes: 'RS Pemerintah',
    sumberLead: 'Simposium',
    tahap: 'Negosiasi Harga',
    produkDiminati: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nilaiEstimasi: 420000000,
    probabilitasPersen: 65,
    medRep: 'Fajar Ramadhan',
    rayonDistribusi: 'Rayon Sumatera',
    tanggalDibuat: '2026-10-14',
    tanggalTindakLanjut: '2026-11-10',
    catatan: 'Meminta perpanjangan garansi 24 bulan + kalibrasi tahunan gratis.'
  }
];

export const INITIAL_TERITORIAL_PENJUALAN: TeritorialPenjualan[] = [
  {
    id: 'RAYON-01',
    kodeRayon: 'RBN-01',
    namaRayon: 'Rayon Jabodetabek',
    provinsiDilayani: ['DKI Jakarta', 'Banten'],
    medRep: 'Rudi Hartono',
    nikMedRep: 'EMP-2019-014',
    targetTahunan: 9500000000,
    realisasiYtd: 6420000000,
    daftarPelanggan: ['PLG-001', 'PLG-002'],
    catatanTumpangTindih: 'Batas rayon dengan RBN-02 mengikuti garis kota/kabupaten (Bekasi-Cikarang milik RBN-02).'
  },
  {
    id: 'RAYON-02',
    kodeRayon: 'RBN-02',
    namaRayon: 'Rayon Jawa Barat',
    provinsiDilayani: ['Jawa Barat'],
    medRep: 'Asep Nugraha',
    nikMedRep: 'EMP-2020-031',
    targetTahunan: 7200000000,
    realisasiYtd: 5980000000,
    daftarPelanggan: ['PLG-003', 'PLG-005'],
    catatanTumpangTindih: 'Bersinggungan dengan RBN-01 di Kota Depok; penugasan Prospek LDP-004 tetap atas nama RBN-02.'
  },
  {
    id: 'RAYON-03',
    kodeRayon: 'RBN-03',
    namaRayon: 'Rayon Jawa Timur & Bali',
    provinsiDilayani: ['Jawa Timur', 'Bali', 'Nusa Tenggara'],
    medRep: 'Maya Anggraini',
    nikMedRep: 'EMP-2018-007',
    targetTahunan: 8800000000,
    realisasiYtd: 4210000000,
    daftarPelanggan: ['PLG-004'],
    catatanTumpangTindih: 'Tanpa tumpang tindih aktif sejak pemindahan Tuban-Bojonegoro dari RBN-04 (SK Dirkom 2026-04).'
  },
  {
    id: 'RAYON-04',
    kodeRayon: 'RBN-04',
    namaRayon: 'Rayon Jawa Tengah & DIY',
    provinsiDilayani: ['Jawa Tengah', 'DI Yogyakarta'],
    medRep: 'Dewi Lestari',
    nikMedRep: 'EMP-2021-052',
    targetTahunan: 5400000000,
    realisasiYtd: 1830000000,
    daftarPelanggan: ['PLG-006'],
    catatanTumpangTindih: 'Rayon kosong pelanggan aktif setelah Apotek Kimia Sentosa dinonaktifkan — butuh akuisisi baru.'
  },
  {
    id: 'RAYON-05',
    kodeRayon: 'RBN-05',
    namaRayon: 'Rayon Sumatera',
    provinsiDilayani: ['Sumatera Utara', 'Aceh', 'Riau', 'Sumatera Barat'],
    medRep: 'Fajar Ramadhan',
    nikMedRep: 'EMP-2019-088',
    targetTahunan: 6100000000,
    realisasiYtd: 3240000000,
    daftarPelanggan: ['PLG-007', 'PLG-008'],
    catatanTumpangTindih: 'Wilayah Aceh diambil alih RBN-05 dari sub-distributor lokal per 1 Agustus 2026.'
  }
];

export const INITIAL_TENDER_ALKES: TenderAlkes[] = [
  {
    id: 'TDR-001',
    nomorPengumuman: '027/DJK-I/LPSE-DKI/XI/2026',
    namaPengadaan: 'Pengadaan Alat Kesehatan Penunjang ICU RSUD Pasar Minggu TA 2026',
    sumber: 'LPSE',
    instansiPembuat: 'RSUD Pasar Minggu Jakarta Selatan',
    provinsi: 'DKI Jakarta',
    nilaiHps: 1750000000,
    batasAkhirPengajuan: '2026-11-06',
    statusTender: 'Hampir Tutup',
    persyaratanKunci: ['SDAK Distribusi Alkes masih berlaku', 'Sertifikat CDAKB', 'Kartu Perusahaan (NIB)', 'Surat dukungan PJT bermaterai'],
    produkDitawarkan: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nomorIzinEdarDipersyaratkan: 'KEMENKES RI AKL 20501819203',
    tautanPengumuman: '/pengumuman-lpse/027-djk-i-rsud-pm-2026.pdf'
  },
  {
    id: 'TDR-002',
    nomorPengumuman: 'EKAT/SES/ALKE/2026-1147',
    namaPengadaan: 'E-Katalog Sektoral Alkes: Patient Monitor & Syringe Pump (Purchasing Langsung)',
    sumber: 'e-Katalog LKPP',
    instansiPembuat: 'LKPP RI',
    provinsi: 'Nasional',
    nilaiHps: 0,
    batasAkhirPengajuan: '2027-06-30',
    statusTender: 'Aktif',
    persyaratanKunci: ['Harga tayang sesuai daftar harga terkunci', 'NIE aktif & dilampirkan di halaman produk'],
    produkDitawarkan: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorIzinEdarDipersyaratkan: 'KEMENKES RI AKD 20501910234',
    tautanPengumuman: '/e-katalog/alkes/2026/ams-sp500'
  },
  {
    id: 'TDR-003',
    nomorPengumuman: '031/SET/DKKB/X/2026',
    namaPengadaan: 'Pengadaan USG Portabel untuk Puskesmas Rujukan Kabupaten Bogor',
    sumber: 'E-Purchasing',
    instansiPembuat: 'Dinas Kesehatan Kabupaten Bogor',
    provinsi: 'Jawa Barat',
    nilaiHps: 2050000000,
    batasAkhirPengajuan: '2026-11-12',
    statusTender: 'Aktif',
    persyaratanKunci: ['Sertifikat Standar Usaha OSS-RBA bidang distribusi alkes', 'Jaminan Penawaran 2%', 'Kemampuan servis dalam 1x24 jam'],
    produkDitawarkan: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    nomorIzinEdarDipersyaratkan: 'KEMENKES RI AKL 21501710988',
    tautanPengumuman: '/epurchasing-dinkes/2026-031-usg-portabel'
  },
  {
    id: 'TDR-004',
    nomorPengumuman: '045/PBJ/RS-HB/IX/2026',
    namaPengadaan: 'Tender Mandiri Reagen Dengue RS Harapan Bunda Surabaya',
    sumber: 'Tender Mandiri RS',
    instansiPembuat: 'RS Harapan Bunda Surabaya',
    provinsi: 'Jawa Timur',
    nilaiHps: 460000000,
    batasAkhirPengajuan: '2026-10-20',
    statusTender: 'Dimenangkan',
    persyaratanKunci: ['Harga borongan 12 bulan', 'Supply chain dingin 2-8°C terdokumentasi'],
    produkDitawarkan: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    nomorIzinEdarDipersyaratkan: 'KEMENKES RI AKL 20303810450',
    tautanPengumuman: '/tender-mandiri/rs-hb-2026-reagen-dengue'
  },
  {
    id: 'TDR-005',
    nomorPengumuman: '099/LPSE-SU/PL/IX/2026',
    namaPengadaan: 'Pengadaan Alat Kedokteran Laboratorium RSUP H. Adam Malik',
    sumber: 'LPSE',
    instansiPembuat: 'RSUP H. Adam Malik Medan',
    provinsi: 'Sumatera Utara',
    nilaiHps: 1280000000,
    batasAkhirPengajuan: '2026-10-08',
    statusTender: 'Kalah',
    persyaratanKunci: ['Sertifikat TKDN minimal 25%', 'Garansi resmi 24 bulan', 'Bukti kesanggupan suku cadang 5 tahun'],
    produkDitawarkan: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorIzinEdarDipersyaratkan: 'KEMENKES RI AKD 20501910234',
    tautanPengumuman: '/pengumuman-lpse/099-rsup-am-2026'
  },
  {
    id: 'TDR-006',
    nomorPengumuman: '012/DJK/RSUD-ZAB/X/2026',
    namaPengadaan: 'Pengadaan Bahan Medis Habis Pakai Bedah RSUD Zainoel Abidin',
    sumber: 'LPSE',
    instansiPembuat: 'RSUD Zainoel Abidin Banda Aceh',
    provinsi: 'Aceh',
    nilaiHps: 380000000,
    batasAkhirPengajuan: '2026-11-25',
    statusTender: 'Aktif',
    persyaratanKunci: ['Benang bedah dengan NIE aktif (cek H-30 sebelum ajur)', 'Sisa masa kedaluwarsa minimal 12 bulan'],
    produkDitawarkan: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    nomorIzinEdarDipersyaratkan: 'KEMENKES RI AKD 21603910442',
    tautanPengumuman: '/pengumuman-lpse/012-rsud-zab-bmhp-2026'
  }
];

export const INITIAL_KONTRAK_HARGA: KontrakHarga[] = [
  {
    id: 'KON-001',
    nomorKontrak: 'PK/AMS/RSUD-PM/2026-014',
    pelangganId: 'PLG-001',
    periodeMulai: '2026-04-01',
    periodeSelesai: '2027-03-31',
    statusKontrak: 'Aktif',
    daftarHargaTerkunci: [
      { namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro', hargaTerkunci: 58500000, satuan: 'Unit' },
      { namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500', hargaTerkunci: 34000000, satuan: 'Unit' }
    ],
    ditandatanganiOleh: 'Direktur Komersial & Kabag Pengadaan RSUD Pasar Minggu',
    verifikasiEtikaPromosiPjt: 'Memenuhi Etika Promosi'
  },
  {
    id: 'KON-002',
    nomorKontrak: 'PK/AMS/RSUP-FTM/2026-021',
    pelangganId: 'PLG-002',
    periodeMulai: '2026-06-15',
    periodeSelesai: '2027-06-14',
    statusKontrak: 'Aktif',
    daftarHargaTerkunci: [
      { namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90', hargaTerkunci: 665000000, satuan: 'Unit' },
      { namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro', hargaTerkunci: 57000000, satuan: 'Unit' }
    ],
    ditandatanganiOleh: 'Pejabat Pembuat Komitmen RSUP Fatmawati',
    verifikasiEtikaPromosiPjt: 'Memenuhi Etika Promosi'
  },
  {
    id: 'KON-003',
    nomorKontrak: 'PK/AMS/RS-HB/2026-008',
    pelangganId: 'PLG-004',
    periodeMulai: '2026-10-21',
    periodeSelesai: '2027-10-20',
    statusKontrak: 'Aktif',
    daftarHargaTerkunci: [
      { namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo', hargaTerkunci: 1725000, satuan: 'Kit (25 Test)' }
    ],
    ditandatanganiOleh: 'Kepala Pengadaan RS Harapan Bunda Surabaya',
    verifikasiEtikaPromosiPjt: 'Perlu Review PJT'
  },
  {
    id: 'KON-004',
    nomorKontrak: 'PK/AMS/DKKB/2025-003',
    pelangganId: 'PLG-005',
    periodeMulai: '2025-01-10',
    periodeSelesai: '2025-12-31',
    statusKontrak: 'Habis Masa',
    daftarHargaTerkunci: [
      { namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500', hargaTerkunci: 33000000, satuan: 'Unit' }
    ],
    ditandatanganiOleh: 'Pejabat Pembuat Komitmen Dinkes Kab. Bogor',
    verifikasiEtikaPromosiPjt: 'Memenuhi Etika Promosi'
  }
];

export const INITIAL_KUNJUNGAN_MEDREP: KunjunganMedRep[] = [
  {
    id: 'VK-001',
    tanggal: '2026-11-03',
    medRep: 'Rudi Hartono',
    pelangganId: 'PLG-001',
    tujuanKunjungan: 'Negosiasi',
    koordinatFasyankes: { lat: -6.2964, lon: 106.8164 },
    koordinatCheckIn: { lat: -6.2966, lon: 106.8161 },
    radiusGeofenceMeter: 150,
    jamCheckIn: '09:12',
    jamCheckOut: '10:05',
    hasilKunjungan: 'Kabag Pengadaan meminta berkas SDAK & CDAKB dilampirkan ulang sebelum 6 November.',
    tindakLanjut: 'Serahkan dokumen tender TDR-001 dan revisi harga terkunci.'
  },
  {
    id: 'VK-002',
    tanggal: '2026-11-03',
    medRep: 'Asep Nugraha',
    pelangganId: 'PLG-003',
    tujuanKunjungan: 'Pascapenjualan',
    koordinatFasyankes: { lat: -6.9147, lon: 107.6098 },
    koordinatCheckIn: { lat: -6.9321, lon: 107.6344 },
    radiusGeofenceMeter: 150,
    jamCheckIn: '13:40',
    jamCheckOut: '13:52',
    hasilKunjungan: 'Check-in terekam di luar pagar geofence (perkiraan lokasi parkir mall).',
    tindakLanjut: 'Ulangi check-in di lobi klinik dan lampirkan berita acara kunjungan.'
  },
  {
    id: 'VK-003',
    tanggal: '2026-11-04',
    medRep: 'Maya Anggraini',
    pelangganId: 'PLG-004',
    tujuanKunjungan: 'Demo Produk',
    koordinatFasyankes: { lat: -7.2624, lon: 112.7443 },
    koordinatCheckIn: { lat: -7.2626, lon: 112.744 },
    radiusGeofenceMeter: 200,
    jamCheckIn: '10:02',
    jamCheckOut: '11:30',
    hasilKunjungan: 'Demo reagen dengue diterima baik; laboratorium minta uji banding 20 sampel.',
    tindakLanjut: 'Kirim 20 kit LOT-2024-DNG12 sebagai sampel uji (butuh persetujuan FEFO).'
  },
  {
    id: 'VK-004',
    tanggal: '2026-11-04',
    medRep: 'Fajar Ramadhan',
    pelangganId: 'PLG-007',
    tujuanKunjungan: 'Pengumpulan Dokumen Tender',
    koordinatFasyankes: { lat: 3.5756, lon: 98.6762 },
    koordinatCheckIn: { lat: 3.5758, lon: 98.676 },
    radiusGeofenceMeter: 250,
    jamCheckIn: '08:35',
    jamCheckOut: '09:20',
    hasilKunjungan: 'Berita acara penawaran dan contoh spesifikasi diterima kepala laboratorium.',
    tindakLanjut: 'Unggah penawaran LDP-008 ke portal unit pengadaan.'
  },
  {
    id: 'VK-005',
    tanggal: '2026-11-05',
    medRep: 'Dewi Lestari',
    pelangganId: 'PLG-006',
    tujuanKunjungan: 'Perkenalan Alat',
    koordinatFasyankes: { lat: -6.9905, lon: 110.4247 },
    koordinatCheckIn: null,
    radiusGeofenceMeter: 120,
    jamCheckIn: '14:00',
    jamCheckOut: null,
    hasilKunjungan: 'Kunjungan terjadwal; apotek sedang non-aktif sehingga rencana dialihkan ke calon pelanggan lain.',
    tindakLanjut: 'Konfirmasi ulang status izin apotek sebelum kunjungan.'
  },
  {
    id: 'VK-006',
    tanggal: '2026-11-05',
    medRep: 'Asep Nugraha',
    pelangganId: 'PLG-005',
    tujuanKunjungan: 'Negosiasi',
    koordinatFasyankes: { lat: -6.5957, lon: 106.7832 },
    koordinatCheckIn: { lat: -6.5959, lon: 106.7835 },
    radiusGeofenceMeter: 200,
    jamCheckIn: '09:05',
    jamCheckOut: '10:15',
    hasilKunjungan: 'Dinkes mengusulkan termin 3 tahap dengan retensi 10% sampai serah terima.',
    tindakLanjut: 'Minta persetujuan kredit & TOP baru ke manajer penjualan.'
  },
  {
    id: 'VK-007',
    tanggal: '2026-11-06',
    medRep: 'Maya Anggraini',
    pelangganId: 'PLG-004',
    tujuanKunjungan: 'Demo Produk',
    koordinatFasyankes: { lat: -7.2624, lon: 112.7443 },
    koordinatCheckIn: { lat: -7.2625, lon: 112.7445 },
    radiusGeofenceMeter: 200,
    jamCheckIn: '13:10',
    jamCheckOut: null,
    hasilKunjungan: 'Serah terima unit demo SonoEcho 90 untuk uji coba 14 hari.',
    tindakLanjut: 'Pantau tenggat pengembalian unit demo di tab Marketing.'
  },
  {
    id: 'VK-008',
    tanggal: '2026-11-08',
    medRep: 'Rudi Hartono',
    pelangganId: 'PLG-002',
    tujuanKunjungan: 'Pascapenjualan',
    koordinatFasyankes: { lat: -6.2936, lon: 106.7928 },
    koordinatCheckIn: { lat: -6.2937, lon: 106.793 },
    radiusGeofenceMeter: 150,
    jamCheckIn: '08:00',
    jamCheckOut: null,
    hasilKunjungan: 'Rencana kalibrasi preventif monitor ICU bersama instalasi alkes.',
    tindakLanjut: 'Jadwalkan teknisi elektromedik dan kirim daftar cek kalibrasi.'
  }
];

export const INITIAL_PENGETAHUAN_PRODUK: PengetahuanProdukAlkes[] = [
  {
    id: 'PKN-001',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    tipeModel: 'AMS-V12 Pro',
    kategori: 'Elektromedik Non Radiasi',
    nomorIzinEdar: 'KEMENKES RI AKL 20501819203',
    tanggalKedaluwarsaNie: '2028-04-15',
    produsen: 'PT Anugrah Mitra Selaras (CPAKB)',
    spesifikasiRingkas: 'Monitor 12,1 inci, ECG 3/5 lead, SpO2, NIBP, suhu ganda, baterai 4 jam, cocok untuk ICU/NICU.',
    poinJual: ['Layar 12,1 inci anti-glare', 'Baterai tahan 4 jam untuk transfer pasien', 'Rekam tren 72 jam untuk tinjauan perawat'],
    tautanBrosur: '/brosur/ams-v12-pro.pdf',
    tautanVideoDemo: '/video/ams-v12-pro-instalasi.mp4',
    pertanyaanTeknisUmum: [
      { pertanyaan: 'Apakah kompatibel dengan HL7 untuk integrasi CIS RS?', jawaban: 'Ya, modul HL7 opsional dengan firmware 2.3 ke atas.' },
      { pertanyaan: 'Berapa interval kalibrasi rekomendasi?', jawaban: '12 bulan sesuai SOP-KAL-02, oleh teknisi elektromedik tersertifikasi.' }
    ]
  },
  {
    id: 'PKN-002',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    tipeModel: 'AMS-SP500',
    kategori: 'Elektromedik Non Radiasi',
    nomorIzinEdar: 'KEMENKES RI AKD 20501910234',
    tanggalKedaluwarsaNie: '2027-09-10',
    produsen: 'PT Anugrah Mitra Selaras (CPAKB)',
    spesifikasiRingkas: 'Laju infus 0,01-1500 ml/jam, akurasi ±5%, alarm oklusi, baterai 6 jam, multi-suntikan 5-60 ml.',
    poinJual: ['Akurasi rendah-volume untuk neonatus', 'Stacking hingga 4 kanal', 'Riwayat alarm dapat diekspor untuk audit'],
    tautanBrosur: '/brosur/ams-sp500.pdf',
    tautanVideoDemo: '/video/ams-sp500-operasi.mp4',
    pertanyaanTeknisUmum: [
      { pertanyaan: 'Mendukung suntikan merk lain?', jawaban: 'Ya, ada 42 profil suntikan terekam dan dapat ditambah lewat menu kalibrasi.' },
      { pertanyaan: 'Bagaimana prosedur uji akurasi lapangan?', jawaban: 'Metode gravimetri dengan timbangan analitik, sesuai SOP-KAL-04.' }
    ]
  },
  {
    id: 'PKN-003',
    namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    tipeModel: 'Dengue Combo Rapid',
    kategori: 'Diagnostik In Vitro',
    nomorIzinEdar: 'KEMENKES RI AKL 20303810450',
    tanggalKedaluwarsaNie: '2027-01-20',
    produsen: 'Shenzhen Wondfo Biotech (Prinsipal Resmi)',
    spesifikasiRingkas: 'Deteksi NS1 + IgG/IgM sekaligus, 15-20 menit, sensitivitas NS1 92,4% pada hari 0-5 demam.',
    poinJual: ['Rantai dingin 2-8°C terdokumentasi', 'Volume 200 kit per box untuk efisiensi tender', 'Bisa sampel darah vena, EDTA, maupun fingertip'],
    tautanBrosur: '/brosur/dengue-combo.pdf',
    tautanVideoDemo: '/video/dengue-combo-prosedur.mp4',
    pertanyaanTeknisUmum: [
      { pertanyaan: 'Bagaimana handling bila cold chain putus?', jawaban: 'Bets dikarantina, dinilai dengan SOP-COLD-01, dan tidak boleh dijual bila paparan > 8°C di atas 4 jam.' },
      { pertanyaan: 'Sisa masa kedaluwarsa minimum untuk tender?', jawaban: 'Umumnya 12 bulan; tender RSUD Zainoel Abidin (TDR-006) mensyaratkan minimal 12 bulan.' }
    ]
  },
  {
    id: 'PKN-004',
    namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable',
    tipeModel: 'Polyglactin 910 Braided',
    kategori: 'Non Elektromedik Steril',
    nomorIzinEdar: 'KEMENKES RI AKD 21603910442',
    tanggalKedaluwarsaNie: '2026-11-05',
    produsen: 'PT Anugrah Mitra Selaras (CPAKB)',
    spesifikasiRingkas: 'Benang jahit absorben anyaman, ukuran 2-0 sampai 4-0, kekuatan tarik tersisa 60% pada hari 21.',
    poinJual: ['Sterilisasi gamma 25 kGy terdokumentasi', 'Kemasan unit RS mengurangi sisa pemborongan'],
    tautanBrosur: '/brosur/polyglactin-910.pdf',
    tautanVideoDemo: '/video/polyglactin-teknik-jahit.mp4',
    pertanyaanTeknisUmum: [
      { pertanyaan: 'Status izin edar saat ini?', jawaban: 'Perpanjangan sedang berjalan — masa berlaku register habis 5 November 2026, distribusi diblokir sampai PJT melepas penahanan.' },
      { pertanyaan: 'Suhu penyimpanan?', jawaban: 'Ruang sejuk 15-25°C, jauh dari sinar matahari langsung.' }
    ]
  },
  {
    id: 'PKN-005',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    tipeModel: 'SonoEcho 90',
    kategori: 'Elektromedik Non Radiasi',
    nomorIzinEdar: 'KEMENKES RI AKL 21501710988',
    tanggalKedaluwarsaNie: '2029-02-01',
    produsen: 'SonoEcho Medical Systems (Prinsipal Resmi)',
    spesifikasiRingkas: '4D live, doppler warna & energi, 4 transduser (convex, linear, cardiac, endo), baterai 3 jam.',
    poinJual: ['Bobot 9 kg untuk rujukan lapangan', 'DICOM push ke RIS/PACS RS', 'Garansi resmi 12 bulan + kalibrasi pertama gratis'],
    tautanBrosur: '/brosur/sonoecho-90.pdf',
    tautanVideoDemo: '/video/sonoecho-90-doppler.mp4',
    pertanyaanTeknisUmum: [
      { pertanyaan: 'Apakah unit demo bisa dipinjam?', jawaban: 'Ya, maksimal 14 hari dengan berita acara serah terima dan deposit sesuai kebijakan Dirkom.' },
      { pertanyaan: 'Berapa biaya kalibrasi tahunan?', jawaban: 'Termasuk kontrak servis; di luar kontrak Rp 4,5 juta per unit per tahun.' }
    ]
  }
];

export const INITIAL_PRA_ORDER_MEDREP: PraOrderMedRep[] = [
  {
    id: 'PO-001',
    nomorPraOrder: 'PO-LAP/2026/11/0031',
    pelangganId: 'PLG-001',
    medRep: 'Rudi Hartono',
    tanggal: '2026-11-03',
    item: [
      { namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro', nomorBets: 'LOT-2024-PM44', jumlah: 6, hargaSatuan: 58500000 },
      { namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500', nomorBets: 'LOT-2024-SP12', jumlah: 4, hargaSatuan: 34000000 }
    ],
    statusPraOrder: 'Terkirim ke Gudang'
  },
  {
    id: 'PO-002',
    nomorPraOrder: 'PO-LAP/2026/11/0032',
    pelangganId: 'PLG-004',
    medRep: 'Maya Anggraini',
    tanggal: '2026-11-04',
    item: [
      { namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo', nomorBets: 'LOT-2024-DNG12', jumlah: 60, hargaSatuan: 1725000 }
    ],
    statusPraOrder: 'Draf'
  },
  {
    id: 'PO-003',
    nomorPraOrder: 'PO-LAP/2026/10/0028',
    pelangganId: 'PLG-007',
    medRep: 'Fajar Ramadhan',
    tanggal: '2026-10-29',
    item: [
      { namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500', nomorBets: 'LOT-2024-SP12', jumlah: 12, hargaSatuan: 33500000 }
    ],
    statusPraOrder: 'Konversi Sales Order'
  },
  {
    id: 'PO-004',
    nomorPraOrder: 'PO-LAP/2026/10/0026',
    pelangganId: 'PLG-003',
    medRep: 'Asep Nugraha',
    tanggal: '2026-10-22',
    item: [
      { namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable', nomorBets: 'LOT-2023-B884', jumlah: 30, hargaSatuan: 1250000 }
    ],
    statusPraOrder: 'Ditolak'
  }
];

export const INITIAL_SKEMA_HARGA: SkemaHargaAlkes[] = [
  {
    id: 'HRS-001',
    namaSkema: 'Harga Eceran Tertinggi Patient Monitor',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    level: 'Harga Eceran',
    pelangganTarget: 'Semua',
    hargaDasar: 62500000,
    potonganKuantitas: [
      { ambangMinUnit: 5, diskonPersen: 4 },
      { ambangMinUnit: 10, diskonPersen: 7 }
    ],
    bonusUnit: 0,
    status: 'Aktif'
  },
  {
    id: 'HRS-002',
    namaSkema: 'Harga Institusi RS Pemerintah (Kontrak Aktif)',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    level: 'Harga Institusi',
    pelangganTarget: 'PLG-001',
    hargaDasar: 58500000,
    potonganKuantitas: [
      { ambangMinUnit: 8, diskonPersen: 3 },
      { ambangMinUnit: 15, diskonPersen: 5 }
    ],
    bonusUnit: 1,
    status: 'Aktif'
  },
  {
    id: 'HRS-003',
    namaSkema: 'Harga Distributor Regional Syringe Pump',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    level: 'Harga Distributor',
    pelangganTarget: 'PLG-005',
    hargaDasar: 33000000,
    potonganKuantitas: [
      { ambangMinUnit: 10, diskonPersen: 5 },
      { ambangMinUnit: 25, diskonPersen: 9 }
    ],
    bonusUnit: 0,
    status: 'Aktif'
  },
  {
    id: 'HRS-004',
    namaSkema: 'Harga Borongan Reagen Dengue 12 Bulan',
    namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    level: 'Harga Institusi',
    pelangganTarget: 'PLG-004',
    hargaDasar: 1725000,
    potonganKuantitas: [
      { ambangMinUnit: 50, diskonPersen: 6 },
      { ambangMinUnit: 150, diskonPersen: 11 }
    ],
    bonusUnit: 10,
    status: 'Aktif'
  },
  {
    id: 'HRS-005',
    namaSkema: 'Harga Eceran USG Portabel SonoEcho 90',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    level: 'Harga Eceran',
    pelangganTarget: 'Semua',
    hargaDasar: 695000000,
    potonganKuantitas: [{ ambangMinUnit: 2, diskonPersen: 4 }],
    bonusUnit: 0,
    status: 'Non-aktif'
  }
];

export const INITIAL_UNIT_SERIAL: UnitSerialAlkes[] = [
  {
    id: 'SNS-001',
    nomorSerial: 'AMS-V12P-2406-0031',
    nomorBets: 'LOT-2024-PM44',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    pelangganId: 'PLG-001',
    nomorSalesOrder: 'SP-EKAT-2024-118',
    nomorInvoice: 'FTR/2024/05/0218',
    tanggalKirim: '2024-05-18',
    statusUnit: 'Terjual'
  },
  {
    id: 'SNS-002',
    nomorSerial: 'AMS-V12P-2406-0032',
    nomorBets: 'LOT-2024-PM44',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    pelangganId: 'PLG-001',
    nomorSalesOrder: 'SP-EKAT-2024-118',
    nomorInvoice: 'FTR/2024/05/0218',
    tanggalKirim: '2024-05-18',
    statusUnit: 'Terjual'
  },
  {
    id: 'SNS-003',
    nomorSerial: 'AMS-V12P-2610-0104',
    nomorBets: 'LOT-2024-PM44',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    pelangganId: 'PLG-002',
    nomorSalesOrder: 'SP-TENDER-2026-121',
    nomorInvoice: 'FTR/2026/10/0341',
    tanggalKirim: '2026-10-14',
    statusUnit: 'Terjual'
  },
  {
    id: 'SNS-004',
    nomorSerial: 'AMS-V12P-2610-0105',
    nomorBets: 'LOT-2024-PM44',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    pelangganId: 'PLG-002',
    nomorSalesOrder: 'SP-TENDER-2026-121',
    nomorInvoice: 'FTR/2026/10/0341',
    tanggalKirim: '2026-10-14',
    statusUnit: 'Dalam Perbaikan'
  },
  {
    id: 'SNS-005',
    nomorSerial: 'SONO90-2405-0007',
    nomorBets: 'LOT-2024-USG02',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    pelangganId: 'PLG-004',
    nomorSalesOrder: 'SP-RS-2026-124',
    nomorInvoice: 'FTR/2026/09/0308',
    tanggalKirim: '2026-09-28',
    statusUnit: 'Terjual'
  },
  {
    id: 'SNS-006',
    nomorSerial: 'SONO90-2405-0008',
    nomorBets: 'LOT-2024-USG02',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    pelangganId: 'PLG-004',
    nomorSalesOrder: 'BA-BAST/2026/11/007',
    nomorInvoice: '-',
    tanggalKirim: '2026-11-06',
    statusUnit: 'Unit Demo'
  },
  {
    id: 'SNS-007',
    nomorSerial: 'SONO90-2405-0009',
    nomorBets: 'LOT-2024-USG02',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    pelangganId: 'PLG-005',
    nomorSalesOrder: 'SP-EKAT-2024-119',
    nomorInvoice: 'FTR/2024/06/0233',
    tanggalKirim: '2024-06-02',
    statusUnit: 'Ditarik (Recall)'
  },
  {
    id: 'SNS-008',
    nomorSerial: 'AMS-SP500-2610-0512',
    nomorBets: 'LOT-2024-SP12',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    pelangganId: 'PLG-007',
    nomorSalesOrder: 'SP-TENDER-2026-125',
    nomorInvoice: 'FTR/2026/10/0359',
    tanggalKirim: '2026-10-30',
    statusUnit: 'Terjual'
  },
  {
    id: 'SNS-009',
    nomorSerial: 'AMS-SP500-2610-0513',
    nomorBets: 'LOT-2024-SP12',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    pelangganId: 'PLG-007',
    nomorSalesOrder: 'SP-TENDER-2026-125',
    nomorInvoice: 'FTR/2026/10/0359',
    tanggalKirim: '2026-10-30',
    statusUnit: 'Terjual'
  },
  {
    id: 'SNS-010',
    nomorSerial: 'AMS-SP500-2611-0520',
    nomorBets: 'LOT-2024-SP12',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    pelangganId: '-',
    nomorSalesOrder: '-',
    nomorInvoice: '-',
    tanggalKirim: '-',
    statusUnit: 'Di Gudang'
  }
];

export const INITIAL_GARANSI_INSTALASI: GaransiInstalasi[] = [
  {
    id: 'GRS-001',
    nomorSerial: 'AMS-V12P-2406-0031',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    pelangganId: 'PLG-001',
    tanggalInstalasi: '2024-05-25',
    teknisi: 'Bagus Setiawan, A.Md (Teknisi Elektromedik)',
    masaGaransiBulan: 12,
    jadwalPemeliharaanBerikutnya: '2026-11-30',
    catatan: 'Instalasi di ruang ICU lantai 2, kalibrasi NIBP selesai.'
  },
  {
    id: 'GRS-002',
    nomorSerial: 'AMS-V12P-2610-0104',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    pelangganId: 'PLG-002',
    tanggalInstalasi: '2026-10-20',
    teknisi: 'Nur Aini, S.T (Teknisi Elektromedik)',
    masaGaransiBulan: 12,
    jadwalPemeliharaanBerikutnya: '2027-04-20',
    catatan: 'Terhubung HL7 ke sistem RS Fatmawati, uji penerimaan 3 hari.'
  },
  {
    id: 'GRS-003',
    nomorSerial: 'SONO90-2405-0007',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    pelangganId: 'PLG-004',
    tanggalInstalasi: '2026-10-02',
    teknisi: 'Slamet Riyadi (Supervisor Servis Jawa Timur)',
    masaGaransiBulan: 24,
    jadwalPemeliharaanBerikutnya: '2027-04-02',
    catatan: 'Bonus kalibrasi 1 tahun dari kontrak TDR-004.'
  },
  {
    id: 'GRS-004',
    nomorSerial: 'AMS-SP500-2610-0512',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    pelangganId: 'PLG-007',
    tanggalInstalasi: '2026-11-02',
    teknisi: 'Fajar Ramadhan (MedRep) + Teknisi Regional Sumatera',
    masaGaransiBulan: 12,
    jadwalPemeliharaanBerikutnya: '2027-05-02',
    catatan: 'Uji gravimetri akurasi 2,1% — dalam toleransi ±5%.'
  },
  {
    id: 'GRS-005',
    nomorSerial: 'SONO90-2405-0009',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    pelangganId: 'PLG-005',
    tanggalInstalasi: '2024-06-10',
    teknisi: 'Nur Aini, S.T (Teknisi Elektromedik)',
    masaGaransiBulan: 12,
    jadwalPemeliharaanBerikutnya: '2026-12-01',
    catatan: 'Unit dalam pengawasan recall — Instalasi ditangguhkan.'
  }
];

export const INITIAL_KAMPANYE_ALKES: KampanyeAlkes[] = [
  {
    id: 'KMP-001',
    namaKegiatan: 'Simposium Perhimpunan Rumah Sakit Indonesia (PERSI) 2026',
    jenisKegiatan: 'Simposium',
    lokasi: 'Jakarta International Expo, Jakarta',
    tanggalMulai: '2026-08-12',
    tanggalSelesai: '2026-08-14',
    anggaran: 250000000,
    realisasiBiaya: 238000000,
    prospekDihasilkan: 18,
    nilaiKonversi: 615000000,
    penanggungJawab: 'Direktur Komersial',
    status: 'Selesai'
  },
  {
    id: 'KMP-002',
    namaKegiatan: 'Pameran Alkes Internasional CARE Indonesia 2026',
    jenisKegiatan: 'Pameran Internasional',
    lokasi: 'Surabaya International Expo, Jawa Timur',
    tanggalMulai: '2026-10-02',
    tanggalSelesai: '2026-10-05',
    anggaran: 420000000,
    realisasiBiaya: 468000000,
    prospekDihasilkan: 12,
    nilaiKonversi: 395000000,
    penanggungJawab: 'Manajer Pemasaran Produk',
    status: 'Selesai'
  },
  {
    id: 'KMP-003',
    namaKegiatan: 'Workshop Klinis Ventilasi & Monitoring ICU Regional Jawa',
    jenisKegiatan: 'Workshop Klinis',
    lokasi: 'Hotel Grand Aston, Semarang',
    tanggalMulai: '2026-11-18',
    tanggalSelesai: '2026-11-19',
    anggaran: 120000000,
    realisasiBiaya: 46000000,
    prospekDihasilkan: 5,
    nilaiKonversi: 0,
    penanggungJawab: 'Maya Anggraini (Supervisor Rayon Timur)',
    status: 'Berjalan'
  },
  {
    id: 'KMP-004',
    namaKegiatan: 'Edukasi Spesialis Diagnostik In Vitro Sumatera Utara',
    jenisKegiatan: 'Edukasi Spesialis',
    lokasi: 'Ballroom Hotel Santika, Medan',
    tanggalMulai: '2026-12-07',
    tanggalSelesai: '2026-12-07',
    anggaran: 95000000,
    realisasiBiaya: 0,
    prospekDihasilkan: 0,
    nilaiKonversi: 0,
    penanggungJawab: 'Fajar Ramadhan (MedRep Rayon Sumatera)',
    status: 'Rencana'
  },
  {
    id: 'KMP-005',
    namaKegiatan: 'Roadshow USG Portabel untuk Puskesmas Rujukan Jabar',
    jenisKegiatan: 'Simposium',
    lokasi: 'Bandung Convention Center, Jawa Barat',
    tanggalMulai: '2026-09-09',
    tanggalSelesai: '2026-09-10',
    anggaran: 150000000,
    realisasiBiaya: 132000000,
    prospekDihasilkan: 9,
    nilaiKonversi: 585000000,
    penanggungJawab: 'Asep Nugraha (Supervisor Rayon Jabar)',
    status: 'Selesai'
  }
];

export const INITIAL_UNIT_DEMO_ALKES: UnitDemoAlkes[] = [
  {
    id: 'DMO-001',
    nomorUnit: 'SONO90-2405-0008',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    nomorBets: 'LOT-2024-USG02',
    pelangganId: 'PLG-004',
    tanggalPinjam: '2026-11-06',
    tanggalHarusKembali: '2026-11-20',
    statusPinjam: 'Terpinjam',
    penanggungJawab: 'Maya Anggraini',
    nomorBeritaAcara: 'BA-BAST/2026/11/007'
  },
  {
    id: 'DMO-002',
    nomorUnit: 'AMS-V12P-2609-0098',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nomorBets: 'LOT-2024-PM44',
    pelangganId: 'PLG-001',
    tanggalPinjam: '2026-09-15',
    tanggalHarusKembali: '2026-09-29',
    statusPinjam: 'Konversi Jadi Penjualan',
    penanggungJawab: 'Rudi Hartono',
    nomorBeritaAcara: 'BA-BAST/2026/09/061'
  },
  {
    id: 'DMO-003',
    nomorUnit: 'AMS-SP500-2607-0455',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorBets: 'LOT-2024-SP12',
    pelangganId: 'PLG-003',
    tanggalPinjam: '2026-10-12',
    tanggalHarusKembali: '2026-10-26',
    statusPinjam: 'Terpinjam',
    penanggungJawab: 'Asep Nugraha',
    nomorBeritaAcara: 'BA-BAST/2026/10/074'
  },
  {
    id: 'DMO-004',
    nomorUnit: 'DENGUE-DEMO-KIT-014',
    namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
    nomorBets: 'LOT-2024-DNG12',
    pelangganId: 'PLG-007',
    tanggalPinjam: '2026-10-20',
    tanggalHarusKembali: '2026-10-30',
    statusPinjam: 'Dikembalikan',
    penanggungJawab: 'Fajar Ramadhan',
    nomorBeritaAcara: 'BA-BAST/2026/10/088'
  },
  {
    id: 'DMO-005',
    nomorUnit: 'SONO90-2404-0003',
    namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90',
    nomorBets: 'LOT-2024-USG01',
    pelangganId: 'PLG-005',
    tanggalPinjam: '2026-07-08',
    tanggalHarusKembali: '2026-07-22',
    statusPinjam: 'Hilang',
    penanggungJawab: 'Asep Nugraha',
    nomorBeritaAcara: 'BA-BAST/2026/07/029'
  }
];

export const INITIAL_PROGRAM_REBATE: ProgramRebate[] = [
  {
    id: 'REB-001',
    namaProgram: 'Loyalty Volume RS Pemerintah Semester II 2026',
    mitraId: 'PLG-002',
    periode: '2026-07 s.d. 2026-12',
    targetVolumeUnit: 40,
    realisasiVolumeUnit: 46,
    persenRebate: 2.5,
    nilaiTransaksiPeriode: 1840000000,
    statusPembayaran: 'Terverifikasi'
  },
  {
    id: 'REB-002',
    namaProgram: 'Rebate Distributor Regional Sumatera',
    mitraId: 'PLG-007',
    periode: '2026-01 s.d. 2026-12',
    targetVolumeUnit: 220,
    realisasiVolumeUnit: 168,
    persenRebate: 3,
    nilaiTransaksiPeriode: 980000000,
    statusPembayaran: 'Belum Jatuh Tempo'
  },
  {
    id: 'REB-003',
    namaProgram: 'Bonus Akhir Tahun Jaringan Klinik Jabar',
    mitraId: 'PLG-003',
    periode: '2026-01 s.d. 2026-12',
    targetVolumeUnit: 120,
    realisasiVolumeUnit: 118,
    persenRebate: 1.5,
    nilaiTransaksiPeriode: 295000000,
    statusPembayaran: 'Belum Jatuh Tempo'
  },
  {
    id: 'REB-004',
    namaProgram: 'Program Konsumsi Reagen Dengue RS Swasta Jatim',
    mitraId: 'PLG-004',
    periode: '2026-04 s.d. 2026-10',
    targetVolumeUnit: 400,
    realisasiVolumeUnit: 512,
    persenRebate: 4,
    nilaiTransaksiPeriode: 883200000,
    statusPembayaran: 'Terbayar'
  }
];

export const INITIAL_RIWAYAT_PENJUALAN_BULANAN: RiwayatPenjualanBulanan[] = [
  // Patient Monitor — tren naik, stok memadai (Aman)
  { id: 'RPM-2026-05', namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jabodetabek', bulan: '2026-05', unitTerjual: 6, nilaiPenjualan: 369000000 },
  { id: 'RPM-2026-06', namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jabodetabek', bulan: '2026-06', unitTerjual: 5, nilaiPenjualan: 311000000 },
  { id: 'RPM-2026-07', namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jabodetabek', bulan: '2026-07', unitTerjual: 7, nilaiPenjualan: 432000000 },
  { id: 'RPM-2026-08', namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jabodetabek', bulan: '2026-08', unitTerjual: 9, nilaiPenjualan: 558000000 },
  { id: 'RPM-2026-09', namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jabodetabek', bulan: '2026-09', unitTerjual: 10, nilaiPenjualan: 621000000 },
  { id: 'RPM-2026-10', namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jabodetabek', bulan: '2026-10', unitTerjual: 12, nilaiPenjualan: 744000000 },
  // Syringe Pump — tren turun, stok menumpuk (Risiko Overstock)
  { id: 'RSP-2026-05', namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jawa Barat', bulan: '2026-05', unitTerjual: 4, nilaiPenjualan: 132000000 },
  { id: 'RSP-2026-06', namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jawa Barat', bulan: '2026-06', unitTerjual: 4, nilaiPenjualan: 134000000 },
  { id: 'RSP-2026-07', namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jawa Barat', bulan: '2026-07', unitTerjual: 5, nilaiPenjualan: 166000000 },
  { id: 'RSP-2026-08', namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jawa Barat', bulan: '2026-08', unitTerjual: 3, nilaiPenjualan: 99000000 },
  { id: 'RSP-2026-09', namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jawa Barat', bulan: '2026-09', unitTerjual: 3, nilaiPenjualan: 100000000 },
  { id: 'RSP-2026-10', namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jawa Barat', bulan: '2026-10', unitTerjual: 2, nilaiPenjualan: 67000000 },
  // Reagen Dengue — musiman, stok dingin memadai (Aman)
  { id: 'RDG-2026-05', namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo', kategoriProduk: 'Diagnostik In Vitro', rayonDistribusi: 'Rayon Jawa Timur & Bali', bulan: '2026-05', unitTerjual: 40, nilaiPenjualan: 69000000 },
  { id: 'RDG-2026-06', namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo', kategoriProduk: 'Diagnostik In Vitro', rayonDistribusi: 'Rayon Jawa Timur & Bali', bulan: '2026-06', unitTerjual: 55, nilaiPenjualan: 94875000 },
  { id: 'RDG-2026-07', namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo', kategoriProduk: 'Diagnostik In Vitro', rayonDistribusi: 'Rayon Jawa Timur & Bali', bulan: '2026-07', unitTerjual: 30, nilaiPenjualan: 51750000 },
  { id: 'RDG-2026-08', namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo', kategoriProduk: 'Diagnostik In Vitro', rayonDistribusi: 'Rayon Jawa Timur & Bali', bulan: '2026-08', unitTerjual: 60, nilaiPenjualan: 103500000 },
  { id: 'RDG-2026-09', namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo', kategoriProduk: 'Diagnostik In Vitro', rayonDistribusi: 'Rayon Jawa Timur & Bali', bulan: '2026-09', unitTerjual: 75, nilaiPenjualan: 129375000 },
  { id: 'RDG-2026-10', namaAlkes: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo', kategoriProduk: 'Diagnostik In Vitro', rayonDistribusi: 'Rayon Jawa Timur & Bali', bulan: '2026-10', unitTerjual: 90, nilaiPenjualan: 155250000 },
  // Benang Bedah — NIE habis masa, stok menuh (Risiko Overstock)
  { id: 'RBH-2026-05', namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable', kategoriProduk: 'Non Elektromedik Steril', rayonDistribusi: 'Rayon Sumatera', bulan: '2026-05', unitTerjual: 12, nilaiPenjualan: 15000000 },
  { id: 'RBH-2026-06', namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable', kategoriProduk: 'Non Elektromedik Steril', rayonDistribusi: 'Rayon Sumatera', bulan: '2026-06', unitTerjual: 10, nilaiPenjualan: 12500000 },
  { id: 'RBH-2026-07', namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable', kategoriProduk: 'Non Elektromedik Steril', rayonDistribusi: 'Rayon Sumatera', bulan: '2026-07', unitTerjual: 14, nilaiPenjualan: 17500000 },
  { id: 'RBH-2026-08', namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable', kategoriProduk: 'Non Elektromedik Steril', rayonDistribusi: 'Rayon Sumatera', bulan: '2026-08', unitTerjual: 8, nilaiPenjualan: 10000000 },
  { id: 'RBH-2026-09', namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable', kategoriProduk: 'Non Elektromedik Steril', rayonDistribusi: 'Rayon Sumatera', bulan: '2026-09', unitTerjual: 6, nilaiPenjualan: 7500000 },
  { id: 'RBH-2026-10', namaAlkes: 'Benang Bedah Polyglactin 910 Braided Absorbable', kategoriProduk: 'Non Elektromedik Steril', rayonDistribusi: 'Rayon Sumatera', bulan: '2026-10', unitTerjual: 5, nilaiPenjualan: 6250000 },
  // USG Portabel — lonjakan tajam, stok tinggal 8 (Risiko Stockout)
  { id: 'RUS-2026-05', namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jawa Barat', bulan: '2026-05', unitTerjual: 2, nilaiPenjualan: 1390000000 },
  { id: 'RUS-2026-06', namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jawa Barat', bulan: '2026-06', unitTerjual: 3, nilaiPenjualan: 2085000000 },
  { id: 'RUS-2026-07', namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jawa Barat', bulan: '2026-07', unitTerjual: 4, nilaiPenjualan: 2780000000 },
  { id: 'RUS-2026-08', namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jawa Timur & Bali', bulan: '2026-08', unitTerjual: 5, nilaiPenjualan: 3475000000 },
  { id: 'RUS-2026-09', namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Sumatera', bulan: '2026-09', unitTerjual: 6, nilaiPenjualan: 4170000000 },
  { id: 'RUS-2026-10', namaAlkes: 'Mesin USG Color Doppler 4D Portabel SonoEcho 90', kategoriProduk: 'Elektromedik Non Radiasi', rayonDistribusi: 'Rayon Jawa Barat', bulan: '2026-10', unitTerjual: 7, nilaiPenjualan: 4865000000 }
];

// ==================== NEWSLETTER & MAILING LIST (mesin: listmonk) ====================
// Data uji dibuat konsisten dengan master CRM (PelangganB2B) dan kegiatan
// KampanyeAlkes: nomor penerima, rayon, dan spesialisasi diambil dari record yang sama
// agar segmentasi dan target kirim dapat diverifikasi silang.

export const INITIAL_DAFTAR_SURAT: DaftarSurat[] = [
  {
    id: 'LST-01',
    nama: 'Dokter & Spesialis Alkes',
    tipe: 'Public',
    optin: 'double',
    status: 'confirmed',
    tag: ['spesialis', 'klinik'],
    templatDefaultId: 'TPL-01',
    keterangan: 'Halaman langganan publik /subscription/{uuid} dibuka di situs remediams.com. Opt-in ganda wajib karena pendaftar dari luar.'
  },
  {
    id: 'LST-02',
    nama: 'Pengadaan & IPSRS Fasyankes',
    tipe: 'Private',
    optin: 'single',
    status: 'confirmed',
    tag: ['pengadaan', 'lkpp'],
    templatDefaultId: 'TPL-01',
    keterangan: 'Pejabat pengadaan/kabag yang tercatat pada master pelanggan B2B. Dikirim informasi NIE, e-katalog, dan jadwal tender.'
  },
  {
    id: 'LST-03',
    nama: 'Mitra Distributor & Reseller',
    tipe: 'Group',
    optin: 'single',
    status: 'confirmed',
    tag: ['distributor'],
    templatDefaultId: 'TPL-01',
    keterangan: 'Grup logistik bersama (bisa lebih dari satu orang) untuk nota kredit, rebate, dan stok FEFO.'
  },
  {
    id: 'LST-04',
    nama: 'Alumni Simposium & Pameran 2026',
    tipe: 'Group',
    optin: 'single',
    status: 'confirmed',
    tag: ['simposium', 'edukasi'],
    templatDefaultId: 'TPL-01',
    keterangan: 'Peserta kegiatan promosi (KampanyeAlkes) yang menyetujui materi lanjutan. Sumber lead tercatat pada kolom atribut.'
  },
  {
    id: 'LST-05',
    nama: 'Buletin Umum REMEDI',
    tipe: 'Public',
    optin: 'double',
    status: 'unconfirmed',
    tag: ['umum'],
    templatDefaultId: 'TPL-01',
    keterangan: 'Owner belum menekan "Confirm subscription" pada halaman Public lists, sehingga daftar ini belum boleh dipakai mengirim.'
  },
  {
    id: 'LST-06',
    nama: 'Media, Asosiasi & Instansi Pemerintahan',
    tipe: 'Private',
    optin: 'single',
    status: 'confirmed',
    tag: ['media', 'asosiasi'],
    templatDefaultId: 'TPL-01',
    keterangan: 'Siaran pers dan undangan kegiatan untuk IDI, PERSI, dan dinas kesehatan.'
  }
];

export const INITIAL_PELANGGAN_SURAT: PelangganSurat[] = [
  // --- LST-01 Dokter & Spesialis (Public, double opt-in) ---
  { id: 'SUB-001', uuid: 'a1c0x1', surel: 'anwar.fadillah@rsudpasarminggu.go.id', nama: 'dr. Anwar Fadillah, Sp.An', status: 'Enabled', daftarIds: ['LST-01', 'LST-04'], atribut: { spesialisasi: 'Anestesiologi & Terapi Intensif', rayon: 'Rayon Jabodetabek', provinsi: 'DKI Jakarta', fasyankes: 'RSUD Pasar Minggu Jakarta Selatan' }, sumber: 'Double opt-in', tanggalBerlangganan: '2026-01-18', bounceBeruntun: 0, catatan: 'Konfirmasi opt-in 8 menit setelah pendaftaran.' },
  { id: 'SUB-002', uuid: 'a1c0x2', surel: 'rina.kartika@rsupfatmawati.go.id', nama: 'dr. Rina Kartika, Sp.RM', status: 'Enabled', daftarIds: ['LST-01'], atribut: { spesialisasi: 'Rekam Medis & Informatika Kesehatan', rayon: 'Rayon Jabodetabek', provinsi: 'DKI Jakarta', fasyankes: 'RSUP Fatmawati Jakarta' }, sumber: 'Public list', tanggalBerlangganan: '2026-02-02', bounceBeruntun: 0, catatan: 'Peminat modul integrasi SIMRS.' },
  { id: 'SUB-003', uuid: 'a1c0x3', surel: 'teguh.prasetyo@kliniksehatparipurna.co.id', nama: 'dr. Teguh Prasetyo, Sp.PK', status: 'Enabled', daftarIds: ['LST-01', 'LST-04'], atribut: { spesialisasi: 'Patologi Klinik', rayon: 'Rayon Jawa Barat', provinsi: 'Jawa Barat', fasyankes: 'Klinik Utama Sehat Paripurna Bandung' }, sumber: 'Double opt-in', tanggalBerlangganan: '2026-03-11', bounceBeruntun: 0, catatan: '' },
  { id: 'SUB-004', uuid: 'a1c0x4', surel: 'prakash.nanda@rsharapanbunda.co.id', nama: 'dr. Prakash Nanda, Sp.Rad', status: 'Enabled', daftarIds: ['LST-01'], atribut: { spesialisasi: 'Radiologi', rayon: 'Rayon Jawa Timur & Bali', provinsi: 'Jawa Timur', fasyankes: 'RS Harapan Bunda Surabaya' }, sumber: 'Double opt-in', tanggalBerlangganan: '2026-04-06', bounceBeruntun: 0, catatan: 'Menunggu materi kalibrasi radiologi.' },
  { id: 'SUB-005', uuid: 'a1c0x5', surel: 'lestari.wulandari@dinkesbogor.go.id', nama: 'dr. Lestari Wulandari, M.Kes', status: 'Enabled', daftarIds: ['LST-01', 'LST-06'], atribut: { spesialisasi: 'Kesehatan Masyarakat', rayon: 'Rayon Jawa Barat', provinsi: 'Jawa Barat', fasyankes: 'Dinas Kesehatan Kabupaten Bogor' }, sumber: 'Public list', tanggalBerlangganan: '2026-05-19', bounceBeruntun: 0, catatan: '' },
  { id: 'SUB-006', uuid: 'a1c0x6', surel: 'yuniar.putri@medilab.co.id', nama: 'dr. Yuniar Putri, Sp.PK', status: 'Enabled', daftarIds: ['LST-01', 'LST-04'], atribut: { spesialisasi: 'Patologi Klinik', rayon: 'Rayon Sumatera', provinsi: 'Sumatera Utara', fasyankes: 'Laboratorium Klinis Medilab Medan' }, sumber: 'Double opt-in', tanggalBerlangganan: '2026-06-01', bounceBeruntun: 0, catatan: '' },
  { id: 'SUB-007', uuid: 'a1c0x7', surel: 'cut.rahmawati@rsudzainoelabidin.go.id', nama: 'dr. Cut Rahmawati, Sp.B', status: 'Enabled', daftarIds: ['LST-01'], atribut: { spesialisasi: 'Bedah Umum', rayon: 'Rayon Sumatera', provinsi: 'Aceh', fasyankes: 'RSUD Zainoel Abidin Banda Aceh' }, sumber: 'Public list', tanggalBerlangganan: '2026-06-22', bounceBeruntun: 0, catatan: 'Peminat benang bedah absorbable.' },
  { id: 'SUB-008', uuid: 'a1c0x8', surel: 'kardiologi@klinikcardiomedyka.co.id', nama: 'dr. Haviz Alfarizi, Sp.JP', status: 'Imported', daftarIds: ['LST-01'], atribut: { spesialisasi: 'Kardiologi', rayon: 'Rayon Jawa Tengah & DIY', provinsi: 'DI Yogyakarta', fasyankes: 'Klinik Cardiomedyka Yogyakarta' }, sumber: 'Impor CSV', tanggalBerlangganan: '2026-08-19', bounceBeruntun: 0, catatan: 'Diimpor sebelum ambang pindahan 2026-09-01, sehingga tidak dihitung pada statistik maupun target kiriman.' },
  { id: 'SUB-009', uuid: 'a1c0x9', surel: 'budiman.hartono@klinikanestesiprima.co.id', nama: 'dr. Budiman Hartono, Sp.An', status: 'Unsubscribed', daftarIds: ['LST-01'], atribut: { spesialisasi: 'Anestesiologi & Terapi Intensif', rayon: 'Rayon Jabodetabek', provinsi: 'DKI Jakarta', fasyankes: 'Klinik Anestesi Prima Jakarta' }, sumber: 'Double opt-in', tanggalBerlangganan: '2026-01-30', bounceBeruntun: 0, catatan: 'Berhenti lewat tautan one-click { unique_id } pada 2026-08-14; riwayat keanggotaan daftar tetap disimpan.' },
  { id: 'SUB-010', uuid: 'a1c0x10', surel: 'noname@domain-tidak-valid.or.id', nama: '(tanpa nama)', status: 'Blocked', daftarIds: ['LST-01'], atribut: { spesialisasi: '-', rayon: 'Rayon Jawa Timur & Bali', provinsi: 'Jawa Timur', fasyankes: '-' }, sumber: 'Impor CSV', tanggalBerlangganan: '2026-02-14', bounceBeruntun: 3, catatan: 'Diblokir otomatis: 3 bounce keras beruntun melewati ambang 3 (hard bounce "user unknown").' },

  // --- LST-02 Pengadaan & IPSRS (Private) ---
  { id: 'SUB-011', uuid: 'a1c0x11', surel: 'hesti.wardani@rsudpasarminggu.go.id', nama: 'Dra. Hesti Wardani', status: 'Enabled', daftarIds: ['LST-02', 'LST-04'], atribut: { jabatan: 'Kabag Pengadaan', rayon: 'Rayon Jabodetabek', provinsi: 'DKI Jakarta', fasyankes: 'RSUD Pasar Minggu Jakarta Selatan' }, sumber: 'API / CRM', tanggalBerlangganan: '2026-01-12', bounceBeruntun: 0, catatan: 'Sinkron dari master pelanggan PLG-2026-001.' },
  { id: 'SUB-012', uuid: 'a1c0x12', surel: 'bambang.sutoyo@rsupfatmawati.go.id', nama: 'Ir. Bambang Sutoyo', status: 'Enabled', daftarIds: ['LST-02'], atribut: { jabatan: 'Pejabat Pengadaan', rayon: 'Rayon Jabodetabek', provinsi: 'DKI Jakarta', fasyankes: 'RSUP Fatmawati Jakarta' }, sumber: 'API / CRM', tanggalBerlangganan: '2026-01-15', bounceBeruntun: 0, catatan: '' },
  { id: 'SUB-013', uuid: 'a1c0x13', surel: 'henny.puspita@kliniksehatparipurna.co.id', nama: 'Henny Puspita, A.Md.Kes', status: 'Enabled', daftarIds: ['LST-02', 'LST-03'], atribut: { jabatan: 'Manajer Operasional', rayon: 'Rayon Jawa Barat', provinsi: 'Jawa Barat', fasyankes: 'Klinik Utama Sehat Paripurna Bandung' }, sumber: 'API / CRM', tanggalBerlangganan: '2026-02-20', bounceBeruntun: 0, catatan: '' },
  { id: 'SUB-014', uuid: 'a1c0x14', surel: 'lilik.sumarni@rsharapanbunda.co.id', nama: 'Lilik Sumarni, S.Kep', status: 'Enabled', daftarIds: ['LST-02'], atribut: { jabatan: 'Kepala Pengadaan', rayon: 'Rayon Jawa Timur & Bali', provinsi: 'Jawa Timur', fasyankes: 'RS Harapan Bunda Surabaya' }, sumber: 'API / CRM', tanggalBerlangganan: '2026-03-04', bounceBeruntun: 0, catatan: '' },
  { id: 'SUB-015', uuid: 'a1c0x15', surel: 'yaya.sunarya@dinkesbogor.go.id', nama: 'Drs. Yaya Sunarya', status: 'Enabled', daftarIds: ['LST-02', 'LST-06'], atribut: { jabatan: 'Pejabat Pembuat Komitmen', rayon: 'Rayon Jawa Barat', provinsi: 'Jawa Barat', fasyankes: 'Dinas Kesehatan Kabupaten Bogor' }, sumber: 'API / CRM', tanggalBerlangganan: '2026-03-26', bounceBeruntun: 0, catatan: 'Penerima notifikasi jadwal tender/LPSE.' },
  { id: 'SUB-016', uuid: 'a1c0x16', surel: 'rizal.ananda@medilab.co.id', nama: 'Rizal Ananda, A.Md.AK', status: 'Enabled', daftarIds: ['LST-02'], atribut: { jabatan: 'Kepala Laboratorium', rayon: 'Rayon Sumatera', provinsi: 'Sumatera Utara', fasyankes: 'Laboratorium Klinis Medilab Medan' }, sumber: 'API / CRM', tanggalBerlangganan: '2026-04-18', bounceBeruntun: 0, catatan: '' },
  { id: 'SUB-017', uuid: 'a1c0x17', surel: 'mukhlis@rsudzainoelabidin.go.id', nama: 'Mukhlis, S.KM', status: 'Enabled', daftarIds: ['LST-02', 'LST-04'], atribut: { jabatan: 'Kabag Umum & Pengadaan', rayon: 'Rayon Sumatera', provinsi: 'Aceh', fasyankes: 'RSUD Zainoel Abidin Banda Aceh' }, sumber: 'API / CRM', tanggalBerlangganan: '2026-05-08', bounceBeruntun: 0, catatan: '' },
  { id: 'SUB-018', uuid: 'a1c0x18', surel: 'fitria.sari@kimiasentosa.co.id', nama: 'Fitria Sari, S.Farm., Apt', status: 'Enabled', daftarIds: ['LST-02', 'LST-03'], atribut: { jabatan: 'Apoteker Penanggung Jawab', rayon: 'Rayon Jawa Tengah & DIY', provinsi: 'Jawa Tengah', fasyankes: 'Apotek Kimia Sentosa Semarang' }, sumber: 'API / CRM', tanggalBerlangganan: '2026-05-30', bounceBeruntun: 0, catatan: '' },
  { id: 'SUB-019', uuid: 'a1c0x19', surel: 'pengadaan.iprs@rsudserang.go.id', nama: 'Kabag Pengadaan & IPSRS RSUD Serang', status: 'Enabled', daftarIds: ['LST-02'], atribut: { jabatan: 'Pengadaan / IPSRS', rayon: 'Rayon Jawa Barat', provinsi: 'Banten', fasyankes: 'RSUD Serang' }, sumber: 'Entri manual', tanggalBerlangganan: '2026-07-07', bounceBeruntun: 0, catatan: 'Satu alamat dipakai beberapa pejabat (model Group listmonk tidak berlaku di sini — cukup satu baris subscribers).' },

  // --- LST-03 Mitra distributor (Group) ---
  { id: 'SUB-020', uuid: 'a1c0x20', surel: 'purchasing@mitraalkesumara.co.id', nama: 'Bagian Pengadaan PT Mitra Alkes Sumatra', status: 'Enabled', daftarIds: ['LST-03'], atribut: { role: 'distributor', rayon: 'Rayon Sumatera' }, sumber: 'Entri manual', tanggalBerlangganan: '2026-02-09', bounceBeruntun: 0, catatan: 'Penerima nota kredit rebate dan pengumuman stok FEFO.' },
  { id: 'SUB-021', uuid: 'a1c0x21', surel: 'reseller@alkestiaraprima.co.id', nama: 'Sri Wahyuni (PT Alkes Tiara Prima)', status: 'Unsubscribed', daftarIds: ['LST-03'], atribut: { role: 'reseller', rayon: 'Rayon Jawa Barat' }, sumber: 'Impor CSV', tanggalBerlangganan: '2026-04-25', bounceBeruntun: 0, catatan: 'Berhenti setelah perpindahan domain email; alamat lama masih tersisa pada daftar impor.' },
  { id: 'SUB-022', uuid: 'a1c0x22', surel: 'logistik@sehatmakmurjabodetabek.co.id', nama: 'Andri Firmansyah (PT Sehat Makmur)', status: 'Enabled', daftarIds: ['LST-03', 'LST-04'], atribut: { role: 'distributor', rayon: 'Rayon Jabodetabek' }, sumber: 'API / CRM', tanggalBerlangganan: '2026-06-11', bounceBeruntun: 0, catatan: '' },

  // --- LST-06 Media & asosiasi (Private) ---
  { id: 'SUB-023', uuid: 'a1c0x23', surel: 'redaksi@journalkesehatanindo.co.id', nama: 'Redaksi Jurnal Kesehatan Indonesia', status: 'Enabled', daftarIds: ['LST-06'], atribut: { role: 'media', rayon: 'Nasional' }, sumber: 'Entri manual', tanggalBerlangganan: '2026-03-16', bounceBeruntun: 0, catatan: 'Siaran pers produk baru dan capaian CPKB.' },
  { id: 'SUB-024', uuid: 'a1c0x24', surel: 'humas@persi-asosiasi.go.id', nama: 'Hubungan Masyarakat PERSI', status: 'Enabled', daftarIds: ['LST-06'], atribut: { role: 'asosiasi', rayon: 'Nasional' }, sumber: 'Entri manual', tanggalBerlangganan: '2026-05-02', bounceBeruntun: 0, catatan: '' },
  { id: 'SUB-025', uuid: 'a1c0x25', surel: 'info@idi-wilayah.go.id', nama: 'IDI Wilayah (kotak surel bersama)', status: 'Blocked', daftarIds: ['LST-06'], atribut: { role: 'asosiasi', rayon: 'Nasional' }, sumber: 'Impor CSV', tanggalBerlangganan: '2026-01-22', bounceBeruntun: 4, catatan: 'Diblokir otomatis setelah 4 bounce beruntun; perlu pembersihan kotak masuk sebelum diaktifkan lagi.' },
  { id: 'SUB-026', uuid: 'a1c0x26', surel: 'kepegawaian@dinkesbogor.go.id', nama: 'Subbag Kepegawaian Dinkes Kab. Bogor', status: 'Imported', daftarIds: ['LST-06'], atribut: { role: 'pemerintahan', rayon: 'Rayon Jawa Barat' }, sumber: 'Impor CSV', tanggalBerlangganan: '2026-10-30', bounceBeruntun: 0, catatan: 'Berstatus Imported: dihitung pada target kiriman berikutnya, tetapi tidak dihitung pada statistik kiriman yang sudah lewat.' }
];

export const INITIAL_TEMPLAT_SURAT: TemplatSurat[] = [
  {
    id: 'TPL-01',
    nama: 'Buletin REMEDI Standar',
    tipe: 'campaign',
    bodyHtml: `{{ template "header" . }}
<div class="row"><div class="columns">
  <h3>{{ .Campaign.Subject }}</h3>
  <p>Halo {{ .Subscriber.Name }}, berikut informasi dari {{ .Site.Name }}.</p>
  {{ WrapText .Content }}
  <p class="footer">
    <a href="{{ TrackLink "https://www.remediams.com" }}">{{ L "Kunjungi situs kami" }}</a> &middot;
    <a href="{{ UnsubscribeURL }}">{{ L "Berhenti langganan" }}</a>
  </p>
  <p>{{ L "Sent to" }} {{ .Subscriber.Email }} &mdash; {{ .List.Name }}</p>
</div></div>
{{ template "footer" . }}`,
    isActive: true,
    catatan: 'WrapText wajib pada mime multipart/alternative agar bagian teks murni dibuat. TrackLink mencatat klik pada link tracking; {{ template "content" . }} hanya boleh muncul satu kali.'
  },
  {
    id: 'TPL-02',
    nama: 'Konfirmasi Opt-in Ganda',
    tipe: 'optin',
    bodyHtml: `{{ template "header" . }}
<p>Benarkah Anda berlangganan {{ .List.Name }} dari {{ .Site.Name }}?</p>
<a href="{{ OptinURL }}">{{ L "Konfirmasi langganan" }}</a>
<a href="{{ ManageURL }}">{{ L "Lihat daftar & ubah pilihan" }}</a>
{{ template "footer" . }}`,
    isActive: true,
    catatan: 'Dipakai kampanye bertipe optin. Tanpa konfirmasi, langganan tetap unconfirmed dan tidak menerima buletin.'
  },
  {
    id: 'TPL-03',
    nama: 'Notifikasi Transaksional (invoice & recall)',
    tipe: 'tx',
    bodyHtml: `<p>Yth. {{ .Subscriber.Name }},</p>
{{ WrapText .Content }}
<p><a href="{{ MessageURL }}">{{ L "Unsubscribe" }}</a> &mdash; {{ .Subscriber.UUID }}</p>`,
    isActive: true,
    catatan: 'Dipakai pada panel Transactional messages (POST /api/message-email). Subject dan headers ikut dirender, dan {{ .Row }} tersedia pada pratinjau massal.'
  },
  {
    id: 'TPL-04',
    nama: 'Halaman Langganan Publik',
    tipe: 'public-list',
    bodyHtml: `<form method="post">
  <input type="email" name="email" required />
  <input type="text" name="name" />
  <button>{{ L "Subscribe" }}</button>
</form>`,
    isActive: true,
    catatan: 'Template halaman /subscription/{uuid} untuk daftar bertipe Public. Formulir tidak menerima kredensial apa pun.'
  }
];

export const INITIAL_MEDIA_SURAT: MediaSurat[] = [
  { id: 'MED-01', namaFile: 'medical-2a.jpg', tipeMime: 'image/jpeg', ukuranKB: 184, url: '/site/medical-2a.jpg', diunggahPada: '2026-02-11', penanggungJawab: 'Koordinator Pemasaran' },
  { id: 'MED-02', namaFile: 'remedi-mask.jpg', tipeMime: 'image/jpeg', ukuranKB: 96, url: '/site/remedi-mask.jpg', diunggahPada: '2026-03-04', penanggungJawab: 'Koordinator Pemasaran' },
  { id: 'MED-03', namaFile: 'iris-scissor.jpg', tipeMime: 'image/jpeg', ukuranKB: 112, url: '/site/iris-scissor.jpg', diunggahPada: '2026-04-22', penanggungJawab: 'Koordinator Pemasaran' },
  { id: 'MED-04', namaFile: 'sino-sn-1500h.jpg', tipeMime: 'image/jpeg', ukuranKB: 143, url: '/site/sino-sn-1500h.jpg', diunggahPada: '2026-06-08', penanggungJawab: 'Manajer Pemasaran' },
  { id: 'MED-05', namaFile: 'company-profile-ams-thumb.jpg', tipeMime: 'image/jpeg', ukuranKB: 78, url: '/site/company-profile-ams-thumb.jpg', diunggahPada: '2026-07-19', penanggungJawab: 'Manajer Pemasaran' },
  { id: 'MED-06', namaFile: 'logo-remedi-new-bw.png', tipeMime: 'image/png', ukuranKB: 24, url: '/site/logo-remedi-new-bw.png', diunggahPada: '2026-01-30', penanggungJawab: 'Manajer Pemasaran' }
];

export const INITIAL_KAMPANYE_SURAT: KampanyeSurat[] = [
  {
    id: 'KMP-01',
    nomorKampanye: 'NEWS-2026-014',
    nama: 'Buletin Q1 — Update NIE & e-katalog LKPP',
    subjek: '[REMEDI] Pembaruan izin edar Q1 dan jadwal tayang e-katalog',
    dariNama: 'REMEDI AMS',
    dariSurel: 'bulletin@remediams.com',
    tipe: 'regular',
    mime: 'multipart/alternative',
    daftarIds: ['LST-01', 'LST-02'],
    templatId: 'TPL-01',
    status: 'finished',
    jadwalKirim: '2026-03-18',
    jadwalSelesai: '',
    targetTotal: 16,
    terkirim: 16,
    dibukaTotal: 23,
    dibukaUnik: 14,
    klikTotal: 11,
    klikUnik: 9,
    bounce: 1,
    keluhan: 0,
    berhentiLangganan: 1,
    lajuPerDetik: 12,
    tautan: [
      { url: 'https://www.remediams.com/produk', klikTotal: 7, klikUnik: 6 },
      { url: 'https://www.remediams.com/kontak', klikTotal: 4, klikUnik: 3 }
    ],
    penanggungJawab: 'Manajer Pemasaran',
    catatan: 'Materi sudah divalidasi PJT (etika promosi) dan mencantumkan NIE pada setiap produk.'
  },
  {
    id: 'KMP-02',
    nomorKampanye: 'NEWS-2026-021',
    nama: 'Alert Penarikan Produk — Masker Bedah Lot 2026-B',
    subjek: 'PENTING: penarikan sukarela masker bedah lot 2026-B',
    dariNama: 'REMEDI AMS',
    dariSurel: 'bulletin@remediams.com',
    tipe: 'regular',
    mime: 'text/html',
    daftarIds: ['LST-02', 'LST-03'],
    templatId: 'TPL-01',
    status: 'finished',
    jadwalKirim: '2026-06-27',
    jadwalSelesai: '',
    targetTotal: 13,
    terkirim: 13,
    dibukaTotal: 21,
    dibukaUnik: 12,
    klikTotal: 15,
    klikUnik: 11,
    bounce: 0,
    keluhan: 0,
    berhentiLangganan: 0,
    lajuPerDetik: 8,
    tautan: [{ url: 'https://www.remediams.com/sumber-daya', klikTotal: 15, klikUnik: 11 }],
    penanggungJawab: 'Penanggung Jawab (PJT)',
    catatan: 'Komunikasi keamanan produk (post-market vigilance), bukan promosi; tembusan tercatat pada register Recall.'
  },
  {
    id: 'KMP-03',
    nomorKampanye: 'NEWS-2026-032',
    nama: 'Undangan Simposium Kardiologi — early bird',
    subjek: 'Undangan simposium kardiologi AMS 2026 (kuota early bird)',
    dariNama: 'REMEDI AMS',
    dariSurel: 'bulletin@remediams.com',
    tipe: 'regular',
    mime: 'multipart/alternative',
    daftarIds: ['LST-01', 'LST-04'],
    templatId: 'TPL-01',
    status: 'sending',
    jadwalKirim: '2026-11-03',
    jadwalSelesai: '2026-11-06',
    targetTotal: 12,
    terkirim: 5,
    dibukaTotal: 6,
    dibukaUnik: 4,
    klikTotal: 3,
    klikUnik: 3,
    bounce: 0,
    keluhan: 0,
    berhentiLangganan: 0,
    lajuPerDetik: 4,
    tautan: [{ url: 'https://www.remediams.com/kegiatan', klikTotal: 3, klikUnik: 3 }],
    penanggungJawab: 'Manajer Pemasaran',
    catatan: 'Antrian berjalan; laju ditahan 4 pesan/detik untuk menjaga kuota harian SMTP. Kesalahan kirim di atas ambang menjeda kampanye otomatis.'
  },
  {
    id: 'KMP-04',
    nomorKampanye: 'NEWS-2026-033',
    nama: 'Paket Kalibrasi & PM USG Portabel — Rayon Jawa Barat',
    subjek: 'Paket layanan kalibrasi USG untuk fasyankes Jawa Barat',
    dariNama: 'REMEDI AMS',
    dariSurel: 'bulletin@remediams.com',
    tipe: 'regular',
    mime: 'text/html',
    daftarIds: ['LST-02'],
    templatId: 'TPL-01',
    status: 'scheduled',
    jadwalKirim: '2026-11-10',
    jadwalSelesai: '',
    targetTotal: 7,
    terkirim: 0,
    dibukaTotal: 0,
    dibukaUnik: 0,
    klikTotal: 0,
    klikUnik: 0,
    bounce: 0,
    keluhan: 0,
    berhentiLangganan: 0,
    lajuPerDetik: 12,
    tautan: [],
    penanggungJawab: 'Manajer Pemasaran',
    catatan: 'Jadwal dibandingkan terhadap jam server; hanya satu kampanye boleh berstatus mengirim sehingga KMP-04 menunggu KMP-03 selesai.'
  },
  {
    id: 'KMP-05',
    nomorKampanye: 'NEWS-2026-034',
    nama: 'Konfirmasi keanggotaan daftar Buletin Umum',
    subjek: 'Konfirmasi langganan buletin REMEDI',
    dariNama: 'REMEDI AMS',
    dariSurel: 'bulletin@remediams.com',
    tipe: 'optin',
    mime: 'text/html',
    daftarIds: ['LST-05'],
    templatId: 'TPL-02',
    status: 'paused',
    jadwalKirim: '2026-10-29',
    jadwalSelesai: '',
    targetTotal: 3,
    terkirim: 1,
    dibukaTotal: 1,
    dibukaUnik: 1,
    klikTotal: 1,
    klikUnik: 1,
    bounce: 0,
    keluhan: 0,
    berhentiLangganan: 0,
    lajuPerDetik: 12,
    tautan: [],
    penanggungJawab: 'Manajer Pemasaran',
    catatan: 'Kampanye optin hanya menyasar langganan unconfirmed pada daftar double opt-in; dihentikan sementara menunggu konfirmasi owner daftar.'
  },
  {
    id: 'KMP-06',
    nomorKampanye: 'NEWS-2026-035',
    nama: 'Draf: Edukasi Sterilisasi CPKB (belum diverifikasi PJT)',
    subjek: '(draf) Prosedur sterilisasi dan pemantauan bahan habis pakai',
    dariNama: 'REMEDI AMS',
    dariSurel: 'bulletin@remediams.com',
    tipe: 'regular',
    mime: 'multipart/alternative',
    daftarIds: ['LST-01'],
    templatId: 'TPL-01',
    status: 'draft',
    jadwalKirim: '',
    jadwalSelesai: '',
    targetTotal: 8,
    terkirim: 0,
    dibukaTotal: 0,
    dibukaUnik: 0,
    klikTotal: 0,
    klikUnik: 0,
    bounce: 0,
    keluhan: 0,
    berhentiLangganan: 0,
    lajuPerDetik: 12,
    tautan: [],
    penanggungJawab: 'Koordinator Pemasaran',
    catatan: 'Belum boleh dijadwalkan: klaim manfaat pada draf belum mendapat validasi etika promosi PJT.'
  }
];

export const INITIAL_PESAN_TRANSAKSIONAL: PesanTransaksional[] = [
  { id: 'TXA-01', surel: 'anwar.fadillah@rsudpasarminggu.go.id', subjek: 'Konfirmasi pesanan SO-2026-0087', status: 'sent', dikirimPada: '2026-10-21', keperluan: 'Balasan atas Sales Order' },
  { id: 'TXA-02', surel: 'hesti.wardani@rsudpasarminggu.go.id', subjek: 'Invoice INV-2026-0416 siap diunduh', status: 'sent', dikirimPada: '2026-10-24', keperluan: 'Tagihan / piutang' },
  { id: 'TXA-03', surel: 'lilik.sumarni@rsharapanbunda.co.id', subjek: 'Jadwal kalibrasi patient monitor (10 Nov 2026)', status: 'queued', dikirimPada: '', keperluan: 'Penjadwalan layanan teknis' },
  { id: 'TXA-04', surel: 'pengadaan.iprs@rsudserang.go.id', subjek: 'Pengingat: NIE mendekati akhir masa berlaku', status: 'sent', dikirimPada: '2026-10-31', keperluan: 'Peringatan kepatuhan izin edar' },
  { id: 'TXA-05', surel: 'humas@persi-asosiasi.go.id', subjek: 'Kirim ulang undangan (SMTP menolak 550)', status: 'failed', dikirimPada: '2026-11-01', keperluan: 'Retransmisi setelah gagal kirim' }
];

export const KONFIGURASI_SURAT_AWAL: KonfigurasiSurat = {
  appFromName: 'REMEDI AMS',
  appFromEmail: 'bulletin@remediams.com',
  smtpHost: 'smtp.remediams.com',
  smtpPort: 587,
  smtpAuth: 'plain',
  smtpEncryption: 'starttls',
  smtpUser: 'remedi-bulletin',
  appRate: 4,
  batchSize: 30,
  concurrency: 4,
  maxSendErrors: 5,
  ambangBounce: 3,
  aksiBounce: 'blocklist',
  optInDefault: 'double',
  lacakTautan: true,
  urlInstance: 'http://127.0.0.1:9000'
};
