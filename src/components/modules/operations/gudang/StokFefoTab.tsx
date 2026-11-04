import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import {
  GaransiInstalasi,
  LokasiBin,
  StatusStokFisik,
  StokGudang,
  UnitSerialAlkes,
  UserRole
} from '../../../../types';
import {
  alokasiFEFOSadarKunci,
  kodeBinDariLokasi,
  nilaiUmurStok,
  statusTerkunci,
  statusUnitStok,
  stokBebas,
  unitLayakKirim
} from '../../../../utils/gudang';
import { selisihHari, statusGaransi } from '../../../../utils/sales';
import {
  ArrowLeftRight,
  ArrowRight,
  Boxes,
  CalendarClock,
  CheckCircle2,
  CircleCheck,
  CircleX,
  History,
  Lock,
  Plus,
  QrCode,
  ScanLine,
  Search,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  Unlock,
  Wrench
} from 'lucide-react';
import {
  Badge,
  Modal,
  Panel,
  Stat,
  chipFilter,
  formatTanggal,
  identitasPeranGudang,
  inputClass,
  labelClass,
  tombolPrimerGudang,
  tombolSekunder,
  toneStatusStok,
  waktuMutasiMonoton,
  type Tone
} from './ui';

interface Props {
  currentRole: UserRole;
  dariAcuan: Date;
  onPerubahanData: () => void;
}

const STATUS_UNIT_SERIAL: UnitSerialAlkes['statusUnit'][] = [
  'Terjual',
  'Di Gudang',
  'Unit Demo',
  'Dalam Perbaikan',
  'Ditarik (Recall)'
];

const toneUnit = (status: UnitSerialAlkes['statusUnit']): Tone =>
  status === 'Terjual'
    ? 'emerald'
    : status === 'Ditarik (Recall)'
      ? 'rose'
      : status === 'Dalam Perbaikan'
        ? 'amber'
        : status === 'Unit Demo'
          ? 'blue'
          : 'slate';

const toneGaransi = (label: string): Tone =>
  label.startsWith('Garansi berakhir')
    ? 'rose'
    : label.startsWith('Garansi sisa')
      ? 'amber'
      : label.startsWith('Garansi aktif')
        ? 'emerald'
        : 'slate';

