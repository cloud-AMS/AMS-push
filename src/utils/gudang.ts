import type {
  AmbangStok,
  AturanSimpan,
  BarisOpname,
  CAPARecord,
  GudangFisik,
  IzinEdarAlkes,
  JejakPergerakan,
  KejadianScanner,
  KirimanSatuSehat,
  KonfigurasiGudang,
  LangkahPicking,
  LokasiBin,
  LogSuhu,
  OpnameStok,
  PenarikanProduk,
  StatusStokFisik,
  StokGudang,
  SuratJalan,
  SinkronisasiLkpp,
  TerimaBarang,
  UnitSerialAlkes
} from '../types';

const MS_PER_HARI = 86400000;
const GENESIS = '0'.repeat(64);
const STATUS_TERKUNCI: StatusStokFisik[] = ['QUARANTINE', 'DAMAGED', 'EXPIRED_LOCK'];

function tanggalHari(dari: Date) {
  return dari.toISOString().split('T')[0];
}

function selisihHariDari(terhadap: string, dari: Date) {
  const akhir = new Date(`${terhadap}T00:00:00Z`).getTime();
  if (Number.isNaN(akhir)) return 0;
  const [tahun, bulan, hari] = tanggalHari(dari).split('-').map(Number);
  return Math.round((akhir - Date.UTC(tahun, bulan - 1, hari)) / MS_PER_HARI);
}

function waktuLabel(dari: Date) {
  return `${tanggalHari(dari)} ${dari.toISOString().slice(11, 16)}`;
}

export function statusUnitStok(stok: Pick<StokGudang, 'statusStok'>): StatusStokFisik {
  return stok.statusStok ?? 'AVAILABLE';
}

export function statusTerkunci(status: StatusStokFisik) {
  return STATUS_TERKUNCI.includes(status);
}

/** Unit yang boleh dialokasikan: stok dikurangi qty yang sudah terkunci pesanan aktif. */
export function stokBebas(stok: StokGudang) {
  if (statusTerkunci(statusUnitStok(stok))) return 0;
  return Math.max(stok.jumlahStok - (stok.qtyDipesan ?? 0), 0);
}

// ==================== Aturan 9 — rantai hash log pergerakan ====================

const H_AWAL = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];

const K_SHA256 = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function rotr(x: number, n: number) {
  return ((x >>> n) | (x << (32 - n))) | 0;
}

/** SHA-256 heksadesimal — keluarannya identik dengan crypto.createHash('sha256') pada Node. */
export function sha256Hex(isi: string): string {
  const bytes = new TextEncoder().encode(isi);
  const bitLen = BigInt(bytes.length) * 8n;
  const jumlahBlok = Math.ceil((bytes.length + 9) / 64);
  const buffer = new Uint8Array(jumlahBlok * 64);
  buffer.set(bytes);
  buffer[bytes.length] = 0x80;
  const view = new DataView(buffer.buffer);
  view.setUint32(buffer.length - 8, Number(bitLen >> 32n), false);
  view.setUint32(buffer.length - 4, Number(bitLen & 0xffffffffn), false);

  let h = H_AWAL.slice();
  const w = new Int32Array(64);
  for (let blok = 0; blok < jumlahBlok; blok++) {
    const awal = blok * 64;
    for (let i = 0; i < 16; i++) w[i] = view.getInt32(awal + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, hh] = h;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (hh + S1 + ch + K_SHA256[i] + w[i]) | 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      hh = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    h = [a, b, c, d, e, f, g, hh].map((nilai, i) => (nilai + h[i]) | 0);
  }
  return h.map((nilai) => (nilai >>> 0).toString(16).padStart(8, '0')).join('');
}

/** Bentuk kanonik aturan 9 — seed dan penjaga benih menghitung string yang persis sama. */
export function bentukKanonikPergerakan(baris: JejakPergerakan, hashSebelum: string) {
  return `${baris.waktu}|${baris.kodeSKU}|${baris.nomorBets}|${baris.dariBin}->${baris.keBin}|${baris.jumlah}|${baris.tipe}|${baris.dokumenRujukan}|${hashSebelum}`;
}

export function hashPergerakan(baris: JejakPergerakan, hashSebelum: string) {
  return sha256Hex(bentukKanonikPergerakan(baris, hashSebelum));
}

export type EntriPergerakanBaru = Omit<JejakPergerakan, 'id' | 'hashSebelum' | 'hash'> & { id?: string };

export function tambahJejakPergerakan(daftar: JejakPergerakan[], entri: EntriPergerakanBaru): JejakPergerakan[] {
  const sebelumnya = daftar.length ? daftar[daftar.length - 1].hash : GENESIS;
  const { id, ...isi } = entri;
  const baris = {
    ...isi,
    id: id ?? `MOV-${String(daftar.length + 1).padStart(3, '0')}`,
    hashSebelum: sebelumnya,
    hash: ''
  } as JejakPergerakan;
  baris.hash = hashPergerakan(baris, sebelumnya);
  return [...daftar, baris];
}

export interface AbnormalitasRantai {
  id: string;
  indeks: number;
  jenis: 'Sambungan Putus' | 'Hash Tidak Cocok' | 'Waktu Mundur';
  keterangan: string;
}

export function verifikasiRantaiHash(daftar: JejakPergerakan[]): {
  utuh: boolean;
  jumlahBaris: number;
  penyimpangan: AbnormalitasRantai[];
  hashTerakhir: string;
  rentangWaktu: string;
  mulaiDariGenesis: boolean;
  keterangan: string;
} {
  const penyimpangan: AbnormalitasRantai[] = [];
  // Retensi memangkas baris tertua, jadi titik cui jendela adalah hashSebelum baris pertama
  // yang tersisa; selama jangkar itu tidak diubah, isi setiap baris tetap terbuktikan.
  const jangkar = daftar.length ? daftar[0].hashSebelum : GENESIS;
  const mulaiDariGenesis = jangkar === GENESIS;
  let sebelumnya = jangkar;
  let waktuSebelumnya = 0;
  daftar.forEach((baris, indeks) => {
    if (baris.hashSebelum !== sebelumnya) {
      penyimpangan.push({
        id: baris.id,
        indeks,
        jenis: 'Sambungan Putus',
        keterangan: `hashSebelum ${baris.hashSebelum.slice(0, 12)}… tidak menyambung ke ujung rantai ${sebelumnya.slice(0, 12)}… (baris ke-${indeks + 1})`
      });
    }
    const seharusnya = hashPergerakan(baris, sebelumnya);
    if (baris.hash !== seharusnya) {
      penyimpangan.push({
        id: baris.id,
        indeks,
        jenis: 'Hash Tidak Cocok',
        keterangan: `isi baris berubah — hash seharusnya ${seharusnya.slice(0, 12)}…, tersimpan ${baris.hash.slice(0, 12)}…`
      });
    }
    const waktu = Date.parse(baris.waktu.replace(' ', 'T'));
    if (indeks > 0 && waktu < waktuSebelumnya) {
      penyimpangan.push({ id: baris.id, indeks, jenis: 'Waktu Mundur', keterangan: `waktu ${baris.waktu} mendahului baris sebelumnya` });
    }
    waktuSebelumnya = waktu;
    sebelumnya = baris.hash;
  });
  return {
    utuh: penyimpangan.length === 0,
    jumlahBaris: daftar.length,
    penyimpangan,
    hashTerakhir: sebelumnya,
    rentangWaktu: daftar.length ? `${daftar[0].waktu} – ${daftar[daftar.length - 1].waktu}` : 'belum ada pergerakan',
    mulaiDariGenesis,
    keterangan: penyimpangan.length
      ? `Rantai terputus pada ${penyimpangan.length} titik — log tidak bisa dijadikan bukti immutability sebelum baris rusak direkonstruksi`
      : mulaiDariGenesis
        ? `${daftar.length} mata rantai utuh sejak genesis ${GENESIS.slice(0, 12)}…`
        : `${daftar.length} mata rantai utuh dalam jendela retensi (jangkar ${jangkar.slice(0, 12)}…; baris lebih tua sudah dipangkas, kecocokan dengan arsip diverifikasi di luar aplikasi)`
  };
}

// ==================== Aturan 1 & 7 — FEFO sadar-kunci ====================

export interface UsulanAlokasiFEFO {
  stokId: string;
  kodeSKU: string;
  namaAlkes: string;
  nomorBets: string;
  gudangId: string;
  binId: string;
  tanggalKedaluwarsa: string;
  diambil: number;
  sisaSetelahAmbil: number;
}

export interface BarisDilewatiFEFO {
  nomorBets: string;
  namaAlkes: string;
  jumlah: number;
  sebab: string;
}

