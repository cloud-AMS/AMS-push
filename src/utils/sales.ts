import {
  DaftarSurat,
  GaransiInstalasi,
  HasilValidasiRegulasiItem,
  HasilValidasiSO,
  IzinEdarAlkes,
  KampanyeAlkes,
  KampanyeSurat,
  KonfigurasiSurat,
  KontrakHarga,
  KunjunganMedRep,
  PelangganB2B,
  PelangganSurat,
  ProgramRebate,
  RiwayatPenjualanBulanan,
  SkemaHargaAlkes,
  StokGudang,
  TemplatSurat,
  UnitDemoAlkes
} from '../types';
import { hitungJarakKm, verifikasiGeofence } from './hris';
import { alokasiFEFOSadarKunci } from './gudang';

const MS_PER_HARI = 86400000;

// Sama dengan aturan validasi di server.ts (/api/kemenkes/validasi-nie): format resmi NIE
// adalah "KEMENKES RI AKL/AKD" diikuti 11 digit.
const POLA_NIE = /^KEMENKES RI (AKL|AKD) \d{11}$/;

export function tanggalDari(iso: string) {
  const nilai = new Date(iso).getTime();
  return Number.isNaN(nilai) ? null : nilai;
}

export function selisihHari(terhadap: string, dari: Date = new Date()) {
  const akhir = tanggalDari(terhadap);
  if (akhir === null) return 0;
  const awal = new Date(dari.toISOString().split('T')[0]).getTime();
  return Math.round((akhir - awal) / MS_PER_HARI);
}

/** 4.1 Izin Edar & Compliance Validator — penolakan otomatis bila NIE tak terdaftar/kedaluwarsa */
export function validasiNomorIzinEdar(
  nomorIzinEdar: string,
  daftarIzin: IzinEdarAlkes[],
  dari: Date = new Date()
): HasilValidasiRegulasiItem {
  const bersih = nomorIzinEdar.trim().toUpperCase();
  if (!bersih) {
    return { aturan: 'Nomor Izin Edar (NIE)', status: 'Ditolak', keterangan: 'NIE belum diisi pada baris pesanan' };
  }
  if (!POLA_NIE.test(bersih)) {
    return {
      aturan: 'Nomor Izin Edar (NIE)',
      status: 'Ditolak',
      keterangan: `Format "${bersih}" menyimpang dari standar KEMENKES RI AKL/AKD + 11 digit`
    };
  }
  const izin = daftarIzin.find((i) => i.nomorIzinEdar.trim().toUpperCase() === bersih);
  if (!izin) {
    return { aturan: 'Nomor Izin Edar (NIE)', status: 'Ditolak', keterangan: `${bersih} tidak ditemukan pada register RA/PJT` };
  }
  const sisaHari = selisihHari(izin.tanggalKedaluwarsa, dari);
  if (sisaHari < 0) {
    return {
      aturan: 'Nomor Izin Edar (NIE)',
      status: 'Ditolak',
      keterangan: `${bersih} kedaluwarsa ${Math.abs(sisaHari)} hari lalu (${izin.tanggalKedaluwarsa})`
    };
  }
  if (izin.status === 'Kedaluwarsa' || izin.status === 'Menunggu Evaluasi') {
    return {
      aturan: 'Nomor Izin Edar (NIE)',
      status: 'Ditolak',
      keterangan: `${bersih} berstatus register "${izin.status}" — distribusi ditangguhkan sampai PJT melepas penahanan`
    };
  }
  return {
    aturan: 'Nomor Izin Edar (NIE)',
    status: 'Lolos',
    keterangan: `${bersih} aktif untuk ${izin.namaAlkes} • sisa ${sisaHari} hari${sisaHari <= 90 ? ' (ambang perpanjangan H-90)' : ''}`
  };
}

/** CDAKB: fasyankes tujuan wajib punya izin operasional yang masih berlaku */
export function validasiIzinOperasionalFasyankes(
  pelanggan: PelangganB2B | undefined,
  dari: Date = new Date()
): HasilValidasiRegulasiItem {
  if (!pelanggan) {
    return {
      aturan: 'Izin Operasional Fasyankes',
      status: 'Ditolak',
      keterangan: 'Pelanggan belum terdaftar pada master B2B Customer Profiling'
    };
  }
  if (pelanggan.statusPelanggan === 'Non-aktif') {
    return {
      aturan: 'Izin Operasional Fasyankes',
      status: 'Ditolak',
      keterangan: `${pelanggan.namaInstalasi} berstatus non-aktif pada master pelanggan`
    };
  }
  const sisaHari = selisihHari(pelanggan.tanggalBerlakuIzin, dari);
  if (sisaHari < 0) {
    return {
      aturan: 'Izin Operasional Fasyankes',
      status: 'Ditolak',
      keterangan: `Izin operasional ${pelanggan.nomorIzinOperasional} kedaluwarsa ${Math.abs(sisaHari)} hari lalu`
    };
  }
  return {
    aturan: 'Izin Operasional Fasyankes',
    status: 'Lolos',
    keterangan: `Izin ${pelanggan.nomorIzinOperasional} valid • sisa ${sisaHari} hari • akreditasi ${pelanggan.akreditasi}`
  };
}

