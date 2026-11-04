// Penjaga jalur order→stok→surat jalan→piutang dan mutasi Gudang & Logistik (cetak biru M4).
// Jalankan: npm run cek:fefo
// Tujuan: pembatas FEFO sadar-kunci yang ditulis ulang di src/services/pocketbase.ts tidak boleh
// regresi — bets karantina tidak boleh keluar, kuota pesanan tidak boleh dilanggar, satu dokumen
// hanya boleh diposting sekali, dan setiap mutasi harus meninggalkan mata rantai + audit yang utuh.
import './penyimpanan-node';
import { db } from '../src/services/pocketbase';
import type { LokasiBin, PenjualanAlkes, TerimaBarang } from '../src/types';
import { verifikasiRantaiHash } from '../src/utils/gudang';

// Benih bertanggal 2024 sedangkan jam jalan 2026: semua mutasi diuji dengan satu tanggal acuan
// supaya urutan waktu log tetap naik dan bets tidak dinilai kedaluwarsa terhadap hari ini.
const ACUAN = new Date('2024-06-15T08:00:00');
const NOMOR_SP12 = 'LOT-2024-SP12';
const NOMOR_SP08 = 'LOT-2024-SP08';
const SJ_119 = 'SJ/CDAKB/2024/SP-RS-2024-119';
const FTR_119 = 'FTR/2024/06/119';

let masalah = 0;
const cek = (label: string, lolos: boolean) => {
  if (!lolos) {
    console.error(`[jalur fefo] ${label}`);
    masalah++;
  }
};
const mulai = () => localStorage.clear();
const stok = (id: string) => db.getStokGudang().find((s) => s.id === id);
const suratJalan = (penjualanId: string) => db.getSuratJalan().find((s) => s.penjualanId === penjualanId);
const pergerakan = (rujukan: string) => db.getJejakPergerakan().filter((m) => m.dokumenRujukan === rujukan);
const audit = (modul: string) => db.getAuditTrail().filter((a) => a.modul === modul);

/** Isi setiap bin harus tetap sama dengan jumlah kartu stok — penanda sinkronisasi rak. */
const cekIsiBin = (label: string) => {
  const penghunian = new Map<string, number>();
  db.getStokGudang().forEach((s) => {
    if (s.binId) penghunian.set(s.binId, (penghunian.get(s.binId) ?? 0) + s.jumlahStok);
  });
  const bocor = db
    .getLokasiBin()
    .filter((b) => (penghunian.get(b.id) ?? 0) !== b.terpakai)
    .map((b) => `${b.id}: ${b.terpakai} vs ${penghunian.get(b.id) ?? 0}`);
  cek(`${label}: terpakai bin = jumlah kartu stok (${bocor.join('; ')})`, bocor.length === 0);
};

// ==================== A. Outbound FEFO: pesanan 5 unit ====================
mulai();
const stokSebelum = db.getStokGudang().map((s) => ({ ...s }));
const antreanLkppSebelum = db.getSinkronisasiLkpp().length;
const hasilKirim = db.catatPengirimanSalesOrder('SO-2024-119', ACUAN);

cek('A1 pengiriman SP-RS-2024-119 diizinkan', hasilKirim.boleh);
cek(`A2 hanya satu bets terpakai (${hasilKirim.bets.map((b) => `${b.nomorBets}=${b.diambil}`).join(', ')})`, hasilKirim.bets.length === 1);
cek('A3 bets karantina LOT-2024-SP08 tidak keluar', !hasilKirim.bets.some((b) => b.nomorBets === NOMOR_SP08));
cek(`A4 bets AVAILABLE LOT-2024-SP12 terpakai 5 unit`, hasilKirim.bets.every((b) => b.nomorBets === NOMOR_SP12 && b.diambil === 5));

const sp12 = stok('STK-002');
cek(`A5 kartu stok LOT-2024-SP12 turun 46 → 41 (kini ${sp12?.jumlahStok})`, sp12?.jumlahStok === 41);
cek(`A6 kuota pesanan dilepas 11 → 6 (kini ${sp12?.qtyDipesan})`, sp12?.qtyDipesan === 6);
[
  ['STK-006', 8],
  ['STK-007', 2],
  ['STK-009', 1],
  ['STK-011', 2]
].forEach(([id, jumlah]) => {
  const baris = stok(id as string);
  const lama = stokSebelum.find((s) => s.id === id);
  cek(`A7 bets karantina/rusak ${id} tidak tersentuh (${baris?.jumlahStok} = ${lama?.jumlahStok} & status ${baris?.statusStok})`, baris?.jumlahStok === lama?.jumlahStok && baris?.statusStok === lama?.statusStok && jumlah === baris?.jumlahStok);
});