export function unitLayakKirim(unit: UnitSerialAlkes, dari: Date = new Date()) {
  const sisa = unit.kalibrasiBerikutnya ? selisihHariDari(unit.kalibrasiBerikutnya, dari) : null;
  const lewatKalibrasi = sisa !== null && sisa < 0;
  const ditarik = unit.statusUnit === 'Ditarik (Recall)' || unit.tahapSiklusHidup === 'Decommissioning';
  return {
    layakKirim: !lewatKalibrasi && !ditarik,
    lewatKalibrasi,
    sisaHariKalibrasi: sisa,
    keterangan: ditarik
      ? `${unit.nomorSerial} berstatus ${unit.statusUnit}`
      : lewatKalibrasi
        ? `${unit.nomorSerial} melewati tenggat kalibrasi ${unit.kalibrasiBerikutnya} (${Math.abs(sisa ?? 0)} hari)`
        : `${unit.nomorSerial} layak kirim${sisa !== null ? ` — kalibrasi berikutnya ${unit.kalibrasiBerikutnya}` : ''}`
  };
}

export function alokasiFEFOSadarKunci(params: {
  daftarStok: StokGudang[];
  jumlahDiminta: number;
  namaAlkes?: string;
  kodeSKU?: string;
  daftarUnit?: UnitSerialAlkes[];
  dari?: Date;
}): {
  usulan: UsulanAlokasiFEFO[];
  totalDiambil: number;
  sisaKekurangan: number;
  dilewati: BarisDilewatiFEFO[];
  betsKedaluwarsaDilewati: number;
  keterangan: string;
} {
  const dari = params.dari ?? new Date();
  const hariIni = tanggalHari(dari);
  const carian = (params.kodeSKU ?? params.namaAlkes ?? '').trim().toLowerCase();
  const cocok = params.kodeSKU
    ? params.daftarStok.filter((s) => s.kodeSKU.toLowerCase() === carian)
    : params.namaAlkes
      ? params.daftarStok.filter((s) => s.namaAlkes.toLowerCase() === carian)
      : params.daftarStok;

  const dilewati: BarisDilewatiFEFO[] = [];
  const kandidat: StokGudang[] = [];
  let betsKedaluwarsaDilewati = 0;

  for (const stok of cocok) {
    if (stok.jumlahStok <= 0) continue;
    const catat = (sebab: string) =>
      dilewati.push({ nomorBets: stok.nomorBets, namaAlkes: stok.namaAlkes, jumlah: stok.jumlahStok, sebab });

    if (stok.tanggalKedaluwarsa < hariIni) {
      betsKedaluwarsaDilewati += stok.jumlahStok;
      catat(`kedaluwarsa ${stok.tanggalKedaluwarsa}`);
      continue;
    }
    const status = statusUnitStok(stok);
    if (status === 'QUARANTINE') {
      catat(stok.alasanKunci ? `karantina — ${stok.alasanKunci}` : 'karantina / recall hold');
      continue;
    }
    if (status === 'DAMAGED') {
      catat('rusak (bad stock)');
      continue;
    }
    if (status === 'EXPIRED_LOCK') {
      catat(`terkunci ageing — sisa ED ${selisihHariDari(stok.tanggalKedaluwarsa, dari)} hari`);
      continue;
    }
    if (params.daftarUnit?.length) {
      const unitTerkait = params.daftarUnit.filter((u) =>
        stok.nomorSerial ? u.nomorSerial === stok.nomorSerial : u.nomorBets === stok.nomorBets && u.statusUnit === 'Di Gudang'
      );
      const gagalKalibrasi = unitTerkait.map((u) => unitLayakKirim(u, dari)).find((hasil) => !hasil.layakKirim);
      if (gagalKalibrasi) {
        catat(`Trek B — ${gagalKalibrasi.keterangan}`);
        continue;
      }
    }
    if (stokBebas(stok) <= 0) {
      catat('seluruh kuota terkunci pesanan aktif');
      continue;
    }
    kandidat.push(stok);
  }

  kandidat.sort(
    (a, b) =>
      a.tanggalKedaluwarsa.localeCompare(b.tanggalKedaluwarsa) ||
      a.tanggalMasuk.localeCompare(b.tanggalMasuk) ||
      a.id.localeCompare(b.id)
  );

  let sisa = Math.max(params.jumlahDiminta, 0);
  const usulan: UsulanAlokasiFEFO[] = [];
  for (const stok of kandidat) {
    if (sisa <= 0) break;
    const bebas = stokBebas(stok);
    const diambil = Math.min(sisa, bebas);
    usulan.push({
      stokId: stok.id,
      kodeSKU: stok.kodeSKU,
      namaAlkes: stok.namaAlkes,
      nomorBets: stok.nomorBets,
      gudangId: stok.gudangId ?? '',
      binId: stok.binId ?? '',
      tanggalKedaluwarsa: stok.tanggalKedaluwarsa,
      diambil,
      sisaSetelahAmbil: bebas - diambil
    });
    sisa -= diambil;
  }

  const totalDiambil = usulan.reduce((t, u) => t + u.diambil, 0);
  return {
    usulan,
    totalDiambil,
    sisaKekurangan: Math.max(sisa, 0),
    dilewati,
    betsKedaluwarsaDilewati,
    keterangan:
      sisa > 0
        ? `FEFO hanya mampu menyiapkan ${totalDiambil} dari ${params.jumlahDiminta} unit${dilewati.length ? `; ${dilewati.length} bets terkunci/kedaluwarsa dilewati` : ''}`
        : `Alokasi FEFO penuh ${totalDiambil} unit dari ${usulan.length} bets tanpa menyentuh stok terkunci`
  };
}

// ==================== Aturan 3 — directed put-away ====================

export interface UsulanTempatSimpan {
  sumber: 'Aturan' | 'Manual' | 'Tidak Ada Aturan Cocok';
  aturan?: AturanSimpan;
  gudangTujuan?: GudangFisik;
  bin?: LokasiBin;
  keterangan: string;
  penolakan?: string;
}

export function tentukanTempatSimpan(params: {
  daftarAturan: AturanSimpan[];
  daftarGudang: GudangFisik[];
  daftarBin: LokasiBin[];
  kategoriProduk?: IzinEdarAlkes['kategori'];
  zonaSuhuDibutuhkan?: StokGudang['zonaSuhu'];
  butuhUjiFungsi?: boolean;
  steril?: boolean;
  terikatRecall?: boolean;
  jumlah: number;
  satuan?: string;
  binTujuanManual?: string;
  alasanManual?: string;
}): UsulanTempatSimpan {
  const { daftarAturan, daftarGudang, daftarBin, jumlah, satuan } = params;

  if (params.binTujuanManual) {
    const bin = daftarBin.find((b) => b.id === params.binTujuanManual);
    if (!bin) return { sumber: 'Manual', keterangan: '', penolakan: `Bin ${params.binTujuanManual} tidak terdaftar pada struktur gudang` };
    if (!params.alasanManual?.trim())
      return {
        sumber: 'Manual',
        bin,
        keterangan: '',
        penolakan: 'Penempatan manual wajib disertai alasan dan tercatat old/new pada jejak audit'
      };
    return {
      sumber: 'Manual',
      gudangTujuan: daftarGudang.find((g) => g.id === bin.gudangId),
      bin,
      keterangan: `Menyimpang dari aturan simpan, alasan: ${params.alasanManual}`
    };
  }

  const aturanTercocok = daftarAturan
    .filter((a) => a.isActive)
    .filter((a) => !a.kategoriProduk || a.kategoriProduk === params.kategoriProduk)
    .filter((a) => !a.zonaSuhuDibutuhkan || a.zonaSuhuDibutuhkan === params.zonaSuhuDibutuhkan)
    .filter((a) => !a.butuhUjiFungsi || params.butuhUjiFungsi === true)
    .filter((a) => !a.steril || params.steril === true)
    .filter((a) => !a.terikatRecall || params.terikatRecall === true)
    .sort((a, b) => a.prioritas - b.prioritas || a.id.localeCompare(b.id))[0];

  if (!aturanTercocok)
    return { sumber: 'Tidak Ada Aturan Cocok', keterangan: '', penolakan: 'Tidak ada aturan simpan yang cocok — tentukan bin manual beserta alasannya' };

  const gudang = daftarGudang.find((g) => g.id === aturanTercocok.gudangTujuanId && g.isActive);
  if (!gudang)
    return {
      sumber: 'Aturan',
      aturan: aturanTercocok,
      keterangan: '',
      penolakan: `Gudang tujuan ${aturanTercocok.gudangTujuanId} tidak aktif atau tidak terdaftar`
    };

  const zonaWajib = aturanTercocok.zonaSuhuDibutuhkan ?? params.zonaSuhuDibutuhkan;
  const cocokKategori = (bin: LokasiBin) => (params.kategoriProduk && bin.kategoriTersimpan.startsWith(params.kategoriProduk) ? 0 : 1);
  const bin = daftarBin
    .filter((b) => b.gudangId === gudang.id)
    .filter((b) => !zonaWajib || b.zonaSuhu === zonaWajib)
    .filter((b) => !satuan || b.satuan === satuan)
    .filter((b) => b.kapasitas - b.terpakai >= jumlah)
    .sort((a, b) => cocokKategori(a) - cocokKategori(b) || a.jarakDariDockMeter - b.jarakDariDockMeter || a.id.localeCompare(b.id))[0];

  if (!bin)
    return {
      sumber: 'Aturan',
      aturan: aturanTercocok,
      gudangTujuan: gudang,
      keterangan: '',
      penolakan: `${gudang.nama} tidak punya bin ${zonaWajib ?? 'dengan zona sesuai'} bersatuan ${satuan ?? 'apa pun'} dengan sisa kapasitas ${jumlah}`
    };

  return {
    sumber: 'Aturan',
    aturan: aturanTercocok,
    gudangTujuan: gudang,
    bin,
    keterangan: `Aturan "${aturanTercocok.namaAturan}" (prioritas ${aturanTercocok.prioritas}) mengarahkan ke ${gudang.nama} bin ${bin.id} — ${aturanTercocok.alasanRegulasi}`
  };
}