/** 4.3 Credit Limit & Term of Payment (TOP) Control */
export type StatusLimitKredit = 'Aman' | 'Perlu Persetujuan Manajemen' | 'Diblokir';

export function statusLimitKredit(
  pelanggan: PelangganB2B,
  nilaiPesananBaru = 0,
  dari: Date = new Date()
): { status: StatusLimitKredit; piutangAkanDatang: number; rasioPersen: number; sisaPagar: number; keterangan: string } {
  const piutangAkanDatang = pelanggan.piutangBerjalan + nilaiPesananBaru;
  const rasioPersen = pelanggan.batasKredit > 0 ? (piutangAkanDatang / pelanggan.batasKredit) * 100 : 100;
  const sisaPagar = pelanggan.batasKredit - piutangAkanDatang;
  const hariKeJatuhTempo = selisihHari(pelanggan.tanggalJatuhTempoPiutang, dari);
  const piutangLewatJatuhTempo = hariKeJatuhTempo < 0 && pelanggan.piutangBerjalan > 0;

  let status: StatusLimitKredit = 'Aman';
  if (piutangLewatJatuhTempo || rasioPersen > 100) status = 'Diblokir';
  else if (rasioPersen > 85) status = 'Perlu Persetujuan Manajemen';

  const keterangan = piutangLewatJatuhTempo
    ? `Piutang ${Math.abs(hariKeJatuhTempo)} hari lewat jatuh tempo (${pelanggan.tanggalJatuhTempoPiutang}) — SO baru diblokir`
    : rasioPersen > 100
      ? `Paparan ${Math.round(rasioPersen)}% melampaui batas kredit ${pelanggan.batasKredit.toLocaleString('id-ID')}`
      : status === 'Perlu Persetujuan Manajemen'
        ? `Paparan ${Math.round(rasioPersen)}% dari batas kredit — butuh persetujuan manajer penjualan`
        : `Paparan ${Math.round(rasioPersen)}% dari batas kredit • TOP ${pelanggan.termsOfPaymentHari} hari`;

  return { status, piutangAkanDatang, rasioPersen, sisaPagar, keterangan };
}

/** 2/4 — alokasi bets FEFO sadar-kunci: lewati QUARANTINE/DAMAGED/EXPIRED_LOCK dan kurangi qtyDipesan */
export function alokasikanFEFO(
  daftarStok: StokGudang[],
  namaAlkes: string,
  jumlahDiminta: number,
  dari: Date = new Date()
): { usulan: { nomorBets: string; tanggalKedaluwarsa: string; diambil: number }[]; sisaKekurangan: number; betsKedaluwarsaDilewati: number } {
  const hasil = alokasiFEFOSadarKunci({
    daftarStok,
    jumlahDiminta,
    namaAlkes,
    dari
  });
  return {
    usulan: hasil.usulan.map((u) => ({
      nomorBets: u.nomorBets,
      tanggalKedaluwarsa: u.tanggalKedaluwarsa,
      diambil: u.diambil
    })),
    sisaKekurangan: hasil.sisaKekurangan,
    betsKedaluwarsaDilewati: hasil.betsKedaluwarsaDilewati
  };
}

/** Gerbang gabungan pra-konfirmasi Sales Order (4.1 + 4.3 + CDAKB) */
export function validasiSalesOrder(params: {
  pelanggan?: PelangganB2B;
  nomorIzinEdar: string;
  daftarIzinEdar: IzinEdarAlkes[];
  namaAlkes: string;
  jumlah: number;
  daftarStok: StokGudang[];
  nilaiPesanan: number;
  dari?: Date;
}): HasilValidasiSO {
  const dari = params.dari ?? new Date();
  const pemeriksaan: HasilValidasiRegulasiItem[] = [
    validasiNomorIzinEdar(params.nomorIzinEdar, params.daftarIzinEdar, dari),
    validasiIzinOperasionalFasyankes(params.pelanggan, dari)
  ];

  if (params.pelanggan) {
    const kredit = statusLimitKredit(params.pelanggan, params.nilaiPesanan, dari);
    pemeriksaan.push({
      aturan: 'Credit Limit & TOP',
      status: kredit.status === 'Diblokir' ? 'Ditolak' : 'Lolos',
      keterangan: kredit.keterangan
    });
  }

  const alokasi = alokasikanFEFO(params.daftarStok, params.namaAlkes, params.jumlah, dari);
  pemeriksaan.push({
    aturan: 'Ketersediaan Stok FEFO',
    status: alokasi.sisaKekurangan > 0 ? 'Ditolak' : 'Lolos',
    keterangan:
      alokasi.sisaKekurangan > 0
        ? `Stok bebas tidak mencukupi: kurang ${alokasi.sisaKekurangan} unit setelah melewati bets terkunci/kedaluwarsa`
        : `Terpenuhi dari bets ${alokasi.usulan.map((u) => u.nomorBets).join(' + ')}${alokasi.betsKedaluwarsaDilewati > 0 ? ` • ${alokasi.betsKedaluwarsaDilewati} unit bets kedaluwarsa dilewati` : ''}`
  });

  return {
    status: pemeriksaan.some((p) => p.status === 'Ditolak') ? 'Ditolak' : 'Lolos',
    tanggalValidasi: dari.toISOString(),
    pengguna: 'Sistem Validator',
    pemeriksaan
  };
}

