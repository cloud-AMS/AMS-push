// Penjaga integritas benih Gudang & Logistics (cetak biru M2).
// Jalankan: npm run cek:benih
// Tujuan: memastikan data contoh tetap dapat dipercaya ketika baris pergerakan, bin,
// atau penerimaan ditambah/diubah — saldo log harus sama dengan snapshot stok dan
// rantai hash jejak pergerakan harus tetap utuh.
import { createHash } from 'node:crypto';
import {
  INITIAL_AMBANG_STOK,
  INITIAL_ATURAN_SIMPAN,
  INITIAL_GUDANG_FISIK,
  INITIAL_JEJAK_PERGERAKAN,
  INITIAL_KEJADIAN_SCANNER,
  INITIAL_LOKASI_BIN,
  INITIAL_OPNAME_STOK,
  INITIAL_PURCHASE_ORDER,
  INITIAL_STOK_GUDANG,
  INITIAL_SURAT_JALAN,
  INITIAL_TERIMA_BARANG
} from '../src/data/initialData';
import type { JejakPergerakan } from '../src/types';
import { alokasiFEFOSadarKunci, bentukKanonikPergerakan, sha256Hex, verifikasiRantaiHash } from '../src/utils/gudang';

const GENESIS = '0'.repeat(64);
const gudang = new Set(INITIAL_GUDANG_FISIK.map((g) => g.id));
const bin = new Map(INITIAL_LOKASI_BIN.map((b) => [b.id, b]));
const titikVirtual = new Set(['DOCK-01', 'DOCK-02', 'DOCK-03', 'OUT-FASYANKES', 'OPNAME']);
const po = new Map(INITIAL_PURCHASE_ORDER.map((p) => [p.id, p]));
const nomorTerima = new Set(INITIAL_TERIMA_BARANG.map((t) => t.nomorTerima));

let masalah = 0;
const cek = (label: string, lolos: boolean) => {
  if (!lolos) {
    console.error(`[benih gudang] ${label}`);
    masalah++;
  }
};

INITIAL_STOK_GUDANG.forEach((s) => {
  const b = bin.get(s.binId ?? '');
  cek(`stok ${s.id}: gudang ${s.gudangId} ada`, gudang.has(s.gudangId ?? ''));
  cek(`stok ${s.id}: bin ${s.binId} ada`, !!b);
  if (!b) return;
  cek(`stok ${s.id}: bin ${b.id} milik gudang ${s.gudangId}`, b.gudangId === s.gudangId);
  cek(`stok ${s.id}: zona suhu sama dengan bin`, b.zonaSuhu === s.zonaSuhu);
  cek(`stok ${s.id}: satuan sama dengan bin`, b.satuan === s.satuan);
  cek(`stok ${s.id}: jumlah ${s.jumlahStok} tidak melebihi kapasitas ${b.kapasitas}`, b.kapasitas >= s.jumlahStok);
  cek(`stok ${s.id}: jalur B punya tag RFID atau nomor seri`, s.jalur !== 'B' || !!(s.rfidTagId || s.nomorSerial));
});

INITIAL_LOKASI_BIN.forEach((b) => {
  cek(`bin ${b.id}: gudang ${b.gudangId} ada`, gudang.has(b.gudangId));
  cek(`bin ${b.id}: terpakai ${b.terpakai} tidak melebihi kapasitas ${b.kapasitas}`, b.kapasitas >= b.terpakai);
});

INITIAL_ATURAN_SIMPAN.forEach((a) => cek(`aturan ${a.id}: gudang tujuan ${a.gudangTujuanId} ada`, gudang.has(a.gudangTujuanId)));

INITIAL_TERIMA_BARANG.forEach((t) => {
  cek(`terima ${t.id}: purchaseOrderId ${t.purchaseOrderId} ada`, po.has(t.purchaseOrderId));
  cek(`terima ${t.id}: nomor PO cocok dengan modul Pembelian`, po.get(t.purchaseOrderId)?.nomorPO === t.nomorPurchaseOrder);
  t.baris.forEach((r) => cek(`terima ${t.id}: bin tujuan ${r.binTujuanId} ada`, bin.has(r.binTujuanId)));
});

INITIAL_SURAT_JALAN.forEach((s) => s.rute.forEach((r) => cek(`surat jalan ${s.id}: bin ${r.binId} ada`, bin.has(r.binId))));

INITIAL_OPNAME_STOK.forEach((o) => {
  cek(`opname ${o.id}: gudang ${o.gudangId} ada`, gudang.has(o.gudangId));
  o.baris.forEach((r) => cek(`opname ${o.id}: bin ${r.binId} ada`, bin.has(r.binId)));
});

INITIAL_AMBANG_STOK.forEach((a) => cek(`ambang ${a.id}: gudang ${a.gudangId} ada`, gudang.has(a.gudangId)));

INITIAL_KEJADIAN_SCANNER.forEach((k) => {
  if (k.binDipindai) cek(`scanner ${k.id}: titik pindai ${k.binDipindai} dikenal`, bin.has(k.binDipindai) || titikVirtual.has(k.binDipindai));
  if (/^TRM/.test(k.rujukanDokumen)) cek(`scanner ${k.id}: rujukan ${k.rujukanDokumen} terdaftar`, nomorTerima.has(k.rujukanDokumen));
});

