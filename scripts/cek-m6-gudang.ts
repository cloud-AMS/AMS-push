// Penjaga permanen M6 — 12 aturan bisnis §3, kesiapan audit CDB, integrasi lintas modul
// (Sales FEFO & PMS Recall), tipografi token, dan kepindahan kepemilikan §0B.
// Jalankan: npm run cek:gudang
import fs from 'node:fs';
import path from 'node:path';
import './penyimpanan-node';
import { db } from '../src/services/pocketbase';
import {
  alokasiFEFOSadarKunci,
  daftarStokPerluKunciAgeing,
  dampakRecallBets,
  deteksiExcursiRantaiDingin,
  gerbangKonfirmasiStokSales,
  gerbangPenutupanRecall,
  hitungReorderPoint,
  hitungSelisihOpname,
  lembarHitungBlind,
  nilaiKesiapanAuditCdb,
  nilaiUmurStok,
  susunRutePicking,
  tentukanTempatSimpan,
  unitLayakKirim,
  validasiKirimanSatuSehat,
  verifikasiRantaiHash
} from '../src/utils/gudang';
import { alokasikanFEFO, statusLimitKredit, validasiSalesOrder } from '../src/utils/sales';
import type { LogSuhu, UnitSerialAlkes } from '../src/types';

const ACUAN = new Date('2024-06-15T08:00:00');

let totalAsersi = 0;
let masalah = 0;

const cek = (label: string, lolos: boolean) => {
  totalAsersi++;
  if (!lolos) {
    console.error(`[m6 gudang] GAGAL — ${label}`);
    masalah++;
  }
};

const mulai = () => localStorage.clear();

// ==================== 1. Integrasi Sales FEFO (§3.1 & §0A.2) ====================
mulai();
const daftarStokAwal = db.getStokGudang();
const alokasiSales = alokasikanFEFO(
  daftarStokAwal,
  'Syringe Pump Presisi Tinggi AMS-SP500',
  10,
  ACUAN
);
cek(
  'S1 alokasikanFEFO Sales melewati LOT-2024-SP08 (QUARANTINE) walau ED lebih awal',
  !alokasiSales.usulan.some((u) => u.nomorBets === 'LOT-2024-SP08') &&
    alokasiSales.usulan[0]?.nomorBets === 'LOT-2024-SP12' &&
    alokasiSales.sisaKekurangan === 0
);

const pelangganAktif =
  db.getPelangganB2B().find((p) => statusLimitKredit(p, 0, ACUAN).status !== 'Diblokir') ??
  db.getPelangganB2B()[0];
const validasiSoBerlebih = validasiSalesOrder({
  pelanggan: pelangganAktif,
  nomorIzinEdar: 'KEMENKES RI AKD 20902410331',
  daftarIzinEdar: db.getIzinEdar(),
  namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
  jumlah: 40, // bebas di LOT-2024-SP12 hanya 35 (46 - 11 qtyDipesan), LOT-2024-SP08 karantina
  daftarStok: daftarStokAwal,
  nilaiPesanan: 50_000_000,
  dari: ACUAN
});
cek(
  'S2 validasiSalesOrder menolak pesanan yang melampaui stok bebas setelah dikurangi qtyDipesan & karantina',
  validasiSoBerlebih.status === 'Ditolak' &&
    validasiSoBerlebih.pemeriksaan.some(
      (p) => p.aturan === 'Ketersediaan Stok FEFO' && p.status === 'Ditolak'
    )
);

// ==================== 2. Directed Put-Away & Pemindahan Bin (§3.3) ====================
mulai();
const putAwayCold = tentukanTempatSimpan({
  daftarAturan: db.getAturanSimpan(),
  daftarGudang: db.getGudangFisik(),
  daftarBin: db.getLokasiBin(),
  kategoriProduk: 'Diagnostik In Vitro',
  zonaSuhuDibutuhkan: 'Cold Chain (2°C - 8°C)',
  jumlah: 5,
  satuan: 'Kit (25 Test)'
});
cek(
  `P1 directed put-away produk Cold Chain diarahkan ke Cold Room GDM-02 (${putAwayCold.gudangTujuan?.id}/${putAwayCold.bin?.id})`,
  !putAwayCold.penolakan &&
    putAwayCold.gudangTujuan?.id === 'GDM-02' &&
    putAwayCold.bin?.zonaSuhu === 'Cold Chain (2°C - 8°C)'
);

