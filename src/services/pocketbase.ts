import PocketBase from 'pocketbase';
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
  TraceabilityResult,
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
  KonfigurasiSitus,
  GudangFisik,
  LokasiBin,
  AturanSimpan,
  TerimaBarang,
  SuratJalan,
  OpnameStok,
  JejakPergerakan,
  AmbangStok,
  KejadianScanner,
  LangkahPicking,
  SinkronisasiLkpp,
  KirimanSatuSehat,
  KonfigurasiGudang
} from '../types';
import {
  alokasiFEFOSadarKunci,
  bangunBundleFhir,
  bangunPayloadLkpp,
  entriAntreanLkpp,
  gerbangSuratJalan,
  hitungSelisihOpname,
  kodeBinDariLokasi,
  nilaiUmurStok,
  patchKunciStok,
  susunRutePicking,
  tambahJejakPergerakan,
  tandaiGagalLkpp,
  usulkanPenyesuaianOpname,
  validasiKirimanSatuSehat,
  validasiPemindaian,
  type EntriPergerakanBaru
} from '../utils/gudang';
import {
  WEBSITE_MEDIA_KEY,
  SumberKontenWebsite,
  SumberOperasionalWebsite,
  bangunKontenDefault,
  diffKonfigurasi,
  padukanKonten,
  sinkronkanKonten,
  VERSI_KONTEN_WEBSITE
} from '../utils/website';

import {
  INITIAL_IZIN_EDAR,
  INITIAL_SERTIFIKAT,
  INITIAL_DOKUMEN_MUTU,
  INITIAL_CAPA,
  INITIAL_PRODUK_KEMBALIAN,
  INITIAL_INSPEKSI_QC,
  INITIAL_STOK_GUDANG,
  INITIAL_LOG_SUHU,
  INITIAL_PEST_CONTROL,
  INITIAL_LAYANAN_TEKNIS,
  INITIAL_BETS_PRODUKSI,
  INITIAL_PEMASOK,
  INITIAL_PURCHASE_ORDER,
  INITIAL_PENJUALAN,
  INITIAL_LAPORAN_KTD,
  INITIAL_RECALL,
  INITIAL_PELATIHAN,
  INITIAL_SERTIFIKASI_PEGAWAI,
  INITIAL_TRANSAKSI,
  INITIAL_AUDIT_TRAIL,
  INITIAL_KARYAWAN_HRIS,
  INITIAL_GRADING_JABATAN,
  INITIAL_RIWAYAT_MUTASI,
  INITIAL_JADWAL_SHIFT,
  INITIAL_ABSENSI,
  INITIAL_LEMBUR,
  INITIAL_SLIP_GAJI,
  INITIAL_KANDIDAT_ATS,
  INITIAL_SKILL_MATRIX,
  INITIAL_KPI_KARYAWAN,
  INITIAL_UMPAN_BALIK_360,
  INITIAL_INSIDEN_K3,
  INITIAL_REKAM_MCU,
  INITIAL_DISTRIBUSI_APD,
  INITIAL_PELANGGAN_B2B,
  INITIAL_PROSPEK_ALKES,
  INITIAL_TERITORIAL_PENJUALAN,
  INITIAL_TENDER_ALKES,
  INITIAL_KONTRAK_HARGA,
  INITIAL_KUNJUNGAN_MEDREP,
  INITIAL_PENGETAHUAN_PRODUK,
  INITIAL_PRA_ORDER_MEDREP,
  INITIAL_SKEMA_HARGA,
  INITIAL_UNIT_SERIAL,
  INITIAL_GARANSI_INSTALASI,
  INITIAL_KAMPANYE_ALKES,
  INITIAL_UNIT_DEMO_ALKES,
  INITIAL_PROGRAM_REBATE,
  INITIAL_RIWAYAT_PENJUALAN_BULANAN,
  INITIAL_DAFTAR_SURAT,
  INITIAL_PELANGGAN_SURAT,
  INITIAL_KAMPANYE_SURAT,
  INITIAL_TEMPLAT_SURAT,
  INITIAL_MEDIA_SURAT,
  INITIAL_PESAN_TRANSAKSIONAL,
  KONFIGURASI_SURAT_AWAL,
  INITIAL_GUDANG_FISIK,
  INITIAL_LOKASI_BIN,
  INITIAL_ATURAN_SIMPAN,
  INITIAL_TERIMA_BARANG,
  INITIAL_SURAT_JALAN,
  INITIAL_OPNAME_STOK,
  INITIAL_JEJAK_PERGERAKAN,
  INITIAL_AMBANG_STOK,
  INITIAL_KEJADIAN_SCANNER,
  INITIAL_SINKRONISASI_LKPP,
  INITIAL_KIRIMAN_SATU_SEHAT,
  KONFIGURASI_GUDANG_AWAL
} from '../data/initialData';

const PB_URL = (typeof window !== 'undefined' && (window as unknown as { __PB_URL__?: string }).__PB_URL__) || 'http://127.0.0.1:8090';

// PocketBase Client instance
export const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const STORAGE_PREFIX = 'ams_alkes_';

/** Nama perusahaan lama yang mungkin masih tersimpan di basis data lokal perangkat. */
const NAMA_LAMA: [string, string][] = [
  ['PT AMS MEDIKA INTEGRASI INDONESIA', 'PT ANUGRAH MITRA SELARAS'],
  ['PT AMS Medika Integrasi Indonesia', 'PT Anugrah Mitra Selaras'],
  ['PT AMS Manufaktur Alkes Indonesia', 'PT Anugrah Mitra Selaras'],
  ['PT AMS Alkes', 'PT Anugrah Mitra Selaras'],
  ['AMS Alkes Integrated System', 'AMS Integrated System'],
  ['pjt@ams-medika.co.id', 'pjt@anugrahmitraselaras.co.id']
];

/** Koleksi basis data operasional yang memengaruhi status stok, kepatuhan edar, atau harga produk di situs publik. */
export const KOLEKSI_OPERASIONAL_SITUS = [
  'stok_gudang',
  'gudang_pengaturan',
  'sales_unit_serial',
  'sales_skema_harga',
  'sales_kontrak',
  'sales_rebate',
  'izin_edar',
  'penarikan_produk',
  'sales_pengetahuan_produk'
] as const;

export type KunciKoleksiOperasionalSitus = (typeof KOLEKSI_OPERASIONAL_SITUS)[number];

const KANAL_REALTIME_AMS = 'ams_alkes_realtime_v1';

class AMSDatabaseManager {
  private listeners: Map<string, Set<() => void>> = new Map();
  private isOnlinePocketBase: boolean = false;
  private pbRealtimeTerpasang: boolean = false;
  private kanalSiaran: BroadcastChannel | null = null;
  private connectionStatusText: string = 'Penyimpanan Lokal Aktif (Offline-First)';

  constructor() {
    this.ratakanNamaPerusahaan();
    this.pasangPendengarLintasTab();
    this.checkPBConnection();
  }