// ==================== Aturan 4 — rute picking ====================

export function kodeBinDariLokasi(bin: LokasiBin) {
  return `${bin.lorong}-${bin.baris}-${bin.rak}-${bin.laci}`;
}

function bandingLokasi(a: LokasiBin, b: LokasiBin) {
  const kunci = (bin: LokasiBin) => [bin.lorong, Number(bin.baris), Number(bin.rak), Number(bin.laci)];
  const ka = kunci(a);
  const kb = kunci(b);
  for (let i = 0; i < ka.length; i++) {
    if (ka[i] < kb[i]) return -1;
    if (ka[i] > kb[i]) return 1;
  }
  return a.id.localeCompare(b.id);
}

// Jarak antar langkah ditaksir dari selisih jarak-dock kedua bin, berjalan dari dock (0 meter).
function totalJarak(jarak: number[]) {
  let berjalan = 0;
  let sebelumnya = 0;
  for (const titik of jarak) {
    berjalan += Math.abs(titik - sebelumnya);
    sebelumnya = titik;
  }
  return Math.round(berjalan);
}

export function susunRutePicking(params: {
  item: { binId: string; nomorBets: string; qty: number }[];
  daftarBin: LokasiBin[];
}): {
  langkah: LangkahPicking[];
  jarakTotalMeter: number;
  jarakUrutanAsliMeter: number;
  hematMeter: number;
  lorongTerlibat: string[];
  penolakan?: string;
} {
  const peta = new Map(params.daftarBin.map((b) => [b.id, b]));
  const dikenal = params.item.filter((i) => peta.has(i.binId));
  if (dikenal.length !== params.item.length) {
    const hilang = params.item.filter((i) => !peta.has(i.binId)).map((i) => i.binId);
    return { langkah: [], jarakTotalMeter: 0, jarakUrutanAsliMeter: 0, hematMeter: 0, lorongTerlibat: [], penolakan: `Bin tidak dikenal: ${hilang.join(', ')}` };
  }
  const jarakAsli = totalJarak(dikenal.map((i) => peta.get(i.binId)!.jarakDariDockMeter));
  const terurut = [...dikenal].sort((a, b) => bandingLokasi(peta.get(a.binId)!, peta.get(b.binId)!));
  const langkah: LangkahPicking[] = terurut.map((item, indeks) => {
    const bin = peta.get(item.binId)!;
    const sebelum = indeks === 0 ? 0 : peta.get(terurut[indeks - 1].binId)!.jarakDariDockMeter;
    return {
      urutan: indeks + 1,
      binId: bin.id,
      kodeBin: kodeBinDariLokasi(bin),
      nomorBets: item.nomorBets,
      qty: item.qty,
      jarakMeter: Math.abs(bin.jarakDariDockMeter - sebelum)
    };
  });
  const jarakTotalMeter = langkah.reduce((t, l) => t + l.jarakMeter, 0);
  return {
    langkah,
    jarakTotalMeter,
    jarakUrutanAsliMeter: jarakAsli,
    hematMeter: Math.max(jarakAsli - jarakTotalMeter, 0),
    lorongTerlibat: Array.from(new Set(terurut.map((i) => peta.get(i.binId)!.lorong)))
  };
}

export function gerbangSuratJalan(params: {
  rute: LangkahPicking[];
  qtyDiminta: number;
  qtyTerkumpul: number;
  prefixSuratJalan: string;
  nomorPesanan: string;
  dari?: Date;
}): { bolehTerbit: boolean; sebab: string[]; nomorSuratJalan: string } {
  const dari = params.dari ?? new Date();
  const sebab: string[] = [];
  if (!params.rute.length) sebab.push('Rute picking belum tersusun — jalankan penyusun rute lebih dulu');
  if (params.qtyTerkumpul < params.qtyDiminta)
    sebab.push(`Alokasi FEFO kurang ${params.qtyDiminta - params.qtyTerkumpul} unit; bets terkunci tidak boleh dipaksa keluar`);
  return {
    bolehTerbit: sebab.length === 0,
    sebab,
    nomorSuratJalan: `${params.prefixSuratJalan}/${dari.getFullYear()}/${params.nomorPesanan}`
  };
}

// ==================== Aturan 5 — min/max & reorder point ====================

export function hitungReorderPoint(ambang: AmbangStok, tersedia: number) {
  const safetyStock = Math.ceil(ambang.rataRataTerjualPerHari * ambang.safetyStockHari);
  const titikPesan = Math.ceil(ambang.rataRataTerjualPerHari * ambang.leadTimeHari) + safetyStock;
  const status: 'Aman' | 'Perlu Pesan' | 'Kritis' = tersedia <= safetyStock ? 'Kritis' : tersedia <= titikPesan ? 'Perlu Pesan' : 'Aman';
  const usulanQtyBeli = status === 'Aman' ? 0 : Math.max(Math.ceil(ambang.maxStok - tersedia), titikPesan - tersedia);
  return {
    safetyStock,
    titikPesan,
    status,
    hariSebelumHabis: ambang.rataRataTerjualPerHari > 0 ? Math.floor(tersedia / ambang.rataRataTerjualPerHari) : null,
    usulanQtyBeli,
    keterangan:
      status === 'Aman'
        ? `Tersedia ${tersedia} di atas titik pesan ${titikPesan} (safety stock ${safetyStock})`
        : `Tersedia ${tersedia} ≤ titik pesan ${titikPesan} — usulkan PO ${usulanQtyBeli} unit ke ${ambang.namaPemasok}, lead time ${ambang.leadTimeHari} hari`
  };
}

// ==================== Aturan 6 — ageing lock & cuci gudang ====================

export function nilaiUmurStok(stok: Pick<StokGudang, 'tanggalKedaluwarsa'>, konfigurasi: KonfigurasiGudang, dari: Date = new Date()) {
  const sisaHari = selisihHariDari(stok.tanggalKedaluwarsa, dari);
  const label: StokGudang['statusFEFO'] =
    sisaHari < 0 ? 'Kedaluwarsa' : sisaHari <= 60 ? 'Kritis (< 2 Bulan)' : sisaHari <= 180 ? 'Perhatian (< 6 Bulan)' : 'Aman';
  const perluKunci = sisaHari < konfigurasi.umurKunciEdHari;
  return {
    sisaHari,
    label,
    perluKunci,
    saran:
      sisaHari < 0
        ? `Kedaluwarsa ${Math.abs(sisaHari)} hari lalu — pindahkan ke Gudang Rusak (Bad Stock) dan ajukan pemusnahan dengan berita acara`
        : perluKunci
          ? `Sisa ED ${sisaHari} hari < ambang kunci ${konfigurasi.umurKunciEdHari} hari — kunci EXPIRED_LOCK dan usulkan program cuci gudang ke Sales`
          : `Sisa ED ${sisaHari} hari — masih layak jual, prioritaskan pada alokasi FEFO berikutnya`
  };
}

export function daftarStokPerluKunciAgeing(params: {
  daftarStok: StokGudang[];
  konfigurasi: KonfigurasiGudang;
  dari?: Date;
}): { stok: StokGudang; sisaHari: number; label: StokGudang['statusFEFO']; saran: string }[] {
  const dari = params.dari ?? new Date();
  return params.daftarStok
    .filter((s) => !statusTerkunci(statusUnitStok(s)))
    .map((s) => ({ stok: s, ...nilaiUmurStok(s, params.konfigurasi, dari) }))
    .filter((s) => s.perluKunci);
}

// ==================== Aturan 8 — blind count & selisih opname ====================

export function lembarHitungBlind(baris: BarisOpname[]) {
  return baris.map((b) => ({ barisId: `${b.binId}|${b.nomorBets}`, binId: b.binId, kodeSKU: b.kodeSKU, namaAlkes: b.namaAlkes, nomorBets: b.nomorBets }));
}