const putAwayRecall = tentukanTempatSimpan({
  daftarAturan: db.getAturanSimpan(),
  daftarGudang: db.getGudangFisik(),
  daftarBin: db.getLokasiBin(),
  kategoriProduk: 'Non Elektromedik Steril',
  steril: true,
  terikatRecall: true,
  jumlah: 2,
  satuan: 'Unit'
});
cek(
  `P2 barang terikat recall diprioritaskan ke Gudang Karantina GDM-03 (${putAwayRecall.aturan?.id})`,
  !putAwayRecall.penolakan && putAwayRecall.gudangTujuan?.id === 'GDM-03'
);

const putAwayManualTanpaAlasan = tentukanTempatSimpan({
  daftarAturan: db.getAturanSimpan(),
  daftarGudang: db.getGudangFisik(),
  daftarBin: db.getLokasiBin(),
  jumlah: 2,
  binTujuanManual: 'BIN-B02-01-01',
  alasanManual: '   '
});
cek(
  'P3 penempatan manual tanpa alasan ditolak penjaga',
  !!putAwayManualTanpaAlasan.penolakan && putAwayManualTanpaAlasan.penolakan.includes('wajib disertai alasan')
);

const putAwayManualSah = tentukanTempatSimpan({
  daftarAturan: db.getAturanSimpan(),
  daftarGudang: db.getGudangFisik(),
  daftarBin: db.getLokasiBin(),
  jumlah: 2,
  binTujuanManual: 'BIN-B02-01-01',
  alasanManual: 'Relokasi sementara inspeksi rak B01 oleh PJT'
});
cek(
  'P4 penempatan manual dengan alasan sah diterima',
  !putAwayManualSah.penolakan && putAwayManualSah.bin?.id === 'BIN-B02-01-01'
);

const pindah = db.pindahkanStokAntarBin(
  'STK-002',
  'BIN-B01-04-01',
  3,
  { pengguna: 'Kepala Gudang', peran: 'Operator Gudang' },
  ACUAN
);
cek('P5 pindahkanStokAntarBin memindahkan unit dan menjaga rantai hash tetap utuh', pindah.boleh && verifikasiRantaiHash(db.getJejakPergerakan()).utuh);

// ==================== 3. Rute Picking & Gerbang Surat Jalan (§3.4) ====================
mulai();
const ruteZigzag = susunRutePicking({
  item: [
    { binId: 'BIN-D04-02-01', nomorBets: 'LOT-A', qty: 2 },
    { binId: 'BIN-B01-03-01', nomorBets: 'LOT-B', qty: 1 },
    { binId: 'BIN-C01-01-01', nomorBets: 'LOT-C', qty: 3 }
  ],
  daftarBin: db.getLokasiBin()
});
cek(
  `R1 penyusun rute mengurutkan lorong B→C→D (${ruteZigzag.lorongTerlibat.join('→')}) dan menghemat jarak (${ruteZigzag.hematMeter} m)`,
  !ruteZigzag.penolakan &&
    ruteZigzag.lorongTerlibat.join(',') === 'B,C,D' &&
    ruteZigzag.hematMeter > 0 &&
    ruteZigzag.jarakTotalMeter < ruteZigzag.jarakUrutanAsliMeter
);

const ruteSjt002 = db.susunRuteSuratJalan('SJT-002', ACUAN);
const sjt002Setelah = db.getSuratJalan().find((s) => s.id === 'SJT-002');
cek(
  `R2 susunRuteSuratJalan SJT-002 mengubah status Antre Picking → Rute Tersusun (${sjt002Setelah?.status})`,
  ruteSjt002.boleh && sjt002Setelah?.status === 'Rute Tersusun' && (sjt002Setelah?.rute.length ?? 0) > 0
);

// ==================== 4. Reorder Point, Ageing Lock & Kalibrasi Trek B (§3.5, §3.6, §3.7) ====================
mulai();
const ambang06 = db.getAmbangStok().find((a) => a.id === 'AMB-06')!;
const stokBebasAmbang06 = db
  .getStokGudang()
  .filter((s) => s.kodeSKU === ambang06.kodeSKU && s.statusStok === 'AVAILABLE')
  .reduce((t, s) => t + Math.max(s.jumlahStok - (s.qtyDipesan ?? 0), 0), 0);
