import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { KandidatATS } from '../../../../types';
import {
  UserSearch,
  FileSearch,
  ShieldCheck,
  ClipboardCheck,
  Plus,
  ArrowRight,
  KeyRound,
  ScrollText
} from 'lucide-react';
import {
  Badge,
  Panel,
  Stat,
  Modal,
  formatTanggal,
  inputClass,
  labelClass,
  tombolPrimer,
  tombolSekunder,
  type Tone
} from './ui';

const TAHAP: KandidatATS['tahap'][] = [
  'Skrining CV',
  'Tes Teknis',
  'Wawancara User',
  'Background Check',
  'Offering',
  'Onboarding',
  'Ditolak'
];

const KATA_KUNCI_WAJIB = ['CDAKB', 'ISO 13485', 'CPAKB', 'GDPMD', 'K3', 'STR', 'Kalibrasi', 'CAPA'];

const toneTahap = (tahap: KandidatATS['tahap']): Tone => {
  if (tahap === 'Ditolak') return 'rose';
  if (tahap === 'Onboarding' || tahap === 'Offering') return 'emerald';
  if (tahap === 'Background Check') return 'amber';
  return 'blue';
};

const toneLisensi = (status: 'Terverifikasi' | 'Menunggu' | 'Tidak Valid'): Tone =>
  status === 'Terverifikasi' ? 'emerald' : status === 'Menunggu' ? 'amber' : 'rose';