export function hitungSelisihOpname(opname: OpnameStok, konfigurasi: KonfigurasiGudang) {
  const terisi = opname.baris.filter((b) => b.qtyFisik !== null);
  const unitSistemTotal = opname.baris.reduce((t, b) => t + b.qtySistem, 0);
  // Persentase selisih hanya membandingkan baris yang sudah dihitung fisik, agar apples-to-apples.
  const unitSistemTerhitung = terisi.reduce((t, b) => t + b.qtySistem, 0);
  const unitFisik = terisi.reduce((t, b) => t + (b.qtyFisik ?? 0), 0);
  const selisihAbs = terisi.reduce((t, b) => t + Math.abs((b.qtyFisik ?? 0) - b.qtySistem), 0);
  const persenSelisih = unitSistemTerhitung > 0 ? (selisihAbs / unitSistemTerhitung) * 100 : 0;
  const barisSelisih = terisi
    .filter((b) => (b.qtyFisik ?? 0) !== b.qtySistem)
    .map((b) => ({ binId: b.binId, nomorBets: b.nomorBets, qtySistem: b.qtySistem, qtyFisik: b.qtyFisik ?? 0, delta: (b.qtyFisik ?? 0) - b.qtySistem }));
  const melewatiAmbang = persenSelisih > konfigurasi.ambangSelisihOpnamePersen;
  const semuaTerisi = terisi.length === opname.baris.length;
  const butuhVerifikasiPJT = melewatiAmbang && barisSelisih.length > 0;
  return {
    barisTerisi: terisi.length,
    barisBelumDihitung: opname.baris.length - terisi.length,
    unitSistemTotal,
    unitSistemTerhitung,
    unitFisik,
    selisihUnit: unitFisik - unitSistemTerhitung,
    persenSelisih,
    barisSelisih,
    melewatiAmbang,
    butuhVerifikasiPJT,
    statusSetelahHitung: (barisSelisih.length === 0
      ? semuaTerisi
        ? 'Selesai'
        : 'Berjalan'
      : butuhVerifikasiPJT
        ? 'Selisih Diajukan'
        : 'Terkunci') as OpnameStok['status'],
    keterangan: [
      semuaTerisi
        ? barisSelisih.length === 0
          ? 'Hitung fisik cocok dengan sistem; opname selesai tanpa penyesuaian'
          : melewatiAmbang
            ? `Selisih ${persenSelisih.toFixed(2)}% melewati ambang ${konfigurasi.ambangSelisihOpnamePersen}% — penyesuaian butuh verifikasi PJT dan satu mata rantai pergerakan per baris`
            : `Selisih ${selisihAbs} unit (${persenSelisih.toFixed(2)}%) masih di bawah ambang — penyesuaian boleh dicatat atas nama PJT gudang`
        : `${opname.baris.length - terisi.length} baris belum dihitung fisik — opname belum boleh dikunci`,
      !semuaTerisi && barisSelisih.length
        ? `Sementara itu ${barisSelisih.length} baris yang sudah dihitung menunjukkan selisih ${selisihAbs} unit (${persenSelisih.toFixed(2)}%)`
        : ''
    ]
      .filter(Boolean)
      .join(' — ')
  };
}

export function usulkanPenyesuaianOpname(
  opname: OpnameStok,
  hasil: ReturnType<typeof hitungSelisihOpname>,
  petugas: { pengguna: string; peran: string },
  daftarStok: StokGudang[] = []
): EntriPergerakanBaru[] {
  return hasil.barisSelisih.map((b) => {
    const baris = opname.baris.find((x) => x.binId === b.binId && x.nomorBets === b.nomorBets)!;
    const satuan = daftarStok.find((s) => s.binId === b.binId && s.nomorBets === b.nomorBets)?.satuan ?? 'Unit';
    return {
      waktu: `${opname.tanggal} 00:00`,
      kodeSKU: baris.kodeSKU,
      namaAlkes: baris.namaAlkes,
      nomorBets: b.nomorBets,
      dariBin: b.delta < 0 ? b.binId : 'OPNAME',
      keBin: b.delta > 0 ? b.binId : 'OPNAME',
      jumlah: Math.abs(b.delta),
      satuan,
      tipe: 'Opname',
      pengguna: petugas.pengguna,
      peran: petugas.peran,
      dokumenRujukan: opname.nomorOpname,
      alasan: baris.catatan || `Penyesuaian opname ${opname.metode}: sistem ${b.qtySistem} menjadi fisik ${b.qtyFisik}`
    };
  });
}

// ==================== Rantai dingin — excursion & kunci otomatis ====================

export function angkaSuhu(teks: string) {
  const cocok = teks.replace(',', '.').match(/-?\d+(\.\d+)?/);
  return cocok ? Number(cocok[0]) : null;
}

export function deteksiExcursiRantaiDingin(daftarLog: LogSuhu[], konfigurasi: KonfigurasiGudang) {
  const keluar = daftarLog.filter((l) => {
    const dingin = l.zona === 'Cold Chain (2°C - 8°C)';
    const diLuarRentang = dingin && (l.suhu < konfigurasi.coldChainMinSuhu || l.suhu > konfigurasi.coldChainMaxSuhu);
    return diLuarRentang || l.status !== 'Normal';
  });
  const perSensor = new Map<string, LogSuhu[]>();
  keluar.forEach((l) => {
    const kunci = `${l.sensor}|${l.zona}`;
    perSensor.set(kunci, [...(perSensor.get(kunci) ?? []), l]);
  });
  const jarakBacaanMenit = Math.round(1440 / Math.max(konfigurasi.frekuensiLogSuhuPerHari, 1));
  const episode = Array.from(perSensor.entries()).map(([kunci, bacaan]) => {
    const [sensor, zona] = kunci.split('|');
    const tinggi = bacaan.some((b) => b.status === 'Peringatan Suhu Tinggi') || bacaan[0].suhu > konfigurasi.coldChainMaxSuhu;
    return {
      sensor,
      zona,
      arah: (tinggi ? 'Tinggi' : 'Rendah') as 'Tinggi' | 'Rendah',
      mulai: bacaan[0].waktu,
      selesai: bacaan[bacaan.length - 1].waktu,
      jumlahBacaan: bacaan.length,
      menitDiLuar: Math.max(bacaan.length * jarakBacaanMenit, jarakBacaanMenit),
      estimasiDurasi: bacaan.length === 1,
      melewatiAmbang: bacaan.length * jarakBacaanMenit > konfigurasi.menitMaksimumDiLuarRentang,
      nilaiTerendah: Math.min(...bacaan.map((b) => b.suhu)),
      nilaiTertinggi: Math.max(...bacaan.map((b) => b.suhu))
    };
  });
  const kritis = episode.filter((e) => e.melewatiAmbang);
  return {
    episode,
    bacaanDinilai: daftarLog.length,
    bacaanLuar: keluar.length,
    episodeKritis: kritis,
    wajibKunciColdChain: kritis.some((e) => e.zona === 'Cold Chain (2°C - 8°C)'),
    keterangan:
      episode.length === 0
        ? `Seluruh bacaan cold chain berada dalam ${konfigurasi.coldChainMinSuhu}°C – ${konfigurasi.coldChainMaxSuhu}°C`
        : kritis.length
          ? `${kritis.length} excursion melewati ${konfigurasi.menitMaksimumDiLuarRentang} menit (estimasi dari ${konfigurasi.frekuensiLogSuhuPerHari}x bacaan/hari) — bets terdampak wajib dikunci karantina dan CAPA dibuka`
          : `${episode.length} excursion singkat masih di bawah ambang ${konfigurasi.menitMaksimumDiLuarRentang} menit — pantau, belum perlu kunci`
  };
}

// ==================== Aturan 10 — validasi pemindaian ====================