const jejakKirim = pergerakan(SJ_119);
cek(`A8 satu mata rantai Pengiriman untuk ${SJ_119} (${jejakKirim.length})`, jejakKirim.length === 1 && jejakKirim.every((m) => m.tipe === 'Pengiriman' && m.jumlah === 5));
cek(`A9 jejak keluar dari rak ke titik virtual fasyankes (${jejakKirim[0]?.dariBin} → ${jejakKirim[0]?.keBin})`, jejakKirim.every((m) => m.dariBin === 'BIN-B02-01-01' && m.keBin === 'OUT-FASYANKES'));

const sj = suratJalan('SO-2024-119');
cek(`A10 surat jalan berstatus Terbit e-Faktur (${sj?.statusEFaktur})`, sj?.statusEFaktur === 'Terbit');
cek(`A11 surat jalan berstatus Terkirim (${sj?.status})`, sj?.status === 'Terkirim');
cek(`A12 rute picking tercatat pada surat jalan (${sj?.rute.length} langkah, ${sj?.jarakTotalMeter} m)`, (sj?.rute.length ?? 0) === 1 && (sj?.qtyTotal ?? 0) === 5);
cek(`A13 nomor faktur pada surat jalan (${sj?.nomorFaktur})`, sj?.nomorFaktur === FTR_119);

const piutang = db.getTransaksi().filter((t) => t.nomorFaktur === FTR_119);
cek(`A14 tepat satu baris piutang terbit (${piutang.length})`, piutang.length === 1);
cek(`A15 piutang memakai nilai pesanan & PPN terbit (${piutang[0]?.jumlah}/${piutang[0]?.ppnStatus})`, piutang[0]?.jumlah === 175000000 && piutang[0]?.kategori === 'Pendapatan Alkes' && piutang[0]?.ppnStatus === 'PPN 11% Terbit Faktur Pajak');

const so = db.getPenjualan().find((s) => s.id === 'SO-2024-119');
cek(`A16 status pesanan Sales menjadi Terkirim (${so?.statusKirim})`, so?.statusKirim === 'Terkirim' && so?.nomorFaktur === FTR_119);
cek(`A17 pesanan tender tidak masuk antrean LKPP (${antreanLkppSebelum} → ${db.getSinkronisasiLkpp().length})`, db.getSinkronisasiLkpp().length === antreanLkppSebelum);

// Posting ulang tidak boleh menghasilkan apa pun (idempoten di level dokumen).
const jumlahJejakSebelumUlang = db.getJejakPergerakan().length;
const hasilUlang = db.catatPengirimanSalesOrder('SO-2024-119', ACUAN);
cek(`A18 pengiriman ulang ditolak (${hasilUlang.keterangan})`, !hasilUlang.boleh);
cek('A19 pengiriman ulang tidak mengubah kartu stok', stok('STK-002')?.jumlahStok === 41);
cek(`A20 pengiriman ulang tidak menambah jejak (${jumlahJejakSebelumUlang} tetap)`, db.getJejakPergerakan().length === jumlahJejakSebelumUlang);
cek(`A21 pengiriman ulang tidak menambah piutang (${db.getTransaksi().filter((t) => t.nomorFaktur === FTR_119).length})`, db.getTransaksi().filter((t) => t.nomorFaktur === FTR_119).length === 1);
cek('A22 audit Gudang & Pengiriman tercatat', audit('Gudang & Logistik — Pengiriman Outbound').length > 0);
cek('A23 audit Sales mencatat bets & surat jalan', audit('Sales & Marketing — Order').some((a) => a.perubahan?.some((p) => p.kolom === 'bets terpakai' || p.kolom === 'surat jalan')));
cekIsiBin('A');
const rantaiA = verifikasiRantaiHash(db.getJejakPergerakan());
cek(`A24 mata rantai utuh (${rantaiA.penyimpangan.map((p) => `${p.id}:${p.jenis}`).join(', ')})`, rantaiA.utuh);
cek('A25 jendela rantai masih mulai dari genesis', rantaiA.mulaiDariGenesis);