/** 2.3 Margin Calculator — profitabilitas tender setelah logistik, komisi, instalasi, PPN */
export interface InputMarginTender {
  nilaiHps: number;
  hargaPenawaranPersen: number;
  hppBarang: number;
  biayaLogistik: number;
  komisiPersen: number;
  biayaInstalasi: number;
  ppnPersen: number;
}

export function hitungMarginTender(input: InputMarginTender) {
  const hargaPenawaran = Math.round(input.nilaiHps * (1 - input.hargaPenawaranPersen / 100));
  const komisiNilai = Math.round((hargaPenawaran * input.komisiPersen) / 100);
  const totalBiaya =
    input.hppBarang + input.biayaLogistik + komisiNilai + input.biayaInstalasi;
  const marginKotor = hargaPenawaran - input.hppBarang;
  const marginBersih = hargaPenawaran - totalBiaya;
  const marginBersihPersen = hargaPenawaran > 0 ? (marginBersih / hargaPenawaran) * 100 : 0;

  return {
    hargaPenawaran,
    komisiNilai,
    marginKotor,
    marginKotorPersen: hargaPenawaran > 0 ? (marginKotor / hargaPenawaran) * 100 : 0,
    totalBiaya,
    marginBersih,
    marginBersihPersen,
    hargaSetelahPpn: Math.round(hargaPenawaran * (1 + input.ppnPersen / 100)),
    rincian: [
      { komponen: 'Harga Penawaran (penurunan dari HPS)', nilai: hargaPenawaran },
      { komponen: 'HPP barang (harga pokok pembelian)', nilai: -input.hppBarang },
      { komponen: 'Biaya logistik & pengiriman', nilai: -input.biayaLogistik },
      { komponen: `Komisi penjualan ${input.komisiPersen}%`, nilai: -komisiNilai },
      { komponen: 'Biaya instalasi & kalibrasi', nilai: -input.biayaInstalasi }
    ],
    rekomendasi:
      marginBersihPersen >= 15
        ? 'Layak diikuti — margin bersih di atas ambang 15%'
        : marginBersihPersen >= 8
          ? 'Margin tipis — nego HPP atau potong biaya instalasi sebelum ajukan'
          : 'Tidak layak — margin bersih di bawah 8%, berisiko melanggar prinsip harga wajar LKPP'
  };
}

/** 4.2 Multi-Level Pricing & Discount Engine */
export function hitungDiskonKuantitas(skema: SkemaHargaAlkes, jumlah: number) {
  const berlapis = [...skema.potonganKuantitas].sort((a, b) => b.ambangMinUnit - a.ambangMinUnit);
  const terpakai = berlapis.find((t) => jumlah >= t.ambangMinUnit) ?? null;
  const subtotal = skema.hargaDasar * jumlah;
  const diskonNilai = terpakai ? Math.round((subtotal * terpakai.diskonPersen) / 100) : 0;
  return {
    ambangTerpakai: terpakai?.ambangMinUnit ?? null,
    diskonPersen: terpakai?.diskonPersen ?? 0,
    subtotal,
    diskonNilai,
    netSetelahDiskon: subtotal - diskonNilai,
    bonusUnit: terpakai ? skema.bonusUnit : 0,
    hargaPerUnitEfektif: jumlah > 0 ? (subtotal - diskonNilai) / jumlah : 0
  };
}

/** Harga terkunci kontrak aktif menang atas skema harga umum */
export function hargaTerkunciAktif(
  daftarKontrak: KontrakHarga[],
  pelangganId: string,
  namaAlkes: string,
  dari: Date = new Date()
) {
  const kontrak = daftarKontrak.find(
    (k) =>
      k.pelangganId === pelangganId &&
      k.statusKontrak === 'Aktif' &&
      k.periodeMulai <= dari.toISOString().split('T')[0] &&
      k.periodeSelesai >= dari.toISOString().split('T')[0]
  );
  const baris = kontrak?.daftarHargaTerkunci.find((h) => h.namaAlkes === namaAlkes) ?? null;
  return { kontrak, baris };
}