const hasilRop06 = hitungReorderPoint(ambang06, stokBebasAmbang06);
cek(
  `O1 fixture AMB-06 terdeteksi di bawah titik pesan (${hasilRop06.status}, usul beli ${hasilRop06.usulanQtyBeli})`,
  hasilRop06.status !== 'Aman' && hasilRop06.usulanQtyBeli > 0
);

const konfigurasiAwal = db.getKonfigurasiGudang();
const ageingDekat = nilaiUmurStok({ tanggalKedaluwarsa: '2024-07-25' }, konfigurasiAwal, ACUAN);
cek(
  `O2 nilaiUmurStok menandai sisa ED < ${konfigurasiAwal.umurKunciEdHari} hari sebagai perluKunci (${ageingDekat.sisaHari} hari)`,
  ageingDekat.perluKunci && ageingDekat.label === 'Kritis (< 2 Bulan)'
);

const daftarPerluAgeing = daftarStokPerluKunciAgeing({
  daftarStok: [
    ...db.getStokGudang(),
    {
      ...db.getStokGudang()[0],
      id: 'STK-AGE-TEST',
      nomorBets: 'LOT-NEAR-ED',
      tanggalKedaluwarsa: '2024-07-25',
      statusStok: 'AVAILABLE'
    }
  ],
  konfigurasi: konfigurasiAwal,
  dari: ACUAN
});
cek(
  'O3 daftarStokPerluKunciAgeing menangkap bets AVAILABLE mendekati ED dan mengabaikan bets yang sudah terkunci',
  daftarPerluAgeing.some((d) => d.stok.id === 'STK-AGE-TEST') &&
    !daftarPerluAgeing.some((d) => d.stok.statusStok === 'EXPIRED_LOCK' || d.stok.statusStok === 'QUARANTINE')
);

const unitKalibrasiLewat: UnitSerialAlkes = {
  ...db.getUnitSerial()[0],
  id: 'UNT-TEST-KAL',
  nomorSerial: 'SN-TEST-KAL-01',
  nomorBets: 'LOT-2024-PM44',
  statusUnit: 'Di Gudang',
  kalibrasiBerikutnya: '2024-05-01'
};
const kelayakanUnit = unitLayakKirim(unitKalibrasiLewat, ACUAN);
cek(
  'O4 unitLayakKirim menolak unit Trek B yang melewati kalibrasiBerikutnya',
  !kelayakanUnit.layakKirim && kelayakanUnit.lewatKalibrasi
);

const fefoTrekB = alokasiFEFOSadarKunci({
  daftarStok: db.getStokGudang(),
  jumlahDiminta: 1,
  kodeSKU: 'ALKES-PM-01',
  daftarUnit: [unitKalibrasiLewat],
  dari: ACUAN
});
cek(
  'O5 alokasiFEFOSadarKunci melewati bets Trek B yang unit serialnya lewat kalibrasi',
  fefoTrekB.dilewati.some((d) => d.nomorBets === 'LOT-2024-PM44' && d.sebab.includes('Trek B'))
);

// ==================== 5. Blind Count & Deteksi Manipulasi Rantai Hash (§3.8 & §3.9) ====================
mulai();
const opn002 = db.getOpnameStok().find((o) => o.id === 'OPN-002')!;
const lembarButa = lembarHitungBlind(opn002.baris);
cek(
  'H1 lembarHitungBlind menyembunyikan qtySistem dari petugas hitung fisik',
  lembarButa.length === opn002.baris.length &&
    lembarButa.every((b) => !('qtySistem' in (b as Record<string, unknown>)))
);

const opnameSelisihBesar = {
  ...opn002,
  baris: opn002.baris.map((b) => ({ ...b, qtyFisik: Math.max(b.qtySistem - 15, 0) }))
};
const selisihBesar = hitungSelisihOpname(opnameSelisihBesar, db.getKonfigurasiGudang());
cek(
  'H2 selisih opname di atas ambang wajib berstatus Selisih Diajukan & butuhVerifikasiPJT',
  selisihBesar.butuhVerifikasiPJT && selisihBesar.statusSetelahHitung === 'Selisih Diajukan'
);