// A′: jam jalan 2026 (bukan tanggal acuan) — surat jalan yang sudah terbit harus memegang
// nomornya sendiri, karena jejak pergerakan menunjuk nomor itu.
mulai();
const hasilKirim2026 = db.catatPengirimanSalesOrder('SO-2024-119', new Date('2026-11-04T09:00:00'));
const sj2026 = suratJalan('SO-2024-119');
cek(`A27 pengiriman tanpa tanggal acuan tetap terbit (${hasilKirim2026.nomorSuratJalan})`, hasilKirim2026.boleh);
cek(`A28 rujukan jejak = nomor surat jalan yang terbit (${sj2026?.nomorSuratJalan})`, pergerakan(sj2026?.nomorSuratJalan ?? '').length === 1);
cek('A29 nomor surat jalan warisan tidak tertukar dengan nomor generated tahun kini', sj2026?.nomorSuratJalan === SJ_119 && !pergerakan('SJ/CDAKB/2026/SP-RS-2024-119').length);

// ==================== B. Outbound ditahan saat stok bebas kurang ====================mulai();
const pesananBesar: PenjualanAlkes = {
  id: 'SO-TEST-40',
  nomorPesanan: 'SP-TEST-2024-040',
  fasyankes: 'RSUD Testing Provinsi',
  jalurPenjualan: 'Pembelian Langsung RS Swasta',
  namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
  nomorBets: NOMOR_SP12,
  jumlah: 40,
  satuan: 'Unit',
  totalHarga: 1_400_000_000,
  statusVerifikasiEtikaIklan: 'Memenuhi Etika Promosi',
  statusKirim: 'Menunggu Alokasi FEFO',
  tanggalPesanan: '2024-06-14'
};
db.addPenjualan(pesananBesar);
const jejakSebelumB = db.getJejakPergerakan().length;
const stokSebelumB = db.getStokGudang().map((s) => `${s.id}:${s.jumlahStok}`).join('|');
const hasilBesar = db.catatPengirimanSalesOrder('SO-TEST-40', ACUAN);
cek(`B1 permintaan 40 unit ditahan gerbang FEFO (${hasilBesar.keterangan})`, !hasilBesar.boleh);
cek('B2 alasan menahan menyebut bets karantina yang dilewati', hasilBesar.keterangan.includes(NOMOR_SP08) && hasilBesar.keterangan.includes('dilewati'));
cek('B3 penolakan tidak menyentuh kartu stok', db.getStokGudang().map((s) => `${s.id}:${s.jumlahStok}`).join('|') === stokSebelumB);
cek(`B4 penolakan tidak menulis jejak (${jejakSebelumB} → ${db.getJejakPergerakan().length})`, db.getJejakPergerakan().length === jejakSebelumB);
cek('B5 penolakan tidak menayangkan surat jalan', !suratJalan('SO-TEST-40') || suratJalan('SO-TEST-40')?.status !== 'Terkirim');
cek('B6 penolakan tidak menerbitkan piutang', db.getTransaksi().filter((t) => t.nomorFaktur === 'FTR/2024/06/040').length === 0);
cek('B7 pesanan tetap tertahan di status Menunggu Alokasi FEFO', db.getPenjualan().find((s) => s.id === 'SO-TEST-40')?.statusKirim === 'Menunggu Alokasi FEFO');