/** 6.1 Event & Simposium Manager — efektivitas biaya */
export function hitungRoiKampanye(kampanye: KampanyeAlkes) {
  const biayaPerProspek = kampanye.prospekDihasilkan > 0 ? kampanye.realisasiBiaya / kampanye.prospekDihasilkan : 0;
  const roiPersen = kampanye.realisasiBiaya > 0 ? ((kampanye.nilaiKonversi - kampanye.realisasiBiaya) / kampanye.realisasiBiaya) * 100 : 0;
  return {
    biayaPerProspek,
    roiPersen,
    label:
      kampanye.realisasiBiaya === 0
        ? 'Realisasi biaya belum tercatat'
        : roiPersen >= 100
          ? 'Sangat efektif (ROI ≥ 100%)'
          : roiPersen >= 0
            ? 'Efektif terbatas (ROI < 100%)'
            : 'Rugi — nilai konversi di bawah biaya kegiatan'
  };
}

/** 6.3 Loyalty & Rebate Program */
export function hitungRebateTerutang(rebate: ProgramRebate) {
  const tercapai = rebate.realisasiVolumeUnit >= rebate.targetVolumeUnit;
  const capaianPersen =
    rebate.targetVolumeUnit > 0 ? (rebate.realisasiVolumeUnit / rebate.targetVolumeUnit) * 100 : 0;
  const persenDibayar = tercapai ? rebate.persenRebate : Math.min(rebate.persenRebate / 2, (capaianPersen / 100) * rebate.persenRebate);
  return {
    tercapai,
    capaianPersen,
    persenDibayar,
    nilaiRebate: Math.round((rebate.nilaiTransaksiPeriode * persenDibayar) / 100),
    kekuranganUnit: Math.max(rebate.targetVolumeUnit - rebate.realisasiVolumeUnit, 0),
    keterangan: tercapai
      ? `Target volume tercapai (${rebate.realisasiVolumeUnit}/${rebate.targetVolumeUnit}) — rebate penuh ${rebate.persenRebate}%`
      : `Baru ${Math.round(capaianPersen)}% dari target — rebate prorata ${persenDibayar.toFixed(2)}%`
  };
}

/** 6.2 Status efektif unit demo (Terlambat diturunkan dari tanggal, bukan disimpan) */
export function statusUnitDemo(unit: UnitDemoAlkes, dari: Date = new Date()) {
  if (unit.statusPinjam !== 'Terpinjam') return { label: unit.statusPinjam, tone: unit.statusPinjam === 'Hilang' ? ('rose' as const) : ('slate' as const), sisaHari: 0 };
  const sisaHari = selisihHari(unit.tanggalHarusKembali, dari);
  if (sisaHari < 0) return { label: 'Terlambat', tone: 'rose' as const, sisaHari };
  if (sisaHari <= 7) return { label: 'Tenggat Kembali Habis', tone: 'amber' as const, sisaHari };
  return { label: 'Terpinjam', tone: 'blue' as const, sisaHari };
}

/** 5.2 Warranty & Instalasi Base — masa garansi dihitung dari tanggal instalasi */
export function statusGaransi(garansi: GaransiInstalasi, dari: Date = new Date()) {
  const instalasi = tanggalDari(garansi.tanggalInstalasi);
  if (instalasi === null) return { berakhirPada: '-', sisaHari: 0, aktif: false, label: 'Tanggal instalasi belum valid' };
  const berakhir = new Date(instalasi);
  berakhir.setMonth(berakhir.getMonth() + garansi.masaGaransiBulan);
  const tanggalBerakhir = berakhir.toISOString().split('T')[0];
  const sisaHari = selisihHari(tanggalBerakhir, dari);
  return {
    berakhirPada: tanggalBerakhir,
    sisaHari,
    aktif: sisaHari >= 0,
    label:
      sisaHari < 0
        ? `Garansi berakhir ${Math.abs(sisaHari)} hari lalu`
        : sisaHari <= 30
          ? `Garansi sisa ${sisaHari} hari — jadwalkan PM`
          : `Garansi aktif • sisa ${sisaHari} hari`
  };
}

/** 3.1 Visit Planner & Geo-Tagging — verifikasi lokasi GPS saat check-in */
export function verifikasiCheckInKunjungan(kunjungan: KunjunganMedRep) {
  if (!kunjungan.koordinatCheckIn) {
    return { terverifikasi: null as boolean | null, jarakKm: null as number | null, label: 'Belum check-in di lapangan' };
  }
  const jarakKm = hitungJarakKm(
    kunjungan.koordinatFasyankes.lat,
    kunjungan.koordinatFasyankes.lon,
    kunjungan.koordinatCheckIn.lat,
    kunjungan.koordinatCheckIn.lon
  );
  const geofence = verifikasiGeofence(jarakKm, kunjungan.radiusGeofenceMeter);
  return { terverifikasi: geofence.dalamPagar, jarakKm, label: geofence.label };
}