const jejakAsli = db.getJejakPergerakan();
const jejakManipulasiIsi = jejakAsli.map((m, idx) => (idx === 3 ? { ...m, jumlah: m.jumlah + 99 } : m));
const cekManipulasiIsi = verifikasiRantaiHash(jejakManipulasiIsi);
cek(
  'H3 verifikasiRantaiHash mendeteksi perubahan jumlah pada baris tengah (Hash Tidak Cocok)',
  !cekManipulasiIsi.utuh && cekManipulasiIsi.penyimpangan.some((p) => p.jenis === 'Hash Tidak Cocok')
);

const jejakPutus = jejakAsli.map((m, idx) => (idx === 5 ? { ...m, hashSebelum: 'f'.repeat(64) } : m));
const cekPutus = verifikasiRantaiHash(jejakPutus);
cek(
  'H4 verifikasiRantaiHash mendeteksi pemutusan hashSebelum (Sambungan Putus)',
  !cekPutus.utuh && cekPutus.penyimpangan.some((p) => p.jenis === 'Sambungan Putus')
);

// ==================== 6. Scanner & RFID — 4 Penolakan Eksplisit (§3.10) ====================
mulai();
const scanBetsAsing = db.catatPemindaian({
  perangkat: 'Zebra TC26-01',
  tipePerangkat: 'Handheld PDA',
  protokol: 'USB/Serial',
  mode: 'Pengiriman',
  binDipindai: 'BIN-B02-01-01',
  produkDipindai: 'ALKES-SP-02',
  nomorBets: 'LOT-TIDAK-ADA-999',
  jumlah: 1,
  rujukanDokumen: 'SJ-UJI-SCAN'
});
cek(
  'SC1 scanner menolak bets tidak terdaftar',
  !scanBetsAsing.hasil.bolehDiproses && scanBetsAsing.kejadian.hasilValidasi === 'Bets Tidak Terdaftar'
);

const scanKarantina = db.catatPemindaian({
  perangkat: 'Zebra TC26-01',
  tipePerangkat: 'Handheld PDA',
  protokol: 'USB/Serial',
  mode: 'Pengiriman',
  binDipindai: 'BIN-K02-01-01',
  produkDipindai: 'ALKES-SP-02',
  nomorBets: 'LOT-2024-SP08',
  jumlah: 1,
  rujukanDokumen: 'SJ-UJI-SCAN'
});
cek(
  'SC2 scanner menolak stok terkunci karantina',
  !scanKarantina.hasil.bolehDiproses && scanKarantina.kejadian.hasilValidasi === 'Stok Terkunci Karantina'
);

const scanSalahZona = db.catatPemindaian({
  perangkat: 'Zebra TC26-01',
  tipePerangkat: 'Handheld PDA',
  protokol: 'USB/Serial',
  mode: 'Pemindahan Rak',
  binDipindai: 'BIN-B02-01-01', // Ruang Sejuk
  produkDipindai: 'ALKES-SP-02',
  nomorBets: 'LOT-2024-SP12',
  jumlah: 1,
  zonaSuhuDibutuhkan: 'Cold Chain (2°C - 8°C)',
  rujukanDokumen: 'TRM-UJI-SCAN'
});
cek(
  'SC3 scanner menolak bin tidak sesuai zona suhu',
  !scanSalahZona.hasil.bolehDiproses && scanSalahZona.kejadian.hasilValidasi === 'Bin Tidak Sesuai Zona'
);

const scanLebihManifes = db.catatPemindaian({
  perangkat: 'RFID-Gate-Dock-Out',
  tipePerangkat: 'RFID Gate',
  protokol: 'MQTT',
  mode: 'Pengiriman',
  binDipindai: 'BIN-B02-01-01',
  produkDipindai: 'ALKES-SP-02',
  nomorBets: 'LOT-2024-SP12',
  jumlah: 6,
  qtyManifes: 5,
  sudahTervalidasi: 0,
  rujukanDokumen: 'SJ/CDAKB/2024/SP-RS-2024-119'
});
cek(
  'SC4 scanner menolak jumlah melebihi manifes',
  !scanLebihManifes.hasil.bolehDiproses && scanLebihManifes.kejadian.hasilValidasi === 'Jumlah Melebihi Manifes'
);