// ==================== C. Inbound: posting penerimaan ====================
mulai();
const terimaLolos: TerimaBarang = {
  id: 'TRM-TEST-1',
  nomorTerima: 'TRM/WH/2024/06/901-1',
  tanggalTerima: '2024-06-14',
  purchaseOrderId: 'PO-TEST-1',
  nomorPurchaseOrder: 'PO/AMS/2024/06/901',
  namaPemasok: 'PT Uji Mutu Sejahtera',
  statusMatching: 'Cocok',
  baris: [
    {
      kodeSKU: 'ALKES-SP-02',
      namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
      nomorBets: 'LOT-2024-TST01',
      tanggalKedaluwarsa: '2029-06-14',
      qtyDipesan: 5,
      qtyDiterima: 5,
      qtyDitolak: 0,
      satuan: 'Unit',
      binTujuanId: 'BIN-B02-01-01',
      alasanPenolakan: ''
    }
  ],
  hasilQCMasuk: 'Lolos (Released)',
  butuhUjiFungsi: false,
  hasilUjiFungsi: 'Belum Diuji',
  nomorLaporanQC: 'QC/UJI/2024/901',
  labelDicetak: true,
  rfidDitempel: true,
  petugas: 'Operator Gudang',
  catatan: 'Uji penjaga: penerimaan baru harus menaikkan kartu stok sekali saja.'
};
db.addTerimaBarang(terimaLolos);
const benihTerima = db.getTerimaBarang().find((t) => t.id !== 'TRM-TEST-1');
cek(`C1 penerimaan benih ditolak diposting dua kali (${benihTerima?.nomorTerima})`, !db.releasePenerimaanKeStok(benihTerima!.id, { pengguna: 'Kepala Gudang', peran: 'Operator Gudang' }, ACUAN).boleh);
const jejakSebelumC = db.getJejakPergerakan().length;
const hasilTerima = db.releasePenerimaanKeStok('TRM-TEST-1', { pengguna: 'Kepala Gudang', peran: 'Operator Gudang' }, ACUAN);
cek(`C2 posting penerimaan baru diizinkan (${hasilTerima.keterangan})`, hasilTerima.boleh && hasilTerima.barisDiposting === 1);
const betsBaru = db.getStokGudang().find((s) => s.nomorBets === 'LOT-2024-TST01');
cek(`C3 baris kartu stok baru dibuat dengan jalur A (${betsBaru?.id}/${betsBaru?.jalur}/${betsBaru?.statusStok})`, !!betsBaru && betsBaru.jumlahStok === 5 && betsBaru.jalur === 'A' && betsBaru.statusStok === 'AVAILABLE');
cek(`C4 satu jejak Penerimaan dari dock (${db.getJejakPergerakan().slice(jejakSebelumC).map((m) => `${m.tipe}:${m.dariBin}→${m.keBin}`).join(', ')})`, db.getJejakPergerakan().length === jejakSebelumC + 1 && db.getJejakPergerakan()[jejakSebelumC]?.tipe === 'Penerimaan');
cek('C5 nomor izin edar diambil dari registri, bukan dikosongkan', !!betsBaru?.nomorIzinEdar && betsBaru.nomorIzinEdar !== '-');
cek('C6 penanda posting terpasang', db.getTerimaBarang().find((t) => t.id === 'TRM-TEST-1')?.sudahDipostingKeStok === true);
const stokPasPosting = db.getStokGudang().map((s) => `${s.id}:${s.jumlahStok}`).join('|');
const hasilTerimaUlang = db.releasePenerimaanKeStok('TRM-TEST-1', { pengguna: 'Kepala Gudang', peran: 'Operator Gudang' }, ACUAN);
cek(`C7 posting ulang ditolak (${hasilTerimaUlang.keterangan})`, !hasilTerimaUlang.boleh);
cek('C8 posting ulang tidak menggandakan stok', db.getStokGudang().map((s) => `${s.id}:${s.jumlahStok}`).join('|') === stokPasPosting);
cek('C9 posting ulang tidak menambah jejak', db.getJejakPergerakan().length === jejakSebelumC + 1);
cekIsiBin('C');

// Muatan berlebih harus ditolak sebelum satu unit pun ditulis.
mulai();
const hunian = new Map<string, number>();
db.getStokGudang().forEach((s) => {
  if (s.binId) hunian.set(s.binId, (hunian.get(s.binId) ?? 0) + s.jumlahStok);
});
const binSisa = (id: string) => {
  const b = db.getLokasiBin().find((x) => x.id === id) as LokasiBin;
  return b.kapasitas - (hunian.get(id) ?? 0);
};
const binTarget = 'BIN-B02-01-01';
const terimaPenuh: TerimaBarang = { ...terimaLolos, id: 'TRM-TEST-2', nomorTerima: 'TRM/WH/2024/06/902-1', baris: [{ ...terimaLolos.baris[0], nomorBets: 'LOT-2024-TST02', qtyDipesan: 999, qtyDiterima: binSisa(binTarget) + 1 }] };
db.addTerimaBarang(terimaPenuh);
const jejakSebelumMeluap = db.getJejakPergerakan().length;
const stokSebelumMeluap = db.getStokGudang().length;
const hasilMeluap = db.releasePenerimaanKeStok('TRM-TEST-2', { pengguna: 'Kepala Gudang', peran: 'Operator Gudang' }, ACUAN);
cek(`C10 muatan melebihi sisa kapasitas ditolak (${hasilMeluap.keterangan})`, !hasilMeluap.boleh && hasilMeluap.keterangan.includes('sisa kapasitas'));
cek('C11 penolakan kapasitas tidak menulis kartu stok', db.getStokGudang().length === stokSebelumMeluap);
cek('C12 penolakan kapasitas tidak menulis jejak', db.getJejakPergerakan().length === jejakSebelumMeluap);
cek('C13 penolakan kapasitas tidak menandai dokumen terposting', db.getTerimaBarang().find((t) => t.id === 'TRM-TEST-2')?.sudahDipostingKeStok !== true);