/** 7.2 Demand Forecasting — moving average + tren sederhana, ROP dan status risiko stok */
export interface HasilPeramalan {
  namaAlkes: string;
  rataRataBulanan: number;
  trenPersen: number;
  proyeksiBulanBerikutnya: number;
  permintaanHarian: number;
  titikPesanUlang: number;
  stokSekarang: number;
  status: 'Risiko Stockout' | 'Aman' | 'Risiko Overstock';
  saranPesanan: number;
  keterangan: string;
}

export function proyeksikanPermintaan(
  riwayatSemua: RiwayatPenjualanBulanan[],
  namaAlkes: string,
  stokSekarang: number,
  opsi: { hariKerjaPerBulan?: number; leadTimeHari?: number; safetyStockHari?: number } = {}
): HasilPeramalan {
  const hariKerjaPerBulan = opsi.hariKerjaPerBulan ?? 26;
  const leadTimeHari = opsi.leadTimeHari ?? 21;
  const safetyStockHari = opsi.safetyStockHari ?? 14;

  const riwayat = riwayatSemua
    .filter((r) => r.namaAlkes === namaAlkes)
    .sort((a, b) => a.bulan.localeCompare(b.bulan));

  const unitPerBulan = riwayat.map((r) => r.unitTerjual);
  const tigaTerakhir = unitPerBulan.slice(-3);
  const tigaSebelumnya = unitPerBulan.slice(-6, -3);

  const rataRataBulanan =
    tigaTerakhir.length > 0 ? tigaTerakhir.reduce((a, b) => a + b, 0) / tigaTerakhir.length : 0;
  const rataSebelumnya =
    tigaSebelumnya.length > 0 ? tigaSebelumnya.reduce((a, b) => a + b, 0) / tigaSebelumnya.length : rataRataBulanan;
  const trenPersen = rataSebelumnya > 0 ? ((rataRataBulanan - rataSebelumnya) / rataSebelumnya) * 100 : 0;

  const proyeksiBulanBerikutnya = Math.round(rataRataBulanan * (1 + Math.max(Math.min(trenPersen / 100, 0.25), -0.25)));
  const permintaanHarian = rataRataBulanan / hariKerjaPerBulan;
  const titikPesanUlang = Math.ceil(permintaanHarian * (leadTimeHari + safetyStockHari));

  const status: HasilPeramalan['status'] =
    stokSekarang < titikPesanUlang
      ? 'Risiko Stockout'
      : stokSekarang > proyeksiBulanBerikutnya * 3
        ? 'Risiko Overstock'
        : 'Aman';

  const saranPesanan =
    status === 'Risiko Stockout' ? Math.max(proyeksiBulanBerikutnya + titikPesanUlang - stokSekarang, 0) : 0;

  return {
    namaAlkes,
    rataRataBulanan,
    trenPersen,
    proyeksiBulanBerikutnya,
    permintaanHarian,
    titikPesanUlang,
    stokSekarang,
    status,
    saranPesanan,
    keterangan:
      status === 'Risiko Stockout'
        ? `Stok ${stokSekarang} unit di bawah titik pesan ulang ${titikPesanUlang} — ajukan PO importasi/manufaktur sekarang`
        : status === 'Risiko Overstock'
          ? `Stok ${stokSekarang} unit melebihi 3x proyeksi bulanan — tekankan penyaluran FEFO/promo sebelum kedaluwarsa`
          : `Seimbang: stok ${stokSekarang} unit terhadap proyeksi ${proyeksiBulanBerikutnya} unit/bulan`
  };
}

// ==================== NEWSLETTER & MAILING LIST (mesin: listmonk) ====================

/** Statistik satu kampanye. Angka unik/persen diturunkan dari kolom kirim, tidak disimpan. */
export interface HasilStatistikKampanyeSurat {
  antrianSisa: number;
  capaianPersen: number;
  perkiraanSisaDetik: number;
  tingkatKeterbukaan: number;
  tingkatKlik: number;
  tingkatPengiriman: number;
  tingkatKeluhan: number;
  tingkatBerhenti: number;
}

export function statistikKampanyeSurat(k: KampanyeSurat): HasilStatistikKampanyeSurat {
  const tersampaikan = Math.max(k.terkirim - k.bounce, 0);
  const antrianSisa = Math.max(k.targetTotal - k.terkirim, 0);
  const laju = Math.max(k.lajuPerDetik, 1);
  return {
    antrianSisa,
    capaianPersen: k.targetTotal > 0 ? (k.terkirim / k.targetTotal) * 100 : 0,
    perkiraanSisaDetik: antrianSisa / laju,
    tingkatKeterbukaan: tersampaikan > 0 ? (k.dibukaUnik / tersampaikan) * 100 : 0,
    tingkatKlik: k.dibukaUnik > 0 ? (k.klikUnik / k.dibukaUnik) * 100 : 0,
    tingkatPengiriman: tersampaikan > 0 ? (tersampaikan / k.targetTotal) * 100 : 0,
    tingkatKeluhan: tersampaikan > 0 ? (k.keluhan / tersampaikan) * 100 : 0,
    tingkatBerhenti: tersampaikan > 0 ? (k.berhentiLangganan / tersampaikan) * 100 : 0
  };
}