export function validasiPemindaian(params: {
  daftarBin: LokasiBin[];
  daftarStok: StokGudang[];
  mode: KejadianScanner['mode'];
  binDipindai: string;
  nomorBets: string;
  jumlah: number;
  zonaSuhuDibutuhkan?: StokGudang['zonaSuhu'];
  satuan?: string;
  qtyManifes?: number;
  sudahTervalidasi?: number;
}): {
  hasil: KejadianScanner['hasilValidasi'];
  bolehDiproses: boolean;
  sebab: string;
  bin?: LokasiBin;
  stok?: StokGudang;
  sisaManifes?: number;
} {
  const bin = params.daftarBin.find((b) => b.id === params.binDipindai);
  const stok =
    params.daftarStok.find((s) => s.nomorBets === params.nomorBets && (!bin || s.binId === bin.id)) ??
    params.daftarStok.find((s) => s.nomorBets === params.nomorBets);

  if (!stok)
    return {
      hasil: 'Bets Tidak Terdaftar',
      bolehDiproses: false,
      sebab: `Nomor bets ${params.nomorBets} tidak ada pada kartu stok — pindai ulang atau tolak barang`,
      bin
    };

  const status = statusUnitStok(stok);
  if (statusTerkunci(status))
    return {
      hasil: 'Stok Terkunci Karantina',
      bolehDiproses: false,
      sebab: `${stok.nomorBets} berstatus ${status}${stok.alasanKunci ? ` — ${stok.alasanKunci}` : ''}; keluar masuk barang terkunci butuh rilis QA`,
      bin,
      stok
    };

  if (bin && params.zonaSuhuDibutuhkan && bin.zonaSuhu !== params.zonaSuhuDibutuhkan)
    return {
      hasil: 'Bin Tidak Sesuai Zona',
      bolehDiproses: false,
      sebab: `${stok.namaAlkes} butuh ${params.zonaSuhuDibutuhkan}, bin ${bin.id} berzona ${bin.zonaSuhu}`,
      bin,
      stok
    };

  if (bin && params.satuan && bin.satuan !== params.satuan)
    return {
      hasil: 'Bin Tidak Sesuai Zona',
      bolehDiproses: false,
      sebab: `Satuan bin ${bin.id} (${bin.satuan}) berbeda dari satuan produk (${params.satuan})`,
      bin,
      stok
    };

  if (params.qtyManifes !== undefined) {
    const sisa = params.qtyManifes - (params.sudahTervalidasi ?? 0);
    if (params.jumlah > sisa)
      return {
        hasil: 'Jumlah Melebihi Manifes',
        bolehDiproses: false,
        sebab: `Pemindaian ${params.jumlah} melebihi sisa manifes ${Math.max(sisa, 0)}`,
        bin,
        stok,
        sisaManifes: Math.max(sisa, 0)
      };
  }

  const kapasitasSisa = bin ? bin.kapasitas - bin.terpakai : Number.POSITIVE_INFINITY;
  if (params.mode === 'Penerimaan' && bin && params.jumlah > kapasitasSisa)
    return {
      hasil: 'Jumlah Melebihi Manifes',
      bolehDiproses: false,
      sebab: `Bin ${bin.id} hanya sisa ${kapasitasSisa} ${bin.satuan} dari kapasitas ${bin.kapasitas}`,
      bin,
      stok
    };

  return {
    hasil: 'Tervalidasi',
    bolehDiproses: true,
    sebab: `${params.jumlah} ${stok.satuan} ${stok.nomorBets} divalidasi pada ${bin ? bin.id : 'titik pindai'} (${params.mode})`,
    bin,
    stok,
    sisaManifes: params.qtyManifes !== undefined ? params.qtyManifes - (params.sudahTervalidasi ?? 0) - params.jumlah : undefined
  };
}

// ==================== Aturan 11 — kunci recall ====================

export function dampakRecallBets(params: {
  nomorBets: string;
  daftarStok: StokGudang[];
  daftarSuratJalan: SuratJalan[];
  daftarUnit?: UnitSerialAlkes[];
}) {
  const baris = params.daftarStok.filter((s) => s.nomorBets === params.nomorBets);
  const barisTerkunci = baris.map((s) => ({
    stokId: s.id,
    binId: s.binId ?? '',
    gudangId: s.gudangId ?? '',
    jumlah: s.jumlahStok,
    satuan: s.satuan,
    statusLama: statusUnitStok(s)
  }));
  const daftarPenerima = params.daftarSuratJalan
    .filter((sj) => sj.rute.some((r) => r.nomorBets === params.nomorBets))
    .map((sj) => ({
      nomorSuratJalan: sj.nomorSuratJalan,
      fasyankes: sj.fasyankesTujuan,
      qty: sj.rute.filter((r) => r.nomorBets === params.nomorBets).reduce((t, r) => t + r.qty, 0),
      tanggal: sj.tanggalTerbit,
      status: sj.status
    }));
  const unitSerialTerdampak = (params.daftarUnit ?? []).filter((u) => u.nomorBets === params.nomorBets).map((u) => u.nomorSerial);
  const totalUnitGudang = barisTerkunci.reduce((t, b) => t + b.jumlah, 0);
  const unitBeredar = daftarPenerima.reduce((t, p) => t + p.qty, 0);
  return {
    barisTerkunci,
    totalUnitGudang,
    unitSerialTerdampak,
    daftarPenerima,
    unitBeredar,
    perluSinkronLkpp: barisTerkunci.length > 0 || daftarPenerima.length > 0,
    keterangan: barisTerkunci.length
      ? `${totalUnitGudang} unit di gudang dikunci karantina; ${unitBeredar} unit sudah berada pada ${daftarPenerima.length} fasyankes dan wajib dilaporkan lewat LKPP serta SATUSEHAT`
      : `Bets ${params.nomorBets} tidak ditemukan pada kartu stok — verifikasi nomor bets pada edaran recall`
  };
}

export function patchKunciStok(stok: StokGudang, alasan: string, waktu: Date = new Date()): {
  statusStok: 'QUARANTINE';
  tanggalDikunci: string;
  alasanKunci: string;
} {
  return { statusStok: 'QUARANTINE', tanggalDikunci: tanggalHari(waktu), alasanKunci: alasan };
}

export function gerbangPenutupanRecall(recall: PenarikanProduk): { bolehDitutup: boolean; sebab: string[] } {
  const sebab: string[] = [];
  if (recall.jumlahTelahDitarik < recall.jumlahBeredar)
    sebab.push(`Unit tertarik ${recall.jumlahTelahDitarik} dari ${recall.jumlahBeredar} beredar — laporan fasyankes belum lengkap`);
  if (!['Karantina Pusat', 'Pemusnahan / Return Pabrik'].includes(recall.status))
    sebab.push(`Status terakhir harus Karantina Pusat atau Pemusnahan / Return Pabrik (kini ${recall.status})`);
  return { bolehDitutup: sebab.length === 0, sebab };
}

// ==================== Aturan 12 — payload & antrean pemerintah ====================

export interface PratinjauLkpp {
  endpoint: string;
  method: 'POST';
  headers: Record<string, string>;
  body: Record<string, unknown>;
  keterangan: string;
}

export function bangunPayloadLkpp(params: {
  konfigurasi: KonfigurasiGudang;
  kodeSKU: string;
  namaProduk: string;
  nomorPaketLkpp: string;
  qtyDilaporkan: number;
  satuan: string;
  pemicu: SinkronisasiLkpp['pemicu'];
  nomorBets?: string;
  statusKatalog?: 'tersedia' | 'ditangguhkan';
  waktu?: Date;
}): PratinjauLkpp {
  const waktu = params.waktu ?? new Date();
  return {
    endpoint: params.konfigurasi.endpointLkpp,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: '<token dikelola backend terpisah — tidak disimpan di aplikasi>'
    },
    body: {
      kodeSKU: params.kodeSKU,
      namaProduk: params.namaProduk,
      nomorPaket: params.nomorPaketLkpp,
      qty: params.qtyDilaporkan,
      satuan: params.satuan,
      statusKatalog: params.statusKatalog ?? (params.qtyDilaporkan > 0 ? 'tersedia' : 'ditangguhkan'),
      nomorBets: params.nomorBets ?? '',
      pemicu: params.pemicu,
      timestamp: waktuLabel(waktu)
    },
    keterangan: `Pratinjau webhook e-Katalog LKPP (${params.pemicu}) — payload siap disalin tim IT; pengiriman nyata butuh backend terpisah.`
  };
}

export function entriAntreanLkpp(payload: PratinjauLkpp): Omit<SinkronisasiLkpp, 'id'> {
  const body = payload.body as unknown as { kodeSKU: string; namaProduk: string; nomorPaket: string; qty: number; pemicu: SinkronisasiLkpp['pemicu'] };
  return {
    waktu: waktuLabel(new Date()),
    kodeSKU: body.kodeSKU,
    namaProduk: body.namaProduk,
    nomorPaketLkpp: body.nomorPaket,
    qtyDilaporkan: body.qty,
    pemicu: body.pemicu,
    status: 'Antre',
    percobaan: 0,
    pesanRespons: 'Menunggu siklus sinkronisasi berikutnya.'
  };
}

export function tandaiGagalLkpp(enth: SinkronisasiLkpp, pesanRespons: string): SinkronisasiLkpp {
  return { ...enth, status: 'Gagal', percobaan: enth.percobaan + 1, pesanRespons };
}