const scanSah = db.catatPemindaian({
  perangkat: 'RFID-Gate-Dock-Out',
  tipePerangkat: 'RFID Gate',
  protokol: 'MQTT',
  mode: 'Pengiriman',
  binDipindai: 'BIN-B02-01-01',
  produkDipindai: 'ALKES-SP-02',
  nomorBets: 'LOT-2024-SP12',
  jumlah: 5,
  qtyManifes: 5,
  sudahTervalidasi: 0,
  rujukanDokumen: 'SJ/CDAKB/2024/SP-RS-2024-119'
});
cek(
  'SC5 scanner menerima pemindaian valid & menulis audit Scanner & RFID',
  scanSah.hasil.bolehDiproses &&
    scanSah.kejadian.hasilValidasi === 'Tervalidasi' &&
    db.getAuditTrail().some((a) => a.modul === 'Gudang & Logistik — Scanner & RFID')
);

// ==================== 7. Karantina & Penarikan Produk / Recall (§3.11) ====================
mulai();
const dampakSp12 = dampakRecallBets({
  nomorBets: 'LOT-2024-SP12',
  daftarStok: db.getStokGudang(),
  daftarSuratJalan: db.getSuratJalan(),
  daftarUnit: db.getUnitSerial()
});
cek(
  'RC1 dampakRecallBets menghitung unit gudang yang akan dikunci beserta daftar fasyankes penerima',
  dampakSp12.totalUnitGudang > 0 && dampakSp12.perluSinkronLkpp
);

db.kunciStokKarantina('STK-002', 'Simulasi edaran recall uji M6');
cek(
  'RC2 kunciStokKarantina memblokir bets dari alokasi FEFO',
  db.getStokGudang().find((s) => s.id === 'STK-002')?.statusStok === 'QUARANTINE' &&
    alokasiFEFOSadarKunci({
      daftarStok: db.getStokGudang(),
      jumlahDiminta: 1,
      kodeSKU: 'ALKES-SP-02',
      dari: ACUAN
    }).totalDiambil === 0
);

const recallAwal = db.getPenarikanProduk()[0];
const gerbangTutupGagal = gerbangPenutupanRecall({
  ...recallAwal,
  jumlahBeredar: 100,
  jumlahTelahDitarik: 80,
  status: 'Penarikan Lapangan'
});
const gerbangTutupLolos = gerbangPenutupanRecall({
  ...recallAwal,
  jumlahBeredar: 100,
  jumlahTelahDitarik: 100,
  status: 'Karantina Pusat'
});
cek(
  'RC3 gerbangPenutupanRecall menahan penutupan sebelum 100% unit ditarik ke Karantina Pusat / Pemusnahan',
  !gerbangTutupGagal.bolehDitutup && gerbangTutupGagal.sebab.length === 2 && gerbangTutupLolos.bolehDitutup
);

// ==================== 8. Kemenkes RI: LKPP & SATUSEHAT FHIR (§3.12) ====================
mulai();
const gerbangIvdGagal = gerbangKonfirmasiStokSales({
  daftarLkpp: db.getSinkronisasiLkpp(),
  kodeSKU: 'IVD-STD-06' // LKP-005 berstatus Gagal (HTTP 503) di seed
});
const gerbangSpDitolak = gerbangKonfirmasiStokSales({
  daftarLkpp: db.getSinkronisasiLkpp(),
  kodeSKU: 'ALKES-SP-02' // LKP-003 berstatus Ditolak di seed
});
cek(
  'KM1 gerbangKonfirmasiStokSales memblokir SKU dengan webhook LKPP Gagal (IVD-STD-06) maupun Ditolak (ALKES-SP-02)',
  !gerbangIvdGagal.bolehKonfirmasi && !gerbangSpDitolak.bolehKonfirmasi
);

db.ubahStatusSinkronisasiLkpp('LKP-005', 'Terkirim', 'HTTP 200 - sinkronisasi ulang M6 berhasil');
const gerbangIvdPulih = gerbangKonfirmasiStokSales({
  daftarLkpp: db.getSinkronisasiLkpp(),
  kodeSKU: 'IVD-STD-06'
});
cek(
  'KM2 sinkronisasi ulang LKPP membuka kembali gerbang konfirmasi pesanan Sales',
  gerbangIvdPulih.bolehKonfirmasi
);