/** Laju teoritis pengirim = app.concurrency x app.rate (pesan/detik). */
export function lajuTeoritis(cfg: KonfigurasiSurat) {
  return cfg.concurrency * cfg.appRate;
}

const LABEL_STATUS_KAMPANYE: Record<KampanyeSurat['status'], string> = {
  draft: 'Draf',
  scheduled: 'Terjadwal',
  running: 'Berjalan',
  paused: 'Dijeda',
  sending: 'Mengirim',
  finished: 'Selesai',
  cancelled: 'Dibatalkan'
};

export function labelStatusKampanyeSurat(status: KampanyeSurat['status']) {
  const nada: 'slate' | 'emerald' | 'blue' | 'amber' | 'rose' =
    status === 'finished'
      ? 'emerald'
      : status === 'sending' || status === 'running'
        ? 'blue'
        : status === 'scheduled'
          ? 'blue'
          : status === 'paused' || status === 'cancelled'
            ? 'amber'
            : 'slate';
  return { label: LABEL_STATUS_KAMPANYE[status], tone: nada };
}

/** Daftar yang boleh dipakai mengirim: status confirmed (Public list harus dikonfirmasi). */
export function daftarSiapKirim(daftar: DaftarSurat[]) {
  return daftar.filter((d) => d.status === 'confirmed');
}

/** Penerima efektif sebuah kampanye — sama seperti penyaringan listmonk: subscriber Enabled,
 *  anggota salah satu daftar target yang sudah confirmed, dan kampanye optin hanya menyasar
 *  langganan double opt-in yang belum terkonfirmasi. */
export function saringPenerima(
  kampanye: KampanyeSurat,
  daftar: DaftarSurat[],
  pelanggan: PelangganSurat[]
): PelangganSurat[] {
  const target = daftar.filter((d) => kampanye.daftarIds.includes(d.id));
  const siap = target.filter((d) => d.status === 'confirmed').map((d) => d.id);
  const idTarget = new Set(kampanye.daftarIds);
  return pelanggan.filter((p) => {
    const anggota = p.daftarIds.filter((id) => idTarget.has(id));
    if (anggota.length === 0) return false;
    if (kampanye.tipe === 'optin') {
      const daftarDouble = new Set(target.filter((d) => d.optin === 'double').map((d) => d.id));
      return anggota.some((id) => daftarDouble.has(id));
    }
    return p.status === 'Enabled' && anggota.some((id) => siap.includes(id));
  });
}

/** Gerbang sebelum kampanye boleh mulai — menolak dengan alasan, bukan diam-diam. */
export function cekKesiapanKampanye(params: {
  kampanye: KampanyeSurat;
  daftar: DaftarSurat[];
  pelanggan: PelangganSurat[];
  sedangMengirim: KampanyeSurat[];
  dari?: Date;
}): { siap: boolean; alasan: string } {
  const { kampanye, daftar, pelanggan, sedangMengirim } = params;
  const dari = params.dari ?? new Date();

  if (kampanye.status === 'finished' || kampanye.status === 'cancelled') {
    return { siap: false, alasan: `Kampanye sudah berstatus ${kampanye.status} — riwayat tidak dapat dibuka kembali` };
  }
  const pengirimAktif = sedangMengirim.filter((k) => k.id !== kampanye.id);
  if (pengirimAktif.length > 0) {
    return {
      siap: false,
      alasan: `Antrian SMTP sedang dipakai ${pengirimAktif[0].nomorKampanye} — listmonk hanya mengirim satu kampanye pada satu waktu`
    };
  }
  const daftarTarget = daftar.filter((d) => kampanye.daftarIds.includes(d.id));
  if (daftarTarget.length === 0) return { siap: false, alasan: 'Kampanye belum ditautkan ke daftar penerima mana pun' };
  const belumKonfirmasi = daftarTarget.filter((d) => d.status !== 'confirmed').map((d) => d.nama);
  if (belumKonfirmasi.length > 0) {
    return { siap: false, alasan: `Owner belum mengonfirmasi daftar: ${belumKonfirmasi.join(', ')}` };
  }
  const penerima = saringPenerima(kampanye, daftar, pelanggan);
  if (penerima.length === 0) {
    return { siap: false, alasan: 'Tidak ada subscriber berstatus Enabled pada daftar target (Blocked/Unsubscribed/Imported tidak dikirim)' };
  }
  if (kampanye.status === 'scheduled') {
    const jadwalku = tanggalDari(kampanye.jadwalKirim);
    if (jadwalku === null) return { siap: false, alasan: 'Tanggal jadwal kirim tidak valid' };
    if (jadwalku > dari.getTime()) {
      return { siap: false, alasan: `Jadwal ${kampanye.jadwalKirim} belum tiba — dibandingkan terhadap jam server, bukan jam peramban` };
    }
  }
  if (kampanye.status === 'draft') {
    return { siap: false, alasan: 'Materi masih draf — jadwalkan (atau validasi PJT) sebelum mengirim' };
  }
  return { siap: true, alasan: `${penerima.length} penerima siap dikirim pada laju ${kampanye.lajuPerDetik} pesan/detik` };
}