// QC Hold → masuk rak tetapi terkunci; Tolak → tidak masuk rak sama sekali.
mulai();
const terimaHold: TerimaBarang = { ...terimaLolos, id: 'TRM-TEST-3', nomorTerima: 'TRM/WH/2024/06/903-1', hasilQCMasuk: 'Karantina (Hold)', baris: [{ ...terimaLolos.baris[0], nomorBets: 'LOT-2024-TST03' }] };
const terimaTolak: TerimaBarang = { ...terimaLolos, id: 'TRM-TEST-4', nomorTerima: 'TRM/WH/2024/06/904-1', hasilQCMasuk: 'Tolak (Rejected)', statusMatching: 'Ditolak Penerimaan', baris: [{ ...terimaLolos.baris[0], nomorBets: 'LOT-2024-TST04', qtyDiterima: 0, qtyDitolak: 5 }] };
db.addTerimaBarang(terimaHold);
db.addTerimaBarang(terimaTolak);
const hasilHold = db.releasePenerimaanKeStok('TRM-TEST-3', { pengguna: 'Kepala Gudang', peran: 'Operator Gudang' }, ACUAN);
const betsHold = db.getStokGudang().find((s) => s.nomorBets === 'LOT-2024-TST03');
cek(`C14 muatan QC Hold masuk rak berstatus QUARANTINE (${betsHold?.statusStok})`, hasilHold.boleh && betsHold?.statusStok === 'QUARANTINE' && !!betsHold?.alasanKunci);
cek('C15 muatan QC Hold tercatat sebagai jejak Karantina', pergerakan('TRM/WH/2024/06/903-1').every((m) => m.tipe === 'Karantina'));
const hasilTolak = db.releasePenerimaanKeStok('TRM-TEST-4', { pengguna: 'Kepala Gudang', peran: 'Operator Gudang' }, ACUAN);
cek(`C16 muatan ditolak QC tidak boleh masuk rak (${hasilTolak.keterangan})`, !hasilTolak.boleh);
cek('C17 muatan ditolak QC tidak menambah kartu stok', !db.getStokGudang().some((s) => s.nomorBets === 'LOT-2024-TST04'));
const lepasKunci = betsHold ? db.lepasKunciStok(betsHold.id, 'Uji penjaga: rilis PJT') : null;
cek(`C18 pelepasan kunci karantina mengembalikan status AVAILABLE (${db.getStokGudang().find((s) => s.id === betsHold?.id)?.statusStok})`, !!lepasKunci && db.getStokGudang().find((s) => s.id === betsHold?.id)?.statusStok === 'AVAILABLE');

// ==================== D. Opname: verifikasi PJT & mata rantai penyesuaian ====================
mulai();
const jejakSebelumD = db.getJejakPergerakan().length;
const hasilDitahan = db.verifikasiSelisihOpname('OPN-002');
cek(`D1 opname belum lengkap ditolak verifikasi (${hasilDitahan.keterangan})`, !hasilDitahan.boleh && hasilDitahan.keterangan.includes('belum dihitung'));
cek('D2 penolakan tidak menulis jejak penyesuaian', db.getJejakPergerakan().length === jejakSebelumD);
cek('D3 penolakan tidak mengubah status opname', db.getOpnameStok().find((o) => o.id === 'OPN-002')?.status === 'Selisih Diajukan');
cek('D4 penolakan tidak mengubah kartu stok', db.getStokGudang().find((s) => s.nomorBets === 'LOT-2024-DNG18')?.jumlahStok === 300);