export default function StokFefoTab({ currentRole, dariAcuan, onPerubahanData }: Props) {
  const [subLayar, setSubLayar] = useState<'kartu' | 'ketelusuran'>('kartu');
  const [stokList, setStokList] = useState<StokGudang[]>(() => db.getStokGudang());
  const [binList, setBinList] = useState<LokasiBin[]>(() => db.getLokasiBin());
  const [unitList, setUnitList] = useState<UnitSerialAlkes[]>(() => db.getUnitSerial());
  const [garansiList, setGaransiList] = useState<GaransiInstalasi[]>(() => db.getGaransiInstalasi());
  const [pelangganList] = useState(() => db.getPelangganB2B());
  const konfigurasi = useMemo(() => db.getKonfigurasiGudang(), [stokList]);

  const [cariStok, setCariStok] = useState('');
  const [filterStatus, setFilterStatus] = useState<'Semua' | StatusStokFisik>('Semua');
  const [filterJalur, setFilterJalur] = useState<'Semua' | 'A' | 'B'>('Semua');
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'tolak'; teks: string } | null>(null);

  // Simulator FEFO Sadar-Kunci
  const daftarNamaProduk = useMemo(
    () => Array.from(new Set(stokList.map((s) => s.namaAlkes))),
    [stokList]
  );
  const [simProduk, setSimProduk] = useState(daftarNamaProduk[0] ?? '');
  const [simQty, setSimQty] = useState(10);

  // Modal Tambah Stok (kompatibel fungsi lama + bin/jejak pergerakan)
  const [modalTambah, setModalTambah] = useState(false);
  const [formTambah, setFormTambah] = useState({
    kodeSKU: 'ALKES-SYR-01',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorIzinEdar: 'KEMENKES RI AKD 20902410112',
    nomorBets: 'LOT-2024-BARU01',
    binId: binList[0]?.id ?? 'BIN-B02-01-01',
    jumlahStok: 5,
    satuan: 'Unit',
    jalur: 'A' as 'A' | 'B',
    nomorSerial: '',
    tanggalKedaluwarsa: '2027-12-31'
  });

  // Modal Pindah Rak
  const [targetPindah, setTargetPindah] = useState<StokGudang | null>(null);
  const [binTujuanPindah, setBinTujuanPindah] = useState('');
  const [qtyPindah, setQtyPindah] = useState(1);

  // Modal Kunci / Lepas Kunci
  const [targetKunci, setTargetKunci] = useState<{ stok: StokGudang; mode: 'kunci' | 'rilis' } | null>(null);
  const [alasanKunciInput, setAlasanKunciInput] = useState('');

  // Ketertelusuran Bets & Serial (dipindahkan penuh dari SalesModule sesuai §0B)
  const [kunciBets, setKunciBets] = useState('');
  const [filterStatusUnit, setFilterStatusUnit] = useState<UnitSerialAlkes['statusUnit'] | 'Semua'>('Semua');
  const [detailUnit, setDetailUnit] = useState<UnitSerialAlkes | null>(null);
  const [tabDetailUnit, setTabDetailUnit] = useState<'unit' | 'rantai' | 'garansi'>('unit');

  const identitas = identitasPeranGudang(currentRole);

  const segarkan = () => {
    setStokList(db.getStokGudang());
    setBinList(db.getLokasiBin());
    setUnitList(db.getUnitSerial());
    setGaransiList(db.getGaransiInstalasi());
    onPerubahanData();
  };

  const stokTampil = useMemo(() => {
    const q = cariStok.trim().toLowerCase();
    return stokList.filter((item) => {
      const st = statusUnitStok(item);
      const cocokStatus = filterStatus === 'Semua' || st === filterStatus;
      const jalurItem = item.jalur ?? 'A';
      const cocokJalur = filterJalur === 'Semua' || jalurItem === filterJalur;
      const cocokCari =
        !q ||
        item.namaAlkes.toLowerCase().includes(q) ||
        item.kodeSKU.toLowerCase().includes(q) ||
        item.nomorBets.toLowerCase().includes(q) ||
        item.lokasiPenyimpanan.toLowerCase().includes(q) ||
        (item.nomorSerial ?? '').toLowerCase().includes(q);
      return cocokStatus && cocokJalur && cocokCari;
    });
  }, [stokList, cariStok, filterStatus, filterJalur]);

  const simulasiFefo = useMemo(
    () =>
      alokasiFEFOSadarKunci({
        daftarStok: stokList,
        jumlahDiminta: simQty,
        namaAlkes: simProduk,
        daftarUnit: unitList,
        dari: dariAcuan
      }),
    [stokList, simQty, simProduk, unitList, dariAcuan]
  );

  // Simpan Stok Baru + Sinkronisasi Bin & Pergerakan
  const simpanStokBaru = (e: React.FormEvent) => {
    e.preventDefault();
    const bin = binList.find((b) => b.id === formTambah.binId);
    if (!bin) return;
    const sisaKapasitas = bin.kapasitas - bin.terpakai;
    if (formTambah.jumlahStok > sisaKapasitas) {
      setPesan({
        tipe: 'tolak',
        teks: `Penjaga Kapasitas Bin menolak penambahan: ${kodeBinDariLokasi(bin)} hanya tersisa ${sisaKapasitas} ${bin.satuan} dari kapasitas ${bin.kapasitas}.`
      });
      return;
    }

    const waktu = waktuMutasiMonoton(dariAcuan, db.getJejakPergerakan());
    const tanggalMasuk = waktu.toISOString().split('T')[0];
    const umur = nilaiUmurStok({ tanggalKedaluwarsa: formTambah.tanggalKedaluwarsa }, konfigurasi, dariAcuan);
    const nomorMax = stokList.reduce((m, s) => Math.max(m, Number(s.id.replace(/\D/g, '')) || 0), 0);

    const baru: StokGudang = {
      id: `STK-${String(nomorMax + 1).padStart(3, '0')}`,
      kodeSKU: formTambah.kodeSKU.trim(),
      namaAlkes: formTambah.namaAlkes.trim(),
      nomorIzinEdar: formTambah.nomorIzinEdar.trim(),
      nomorBets: formTambah.nomorBets.trim().toUpperCase(),
      lokasiPenyimpanan: kodeBinDariLokasi(bin),
      zonaSuhu: bin.zonaSuhu,
      jumlahStok: Number(formTambah.jumlahStok),
      satuan: bin.satuan,
      tanggalMasuk,
      tanggalKedaluwarsa: formTambah.tanggalKedaluwarsa,
      statusFEFO: umur.label,
      gudangId: bin.gudangId,
      binId: bin.id,
      statusStok: 'AVAILABLE',
      qtyDipesan: 0,
      jalur: formTambah.jalur,
      ...(formTambah.jalur === 'B' && formTambah.nomorSerial.trim() ? { nomorSerial: formTambah.nomorSerial.trim().toUpperCase() } : {}),
      rfidTagId: bin.rfidTagId
    };

    db.addStokGudang(baru);
    db.ubahLokasiBin(bin.id, { terpakai: bin.terpakai + baru.jumlahStok });
    const tglStr = `${waktu.getFullYear()}-${String(waktu.getMonth() + 1).padStart(2, '0')}-${String(waktu.getDate()).padStart(2, '0')} ${String(waktu.getHours()).padStart(2, '0')}:${String(waktu.getMinutes()).padStart(2, '0')}`;
    db.catatPergerakan({
      waktu: tglStr,
      kodeSKU: baru.kodeSKU,
      namaAlkes: baru.namaAlkes,
      nomorBets: baru.nomorBets,
      dariBin: 'DOCK-01',
      keBin: bin.id,
      jumlah: baru.jumlahStok,
      satuan: baru.satuan,
      tipe: 'Penerimaan',
      pengguna: identitas.pengguna,
      peran: identitas.peran,
      dokumenRujukan: `ENTRI/${waktu.getFullYear()}/${baru.nomorBets}`,
      alasan: `Entri langsung kartu stok tervalidasi ke rak ${kodeBinDariLokasi(bin)}.`
    });
    setModalTambah(false);
    setPesan({ tipe: 'sukses', teks: `Bets ${baru.nomorBets} (${baru.jumlahStok} ${baru.satuan}) masuk ke ${kodeBinDariLokasi(bin)} beserta mata rantai sha256.` });
    segarkan();
  };

  const eksekusiPindahBin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPindah || !binTujuanPindah) return;
    const binTujuan = binList.find((b) => b.id === binTujuanPindah);
    if (!binTujuan) return;

    if (binTujuan.zonaSuhu !== targetPindah.zonaSuhu) {
      setPesan({
        tipe: 'tolak',
        teks: `Penjaga Zona Suhu menolak pemindahan: bets ${targetPindah.nomorBets} membutuhkan ${targetPindah.zonaSuhu}, sedangkan ${kodeBinDariLokasi(binTujuan)} berzona ${binTujuan.zonaSuhu}.`
      });
      return;
    }

    const waktu = waktuMutasiMonoton(dariAcuan, db.getJejakPergerakan());
    const hasil = db.pindahkanStokAntarBin(
      targetPindah.id,
      binTujuanPindah,
      qtyPindah,
      { pengguna: identitas.pengguna, peran: identitas.peran },
      waktu
    );
    setTargetPindah(null);
    setPesan({ tipe: hasil.boleh ? 'sukses' : 'tolak', teks: hasil.keterangan });
    segarkan();
  };

  const eksekusiKunciAtauRilis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetKunci) return;
    if (!alasanKunciInput.trim()) {
      setPesan({ tipe: 'tolak', teks: 'Alasan penguncian atau rilis mutu wajib diisi untuk bukti audit CDAKB.' });
      return;
    }
    if (targetKunci.mode === 'rilis' && !identitas.bolehVerifikasiPjt) {
      setPesan({
        tipe: 'tolak',
        teks: 'Penjaga Rilis Mutu: hanya peran PJT atau Manajer QA yang berwenang melepas kunci karantina ke AVAILABLE.'
      });
      return;
    }
    if (targetKunci.mode === 'kunci') {
      db.kunciStokKarantina(targetKunci.stok.id, alasanKunciInput.trim());
      setPesan({ tipe: 'sukses', teks: `Bets ${targetKunci.stok.nomorBets} dikunci QUARANTINE dan otomatis dilewati alokasi FEFO.` });
    } else {
      db.lepasKunciStok(targetKunci.stok.id, alasanKunciInput.trim());
      setPesan({ tipe: 'sukses', teks: `Rilis mutu disetujui: bets ${targetKunci.stok.nomorBets} kembali AVAILABLE.` });
    }
    setTargetKunci(null);
    setAlasanKunciInput('');
    segarkan();
  };

  // --- Logika Ketertelusuran Bets & Serial ---
  const namaPelanggan = (id: string) => pelangganList.find((p) => p.id === id)?.namaInstalasi ?? id;

  const unitTampil = useMemo(() => {
    const kunci = kunciBets.trim().toLowerCase();
    return unitList.filter((u) => {
      const cocokStatus = filterStatusUnit === 'Semua' || u.statusUnit === filterStatusUnit;
      const cocokKunci =
        !kunci ||
        [u.nomorSerial, u.nomorBets, u.namaAlkes, u.nomorSalesOrder, u.nomorInvoice].some((nilai) =>
          nilai.toLowerCase().includes(kunci)
        );
      return cocokStatus && cocokKunci;
    });
  }, [unitList, kunciBets, filterStatusUnit]);

  const betsDikenal = useMemo(() => {
    const bersih = kunciBets.trim().toUpperCase();
    if (!bersih) return false;
    const diGudang = stokList.some((s) => s.nomorBets.toUpperCase().includes(bersih));
    const diPenjualan = db.getPenjualan().some((p) => p.nomorBets.toUpperCase().includes(bersih));
    return diGudang || diPenjualan || unitList.some((u) => u.nomorBets.toUpperCase().includes(bersih));
  }, [kunciBets, stokList, unitList]);

  const betsTerpilih = useMemo(() => {
    if (!betsDikenal) return null;
    return db.cariKetelusuran(kunciBets.trim().toUpperCase());
  }, [kunciBets, betsDikenal]);

  const betsList = useMemo(
    () => Array.from(new Set([...stokList.map((s) => s.nomorBets), ...unitList.map((u) => u.nomorBets)])).sort(),
    [stokList, unitList]
  );

  const garansiPerSerial = (nomorSerial: string) => garansiList.filter((g) => g.nomorSerial === nomorSerial);
  const unitPerBets = (nomorBets: string) => {
    const bersih = nomorBets.trim().toUpperCase();
    return unitList.filter((u) => u.nomorBets.toUpperCase().includes(bersih) || bersih.includes(u.nomorBets.toUpperCase()));
  };

  const jadwalkanPM = (g: GaransiInstalasi) => {
    const basis = new Date(dariAcuan.getTime());
    basis.setDate(basis.getDate() + 90);
    const tanggalBaru = basis.toISOString().split('T')[0];
    const diperbarui: GaransiInstalasi = { ...g, jadwalPemeliharaanBerikutnya: tanggalBaru };
    db.saveGaransiInstalasi(garansiList.map((x) => (x.id === g.id ? diperbarui : x)));
    db.logAudit(
      'Gudang & Logistik — Stok & FEFO Dual-Track',
      'Penjadwalan ulang pemeliharaan preventif unit serial Trek B',
      g.nomorSerial,
      identitas.pengguna,
      identitas.peran,
      [{ kolom: 'jadwalPemeliharaanBerikutnya', nilaiLama: g.jadwalPemeliharaanBerikutnya, nilaiBaru: tanggalBaru }]
    );
    setPesan({ tipe: 'sukses', teks: `Jadwal PM unit ${g.nomorSerial} diperbarui ke ${tanggalBaru}.` });
    segarkan();
  };

  const unitTrekBTerhambat = unitList.filter((u) => u.statusUnit !== 'Terjual' && !unitLayakKirim(u, dariAcuan).layakKirim);

  return (
    <div className="space-y-5">
      {pesan && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs flex items-start justify-between gap-3 ${
            pesan.tipe === 'tolak'
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          <div className="flex items-start gap-2">
            {pesan.tipe === 'tolak' ? (
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            )}
            <span>{pesan.teks}</span>
          </div>
          <button type="button" onClick={() => setPesan(null)} className="text-2xs font-bold hover:underline cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {/* Pemilih Sub-Layar: Kartu Stok FEFO vs Ketertelusuran Bets & Serial */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSubLayar('kartu')}
            className={chipFilter(subLayar === 'kartu')}
          >
            Kartu Stok Dual-Track & Simulator FEFO ({stokList.length})
          </button>
          <button
            type="button"
            onClick={() => setSubLayar('ketelusuran')}
            className={chipFilter(subLayar === 'ketelusuran')}
          >
            Ketertelusuran Bets, Serial & Basis Garansi ({unitList.length} SN)
          </button>
        </div>
        {subLayar === 'kartu' && (
          <button type="button" onClick={() => setModalTambah(true)} className={tombolPrimerGudang}>
            <Plus className="w-4 h-4" />
            Tambah Stok Alkes
          </button>
        )}
      </div>

      {subLayar === 'kartu' ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              label="Total Baris Bets Gudang"
              value={stokList.length}
              hint={`Jalur A: ${stokList.filter((s) => (s.jalur ?? 'A') === 'A').length} · Jalur B: ${stokList.filter((s) => s.jalur === 'B').length}`}
              tone="amber"
            />
            <Stat
              label="Unit Bebas Alokasi (qty_available)"
              value={stokList.reduce((t, s) => t + stokBebas(s), 0).toLocaleString('id-ID')}
              hint="Stok fisik dikurangi kuota dipesan & bets terkunci"
              tone="emerald"
            />
            <Stat
              label="Bets Terkunci (Quarantine/Lock)"
              value={stokList.filter((s) => statusTerkunci(statusUnitStok(s))).length}
              hint="Otomatis ditolak oleh picking & pengeluaran FEFO"
              tone="rose"
            />
            <Stat
              label="Unit Trek B Lewat Kalibrasi / Recall"
              value={unitTrekBTerhambat.length}
              hint="Alat elektromedik tidak boleh keluar sebelum kalibrasi aktif"
              tone={unitTrekBTerhambat.length > 0 ? 'amber' : 'emerald'}
            />
          </div>

          {/* Tabel Kartu Stok */}
          <Panel
            judul="Kartu Stok Gudang Dual-Track (Jalur A Habis Pakai · Jalur B Alat Berat)"
            keterangan="Prinsip FEFO sadar-kunci: pengeluaran memprioritaskan tanggal kedaluwarsa terdekat dan secara otomatis menolak bets berstatus QUARANTINE, DAMAGED, atau EXPIRED_LOCK."
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cariStok}
                  onChange={(e) => setCariStok(e.target.value)}
                  placeholder="Cari alkes, SKU, bets, serial, atau rak..."
                  className={`${inputClass} pl-9`}
                />
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {(['Semua', 'A', 'B'] as const).map((j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => setFilterJalur(j)}
                    className={chipFilter(filterJalur === j)}
                  >
                    {j === 'Semua' ? 'Semua Jalur' : `Jalur ${j}`}
                  </button>
                ))}
                {(['Semua', 'AVAILABLE', 'QUARANTINE', 'DAMAGED', 'EXPIRED_LOCK'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={chipFilter(filterStatus === st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4">Nama Alkes & Trek</th>
                    <th className="py-3 px-4">Bets / Serial & Izin Edar</th>
                    <th className="py-3 px-4">Bin & Zona Suhu</th>
                    <th className="py-3 px-4 text-right">Fisik / Dipesan / Bebas</th>
                    <th className="py-3 px-4">Kedaluwarsa (ED)</th>
                    <th className="py-3 px-4">Status Stok & FEFO</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stokTampil.map((item) => {
                    const st = statusUnitStok(item);
                    const bebas = stokBebas(item);
                    const umur = nilaiUmurStok(item, konfigurasi, dariAcuan);
                    const terkunci = statusTerkunci(st);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{item.namaAlkes}</div>
                          <div className="text-2xs text-slate-500 font-mono">
                            {item.kodeSKU} · Jalur {item.jalur ?? 'A'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-amber-900">{item.nomorBets}</div>
                          {item.nomorSerial && (
                            <div className="text-2xs font-mono font-semibold text-blue-800">SN: {item.nomorSerial}</div>
                          )}
                          <div className="text-2xs text-slate-500 font-mono">{item.nomorIzinEdar}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{item.lokasiPenyimpanan}</div>
                          <div className="text-2xs text-slate-500">{item.binId ?? '-'} · {item.zonaSuhu}</div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums">
                          <div className="font-bold text-slate-900">
                            {item.jumlahStok} / {item.qtyDipesan ?? 0} / <span className="text-emerald-700">{bebas}</span> {item.satuan}
                          </div>
                          <div className="text-2xs text-slate-500">fisik · dipesan · bebas</div>
                        </td>
                        <td className="py-3 px-4 font-mono tabular-nums">
                          <div className="font-semibold text-slate-800">{item.tanggalKedaluwarsa}</div>
                          <div className="text-2xs text-slate-500">
                            {umur.sisaHari < 0 ? `lewat ${Math.abs(umur.sisaHari)} hari` : `sisa ${umur.sisaHari} hari`}
                          </div>
                        </td>
                        <td className="py-3 px-4 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge tone={toneStatusStok(st)}>{st}</Badge>
                            <Badge
                              tone={
                                umur.label === 'Kedaluwarsa' || umur.label.includes('Kritis')
                                  ? 'rose'
                                  : umur.label.includes('Perhatian')
                                    ? 'amber'
                                    : 'emerald'
                              }
                            >
                              {umur.label}
                            </Badge>
                          </div>
                          {item.alasanKunci && (
                            <div className="text-2xs text-rose-700 max-w-xs leading-snug">{item.alasanKunci}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setTargetPindah(item);
                                const kandidatBin = binList.find((b) => b.zonaSuhu === item.zonaSuhu && b.id !== item.binId);
                                setBinTujuanPindah(kandidatBin?.id ?? binList[0]?.id ?? '');
                                setQtyPindah(Math.min(1, item.jumlahStok));
                              }}
                              className={tombolSekunder}
                              title="Pindah Rak Antar Bin"
                            >
                              <span className="inline-flex items-center gap-1">
                                <ArrowLeftRight className="w-3 h-3" />
                                Pindah
                              </span>
                            </button>
                            {terkunci ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetKunci({ stok: item, mode: 'rilis' });
                                  setAlasanKunciInput('');
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Unlock className="w-3 h-3" />
                                Rilis QA
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetKunci({ stok: item, mode: 'kunci' });
                                  setAlasanKunciInput('');
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Lock className="w-3 h-3" />
                                Kunci
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {stokTampil.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 px-4 text-center text-slate-500">
                        Tidak ada baris stok yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Simulator FEFO Sadar-Kunci */}
          <Panel
            judul="Simulator Alokasi FEFO Sadar-Kunci (Bukti Penolakan Bets Karantina)"
            keterangan="Uji alokasi pengeluaran produk: sistem memilih ED paling awal yang berstatus AVAILABLE dan memperlihatkan daftar bets yang sengaja dilewati (mis. LOT-2024-SP08 berstatus karantina walaupun ED paling dekat)."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Pilih Produk Alkes</label>
                <select
                  value={simProduk}
                  onChange={(e) => setSimProduk(e.target.value)}
                  className={inputClass}
                >
                  {daftarNamaProduk.map((nama) => (
                    <option key={nama} value={nama}>{nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Jumlah Diminta</label>
                <input
                  type="number"
                  min={1}
                  value={simQty}
                  onChange={(e) => setSimQty(Math.max(1, Number(e.target.value)))}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs space-y-2">
                <div className="font-bold text-emerald-950 flex items-center justify-between">
                  <span>Bets Terpilih FEFO ({simulasiFefo.totalDiambil} / {simQty} unit)</span>
                  <Badge tone={simulasiFefo.sisaKekurangan === 0 ? 'emerald' : 'amber'}>
                    {simulasiFefo.sisaKekurangan === 0 ? 'Terpenuhi Penuh' : `Kurang ${simulasiFefo.sisaKekurangan}`}
                  </Badge>
                </div>
                <p className="text-emerald-900">{simulasiFefo.keterangan}</p>
                {simulasiFefo.usulan.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {simulasiFefo.usulan.map((u) => (
                      <li key={u.stokId} className="font-mono text-2xs text-emerald-950 flex items-center justify-between bg-white/80 px-3 py-1.5 rounded-lg border border-emerald-200">
                        <span>{u.nomorBets} · Bin {u.binId || '-'} · ED {u.tanggalKedaluwarsa}</span>
                        <span className="font-bold tabular-nums">Ambil {u.diambil} (sisa {u.sisaSetelahAmbil})</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs space-y-2">
                <div className="font-bold text-amber-950">
                  Bets Dilewati Penjaga ({simulasiFefo.dilewati.length} baris)
                </div>
                {simulasiFefo.dilewati.length === 0 ? (
                  <p className="text-amber-900">Tidak ada bets terkunci, kedaluwarsa, atau lewat kalibrasi pada produk ini.</p>
                ) : (
                  <ul className="space-y-1">
                    {simulasiFefo.dilewati.map((d, idx) => (
                      <li key={`${d.nomorBets}-${idx}`} className="text-2xs text-amber-950 bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center justify-between gap-2">
                        <span className="font-mono font-bold">{d.nomorBets} ({d.jumlah})</span>
                        <span className="text-right text-rose-800 font-medium">{d.sebab}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Panel>
        </>
      ) : (
        /* Sub-Layar Ketertelusuran Bets, Serial & Basis Garansi (§0B Migrasi dari Sales) */
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat
              label="Unit Terdaftar per Serial"
              value={unitList.length}
              hint={`Dari ${betsList.length} nomor bets aktif dalam gudang & distribusi`}
              tone="blue"
            />
            <Stat
              label="Unit Dalam Recall"
              value={unitList.filter((u) => u.statusUnit === 'Ditarik (Recall)').length}
              hint="Ditarik mengikuti edaran Recall Tab 11"
              tone={unitList.some((u) => u.statusUnit === 'Ditarik (Recall)') ? 'rose' : 'emerald'}
            />
            <Stat
              label="Garansi Berakhir / Habis"
              value={garansiList.filter((g) => !statusGaransi(g, dariAcuan).aktif).length}
              hint={`Dari ${garansiList.length} unit elektromedik terpasang`}
              tone="amber"
            />
            <Stat
              label="Jadwal PM ≤ 30 Hari"
              value={garansiList.filter((g) => selisihHari(g.jadwalPemeliharaanBerikutnya, dariAcuan) <= 30).length}
              hint="Pemeliharaan preventif unit serial Trek B"
              tone="slate"
            />
          </div>

          <Panel
            judul="Rantai Ketertelusuran Bets / Lot & Nomor Serial (Trek A & Trek B)"
            keterangan="Kepemilikan ketertelusuran produk terpusat di Gudang & Logistik: pindai nomor bets atau serial untuk menelusuri hulu (QC, suhu gudang, izin edar) hingga hilir (surat jalan, fasyankes, dan kelayakan kalibrasi)."
          >
            <div className="flex flex-col md:flex-row gap-2 mb-4">
              <div className="relative flex-1">
                <ScanLine className="w-4 h-4 text-amber-600 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={kunciBets}
                  onChange={(e) => setKunciBets(e.target.value)}
                  placeholder="Pindai/ketik nomor bets (LOT-...) atau nomor serial (SN-...)"
                  className={`${inputClass} pl-9 font-mono uppercase`}
                />
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {(['Semua', ...STATUS_UNIT_SERIAL] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilterStatusUnit(s)}
                    className={chipFilter(filterStatusUnit === s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {betsList.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setKunciBets(b)}
                  className={`px-2 py-1 rounded text-2xs font-mono border cursor-pointer transition-colors ${
                    kunciBets.trim().toUpperCase() === b
                      ? 'bg-slate-700 text-white border-slate-700'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {kunciBets.trim() && !betsDikenal && (
              <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900 flex items-start gap-2">
                <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Nomor <span className="font-mono font-bold">{kunciBets.trim().toUpperCase()}</span> tidak ditemukan pada kartu stok gudang, unit serial, maupun pesanan penjualan. Sistem menolak menampilkan data fiktif demi integritas bukti audit.
                </span>
              </div>
            )}

            {betsTerpilih && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <QrCode className="w-4 h-4 text-amber-800" />
                  <h4 className="text-xs font-bold text-amber-950">Rantai Ketertelusuran Bets {betsTerpilih.nomorBets}</h4>
                  <Badge tone={betsTerpilih.statusRecall.startsWith('Aman') ? 'emerald' : 'rose'}>
                    {betsTerpilih.statusRecall}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {[
                    ['Produk', betsTerpilih.namaAlkes],
                    ['Nomor Izin Edar', betsTerpilih.nomorIzinEdar],
                    ['Produsen', betsTerpilih.produsen],
                    ['Masuk Gudang', formatTanggal(betsTerpilih.tanggalPenerimaan)],
                    ['Hasil Inspeksi QC', betsTerpilih.hasilInspeksiQC],
                    ['Lokasi Penyimpanan', betsTerpilih.lokasiGudang],
                    ['Zona Suhu', betsTerpilih.logSuhuStatus],
                    ['Unit Serial Terkait', `${unitPerBets(betsTerpilih.nomorBets).length} unit`]
                  ].map(([label, nilai]) => (
                    <div key={label}>
                      <div className="text-2xs font-semibold text-amber-800">{label}</div>
                      <div className="text-slate-900 font-semibold mt-0.5">{nilai}</div>
                    </div>
                  ))}
                </div>
                {betsTerpilih.fasyankesPenerima.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-amber-200/70">
                    <div className="text-2xs font-bold text-amber-950 mb-1">Fasyankes Penerima Bets Ini:</div>
                    <ul className="space-y-0.5">
                      {betsTerpilih.fasyankesPenerima.map((f) => (
                        <li key={f.nomorSuratJalan} className="text-xs text-amber-950 flex items-center gap-2">
                          <ArrowRight className="w-3 h-3" />
                          <span>{f.nama} · Surat Jalan {f.nomorSuratJalan} · {formatTanggal(f.tanggalKirim)} · {f.jumlah} unit</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4">Nomor Serial</th>
                    <th className="py-3 px-4">Bets Asal</th>
                    <th className="py-3 px-4">Produk & Siklus Hidup</th>
                    <th className="py-3 px-4">Kalibrasi Trek B</th>
                    <th className="py-3 px-4">Fasyankes / Pemegang</th>
                    <th className="py-3 px-4">Status Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unitTampil.map((u) => {
                    const kelayakan = unitLayakKirim(u, dariAcuan);
                    return (
                      <tr
                        key={u.id}
                        onClick={() => {
                          setDetailUnit(u);
                          setTabDetailUnit('unit');
                        }}
                        className="hover:bg-slate-50 cursor-pointer"
                      >
                        <td className="py-3 px-4 font-mono font-bold text-amber-900">{u.nomorSerial}</td>
                        <td className="py-3 px-4 font-mono text-slate-600">{u.nomorBets}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{u.namaAlkes}</div>
                          <div className="text-2xs text-slate-500">{u.tahapSiklusHidup ?? u.statusUnit}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge tone={kelayakan.layakKirim ? 'emerald' : 'rose'}>
                            {kelayakan.lewatKalibrasi ? 'Lewat Kalibrasi' : kelayakan.layakKirim ? 'Kalibrasi Berlaku' : 'Tertahan'}
                          </Badge>
                          {u.kalibrasiBerikutnya && (
                            <div className="text-2xs font-mono text-slate-500 mt-0.5">{u.kalibrasiBerikutnya}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-800">{namaPelanggan(u.pelangganId)}</div>
                          <div className="text-2xs font-mono text-slate-500">{u.nomorSalesOrder}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge tone={toneUnit(u.statusUnit)}>{u.statusUnit}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            judul="Basis Garansi & Pemeliharaan Preventif Unit Terpasang"
            keterangan="Masa garansi diturunkan dari tanggal instalasi per nomor serial; penjadwalan ulang PM tercatat langsung di jejak audit Gudang & Logistik."
          >
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4">Nomor Serial</th>
                    <th className="py-3 px-4">Produk & Fasyankes</th>
                    <th className="py-3 px-4">Instalasi & Teknisi</th>
                    <th className="py-3 px-4">Jadwal PM Berikutnya</th>
                    <th className="py-3 px-4">Status Garansi</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {garansiList.map((g) => {
                    const st = statusGaransi(g, dariAcuan);
                    const sisaPM = selisihHari(g.jadwalPemeliharaanBerikutnya, dariAcuan);
                    return (
                      <tr key={g.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-amber-900">{g.nomorSerial}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{g.namaAlkes}</div>
                          <div className="text-2xs text-slate-500">{namaPelanggan(g.pelangganId)}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-2xs text-slate-700">{g.tanggalInstalasi} ({g.masaGaransiBulan} bln)</div>
                          <div className="text-2xs text-slate-500">{g.teknisi}</div>
                        </td>
                        <td className="py-3 px-4 tabular-nums">
                          <div className="font-mono text-slate-800">{formatTanggal(g.jadwalPemeliharaanBerikutnya)}</div>
                          <div className={`text-2xs font-semibold ${sisaPM < 0 ? 'text-rose-700' : sisaPM <= 30 ? 'text-amber-700' : 'text-slate-500'}`}>
                            {sisaPM < 0 ? `terlambat ${Math.abs(sisaPM)} hari` : `sisa ${sisaPM} hari`}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge tone={toneGaransi(st.label)}>
                            {st.aktif ? <CircleCheck className="w-3 h-3" /> : <CircleX className="w-3 h-3" />}
                            {st.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button type="button" onClick={() => jadwalkanPM(g)} className={tombolSekunder}>
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="w-3.5 h-3.5" />
                              PM +90 Hari
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* Modal Tambah Stok */}
      {modalTambah && (
        <Modal
          judul="Tambah Kartu Stok Alkes ke Bin Gudang"
          keterangan="Wajib mencantumkan nomor bets, tanggal kedaluwarsa, dan lokasi bin tujuan untuk integritas rantai pergerakan CDAKB."
          onClose={() => setModalTambah(false)}
        >
          <form onSubmit={simpanStokBaru} className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Nama Alat Kesehatan</label>
                <input
                  type="text"
                  required
                  value={formTambah.namaAlkes}
                  onChange={(e) => setFormTambah({ ...formTambah, namaAlkes: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Jalur Inventaris</label>
                <select
                  value={formTambah.jalur}
                  onChange={(e) => setFormTambah({ ...formTambah, jalur: e.target.value as 'A' | 'B' })}
                  className={inputClass}
                >
                  <option value="A">Jalur A (Bets & FEFO)</option>
                  <option value="B">Jalur B (Alat Berat Serial)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Kode SKU</label>
                <input
                  type="text"
                  required
                  value={formTambah.kodeSKU}
                  onChange={(e) => setFormTambah({ ...formTambah, kodeSKU: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Nomor Bets / Lot</label>
                <input
                  type="text"
                  required
                  value={formTambah.nomorBets}
                  onChange={(e) => setFormTambah({ ...formTambah, nomorBets: e.target.value })}
                  className={`${inputClass} font-mono uppercase`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Nomor Izin Edar Kemenkes</label>
                <input
                  type="text"
                  required
                  value={formTambah.nomorIzinEdar}
                  onChange={(e) => setFormTambah({ ...formTambah, nomorIzinEdar: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Lokasi Bin Tujuan</label>
                <select
                  value={formTambah.binId}
                  onChange={(e) => setFormTambah({ ...formTambah, binId: e.target.value })}
                  className={inputClass}
                >
                  {binList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {kodeBinDariLokasi(b)} ({b.zonaSuhu} · sisa {b.kapasitas - b.terpakai} {b.satuan})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Jumlah Masuk</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formTambah.jumlahStok}
                  onChange={(e) => setFormTambah({ ...formTambah, jumlahStok: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass}>Tanggal Kedaluwarsa (ED)</label>
                <input
                  type="date"
                  required
                  value={formTambah.tanggalKedaluwarsa}
                  onChange={(e) => setFormTambah({ ...formTambah, tanggalKedaluwarsa: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            {formTambah.jalur === 'B' && (
              <div>
                <label className={labelClass}>Nomor Serial Unit (Khusus Jalur B)</label>
                <input
                  type="text"
                  value={formTambah.nomorSerial}
                  onChange={(e) => setFormTambah({ ...formTambah, nomorSerial: e.target.value })}
                  placeholder="Contoh: SN-SP500-2499"
                  className={`${inputClass} font-mono uppercase`}
                />
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalTambah(false)} className={tombolSekunder}>Batal</button>
              <button type="submit" className={tombolPrimerGudang}>Simpan ke Rak Gudang</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Pindah Rak */}
      {targetPindah && (
        <Modal
          judul={`Pemindahan Rak Antar Bin — ${targetPindah.nomorBets}`}
          keterangan={`Asal: ${targetPindah.lokasiPenyimpanan} (${targetPindah.binId ?? '-'}) · Tersedia ${targetPindah.jumlahStok} ${targetPindah.satuan}. Pemindahan mencatat satu mata rantai sha256.`}
          onClose={() => setTargetPindah(null)}
        >
          <form onSubmit={eksekusiPindahBin} className="space-y-3 text-xs">
            <div>
              <label className={labelClass}>Bin Tujuan (Wajib Zona {targetPindah.zonaSuhu})</label>
              <select
                value={binTujuanPindah}
                onChange={(e) => setBinTujuanPindah(e.target.value)}
                className={inputClass}
              >
                {binList
                  .filter((b) => b.id !== targetPindah.binId)
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {kodeBinDariLokasi(b)} — {b.zonaSuhu} (sisa {b.kapasitas - b.terpakai} {b.satuan})
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Jumlah Dipindahkan ({targetPindah.satuan})</label>
              <input
                type="number"
                min={1}
                max={targetPindah.jumlahStok}
                required
                value={qtyPindah}
                onChange={(e) => setQtyPindah(Number(e.target.value))}
                className={`${inputClass} tabular-nums`}
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setTargetPindah(null)} className={tombolSekunder}>Batal</button>
              <button type="submit" className={tombolPrimerGudang}>Pindahkan & Catat Rantai</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Kunci / Rilis */}
      {targetKunci && (
        <Modal
          judul={targetKunci.mode === 'kunci' ? `Kunci Karantina Bets ${targetKunci.stok.nomorBets}` : `Rilis Mutu Bets ${targetKunci.stok.nomorBets}`}
          keterangan={
            targetKunci.mode === 'kunci'
              ? 'Bets yang dikunci otomatis dikeluarkan dari kandidat picking FEFO dan dicatat Old/New pada jejak audit.'
              : 'Pelepasan kunci mengembalikan bets ke status AVAILABLE dan hanya diizinkan bagi peran PJT / Manajer QA.'
          }
          onClose={() => setTargetKunci(null)}
        >
          <form onSubmit={eksekusiKunciAtauRilis} className="space-y-3 text-xs">
            <div>
              <label className={labelClass}>Alasan Regulasi / Nomor Dokumen Rujukan</label>
              <textarea
                rows={3}
                required
                value={alasanKunciInput}
                onChange={(e) => setAlasanKunciInput(e.target.value)}
                placeholder={
                  targetKunci.mode === 'kunci'
                    ? 'Contoh: Investigasi kemasan sekunder lembab pada inspeksi rutin...'
                    : 'Contoh: Berita Acara QA-REL-2024-09 menyatakan parameter fisik & fungsi memenuhi syarat...'
                }
                className={inputClass}
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setTargetKunci(null)} className={tombolSekunder}>Batal</button>
              <button type="submit" className={tombolPrimerGudang}>
                {targetKunci.mode === 'kunci' ? 'Kunci QUARANTINE' : 'Setujui Rilis Mutu'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Detail Unit Serial */}
      {detailUnit && (
        <Modal
          judul={detailUnit.nomorSerial}
          keterangan={`${detailUnit.namaAlkes} — ${namaPelanggan(detailUnit.pelangganId)}`}
          onClose={() => setDetailUnit(null)}
        >
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs mb-4">
            {([
              ['unit', 'Identitas Unit', Boxes],
              ['rantai', 'Rantai Bets', History],
              ['garansi', 'Garansi & Instalasi', Wrench]
            ] as const).map(([id, label, Ikon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTabDetailUnit(id)}
                className={`pb-2.5 px-3 font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                  tabDetailUnit === id ? 'border-amber-600 text-amber-800' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Ikon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {tabDetailUnit === 'unit' && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              {[
                ['Nomor Serial', detailUnit.nomorSerial],
                ['Nomor Bets', detailUnit.nomorBets],
                ['Nama Alkes', detailUnit.namaAlkes],
                ['Status Unit', detailUnit.statusUnit],
                ['Tahap Siklus Hidup', detailUnit.tahapSiklusHidup ?? '-'],
                ['Kalibrasi Berikutnya', detailUnit.kalibrasiBerikutnya ?? '-'],
                ['Sales Order / Invoice', `${detailUnit.nomorSalesOrder} / ${detailUnit.nomorInvoice}`],
                ['Kode SATUSEHAT', detailUnit.kodeFasyankesSatuSehat ?? '-']
              ].map(([label, nilai]) => (
                <div key={label}>
                  <dt className="text-2xs font-semibold text-slate-500">{label}</dt>
                  <dd className="text-slate-800 font-semibold mt-0.5 font-mono">{nilai}</dd>
                </div>
              ))}
            </dl>
          )}

          {tabDetailUnit === 'rantai' && (
            <div className="space-y-3 text-xs">
              {(() => {
                const rantai = db.cariKetelusuran(detailUnit.nomorBets);
                if (!rantai) return <p className="text-slate-500">Riwayat bets tidak ditemukan.</p>;
                return (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 grid grid-cols-2 gap-x-4 gap-y-3">
                      {[
                        ['Produsen', rantai.produsen],
                        ['Nomor Izin Edar', rantai.nomorIzinEdar],
                        ['Masuk Gudang', formatTanggal(rantai.tanggalPenerimaan)],
                        ['Hasil QC', rantai.hasilInspeksiQC],
                        ['Lokasi Gudang', rantai.lokasiGudang],
                        ['Zona Suhu', rantai.logSuhuStatus]
                      ].map(([label, nilai]) => (
                        <div key={label}>
                          <div className="text-2xs font-semibold text-slate-500">{label}</div>
                          <div className="text-slate-800 font-semibold mt-0.5">{nilai}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Status recall bets:</span>
                      <Badge tone={rantai.statusRecall.startsWith('Aman') ? 'emerald' : 'rose'}>{rantai.statusRecall}</Badge>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {tabDetailUnit === 'garansi' && (
            <div className="space-y-3 text-xs">
              {garansiPerSerial(detailUnit.nomorSerial).length === 0 ? (
                <p className="text-slate-500">Unit ini belum memiliki catatan instalasi di fasyankes.</p>
              ) : (
                garansiPerSerial(detailUnit.nomorSerial).map((g) => {
                  const st = statusGaransi(g, dariAcuan);
                  return (
                    <div key={g.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{g.masaGaransiBulan} bulan sejak instalasi</span>
                        <Badge tone={toneGaransi(st.label)}>{st.label}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-2xs text-slate-500">Tanggal Instalasi</div>
                          <div className="font-semibold text-slate-800">{formatTanggal(g.tanggalInstalasi)}</div>
                        </div>
                        <div>
                          <div className="text-2xs text-slate-500">Jadwal PM Berikutnya</div>
                          <div className="font-semibold text-slate-800">{formatTanggal(g.jadwalPemeliharaanBerikutnya)}</div>
                        </div>
                      </div>
                      <p className="text-slate-600">{g.catatan}</p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