export function gerbangKonfirmasiStokSales(params: { daftarLkpp: SinkronisasiLkpp[]; kodeSKU: string; nomorPaketLkpp?: string }) {
  const terkait = params.daftarLkpp.filter(
    (l) => l.kodeSKU === params.kodeSKU && (!params.nomorPaketLkpp || l.nomorPaketLkpp === params.nomorPaketLkpp)
  );
  const gagal = terkait.filter((l) => l.status === 'Gagal');
  const ditolak = terkait.filter((l) => l.status === 'Ditolak');
  if (gagal.length)
    return {
      bolehKonfirmasi: false,
      sebab: `${gagal.length} kiriman LKPP gagal (percobaan terakhir ${Math.max(...gagal.map((g) => g.percobaan))}) — etalase e-Katalog belum mencerminkan stok, pesanan berisiko penalti pembatalan`
    };
  if (ditolak.length)
    return {
      bolehKonfirmasi: false,
      sebab: `LKPP menolak ${ditolak.length} payload (${ditolak[0].pesanRespons.split(' - ')[0]}) — perbaiki master data sebelum konfirmasi stok`
    };
  return {
    bolehKonfirmasi: true,
    sebab: terkait.length
      ? 'Seluruh kiriman LKPP terkait sudah terkirim atau masih antre tanpa kegagalan.'
      : 'Belum ada jejak sinkronisasi untuk SKU ini — kirim stok terkini sebelum pesanan e-Katalog dikonfirmasi.'
  };
}

const URL_EXT_SATUSEHAT = 'https://sso.kemkes.go.id/fhir/StructureDefinition';

export function bangunBundleFhir(params: {
  konfigurasi: KonfigurasiGudang;
  tipeSumberDaya: KirimanSatuSehat['tipeSumberDaya'];
  nomorRujukan: string;
  kodeFasyankes?: string;
  namaFasyankes?: string;
  nomorBets?: string;
  nomorSerial?: string;
  namaAlkes?: string;
  nomorIzinEdar?: string;
  jumlah?: number;
  satuan?: string;
  suhuRantaiDingin?: string;
  kodeSDAK?: string;
  waktu?: Date;
}): { endpoint: string; payloadJson: string; ringkas: string[]; statusSumberDaya: KirimanSatuSehat['status'] } {
  const waktu = params.waktu ?? new Date();
  const extension: unknown[] = [];
  if (params.nomorBets)
    extension.push({ url: `${URL_EXT_SATUSEHAT}/lot-number`, valueString: params.nomorBets });
  if (params.nomorSerial)
    extension.push({ url: `${URL_EXT_SATUSEHAT}/serial-number`, valueString: params.nomorSerial });
  if (params.suhuRantaiDingin && params.suhuRantaiDingin !== '-')
    extension.push({ url: `${URL_EXT_SATUSEHAT}/storage-temperature`, valueString: String(angkaSuhu(params.suhuRantaiDingin) ?? params.suhuRantaiDingin) });
  if (params.nomorIzinEdar)
    extension.push({ url: `${URL_EXT_SATUSEHAT}/nomor-izin-edar`, valueString: params.nomorIzinEdar });

  const fasyankes = params.kodeFasyankes
    ? { identifier: { system: 'https://sso.kemkes.go.id/fhir/NamingSystem/fasyankes', value: params.kodeFasyankes }, display: params.namaFasyankes ?? '' }
    : undefined;

  let resource: Record<string, unknown>;
  if (params.tipeSumberDaya === 'Device') {
    resource = {
      resourceType: 'Device',
      status: 'active',
      serialNumber: params.nomorSerial ?? '',
      distinctIdentifier: params.nomorBets ?? '',
      ...(params.namaAlkes ? { deviceName: [{ name: params.namaAlkes, type: 'label' }] } : {}),
      type: { coding: [{ system: 'https://sso.kemkes.go.id/fhir/NamingSystem/alkes', code: params.nomorIzinEdar ?? 'AKL-ALKES' }] },
      ...(fasyankes ? { location: { identifier: fasyankes.identifier } } : {})
    };
  } else if (params.tipeSumberDaya === 'Immunization') {
    resource = {
      resourceType: 'Immunization',
      status: 'completed',
      lotNumber: params.nomorBets ?? '',
      occurrenceDateTime: waktu.toISOString(),
      ...(fasyankes ? { location: { identifier: fasyankes.identifier } } : {})
    };
  } else if (params.tipeSumberDaya === 'Organization') {
    resource = {
      resourceType: 'Organization',
      name: params.namaFasyankes ?? params.namaAlkes ?? '',
      identifier: [{ system: 'https://sso.kemkes.go.id/fhir/NamingSystem/sdak', value: params.kodeSDAK ?? params.kodeFasyankes ?? '' }],
      active: true
    };
  } else {
    resource = {
      resourceType: 'SupplyDelivery',
      identifier: { system: 'https://ams-alkes.example/sj', value: params.nomorRujukan },
      status: 'completed',
      type: { coding: [{ code: '2', display: 'Alat Kesehatan' }] },
      ...(params.jumlah !== undefined ? { quantity: { value: params.jumlah, unit: params.satuan ?? 'Unit' } } : {}),
      ...(fasyankes ? { receiver: { identifier: fasyankes.identifier, display: fasyankes.display } } : {}),
      extension
    };
  }

  const bundle =
    params.tipeSumberDaya === 'Organization' || params.tipeSumberDaya === 'Device' || params.tipeSumberDaya === 'Immunization'
      ? resource
      : { resourceType: 'Bundle', type: 'transaction', timestamp: waktu.toISOString(), entry: [{ fullUrl: `urn:uuid:${params.nomorRujukan}`, resource }] };

  const ringkas = [`Sumber daya ${params.tipeSumberDaya} rujukan ${params.nomorRujukan}`];
  if (params.kodeFasyankes) ringkas.push(`Kode fasyankes ${params.kodeFasyankes}`);
  if (params.nomorBets) ringkas.push(`Bets ${params.nomorBets}`);
  if (params.nomorSerial) ringkas.push(`Serial ${params.nomorSerial}`);
  if (params.suhuRantaiDingin && params.suhuRantaiDingin !== '-') ringkas.push(`Suhu ${params.suhuRantaiDingin}`);

  return {
    endpoint: params.konfigurasi.endpointSatuSehat,
    payloadJson: JSON.stringify(bundle),
    ringkas,
    statusSumberDaya: 'Antre'
  };
}

export function validasiKirimanSatuSehat(params: {
  kiriman: KirimanSatuSehat;
  daftarKiriman: KirimanSatuSehat[];
  konfigurasi: KonfigurasiGudang;
}): { layakKirim: boolean; sebab: string[]; peringatan: string[]; statusUsulan: KirimanSatuSehat['status'] } {
  const { kiriman, konfigurasi } = params;
  const sebab: string[] = [];
  const peringatan: string[] = [];
  if (!kiriman.kodeFasyankes) sebab.push('Kode fasyankes kosong — master data SATUSEHAT belum dipetakan');
  if (kiriman.tipeSumberDaya !== 'Organization') {
    const profil = params.daftarKiriman.find((k) => k.tipeSumberDaya === 'Organization' && k.status === 'Diterima (201)');
    if (!profil) sebab.push('Sumber daya Organization penyalur belum diterima (201) — kirim profil ini lebih dulu');
  }
  const suhu = kiriman.suhuRantaiDingin && kiriman.suhuRantaiDingin !== '-' ? angkaSuhu(kiriman.suhuRantaiDingin) : null;
  if (suhu !== null && (suhu < konfigurasi.coldChainMinSuhu || suhu > konfigurasi.coldChainMaxSuhu))
    sebab.push(`Suhu lampiran ${suhu}°C di luar ${konfigurasi.coldChainMinSuhu}°C – ${konfigurasi.coldChainMaxSuhu}°C — kiriman akan ditolak OperationOutcome`);
  if (!konfigurasi.klienSatuSehatTerdaftar) peringatan.push('Klien SATUSEHAT belum terdaftar resmi — payload divalidasi pada tenant sandbox sebelum produksi');
  if (kiriman.status === 'Ditolak (OperationOutcome)')
    peringatan.push(`Pernah ditolak OperationOutcome — ${kiriman.catatan || 'perlu perbaikan master data sebelum kirim ulang'}`);
  return {
    layakKirim: sebab.length === 0,
    sebab,
    peringatan,
    statusUsulan: sebab.length === 0 ? 'Antre' : 'Belum Terkirim'
  };
}

// ==================== Tab 1 — skor kesiapan audit CDB ====================

export interface PemeriksaanKesiapanAudit {
  kode: string;
  tab: number;
  area: string;
  label: string;
  status: 'Lolos' | 'Perlu Tindakan' | 'Bahaya';
  keterangan: string;
  tindakan: string;
}

