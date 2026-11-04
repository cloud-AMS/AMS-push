import { useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { LogPestControl } from '../../../../types';
import { Bug, CheckCircle2, Plus, ShieldAlert } from 'lucide-react';
import {
  Badge,
  Modal,
  Panel,
  Stat,
  chipFilter,
  inputClass,
  labelClass,
  tombolPrimerGudang,
  tombolSekunder,
  type Tone
} from './ui';

interface Props {
  dariAcuan: Date;
  onPerubahanData: () => void;
}

const METODE_HAMA: LogPestControl['metode'][] = [
  'Perangkap Umpan',
  'Fogging Sanitasi',
  'Lampu UV Serangga',
  'Inspeksi Fisik'
];

const HASIL_TEMUAN: LogPestControl['hasilTemuan'][] = [
  'Bebas Hama',
  'Ditemukan Indikasi',
  'Perlu Penanganan Khusus'
];

const toneTemuan = (hasil: LogPestControl['hasilTemuan']): Tone =>
  hasil === 'Bebas Hama' ? 'emerald' : hasil === 'Ditemukan Indikasi' ? 'amber' : 'rose';

export default function PengendalianHamaTab({ dariAcuan, onPerubahanData }: Props) {
  const [pestList, setPestList] = useState<LogPestControl[]>(() => db.getPestControl());
  const [filterTemuan, setFilterTemuan] = useState<'Semua' | LogPestControl['hasilTemuan']>('Semua');
  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'tolak'; teks: string } | null>(null);
  const [galatModal, setGalatModal] = useState<string | null>(null);

  const [form, setForm] = useState({
    tanggal: dariAcuan.toISOString().split('T')[0],
    area: 'Gudang Utama Distribusi — Lorong A & B',
    petugas: 'Vendor PestCare Terkualifikasi & Petugas Sanitasi',
    metode: 'Perangkap Umpan' as LogPestControl['metode'],
    hasilTemuan: 'Bebas Hama' as LogPestControl['hasilTemuan'],
    tindakan: 'Penggantian umpan berkala dan pembersihan palet plastik bawah.'
  });

  const daftarTampil =
    filterTemuan === 'Semua' ? pestList : pestList.filter((p) => p.hasilTemuan === filterTemuan);

  const simpanInspeksi = (e: React.FormEvent) => {
    e.preventDefault();
    const tindakanBersih = form.tindakan.trim();

    // Penjaga §1 Tab 5: Temuan "Ditemukan Indikasi" / "Perlu Penanganan Khusus" wajib punya tindakan sanitasi nyata
    if (
      (form.hasilTemuan === 'Ditemukan Indikasi' || form.hasilTemuan === 'Perlu Penanganan Khusus') &&
      (!tindakanBersih || tindakanBersih === '-' || tindakanBersih.length < 8)
    ) {
      setGalatModal(
        `Penjaga Sanitasi CDAKB menolak pencatatan: temuan "${form.hasilTemuan}" wajib disertai rincian tindakan sanitasi konkret (minimal 8 karakter, tidak boleh kosong atau "-").`
      );
      return;
    }

    const item: LogPestControl = {
      id: `PST-${Date.now()}`,
      tanggal: form.tanggal,
      area: form.area.trim(),
      petugas: form.petugas.trim(),
      metode: form.metode,
      hasilTemuan: form.hasilTemuan,
      tindakan: tindakanBersih || 'Pemeliharaan kebersihan berkala sesuai SOP sanitasi.'
    };

    db.catatInspeksiHama(item);
    setPestList(db.getPestControl());
    setModalTerbuka(false);
    setGalatModal(null);
    setPesan({
      tipe: 'sukses',
      teks: `Catatan inspeksi hama pada ${item.area} (${item.hasilTemuan}) tersimpan beserta jejak audit.`
    });
    onPerubahanData();
  };

  const temuanAktif = pestList.filter((p) => p.hasilTemuan !== 'Bebas Hama').length;

  return (
    <div className="space-y-5">
      {pesan && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{pesan.teks}</span>
          </div>
          <button type="button" onClick={() => setPesan(null)} className="text-2xs font-bold hover:underline cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat
          label="Total Inspeksi Sanitasi & Hama"
          value={pestList.length}
          hint="Rekam pemeriksaan area gudang & ruang bongkar muat"
          tone="amber"
        />
        <Stat
          label="Area Bebas Hama"
          value={pestList.filter((p) => p.hasilTemuan === 'Bebas Hama').length}
          hint="Memenuhi kriteria bangunan & higienitas CDAKB"
          tone="emerald"
        />
        <Stat
          label="Indikasi / Penanganan Khusus"
          value={temuanAktif}
          hint="Wajib mencantumkan tindakan korektif sanitasi"
          tone={temuanAktif > 0 ? 'rose' : 'slate'}
        />
      </div>

      <Panel
        judul="Log Pengendalian Hama & Sanitasi Ruang Gudang (Pest Control)"
        keterangan="Penjaga kepatuhan mewajibkan rencana tindakan sanitasi eksplisit setiap kali inspeksi mencatat Ditemukan Indikasi atau Perlu Penanganan Khusus."
        aksi={
          <>
            <div className="flex items-center gap-1 flex-wrap">
              {(['Semua', ...HASIL_TEMUAN] as const).map((opsi) => (
                <button
                  key={opsi}
                  type="button"
                  onClick={() => setFilterTemuan(opsi)}
                  className={chipFilter(filterTemuan === opsi)}
                >
                  {opsi}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setGalatModal(null);
                setModalTerbuka(true);
              }}
              className={tombolPrimerGudang}
            >
              <Plus className="w-4 h-4" />
              Catat Inspeksi Hama
            </button>
          </>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Tanggal Inspeksi</th>
                <th className="py-3 px-4">Area Pemeriksaan</th>
                <th className="py-3 px-4">Petugas / Vendor</th>
                <th className="py-3 px-4">Metode Pengendalian</th>
                <th className="py-3 px-4">Hasil Temuan</th>
                <th className="py-3 px-4">Tindakan Sanitasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarTampil.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono tabular-nums font-medium text-slate-800 whitespace-nowrap">
                    {p.tanggal}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{p.area}</td>
                  <td className="py-3 px-4 text-slate-600">{p.petugas}</td>
                  <td className="py-3 px-4 text-slate-700">{p.metode}</td>
                  <td className="py-3 px-4">
                    <Badge tone={toneTemuan(p.hasilTemuan)}>
                      <Bug className="w-3 h-3" />
                      {p.hasilTemuan}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600 leading-relaxed">{p.tindakan}</td>
                </tr>
              ))}
              {daftarTampil.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-slate-500">
                    Tidak ada catatan inspeksi untuk filter {filterTemuan}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {modalTerbuka && (
        <Modal
          judul="Catat Inspeksi Pengendalian Hama & Sanitasi"
          keterangan="Temuan indikasi serangga atau pengerat wajib diikuti tindakan sanitasi terukur sebelum catatan dapat disimpan."
          onClose={() => setModalTerbuka(false)}
        >
          <form onSubmit={simpanInspeksi} className="space-y-3 text-xs">
            {galatModal && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-900 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <span>{galatModal}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tanggal Inspeksi</label>
                <input
                  type="date"
                  required
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Metode Pengendalian</label>
                <select
                  value={form.metode}
                  onChange={(e) => setForm({ ...form, metode: e.target.value as LogPestControl['metode'] })}
                  className={inputClass}
                >
                  {METODE_HAMA.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Area Pemeriksaan Gudang</label>
              <input
                type="text"
                required
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Petugas / Vendor Pelaksana</label>
                <input
                  type="text"
                  required
                  value={form.petugas}
                  onChange={(e) => setForm({ ...form, petugas: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Hasil Temuan</label>
                <select
                  value={form.hasilTemuan}
                  onChange={(e) => {
                    const hasil = e.target.value as LogPestControl['hasilTemuan'];
                    setForm({
                      ...form,
                      hasilTemuan: hasil,
                      tindakan: hasil !== 'Bebas Hama' && form.tindakan.includes('Penggantian umpan berkala') ? '' : form.tindakan
                    });
                    setGalatModal(null);
                  }}
                  className={inputClass}
                >
                  {HASIL_TEMUAN.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Tindakan Sanitasi & Pencegahan {form.hasilTemuan !== 'Bebas Hama' ? '(Wajib Diisi)' : ''}
              </label>
              <textarea
                rows={3}
                value={form.tindakan}
                onChange={(e) => {
                  setForm({ ...form, tindakan: e.target.value });
                  setGalatModal(null);
                }}
                placeholder="Uraikan tindakan sanitasi, penyegelan celah, atau penggantian umpan..."
                className={inputClass}
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalTerbuka(false)} className={tombolSekunder}>
                Batal
              </button>
              <button type="submit" className={tombolPrimerGudang}>
                Simpan Inspeksi
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
