import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { KejadianScanner, StokGudang, UserRole } from '../../../../types';
import { kodeBinDariLokasi, validasiPemindaian } from '../../../../utils/gudang';
import {
  CheckCircle2,
  Cpu,
  Radio,
  ScanLine,
  ShieldAlert,
  Wifi
} from 'lucide-react';
import {
  Badge,
  Panel,
  Stat,
  chipFilter,
  identitasPeranGudang,
  inputClass,
  labelClass,
  tombolPrimerGudang,
  tombolSekunder,
  waktuMutasiMonoton,
  type Tone
} from './ui';

interface Props {
  currentRole: UserRole;
  dariAcuan: Date;
  onPerubahanData: () => void;
}

const PERANGKAT_PRESET: {
  nama: string;
  tipe: KejadianScanner['tipePerangkat'];
  protokol: KejadianScanner['protokol'];
}[] = [
  { nama: 'Zebra TC22 (PDA-GUDANG-01)', tipe: 'Handheld PDA', protokol: 'USB/Serial' },
  { nama: 'Honeywell EDA51 (PDA-GUDANG-02)', tipe: 'Handheld PDA', protokol: 'USB/Serial' },
  { nama: 'RFID Gate Dock 02', tipe: 'RFID Gate', protokol: 'MQTT' },
  { nama: 'RFID Tunnel Cold Room', tipe: 'RFID Tunnel', protokol: 'MQTT' },
  { nama: 'Zebra ZT411 (LABEL-PRINTER-01)', tipe: 'Printer Label', protokol: 'MQTT' }
];

const toneHasilScan = (hasil: KejadianScanner['hasilValidasi']): Tone => {
  if (hasil === 'Tervalidasi') return 'emerald';
  if (hasil === 'Stok Terkunci Karantina' || hasil === 'Bets Tidak Terdaftar') return 'rose';
  return 'amber';
};