const opname = db.getOpnameStok().find((o) => o.id === 'OPN-002')!;
const barisLengkap = opname.baris.map((b) => (b.nomorBets === 'LOT-2024-DNG18' ? { ...b, qtyFisik: 296, status: 'Selisih' as const } : b));
db.ubahOpnameStok('OPN-002', { baris: barisLengkap }, 'Penghitungan fisik baris bets QC Hold');
const hasilVerif = db.verifikasiSelisihOpname('OPN-002');
cek(`D5 selisih 4 unit diverifikasi PJT (${hasilVerif.keterangan})`, hasilVerif.boleh && hasilVerif.penyesuaian === 1);
cek(`D6 kartu stok disesuaikan ke hasil fisik (${db.getStokGudang().find((s) => s.nomorBets === 'LOT-2024-DNG18')?.jumlahStok})`, db.getStokGudang().find((s) => s.nomorBets === 'LOT-2024-DNG18')?.jumlahStok === 296);
const jejakOpname = pergerakan('OPN/WH/2024/06/002');
cek(`D7 satu mata rantai Opname untuk baris selisih (${jejakOpname.length})`, jejakOpname.length === 1 && jejakOpname[0].jumlah === 4 && jejakOpname[0].dariBin === 'BIN-C01-01-02' && jejakOpname[0].keBin === 'OPNAME');
cek(`D8 penyesuaian ditulis pada jam posting, bukan tanggal dokumen (${jejakOpname[0]?.waktu})`, Date.parse(jejakOpname[0]?.waktu.replace(' ', 'T') + ':00') > Date.parse('2024-06-11T00:00:00'));
cek('D9 status opname selesai dan terverifikasi', db.getOpnameStok().find((o) => o.id === 'OPN-002')?.status === 'Selesai' && db.getOpnameStok().find((o) => o.id === 'OPN-002')?.verifikasiPJT === true);
cekIsiBin('D');
const rantaiD = verifikasiRantaiHash(db.getJejakPergerakan());
cek(`D10 mata rantai tetap naik dan utuh setelah penyesuaian (${rantaiD.penyimpangan.map((p) => `${p.id}:${p.jenis}`).join(', ')})`, rantaiD.utuh);

// ==================== E. Retensi 300 baris tidak merusak mata rantai ====================
mulai();
for (let i = 0; i < 320; i++) {
  db.catatPergerakan({
    waktu: `2024-06-15 ${String(9 + Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
    kodeSKU: 'ALKES-SP-02',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorBets: NOMOR_SP12,
    dariBin: 'BIN-B02-01-01',
    keBin: 'OUT-FASYANKES',
    jumlah: 1,
    satuan: 'Unit',
    tipe: 'Picking',
    pengguna: 'Operator Gudang',
    peran: 'Operations & Technical',
    dokumenRujukan: `SJ/UJI/${i}`,
    alasan: 'Pemangkasan retensi'
  });
}
const jejakE = db.getJejakPergerakan();
const idE = jejakE.map((m) => m.id);
const naikE = jejakE.slice(1).every((m, i) => Number(m.id.slice(4)) > Number(jejakE[i].id.slice(4)));
cek(`E1 retensi menahan tepat 300 baris terbaru (${jejakE.length})`, jejakE.length === 300);
cek('E2 id pergerakan tetap unik dan menaik setelah pemangkasan', new Set(idE).size === idE.length && naikE);
const rantaiE = verifikasiRantaiHash(jejakE);
cek(`E3 mata rantai jendela retensi utuh (${rantaiE.penyimpangan.map((p) => `${p.id}:${p.jenis}`).join(', ')})`, rantaiE.utuh);
cek('E4 jendela retensi diakui tidak dimulai dari genesis', !rantaiE.mulaiDariGenesis && rantaiE.keterangan.includes('jendela retensi'));

if (masalah > 0) {
  console.error(`[jalur fefo] ${masalah} masalah ditemukan`);
  process.exit(1);
}
console.log('[jalur fefo] lolos: outbound FEFO sadar-kunci, penahan kekurangan stok, posting inbound sekali-saja, kapasitas rak, karantina QC, verifikasi opname, dan retensi 300 baris');
process.exit(0);
