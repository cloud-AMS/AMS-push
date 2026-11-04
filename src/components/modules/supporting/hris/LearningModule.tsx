import { useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { PelatihanPersonil, SkillMatrix } from '../../../../types';
import { statusSertifikat, hitungSisaHari } from '../../../../utils/hris';
import {
  GraduationCap,
  CheckCircle2,
  Plus,
  FileBadge,
  Grid3x3,
  BellRing,
  Award,
  BookOpenCheck
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

const toneLevel = (level: SkillMatrix['level']): Tone =>
  level === 'Trainer' ? 'emerald' : level === 'Mahir' ? 'blue' : level === 'Operator' ? 'slate' : 'amber';

const toneSertifikat = (masaBerlaku: string): Tone => {
  const status = statusSertifikat(masaBerlaku);
  if (status === 'Kedaluwarsa') return 'rose';
  if (status === 'Perlu Perpanjangan (H-90)') return 'amber';
  return 'emerald';
};

const PELATIHAN_WAJIB = [
  { nama: 'CDAKB Permenkes 4/2014 & GDPMD', sasaran: 'Seluruh personil distribusi & gudang', frekuensi: 'Tahunan', dasar: 'Bab II CDAKB (Personalia)' },
  { nama: 'CPAKB Permenkes 20/2017', sasaran: 'Operator produksi & QC', frekuensi: 'Tahunan', dasar: 'Klausul 6.2 ISO 13485' },
  { nama: 'ISO 13485:2016 Awareness & Internal Audit', sasaran: 'QA, RA, Kepala Divisi', frekuensi: '2 tahun', dasar: 'Klausul 8.2.2 Audit Internal' },
  { nama: 'K3 & Higiene Medis (termasuk APD)', sasaran: 'Seluruh karyawan pabrik & gudang', frekuensi: 'Tahunan', dasar: 'UU 1/1970 & PP 50/2012' },
  { nama: 'Manajemen Suhu Dingin (Cold Chain)', sasaran: 'Tim logistik reagen IVD', frekuensi: 'Tahunan', dasar: 'Persyaratan penyimpanan prinsipal' }
];

export default function LearningModule() {
  const [subTab, setSubTab] = useState<'pelatihan' | 'skill' | 'sertifikasi' | 'peringatan'>('pelatihan');
  const [pelatihanList, setPelatihanList] = useState<PelatihanPersonil[]>(db.getPelatihan());
  const [pegawaiList] = useState(db.getSertifikasiPegawai());
  const [skillList, setSkillList] = useState<SkillMatrix[]>(db.getSkillMatrix());
  const [karyawan] = useState(db.getKaryawanHRIS());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSkill, setModalSkill] = useState(false);

  const [formData, setFormData] = useState<Partial<PelatihanPersonil>>({
    judulPelatihan: '',
    standarRegulasi: 'CDAKB Permenkes 4/2014',
    tanggalPelaksanaan: new Date().toISOString().split('T')[0],
    instruktur: 'apt. Dewi Kartika, S.Si (PJT)',
    jumlahPeserta: 10,
    statusEvaluasi: 'Tuntas & Bersertifikat',
    skorKelulusanRataRata: 90
  });

  const [formSkill, setFormSkill] = useState({
    karyawanId: '',
    mesinAtauProses: '',
    level: 'Operator' as SkillMatrix['level'],
    tanggalPenilaian: new Date().toISOString().split('T')[0],
    penilai: 'Ir. Agus Santoso'
  });

  const sertifikatSiaga = karyawan
    .flatMap((k) => k.sertifikasi.map((s) => ({ karyawan: k.nama, jabatan: k.jabatan, divisi: k.divisi, ...s })))
    .map((s) => ({ ...s, status: statusSertifikat(s.masaBerlaku), sisaHari: hitungSisaHari(s.masaBerlaku) }))
    .filter((s) => s.status !== 'Aktif')
    .sort((a, b) => a.sisaHari - b.sisaHari);

  const handleSaveTraining = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judulPelatihan) return;

    const newItem: PelatihanPersonil = {
      id: 'TRN-' + Date.now(),
      judulPelatihan: formData.judulPelatihan || '',
      standarRegulasi: formData.standarRegulasi as PelatihanPersonil['standarRegulasi'],
      tanggalPelaksanaan: formData.tanggalPelaksanaan || new Date().toISOString().split('T')[0],
      instruktur: formData.instruktur || 'Instruktur',
      peserta: ['Staf Teknis & Operasional'],
      jumlahPeserta: Number(formData.jumlahPeserta) || 5,
      statusEvaluasi: formData.statusEvaluasi as PelatihanPersonil['statusEvaluasi'],
      skorKelulusanRataRata: Number(formData.skorKelulusanRataRata) || 85
    };

    db.addPelatihan(newItem);
    db.logAudit('HRIS — Learning & Competency', 'Penjadwalan pelatihan wajib karyawan', newItem.id);
    setPelatihanList(db.getPelatihan());
    setIsModalOpen(false);
  };

  const simpanSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const karyawanDipilih = karyawan.find((k) => k.id === formSkill.karyawanId);
    if (!karyawanDipilih || !formSkill.mesinAtauProses) return;
    const baru: SkillMatrix = {
      id: 'SKL-' + Date.now(),
      karyawanId: karyawanDipilih.id,
      nama: karyawanDipilih.nama,
      mesinAtauProses: formSkill.mesinAtauProses,
      level: formSkill.level,
      tanggalPenilaian: formSkill.tanggalPenilaian,
      penilai: formSkill.penilai
    };
    db.addSkillMatrix(baru);
    setSkillList(db.getSkillMatrix());
    setModalSkill(false);
    setFormSkill({ ...formSkill, mesinAtauProses: '' });
  };

  const SUB_TABS = [
    { id: 'pelatihan', label: 'Pelatihan Wajib Karyawan', ikon: GraduationCap, jumlah: pelatihanList.length },
    { id: 'skill', label: 'Skill Matrix Kompetensi', ikon: Grid3x3, jumlah: skillList.length },
    { id: 'sertifikasi', label: 'Matriks Kompetensi & STR Pegawai', ikon: FileBadge, jumlah: pegawaiList.length },
    { id: 'peringatan', label: 'Peringatan Masa Berlaku Sertifikat', ikon: BellRing, jumlah: sertifikatSiaga.length }
  ] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Pelatihan Tuntas"
          value={pelatihanList.filter((p) => p.statusEvaluasi === 'Tuntas & Bersertifikat').length}
          hint={`Dari ${pelatihanList.length} program terjadwal`}
          tone="emerald"
        />
        <Stat
          label="Rata-rata Skor Kelulusan"
          value={Math.round(
            pelatihanList.filter((p) => p.skorKelulusanRataRata > 0).reduce((t, p) => t + p.skorKelulusanRataRata, 0) /
              Math.max(pelatihanList.filter((p) => p.skorKelulusanRataRata > 0).length, 1)
          )}
          hint="Ambang kelulusan pelatihan regulasi 80/100"
        />
        <Stat
          label="Entri Skill Matrix"
          value={skillList.length}
          hint={`${new Set(skillList.map((s) => s.mesinAtauProses)).size} proses/mesin dinilai • ${skillList.filter((s) => s.level === 'Trainer').length} trainer internal`}
          tone="blue"
        />
        <Stat
          label="Sertifikat Perlu Tindak Lanjut"
          value={sertifikatSiaga.length}
          hint="Ambang peringatan H-90 sebelum masa berlaku berakhir"
          tone={sertifikatSiaga.length ? 'amber' : 'emerald'}
        />
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 text-xs overflow-x-auto">
        {SUB_TABS.map((t) => {
          const Ikon = t.ikon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                subTab === t.id
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Ikon className="w-4 h-4" />
              {t.label} ({t.jumlah})
            </button>
          );
        })}
      </div>

      {subTab === 'pelatihan' && (
        <div className="space-y-4">
          <Panel
            judul="Matriks Pelatihan Wajib Industri Alkes"
            keterangan="Pelatihan yang dipersyaratkan CDAKB, CPAKB, ISO 13485, dan K3 beserta sasaran personil dan frekuensi minimum."
            aksi={
              <button type="button" className={tombolPrimer} onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Jadwalkan Pelatihan Regulasi
              </button>
            }
          >
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4">Program Wajib</th>
                    <th className="py-3 px-4">Sasaran Personil</th>
                    <th className="py-3 px-4">Frekuensi</th>
                    <th className="py-3 px-4">Dasar Regulasi / Klausul</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PELATIHAN_WAJIB.map((p) => (
                    <tr key={p.nama} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1.5">
                          <BookOpenCheck className="w-3.5 h-3.5 text-slate-500" />
                          {p.nama}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{p.sasaran}</td>
                      <td className="py-3 px-4"><Badge tone="blue">{p.frekuensi}</Badge></td>
                      <td className="py-3 px-4 text-[11px] text-slate-600">{p.dasar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pelatihanList.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      {p.standarRegulasi}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {p.statusEvaluasi}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1">{p.judulPelatihan}</h4>
                  <p className="text-xs text-slate-500 mb-3">Instruktur: {p.instruktur}</p>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="text-slate-600">Peserta: <strong>{p.jumlahPeserta} Karyawan</strong></div>
                    <div className="text-slate-600">Rata-rata Skor: <strong className="text-blue-700">{p.skorKelulusanRataRata}/100</strong></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Tanggal: <strong>{p.tanggalPelaksanaan}</strong></span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sertifikat Terbit
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'skill' && (
        <Panel
          judul="Skill Matrix per Proses & Mesin"
          keterangan="Penilaian kompetensi teknis per karyawan untuk tiap proses kritis; level Trainer menandakan personil berhak melatih dan menandatangani BMR."
          aksi={
            <button type="button" className={tombolPrimer} onClick={() => setModalSkill(true)}>
              <Plus className="w-4 h-4" />
              Tambah Penilaian
            </button>
          }
        >
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-4">Karyawan</th>
                  <th className="py-3 px-4">Mesin / Proses</th>
                  <th className="py-3 px-4">Level Kompetensi</th>
                  <th className="py-3 px-4">Tanggal Penilaian</th>
                  <th className="py-3 px-4">Penilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {skillList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{s.nama}</td>
                    <td className="py-3 px-4 text-slate-700">{s.mesinAtauProses}</td>
                    <td className="py-3 px-4"><Badge tone={toneLevel(s.level)}>{s.level}</Badge></td>
                    <td className="py-3 px-4 font-mono text-slate-700">{formatTanggal(s.tanggalPenilaian)}</td>
                    <td className="py-3 px-4 text-slate-600">{s.penilai}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['Trainee', 'Operator', 'Mahir', 'Trainer'] as const).map((level) => (
              <div key={level} className="rounded-xl border border-slate-200 p-3">
                <Badge tone={toneLevel(level)}>{level}</Badge>
                <div className="text-lg font-bold text-slate-900 mt-1">{skillList.filter((s) => s.level === level).length}</div>
                <div className="text-[10px] text-slate-500">entri penilaian</div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {subTab === 'sertifikasi' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Nama Personil</th>
                <th className="py-3 px-4">Jabatan & Divisi</th>
                <th className="py-3 px-4">Nomor STR / Surat Izin Profesi</th>
                <th className="py-3 px-4">Sertifikasi CDAKB</th>
                <th className="py-3 px-4">Sertifikasi ISO 13485</th>
                <th className="py-3 px-4">Masa Berlaku STR/Sertifikat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pegawaiList.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{emp.namaKaryawan}</td>
                  <td className="py-3 px-4 text-slate-700">
                    <div>{emp.jabatan}</div>
                    <div className="text-[10px] text-slate-500">{emp.divisi}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-800 font-semibold">
                    {emp.nomorSIP_STR || 'Kompetensi Teknis Internal'}
                  </td>
                  <td className="py-3 px-4">
                    {emp.sertifikasiCDAKB ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Bersertifikat
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {emp.sertifikasiISO13485 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Bersertifikat
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {emp.tanggalMasaBerlakuSertifikat}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'peringatan' && (
        <Panel
          judul="Peringatan Otomatis Masa Berlaku Sertifikat (H-90)"
          keterangan="Sistem memberi peringatan 90 hari sebelum masa berlaku STR/SIP atau sertifikat kompetensi berakhir, dan menandai status kedaluwarsa sebagai temuan audit."
        >
          {sertifikatSiaga.length === 0 ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Seluruh sertifikat personil masih berlaku lebih dari 90 hari.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4">Personil</th>
                    <th className="py-3 px-4">Sertifikasi / Lisensi</th>
                    <th className="py-3 px-4">Nomor</th>
                    <th className="py-3 px-4">Masa Berlaku</th>
                    <th className="py-3 px-4">Sisa Hari</th>
                    <th className="py-3 px-4">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sertifikatSiaga.map((s) => (
                    <tr key={`${s.karyawan}-${s.nomor}`} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.karyawan}</div>
                        <div className="text-[10px] text-slate-500">{s.jabatan} • {s.divisi}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="inline-flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-slate-500" />
                          {s.nama}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-800">{s.nomor}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{formatTanggal(s.masaBerlaku)}</td>
                      <td className="py-3 px-4">
                        <Badge tone={toneSertifikat(s.masaBerlaku)}>
                          <BellRing className="w-3 h-3" />
                          {s.sisaHari < 0 ? `Lewat ${Math.abs(s.sisaHari)} hari` : `${s.sisaHari} hari`}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600">
                        {s.status === 'Kedaluwarsa'
                          ? 'Bekukan otorisasi teknis & jadwalkan sertifikasi ulang segera'
                          : 'Ajukan perpanjangan ke lembaga penerbit sebelum H-30'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {isModalOpen && (
        <Modal
          judul="Jadwalkan Pelatihan Wajib Karyawan"
          keterangan="Kepatuhan audit Kemenkes mempersyaratkan pencatatan berkala pelatihan CDAKB & ISO 13485."
          onClose={() => setIsModalOpen(false)}
        >
          <form onSubmit={handleSaveTraining} className="space-y-3 text-xs">
            <div>
              <label className={labelClass}>Judul / Materi Pelatihan</label>
              <input
                type="text"
                required
                value={formData.judulPelatihan}
                onChange={(e) => setFormData({ ...formData, judulPelatihan: e.target.value })}
                placeholder="Contoh: Penerapan GDPMD / CDAKB Bagi Tenaga Teknis"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Standar Regulasi</label>
                <select
                  value={formData.standarRegulasi}
                  onChange={(e) => setFormData({ ...formData, standarRegulasi: e.target.value as PelatihanPersonil['standarRegulasi'] })}
                  className={`${inputClass} bg-white`}
                >
                  <option value="CDAKB Permenkes 4/2014">CDAKB Permenkes 4/2014</option>
                  <option value="CPAKB Permenkes 20/2017">CPAKB Permenkes 20/2017</option>
                  <option value="ISO 13485:2016">ISO 13485:2016</option>
                  <option value="K3 & Higiene Medis">K3 & Higiene Medis</option>
                  <option value="Manajemen Suhu Dingin">Manajemen Suhu Dingin</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Tanggal Pelaksanaan</label>
                <input
                  type="date"
                  value={formData.tanggalPelaksanaan}
                  onChange={(e) => setFormData({ ...formData, tanggalPelaksanaan: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Instruktur / Pemateri</label>
                <input
                  type="text"
                  value={formData.instruktur}
                  onChange={(e) => setFormData({ ...formData, instruktur: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Jumlah Peserta</label>
                <input
                  type="number"
                  min={1}
                  value={formData.jumlahPeserta}
                  onChange={(e) => setFormData({ ...formData, jumlahPeserta: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setIsModalOpen(false)}>
                Batal
              </button>
              <button type="submit" className={tombolPrimer}>
                Simpan Jadwal Pelatihan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalSkill && (
        <Modal
          judul="Tambah Penilaian Skill Matrix"
          keterangan="Penilaian dilakukan oleh atasan langsung atau trainer bersertifikat dan menjadi dasar rotasi kerja serta rencana pelatihan."
          onClose={() => setModalSkill(false)}
        >
          <form onSubmit={simpanSkill} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Karyawan</label>
                <select
                  required
                  className={inputClass}
                  value={formSkill.karyawanId}
                  onChange={(e) => setFormSkill({ ...formSkill, karyawanId: e.target.value })}
                >
                  <option value="">— Pilih karyawan —</option>
                  {karyawan.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Level Kompetensi</label>
                <select
                  className={inputClass}
                  value={formSkill.level}
                  onChange={(e) => setFormSkill({ ...formSkill, level: e.target.value as SkillMatrix['level'] })}
                >
                  <option value="Trainee">Trainee</option>
                  <option value="Operator">Operator</option>
                  <option value="Mahir">Mahir</option>
                  <option value="Trainer">Trainer</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Mesin / Proses yang Dinilai</label>
              <input
                type="text"
                required
                className={inputClass}
                placeholder="Contoh: Perakitan Syringe Pump AMS-SP500 (Lini 2)"
                value={formSkill.mesinAtauProses}
                onChange={(e) => setFormSkill({ ...formSkill, mesinAtauProses: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tanggal Penilaian</label>
                <input
                  type="date"
                  className={inputClass}
                  value={formSkill.tanggalPenilaian}
                  onChange={(e) => setFormSkill({ ...formSkill, tanggalPenilaian: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Penilai</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formSkill.penilai}
                  onChange={(e) => setFormSkill({ ...formSkill, penilai: e.target.value })}
                />
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setModalSkill(false)}>Batal</button>
              <button type="submit" className={tombolPrimer}>Simpan Penilaian</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