/** Satu langkah antrian kirim (pendekatan batch_size + last_subscriber_id listmonk).
 *  Kesalahan kirim di atas app.max_send_errors menjeda kampanye secara otomatis. */
export function jalankanBatchKirim(
  kampanye: KampanyeSurat,
  cfg: KonfigurasiSurat,
  jumlahGagal = 0
): { kampanye: KampanyeSurat; pesan: string } {
  const sisa = Math.max(kampanye.targetTotal - kampanye.terkirim, 0);
  if (sisa === 0) {
    return { kampanye: { ...kampanye, status: 'finished' }, pesan: 'Antrian habis — status dinaikkan ke finished' };
  }
  const batch = Math.min(Math.max(cfg.batchSize, 1), sisa);
  const gagal = Math.max(jumlahGagal, 0);
  const terkirim = kampanye.terkirim + batch;
  const bounce = kampanye.bounce + gagal;
  const lanjut: KampanyeSurat = {
    ...kampanye,
    terkirim,
    bounce,
    status: terkirim >= kampanye.targetTotal ? 'finished' : 'sending',
    jadwalSelesai: terkirim >= kampanye.targetTotal ? new Date().toISOString().split('T')[0] : kampanye.jadwalSelesai
  };
  if (gagal > cfg.maxSendErrors) {
    return {
      kampanye: { ...lanjut, status: 'paused' },
      pesan: `${gagal} kesalahan kirim melewati app.max_send_errors (${cfg.maxSendErrors}) — kampanye dijeda otomatis`
    };
  }
  const pesan =
    lanjut.status === 'finished'
      ? `Batch terakhir ${batch} pesan terkirim — antrian selesai (${terkirim}/${kampanye.targetTotal})`
      : `Batch ${batch} pesan terkirim (${terkirim}/${kampanye.targetTotal}), sisa antrian ${Math.max(kampanye.targetTotal - terkirim, 0)}`;
  return { kampanye: lanjut, pesan };
}

/** Aturan bounce: ambang beruntun memicu aksi (blocklist/unsubscribe/delete). */
export function terapkanAturanBounce(
  subscriber: PelangganSurat,
  cfg: KonfigurasiSurat
): { subscriber: PelangganSurat; berubah: boolean; pesan: string } {
  if (subscriber.bounceBeruntun < cfg.ambangBounce || subscriber.status === 'Blocked') {
    return { subscriber, berubah: false, pesan: '' };
  }
  if (cfg.aksiBounce === 'delete') {
    return { subscriber, berubah: true, pesan: `Aksi bounce "${cfg.aksiBounce}" — baris subscriber dibersihkan oleh Maintenance, bukan di sini` };
  }
  const status = cfg.aksiBounce === 'blocklist' ? 'Blocked' : 'Unsubscribed';
  return {
    subscriber: { ...subscriber, status },
    berubah: true,
    pesan: `${subscriber.bounceBeruntun} bounce beruntun >= ambang ${cfg.ambangBounce} — status diubah ke ${status} dan dikecualikan dari semua kirim`
  };
}

/** Impor CSV ala listmonk (kolom email, name, attributes) + dedupe berbasis email. */
export interface HasilImporLangganan {
  baris: { surel: string; nama: string; atribut: Record<string, string | number> }[];
  ditolak: string[];
  duplikat: string[];
}