const fhirTanpaKode = db.catatKirimanSatuSehat({
  tipeSumberDaya: 'SupplyDelivery',
  nomorRujukan: 'SJ/CDAKB/2024/UJI-01',
  kodeFasyankes: '',
  namaFasyankes: 'RS Tanpa Kode Master',
  nomorBets: 'LOT-2024-PM44',
  suhuRantaiDingin: '4.8°C',
  waktu: ACUAN
});
cek(
  'KM3 validator FHIR menahan kiriman tanpa kode fasyankes SATUSEHAT',
  !fhirTanpaKode.validasi.layakKirim && fhirTanpaKode.kiriman.status === 'Belum Terkirim'
);

const fhirSuhuTinggi = validasiKirimanSatuSehat({
  kiriman: {
    ...fhirTanpaKode.kiriman,
    kodeFasyankes: 'FKN-RS-0041',
    suhuRantaiDingin: '11.2°C'
  },
  daftarKiriman: db.getKirimanSatuSehat(),
  konfigurasi: db.getKonfigurasiGudang()
});
cek(
  'KM4 validator FHIR menolak lampiran suhu rantai dingin di luar 2–8°C (11.2°C)',
  !fhirSuhuTinggi.layakKirim && fhirSuhuTinggi.sebab.some((s) => s.includes('11.2°C'))
);

const fhirValid = db.catatKirimanSatuSehat({
  tipeSumberDaya: 'SupplyDelivery',
  nomorRujukan: 'SJ/CDAKB/2024/UJI-02',
  kodeFasyankes: 'FKN-RS-0041',
  namaFasyankes: 'RSUD Pasar Minggu Jakarta Selatan',
  nomorBets: 'LOT-2024-PM44',
  suhuRantaiDingin: '4.6°C',
  waktu: ACUAN
});
cek(
  'KM5 kiriman FHIR valid masuk status Antre & menulis jejak audit Gudang & Logistik — Kemenkes RI',
  fhirValid.validasi.layakKirim &&
    fhirValid.kiriman.status === 'Antre' &&
    db.getAuditTrail().some((a) => a.modul === 'Gudang & Logistik — Kemenkes RI')
);

// ==================== 9. Rantai Dingin & Kesiapan Audit CDB 15 Poin (Tab 1 & Tab 4) ====================
mulai();
const logExcursiKritis: LogSuhu[] = [
  {
    id: 'SUHU-UJI-1',
    waktu: '2024-06-15 06:00',
    zona: 'Cold Chain (2°C - 8°C)',
    sensor: 'IoT-CH-01',
    suhu: 10.4,
    kelembaban: 52,
    status: 'Peringatan Suhu Tinggi'
  },
  {
    id: 'SUHU-UJI-2',
    waktu: '2024-06-15 10:00',
    zona: 'Cold Chain (2°C - 8°C)',
    sensor: 'IoT-CH-01',
    suhu: 9.8,
    kelembaban: 53,
    status: 'Peringatan Suhu Tinggi'
  }
];
const excursi = deteksiExcursiRantaiDingin(logExcursiKritis, db.getKonfigurasiGudang());
cek(
  'CD1 deteksiExcursiRantaiDingin menandai episode kritis > ambang menit dan mewajibkan kunci karantina cold chain',
  excursi.episodeKritis.length === 1 && excursi.wajibKunciColdChain
);

const kesiapan = nilaiKesiapanAuditCdb({
  daftarStok: db.getStokGudang(),
  daftarPergerakan: db.getJejakPergerakan(),
  daftarTerima: db.getTerimaBarang(),
  daftarSuratJalan: db.getSuratJalan(),
  daftarOpname: db.getOpnameStok(),
  daftarLkpp: db.getSinkronisasiLkpp(),
  daftarFhir: db.getKirimanSatuSehat(),
  daftarAmbang: db.getAmbangStok(),
  daftarGudang: db.getGudangFisik(),
  daftarUnit: db.getUnitSerial(),
  daftarIzinEdar: db.getIzinEdar(),
  daftarRecall: db.getPenarikanProduk(),
  daftarCapa: [],
  logSuhu: logExcursiKritis,
  konfigurasi: db.getKonfigurasiGudang(),
  dari: ACUAN
});
cek(
  'CD2 nilaiKesiapanAuditCdb mengevaluasi tepat 15 poin pemeriksaan lintas tab',
  kesiapan.pemeriksaan.length === 15
);
cek(
  'CD3 senarai periksa tidak dapat berpredikat Siap Audit selama ada excursion suhu tanpa CAPA atau kegagalan LKPP',
  kesiapan.predikat === 'Belum Siap' && kesiapan.jumlahBahaya >= 2
);
cek(
  'CD4 poin pemeriksaan Tab 12 (LKPP & SATUSEHAT) menggunakan nama area Kemenkes RI',
  kesiapan.pemeriksaan
    .filter((p) => p.tab === 12)
    .every((p) => p.area === 'Kemenkes RI')
);

