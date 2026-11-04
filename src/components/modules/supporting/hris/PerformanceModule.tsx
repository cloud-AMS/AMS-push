import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { KpiKaryawan } from '../../../../types';
import { hitungOee } from '../../../../utils/hris';
import {
  Target,
  Gauge,
  Users2,
  Plus,
  TrendingUp,
  Activity,
  Factory
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

const toneCapaian = (persen: number): Tone => (persen >= 95 ? 'emerald' : persen >= 80 ? 'blue' : persen >= 60 ? 'amber' : 'rose');

export default function PerformanceModule() {
  const [kpi, setKpi] = useState<KpiKaryawan[]>(db.getKpiKaryawan());
  const [umpanBalik] = useState(db.getUmpanBalik360());
  const [karyawan] = useState(db.getKaryawanHRIS());
  const [oee, setOee] = useState({ ketersediaan: 88.2, performa: 94.5, kualitas: 97.6 });
  const [modalKpi, setModalKpi] = useState(false);
  const [form, setForm] = useState({
    karyawanId: '',
    kerangka: 'Balanced Scorecard (Kantor/Sales)' as KpiKaryawan['kerangka'],
    periode: '2026-Q4',
    indikator: '',
    target: '',
    realisasi: '',
    capaianPersen: 85
  });

  const nilaiOee = hitungOee(oee.ketersediaan, oee.performa, oee.kualitas);

  const rekapKaryawan = useMemo(() => {
    return karyawan
      .map((k) => {
        const daftarKpi = kpi.filter((i) => i.karyawanId === k.id);
        const rataKpi = daftarKpi.length
          ? Math.round(daftarKpi.reduce((t, i) => t + i.capaianPersen, 0) / daftarKpi.length)
          : null;
        const fb = umpanBalik.find((u) => u.karyawanId === k.id);
        const skorFb = fb
          ? Math.round(
              ([fb.skorAtasan, fb.skorRekan, fb.skorBawahan, fb.skorDiriSendiri].filter((s) => s > 0).reduce((t, s) => t + s, 0) /
                Math.max([fb.skorAtasan, fb.skorRekan, fb.skorBawahan, fb.skorDiriSendiri].filter((s) => s > 0).length, 1)) *
                20
            )
          : null;
        const gabungan = rataKpi !== null && skorFb !== null ? Math.round((rataKpi + skorFb) / 2) : rataKpi ?? skorFb;
        return { karyawan: k, jumlahKpi: daftarKpi.length, rataKpi, skorFb, gabungan };
      })
      .filter((r) => r.gabungan !== null)
      .sort((a, b) => (b.gabungan || 0) - (a.gabungan || 0));
  }, [karyawan, kpi, umpanBalik]);

  const simpanKpi = (e: React.FormEvent) => {
    e.preventDefault();
    const dipilih = karyawan.find((k) => k.id === form.karyawanId);
    if (!dipilih || !form.indikator) return;
    const baru: KpiKaryawan = {
      id: 'KPI-' + Date.now(),
      karyawanId: dipilih.id,
      nama: dipilih.nama,
      kerangka: form.kerangka,
      periode: form.periode,
      indikator: form.indikator,
      target: form.target || '-',
      realisasi: form.realisasi || '-',
      capaianPersen: Number(form.capaianPersen)
    };
    db.addKpiKaryawan(baru);
    setKpi(db.getKpiKaryawan());
    setModalKpi(false);
    setForm({ ...form, indikator: '', target: '', realisasi: '' });
  };

  const KERANGKA: KpiKaryawan['kerangka'][] = ['Balanced Scorecard (Kantor/Sales)', 'Efisiensi Manufaktur'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Indikator KPI Aktif" value={kpi.length} hint="Dua kerangka penilaian berjalan paralel" tone="blue" />
        <Stat
          label="Rata-rata Capaian KPI"
          value={`${Math.round(kpi.reduce((t, k) => t + k.capaianPersen, 0) / Math.max(kpi.length, 1))}%`}
          hint="Ambang satisfaktori 95% dari target"
          tone="emerald"
        />
        <Stat
          label="OEE Lini Perakitan (kalkulator)"
          value={`${nilaiOee}%`}
          hint={`Benchmark world-class 85% • ${nilaiOee >= 85 ? 'memenuhi' : 'di bawah'} target`}
          tone={nilaiOee >= 85 ? 'emerald' : 'amber'}
        />
        <Stat
          label="Umpan Balik 360° Berjalan"
          value={umpanBalik.filter((u) => u.status === 'Berjalan').length}
          hint={`${umpanBalik.length} penilaian CPM semester ini`}
        />
      </div>

      <Panel
        judul="KPI Ganda: Balanced Scorecard & Efisiensi Manufaktur"
        keterangan="Karyawan kantor/sales dinilai dengan kerangka Balanced Scorecard (finansial, pelanggan, proses internal, pembelajaran), sedangkan personil produksi dinilai dengan OEE dan defect rate."
        aksi={
          <button type="button" className={tombolPrimer} onClick={() => setModalKpi(true)}>
            <Plus className="w-4 h-4" />
            Tambah Indikator KPI
          </button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {KERANGKA.map((kerangka) => {
            const isi = kpi.filter((k) => k.kerangka === kerangka);
            const Ikon = kerangka.startsWith('Balanced') ? Target : Factory;
            return (
              <div key={kerangka} className="rounded-xl border border-slate-200">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <Ikon className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-800">{kerangka}</h4>
                  <Badge tone="slate">{isi.length} indikator</Badge>
                </div>
                <div className="divide-y divide-slate-100">
                  {isi.map((k) => (
                    <div key={k.id} className="p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold text-slate-900">{k.nama}</div>
                          <div className="text-[11px] text-slate-600 mt-0.5">{k.indikator}</div>
                          <div className="text-[10px] text-slate-500 mt-1 font-mono">
                            {k.periode} • target {k.target} • realisasi {k.realisasi}
                          </div>
                        </div>
                        <Badge tone={toneCapaian(k.capaianPersen)}>{k.capaianPersen}%</Badge>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${Math.min(k.capaianPersen, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {isi.length === 0 && <div className="p-4 text-[11px] text-slate-400 italic">Belum ada indikator.</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel
          judul="Kalkulator OEE (Overall Equipment Effectiveness)"
          keterangan="OEE = Availability × Performance × Quality. Digunakan sebagai KPI kepala produksi dan dasar perhitungan insentif piece-rate."
        >
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Availability (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                className={inputClass}
                value={oee.ketersediaan}
                onChange={(e) => setOee({ ...oee, ketersediaan: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>Performance (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                className={inputClass}
                value={oee.performa}
                onChange={(e) => setOee({ ...oee, performa: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>Quality (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                className={inputClass}
                value={oee.kualitas}
                onChange={(e) => setOee({ ...oee, kualitas: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 flex items-center justify-between gap-3">
            <div className="text-xs text-blue-900 font-mono">
              ({oee.ketersediaan}% × {oee.performa}% × {oee.kualitas}%)
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-blue-800 font-mono">{nilaiOee}%</div>
              <Badge tone={nilaiOee >= 85 ? 'emerald' : 'amber'}>
                <Gauge className="w-3 h-3" />
                {nilaiOee >= 85 ? 'World-class (≥ 85%)' : 'Perlu perbaikan (target 85%)'}
              </Badge>
            </div>
          </div>
        </Panel>

        <Panel
          judul="Umpan Balik 360° (CPM)"
          keterangan="Penilaian atasan, rekan sejawat, bawahan, dan diri sendiri dikonversi ke skala 100 untuk digabungkan dengan capaian KPI."
        >
          <div className="space-y-2">
            {umpanBalik.map((u) => {
              const rata = Math.round(
                ([u.skorAtasan, u.skorRekan, u.skorBawahan, u.skorDiriSendiri].filter((s) => s > 0).reduce((t, s) => t + s, 0) /
                  Math.max([u.skorAtasan, u.skorRekan, u.skorBawahan, u.skorDiriSendiri].filter((s) => s > 0).length, 1)) * 20
              );
              return (
                <div key={u.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Users2 className="w-3.5 h-3.5 text-slate-500" />
                        {u.nama}
                      </div>
                      <div className="text-[10px] text-slate-500">{u.periode}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={u.status === 'Selesai' ? 'emerald' : 'amber'}>{u.status}</Badge>
                      <Badge tone={toneCapaian(rata)}>Skor {rata}/100</Badge>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-[10px]">
                    {[
                      ['Atasan', u.skorAtasan],
                      ['Rekan', u.skorRekan],
                      ['Bawahan', u.skorBawahan],
                      ['Diri sendiri', u.skorDiriSendiri]
                    ].map(([label, skor]) => (
                      <div key={String(label)} className="rounded-lg bg-slate-50 border border-slate-200 px-2 py-1.5">
                        <div className="text-slate-500">{label}</div>
                        <div className="font-bold text-slate-800">{Number(skor) > 0 ? `${skor}/5` : '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel
        judul="Talent Review: Penggabungan KPI & Umpan Balik 360°"
        keterangan="Skor gabungan = rata-rata capaian KPI dan skor 360°; menjadi dasar keputusan promosi, rotasi, dan rencana pengembangan individu (IDP)."
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4 text-right">Capaian KPI</th>
                <th className="py-3 px-4 text-right">Skor 360°</th>
                <th className="py-3 px-4 text-right">Skor Gabungan</th>
                <th className="py-3 px-4">Kategori Talent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rekapKaryawan.map((r) => (
                <tr key={r.karyawan.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{r.karyawan.nama}</td>
                  <td className="py-3 px-4 text-slate-700">
                    <div>{r.karyawan.jabatan}</div>
                    <div className="text-[10px] text-slate-500">{r.karyawan.divisi} • {r.karyawan.lokasi}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">{r.rataKpi !== null ? `${r.rataKpi}%` : '—'}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">{r.skorFb !== null ? `${r.skorFb}/100` : '—'}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-800">{r.gabungan}</td>
                  <td className="py-3 px-4">
                    <Badge tone={(r.gabungan || 0) >= 95 ? 'emerald' : (r.gabungan || 0) >= 80 ? 'blue' : 'amber'}>
                      <TrendingUp className="w-3 h-3" />
                      {(r.gabungan || 0) >= 95 ? 'Top Talent — jalur promosi' : (r.gabungan || 0) >= 80 ? 'Solid Performer' : 'Perlu Rencana Pengembangan (IDP)'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {modalKpi && (
        <Modal
          judul="Tambah Indikator KPI"
          keterangan="Pilih kerangka penilaian sesuai jenis pekerjaan: Balanced Scorecard untuk kantor/sales, Efisiensi Manufaktur untuk lini produksi."
          onClose={() => setModalKpi(false)}
        >
          <form onSubmit={simpanKpi} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Karyawan</label>
                <select
                  required
                  className={inputClass}
                  value={form.karyawanId}
                  onChange={(e) => setForm({ ...form, karyawanId: e.target.value })}
                >
                  <option value="">— Pilih karyawan —</option>
                  {karyawan.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama} — {k.divisi}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Kerangka Penilaian</label>
                <select
                  className={inputClass}
                  value={form.kerangka}
                  onChange={(e) => setForm({ ...form, kerangka: e.target.value as KpiKaryawan['kerangka'] })}
                >
                  {KERANGKA.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Periode</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.periode}
                  onChange={(e) => setForm({ ...form, periode: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Capaian (%)</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  className={inputClass}
                  value={form.capaianPersen}
                  onChange={(e) => setForm({ ...form, capaianPersen: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Indikator</label>
              <input
                type="text"
                required
                className={inputClass}
                placeholder="Contoh: Ketepatan waktu rilis bets ke gudang barang jadi"
                value={form.indikator}
                onChange={(e) => setForm({ ...form, indikator: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Target</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Contoh: ≥ 98%"
                  value={form.target}
                  onChange={(e) => setForm({ ...form, target: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Realisasi</label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="Contoh: 96,2%"
                  value={form.realisasi}
                  onChange={(e) => setForm({ ...form, realisasi: e.target.value })}
                />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setModalKpi(false)}>Batal</button>
              <button type="submit" className={tombolPrimer}>
                <Activity className="w-4 h-4" />
                Simpan Indikator
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