export function nilaiKesiapanAuditCdb(input: {
  daftarStok: StokGudang[];
  daftarPergerakan: JejakPergerakan[];
  daftarTerima: TerimaBarang[];
  daftarSuratJalan: SuratJalan[];
  daftarOpname: OpnameStok[];
  daftarLkpp: SinkronisasiLkpp[];
  daftarFhir: KirimanSatuSehat[];
  daftarAmbang?: AmbangStok[];
  daftarGudang?: GudangFisik[];
  daftarUnit?: UnitSerialAlkes[];
  daftarIzinEdar?: IzinEdarAlkes[];
  daftarRecall?: PenarikanProduk[];
  daftarCapa?: CAPARecord[];
  logSuhu?: LogSuhu[];
  konfigurasi: KonfigurasiGudang;
  dari?: Date;
}): {
  pemeriksaan: PemeriksaanKesiapanAudit[];
  skorPersen: number;
  predikat: 'Siap Audit' | 'Perlu Pembenahan' | 'Belum Siap';
  jumlahBahaya: number;
  jumlahPerluTindakan: number;
  keteranganRingkas: string;
} {
  const dari = input.dari ?? new Date();
  const pemeriksaan: PemeriksaanKesiapanAudit[] = [];
  const catat = (
    kode: string,
    tab: number,
    area: string,
    label: string,
    status: PemeriksaanKesiapanAudit['status'],
    keterangan: string,
    tindakan: string
  ) => pemeriksaan.push({ kode, tab, area, label, status, keterangan, tindakan });

  const rantai = verifikasiRantaiHash(input.daftarPergerakan);
  catat(
    'RANTAI-HASH',
    8,
    'Opname & Cycle Count',
    'Integritas log pergerakan (rantai sha256)',
    rantai.utuh ? 'Lolos' : 'Bahaya',
    rantai.keterangan,
    rantai.utuh ? 'Lampirkan bukti verifikasi saat audit' : `Rekonstruksi ${rantai.penyimpangan.length} baris rusak lalu tutup dengan penyesuaian beralasan`
  );

  const terkunciTanpaSebab = input.daftarStok.filter(
    (s) => statusTerkunci(statusUnitStok(s)) && !(s.alasanKunci ?? '').trim()
  );
  catat(
    'KUNCI-TANPA-SEBAB',
    11,
    'Karantina & Recall',
    'Setiap bets terkunci punya sebab & tanggal',
    terkunciTanpaSebab.length ? 'Perlu Tindakan' : 'Lolos',
    terkunciTanpaSebab.length
      ? `${terkunciTanpaSebab.length} bets terkunci tanpa alasan (mis. ${terkunciTanpaSebab[0].nomorBets})`
      : 'Seluruh bets terkunci Karantina/Rusak/ED memiliki alasan dan tanggal kunci',
    'Isi alasanKunci pada tab Stok & FEFO agar auditor dapat menelusuri dasar penahanan'
  );

  const perluAgeing = daftarStokPerluKunciAgeing({ daftarStok: input.daftarStok, konfigurasi: input.konfigurasi, dari });
  catat(
    'AGEING-ED',
    9,
    'Optimasi Stok',
    `Bets di bawah ambang kunci ED ${input.konfigurasi.umurKunciEdHari} hari`,
    perluAgeing.length ? 'Perlu Tindakan' : 'Lolos',
    perluAgeing.length
      ? `${perluAgeing.length} bets masih layak jual dengan sisa ED < ${input.konfigurasi.umurKunciEdHari} hari (mis. ${perluAgeing[0].stok.nomorBets}, ${perluAgeing[0].sisaHari} hari)`
      : 'Tidak ada bets layak jual yang mendekati ambang kunci ED',
    'Kunci EXPIRED_LOCK dan ajukan program cuci gudang/disclosure ke Sales'
  );

  const petaGudang = new Map((input.daftarGudang ?? []).map((g) => [g.id, g]));
  const karantinaFisikSalah = input.daftarStok.filter((s) => {
    if (statusUnitStok(s) !== 'QUARANTINE') return false;
    const gudang = petaGudang.get(s.gudangId ?? '');
    // Karantina di Cold Room tetap sah selama fisiknya terpisah; yang melanggar ialah bets tahan di rak jual gudang induk.
    return gudang ? gudang.tipe === 'Gudang Utama' : !['GDM-03', 'GDM-04'].includes(s.gudangId ?? '');
  });
  catat(
    'ISOLASI-FISIK',
    2,
    'Struktur Gudang & Bin',
    'Stok karantina disimpan terpisah dari rak jual',
    karantinaFisikSalah.length ? 'Bahaya' : 'Lolos',
    karantinaFisikSalah.length
      ? `${karantinaFisikSalah.length} baris karantina masih berada di gudang induk (bin ${karantinaFisikSalah[0].binId}) — pelanggaran isolasi fisik CDB`
      : 'Seluruh stok karantina berada di Gudang Karantina atau Gudang Retur',
    'Pindahkan fisik ke zona terkunci lalu catat pergerakan Pemindahan Rak'
  );

  const belumLolosQc = input.daftarTerima.filter((t) => t.hasilQCMasuk !== 'Lolos (Released)' && t.baris.some((b) => b.qtyDiterima > 0));
  const selisihTerima = input.daftarTerima.filter((t) => t.statusMatching === 'Selisih Jumlah' || t.statusMatching === 'Bets Tidak Sesuai PO');
  catat(
    'QC-MASUK',
    6,
    'Penerimaan',
    'Tidak ada barang masuk rak jual tanpa rilis QC',
    belumLolosQc.length ? 'Perlu Tindakan' : 'Lolos',
    `${belumLolosQc.length} dokumen penerimaan belum berstatus Lolos (Released)${selisihTerima.length ? `; ${selisihTerima.length} di antaranya masih selisih/bets menyimpang` : ''}`,
    'Selesaikan QC incoming dan penolakan sebelum pelepasan ke rak jual'
  );

  const ujiFungsiTertunda = input.daftarTerima.filter((t) => t.butuhUjiFungsi && t.hasilUjiFungsi === 'Belum Diuji');
  catat(
    'UJI-FUNGSI',
    6,
    'Penerimaan',
    'Alat berat lolos uji fungsi sebelum AVAILABLE',
    ujiFungsiTertunda.length ? 'Bahaya' : 'Lolos',
    ujiFungsiTertunda.length
      ? `${ujiFungsiTertunda.length} penerimaan butuh uji fungsi tetapi hasilnya belum dicatat (${ujiFungsiTertunda.map((t) => t.nomorTerima).join(', ')})`
      : 'Seluruh penerimaan alat berat memiliki hasil uji fungsi',
    'Jadwalkan teknisi elektromedik, catat nomor laporan QC, lalu rilis stok'
  );

  const ruteBeres = input.daftarSuratJalan.filter((s) => s.status !== 'Antre Picking' && s.rute.length === 0);
  const fakturBelum = input.daftarSuratJalan.filter((s) => ['Terkirim', 'Diterima Penerima'].includes(s.status) && s.statusEFaktur !== 'Terbit');
  catat(
    'OUTBOUND',
    7,
    'Pengiriman',
    'Surat jalan terbit dengan rute & e-Faktur lengkap',
    ruteBeres.length || fakturBelum.length ? 'Perlu Tindakan' : 'Lolos',
    `${ruteBeres.length} surat jalan sudah jalan tanpa rute; ${fakturBelum.length} sudah kirim tetapi e-Faktur belum terbit`,
    'Susun rute picking dan terbitkan nomor faktur sebelum bukti kirim disimpan'
  );

  const opnameMacet = input.daftarOpname.filter((o) => o.status === 'Selisih Diajukan' && !o.verifikasiPJT);
  const opnameBelum = input.daftarOpname.filter((o) => o.status === 'Berjalan' && o.baris.some((b) => b.qtyFisik === null));
  catat(
    'OPNAME',
    8,
    'Opname & Cycle Count',
    'Selisih di atas ambang diverifikasi PJT',
    opnameMacet.length ? 'Perlu Tindakan' : 'Lolos',
    opnameMacet.length
      ? `${opnameMacet.length} opname mengajukan penyesuaian tanpa verifikasi PJT (${opnameMacet.map((o) => o.nomorOpname).join(', ')}); ${opnameBelum.length} cycle count masih berjalan`
      : `Seluruh pengajuan selisih sudah diverifikasi; ${opnameBelum.length} cycle count berjalan normal`,
    'Minta tanda tangan PJT pada formulir selisih lalu jalankan penyesuaian sebagai mata rantai log'
  );

  const lkppGagal = input.daftarLkpp.filter((l) => l.status === 'Gagal' || l.status === 'Ditolak');
  const lkppAntre = input.daftarLkpp.filter((l) => l.status === 'Antre');
  catat(
    'LKPP',
    12,
    'Kemenkes RI',
    'Stok e-Katalog sinkron dengan kartu stok',
    lkppGagal.length ? 'Bahaya' : 'Lolos',
    lkppGagal.length
      ? `${lkppGagal.length} payload LKPP gagal/ditolak (mis. ${lkppGagal[0].pesanRespons.split(' - ')[0]} pada ${lkppGagal[0].nomorPaketLkpp}); ${lkppAntre.length} masih antre`
      : `${lkppAntre.length} payload antre, tidak ada kegagalan terbuka`,
    'Ulangi sinkronisasi dan tahan konfirmasi pesanan e-Katalog sampai status terkirim'
  );

  const fhirTolak = input.daftarFhir.filter((k) => k.status === 'Ditolak (OperationOutcome)');
  const fhirBelum = input.daftarFhir.filter((k) => k.status === 'Belum Terkirim' || k.status === 'Antre');
  catat(
    'SATUSEHAT',
    12,
    'Kemenkes RI',
    'Kiriman HL7 FHIR diterima Kemenkes',
    fhirTolak.length ? 'Perlu Tindakan' : 'Lolos',
    fhirTolak.length
      ? `${fhirTolak.length} kiriman ditolak OperationOutcome (${fhirTolak[0].catatan || fhirTolak[0].nomorRujukan}); ${fhirBelum.length} menunggu kirim`
      : `${fhirBelum.length} kiriman masih antre tanpa penolakan`,
    'Perbaiki master data fasyankes lalu kirim ulang dari tab Kemenkes RI'
  );

  const excursi = input.logSuhu?.length ? deteksiExcursiRantaiDingin(input.logSuhu, input.konfigurasi) : null;
  const capaSuhu = (input.daftarCapa ?? []).filter((c) => c.sumber === 'Ketidaksesuaian Suhu' && c.status !== 'Ditutup');
  const adaExcursiKritis = !!excursi?.episodeKritis.length;
  catat(
    'RANTAI-DINGIN',
    4,
    'Rantai Dingin',
    'Excursion suhu di luar rentang tertangani CAPA',
    adaExcursiKritis && !capaSuhu.length ? 'Bahaya' : adaExcursiKritis ? 'Perlu Tindakan' : 'Lolos',
    excursi
      ? adaExcursiKritis
        ? `${excursi.episodeKritis.length} excursion melewati ${input.konfigurasi.menitMaksimumDiLuarRentang} menit${capaSuhu.length ? ` — CAPA ${capaSuhu[0].nomorCAPA} masih berjalan` : ' — belum ada CAPA terbuka'}`
        : excursi.keterangan
      : 'Log suhu belum dibagikan ke penilaian kesiapan',
    'Kunci bets cold chain terdampak dan buka formulir CAPA Ketidaksesuaian Suhu'
  );

  const unitKalibrasiLewat = (input.daftarUnit ?? []).filter((u) => u.statusUnit !== 'Terjual' && !unitLayakKirim(u, dari).layakKirim);
  catat(
    'KALIBRASI-B',
    3,
    'Stok & FEFO Dual-Track',
    'Unit Trek B dalam gudang punya kalibrasi berlaku',
    unitKalibrasiLewat.length ? 'Perlu Tindakan' : 'Lolos',
    unitKalibrasiLewat.length
      ? `${unitKalibrasiLewat.length} unit Trek B lewat tenggat atau ditarik (${unitKalibrasiLewat.slice(0, 3).map((u) => u.nomorSerial).join(', ')})`
      : 'Tidak ada unit Trek B di gudang dengan kalibrasi kedaluwarsa',
    'Jadwalkan kalibrasi lewat menu Teknisi & Layanan Purna Jual sebelum unit boleh dikirim'
  );

  const izinMasalah = (input.daftarIzinEdar ?? []).filter((i) => selisihHariDari(i.tanggalKedaluwarsa, dari) <= 90 || i.status === 'Kedaluwarsa');
  const skuTerdaftar = new Set(input.daftarStok.map((s) => s.nomorIzinEdar));
  const izinDipakaiStok = izinMasalah.filter((i) => skuTerdaftar.has(i.nomorIzinEdar));
  catat(
    'IZIN-EDAR',
    1,
    'Dasbor & Kesiapan Audit',
    'Izin edar produk berstok masih berlaku',
    izinDipakaiStok.length ? 'Bahaya' : 'Lolos',
    izinDipakaiStok.length
      ? `${izinDipakaiStok.length} nomor izin edar yang masih dipakai stok akan kedaluwarsa/sudah kedaluwarsa (${izinDipakaiStok[0].nomorIzinEdar})`
      : 'Seluruh izin edar yang dipakai kartu stok berlaku lebih dari 90 hari ke depan',
    'Ajukan perpanjangan lewat RA/PJT dan tahan penjualan produk terdampak'
  );

  const recallTerbuka = (input.daftarRecall ?? []).filter((r) => r.status !== 'Ditutup');
  catat(
    'RECALL',
    11,
    'Karantina & Recall',
    'Recall berjalan tertelusur sampai fasyankes',
    recallTerbuka.length ? 'Perlu Tindakan' : 'Lolos',
    recallTerbuka.length
      ? `${recallTerbuka.length} recall belum ditutup (${recallTerbuka.map((r) => r.nomorRecall).join(', ')})`
      : 'Tidak ada recall terbuka',
    'Kunci bets, kirim notifikasi LKPP/FHIR, dan tutup recall setelah verifikasi PJT'
  );

  const label = input.logSuhu?.length ? 'Lampiran suhu tersedia' : 'Frekuensi log suhu sesuai konfigurasi';
  const frekuensi = (input.logSuhu ?? []).length >= input.konfigurasi.frekuensiLogSuhuPerHari;
  catat(
    'LOG-SUHU',
    4,
    'Rantai Dingin',
    label,
    frekuensi ? 'Lolos' : 'Perlu Tindakan',
    frekuensi ? `${(input.logSuhu ?? []).length} bacaan suhu tersedia, memenuhi ${input.konfigurasi.frekuensiLogSuhuPerHari}x per hari` : 'Jumlah bacaan suhu di bawah frekuensi wajib harian',
    'Rekam bacaan termohigrometer atau impor dari log sensor'
  );

  const jumlahBahaya = pemeriksaan.filter((p) => p.status === 'Bahaya').length;
  const jumlahPerluTindakan = pemeriksaan.filter((p) => p.status === 'Perlu Tindakan').length;
  const skorPersen = Math.round(
    ((pemeriksaan.length - jumlahBahaya - jumlahPerluTindakan * 0.5) / Math.max(pemeriksaan.length, 1)) * 100
  );
  const predikat: 'Siap Audit' | 'Perlu Pembenahan' | 'Belum Siap' = jumlahBahaya
    ? 'Belum Siap'
    : skorPersen >= 85
      ? 'Siap Audit'
      : 'Perlu Pembenahan';
  return {
    pemeriksaan,
    skorPersen,
    predikat,
    jumlahBahaya,
    jumlahPerluTindakan,
    keteranganRingkas: `${pemeriksaan.length - jumlahBahaya - jumlahPerluTindakan} dari ${pemeriksaan.length} poin bersih, ${jumlahPerluTindakan} perlu tindakan, ${jumlahBahaya} bahaya — predikat ${predikat}`
  };
}