// ==================== 10. Audit Statis Tipografi Token & Kepemilikan §0B ====================
const akar = process.cwd();
const dirGudang = path.join(akar, 'src/components/modules/operations/gudang');
const berkasGudang = fs
  .readdirSync(dirGudang)
  .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
  .map((f) => path.join(dirGudang, f));

const berkasDiperiksa = [
  path.join(akar, 'src/components/modules/operations/WarehouseModule.tsx'),
  ...berkasGudang,
  path.join(akar, 'src/components/modules/commercial/SalesModule.tsx'),
  path.join(akar, 'src/components/modules/commercial/sales/SalesOrderModule.tsx'),
  path.join(akar, 'src/components/modules/commercial/PMSModule.tsx')
];

const polaTerlarang = /text-\[[0-9.]+px\]|border-l-4|animate-pulse|window\.(alert|confirm|prompt|open)\b/;
const pelanggaranUi: string[] = [];
for (const berkas of berkasDiperiksa) {
  const isi = fs.readFileSync(berkas, 'utf8');
  isi.split('\n').forEach((baris, i) => {
    if (polaTerlarang.test(baris)) {
      pelanggaranUi.push(`${path.relative(akar, berkas)}:${i + 1}: ${baris.trim()}`);
    }
  });
}
cek(
  `UI1 nol pemakaian ukuran huruf arbitrer text-[Npx], border-l-4, animate-pulse, atau window.alert/open pada ${berkasDiperiksa.length} berkas modul (${pelanggaranUi.join(' | ')})`,
  pelanggaranUi.length === 0
);

const isiWarehouse = fs.readFileSync(
  path.join(akar, 'src/components/modules/operations/WarehouseModule.tsx'),
  'utf8'
);
cek(
  'UI2 WarehouseModule memuat 12 kelompok kerja dengan tab ke-12 bernama Kemenkes RI',
  isiWarehouse.includes('12 kelompok kerja') &&
    isiWarehouse.includes("label: 'Kemenkes RI'") &&
    !isiWarehouse.includes('Gerbang Pemerintah')
);

const isiSales = fs.readFileSync(
  path.join(akar, 'src/components/modules/commercial/SalesModule.tsx'),
  'utf8'
);
cek(
  'UI3 SalesModule dipulihkan ke 7 kelompok kerja tanpa tab ketelusuran (§0B)',
  isiSales.includes('7 kelompok kerja') &&
    !isiSales.includes('KetelusuranSalesModule') &&
    !fs.existsSync(path.join(akar, 'src/components/modules/commercial/sales/KetelusuranSalesModule.tsx'))
);

const isiPms = fs.readFileSync(
  path.join(akar, 'src/components/modules/commercial/PMSModule.tsx'),
  'utf8'
);
cek(
  'UI4 PMSModule menyediakan ringkasan baca-saja recall & tautan onBukaRecallGudang ke Tab 11 Gudang (§0B)',
  isiPms.includes('onBukaRecallGudang') && !isiPms.includes('addPenarikanProduk')
);

if (masalah > 0) {
  console.error(`GAGAL: ${masalah} dari ${totalAsersi} pemeriksaan M6 Gudang & Logistik tidak terpenuhi.`);
  process.exit(1);
}

console.log(
  `OK: ${totalAsersi} pemeriksaan M6 Gudang & Logistik lolos (12 aturan §3, kesiapan audit 15 poin, Kemenkes RI, tipografi token & migrasi §0B).`
);