export function parseCsvLangganan(teks: string, emailTerpakai: string[]): HasilImporLangganan {
  const dipakai = new Set(emailTerpakai.map((e) => e.trim().toLowerCase()));
  const baris: HasilImporLangganan['baris'] = [];
  const ditolak: string[] = [];
  const duplikat: string[] = [];
  const POLA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const jalur = teks
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  jalur.forEach((barisTeks, indeks) => {
    if (indeks === 0 && /email/i.test(barisTeks) && !barisTeks.includes('@')) return; // header
    const kolom = barisTeks.split(/[,;]/).map((k) => k.trim().replace(/^"|"$/g, ''));
    const surel = (kolom[0] || '').toLowerCase();
    if (!surel) {
      ditolak.push(`Baris ${indeks + 1}: kolom email kosong`);
      return;
    }
    if (!POLA_EMAIL.test(surel)) {
      ditolak.push(`Baris ${indeks + 1}: "${surel}" bukan alamat surel yang valid`);
      return;
    }
    if (dipakai.has(surel) || baris.some((b) => b.surel === surel)) {
      duplikat.push(surel);
      return;
    }
    let atribut: Record<string, string | number> = {};
    const mentah = kolom[2];
    if (mentah) {
      try {
        // listmonk menyimpan attributes sebagai string JSON yang di-escape dalam CSV
        const terurai = JSON.parse(mentah.replace(/""/g, '"'));
        if (terurai && typeof terurai === 'object') atribut = terurai as Record<string, string | number>;
        else ditolak.push(`Baris ${indeks + 1}: attributes bukan objek JSON`);
      } catch {
        ditolak.push(`Baris ${indeks + 1}: attributes gagal diurai sebagai JSON`);
      }
    }
    baris.push({ surel, nama: kolom[1] || '(tanpa nama)', atribut });
  });

  return { baris, ditolak, duplikat };
}

/** Subset bahasa query segmentasi listmonk yang didukung luring:
 *  subscribers.email|name|status|created_at, attributes->>'k', lists.name
 *  dengan operator =, !=, LIKE dan penghubung AND/OR tanpa kurung. */
export function cocokkanQuerySegmentasi(kueri: string, p: PelangganSurat, daftar: DaftarSurat[]): boolean {
  const teks = kueri.trim();
  if (!teks) return true;

  const nilaiKolom = (kolom: string): string | undefined => {
    if (kolom.startsWith("attributes->>'") || kolom.startsWith("attribs->>'")) {
      const kunci = kolom.replace(/^(attributes|attribs)->>'/, '').replace(/'$/, '');
      const nilai = p.atribut[kunci];
      return nilai === undefined ? undefined : String(nilai);
    }
    switch (kolom) {
      case 'subscribers.email': return p.surel;
      case 'subscribers.name': return p.nama;
      case 'subscribers.status': return p.status;
      case 'subscribers.created_at': return p.tanggalBerlangganan;
      case 'subscribers.uuid': return p.uuid;
      case 'lists.name':
        return daftar
          .filter((d) => p.daftarIds.includes(d.id))
          .map((d) => d.nama)
          .join(' | ');
      default: return undefined;
    }
  };

  const cocok = (clause: string): boolean => {
    const m = clause.match(/^\s*([a-zA-Z_.\->']+)\s*(NOT\s+LIKE|LIKE|!=|=)\s*'([^']*)'\s*$/i);
    if (!m) return false;
    const nilai = nilaiKolom(m[1]);
    if (nilai === undefined) return false;
    const operator = m[2].toUpperCase();
    const pola = m[3];
    if (operator === '=') return nilai.toLowerCase() === pola.toLowerCase();
    if (operator === '!=') return nilai.toLowerCase() !== pola.toLowerCase();
    const regex = new RegExp(`^${pola.split('%').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*')}$`, 'i');
    return regex.test(nilai);
  };

  const bagianAnd = teks.split(/\s+OR\s+/i);
  return bagianAnd.some((bagian) => bagian.split(/\s+AND\s+/i).every(cocok));
}

/** Bentuk payload POST /api/campaigns untuk instance listmonk (dipakai panel integrasi). */
export function pratinjauPayloadApi(
  kampanye: KampanyeSurat,
  daftar: DaftarSurat[],
  templat: TemplatSurat[]
) {
  const idDaftar = daftar.filter((d) => kampanye.daftarIds.includes(d.id)).map((d) => Number(d.id.replace(/\D/g, '')));
  return {
    method: 'POST',
    endpoint: '/api/campaigns',
    body: {
      campaign: {
        name: kampanye.nama,
        subject: kampanye.subjek,
        from_email: kampanye.dariSurel,
        from_name: kampanye.dariNama,
        type: kampanye.tipe,
        mime: kampanye.mime,
        status: kampanye.status,
        send_at: kampanye.jadwalKirim ? `${kampanye.jadwalKirim}T09:00:00+07:00` : null,
        lists: idDaftar,
        template: Number((templat.find((t) => t.id === kampanye.templatId) || { id: '' }).id?.toString().replace(/\D/g, '') || 0),
        headers: [{ key: 'List-Unsubscribe-Post', value: 'List-Unsubscribe=One-Click' }],
        messenger: 'email'
      }
    }
  };
}

/** Penanda opt-out satu klik (RFC 8058) yang dipakai pada header dan templat. */
export function tautanBerhentiLangganan(sub: PelangganSurat, urlInstance: string) {
  const dasar = urlInstance.replace(/\/$/, '');
  return {
    unik: `${dasar}/unsubscribe/${sub.uuid}`,
    manajemen: `${dasar}/subscription/${sub.uuid}`,
    oneClickHeader: 'List-Unsubscribe-Post: List-Unsubscribe=One-Click'
  };
}