export default function RecruitmentModule() {
  const [kandidat, setKandidat] = useState<KandidatATS[]>(db.getKandidatATS());
  const [modalSkrining, setModalSkrining] = useState(false);
  const [detail, setDetail] = useState<KandidatATS | null>(null);
  const [form, setForm] = useState({
    nama: '',
    posisiDilamar: '',
    tanggalLamar: new Date().toISOString().split('T')[0],
    teksCv: '',
    kataKunci: KATA_KUNCI_WAJIB.join(', ')
  });

  const daftarKataKunci = useMemo(
    () => form.kataKunci.split(',').map((k) => k.trim()).filter(Boolean),
    [form.kataKunci]
  );

  const hasilSkrining = useMemo(() => {
    const teks = form.teksCv.toLowerCase();
    const terdeteksi = daftarKataKunci.filter((k) => teks.includes(k.toLowerCase()));
    const skor = daftarKataKunci.length ? Math.round((terdeteksi.length / daftarKataKunci.length) * 100) : 0;
    return { terdeteksi, tidakTerdeteksi: daftarKataKunci.filter((k) => !terdeteksi.includes(k)), skor };
  }, [form.teksCv, daftarKataKunci]);

  const simpanKandidat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.posisiDilamar || !form.teksCv) return;
    const baru: KandidatATS = {
      id: 'ATS-' + Date.now(),
      nama: form.nama,
      posisiDilamar: form.posisiDilamar,
      tahap: 'Skrining CV',
      skorKataKunci: hasilSkrining.skor,
      kataKunciTerdeteksi: hasilSkrining.terdeteksi,
      verifikasiLisensi: [],
      checklistOnboarding: [
        { item: 'Penandatanganan Pakta Integritas & Kerahasiaan Data', selesai: false },
        { item: 'Dokumen higiene & sanitasi (food/medical grade)', selesai: false },
        { item: 'Pemeriksaan MCU pra-kerja', selesai: false },
        { item: 'Pelatihan wajib CDAKB / K3 angkatan berikutnya', selesai: false },
        { item: 'Penerbitan NIK, ID card & APD', selesai: false }
      ],
      tanggalLamar: form.tanggalLamar
    };
    db.addKandidatATS(baru);
    setKandidat(db.getKandidatATS());
    setModalSkrining(false);
    setForm({ ...form, nama: '', posisiDilamar: '', teksCv: '' });
  };

  const pindahTahap = (id: string, tahap: KandidatATS['tahap']) => {
    const diperbarui = kandidat.map((k) => (k.id === id ? { ...k, tahap } : k));
    db.saveKandidatATS(diperbarui);
    setKandidat(diperbarui);
    if (detail?.id === id) setDetail(diperbarui.find((k) => k.id === id) || null);
  };

  const toggleOnboarding = (id: string, indeks: number) => {
    const diperbarui = kandidat.map((k) =>
      k.id === id
        ? {
            ...k,
            checklistOnboarding: k.checklistOnboarding.map((c, i) => (i === indeks ? { ...c, selesai: !c.selesai } : c))
          }
        : k
    );
    db.saveKandidatATS(diperbarui);
    setKandidat(diperbarui);
    if (detail?.id === id) setDetail(diperbarui.find((k) => k.id === id) || null);
  };

  const lisensiBelumVerifikasi = kandidat
    .flatMap((k) => k.verifikasiLisensi.filter((v) => v.status !== 'Terverifikasi').map((v) => ({ kandidat: k.nama, ...v })))
    .length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Kandidat Aktif" value={kandidat.filter((k) => k.tahap !== 'Ditolak').length} hint={`${kandidat.length} pelamar terdaftar di pipeline`} tone="blue" />
        <Stat
          label="Rata-rata Skor Kata Kunci"
          value={`${Math.round(kandidat.reduce((t, k) => t + k.skorKataKunci, 0) / Math.max(kandidat.length, 1))}%`}
          hint={`Ambang lolos skrining awal 70% dari ${KATA_KUNCI_WAJIB.length} kata kunci regulasi`}
          tone="emerald"
        />
        <Stat label="Lisensi Belum Terverifikasi" value={lisensiBelumVerifikasi} hint="STR/SIP wajib diverifikasi ke portal KKI sebelum offering" tone={lisensiBelumVerifikasi ? 'amber' : 'emerald'} />
        <Stat label="Siap Onboarding" value={kandidat.filter((k) => k.tahap === 'Onboarding').length} hint="Checklist pakta integritas & dokumen higiene" />
      </div>

      <Panel
        judul="Pipeline Rekrutmen (Applicant Tracking System)"
        keterangan="Tarik kartu antar tahap melalui menu tahap pada kartu kandidat. Kandidat dengan skor kata kunci di bawah 70% disarankan tidak lanjut ke tes teknis."
        aksi={
          <button type="button" className={tombolPrimer} onClick={() => setModalSkrining(true)}>
            <Plus className="w-4 h-4" />
            Skrining CV Baru
          </button>
        }
      >
        <div className="flex gap-3 overflow-x-auto pb-2">
          {TAHAP.map((tahap) => {
            const isi = kandidat.filter((k) => k.tahap === tahap);
            return (
              <div key={tahap} className="min-w-[240px] flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-bold text-slate-700">{tahap}</h4>
                  <Badge tone={toneTahap(tahap)}>{isi.length}</Badge>
                </div>
                <div className="space-y-2">
                  {isi.map((k) => (
                    <div key={k.id} className="bg-white rounded-lg border border-slate-200 p-2.5 shadow-xs">
                      <button type="button" className="text-left w-full cursor-pointer" onClick={() => setDetail(k)}>
                        <div className="text-xs font-bold text-slate-900">{k.nama}</div>
                        <div className="text-[10px] text-slate-500">{k.posisiDilamar}</div>
                      </button>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Badge tone={k.skorKataKunci >= 70 ? 'emerald' : k.skorKataKunci >= 50 ? 'amber' : 'rose'}>
                          <FileSearch className="w-3 h-3" />
                          Skor CV {k.skorKataKunci}%
                        </Badge>
                        <select
                          className="text-[10px] border border-slate-300 rounded px-1 py-0.5 bg-white cursor-pointer"
                          value={k.tahap}
                          onChange={(e) => pindahTahap(k.id, e.target.value as KandidatATS['tahap'])}
                        >
                          {TAHAP.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                  {isi.length === 0 && <div className="text-[10px] text-slate-400 italic">Tidak ada kandidat</div>}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel
        judul="Verifikasi Lisensi & Background Check"
        keterangan="Wajib untuk jabatan yang dipersyaratkan regulasi: PJT Apoteker (STRA), teknisi elektromedis (STRT), dokter perusahaan (STR & SIP)."
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Kandidat</th>
                <th className="py-3 px-4">Posisi Dilamar</th>
                <th className="py-3 px-4">Jenis Lisensi</th>
                <th className="py-3 px-4">Nomor</th>
                <th className="py-3 px-4">Status Verifikasi</th>
                <th className="py-3 px-4">Tahap Saat Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kandidat.flatMap((k) =>
                k.verifikasiLisensi.length === 0
                  ? [
                      <tr key={k.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{k.nama}</td>
                        <td className="py-3 px-4 text-slate-700">{k.posisiDilamar}</td>
                        <td colSpan={3} className="py-3 px-4 text-slate-400 text-[11px] italic">
                          Tidak ada lisensi wajib untuk posisi ini
                        </td>
                        <td className="py-3 px-4"><Badge tone={toneTahap(k.tahap)}>{k.tahap}</Badge></td>
                      </tr>
                    ]
                  : k.verifikasiLisensi.map((v, i) => (
                      <tr key={`${k.id}-${v.jenis}`} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">{i === 0 ? k.nama : ''}</td>
                        <td className="py-3 px-4 text-slate-700">{i === 0 ? k.posisiDilamar : ''}</td>
                        <td className="py-3 px-4 text-slate-700">
                          <span className="inline-flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                            {v.jenis}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-blue-800">{v.nomor}</td>
                        <td className="py-3 px-4">
                          <Badge tone={toneLisensi(v.status)}>
                            <ShieldCheck className="w-3 h-3" />
                            {v.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{i === 0 ? <Badge tone={toneTahap(k.tahap)}>{k.tahap}</Badge> : null}</td>
                      </tr>
                    ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {detail && (
        <Modal
          judul={detail.nama}
          keterangan={`${detail.posisiDilamar} • melamar ${formatTanggal(detail.tanggalLamar)} • tahap ${detail.tahap}`}
          onClose={() => setDetail(null)}
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5" />
                Hasil skrining kata kunci CV — skor {detail.skorKataKunci}%
              </div>
              <div className="flex flex-wrap gap-1">
                {detail.kataKunciTerdeteksi.map((k) => (
                  <Badge key={k} tone="emerald">{k}</Badge>
                ))}
                {detail.kataKunciTerdeteksi.length === 0 && (
                  <span className="text-[11px] text-slate-500 italic">Tidak ada kata kunci regulasi terdeteksi.</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <ClipboardCheck className="w-3.5 h-3.5" />
                Checklist onboarding digital
              </div>
              {detail.checklistOnboarding.length === 0 ? (
                <p className="text-[11px] text-slate-500 italic">Checklist dibuat otomatis setelah kandidat lolos skrining CV.</p>
              ) : (
                <ul className="space-y-1.5">
                  {detail.checklistOnboarding.map((c, i) => (
                    <li key={c.item}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={c.selesai}
                          onChange={() => toggleOnboarding(detail.id, i)}
                          className="w-3.5 h-3.5 rounded border-slate-300 cursor-pointer"
                        />
                        <span className={c.selesai ? 'text-slate-400 line-through' : 'text-slate-700'}>{c.item}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-[11px] text-blue-900 leading-relaxed flex gap-2">
              <ScrollText className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Dokumen wajib sebelum hari pertama: pakta integritas &amp; kerahasiaan data pasien, surat pernyataan higiene
                personel (CPAKB/CDAKB), salinan STR/SIP terverifikasi, dan hasil MCU pra-kerja.
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <span className="text-[11px] text-slate-500">Pindahkan tahap</span>
              <div className="flex items-center gap-2">
                <select
                  className={inputClass}
                  value={detail.tahap}
                  onChange={(e) => pindahTahap(detail.id, e.target.value as KandidatATS['tahap'])}
                >
                  {TAHAP.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button type="button" className={tombolSekunder} onClick={() => setDetail(null)}>Tutup</button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {modalSkrining && (
        <Modal
          judul="Skrining Kata Kunci CV"
          keterangan="Tempel isi CV, sistem menghitung persentase kata kunci regulasi alkes yang terdeteksi dan membuat kandidat baru pada tahap Skrining CV."
          onClose={() => setModalSkrining(false)}
        >
          <form onSubmit={simpanKandidat} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Nama Kandidat</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Posisi Dilamar</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Contoh: Staf QA / Dokumentasi Mutu"
                  value={form.posisiDilamar}
                  onChange={(e) => setForm({ ...form, posisiDilamar: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Daftar Kata Kunci (pisahkan dengan koma)</label>
              <input
                type="text"
                className={inputClass}
                value={form.kataKunci}
                onChange={(e) => setForm({ ...form, kataKunci: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Isi CV / Ringkasan Pengalaman</label>
              <textarea
                rows={5}
                required
                className={inputClass}
                placeholder="Contoh: 3 tahun sebagai staf QA di distributor alkes, terbiasa dokumen ISO 13485, pernah mengikuti audit CDAKB..."
                value={form.teksCv}
                onChange={(e) => setForm({ ...form, teksCv: e.target.value })}
              />
            </div>

            {form.teksCv && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-blue-900">Skor kata kunci: {hasilSkrining.skor}%</span>
                  <Badge tone={hasilSkrining.skor >= 70 ? 'emerald' : hasilSkrining.skor >= 50 ? 'amber' : 'rose'}>
                    {hasilSkrining.skor >= 70 ? 'Layak lanjut tes teknis' : 'Perlu review manual'}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {hasilSkrining.terdeteksi.map((k) => (
                    <Badge key={k} tone="emerald">{k}</Badge>
                  ))}
                  {hasilSkrining.tidakTerdeteksi.map((k) => (
                    <Badge key={k} tone="slate">{k} — tidak ditemukan</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setModalSkrining(false)}>Batal</button>
              <button type="submit" className={tombolPrimer}>
                <UserSearch className="w-4 h-4" />
                Simpan Kandidat <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