// ==================== Tab 1 — KPI lintas tab ====================

export function ringkasanKpiGudang(input: {
  daftarStok: StokGudang[];
  daftarTerima: TerimaBarang[];
  daftarSuratJalan: SuratJalan[];
  konfigurasi: KonfigurasiGudang;
  dari?: Date;
}) {
  const dari = input.dari ?? new Date();
  const perStatus = new Map<StatusStokFisik, number>();
  let unitBebas = 0;
  let unitTerkunciPesanan = 0;
  input.daftarStok.forEach((s) => {
    const status = statusUnitStok(s);
    perStatus.set(status, (perStatus.get(status) ?? 0) + s.jumlahStok);
    unitBebas += stokBebas(s);
    unitTerkunciPesanan += s.qtyDipesan ?? 0;
  });
  const totalUnit = input.daftarStok.reduce((t, s) => t + s.jumlahStok, 0);
  const antreInbound = input.daftarTerima.filter((t) => t.hasilQCMasuk !== 'Lolos (Released)' || !t.labelDicetak).length;
  const antreOutbound = input.daftarSuratJalan.filter((s) => !['Terkirim', 'Diterima Penerima'].includes(s.status)).length;
  return {
    totalUnit,
    unitBebas,
    unitTerkunciPesanan,
    perStatus: Array.from(perStatus.entries()).map(([status, jumlah]) => ({ status, jumlah, persen: totalUnit ? Math.round((jumlah / totalUnit) * 100) : 0 })),
    persenUnitTidakBebas: totalUnit ? Math.round(((totalUnit - unitBebas) / totalUnit) * 100) : 0,
    antreInbound,
    antreOutbound,
    umurKunciEdHari: input.konfigurasi.umurKunciEdHari,
    keterangan: `${unitBebas} dari ${totalUnit} unit bebas dialokasikan; ${antreInbound} dokumen menunggu release dan ${antreOutbound} surat jalan menunggu keberangkatan`
  };
}