  /** Pantau perubahan koleksi dari tab/jendela/iframe lain agar situs publik & modul operasional selalu sinkron. */
  private pasangPendengarLintasTab() {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;

    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === null) {
        this.notifyLocal('all');
        Array.from(this.listeners.keys()).forEach((kunci) => {
          if (kunci !== 'all') this.notifyLocal(kunci);
        });
        return;
      }
      if (e.key.startsWith(STORAGE_PREFIX)) {
        const kunciKoleksi = e.key.slice(STORAGE_PREFIX.length);
        this.notifyLocal(kunciKoleksi);
      }
    });

    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.kanalSiaran = new BroadcastChannel(KANAL_REALTIME_AMS);
        this.kanalSiaran.onmessage = (pesan: MessageEvent<{ type?: string; collectionKey?: string }>) => {
          const data = pesan.data;
          if (data?.type === 'ams-db-update' && typeof data.collectionKey === 'string') {
            this.notifyLocal(data.collectionKey);
          }
        };
      } catch {
        this.kanalSiaran = null;
      }
    }
  }

  private pasangRealtimePocketBase() {
    if (this.pbRealtimeTerpasang || !this.isOnlinePocketBase) return;
    this.pbRealtimeTerpasang = true;
    for (const koleksi of [...KOLEKSI_OPERASIONAL_SITUS, 'website_published']) {
      pb.collection(koleksi)
        .subscribe('*', () => {
          this.notifyLocal(koleksi);
        })
        .catch(() => {
          /* koleksi belum diprovisi pada PocketBase atau koneksi SSE terputus: fallback ke penyimpanan lokal */
        });
    }
  }

  /** Migrasi sekali jalan: konten lama di localStorage memakai nama entitas terbaru. */
  private ratakanNamaPerusahaan() {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const kunciPenuh = localStorage.key(i);
        if (!kunciPenuh || !kunciPenuh.startsWith(STORAGE_PREFIX) || kunciPenuh === WEBSITE_MEDIA_KEY) continue;
        const tersimpan = localStorage.getItem(kunciPenuh);
        if (!tersimpan || !NAMA_LAMA.some(([lama]) => tersimpan.includes(lama))) continue;
        const baru = NAMA_LAMA.reduce((acc, [lama, ganti]) => acc.split(lama).join(ganti), tersimpan);
        localStorage.setItem(kunciPenuh, baru);
        this.notify(kunciPenuh.slice(STORAGE_PREFIX.length));
      }
    } catch {
      /* penyimpanan penuh atau mode privat: konten tetap dibaca seperti adanya */
    }
  }

  private async checkPBConnection() {
    try {
      const health = await pb.health.check();
      if (health && health.code === 200) {
        this.isOnlinePocketBase = true;
        this.connectionStatusText = 'PocketBase 0.28.1 Terhubung (Real-time)';
        this.pasangRealtimePocketBase();
      } else {
        this.isOnlinePocketBase = false;
        this.connectionStatusText = 'Penyimpanan Lokal Aktif (Offline-First)';
      }
    } catch {
      this.isOnlinePocketBase = false;
      this.connectionStatusText = 'Penyimpanan Lokal Aktif (Offline-First)';
    }
    this.notifyLocal('connection_status');
  }

  public getConnectionStatus() {
    return {
      isPocketBaseConnected: this.isOnlinePocketBase,
      statusLabel: this.connectionStatusText,
      url: PB_URL
    };
  }

  public subscribe(collectionKey: string, callback: () => void): () => void {
    if (!this.listeners.has(collectionKey)) {
      this.listeners.set(collectionKey, new Set());
    }
    this.listeners.get(collectionKey)!.add(callback);
    return () => {
      this.listeners.get(collectionKey)?.delete(callback);
    };
  }

  /** Daftarkan satu pendengar ke beberapa koleksi sekaligus; mengembalikan fungsi pelepas tunggal. */
  public subscribeKoleksi(
    daftarKunci: readonly string[],
    callback: (kunciKoleksi: string) => void
  ): () => void {
    const pelepas = daftarKunci.map((kunci) =>
      this.subscribe(kunci, () => callback(kunci))
    );
    return () => {
      pelepas.forEach((lepas) => lepas());
    };
  }

  private notifyLocal(collectionKey: string) {
    const panggil = (kunci: string) => {
      const list = this.listeners.get(kunci);
      if (!list) return;
      list.forEach((cb) => {
        try {
          cb();
        } catch (e) {
          console.error('Error in listener callback', e);
        }
      });
    };
    panggil(collectionKey);
    if (collectionKey !== 'all') {
      panggil('all');
    }
  }

  private notify(collectionKey: string) {
    this.notifyLocal(collectionKey);
    if (this.kanalSiaran) {
      try {
        this.kanalSiaran.postMessage({ type: 'ams-db-update', collectionKey });
      } catch {
        /* abaikan bila kanal sudah ditutup */
      }
    }
  }

  private getCollection<T>(key: string, initial: T[]): T[] {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + key);
      if (!stored) {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(stored);
    } catch {
      return initial;
    }
  }

  private setCollection<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
      this.notify(key);
    } catch (e) {
      console.error(`Gagal menyimpan data ${key}:`, e);
    }
  }

  // --- CRUD Generic & Collection specific ---

  // Izin Edar
  public getIzinEdar(): IzinEdarAlkes[] {
    return this.getCollection<IzinEdarAlkes>('izin_edar', INITIAL_IZIN_EDAR);
  }
  public saveIzinEdar(items: IzinEdarAlkes[]) {
    this.setCollection('izin_edar', items);
    this.logAudit('Regulatory Affairs', 'Pembaruan data izin edar alkes', items[0]?.nomorIzinEdar || '-');
  }
  public addIzinEdar(item: IzinEdarAlkes) {
    const current = this.getIzinEdar();
    this.saveIzinEdar([item, ...current]);
  }

  // Sertifikat
  public getSertifikat(): SertifikatPerusahaan[] {
    return this.getCollection<SertifikatPerusahaan>('sertifikat', INITIAL_SERTIFIKAT);
  }
  public saveSertifikat(items: SertifikatPerusahaan[]) {
    this.setCollection('sertifikat', items);
  }

  // Dokumen Mutu
  public getDokumenMutu(): DokumenMutu[] {
    return this.getCollection<DokumenMutu>('dokumen_mutu', INITIAL_DOKUMEN_MUTU);
  }
  public saveDokumenMutu(items: DokumenMutu[]) {
    this.setCollection('dokumen_mutu', items);
  }

  // CAPA
  public getCAPA(): CAPARecord[] {
    return this.getCollection<CAPARecord>('capa', INITIAL_CAPA);
  }
  public saveCAPA(items: CAPARecord[]) {
    this.setCollection('capa', items);
    this.logAudit('Quality Assurance', 'Pembaruan catatan CAPA ISO 13485', items[0]?.nomorCAPA || '-');
  }
  public addCAPA(item: CAPARecord) {
    const current = this.getCAPA();
    this.saveCAPA([item, ...current]);
  }

  // Produk Kembalian (Retur)
  public getProdukKembalian(): ProdukKembalian[] {
    return this.getCollection<ProdukKembalian>('produk_kembalian', INITIAL_PRODUK_KEMBALIAN);
  }
  public saveProdukKembalian(items: ProdukKembalian[]) {
    this.setCollection('produk_kembalian', items);
    this.logAudit('Quality Assurance', 'Pembaruan produk kembalian karantina', items[0]?.nomorRetur || '-');
  }
  public addProdukKembalian(item: ProdukKembalian) {
    const current = this.getProdukKembalian();
    this.saveProdukKembalian([item, ...current]);
  }

  // QC Inspeksi
  public getInspeksiQC(): InspeksiQC[] {
    return this.getCollection<InspeksiQC>('inspeksi_qc', INITIAL_INSPEKSI_QC);
  }
  public saveInspeksiQC(items: InspeksiQC[]) {
    this.setCollection('inspeksi_qc', items);
    this.logAudit('Quality Control', 'Pencatatan hasil inspeksi mutu bets', items[0]?.nomorBets || '-');
  }
  public addInspeksiQC(item: InspeksiQC) {
    const current = this.getInspeksiQC();
    this.saveInspeksiQC([item, ...current]);
  }

  // Stok Gudang
  public getStokGudang(): StokGudang[] {
    return this.getCollection<StokGudang>('stok_gudang', INITIAL_STOK_GUDANG);
  }
  public saveStokGudang(items: StokGudang[]) {
    this.setCollection('stok_gudang', items);
  }
  public addStokGudang(item: StokGudang) {
    const current = this.getStokGudang();
    this.saveStokGudang([item, ...current]);
  }

  // Log Suhu
  public getLogSuhu(): LogSuhu[] {
    return this.getCollection<LogSuhu>('log_suhu', INITIAL_LOG_SUHU);
  }
  public saveLogSuhu(items: LogSuhu[]) {
    this.setCollection('log_suhu', items);
  }
  public addLogSuhu(item: LogSuhu) {
    const current = this.getLogSuhu();
    this.saveLogSuhu([item, ...current.slice(0, 49)]); // keep last 50
  }

  // Pest Control
  public getPestControl(): LogPestControl[] {
    return this.getCollection<LogPestControl>('pest_control', INITIAL_PEST_CONTROL);
  }
  public savePestControl(items: LogPestControl[]) {
    this.setCollection('pest_control', items);
  }
  public addPestControl(item: LogPestControl) {
    const current = this.getPestControl();
    this.savePestControl([item, ...current]);
  }

  // Layanan Teknis
  public getLayananTeknis(): LayananTeknis[] {
    return this.getCollection<LayananTeknis>('layanan_teknis', INITIAL_LAYANAN_TEKNIS);
  }
  public saveLayananTeknis(items: LayananTeknis[]) {
    this.setCollection('layanan_teknis', items);
    this.logAudit('Teknisi & Purna Jual', 'Pembaruan tiket instalasi/kalibrasi', items[0]?.nomorTiket || '-');
  }
  public addLayananTeknis(item: LayananTeknis) {
    const current = this.getLayananTeknis();
    this.saveLayananTeknis([item, ...current]);
  }

  // Manufaktur
  public getBetsProduksi(): BetsProduksi[] {
    return this.getCollection<BetsProduksi>('bets_produksi', INITIAL_BETS_PRODUKSI);
  }
  public saveBetsProduksi(items: BetsProduksi[]) {
    this.setCollection('bets_produksi', items);
    this.logAudit('Manufaktur CPAKB', 'Pembaruan Catatan Bets Produksi (BMR)', items[0]?.nomorBMR || '-');
  }
  public addBetsProduksi(item: BetsProduksi) {
    const current = this.getBetsProduksi();
    this.saveBetsProduksi([item, ...current]);
  }

  // Purchasing & Pemasok
  public getPemasok(): PemasokAlkes[] {
    return this.getCollection<PemasokAlkes>('pemasok', INITIAL_PEMASOK);
  }
  public savePemasok(items: PemasokAlkes[]) {
    this.setCollection('pemasok', items);
  }
  public addPemasok(item: PemasokAlkes) {
    const current = this.getPemasok();
    this.savePemasok([item, ...current]);
  }

  public getPurchaseOrder(): PurchaseOrderAlkes[] {
    return this.getCollection<PurchaseOrderAlkes>('purchase_order', INITIAL_PURCHASE_ORDER);
  }
  public savePurchaseOrder(items: PurchaseOrderAlkes[]) {
    this.setCollection('purchase_order', items);
    this.logAudit('Purchasing', 'Pembaruan Purchase Order resmi', items[0]?.nomorPO || '-');
  }
  public addPurchaseOrder(item: PurchaseOrderAlkes) {
    const current = this.getPurchaseOrder();
    this.savePurchaseOrder([item, ...current]);
  }

  // Sales
  public getPenjualan(): PenjualanAlkes[] {
    return this.getCollection<PenjualanAlkes>('penjualan', INITIAL_PENJUALAN);
  }
  public savePenjualan(items: PenjualanAlkes[]) {
    this.setCollection('penjualan', items);
    this.logAudit('Sales & Marketing', 'Pembaruan pesanan fasyankes', items[0]?.nomorPesanan || '-');
  }
  public addPenjualan(item: PenjualanAlkes) {
    const current = this.getPenjualan();
    this.savePenjualan([item, ...current]);
  }

  // PMS & Laporan KTD
  public getLaporanKTD(): LaporanKTD[] {
    return this.getCollection<LaporanKTD>('laporan_ktd', INITIAL_LAPORAN_KTD);
  }
  public saveLaporanKTD(items: LaporanKTD[]) {
    this.setCollection('laporan_ktd', items);
    this.logAudit('Post-Market Vigilance', 'Pencatatan laporan KTD e-Watch Alkes', items[0]?.nomorLaporanKTD || '-');
  }
  public addLaporanKTD(item: LaporanKTD) {
    const current = this.getLaporanKTD();
    this.saveLaporanKTD([item, ...current]);
  }

  // Penarikan Produk (Recall)
  public getPenarikanProduk(): PenarikanProduk[] {
    return this.getCollection<PenarikanProduk>('penarikan_produk', INITIAL_RECALL);
  }
  public savePenarikanProduk(items: PenarikanProduk[]) {
    this.setCollection('penarikan_produk', items);
    this.logAudit('Post-Market Vigilance', 'Pembaruan eksekusi penarikan produk (Recall)', items[0]?.nomorRecall || '-');
  }
  public addPenarikanProduk(item: PenarikanProduk) {
    const current = this.getPenarikanProduk();
    this.savePenarikanProduk([item, ...current]);
  }

  // HRD Pelatihan
  public getPelatihan(): PelatihanPersonil[] {
    return this.getCollection<PelatihanPersonil>('pelatihan', INITIAL_PELATIHAN);
  }
  public savePelatihan(items: PelatihanPersonil[]) {
    this.setCollection('pelatihan', items);
  }
  public addPelatihan(item: PelatihanPersonil) {
    const current = this.getPelatihan();
    this.savePelatihan([item, ...current]);
  }

  public getSertifikasiPegawai(): SertifikasiPegawai[] {
    return this.getCollection<SertifikasiPegawai>('sertifikasi_pegawai', INITIAL_SERTIFIKASI_PEGAWAI);
  }
  public saveSertifikasiPegawai(items: SertifikasiPegawai[]) {
    this.setCollection('sertifikasi_pegawai', items);
  }

  // ============================ HRIS ============================

  // Modul 1 — Core HR & Org Management
  public getKaryawanHRIS(): KaryawanHRIS[] {
    return this.getCollection<KaryawanHRIS>('hris_karyawan', INITIAL_KARYAWAN_HRIS);
  }
  public saveKaryawanHRIS(items: KaryawanHRIS[]) {
    this.setCollection('hris_karyawan', items);
  }
  public addKaryawanHRIS(item: KaryawanHRIS) {
    const current = this.getKaryawanHRIS();
    this.saveKaryawanHRIS([item, ...current]);
  }

  public getGradingJabatan(): GradeJabatan[] {
    return this.getCollection<GradeJabatan>('hris_grading', INITIAL_GRADING_JABATAN);
  }
  public saveGradingJabatan(items: GradeJabatan[]) {
    this.setCollection('hris_grading', items);
  }

  // Riwayat mutasi memakai pola tabel temporal: satu baris aktif per karyawan
  // (tanggalBerakhir = null), baris lama ditutup otomatis saat mutasi baru dicatat.
  public getRiwayatMutasi(): RiwayatMutasi[] {
    return this.getCollection<RiwayatMutasi>('hris_mutasi', INITIAL_RIWAYAT_MUTASI);
  }
  public saveRiwayatMutasi(items: RiwayatMutasi[]) {
    this.setCollection('hris_mutasi', items);
  }
  public catatMutasi(item: RiwayatMutasi) {
    const penutup = new Date(item.tanggalEfektif);
    penutup.setDate(penutup.getDate() - 1);
    const tanggalBerakhirInklusif = penutup.toISOString().split('T')[0];

    const riwayat = this.getRiwayatMutasi().map(r =>
      r.karyawanId === item.karyawanId && r.tanggalBerakhir === null
        ? { ...r, tanggalBerakhir: tanggalBerakhirInklusif }
        : r
    );
    this.saveRiwayatMutasi([item, ...riwayat]);

    const karyawan = this.getKaryawanHRIS().map(k =>
      k.id === item.karyawanId
        ? { ...k, jabatan: item.jabatan, divisi: item.divisi, lokasi: item.lokasi, grade: item.grade }
        : k
    );
    this.saveKaryawanHRIS(karyawan);
    this.logAudit('HRIS — Core HR', 'Pencatatan mutasi jabatan/divisi karyawan', item.karyawanId);
  }

  // Modul 2 — Time & Attendance
  public getJadwalShift(): JadwalShift[] {
    return this.getCollection<JadwalShift>('hris_shift', INITIAL_JADWAL_SHIFT);
  }
  public saveJadwalShift(items: JadwalShift[]) {
    this.setCollection('hris_shift', items);
  }
  public addJadwalShift(item: JadwalShift) {
    const current = this.getJadwalShift();
    this.saveJadwalShift([item, ...current]);
  }

  public getAbsensi(): LogAbsensi[] {
    return this.getCollection<LogAbsensi>('hris_absensi', INITIAL_ABSENSI);
  }
  public saveAbsensi(items: LogAbsensi[]) {
    this.setCollection('hris_absensi', items);
  }
  public addAbsensi(item: LogAbsensi) {
    const current = this.getAbsensi();
    this.saveAbsensi([item, ...current]);
  }

  public getLembur(): PerhitunganLembur[] {
    return this.getCollection<PerhitunganLembur>('hris_lembur', INITIAL_LEMBUR);
  }
  public saveLembur(items: PerhitunganLembur[]) {
    this.setCollection('hris_lembur', items);
  }
  public addLembur(item: PerhitunganLembur) {
    const current = this.getLembur();
    this.saveLembur([item, ...current]);
  }

  // Modul 3 — Payroll, Benefits & Tax
  public getSlipGaji(): SlipGaji[] {
    return this.getCollection<SlipGaji>('hris_slip_gaji', INITIAL_SLIP_GAJI);
  }
  public saveSlipGaji(items: SlipGaji[]) {
    this.setCollection('hris_slip_gaji', items);
  }
  public addSlipGaji(item: SlipGaji) {
    const current = this.getSlipGaji();
    this.saveSlipGaji([item, ...current]);
    this.logAudit('HRIS — Payroll', `Penerbitan slip gaji periode ${item.periode}`, item.id);
  }

  // Modul 4 — Recruitment & Onboarding (ATS)
  public getKandidatATS(): KandidatATS[] {
    return this.getCollection<KandidatATS>('hris_ats', INITIAL_KANDIDAT_ATS);
  }
  public saveKandidatATS(items: KandidatATS[]) {
    this.setCollection('hris_ats', items);
  }
  public addKandidatATS(item: KandidatATS) {
    const current = this.getKandidatATS();
    this.saveKandidatATS([item, ...current]);
  }

  // Modul 5 — Learning & Competency
  public getSkillMatrix(): SkillMatrix[] {
    return this.getCollection<SkillMatrix>('hris_skill_matrix', INITIAL_SKILL_MATRIX);
  }
  public saveSkillMatrix(items: SkillMatrix[]) {
    this.setCollection('hris_skill_matrix', items);
  }
  public addSkillMatrix(item: SkillMatrix) {
    const current = this.getSkillMatrix();
    this.saveSkillMatrix([item, ...current]);
  }

  // Modul 6 — Performance & Talent
  public getKpiKaryawan(): KpiKaryawan[] {
    return this.getCollection<KpiKaryawan>('hris_kpi', INITIAL_KPI_KARYAWAN);
  }
  public saveKpiKaryawan(items: KpiKaryawan[]) {
    this.setCollection('hris_kpi', items);
  }
  public addKpiKaryawan(item: KpiKaryawan) {
    const current = this.getKpiKaryawan();
    this.saveKpiKaryawan([item, ...current]);
  }

  public getUmpanBalik360(): UmpanBalik360[] {
    return this.getCollection<UmpanBalik360>('hris_umpan_balik_360', INITIAL_UMPAN_BALIK_360);
  }
  public saveUmpanBalik360(items: UmpanBalik360[]) {
    this.setCollection('hris_umpan_balik_360', items);
  }

  // Modul 7 — HSE / K3
  public getInsidenK3(): InsidenK3[] {
    return this.getCollection<InsidenK3>('hris_insiden_k3', INITIAL_INSIDEN_K3);
  }
  public saveInsidenK3(items: InsidenK3[]) {
    this.setCollection('hris_insiden_k3', items);
  }
  public addInsidenK3(item: InsidenK3) {
    const current = this.getInsidenK3();
    this.saveInsidenK3([item, ...current]);
    this.logAudit('HRIS — HSE/K3', `Pelaporan ${item.jenis} di ${item.area}`, item.nomorLaporan);
  }

  public getRekamMcu(): RekamMcu[] {
    return this.getCollection<RekamMcu>('hris_mcu', INITIAL_REKAM_MCU);
  }
  public saveRekamMcu(items: RekamMcu[]) {
    this.setCollection('hris_mcu', items);
  }
  public addRekamMcu(item: RekamMcu) {
    const current = this.getRekamMcu();
    this.saveRekamMcu([item, ...current]);
  }

  public getDistribusiApd(): DistribusiApd[] {
    return this.getCollection<DistribusiApd>('hris_apd', INITIAL_DISTRIBUSI_APD);
  }
  public saveDistribusiApd(items: DistribusiApd[]) {
    this.setCollection('hris_apd', items);
  }
  public addDistribusiApd(item: DistribusiApd) {
    const current = this.getDistribusiApd();
    this.saveDistribusiApd([item, ...current]);
  }

  // ============================ SALES & MARKETING ============================

  private bentangPerubahan<T extends Record<string, unknown>>(lama: T, baru: Partial<T>) {
    const nilaiTampil = (v: unknown) => {
      if (v === undefined || v === null) return '-';
      return typeof v === 'object' ? JSON.stringify(v) : String(v);
    };
    return Object.entries(baru)
      .filter(([kolom, nilai]) => JSON.stringify((lama as Record<string, unknown>)[kolom]) !== JSON.stringify(nilai))
      .map(([kolom, nilai]) => ({
        kolom,
        nilaiLama: nilaiTampil((lama as Record<string, unknown>)[kolom]),
        nilaiBaru: nilaiTampil(nilai)
      }));
  }

  // 1.1 B2B Customer Profiling — sekaligus Credit Limit & TOP
  public getPelangganB2B(): PelangganB2B[] {
    return this.getCollection<PelangganB2B>('sales_pelanggan', INITIAL_PELANGGAN_B2B);
  }
  public savePelangganB2B(items: PelangganB2B[]) {
    this.setCollection('sales_pelanggan', items);
  }
  public addPelangganB2B(item: PelangganB2B) {
    this.savePelangganB2B([item, ...this.getPelangganB2B()]);
    this.logAudit('Sales & Marketing — CRM', 'Pencatatan master pelanggan B2B baru', item.kodePelanggan, 'Manajer Penjualan', 'Sales & Marketing');
  }
  public updatePelangganB2B(id: string, patch: Partial<PelangganB2B>) {
    const current = this.getPelangganB2B();
    const lama = current.find((p) => p.id === id);
    if (!lama) return;
    this.savePelangganB2B(current.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    this.logAudit(
      'Sales & Marketing — CRM',
      'Perubahan master pelanggan (batas kredit/TOP/status)',
      lama.kodePelanggan,
      'Manajer Penjualan',
      'Sales & Marketing',
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as Record<string, unknown>)
    );
  }

  // 1.2 Lead & Opportunity Pipelines
  public getProspek(): ProspekAlkes[] {
    return this.getCollection<ProspekAlkes>('sales_prospek', INITIAL_PROSPEK_ALKES);
  }
  public saveProspek(items: ProspekAlkes[]) {
    this.setCollection('sales_prospek', items);
  }
  public addProspek(item: ProspekAlkes) {
    this.saveProspek([item, ...this.getProspek()]);
    this.logAudit('Sales & Marketing — CRM', 'Pembukaan prospek baru pada pipeline', item.nomorProspek, 'Medical Representative', 'Sales & Marketing');
  }
  public majukanTahapProspek(id: string, tahap: ProspekAlkes['tahap']) {
    const current = this.getProspek();
    const lama = current.find((p) => p.id === id);
    if (!lama || lama.tahap === tahap) return;
    this.saveProspek(current.map((p) => (p.id === id ? { ...p, tahap } : p)));
    this.logAudit('Sales & Marketing — CRM', 'Pergerakan tahap opportunity pipeline', lama.nomorProspek, 'Medical Representative', 'Sales & Marketing', [
      { kolom: 'tahap', nilaiLama: lama.tahap, nilaiBaru: tahap }
    ]);
  }

  // 1.3 Mapping Area & Sales Territory
  public getTeritorial(): TeritorialPenjualan[] {
    return this.getCollection<TeritorialPenjualan>('sales_teritorial', INITIAL_TERITORIAL_PENJUALAN);
  }
  public saveTeritorial(items: TeritorialPenjualan[]) {
    this.setCollection('sales_teritorial', items);
  }
  public addTeritorial(item: TeritorialPenjualan) {
    this.saveTeritorial([item, ...this.getTeritorial()]);
  }

  // 2.1 LPSE Scraper & Alert System
  public getTender(): TenderAlkes[] {
    return this.getCollection<TenderAlkes>('sales_tender', INITIAL_TENDER_ALKES);
  }
  public saveTender(items: TenderAlkes[]) {
    this.setCollection('sales_tender', items);
  }
  public addTender(item: TenderAlkes) {
    this.saveTender([item, ...this.getTender()]);
    this.logAudit('Sales & Marketing — Tender', 'Entri pengumuman tender/LPSE baru', item.nomorPengumuman, 'Manajer Tender', 'Sales & Marketing');
  }

  // 2.2 Contract & Pricing Agreement
  public getKontrakHarga(): KontrakHarga[] {
    return this.getCollection<KontrakHarga>('sales_kontrak', INITIAL_KONTRAK_HARGA);
  }
  public saveKontrakHarga(items: KontrakHarga[]) {
    this.setCollection('sales_kontrak', items);
  }
  public addKontrakHarga(item: KontrakHarga) {
    this.saveKontrakHarga([item, ...this.getKontrakHarga()]);
    this.logAudit('Sales & Marketing — Tender', 'Penerbitan kontrak penguncian harga', item.nomorKontrak, 'Manajer Tender', 'Sales & Marketing');
  }

  // 3.1 Visit Planner & Geo-Tagging
  public getKunjunganMedRep(): KunjunganMedRep[] {
    return this.getCollection<KunjunganMedRep>('sales_kunjungan', INITIAL_KUNJUNGAN_MEDREP);
  }
  public saveKunjunganMedRep(items: KunjunganMedRep[]) {
    this.setCollection('sales_kunjungan', items);
  }
  public addKunjunganMedRep(item: KunjunganMedRep) {
    this.saveKunjunganMedRep([item, ...this.getKunjunganMedRep()]);
  }
  public catatCheckInKunjungan(id: string, koordinat: { lat: number; lon: number }, jam: string) {
    const current = this.getKunjunganMedRep();
    const lama = current.find((k) => k.id === id);
    if (!lama) return;
    this.saveKunjunganMedRep(
      current.map((k) => (k.id === id ? { ...k, koordinatCheckIn: koordinat, jamCheckIn: jam } : k))
    );
    this.logAudit('Sales & Marketing — SFA', 'Check-in kunjungan lapangan dengan geotag', `${lama.medRep} @ ${lama.tanggal}`, 'Medical Representative', 'Sales & Marketing', [
      { kolom: 'koordinatCheckIn', nilaiLama: lama.koordinatCheckIn ? `${lama.koordinatCheckIn.lat}, ${lama.koordinatCheckIn.lon}` : 'belum check-in', nilaiBaru: `${koordinat.lat}, ${koordinat.lon}` }
    ]);
  }

  // 3.2 Product Knowledge & Digital Brochure
  public getPengetahuanProduk(): PengetahuanProdukAlkes[] {
    return this.getCollection<PengetahuanProdukAlkes>('sales_pengetahuan_produk', INITIAL_PENGETAHUAN_PRODUK);
  }
  public savePengetahuanProduk(items: PengetahuanProdukAlkes[]) {
    this.setCollection('sales_pengetahuan_produk', items);
  }

  // 3.3 Mobile Order Taking (Pre-Order)
  public getPraOrder(): PraOrderMedRep[] {
    return this.getCollection<PraOrderMedRep>('sales_pra_order', INITIAL_PRA_ORDER_MEDREP);
  }
  public savePraOrder(items: PraOrderMedRep[]) {
    this.setCollection('sales_pra_order', items);
  }
  public addPraOrder(item: PraOrderMedRep) {
    this.savePraOrder([item, ...this.getPraOrder()]);
    this.logAudit('Sales & Marketing — SFA', 'Input pra-order dari aplikasi lapangan', item.nomorPraOrder, 'Medical Representative', 'Sales & Marketing');
  }

  // Konversi pra-order lapangan menjadi Sales Order resmi (jalur 3.3 -> 4)
  public konversiPraOrderKeSalesOrder(praOrderId: string, jalurPenjualan: PenjualanAlkes['jalurPenjualan'], nomorBets: string) {
    const pra = this.getPraOrder().find((p) => p.id === praOrderId);
    if (!pra) return null;
    const pelanggan = this.getPelangganB2B().find((c) => c.id === pra.pelangganId);
    const itemTerbaik = pra.item[0];
    const pesanan: PenjualanAlkes = {
      id: 'SO-' + Date.now(),
      nomorPesanan: `SP-LAP-${pra.tanggal.slice(0, 4)}-${String(this.getPenjualan().length + 126).padStart(3, '0')}`,
      fasyankes: pelanggan?.namaInstalasi ?? '-',
      jalurPenjualan,
      namaAlkes: itemTerbaik.namaAlkes,
      nomorBets,
      jumlah: pra.item.reduce((total, i) => total + i.jumlah, 0),
      satuan: 'Unit',
      totalHarga: pra.item.reduce((total, i) => total + i.jumlah * i.hargaSatuan, 0),
      statusVerifikasiEtikaIklan: 'Memenuhi Etika Promosi',
      statusKirim: 'Verifikasi Pesanan',
      tanggalPesanan: pra.tanggal,
      pelangganId: pra.pelangganId,
      hargaSatuan: itemTerbaik.hargaSatuan,
      ppnPersen: 11
    };
    this.addPenjualan(pesanan);
    this.savePraOrder(this.getPraOrder().map((p) => (p.id === praOrderId ? { ...p, statusPraOrder: 'Konversi Sales Order' } : p)));
    this.logAudit('Sales & Marketing — Order', 'Konversi pra-order lapangan menjadi Sales Order', pesanan.nomorPesanan, 'Manajer Penjualan', 'Sales & Marketing', [
      { kolom: 'statusPraOrder', nilaiLama: pra.statusPraOrder, nilaiBaru: 'Konversi Sales Order' }
    ]);
    return pesanan;
  }

  // 4.2 Multi-Level Pricing & Discount Engine
  public getSkemaHarga(): SkemaHargaAlkes[] {
    return this.getCollection<SkemaHargaAlkes>('sales_skema_harga', INITIAL_SKEMA_HARGA);
  }
  public saveSkemaHarga(items: SkemaHargaAlkes[]) {
    this.setCollection('sales_skema_harga', items);
  }
  public addSkemaHarga(item: SkemaHargaAlkes) {
    this.saveSkemaHarga([item, ...this.getSkemaHarga()]);
    this.logAudit('Sales & Marketing — Order', 'Penerbitan skema harga berjenjang', item.namaSkema, 'Manajer Penjualan', 'Sales & Marketing');
  }

  // 5.1 Batch/Lot & Serial Number Tracking
  public getUnitSerial(): UnitSerialAlkes[] {
    return this.getCollection<UnitSerialAlkes>('sales_unit_serial', INITIAL_UNIT_SERIAL);
  }
  public saveUnitSerial(items: UnitSerialAlkes[]) {
    this.setCollection('sales_unit_serial', items);
  }
  public addUnitSerial(item: UnitSerialAlkes) {
    this.saveUnitSerial([item, ...this.getUnitSerial()]);
  }

  // 5.2 Warranty & Instalasi Base
  public getGaransiInstalasi(): GaransiInstalasi[] {
    return this.getCollection<GaransiInstalasi>('sales_garansi', INITIAL_GARANSI_INSTALASI);
  }
  public saveGaransiInstalasi(items: GaransiInstalasi[]) {
    this.setCollection('sales_garansi', items);
  }
  public addGaransiInstalasi(item: GaransiInstalasi) {
    this.saveGaransiInstalasi([item, ...this.getGaransiInstalasi()]);
    this.logAudit('Sales & Marketing — Ketelusuran', 'Pencatatan instalasi & mulai masa garansi', item.nomorSerial, 'Teknisi Elektromedik', 'Operations & Technical');
  }

  // 6.1 Event & Simposium Manager
  public getKampanye(): KampanyeAlkes[] {
    return this.getCollection<KampanyeAlkes>('sales_kampanye', INITIAL_KAMPANYE_ALKES);
  }
  public saveKampanye(items: KampanyeAlkes[]) {
    this.setCollection('sales_kampanye', items);
  }
  public addKampanye(item: KampanyeAlkes) {
    this.saveKampanye([item, ...this.getKampanye()]);
  }

  // 6.2 Sample & Demo Unit Tracking
  public getUnitDemo(): UnitDemoAlkes[] {
    return this.getCollection<UnitDemoAlkes>('sales_unit_demo', INITIAL_UNIT_DEMO_ALKES);
  }
  public saveUnitDemo(items: UnitDemoAlkes[]) {
    this.setCollection('sales_unit_demo', items);
  }
  public addUnitDemo(item: UnitDemoAlkes) {
    this.saveUnitDemo([item, ...this.getUnitDemo()]);
    this.logAudit('Sales & Marketing — Kampanye', 'Serah terima unit demo/sampel ke fasyankes', item.nomorBeritaAcara, 'Manajer Pemasaran', 'Sales & Marketing');
  }

  // 6.3 Loyalty & Rebate Program
  public getProgramRebate(): ProgramRebate[] {
    return this.getCollection<ProgramRebate>('sales_rebate', INITIAL_PROGRAM_REBATE);
  }
  public saveProgramRebate(items: ProgramRebate[]) {
    this.setCollection('sales_rebate', items);
  }
  public addProgramRebate(item: ProgramRebate) {
    this.saveProgramRebate([item, ...this.getProgramRebate()]);
  }

  // 7.2 Demand Forecasting — basis historis
  public getRiwayatPenjualanBulanan(): RiwayatPenjualanBulanan[] {
    return this.getCollection<RiwayatPenjualanBulanan>('sales_riwayat_bulanan', INITIAL_RIWAYAT_PENJUALAN_BULANAN);
  }
  public saveRiwayatPenjualanBulanan(items: RiwayatPenjualanBulanan[]) {
    this.setCollection('sales_riwayat_bulanan', items);
  }

  // ==================== 8. Newsletter & Mailing List (mesin: listmonk) ====================

  // 8.1 Subscriber lists
  public getDaftarSurat(): DaftarSurat[] {
    return this.getCollection<DaftarSurat>('surat_daftar', INITIAL_DAFTAR_SURAT);
  }
  public saveDaftarSurat(items: DaftarSurat[]) {
    this.setCollection('surat_daftar', items);
  }
  public ubahDaftarSurat(id: string, patch: Partial<DaftarSurat>) {
    const current = this.getDaftarSurat();
    const lama = current.find((d) => d.id === id);
    if (!lama) return;
    this.saveDaftarSurat(current.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    this.logAudit(
      'Sales & Marketing — Newsletter',
      'Perubahan konfigurasi subscriber list',
      lama.nama,
      'Manajer Pemasaran',
      'Sales & Marketing',
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as Record<string, unknown>)
    );
  }

  // 8.2 Subscribers
  public getPelangganSurat(): PelangganSurat[] {
    return this.getCollection<PelangganSurat>('surat_subscriber', INITIAL_PELANGGAN_SURAT);
  }
  public savePelangganSurat(items: PelangganSurat[]) {
    this.setCollection('surat_subscriber', items);
  }
  public tambahPelangganSurat(items: PelangganSurat[], keterangan: string) {
    if (items.length === 0) return;
    this.savePelangganSurat([...items, ...this.getPelangganSurat()]);
    this.logAudit(
      'Sales & Marketing — Newsletter',
      keterangan,
      items.length === 1 ? items[0].surel : `${items.length} subscriber baru`,
      'Manajer Pemasaran',
      'Sales & Marketing'
    );
  }
  public ubahStatusPelangganSurat(id: string, status: PelangganSurat['status'], alasan: string) {
    const current = this.getPelangganSurat();
    const lama = current.find((s) => s.id === id);
    if (!lama || lama.status === status) return;
    this.savePelangganSurat(current.map((s) => (s.id === id ? { ...s, status } : s)));
    this.logAudit('Sales & Marketing — Newsletter', `Perubahan status subscriber: ${alasan}`, lama.surel, 'Manajer Pemasaran', 'Sales & Marketing', [
      { kolom: 'status', nilaiLama: lama.status, nilaiBaru: status }
    ]);
  }
  public ubahKeanggotaanDaftar(ids: string[], daftarId: string, aksi: 'add' | 'remove') {
    const current = this.getPelangganSurat();
    const namaDaftar = this.getDaftarSurat().find((d) => d.id === daftarId)?.nama ?? daftarId;
    this.savePelangganSurat(
      current.map((s) => {
        if (!ids.includes(s.id)) return s;
        const keanggotaan = new Set(s.daftarIds);
        if (aksi === 'add') keanggotaan.add(daftarId);
        else keanggotaan.delete(daftarId);
        return { ...s, daftarIds: Array.from(keanggotaan) };
      })
    );
    this.logAudit(
      'Sales & Marketing — Newsletter',
      `${aksi === 'add' ? 'Menambahkan' : 'Mengeluarkan'} ${ids.length} subscriber ${aksi === 'add' ? 'ke' : 'dari'} daftar ${namaDaftar}`,
      namaDaftar,
      'Manajer Pemasaran',
      'Sales & Marketing'
    );
  }

  // 8.3 Campaigns
  public getKampanyeSurat(): KampanyeSurat[] {
    return this.getCollection<KampanyeSurat>('surat_kampanye', INITIAL_KAMPANYE_SURAT);
  }
  public saveKampanyeSurat(items: KampanyeSurat[]) {
    this.setCollection('surat_kampanye', items);
  }
  /** Perubahan status + statistik dengan jejak old/new (hanya satu kampanye boleh mengirim). */
  public ubahKampanyeSurat(id: string, patch: Partial<KampanyeSurat>, aktivitas: string, pengguna = 'Manajer Pemasaran') {
    const current = this.getKampanyeSurat();
    const lama = current.find((k) => k.id === id);
    if (!lama) return;
    this.saveKampanyeSurat(current.map((k) => (k.id === id ? { ...k, ...patch } : k)));
    this.logAudit(
      'Sales & Marketing — Newsletter',
      aktivitas,
      lama.nomorKampanye,
      pengguna,
      'Sales & Marketing',
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as Record<string, unknown>)
    );
  }

  // 8.4 Templates, media, transactional messages
  public getTemplatSurat(): TemplatSurat[] {
    return this.getCollection<TemplatSurat>('surat_templat', INITIAL_TEMPLAT_SURAT);
  }
  public saveTemplatSurat(items: TemplatSurat[]) {
    this.setCollection('surat_templat', items);
  }
  public getMediaSurat(): MediaSurat[] {
    return this.getCollection<MediaSurat>('surat_media', INITIAL_MEDIA_SURAT);
  }
  public saveMediaSurat(items: MediaSurat[]) {
    this.setCollection('surat_media', items);
  }
  public getPesanTransaksional(): PesanTransaksional[] {
    return this.getCollection<PesanTransaksional>('surat_tx', INITIAL_PESAN_TRANSAKSIONAL);
  }
  public savePesanTransaksional(items: PesanTransaksional[]) {
    this.setCollection('surat_tx', items);
  }

  // 8.5 Settings (app.*, smtp.*, bounce.*) — tanpa kredensial
  public getKonfigurasiSurat(): KonfigurasiSurat {
    return this.getJson<KonfigurasiSurat>('surat_pengaturan') ?? KONFIGURASI_SURAT_AWAL;
  }
  public saveKonfigurasiSurat(patch: Partial<KonfigurasiSurat>) {
    const lama = this.getKonfigurasiSurat();
    this.setJson('surat_pengaturan', { ...lama, ...patch });
    this.logAudit(
      'Sales & Marketing — Newsletter',
      'Perubahan pengaturan pengirim/antrean (app.*, smtp.*, bounce.*)',
      'Pengaturan Newsletter',
      'Administrator IT',
      'Sales & Marketing',
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as Record<string, unknown>)
    );
  }

  // --- Perubahan status Sales Order dengan jejak old/new value (audit CDAKB & ISO 13485) ---
  public updatePenjualan(id: string, patch: Partial<PenjualanAlkes>, pengguna = 'Manajer Penjualan') {
    const current = this.getPenjualan();
    const lama = current.find((s) => s.id === id);
    if (!lama) return;
    this.savePenjualan(current.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    this.logAudit(
      'Sales & Marketing — Order',
      'Perubahan data pesanan penjualan (harga/status/jumlah)',
      lama.nomorPesanan,
      pengguna,
      'Sales & Marketing',
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as unknown as Record<string, unknown>)
    );
  }

  // Pengiriman memicu empat efek lintas modul: alokasi FEFO multi-bets di gudang, mata rantai jejak
  // pergerakan, surat jalan CDAKB, dan piutang di Keuangan. Jalur ini dulunya hanya mengurangi bets
  // yang tertulis pada pesanan; sekarang bets paling cepat kedaluwarsa yang dipakai, bets terkunci
  // tidak pernah disentuh, dan pesanan tidak dikirim setengah jadi. `dari` dipakai penjaga jalur FEFO
  // dan layar demo agar umur stok dinilai pada tanggal acuan yang sama.
  public catatPengirimanSalesOrder(id: string, dari: Date = new Date()) {
    const pesananLama = this.getPenjualan().find((s) => s.id === id);
    if (!pesananLama) return { boleh: false, keterangan: 'Pesanan tidak ditemukan', nomorFaktur: '', nomorSuratJalan: '', bets: [] };
    if (pesananLama.statusKirim === 'Terkirim' || pesananLama.statusKirim === 'Diterima Fasyankes')
      return { boleh: false, keterangan: `Pesanan ${pesananLama.nomorPesanan} sudah ${pesananLama.statusKirim}`, nomorFaktur: '', nomorSuratJalan: '', bets: [] };

    const konfigurasi = this.getKonfigurasiGudang();
    const alokasi = alokasiFEFOSadarKunci({
      daftarStok: this.getStokGudang(),
      jumlahDiminta: pesananLama.jumlah,
      namaAlkes: pesananLama.namaAlkes,
      dari
    });
    if (alokasi.sisaKekurangan > 0) {
      const sebab = `Alokasi FEFO baru ${alokasi.totalDiambil} dari ${pesananLama.jumlah} unit; ${alokasi.dilewati
        .map((d) => `${d.nomorBets} dilewati (${d.sebab})`)
        .join(', ') || 'tidak ada bets cocok pada kartu stok'}`;
      this.updatePenjualan(id, { statusKirim: 'Menunggu Alokasi FEFO' }, 'Kepala Gudang');
      this.auditGudang('Pengiriman Outbound', `Pengiriman ${pesananLama.nomorPesanan} ditahan di gerbang FEFO`, pesananLama.nomorPesanan, [
        { kolom: 'alasan', nilaiLama: '-', nilaiBaru: sebab }
      ]);
      return { boleh: false, keterangan: sebab, nomorFaktur: '', nomorSuratJalan: '', bets: [] };
    }

    const rute = susunRutePicking({
      item: alokasi.usulan.map((u) => ({ binId: u.binId, nomorBets: u.nomorBets, qty: u.diambil })),
      daftarBin: this.getLokasiBin()
    });
    const gerbang = gerbangSuratJalan({
      rute: rute.langkah,
      qtyDiminta: pesananLama.jumlah,
      qtyTerkumpul: alokasi.totalDiambil,
      prefixSuratJalan: konfigurasi.prefixSuratJalan,
      nomorPesanan: pesananLama.nomorPesanan,
      dari
    });
    if (rute.penolakan || !gerbang.bolehTerbit) {
      const sebab = rute.penolakan ?? gerbang.sebab.join('; ');
      this.auditGudang('Pengiriman Outbound', `Surat jalan ${pesananLama.nomorPesanan} gagal terbit`, pesananLama.nomorPesanan, [
        { kolom: 'alasan', nilaiLama: '-', nilaiBaru: sebab }
      ]);
      return { boleh: false, keterangan: sebab, nomorFaktur: '', nomorSuratJalan: '', bets: [] };
    }

    const sjSebelum = this.getSuratJalan().find((s) => s.penjualanId === pesananLama.id || s.nomorPesanan === pesananLama.nomorPesanan);
    // Dokumen yang sudah terbit mempertahankan nomornya; gerbang hanya memberi nomor baru untuk
    // surat jalan yang belum ada, supaya rujukan pada jejak pergerakan selalu menunjuk baris yang sama.
    const nomorSuratJalan = sjSebelum?.nomorSuratJalan || gerbang.nomorSuratJalan;
    const waktuKirim = dari;
    const nomorFaktur = `FTR/${waktuKirim.getFullYear()}/${String(waktuKirim.getMonth() + 1).padStart(2, '0')}/${pesananLama.nomorPesanan.slice(-3)}`;
    const daftarStok = this.getStokGudang().map((s) => ({ ...s }));
    alokasi.usulan.forEach((u) => {
      const baris = daftarStok.find((s) => s.id === u.stokId);
      if (!baris) return;
      baris.jumlahStok = Math.max(baris.jumlahStok - u.diambil, 0);
      // Kunci pesanan dilepas secukupnya; sisa kuota terkunci tetap melindungi pesanan lain.
      baris.qtyDipesan = Math.max((baris.qtyDipesan ?? 0) - u.diambil, 0);
      baris.statusFEFO = nilaiUmurStok(baris, konfigurasi, waktuKirim).label;
    });
    this.saveStokGudang(daftarStok);

    const labelWaktu = this.labelWaktu(waktuKirim);
    alokasi.usulan.forEach((u) => {
      const baris = daftarStok.find((s) => s.id === u.stokId);
      this.catatPergerakan({
        waktu: labelWaktu,
        kodeSKU: u.kodeSKU,
        namaAlkes: u.namaAlkes,
        nomorBets: u.nomorBets,
        dariBin: u.binId,
        keBin: 'OUT-FASYANKES',
        jumlah: u.diambil,
        satuan: baris?.satuan ?? pesananLama.satuan,
        tipe: 'Pengiriman',
        pengguna: 'Kepala Gudang',
        peran: 'Operations & Technical',
        dokumenRujukan: nomorSuratJalan,
        alasan: `FEFO sadar-kunci untuk ${pesananLama.nomorPesanan}: sisa ${u.sisaSetelahAmbil} ${baris?.satuan ?? 'Unit'} pada bets ${u.nomorBets} (ED ${u.tanggalKedaluwarsa}).`
      });
    });

    const suratJalan = this.buatAtauPerbaruiSuratJalan({
      penjualanId: pesananLama.id,
      nomorPesanan: pesananLama.nomorPesanan,
      nomorSuratJalan,
      fasyankesTujuan: pesananLama.fasyankes,
      tanggalTerbit: labelWaktu.split(' ')[0],
      rute: rute.langkah,
      jarakTotalMeter: rute.jarakTotalMeter,
      qtyTotal: alokasi.totalDiambil,
      satuan: pesananLama.satuan,
      nomorFaktur
    });

    this.addTransaksi({
      id: 'INV-' + Date.now(),
      nomorFaktur,
      kategori: 'Pendapatan Alkes',
      fasyankesAtauPemasok: pesananLama.fasyankes,
      tanggal: labelWaktu.split(' ')[0],
      jumlah: pesananLama.totalHarga,
      statusPembayaran: 'Menunggu Jatuh Tempo',
      ppnStatus: 'PPN 11% Terbit Faktur Pajak'
    });

    this.updatePenjualan(id, { statusKirim: 'Terkirim', nomorFaktur }, 'Kepala Gudang & Manajer Penjualan');
    if (pesananLama.jalurPenjualan === 'e-Katalog LKPP' && alokasi.usulan.length > 0)
      this.antrekanSinkronisasiLkpp({
        kodeSKU: alokasi.usulan[0].kodeSKU,
        namaProduk: pesananLama.namaAlkes,
        nomorPaketLkpp: pesananLama.nomorPesanan,
        qtyDilaporkan: alokasi.usulan.reduce((t, u) => t + u.sisaSetelahAmbil, 0),
        satuan: pesananLama.satuan,
        pemicu: 'Pengiriman',
        nomorBets: alokasi.usulan.map((u) => u.nomorBets).join(', ')
      });
    this.sinkronkanIsiBin();

    const ringkasanBets = alokasi.usulan.map((u) => `${u.nomorBets} (${u.diambil})`).join(', ');
    this.logAudit(
      'Sales & Marketing — Order',
      'Pengiriman tereksekusi: stok FEFO berkurang & piutang terbit',
      pesananLama.nomorPesanan,
      'Manajer Penjualan',
      'Sales & Marketing',
      [
        { kolom: 'statusKirim', nilaiLama: pesananLama.statusKirim, nilaiBaru: 'Terkirim' },
        { kolom: 'nomorFaktur', nilaiLama: '-', nilaiBaru: nomorFaktur },
        { kolom: 'bets terpakai', nilaiLama: pesananLama.nomorBets, nilaiBaru: ringkasanBets },
        { kolom: 'surat jalan', nilaiLama: '-', nilaiBaru: suratJalan.nomorSuratJalan }
      ]
    );
    // Pelepasan barang secara fisik adalah tindakan Gudang: area ini harus meninggalkan jejak
    // sendiri, bukan hanya mengandalkan audit modul Sales.
    this.auditGudang(
      'Pengiriman Outbound',
      `Pelepasan ${alokasi.totalDiambil} ${pesananLama.satuan} bets ${ringkasanBets} ke ${pesananLama.fasyankes} lewat ${suratJalan.nomorSuratJalan}`,
      suratJalan.nomorSuratJalan,
      [
        { kolom: 'status surat jalan', nilaiLama: sjSebelum?.status ?? 'Antre Picking', nilaiBaru: suratJalan.status },
        { kolom: 'e-Faktur', nilaiLama: sjSebelum?.statusEFaktur ?? 'Belum Terbit', nilaiBaru: suratJalan.statusEFaktur },
        { kolom: 'rute picking', nilaiLama: `${sjSebelum?.rute.length ?? 0} langkah`, nilaiBaru: `${rute.langkah.length} langkah / ${rute.jarakTotalMeter} m${rute.hematMeter ? ` (hemat ${rute.hematMeter} m)` : ''}` }
      ]
    );
    return { boleh: true, keterangan: alokasi.keterangan, nomorFaktur, nomorSuratJalan: suratJalan.nomorSuratJalan, bets: alokasi.usulan };
  }

  // ============================ GUDANG & LOGISTIK ============================
  // Dua belas koleksi domain gudang (cetak biru Warehouse & Logistik). Seluruh tulisan melewati blok
  // ini supaya perubahan stok selalu bergerak bersama rantai hash pergerakan, riwayat panjang dipangkas
  // pada 300 baris terakhir, dan setiap mutasi meninggalkan jejak audit lama/baru.

  private readonly BATAS_RIWAYAT_GUDANG = 300;

  private auditGudang(
    area: string,
    aktivitas: string,
    rujukan: string,
    perubahan?: LogAuditTrail['perubahan'],
    pengguna = 'Kepala Gudang'
  ) {
    this.logAudit(`Gudang & Logistik — ${area}`, aktivitas, rujukan, pengguna, 'Operations & Technical', perubahan);
  }

  /** Label waktu untuk kolom `waktu` log: YYYY-MM-DD HH:MM, sama dengan format seed.
   * Tanggal dan jam diambil dari basis yang sama (jam lokal) agar tidak tercampur UTC/Lokal. */
  private labelWaktu(dari: Date = new Date()) {
    const tanggal = `${dari.getFullYear()}-${String(dari.getMonth() + 1).padStart(2, '0')}-${String(dari.getDate()).padStart(2, '0')}`;
    return `${tanggal} ${String(dari.getHours()).padStart(2, '0')}:${String(dari.getMinutes()).padStart(2, '0')}`;
  }

  /** Id sekuintial (MOV-, SJT-, ...) dihitung dari nomor terbesar yang masih tersimpan, karena
   * pemangkasan retensi membuat panjang array tidak lagi mengikuti jumlah baris yang pernah ada. */
  private idBerikut(daftar: { id: string }[], awalan: string) {
    const nomor = daftar.reduce((maks, item) => Math.max(maks, Number(item.id.slice(awalan.length)) || 0), 0);
    return `${awalan}${String(nomor + 1).padStart(3, '0')}`;
  }

  /** Rantai pergerakan disusun kronologis (tertua di indeks 0) — retensi membuang bagian awalnya. */
  private pangkasRiwayatKronologis<T>(daftar: T[]): T[] {
    return daftar.length > this.BATAS_RIWAYAT_GUDANG ? daftar.slice(daftar.length - this.BATAS_RIWAYAT_GUDANG) : daftar;
  }

  private titikDock(gudangId?: string) {
    const daftar = this.getGudangFisik();
    const indeks = Math.max(daftar.findIndex((g) => g.id === gudangId), 0);
    return `DOCK-${String(Math.min(indeks + 1, 9)).padStart(2, '0')}`;
  }

  /** Registri izin edar menyimpan nama dagang tanpa tipe model, sedangkan kartu stok mencantumkan
   * modelnya di akhir nama. Cocokkan dengan awalan (paling spesifik lebih dulu) agar bets baru dari
   * penerimaan tidak tercatat bernomor izin edar '-'. */
  private nomorIzinEdarUntuk(namaAlkes: string) {
    const kandidat = this.getIzinEdar()
      .filter((i) => namaAlkes === i.namaAlkes || namaAlkes.startsWith(`${i.namaAlkes} `))
      .sort((a, b) => b.namaAlkes.length - a.namaAlkes.length)[0];
    return kandidat?.nomorIzinEdar ?? '-';
  }

  // Tab 2 — struktur gudang fisik
  public getGudangFisik(): GudangFisik[] {
    return this.getCollection<GudangFisik>('gudang_unit', INITIAL_GUDANG_FISIK);
  }
  public saveGudangFisik(items: GudangFisik[]) {
    this.setCollection('gudang_unit', items);
  }
  public addGudangFisik(item: GudangFisik) {
    this.saveGudangFisik([item, ...this.getGudangFisik()]);
    this.auditGudang('Struktur Gudang', `Pencatatan unit gudang baru ${item.nama} (${item.tipe})`, item.id);
  }
  public ubahGudangFisik(id: string, patch: Partial<GudangFisik>) {
    const current = this.getGudangFisik();
    const lama = current.find((g) => g.id === id);
    if (!lama) return;
    this.saveGudangFisik(current.map((g) => (g.id === id ? { ...g, ...patch } : g)));
    this.auditGudang(
      'Struktur Gudang',
      'Perubahan konfigurasi unit gudang',
      lama.nama,
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as Record<string, unknown>)
    );
  }

  // Tab 2 — lokasi bin (Aisle-Row-Shelf-Bin)
  public getLokasiBin(): LokasiBin[] {
    return this.getCollection<LokasiBin>('gudang_bin', INITIAL_LOKASI_BIN);
  }
  public saveLokasiBin(items: LokasiBin[]) {
    this.setCollection('gudang_bin', items);
  }
  public addLokasiBin(item: LokasiBin) {
    this.saveLokasiBin([item, ...this.getLokasiBin()]);
    this.auditGudang('Struktur Gudang', `Pembukaan bin ${kodeBinDariLokasi(item)} (${item.zonaSuhu})`, item.id);
  }
  public ubahLokasiBin(id: string, patch: Partial<LokasiBin>) {
    const current = this.getLokasiBin();
    const lama = current.find((b) => b.id === id);
    if (!lama) return;
    this.saveLokasiBin(current.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    this.auditGudang(
      'Struktur Gudang',
      'Perubahan konfigurasi bin (zona, kapasitas, satuan)',
      kodeBinDariLokasi(lama),
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as Record<string, unknown>)
    );
  }

  /** Isi bin selalu diturunkan dari kartu stok agar rak tidak bocor setelah mutasi gudang. */
  private sinkronkanIsiBin() {
    const isi = new Map<string, number>();
    this.getStokGudang().forEach((s) => {
      if (s.binId) isi.set(s.binId, (isi.get(s.binId) ?? 0) + s.jumlahStok);
    });
    const bins = this.getLokasiBin().map((b) => ({ ...b, terpakai: isi.get(b.id) ?? 0 }));
    this.saveLokasiBin(bins);
    return bins.filter((b) => b.terpakai > b.kapasitas).map((b) => `${b.id} terpakai ${b.terpakai}/${b.kapasitas}`);
  }

  // Tab 2 & 3 — aturan directed put-away
  public getAturanSimpan(): AturanSimpan[] {
    return this.getCollection<AturanSimpan>('gudang_aturan_simpan', INITIAL_ATURAN_SIMPAN);
  }
  public saveAturanSimpan(items: AturanSimpan[]) {
    this.setCollection('gudang_aturan_simpan', items);
  }
  public addAturanSimpan(item: AturanSimpan) {
    this.saveAturanSimpan([item, ...this.getAturanSimpan()]);
    this.auditGudang('Struktur Gudang', `Pencatatan aturan simpan ${item.namaAturan} (prioritas ${item.prioritas})`, item.id, undefined, 'PJT / QA Staff');
  }
  public ubahAturanSimpan(id: string, patch: Partial<AturanSimpan>) {
    const current = this.getAturanSimpan();
    const lama = current.find((a) => a.id === id);
    if (!lama) return;
    this.saveAturanSimpan(current.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    this.auditGudang(
      'Struktur Gudang',
      'Perubahan aturan directed put-away',
      lama.namaAturan,
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as Record<string, unknown>),
      'PJT / QA Staff'
    );
  }

  // Tab 3 — kartu stok: mutasi status, kunci karantina, dan pemindahan fisik
  public ubahStokGudang(id: string, patch: Partial<StokGudang>, aktivitas = 'Perubahan kartu stok', pengguna = 'Kepala Gudang') {
    const current = this.getStokGudang();
    const lama = current.find((s) => s.id === id);
    if (!lama) return;
    this.saveStokGudang(current.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    this.auditGudang(
      'Stok & FEFO Dual-Track',
      aktivitas,
      `${lama.kodeSKU}/${lama.nomorBets}`,
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as Record<string, unknown>),
      pengguna
    );
  }

  /** Kunci karantina (aturan 2): bets keluar dari pilihan FEFO tanpa berpindah rak. */
  public kunciStokKarantina(id: string, alasan: string) {
    const current = this.getStokGudang();
    const lama = current.find((s) => s.id === id);
    if (!lama) return null;
    const patch = patchKunciStok(lama, alasan);
    this.saveStokGudang(current.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    this.auditGudang(
      'Karantina & Recall',
      'Penguncian bets pada kartu stok',
      `${lama.kodeSKU}/${lama.nomorBets}`,
      [
        { kolom: 'statusStok', nilaiLama: lama.statusStok ?? 'AVAILABLE', nilaiBaru: patch.statusStok },
        { kolom: 'alasanKunci', nilaiLama: lama.alasanKunci ?? '-', nilaiBaru: patch.alasanKunci },
        { kolom: 'tanggalDikunci', nilaiLama: lama.tanggalDikunci ?? '-', nilaiBaru: patch.tanggalDikunci }
      ],
      'PJT / QA Staff'
    );
    return patch;
  }

  /** Lepas kunci hanya boleh dilakukan rilis mutu; kartu kembali layak kirim dan FEFO memilihnya lagi. */
  public lepasKunciStok(id: string, alasan: string) {
    const current = this.getStokGudang();
    const lama = current.find((s) => s.id === id);
    if (!lama || !lama.statusStok || lama.statusStok === 'AVAILABLE') return null;
    const patch: Partial<StokGudang> = { statusStok: 'AVAILABLE', tanggalDikunci: undefined, alasanKunci: undefined };
    this.saveStokGudang(current.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    this.auditGudang(
      'Karantina & Recall',
      `Rilis mutu melepas kunci bets: ${alasan}`,
      `${lama.kodeSKU}/${lama.nomorBets}`,
      [{ kolom: 'statusStok', nilaiLama: lama.statusStok, nilaiBaru: 'AVAILABLE' }],
      'PJT / QA Staff'
    );
    return patch;
  }

  /** Pemindahan rak benar-benar memindahkan unit: kartu stok + mata rantai pergerakan + isi bin. */
  public pindahkanStokAntarBin(
    id: string,
    binTujuanId: string,
    jumlah: number,
    petugas = { pengguna: 'Kepala Gudang', peran: 'Operator Gudang' },
    dari: Date = new Date()
  ) {
    const current = this.getStokGudang().map((s) => ({ ...s }));
    const sumber = current.find((s) => s.id === id);
    const binTujuan = this.getLokasiBin().find((b) => b.id === binTujuanId);
    if (!sumber || !binTujuan) return { boleh: false, keterangan: 'Kartu stok atau bin tujuan tidak dikenal' };
    const unit = Math.min(Math.max(jumlah, 0), sumber.jumlahStok);
    if (unit <= 0) return { boleh: false, keterangan: 'Jumlah pemindahan nol atau stok habis' };

    const sasaran = current.find((s) => s.kodeSKU === sumber.kodeSKU && s.nomorBets === sumber.nomorBets && s.binId === binTujuanId);
    sumber.jumlahStok -= unit;
    sumber.statusFEFO = nilaiUmurStok(sumber, this.getKonfigurasiGudang(), dari).label;
    if (sasaran) sasaran.jumlahStok += unit;
    else
      current.push({
        ...sumber,
        id: this.idBerikut(current, 'STK-'),
        gudangId: binTujuan.gudangId,
        binId: binTujuan.id,
        lokasiPenyimpanan: kodeBinDariLokasi(binTujuan),
        zonaSuhu: binTujuan.zonaSuhu,
        jumlahStok: unit,
        satuan: binTujuan.satuan,
        qtyDipesan: 0,
        nomorSerial: undefined,
        rfidTagId: binTujuan.rfidTagId
      });
    this.saveStokGudang(current);
    this.catatPergerakan({
      waktu: this.labelWaktu(dari),
      kodeSKU: sumber.kodeSKU,
      namaAlkes: sumber.namaAlkes,
      nomorBets: sumber.nomorBets,
      dariBin: sumber.binId ?? this.titikDock(sumber.gudangId),
      keBin: binTujuanId,
      jumlah: unit,
      satuan: binTujuan.satuan,
      tipe: 'Pemindahan Rak',
      pengguna: petugas.pengguna,
      peran: petugas.peran,
      dokumenRujukan: `PINDAH/${dari.getFullYear()}/${sumber.nomorBets}`,
      alasan: `Pemindahan terarah dari ${sumber.binId ?? '-'} ke ${kodeBinDariLokasi(binTujuan)} (${binTujuan.zonaSuhu}).`
    });
    const meluap = this.sinkronkanIsiBin();
    this.auditGudang('Stok & FEFO Dual-Track', `Pemindahan ${unit} ${binTujuan.satuan} bets ${sumber.nomorBets}`, sumber.kodeSKU, [
      { kolom: 'binId', nilaiLama: sumber.binId ?? '-', nilaiBaru: binTujuanId },
      ...(meluap.length ? [{ kolom: 'kapasitas bin', nilaiLama: '-', nilaiBaru: meluap.join('; ') }] : [])
    ]);
    return { boleh: true, keterangan: `${unit} ${binTujuan.satuan} pindah ke ${kodeBinDariLokasi(binTujuan)}${meluap.length ? ` — peringatan kapasitas: ${meluap.join('; ')}` : ''}`, jumlah: unit };
  }

  // Tab 3 — rantai pergerakan (satu-satunya jalan menulis log; id & hash dihitung util)
  public getJejakPergerakan(): JejakPergerakan[] {
    return this.getCollection<JejakPergerakan>('gudang_pergerakan', INITIAL_JEJAK_PERGERAKAN);
  }
  public saveJejakPergerakan(items: JejakPergerakan[]) {
    this.setCollection('gudang_pergerakan', this.pangkasRiwayatKronologis(items));
  }
  public catatPergerakan(entri: EntriPergerakanBaru): JejakPergerakan {
    const daftar = this.getJejakPergerakan();
    const terbaru = tambahJejakPergerakan(daftar, { ...entri, id: entri.id ?? this.idBerikut(daftar, 'MOV-') });
    const baris = terbaru[terbaru.length - 1];
    this.saveJejakPergerakan(terbaru);
    return baris;
  }

  // Tab 4 & 5 — log suhu dan pengendalian hama dengan audit area
  public catatLogSuhu(item: LogSuhu) {
    this.saveLogSuhu([item, ...this.getLogSuhu()].slice(0, 50));
    this.auditGudang('Rantai Dingin', `Pembacaan sensor ${item.sensor}: ${item.suhu}°C / ${item.kelembaban}% (${item.status})`, item.id, undefined, 'Operator Gudang');
  }
  public catatInspeksiHama(item: LogPestControl) {
    this.savePestControl([item, ...this.getPestControl()]);
    this.auditGudang('Sanitasi & Pengendalian Hama', `Inspeksi ${item.metode} di ${item.area}: ${item.hasilTemuan}`, item.id, undefined, 'Petugas Sanitasi');
  }

  // Tab 6 — penerimaan (inbound)
  public getTerimaBarang(): TerimaBarang[] {
    return this.getCollection<TerimaBarang>('gudang_penerimaan', INITIAL_TERIMA_BARANG);
  }
  public saveTerimaBarang(items: TerimaBarang[]) {
    this.setCollection('gudang_penerimaan', items);
  }
  public addTerimaBarang(item: TerimaBarang) {
    this.saveTerimaBarang([item, ...this.getTerimaBarang()]);
    this.auditGudang('Penerimaan Inbound', `Pencatatan dokumen penerimaan ${item.nomorTerima} dari ${item.namaPemasok}`, item.nomorTerima, undefined, 'Operator Gudang');
  }
  public ubahTerimaBarang(id: string, patch: Partial<TerimaBarang>, aktivitas = 'Perubahan dokumen penerimaan') {
    const current = this.getTerimaBarang();
    const lama = current.find((t) => t.id === id);
    if (!lama) return;
    this.saveTerimaBarang(current.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    this.auditGudang(
      'Penerimaan Inbound',
      aktivitas,
      lama.nomorTerima,
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as Record<string, unknown>),
      'Operator Gudang'
    );
  }

  /** Posting inbound: baris penerimaan menjadi kartu stok + mata rantai pergerakan, sekali saja. */
  public releasePenerimaanKeStok(id: string, petugas = { pengguna: 'Kepala Gudang', peran: 'Operator Gudang' }, dari = new Date()) {
    const dokumen = this.getTerimaBarang().find((t) => t.id === id);
    if (!dokumen) return { boleh: false, keterangan: 'Dokumen penerimaan tidak ditemukan', barisDiposting: 0, binMeluap: [] as string[] };
    // Posting hanya sekali: penanda pada dokumen dan jejak pergerakan yang sudah memakai nomor terima.
    const sudahTercatat = this.getJejakPergerakan().some((m) => m.dokumenRujukan === dokumen.nomorTerima && ['Penerimaan', 'Karantina'].includes(m.tipe));
    if (dokumen.sudahDipostingKeStok || sudahTercatat)
      return { boleh: false, keterangan: `${dokumen.nomorTerima} sudah diposting ke kartu stok`, barisDiposting: 0, binMeluap: [] };
    if (dokumen.hasilQCMasuk === 'Tolak (Rejected)')
      return { boleh: false, keterangan: 'QC masuk menolak barang — kembalikan ke pemasok, jangan posting ke rak', barisDiposting: 0, binMeluap: [] };

    const daftarStok = this.getStokGudang().map((s) => ({ ...s }));
    const daftarBin = this.getLokasiBin();
    const konfigurasi = this.getKonfigurasiGudang();

    // Prakalkulasi kapasitas: seluruh baris harus muat sebelum satu unit pun ditulis, supaya
    // dokumen tidak setengah terposting dengan mata rantai pergerakan di belakangnya.
    const penghunian = new Map<string, number>();
    daftarStok.forEach((s) => {
      if (s.binId) penghunian.set(s.binId, (penghunian.get(s.binId) ?? 0) + s.jumlahStok);
    });
    const hambatan: string[] = [];
    dokumen.baris.forEach((r) => {
      if (r.qtyDiterima <= 0) return;
      const bin = daftarBin.find((b) => b.id === r.binTujuanId);
      if (!bin) {
        hambatan.push(`${r.nomorBets}: bin tujuan ${r.binTujuanId} tidak dikenal`);
        return;
      }
      const sisa = bin.kapasitas - (penghunian.get(bin.id) ?? 0);
      if (r.qtyDiterima > sisa)
        hambatan.push(`${r.nomorBets}: ${r.qtyDiterima} ${r.satuan} melebihi sisa kapasitas ${kodeBinDariLokasi(bin)} (${sisa} ${bin.satuan}) — susun ulang directed put-away`);
      penghunian.set(bin.id, (penghunian.get(bin.id) ?? 0) + r.qtyDiterima);
    });
    if (hambatan.length) return { boleh: false, keterangan: hambatan.join('; '), barisDiposting: 0, binMeluap: [] };

    const waktu = dari;
    let barisDiposting = 0;

    dokumen.baris.forEach((r) => {
      if (r.qtyDiterima <= 0) return;
      const bin = daftarBin.find((b) => b.id === r.binTujuanId);
      if (!bin) return;
      const perluKarantina =
        dokumen.hasilQCMasuk === 'Karantina (Hold)' ||
        (dokumen.butuhUjiFungsi && dokumen.hasilUjiFungsi !== 'Lolos Parameter Klinis') ||
        dokumen.hasilUjiFungsi === 'Tidak Layak Pakai';
      const alasanKunci = `QC ${dokumen.hasilQCMasuk} / uji fungsi ${dokumen.hasilUjiFungsi} pada ${dokumen.nomorTerima}`;
      const existing = daftarStok.find((s) => s.kodeSKU === r.kodeSKU && s.nomorBets === r.nomorBets && s.binId === bin.id);
      const statusFEFO = nilaiUmurStok({ tanggalKedaluwarsa: r.tanggalKedaluwarsa }, konfigurasi, waktu).label;
      if (existing) {
        existing.jumlahStok += r.qtyDiterima;
        existing.statusFEFO = statusFEFO;
        if (perluKarantina) Object.assign(existing, patchKunciStok(existing, alasanKunci, waktu));
      } else {
        daftarStok.push({
          id: this.idBerikut(daftarStok, 'STK-'),
          kodeSKU: r.kodeSKU,
          namaAlkes: r.namaAlkes,
          nomorIzinEdar: this.nomorIzinEdarUntuk(r.namaAlkes),
          nomorBets: r.nomorBets,
          lokasiPenyimpanan: kodeBinDariLokasi(bin),
          zonaSuhu: bin.zonaSuhu,
          jumlahStok: r.qtyDiterima,
          satuan: r.satuan,
          tanggalMasuk: dokumen.tanggalTerima,
          tanggalKedaluwarsa: r.tanggalKedaluwarsa,
          statusFEFO,
          gudangId: bin.gudangId,
          binId: bin.id,
          statusStok: perluKarantina ? 'QUARANTINE' : 'AVAILABLE',
          qtyDipesan: 0,
          jalur: 'A',
          ...(perluKarantina ? { tanggalDikunci: waktu.toISOString().split('T')[0], alasanKunci } : {})
        });
      }
      this.catatPergerakan({
        waktu: this.labelWaktu(waktu),
        kodeSKU: r.kodeSKU,
        namaAlkes: r.namaAlkes,
        nomorBets: r.nomorBets,
        dariBin: this.titikDock(bin.gudangId),
        keBin: bin.id,
        jumlah: r.qtyDiterima,
        satuan: r.satuan,
        tipe: perluKarantina ? 'Karantina' : 'Penerimaan',
        pengguna: petugas.pengguna,
        peran: petugas.peran,
        dokumenRujukan: dokumen.nomorTerima,
        alasan: perluKarantina
          ? `Barang masuk bin tetapi status terkunci: ${alasanKunci}. Rilis menunggu PJT.`
          : `Penerimaan ${dokumen.nomorPurchaseOrder} lolos QC ${dokumen.nomorLaporanQC || 'tanpa nomor laporan'}; bets dirilis ke ${kodeBinDariLokasi(bin)}.`
      });
      barisDiposting += 1;
    });

    if (barisDiposting === 0) return { boleh: false, keterangan: 'Tidak ada baris dengan qtyDiterima > 0 dan bin tujuan dikenal', barisDiposting, binMeluap: [] };
    this.saveStokGudang(daftarStok);
    const binMeluap = this.sinkronkanIsiBin();
    this.ubahTerimaBarang(id, { sudahDipostingKeStok: true }, `Posting ${barisDiposting} baris penerimaan ke kartu stok`);
    return { boleh: true, keterangan: `${barisDiposting} baris masuk rak${binMeluap.length ? ` — peringatan kapasitas: ${binMeluap.join('; ')}` : ''}`, barisDiposting, binMeluap };
  }

  // Tab 7 — surat jalan (outbound)
  public getSuratJalan(): SuratJalan[] {
    return this.getCollection<SuratJalan>('gudang_surat_jalan', INITIAL_SURAT_JALAN);
  }
  public saveSuratJalan(items: SuratJalan[]) {
    this.setCollection('gudang_surat_jalan', items);
  }
  public addSuratJalan(item: SuratJalan) {
    this.saveSuratJalan([item, ...this.getSuratJalan()]);
    this.auditGudang('Pengiriman Outbound', `Penerbitan surat jalan ${item.nomorSuratJalan}`, item.nomorSuratJalan);
  }
  public ubahSuratJalan(id: string, patch: Partial<SuratJalan>, aktivitas = 'Perubahan surat jalan') {
    const current = this.getSuratJalan();
    const lama = current.find((s) => s.id === id);
    if (!lama) return;
    this.saveSuratJalan(current.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    this.auditGudang(
      'Pengiriman Outbound',
      aktivitas,
      lama.nomorSuratJalan,
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as Record<string, unknown>)
    );
  }
  private buatAtauPerbaruiSuratJalan(params: {
    penjualanId: string;
    nomorPesanan: string;
    nomorSuratJalan: string;
    fasyankesTujuan: string;
    tanggalTerbit: string;
    rute: LangkahPicking[];
    jarakTotalMeter: number;
    qtyTotal: number;
    satuan: string;
    nomorFaktur: string;
  }): SuratJalan {
    const current = this.getSuratJalan().map((s) => ({ ...s }));
    const patch: Partial<SuratJalan> = {
      status: 'Terkirim',
      rute: params.rute,
      jarakTotalMeter: params.jarakTotalMeter,
      qtyTotal: params.qtyTotal,
      nomorFaktur: params.nomorFaktur,
      statusEFaktur: 'Terbit'
    };
    const lama = current.find((s) => s.penjualanId === params.penjualanId || s.nomorPesanan === params.nomorPesanan);
    if (lama) {
      Object.assign(lama, patch);
      this.saveSuratJalan(current);
      return lama;
    }
    const baru: SuratJalan = {
      id: this.idBerikut(current, 'SJT-'),
      nomorSuratJalan: params.nomorSuratJalan,
      nomorPesanan: params.nomorPesanan,
      penjualanId: params.penjualanId,
      fasyankesTujuan: params.fasyankesTujuan,
      tanggalTerbit: params.tanggalTerbit,
      status: 'Terkirim',
      rute: params.rute,
      jarakTotalMeter: params.jarakTotalMeter,
      qtyTotal: params.qtyTotal,
      satuan: params.satuan,
      pengangkut: 'Armada Internal',
      namaKurir: '',
      nomorLacak: '',
      statusEFaktur: 'Terbit',
      nomorFaktur: params.nomorFaktur,
      nomorPaketLkpp: '',
      statusSyncLkpp: 'Tidak Berlaku',
      penanggungJawab: 'Kepala Gudang',
      catatan: 'Terbit otomatis dari eksekusi FEFO modul Gudang.'
    };
    this.saveSuratJalan([baru, ...current]);
    return baru;
  }

  /** Susun rute picking atas surat jalan yang masih antre, memakai alokasi FEFO sadar-kunci. */
  public susunRuteSuratJalan(id: string, dari: Date = new Date()) {
    const suratJalan = this.getSuratJalan().find((s) => s.id === id);
    if (!suratJalan) return { boleh: false, keterangan: 'Surat jalan tidak ditemukan' };
    const pesanan = this.getPenjualan().find((s) => s.id === suratJalan.penjualanId || s.nomorPesanan === suratJalan.nomorPesanan);
    if (!pesanan) return { boleh: false, keterangan: `Pesanan ${suratJalan.nomorPesanan} tidak ditemukan pada modul Sales` };
    const konfigurasi = this.getKonfigurasiGudang();
    const alokasi = alokasiFEFOSadarKunci({ daftarStok: this.getStokGudang(), jumlahDiminta: pesanan.jumlah, namaAlkes: pesanan.namaAlkes, dari });
    const rute = susunRutePicking({
      item: alokasi.usulan.map((u) => ({ binId: u.binId, nomorBets: u.nomorBets, qty: u.diambil })),
      daftarBin: this.getLokasiBin()
    });
    const gerbang = gerbangSuratJalan({
      rute: rute.langkah,
      qtyDiminta: pesanan.jumlah,
      qtyTerkumpul: alokasi.totalDiambil,
      prefixSuratJalan: konfigurasi.prefixSuratJalan,
      nomorPesanan: pesanan.nomorPesanan,
      dari
    });
    if (rute.penolakan || !gerbang.bolehTerbit)
      return { boleh: false, keterangan: rute.penolakan ?? gerbang.sebab.join('; ') };
    this.ubahSuratJalan(
      id,
      { rute: rute.langkah, jarakTotalMeter: rute.jarakTotalMeter, qtyTotal: alokasi.totalDiambil, status: 'Rute Tersusun', nomorSuratJalan: gerbang.nomorSuratJalan },
      `Rute picking ${rute.langkah.length} langkah tersusun untuk ${pesanan.nomorPesanan}`
    );
    return {
      boleh: true,
      keterangan: `${gerbang.nomorSuratJalan} — ${rute.langkah.length} langkah, ${rute.jarakTotalMeter} m (hemat ${rute.hematMeter} m lewat lorong ${rute.lorongTerlibat.join(', ')})`
    };
  }

  // Tab 8 — opname & cycle count
  public getOpnameStok(): OpnameStok[] {
    return this.getCollection<OpnameStok>('gudang_opname', INITIAL_OPNAME_STOK);
  }
  public saveOpnameStok(items: OpnameStok[]) {
    this.setCollection('gudang_opname', items);
  }
  public addOpnameStok(item: OpnameStok) {
    this.saveOpnameStok([item, ...this.getOpnameStok()]);
    this.auditGudang('Opname & Cycle Count', `Pembukaan opname ${item.metode} ${item.nomorOpname} di ${item.cakupanZona}`, item.nomorOpname, undefined, 'Operator Gudang');
  }
  public ubahOpnameStok(id: string, patch: Partial<OpnameStok>, aktivitas = 'Perubahan lembar opname') {
    const current = this.getOpnameStok();
    const lama = current.find((o) => o.id === id);
    if (!lama) return;
    this.saveOpnameStok(current.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    this.auditGudang(
      'Opname & Cycle Count',
      aktivitas,
      lama.nomorOpname,
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as unknown as Record<string, unknown>),
      'Operator Gudang'
    );
  }

  /** Hitung buta: selisih dihitung util dan status dokumen mengikuti keputusan ambang di util. */
  public ajukanSelisihOpname(id: string) {
    const lama = this.getOpnameStok().find((o) => o.id === id);
    if (!lama) return null;
    const hasil = hitungSelisihOpname(lama, this.getKonfigurasiGudang());
    this.ubahOpnameStok(id, { status: hasil.statusSetelahHitung, selisihUnit: hasil.selisihUnit }, `Perhitungan selisih opname ${lama.nomorOpname}`);
    return { hasil, status: hasil.statusSetelahHitung };
  }

  /** Verifikasi PJT: penyesuaian menjadi mata rantai pergerakan dan kartu stok disamakan dengan fisik. */
  public verifikasiSelisihOpname(
    id: string,
    petugas = { pengguna: 'PJT / QA Staff', peran: 'Penanggung Jawab' },
    alasan = '',
    dari: Date = new Date()
  ) {
    const lama = this.getOpnameStok().find((o) => o.id === id);
    if (!lama) return { boleh: false, keterangan: 'Dokumen opname tidak ditemukan' };
    const hasil = hitungSelisihOpname(lama, this.getKonfigurasiGudang());
    if (hasil.barisBelumDihitung > 0) return { boleh: false, keterangan: `${hasil.barisBelumDihitung} baris belum dihitung fisik — opname belum boleh diverifikasi` };

    // Rantai ditulis pada jam posting (bukan tanggal dokumen) agar urutan waktu log tetap naik;
    // tanggal opname tetap terbaca dari nomor rujukan dan lembar dokumennya.
    const entri = usulkanPenyesuaianOpname(lama, hasil, petugas, this.getStokGudang());
    entri.forEach((e) => this.catatPergerakan({ ...e, waktu: this.labelWaktu(dari) }));

    const daftarStok = this.getStokGudang().map((s) => ({ ...s }));
    lama.baris.forEach((b) => {
      if (b.qtyFisik === null) return;
      const baris = daftarStok.find((s) => s.binId === b.binId && s.nomorBets === b.nomorBets);
      if (baris) baris.jumlahStok = b.qtyFisik;
    });
    this.saveStokGudang(daftarStok);
    const binMeluap = this.sinkronkanIsiBin();
    this.ubahOpnameStok(
      id,
      { status: 'Selesai', verifikasiPJT: true, alasanSelisih: alasan || lama.alasanSelisih },
      `Verifikasi PJT atas ${entri.length} penyesuaian opname`
    );
    return { boleh: true, keterangan: `${entri.length} penyesuaian dibukukan${binMeluap.length ? ` — peringatan kapasitas: ${binMeluap.join('; ')}` : ''}`, penyesuaian: entri.length };
  }

  // Tab 9 — ambang min/max & reorder point
  public getAmbangStok(): AmbangStok[] {
    return this.getCollection<AmbangStok>('gudang_ambang', INITIAL_AMBANG_STOK);
  }
  public saveAmbangStok(items: AmbangStok[]) {
    this.setCollection('gudang_ambang', items);
  }
  public addAmbangStok(item: AmbangStok) {
    this.saveAmbangStok([item, ...this.getAmbangStok()]);
    this.auditGudang('Optimasi Stok', `Pencatatan ambang min/max ${item.kodeSKU} (titik pesan ${item.minStok})`, item.kodeSKU, undefined, 'Perencana Stok');
  }
  public ubahAmbangStok(id: string, patch: Partial<AmbangStok>) {
    const current = this.getAmbangStok();
    const lama = current.find((a) => a.id === id);
    if (!lama) return;
    this.saveAmbangStok(current.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    this.auditGudang(
      'Optimasi Stok',
      'Perubahan ambang min/max & lead time',
      lama.kodeSKU,
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as Record<string, unknown>),
      'Perencana Stok'
    );
  }

  // Tab 10 — handheld & RFID
  public getKejadianScanner(): KejadianScanner[] {
    return this.getCollection<KejadianScanner>('gudang_scanner', INITIAL_KEJADIAN_SCANNER);
  }
  public saveKejadianScanner(items: KejadianScanner[]) {
    // Perangkat handheld menulis terbaru di depan; retensi 300 kejadian terakhir mengikuti pola log suhu.
    this.setCollection('gudang_scanner', items.slice(0, this.BATAS_RIWAYAT_GUDANG));
  }
  public catatPemindaian(params: {
    perangkat: string;
    tipePerangkat: KejadianScanner['tipePerangkat'];
    protokol: KejadianScanner['protokol'];
    mode: KejadianScanner['mode'];
    binDipindai: string;
    produkDipindai: string;
    nomorBets: string;
    jumlah: number;
    rujukanDokumen: string;
    zonaSuhuDibutuhkan?: StokGudang['zonaSuhu'];
    qtyManifes?: number;
    sudahTervalidasi?: number;
  }) {
    const hasil = validasiPemindaian({
      daftarBin: this.getLokasiBin(),
      daftarStok: this.getStokGudang(),
      mode: params.mode,
      binDipindai: params.binDipindai,
      nomorBets: params.nomorBets,
      jumlah: params.jumlah,
      zonaSuhuDibutuhkan: params.zonaSuhuDibutuhkan,
      qtyManifes: params.qtyManifes,
      sudahTervalidasi: params.sudahTervalidasi
    });
    const kejadian: KejadianScanner = {
      id: this.idBerikut(this.getKejadianScanner(), 'SCN-'),
      waktu: this.labelWaktu(),
      perangkat: params.perangkat,
      tipePerangkat: params.tipePerangkat,
      protokol: params.protokol,
      mode: params.mode,
      binDipindai: params.binDipindai,
      produkDipindai: params.produkDipindai,
      nomorBets: params.nomorBets,
      jumlah: params.jumlah,
      rujukanDokumen: params.rujukanDokumen,
      hasilValidasi: hasil.hasil,
      catatan: hasil.sebab
    };
    this.saveKejadianScanner([kejadian, ...this.getKejadianScanner()]);
    this.auditGudang(
      'Scanner & RFID',
      `${hasil.bolehDiproses ? 'Pemindaian diterima' : 'Pemindaian ditolak'}: ${hasil.hasil}`,
      `${params.perangkat} @ ${params.binDipindai || params.rujukanDokumen}`,
      [{ kolom: 'validasi', nilaiLama: '-', nilaiBaru: hasil.sebab }],
      'Operator Gudang'
    );
    return { kejadian, hasil };
  }

  // Tab 12 — antrean e-Katalog LKPP
  public getSinkronisasiLkpp(): SinkronisasiLkpp[] {
    return this.getCollection<SinkronisasiLkpp>('gudang_lkpp_sync', INITIAL_SINKRONISASI_LKPP);
  }
  public saveSinkronisasiLkpp(items: SinkronisasiLkpp[]) {
    this.setCollection('gudang_lkpp_sync', items.slice(0, this.BATAS_RIWAYAT_GUDANG));
  }
  public antrekanSinkronisasiLkpp(params: {
    kodeSKU: string;
    namaProduk: string;
    nomorPaketLkpp: string;
    qtyDilaporkan: number;
    satuan: string;
    pemicu: SinkronisasiLkpp['pemicu'];
    nomorBets?: string;
  }) {
    const payload = bangunPayloadLkpp({ konfigurasi: this.getKonfigurasiGudang(), ...params });
    const antrean: SinkronisasiLkpp = { id: this.idBerikut(this.getSinkronisasiLkpp(), 'LKP-'), ...entriAntreanLkpp(payload) };
    this.saveSinkronisasiLkpp([antrean, ...this.getSinkronisasiLkpp()]);
    this.auditGudang('Kemenkes RI', `Antrean webhook LKPP ${params.pemicu} untuk ${params.kodeSKU}`, antrean.id, [{ kolom: 'payload', nilaiLama: '-', nilaiBaru: payload.keterangan }]);
    return { antrean, payload };
  }
  public ubahStatusSinkronisasiLkpp(id: string, status: SinkronisasiLkpp['status'], pesanRespons: string) {
    const current = this.getSinkronisasiLkpp();
    const lama = current.find((l) => l.id === id);
    if (!lama) return;
    const baru: SinkronisasiLkpp =
      status === 'Gagal' || status === 'Ditolak' ? tandaiGagalLkpp(lama, pesanRespons) : { ...lama, status, pesanRespons, waktu: this.labelWaktu() };
    this.saveSinkronisasiLkpp(current.map((l) => (l.id === id ? baru : l)));
    this.auditGudang('Kemenkes RI', `Status sinkronisasi LKPP menjadi ${status} (percobaan ${baru.percobaan})`, id, [
      { kolom: 'status', nilaiLama: lama.status, nilaiBaru: status },
      { kolom: 'pesanRespons', nilaiLama: lama.pesanRespons, nilaiBaru: pesanRespons }
    ]);
  }

  // Tab 12 — kiriman SATUSEHAT (HL7 FHIR)
  public getKirimanSatuSehat(): KirimanSatuSehat[] {
    return this.getCollection<KirimanSatuSehat>('gudang_satusehat', INITIAL_KIRIMAN_SATU_SEHAT);
  }
  public saveKirimanSatuSehat(items: KirimanSatuSehat[]) {
    this.setCollection('gudang_satusehat', items.slice(0, this.BATAS_RIWAYAT_GUDANG));
  }
  public catatKirimanSatuSehat(params: Omit<Parameters<typeof bangunBundleFhir>[0], 'konfigurasi'>) {
    const daftar = this.getKirimanSatuSehat();
    const bangun = bangunBundleFhir({ konfigurasi: this.getKonfigurasiGudang(), ...params });
    const draf: KirimanSatuSehat = {
      id: this.idBerikut(daftar, 'FHR-'),
      waktu: this.labelWaktu(),
      tipeSumberDaya: params.tipeSumberDaya,
      nomorRujukan: params.nomorRujukan,
      kodeFasyankes: params.kodeFasyankes ?? '',
      namaFasyankes: params.namaFasyankes ?? '',
      nomorBets: params.nomorBets ?? '',
      nomorSerial: params.nomorSerial ?? '',
      suhuRantaiDingin: params.suhuRantaiDingin ?? '-',
      status: bangun.statusSumberDaya,
      payloadJson: bangun.payloadJson,
      catatan: bangun.ringkas.join(' / ')
    };
    const validasi = validasiKirimanSatuSehat({ kiriman: draf, daftarKiriman: daftar, konfigurasi: this.getKonfigurasiGudang() });
    const kiriman: KirimanSatuSehat = { ...draf, status: validasi.statusUsulan };
    this.saveKirimanSatuSehat([kiriman, ...daftar]);
    this.auditGudang(
      'Kemenkes RI',
      validasi.layakKirim
        ? `Payload ${kiriman.tipeSumberDaya} ${kiriman.nomorRujukan} masuk antrean SATUSEHAT`
        : `Payload ${kiriman.tipeSumberDaya} ${kiriman.nomorRujukan} ditahan: ${validasi.sebab.join('; ')}`,
      kiriman.id,
      [{ kolom: 'status', nilaiLama: '-', nilaiBaru: kiriman.status }]
    );
    return { kiriman, validasi, endpoint: bangun.endpoint };
  }
  public ubahStatusKirimanSatuSehat(id: string, status: KirimanSatuSehat['status'], catatan: string) {
    const current = this.getKirimanSatuSehat();
    const lama = current.find((k) => k.id === id);
    if (!lama) return;
    this.saveKirimanSatuSehat(current.map((k) => (k.id === id ? { ...k, status, catatan: catatan || k.catatan } : k)));
    this.auditGudang('Kemenkes RI', `Tanggapan SATUSEHAT atas ${lama.tipeSumberDaya} ${lama.nomorRujukan}: ${status}`, id, [
      { kolom: 'status', nilaiLama: lama.status, nilaiBaru: status },
      { kolom: 'catatan', nilaiLama: lama.catatan, nilaiBaru: catatan || lama.catatan }
    ]);
  }

  // Konfigurasi modul — ambang, prefix dokumen, endpoint (tanpa token)
  public getKonfigurasiGudang(): KonfigurasiGudang {
    return this.getJson<KonfigurasiGudang>('gudang_pengaturan') ?? KONFIGURASI_GUDANG_AWAL;
  }
  public saveKonfigurasiGudang(patch: Partial<KonfigurasiGudang>) {
    const lama = this.getKonfigurasiGudang();
    this.setJson('gudang_pengaturan', { ...lama, ...patch });
    this.auditGudang(
      'Konfigurasi Gudang',
      'Perubahan ambang, prefix dokumen, dan endpoint Kemenkes RI / LKPP',
      'Konfigurasi Gudang',
      this.bentangPerubahan(lama as unknown as Record<string, unknown>, patch as Record<string, unknown>)
    );
  }

  // Finance
  public getTransaksi(): TransaksiKeuangan[] {
    return this.getCollection<TransaksiKeuangan>('transaksi', INITIAL_TRANSAKSI);
  }
  public saveTransaksi(items: TransaksiKeuangan[]) {
    this.setCollection('transaksi', items);
  }
  public addTransaksi(item: TransaksiKeuangan) {
    const current = this.getTransaksi();
    this.saveTransaksi([item, ...current]);
  }

  // Audit Trail (Data Integrity ISO 13485 & CDAKB)
  public getAuditTrail(): LogAuditTrail[] {
    return this.getCollection<LogAuditTrail>('audit_trail', INITIAL_AUDIT_TRAIL);
  }
  public logAudit(
    modul: string,
    aktivitas: string,
    nomorReferensi: string,
    pengguna = 'PJT / QA Staff',
    peran = 'Penanggung Jawab',
    perubahan?: LogAuditTrail['perubahan']
  ) {
    const now = new Date();
    const waktuWIB = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString('id-ID')} WIB`;
    const current = this.getAuditTrail();
    // beberapa perubahan tercatat pada milidetik yang sama; id harus tetap unik agar daftar audit tidak dobel
    let id = 'LOG-' + now.getTime();
    for (let seq = 1; current.some((e) => e.id === id); seq += 1) id = `LOG-${now.getTime()}-${seq}`;
    const newEntry: LogAuditTrail = {
      id,
      waktu: waktuWIB,
      pengguna,
      peran,
      modul,
      aktivitas,
      nomorReferensi,
      statusIntegritas: 'Tervalidasi Digital',
      ...(perubahan && perubahan.length > 0 ? { perubahan } : {})
    };
    const updated = [newEntry, ...current.slice(0, 99)];
    this.setCollection('audit_trail', updated);
  }

  // --- Website (CMS Konten Situs Publik) ---
  // Draf dan versi terbit disimpan terpisah (pola dashboard website bejo-pos):
  // suntingan harian masuk draf, publik hanya membaca snapshot terbit.

  private getJson<T>(key: string): T | null {
    try {
      const tersimpan = localStorage.getItem(STORAGE_PREFIX + key);
      if (!tersimpan) return null;
      return JSON.parse(tersimpan) as T;
    } catch {
      return null;
    }
  }

  private setJson<T>(key: string, data: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
      this.notify(key);
    } catch (e) {
      console.error(`Gagal menyimpan konfigurasi ${key}:`, e);
    }
  }

  /** Kumpulan data aplikasi yang menjadi sumber konten situs. */
  public getSumberKontenWebsite(): SumberKontenWebsite {
    return {
      izinEdar: this.getIzinEdar(),
      sertifikat: this.getSertifikat(),
      pemasok: this.getPemasok(),
      pelanggan: this.getPelangganB2B(),
      kampanye: this.getKampanye(),
      teritorial: this.getTeritorial(),
      stok: this.getStokGudang(),
      pengetahuanProduk: this.getPengetahuanProduk(),
      skemaHarga: this.getSkemaHarga(),
      rebate: this.getProgramRebate(),
      garansi: this.getGaransiInstalasi()
    };
  }

  /** Kumpulan data operasional terkini untuk penyelarasan real-time status stok & harga di situs publik. */
  public getSumberOperasionalWebsite(): SumberOperasionalWebsite {
    return {
      izinEdar: this.getIzinEdar(),
      stok: this.getStokGudang(),
      unitSerial: this.getUnitSerial(),
      penarikan: this.getPenarikanProduk(),
      skemaHarga: this.getSkemaHarga(),
      kontrakHarga: this.getKontrakHarga(),
      pengetahuanProduk: this.getPengetahuanProduk(),
      rebate: this.getProgramRebate()
    };
  }

  public getWebsiteDraft(): KonfigurasiSitus {
    const tersimpan = this.getJson<KonfigurasiSitus>('website_draft');
    const versiTersimpan = this.getJson<number>('website_content_v');
    if (tersimpan && versiTersimpan === VERSI_KONTEN_WEBSITE) return tersimpan;
    const awal = bangunKontenDefault(this.getSumberKontenWebsite());
    const hasil = tersimpan ? padukanKonten(tersimpan, awal) : awal;
    this.setJson('website_draft', hasil);
    this.setJson('website_content_v', VERSI_KONTEN_WEBSITE);
    return hasil;
  }

  /** Snapshot yang sedang tayang; null bila belum pernah diterbitkan. */
  public getWebsiteTerbit(): KonfigurasiSitus | null {
    return this.getJson<KonfigurasiSitus>('website_published');
  }

  public simpanWebsiteDraft(draf: KonfigurasiSitus, pengguna: string, peran: string) {
    const lama = this.getWebsiteDraft();
    const baru: KonfigurasiSitus = {
      ...draf,
      lastModifiedAt: Date.now(),
      lastModifiedBy: pengguna
    };
    this.setJson('website_draft', baru);
    this.logAudit(
      'Website — Konten Situs Publik',
      'Penyimpanan draf konten website',
      'DRAF-WEBSITE',
      pengguna,
      peran,
      diffKonfigurasi(lama, baru)
    );
    return baru;
  }

  public sinkronkanWebsiteDraft(pengguna: string, peran: string) {
    const lama = this.getWebsiteDraft();
    const baru = sinkronkanKonten(lama, this.getSumberKontenWebsite());
    baru.lastModifiedAt = Date.now();
    baru.lastModifiedBy = pengguna;
    this.setJson('website_draft', baru);
    this.logAudit(
      'Website — Konten Situs Publik',
      'Sinkronisasi konten situs dengan data aplikasi (izin edar, sertifikat, pelanggan, kampanye)',
      'DRAF-WEBSITE',
      pengguna,
      peran,
      diffKonfigurasi(lama, baru)
    );
    return { lama, baru };
  }

  /** Terbitkan: salinan draf menjadi snapshot tayang dan tercatat pada audit trail. */
  public terbitkanWebsite(pengguna: string, peran: string) {
    const draf = this.getWebsiteDraft();
    const lama = this.getWebsiteTerbit();
    const snapshot: KonfigurasiSitus = {
      ...draf,
      isPublished: true,
      lastPublishedAt: Date.now()
    };
    this.setJson('website_published', snapshot);
    this.setJson('website_draft', { ...draf, isPublished: true, lastPublishedAt: snapshot.lastPublishedAt });
    this.logAudit(
      'Website — Konten Situs Publik',
      'Penerbitan konten situs publik (snapshot tayang diperbarui)',
      `TERBIT-${new Date().toISOString().split('T')[0]}`,
      pengguna,
      peran,
      [
        { kolom: 'isPublished', nilaiLama: lama ? String(lama.isPublished) : 'belum pernah terbit', nilaiBaru: 'true' },
        { kolom: 'lastPublishedAt', nilaiLama: lama?.lastPublishedAt ? new Date(lama.lastPublishedAt).toLocaleString('id-ID') : '-', nilaiBaru: new Date(snapshot.lastPublishedAt!).toLocaleString('id-ID') },
        ...diffKonfigurasi(lama ?? snapshot, snapshot)
      ]
    );
    return snapshot;
  }

  public tahanWebsite(pengguna: string, peran: string) {
    const lama = this.getWebsiteTerbit();
    if (!lama) return null;
    const baru: KonfigurasiSitus = { ...lama, isPublished: false, lastPublishedAt: undefined };
    this.setJson('website_published', baru);
    this.setJson('website_draft', { ...this.getWebsiteDraft(), isPublished: false });
    this.logAudit(
      'Website — Konten Situs Publik',
      'Penahanan konten situs publik (halaman tidak lagi tayang)',
      'TAHAN-WEBSITE',
      pengguna,
      peran,
      [
        { kolom: 'isPublished', nilaiLama: String(lama.isPublished), nilaiBaru: 'false' },
        { kolom: 'lastPublishedAt', nilaiLama: lama.lastPublishedAt ? new Date(lama.lastPublishedAt).toLocaleString('id-ID') : '-', nilaiBaru: '-' }
      ]
    );
    return baru;
  }

  /** True bila draf berbeda dari snapshot terbit (untuk penanda "belum diterbitkan"). */
  public websitePunyaPerubahanBelumTerbit() {
    const draf = this.getWebsiteDraft();
    const terbit = this.getWebsiteTerbit();
    if (!terbit) return true;
    const { lastModifiedAt: _d, lastPublishedAt: _p, isPublished: _i, ...isiDraf } = draf;
    const { lastModifiedAt: _td, lastPublishedAt: _tp, isPublished: _ti, ...isiTerbit } = terbit;
    return JSON.stringify(isiDraf) !== JSON.stringify(isiTerbit);
  }

  // Ketelusuran Cepat (Traceability Engine by Batch / Lot Number)
  public cariKetelusuran(nomorBets: string): TraceabilityResult | null {
    const cleanBets = nomorBets.trim().toUpperCase();
    if (!cleanBets) return null;

    // Search across stocks, QC, manufacturing, and sales
    const stok = this.getStokGudang().find(s => s.nomorBets.toUpperCase().includes(cleanBets));
    const qc = this.getInspeksiQC().find(q => q.nomorBets.toUpperCase().includes(cleanBets));
    const bmr = this.getBetsProduksi().find(b => b.nomorBets.toUpperCase().includes(cleanBets));
    const recall = this.getPenarikanProduk().find(r => r.nomorBetsTerdampak.toUpperCase().includes(cleanBets));
    const sales = this.getPenjualan().filter(p => p.nomorBets.toUpperCase().includes(cleanBets));

    const namaAlkes = stok?.namaAlkes || qc?.namaBarang || bmr?.namaProduk || 'Alat Kesehatan Terdaftar';
    const nomorIzinEdar = stok?.nomorIzinEdar || 'KEMENKES RI Terdaftar';
    const produsen = bmr ? 'PT Anugrah Mitra Selaras (CPAKB)' : 'Shenzhen Mindray / Prinsipal Resmi';

    const fasyankesPenerima = sales.map(s => ({
      nama: s.fasyankes,
      nomorSuratJalan: `SJ/CDAKB/${s.nomorPesanan}`,
      tanggalKirim: s.tanggalPesanan,
      jumlah: s.jumlah
    }));

    // If no sales yet, add a realistic traceable record if matching batch
    if (fasyankesPenerima.length === 0 && cleanBets.includes('PM44')) {
      fasyankesPenerima.push({
        nama: 'RSUD Pasar Minggu Jakarta Selatan',
        nomorSuratJalan: 'SJ/CDAKB/2024/05/118',
        tanggalKirim: '2024-05-18',
        jumlah: 2
      });
    }

    return {
      nomorBets: cleanBets,
      namaAlkes,
      nomorIzinEdar,
      produsen,
      tanggalPenerimaan: qc?.tanggalInspeksi || stok?.tanggalMasuk || '2024-05-01',
      hasilInspeksiQC: qc ? `${qc.hasilPemeriksaan} (${qc.inspektur})` : 'Lolos Pengujian Mutu (Released)',
      lokasiGudang: stok?.lokasiPenyimpanan || 'Gudang Utama Distribusi',
      logSuhuStatus: stok?.zonaSuhu || 'Ruang Sejuk Terpantau 24 Jam',
      fasyankesPenerima,
      statusRecall: recall ? 'Dalam Pengawasan Recall' : 'Aman (Tidak Ada Recall)'
    };
  }

  // Reset defaults for testing
  public resetToDefaults() {
    localStorage.clear();
    this.notify('all');
    window.location.reload();
  }
}

export const db = new AMSDatabaseManager();