export default function ScannerRfidTab({ currentRole, dariAcuan, onPerubahanData }: Props) {
  const [riwayat, setRiwayat] = useState<KejadianScanner[]>(() => db.getKejadianScanner());
  const [binList, setBinList] = useState(() => db.getLokasiBin());
  const [stokList, setStokList] = useState(() => db.getStokGudang());

  const [filterHasil, setFilterHasil] = useState<'Semua' | KejadianScanner['hasilValidasi']>('Semua');
  const [filterProtokol, setFilterProtokol] = useState<'Semua' | KejadianScanner['protokol']>('Semua');

  const [form, setForm] = useState({
    perangkatIdx: 0,
    mode: 'Pengiriman' as KejadianScanner['mode'],
    binDipindai: 'BIN-B01-03-01',
    produkDipindai: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    nomorBets: 'LOT-2024-PM44',
    jumlah: 2,
    zonaSuhuDibutuhkan: 'Ruang Sejuk AC (15°C - 25°C)' as StokGudang['zonaSuhu'] | '',
    pakaiBatasManifes: true,
    qtyManifes: 4,
    rujukanDokumen: 'SJ/CDAKB/2024/SP-EKAT-2024-118',
    eksekusiPindahRak: false
  });

  const [umpanBalik, setUmpanBalik] = useState<{
    boleh: boolean;
    judul: string;
    detail: string;
  } | null>(null);

  const segarkan = () => {
    setRiwayat(db.getKejadianScanner());
    setBinList(db.getLokasiBin());
    setStokList(db.getStokGudang());
    onPerubahanData();
  };

  // Pratinjau langsung hasil validasi sebelum tombol pindai ditekan
  const pratinjauValidasi = useMemo(() => {
    return validasiPemindaian({
      daftarBin: binList,
      daftarStok: stokList,
      mode: form.mode,
      binDipindai: form.binDipindai.trim(),
      nomorBets: form.nomorBets.trim().toUpperCase(),
      jumlah: Number(form.jumlah) || 0,
      zonaSuhuDibutuhkan: form.zonaSuhuDibutuhkan || undefined,
      qtyManifes: form.pakaiBatasManifes ? Number(form.qtyManifes) : undefined
    });
  }, [binList, stokList, form]);

  const muatSkenario = (
    skenario: 'valid' | 'zona-salah' | 'bets-asing' | 'lebih-manifes' | 'karantina'
  ) => {
    if (skenario === 'valid') {
      setForm({
        perangkatIdx: 0,
        mode: 'Pengiriman',
        binDipindai: 'BIN-B01-03-01',
        produkDipindai: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
        nomorBets: 'LOT-2024-PM44',
        jumlah: 2,
        zonaSuhuDibutuhkan: 'Ruang Sejuk AC (15°C - 25°C)',
        pakaiBatasManifes: true,
        qtyManifes: 4,
        rujukanDokumen: 'SJ/CDAKB/2024/SP-EKAT-2024-118',
        eksekusiPindahRak: false
      });
    } else if (skenario === 'zona-salah') {
      setForm({
        perangkatIdx: 2,
        mode: 'Penerimaan',
        binDipindai: 'BIN-D05-01-01',
        produkDipindai: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
        nomorBets: 'LOT-2024-DNG12',
        jumlah: 25,
        zonaSuhuDibutuhkan: 'Cold Chain (2°C - 8°C)',
        pakaiBatasManifes: false,
        qtyManifes: 50,
        rujukanDokumen: 'TRM/WH/2024/04/035-1',
        eksekusiPindahRak: false
      });
    } else if (skenario === 'bets-asing') {
      setForm({
        perangkatIdx: 2,
        mode: 'Penerimaan',
        binDipindai: 'BIN-C01-01-01',
        produkDipindai: 'Karton Reagen Tanpa Label Master',
        nomorBets: 'LOT-2024-ASING99',
        jumlah: 10,
        zonaSuhuDibutuhkan: 'Cold Chain (2°C - 8°C)',
        pakaiBatasManifes: false,
        qtyManifes: 10,
        rujukanDokumen: 'TRM/WH/2024/05/042-1',
        eksekusiPindahRak: false
      });
    } else if (skenario === 'lebih-manifes') {
      setForm({
        perangkatIdx: 1,
        mode: 'Pengiriman',
        binDipindai: 'BIN-C01-01-01',
        produkDipindai: 'Reagen Rapid Test Dengue NS1 & IgG/IgM Combo',
        nomorBets: 'LOT-2024-DNG12',
        jumlah: 28,
        zonaSuhuDibutuhkan: 'Cold Chain (2°C - 8°C)',
        pakaiBatasManifes: true,
        qtyManifes: 20,
        rujukanDokumen: 'SJ/CDAKB/2024/SP-KLINIK-2024-120',
        eksekusiPindahRak: false
      });
    } else if (skenario === 'karantina') {
      setForm({
        perangkatIdx: 0,
        mode: 'Pengiriman',
        binDipindai: 'BIN-K02-01-01',
        produkDipindai: 'Syringe Pump Presisi Tinggi AMS-SP500',
        nomorBets: 'LOT-2024-SP08',
        jumlah: 2,
        zonaSuhuDibutuhkan: 'Ruang Sejuk AC (15°C - 25°C)',
        pakaiBatasManifes: true,
        qtyManifes: 5,
        rujukanDokumen: 'SJ/CDAKB/2024/SP-RS-2024-119',
        eksekusiPindahRak: false
      });
    }
  };

  const jalankanPemindaian = (e: React.FormEvent) => {
    e.preventDefault();
    const perangkat = PERANGKAT_PRESET[form.perangkatIdx] ?? PERANGKAT_PRESET[0];
    const { kejadian, hasil } = db.catatPemindaian({
      perangkat: perangkat.nama,
      tipePerangkat: perangkat.tipe,
      protokol: perangkat.protokol,
      mode: form.mode,
      binDipindai: form.binDipindai.trim(),
      produkDipindai: form.produkDipindai.trim() || hasilPratinjauNama(),
      nomorBets: form.nomorBets.trim().toUpperCase(),
      jumlah: Number(form.jumlah) || 1,
      rujukanDokumen: form.rujukanDokumen.trim() || '-',
      zonaSuhuDibutuhkan: form.zonaSuhuDibutuhkan || undefined,
      qtyManifes: form.pakaiBatasManifes ? Number(form.qtyManifes) : undefined
    });

    let infoTambahan = '';
    if (hasil.bolehDiproses && form.mode === 'Pemindahan Rak' && form.eksekusiPindahRak && hasil.stok && hasil.bin) {
      const waktuMonoton = waktuMutasiMonoton(dariAcuan, db.getJejakPergerakan());
      const identitas = identitasPeranGudang(currentRole);
      const pindah = db.pindahkanStokAntarBin(
        hasil.stok.id,
        hasil.bin.id,
        Number(form.jumlah) || 1,
        { pengguna: identitas.pengguna, peran: identitas.peran },
        waktuMonoton
      );
      infoTambahan = pindah.boleh ? ` • Fisik berpindah: ${pindah.keterangan}` : ` • Pindah fisik batal: ${pindah.keterangan}`;
    }

    setUmpanBalik({
      boleh: hasil.bolehDiproses,
      judul: `${kejadian.id} — ${hasil.hasil}`,
      detail: `${hasil.sebab}${infoTambahan}`
    });
    segarkan();
  };

  function hasilPratinjauNama() {
    const s = stokList.find((x) => x.nomorBets === form.nomorBets.trim().toUpperCase());
    return s?.namaAlkes ?? 'Alat Kesehatan Terpindai';
  }

  const daftarTampil = useMemo(() => {
    return riwayat.filter((k) => {
      const cocokHasil = filterHasil === 'Semua' || k.hasilValidasi === filterHasil;
      const cocokProto = filterProtokol === 'Semua' || k.protokol === filterProtokol;
      return cocokHasil && cocokProto;
    });
  }, [riwayat, filterHasil, filterProtokol]);

  const totalValid = riwayat.filter((r) => r.hasilValidasi === 'Tervalidasi').length;
  const totalTolak = riwayat.length - totalValid;
  const totalMqtt = riwayat.filter((r) => r.protokol === 'MQTT').length;

  return (
    <div className="space-y-5">
      {umpanBalik && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            umpanBalik.boleh
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {umpanBalik.boleh ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">{umpanBalik.judul}</div>
              <div className="text-2xs mt-0.5">{umpanBalik.detail}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUmpanBalik(null)}
            className="text-2xs font-semibold underline cursor-pointer shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Total Kejadian Perangkat"
          value={riwayat.length}
          hint="Retensi 300 pembacaan terbaru (PDA, RFID Gate & Tunnel)"
        />
        <Stat
          label="Pemindaian Tervalidasi"
          value={totalValid}
          hint="Lolos verifikasi bin, zona suhu, bets & manifes"
          tone="emerald"
        />
        <Stat
          label="Pemindaian Ditolak Guard"
          value={totalTolak}
          hint="Tercatat pada audit trail tanpa menyentuh stok"
          tone={totalTolak > 0 ? 'amber' : 'slate'}
        />
        <Stat
          label="Trafik Antrean MQTT"
          value={totalMqtt}
          hint={`${riwayat.length - totalMqtt} kejadian via USB/Serial Handheld`}
          tone="blue"
        />
      </div>

      {/* Panel 1: Scan-to-Action Simulator */}
      <Panel
        judul="Alur Scan-to-Action Handheld PDA & Gerbang RFID (Aturan §3.10)"
        keterangan="Praktikkan urutan pindai Bin → Bets Produk → Kuantitas. Empat pelanggaran regulasi (Bin Tidak Sesuai Zona, Bets Tidak Terdaftar, Jumlah Melebihi Manifes, Stok Terkunci Karantina) langsung diblokir dan dicatat ke log perangkat."
      >
        <div className="mb-4 flex items-center gap-1.5 flex-wrap">
          <span className="text-2xs font-semibold text-slate-500 mr-1">Uji Cepat Guard:</span>
          <button type="button" onClick={() => muatSkenario('valid')} className={tombolSekunder}>
            1. Pindai Valid (PM44)
          </button>
          <button type="button" onClick={() => muatSkenario('zona-salah')} className={tombolSekunder}>
            2. Tolak: Salah Zona Suhu
          </button>
          <button type="button" onClick={() => muatSkenario('bets-asing')} className={tombolSekunder}>
            3. Tolak: Bets Tak Terdaftar
          </button>
          <button type="button" onClick={() => muatSkenario('lebih-manifes')} className={tombolSekunder}>
            4. Tolak: Lebih dari Manifes
          </button>
          <button type="button" onClick={() => muatSkenario('karantina')} className={tombolSekunder}>
            5. Tolak: Bets Karantina (SP08)
          </button>
        </div>

        <form onSubmit={jalankanPemindaian} className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Perangkat Pembaca &amp; Protokol</label>
              <select
                value={form.perangkatIdx}
                onChange={(e) => setForm({ ...form, perangkatIdx: Number(e.target.value) })}
                className={inputClass}
              >
                {PERANGKAT_PRESET.map((p, idx) => (
                  <option key={p.nama} value={idx}>
                    {p.nama} [{p.protokol}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Mode Operasi Gudang</label>
              <select
                value={form.mode}
                onChange={(e) =>
                  setForm({ ...form, mode: e.target.value as KejadianScanner['mode'] })
                }
                className={inputClass}
              >
                <option value="Penerimaan">Penerimaan (Inbound Put-Away)</option>
                <option value="Pengiriman">Pengiriman (Outbound Picking)</option>
                <option value="Pemindahan Rak">Pemindahan Rak (Bin-to-Bin)</option>
                <option value="Opname">Opname (RFID Cycle Count)</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Langkah 1 — Kode Bin / RFID Rak Dipindai</label>
              <select
                value={form.binDipindai}
                onChange={(e) => setForm({ ...form, binDipindai: e.target.value })}
                className={`${inputClass} font-mono`}
              >
                {binList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} ({kodeBinDariLokasi(b)} • {b.zonaSuhu})
                  </option>
                ))}
                <option value="DOCK-01">DOCK-01 (Pintu Penerimaan Utama)</option>
                <option value="DOCK-02">DOCK-02 (Pintu Penerimaan Cold Chain)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className={labelClass}>Langkah 2 — Nomor Bets Barcode / GS1-128</label>
              <input
                type="text"
                required
                value={form.nomorBets}
                onChange={(e) => {
                  const bets = e.target.value.toUpperCase();
                  const cocok = stokList.find((s) => s.nomorBets === bets);
                  setForm({
                    ...form,
                    nomorBets: bets,
                    produkDipindai: cocok ? cocok.namaAlkes : form.produkDipindai
                  });
                }}
                placeholder="Contoh: LOT-2024-PM44"
                className={`${inputClass} font-mono uppercase`}
              />
            </div>

            <div>
              <label className={labelClass}>Nama Produk Terbaca</label>
              <input
                type="text"
                value={form.produkDipindai}
                onChange={(e) => setForm({ ...form, produkDipindai: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Syarat Zona Suhu Katalog Produk</label>
              <select
                value={form.zonaSuhuDibutuhkan}
                onChange={(e) =>
                  setForm({
                    ...form,
                    zonaSuhuDibutuhkan: e.target.value as StokGudang['zonaSuhu'] | ''
                  })
                }
                className={inputClass}
              >
                <option value="">(Ikuti zona bin tanpa paksaan)</option>
                <option value="Cold Chain (2°C - 8°C)">Cold Chain (2°C - 8°C)</option>
                <option value="Ruang Sejuk AC (15°C - 25°C)">Ruang Sejuk AC (15°C - 25°C)</option>
                <option value="Suhu Kamar (< 30°C)">Suhu Kamar (&lt; 30°C)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className={labelClass}>Langkah 3 — Jumlah Pindai</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.jumlah}
                    onChange={(e) => setForm({ ...form, jumlah: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Batas Qty Manifes</label>
                  <input
                    type="number"
                    min={1}
                    disabled={!form.pakaiBatasManifes}
                    value={form.qtyManifes}
                    onChange={(e) => setForm({ ...form, qtyManifes: Number(e.target.value) })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-2xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.pakaiBatasManifes}
                    onChange={(e) => setForm({ ...form, pakaiBatasManifes: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  Validasi silang kuota manifes DO/PO
                </label>
              </div>

              <div>
                <label className={labelClass}>Nomor Dokumen Rujukan (DO / Penerimaan / Opname)</label>
                <input
                  type="text"
                  value={form.rujukanDokumen}
                  onChange={(e) => setForm({ ...form, rujukanDokumen: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>

              {form.mode === 'Pemindahan Rak' && (
                <label className="flex items-center gap-1.5 text-2xs text-amber-900 font-semibold cursor-pointer bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <input
                    type="checkbox"
                    checked={form.eksekusiPindahRak}
                    onChange={(e) => setForm({ ...form, eksekusiPindahRak: e.target.checked })}
                    className="rounded border-amber-400"
                  />
                  Sekaligus pindahkan kartu stok &amp; tulis rantai hash pergerakan
                </label>
              )}
            </div>

            <div className="pt-2 space-y-2">
              <div
                className={`p-2.5 rounded-xl border text-2xs ${
                  pratinjauValidasi.bolehDiproses
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="font-bold">Pratinjau Mesin Validasi: {pratinjauValidasi.hasil}</div>
                <div className="mt-0.5">{pratinjauValidasi.sebab}</div>
              </div>

              <button type="submit" className={`${tombolPrimerGudang} w-full justify-center`}>
                <ScanLine className="w-4 h-4" />
                Rekam Kejadian Pemindaian Perangkat
              </button>
            </div>
          </div>
        </form>
      </Panel>

      {/* Panel 2: Log Kejadian Perangkat */}
      <Panel
        judul="Antrean Kejadian Perangkat Handheld & Broker MQTT RFID"
        keterangan="Seluruh pembacaan barcode GS1-128 dan antena UHF RFID beserta keputusan penjaga regulasi."
        aksi={
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['Semua', 'MQTT', 'USB/Serial'] as const).map((proto) => (
              <button
                key={proto}
                type="button"
                onClick={() => setFilterProtokol(proto)}
                className={chipFilter(filterProtokol === proto)}
              >
                {proto === 'MQTT' ? (
                  <span className="inline-flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> MQTT
                  </span>
                ) : proto === 'USB/Serial' ? (
                  <span className="inline-flex items-center gap-1">
                    <Cpu className="w-3 h-3" /> USB/Serial
                  </span>
                ) : (
                  'Semua Protokol'
                )}
              </button>
            ))}
          </div>
        }
      >
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {(
            [
              'Semua',
              'Tervalidasi',
              'Bin Tidak Sesuai Zona',
              'Bets Tidak Terdaftar',
              'Jumlah Melebihi Manifes',
              'Stok Terkunci Karantina'
            ] as const
          ).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterHasil(st)}
              className={chipFilter(filterHasil === st)}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3.5">ID &amp; Waktu</th>
                <th className="py-3 px-3.5">Perangkat &amp; Protokol</th>
                <th className="py-3 px-3.5">Mode &amp; Bin</th>
                <th className="py-3 px-3.5">Produk &amp; Nomor Bets</th>
                <th className="py-3 px-3.5">Qty</th>
                <th className="py-3 px-3.5">Hasil Validasi</th>
                <th className="py-3 px-3.5">Catatan Mesin &amp; Rujukan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarTampil.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3.5 font-mono tabular-nums">
                    <div className="font-bold text-slate-900">{k.id}</div>
                    <div className="text-2xs text-slate-500">{k.waktu}</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-800">{k.perangkat}</div>
                    <div className="text-2xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Radio className="w-3 h-3 text-amber-600" />
                      <span>{k.tipePerangkat}</span>
                      <span>•</span>
                      <span className="font-mono font-bold">{k.protokol}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-800">{k.mode}</div>
                    <div className="font-mono text-2xs text-slate-500">{k.binDipindai}</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="text-slate-900 font-medium">{k.produkDipindai}</div>
                    <div className="font-mono text-2xs font-bold text-amber-900">{k.nomorBets}</div>
                  </td>
                  <td className="py-3 px-3.5 font-mono font-bold tabular-nums text-slate-900">
                    {k.jumlah}
                  </td>
                  <td className="py-3 px-3.5">
                    <Badge tone={toneHasilScan(k.hasilValidasi)}>{k.hasilValidasi}</Badge>
                  </td>
                  <td className="py-3 px-3.5 text-2xs text-slate-600 max-w-xs leading-relaxed">
                    <div>{k.catatan}</div>
                    <div className="font-mono text-slate-400 mt-0.5">Ref: {k.rujukanDokumen}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