const kanonik = (r: JejakPergerakan, hashSebelum: string) =>
  `${r.waktu}|${r.kodeSKU}|${r.nomorBets}|${r.dariBin}->${r.keBin}|${r.jumlah}|${r.tipe}|${r.dokumenRujukan}|${hashSebelum}`;
const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

let sebelumnya = GENESIS;
let waktuSebelum = 0;
const saldo = new Map<string, number>();
INITIAL_JEJAK_PERGERAKAN.forEach((m, i) => {
  cek(`pergerakan ${m.id}: dari ${m.dariBin} dikenal`, bin.has(m.dariBin) || titikVirtual.has(m.dariBin));
  cek(`pergerakan ${m.id}: ke ${m.keBin} dikenal`, bin.has(m.keBin) || titikVirtual.has(m.keBin));
  if (/^TRM/.test(m.dokumenRujukan)) cek(`pergerakan ${m.id}: rujukan ${m.dokumenRujukan} terdaftar`, nomorTerima.has(m.dokumenRujukan));
  const waktu = Date.parse(m.waktu.replace(' ', 'T'));
  cek(`pergerakan ${m.id}: urutan waktu tidak mundur`, i === 0 || waktu >= waktuSebelum);
  waktuSebelum = waktu;
  cek(`pergerakan ${m.id}: hashSebelum menyambung`, m.hashSebelum === sebelumnya);
  cek(`pergerakan ${m.id}: hash cocok dengan bentuk kanonik`, m.hash === sha256(kanonik(m, sebelumnya)));
  sebelumnya = m.hash;
  if (bin.has(m.dariBin)) {
    const kunci = `${m.dariBin}|${m.nomorBets}`;
    saldo.set(kunci, (saldo.get(kunci) ?? 0) - m.jumlah);
  }
  if (bin.has(m.keBin)) {
    const kunci = `${m.keBin}|${m.nomorBets}`;
    saldo.set(kunci, (saldo.get(kunci) ?? 0) + m.jumlah);
  }
});

INITIAL_STOK_GUDANG.forEach((s) => {
  const kunci = `${s.binId}|${s.nomorBets}`;
  cek(`stok ${s.id}: saldo log ${kunci} = ${saldo.get(kunci) ?? 0} harus sama dengan jumlahStok ${s.jumlahStok}`, (saldo.get(kunci) ?? 0) === s.jumlahStok);
  saldo.delete(kunci);
});
saldo.forEach((v, k) => cek(`log pergerakan menyisakan saldo yatim ${k} = ${v}`, v === 0));

// Util Gudang (M3) harus menghitung bentuk kanonik dan hash yang sama persis dengan seed.
cek(
  'util gudang: sha256Hex menyimpang dari node:crypto',
  sha256Hex('abc') === createHash('sha256').update('abc', 'utf8').digest('hex') &&
    sha256Hex('') === createHash('sha256').update('', 'utf8').digest('hex')
);
cek(
  'util gudang: bentuk kanonik berbeda dari kontrak seed',
  INITIAL_JEJAK_PERGERAKAN.every((m, i) => bentukKanonikPergerakan(m, i === 0 ? GENESIS : INITIAL_JEJAK_PERGERAKAN[i - 1].hash) === kanonik(m, i === 0 ? GENESIS : INITIAL_JEJAK_PERGERAKAN[i - 1].hash))
);
const rantaiUtil = verifikasiRantaiHash(INITIAL_JEJAK_PERGERAKAN);
cek(`util gudang: verifikasiRantaiHash menolak seed (${rantaiUtil.penyimpangan.map((p) => `${p.id}:${p.jenis}`).join(', ')})`, rantaiUtil.utuh);

// Fixture penjaga: FEFO naif akan mengambil bets karantina LOT-2024-SP08 lebih dulu (ED paling awal).
const fefo = alokasiFEFOSadarKunci({
  daftarStok: INITIAL_STOK_GUDANG,
  namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
  jumlahDiminta: 5,
  dari: new Date('2024-06-15T00:00:00Z')
});
cek('util gudang: FEFO sadar-kunci masih menyentuh bets karantina LOT-2024-SP08', !fefo.usulan.some((u) => u.nomorBets === 'LOT-2024-SP08'));
cek('util gudang: FEFO sadar-kunci tidak memenuhi 5 unit dari bets AVAILABLE', fefo.sisaKekurangan === 0 && fefo.totalDiambil === 5);
cek(
  'util gudang: FEFO melewati kuota pesanan aktif (qtyDipesan)',
  fefo.usulan.every((u) => {
    const stok = INITIAL_STOK_GUDANG.find((s) => s.id === u.stokId)!;
    return u.diambil <= stok.jumlahStok - (stok.qtyDipesan ?? 0);
  })
);
cek('util gudang: FEFO melaporkan bets terkunci sebagai dilewati', fefo.dilewati.some((d) => d.nomorBets === 'LOT-2024-SP08'));

if (masalah > 0) {
  console.error(`[benih gudang] ${masalah} masalah ditemukan`);
  process.exitCode = 1;
} else {
  console.log(
    `[benih gudang] lolos: ${INITIAL_JEJAK_PERGERAKAN.length} pergerakan, ${INITIAL_LOKASI_BIN.length} bin, ${INITIAL_STOK_GUDANG.length} baris stok, ${INITIAL_TERIMA_BARANG.length} penerimaan, ${INITIAL_SURAT_JALAN.length} surat jalan`
  );
}
