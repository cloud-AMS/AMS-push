import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { SlipGaji } from '../../../../types';
import { PARAMETER_PAYROLL_2026 as P } from '../../../../data/initialData';
import { evaluasiKeterlambatan, hitungPotonganKeterlambatan, hitungInsentifProduksi } from '../../../../utils/hris';
import { hitungSlipGaji, hitungBpjs, formatRupiah } from '../../../../utils/payroll';
import {
  Wallet,
  Play,
  Receipt,
  Landmark,
  Percent,
  Factory,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import {
  Badge,
  Panel,
  Stat,
  Modal,
  inputClass,
  labelClass,
  tombolPrimer,
  tombolSekunder,
  type Tone
} from './ui';

const toneStatusSlip = (status: SlipGaji['status']): Tone =>
  status === 'Dibayar' ? 'emerald' : status === 'Diproses' ? 'blue' : 'slate';

const toneMetode = (metode: SlipGaji['metodePph21']): Tone =>
  metode === 'Gross' ? 'slate' : metode === 'Gross Up' ? 'blue' : 'amber';

export default function PayrollModule() {
  const [slip, setSlip] = useState<SlipGaji[]>(db.getSlipGaji());
  const [karyawan] = useState(db.getKaryawanHRIS());
  const [lembur] = useState(db.getLembur());
  const [absensi] = useState(db.getAbsensi());
  const [periodeFilter, setPeriodeFilter] = useState('Semua');
  const [detail, setDetail] = useState<SlipGaji | null>(null);
  const [modalRun, setModalRun] = useState(false);
  const [run, setRun] = useState({
    periode: '2026-11',
    tunjanganKehadiranPersen: 10,
    metodePph21: 'Gross' as SlipGaji['metodePph21'],
    insentifOperator: 900000,
    insentifSales: 2500000
  });
  const [pieceRate, setPieceRate] = useState({ outputUnit: 2300, tarifPerUnit: 500, tingkatRejectPersen: 1.9 });

  const periodeTersedia = useMemo(() => Array.from(new Set(slip.map((s) => s.periode))).sort().reverse(), [slip]);
  const daftarSlip = useMemo(
    () => (periodeFilter === 'Semua' ? slip : slip.filter((s) => s.periode === periodeFilter)),
    [slip, periodeFilter]
  );

  const hasilPieceRate = hitungInsentifProduksi(pieceRate.outputUnit, pieceRate.tarifPerUnit, pieceRate.tingkatRejectPersen);

  const rekap = useMemo(() => {
    const total = daftarSlip.reduce(
      (akumulator, s) => ({
        thp: akumulator.thp + s.takeHomePay,
        pph21: akumulator.pph21 + s.pph21,
        lembur: akumulator.lembur + s.lembur,
        kes: akumulator.kes + s.bpjsKesehatanKaryawan,
        jht: akumulator.jht + s.bpjsJhtKaryawan,
        jp: akumulator.jp + s.bpjsJpKaryawan
      }),
      { thp: 0, pph21: 0, lembur: 0, kes: 0, jht: 0, jp: 0 }
    );
    const bebanPerusahaan = daftarSlip.reduce((akumulator, s) => {
      const bpjs = hitungBpjs(s.gajiPokok);
      const grossUp = s.metodePph21 === 'Gross Up' ? s.tunjanganPajak : 0;
      const pajakNet = s.metodePph21 === 'Net' ? s.pph21 : 0;
      return akumulator + s.gajiPokok + s.tunjanganKehadiran + s.insentifSales + s.insentifProduksi + s.lembur + grossUp + bpjs.totalPerusahaan + pajakNet;
    }, 0);
    return { ...total, bebanPerusahaan };
  }, [daftarSlip]);

  const jalankanPayroll = (e: React.FormEvent) => {
    e.preventDefault();
    const lemburPeriode = lembur.filter((l) => l.status === 'Disetujui' && l.tanggal.startsWith(run.periode));
    const potonganPerKaryawan = new Map<string, number>();
    absensi
      .filter((a) => a.tanggal.startsWith(run.periode) && a.status === 'Terlambat' && a.jamMasuk !== '-')
      .forEach((a) => {
        const potongan = hitungPotonganKeterlambatan(evaluasiKeterlambatan(a.jamMasuk).menitTerlambat);
        potonganPerKaryawan.set(a.karyawanId, (potonganPerKaryawan.get(a.karyawanId) || 0) + potongan);
      });

    const slipBaru: SlipGaji[] = karyawan.map((k) => {
      const totalLembur = lemburPeriode.filter((l) => l.karyawanId === k.id).reduce((t, l) => t + l.totalLembur, 0);
      const insentifProduksi = k.grade === 'OP1' ? run.insentifOperator : 0;
      const insentifSales = k.divisi === 'Sales & Marketing' ? run.insentifSales : 0;
      const hasil = hitungSlipGaji({
        periode: run.periode,
        karyawanId: k.id,
        nama: k.nama,
        gajiPokok: k.gajiPokok,
        tunjanganKehadiran: Math.round((k.gajiPokok * run.tunjanganKehadiranPersen) / 100),
        insentifSales,
        insentifProduksi,
        potonganAbsensi: potonganPerKaryawan.get(k.id) || 0,
        lembur: totalLembur,
        metodePph21: run.metodePph21
      });
      return { ...hasil, id: `SLIP-${run.periode}-${k.id}`, status: 'Draft' as const };
    });

    const periodeLain = db.getSlipGaji().filter((s) => s.periode !== run.periode);
    db.saveSlipGaji([...slipBaru, ...periodeLain]);
    setSlip(db.getSlipGaji());
    setPeriodeFilter(run.periode);
    setModalRun(false);
  };

  const ubahStatusSlip = (id: string, status: SlipGaji['status']) => {
    const diperbarui = slip.map((s) => (s.id === id ? { ...s, status } : s));
    db.saveSlipGaji(diperbarui);
    setSlip(diperbarui);
    if (detail?.id === id) setDetail({ ...detail, status });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Slip Gaji" value={daftarSlip.length} hint={periodeFilter === 'Semua' ? 'Seluruh periode' : `Periode ${periodeFilter}`} tone="blue" />
        <Stat label="Total Take Home Pay" value={formatRupiah(rekap.thp)} hint="Setelah potongan BPJS karyawan & PPh 21" tone="emerald" />
        <Stat label="PPh 21 Dipotong" value={formatRupiah(rekap.pph21)} hint="Disetor paling lambat tanggal 10 bulan berikutnya" tone="amber" />
        <Stat label="Beban Perusahaan (Cost to Company)" value={formatRupiah(rekap.bebanPerusahaan)} hint="Termasuk iuran BPJS pemberi kerja & tunjangan pajak gross-up" />
      </div>

      <Panel
        judul="Payroll Engine Otomatis"
        keterangan="Menarik gaji pokok dari master data, lembur disetujui dari modul Time & Attendance, potongan keterlambatan, insentif produksi/sales, lalu menghitung BPJS dan PPh 21 sesuai metode yang dipilih."
        aksi={
          <div className="flex items-center gap-2">
            <select className={inputClass} value={periodeFilter} onChange={(e) => setPeriodeFilter(e.target.value)}>
              <option value="Semua">Semua periode</option>
              {periodeTersedia.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button type="button" className={tombolPrimer} onClick={() => setModalRun(true)}>
              <Play className="w-4 h-4" />
              Jalankan Payroll
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Periode / Karyawan</th>
                <th className="py-3 px-4 text-right">Gaji Pokok</th>
                <th className="py-3 px-4 text-right">Tunjangan & Insentif</th>
                <th className="py-3 px-4 text-right">Lembur</th>
                <th className="py-3 px-4 text-right">Potongan</th>
                <th className="py-3 px-4 text-right">BPJS Karyawan</th>
                <th className="py-3 px-4 text-right">PPh 21</th>
                <th className="py-3 px-4 text-right">Take Home Pay</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarSlip.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setDetail(s)}>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{s.nama}</div>
                    <div className="text-[10px] font-mono text-slate-500">{s.periode} • {s.id}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">{formatRupiah(s.gajiPokok)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {formatRupiah(s.tunjanganKehadiran + s.insentifSales + s.insentifProduksi)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">{formatRupiah(s.lembur)}</td>
                  <td className="py-3 px-4 text-right font-mono text-rose-700">-{formatRupiah(s.potonganAbsensi)}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    {formatRupiah(s.bpjsKesehatanKaryawan + s.bpjsJhtKaryawan + s.bpjsJpKaryawan)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="font-mono text-slate-700">{formatRupiah(s.pph21)}</div>
                    <Badge tone={toneMetode(s.metodePph21)}>{s.metodePph21}</Badge>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-800">{formatRupiah(s.takeHomePay)}</td>
                  <td className="py-3 px-4">
                    <Badge tone={toneStatusSlip(s.status)}>{s.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel
          judul="Rekap BPJS Kesehatan & Ketenagakerjaan"
          keterangan={`Pembagian iuran: Kesehatan ${P.bpjsKesehatanKaryawanPersen}% karyawan / ${P.bpjsKesehatanPerusahaanPersen}% perusahaan, JHT ${P.bpjsJhtKaryawanPersen}% / ${P.bpjsJhtPerusahaanPersen}%, JP ${P.bpjsJpKaryawanPersen}% / ${P.bpjsJpPerusahaanPersen}% dengan batas atas upah ${formatRupiah(P.batasAtasUpahJp)}.`}
        >
          <div className="space-y-2 text-xs">
            {[
              { label: 'BPJS Kesehatan (1% karyawan)', nilai: rekap.kes, ikon: Landmark },
              { label: 'JHT — Jaminan Hari Tua (2% karyawan)', nilai: rekap.jht, ikon: Landmark },
              { label: 'JP — Jaminan Pensiun (1% karyawan, dibatasi)', nilai: rekap.jp, ikon: Landmark },
              { label: 'Total potongan iuran karyawan', nilai: rekap.kes + rekap.jht + rekap.jp, ikon: Receipt }
            ].map((baris) => {
              const Ikon = baris.ikon;
              return (
                <div key={baris.label} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Ikon className="w-4 h-4 text-slate-500" />
                    {baris.label}
                  </div>
                  <span className="font-mono font-bold text-slate-900">{formatRupiah(baris.nilai)}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel
          judul="Skema Insentif Produksi (Piece Rate)"
          keterangan="Insentif operator lini perakitan dihitung dari output unit lolos (setelah dikurangi reject) dikalikan tarif per unit, lalu menjadi komponen insentifProduksi pada slip gaji."
        >
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Output Unit / Bulan</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={pieceRate.outputUnit}
                onChange={(e) => setPieceRate({ ...pieceRate, outputUnit: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>Tarif per Unit (Rp)</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={pieceRate.tarifPerUnit}
                onChange={(e) => setPieceRate({ ...pieceRate, tarifPerUnit: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>Tingkat Reject (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                className={inputClass}
                value={pieceRate.tingkatRejectPersen}
                onChange={(e) => setPieceRate({ ...pieceRate, tingkatRejectPersen: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 flex items-center justify-between gap-3">
            <div className="text-xs text-blue-900">
              <div className="font-bold flex items-center gap-1.5">
                <Factory className="w-3.5 h-3.5" />
                Total insentif produksi lini
              </div>
              <div className="font-mono text-[11px] mt-1">
                ({pieceRate.outputUnit.toLocaleString('id-ID')} unit × (100% − {pieceRate.tingkatRejectPersen}% reject)) × {formatRupiah(pieceRate.tarifPerUnit)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-800 font-mono">{formatRupiah(hasilPieceRate)}</div>
              <button
                type="button"
                className="text-[10px] font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                onClick={() => { setRun({ ...run, insentifOperator: hasilPieceRate }); setModalRun(true); }}
              >
                Gunakan sebagai insentif operator <ArrowRight className="w-3 h-3 inline" />
              </button>
            </div>
          </div>
        </Panel>
      </div>

      <Panel
        judul="Metode Perhitungan PPh 21"
        keterangan={`Tarif Pasal 17 ayat (1) huruf a UU PPh diterapkan berlapis atas PKP tahunan (bruto − biaya jabatan ${P.biayaJabatanPersen}% maks ${formatRupiah(P.biayaJabatanMaksTahunan)} − iuran pensiun − PTKP ${formatRupiah(P.ptkpTK0)} untuk TK/0).`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {[
            {
              metode: 'Gross',
              ikon: Percent,
              isi: 'Pajak dipotong dari penghasilan karyawan sehingga take home pay berkurang sebesar PPh 21 terutang.'
            },
            {
              metode: 'Gross Up',
              ikon: TrendingUp,
              isi: 'Perusahaan memberikan tunjangan pajak sebesar PPh 21 terutang; dihitung iteratif hingga konvergen sehingga THP tidak tergerus.'
            },
            {
              metode: 'Net',
              ikon: Wallet,
              isi: 'PPh 21 sepenuhnya ditanggung perusahaan (pajak ditanggung pemberi kerja) dan tidak mengurangi THP karyawan.'
            }
          ].map((m) => {
            const Ikon = m.ikon;
            return (
              <div key={m.metode} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Ikon className="w-4 h-4 text-slate-500" />
                  <h4 className="font-bold text-slate-900">{m.metode}</h4>
                  <Badge tone={toneMetode(m.metode as SlipGaji['metodePph21'])}>
                    {daftarSlip.filter((s) => s.metodePph21 === m.metode).length} slip
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">{m.isi}</p>
              </div>
            );
          })}
        </div>
      </Panel>

      {detail && (
        <Modal
          judul={`Slip Gaji — ${detail.nama}`}
          keterangan={`Periode ${detail.periode} • metode PPh 21 ${detail.metodePph21} • status ${detail.status}`}
          onClose={() => setDetail(null)}
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <tbody className="divide-y divide-slate-100">
                  {[
                    ['Gaji pokok', detail.gajiPokok, false],
                    ['Tunjangan kehadiran', detail.tunjanganKehadiran, false],
                    ['Insentif sales', detail.insentifSales, false],
                    ['Insentif produksi (piece rate)', detail.insentifProduksi, false],
                    ['Upah lembur disetujui', detail.lembur, false],
                    ['Potongan keterlambatan/absensi', detail.potonganAbsensi, true],
                    [`BPJS Kesehatan karyawan (${P.bpjsKesehatanKaryawanPersen}%)`, detail.bpjsKesehatanKaryawan, true],
                    [`BPJS JHT karyawan (${P.bpjsJhtKaryawanPersen}%)`, detail.bpjsJhtKaryawan, true],
                    [`BPJS JP karyawan (${P.bpjsJpKaryawanPersen}%)`, detail.bpjsJpKaryawan, true],
                    ['Tunjangan pajak (gross up)', detail.tunjanganPajak, false],
                    ['PPh 21 dipotong', detail.pph21, true]
                  ].map(([label, nilai, potongan]) => (
                    <tr key={String(label)}>
                      <td className="py-2 px-3 text-slate-600">{label}</td>
                      <td className={`py-2 px-3 text-right font-mono font-semibold ${potongan ? 'text-rose-700' : 'text-slate-900'}`}>
                        {potongan && Number(nilai) > 0 ? '-' : ''}{formatRupiah(Number(nilai))}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-blue-50">
                    <td className="py-2.5 px-3 font-bold text-blue-900">Take Home Pay</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-blue-900">{formatRupiah(detail.takeHomePay)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">Jejak perhitungan PPh 21</div>
              <div className="font-mono text-[11px] text-slate-700">
                Biaya jabatan (maks {formatRupiah(P.biayaJabatanMaksTahunan)}): {formatRupiah(Math.min(Math.round(((detail.gajiPokok + detail.tunjanganKehadiran + detail.insentifSales + detail.insentifProduksi + detail.lembur - detail.potonganAbsensi + detail.tunjanganPajak) * 12 * P.biayaJabatanPersen) / 100), P.biayaJabatanMaksTahunan))}
              </div>
              <div className="font-mono text-[11px] text-slate-700">
                PTKP TK/0: {formatRupiah(P.ptkpTK0)} — lapisan tarif: 5% / 15% / 25% / 30% / 35%
              </div>
              <div className="font-mono text-[11px] text-slate-700">
                PPh 21 bulanan: {formatRupiah(detail.pph21)} → tahunan ± {formatRupiah(detail.pph21 * 12)}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500">Alur status: Draft → Diproses → Dibayar</span>
              <div className="flex gap-2">
                <button type="button" className={tombolSekunder} onClick={() => ubahStatusSlip(detail.id, 'Diproses')}>Tandai Diproses</button>
                <button type="button" className={tombolPrimer} onClick={() => ubahStatusSlip(detail.id, 'Dibayar')}>Tandai Dibayar</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {modalRun && (
        <Modal
          judul="Jalankan Payroll Periode Baru"
          keterangan="Slip periode yang sama akan ditimpa. Lembur hanya diambil dari pengajuan berstatus Disetujui pada periode tersebut."
          onClose={() => setModalRun(false)}
        >
          <form onSubmit={jalankanPayroll} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Periode (YYYY-MM)</label>
                <input
                  type="month"
                  required
                  className={inputClass}
                  value={run.periode}
                  onChange={(e) => setRun({ ...run, periode: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Metode PPh 21</label>
                <select
                  className={inputClass}
                  value={run.metodePph21}
                  onChange={(e) => setRun({ ...run, metodePph21: e.target.value as SlipGaji['metodePph21'] })}
                >
                  <option value="Gross">Gross</option>
                  <option value="Gross Up">Gross Up</option>
                  <option value="Net">Net</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Tunjangan Kehadiran (%)</label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  className={inputClass}
                  value={run.tunjanganKehadiranPersen}
                  onChange={(e) => setRun({ ...run, tunjanganKehadiranPersen: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>Insentif Operator (OP1)</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={run.insentifOperator}
                  onChange={(e) => setRun({ ...run, insentifOperator: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>Insentif Sales</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={run.insentifSales}
                  onChange={(e) => setRun({ ...run, insentifSales: Number(e.target.value) })}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {karyawan.length} karyawan akan diproses. Lembur disetujui periode {run.periode}:{' '}
              <strong>{lembur.filter((l) => l.status === 'Disetujui' && l.tanggal.startsWith(run.periode)).length}</strong> pengajuan.
            </p>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setModalRun(false)}>Batal</button>
              <button type="submit" className={tombolPrimer}>
                <Play className="w-4 h-4" />
                Hitung & Buat Slip
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
