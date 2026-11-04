import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { KaryawanHRIS, LokasiKerja, RiwayatMutasi } from '../../../../types';
import { statusSertifikat, hitungSisaHari } from '../../../../utils/hris';
import {
  Building2,
  Users,
  Search,
  HeartPulse,
  Award,
  History,
  Layers,
  MapPin,
  Plus
} from 'lucide-react';
import {
  Badge,
  Panel,
  Stat,
  Modal,
  formatRupiah,
  formatTanggal,
  inputClass,
  labelClass,
  tombolPrimer,
  tombolSekunder,
  type Tone
} from './ui';

const LOKASI: LokasiKerja[] = ['Pabrik Manufaktur', 'Kantor Pusat', 'Gudang Distribusi'];

const IKON_LOKASI: Record<LokasiKerja, typeof Building2> = {
  'Pabrik Manufaktur': Building2,
  'Kantor Pusat': MapPin,
  'Gudang Distribusi': Layers
};

const toneSertifikat = (masaBerlaku: string): Tone => {
  const status = statusSertifikat(masaBerlaku);
  if (status === 'Kedaluwarsa') return 'rose';
  if (status === 'Perlu Perpanjangan (H-90)') return 'amber';
  return 'emerald';
};

const toneMedis = (status: KaryawanHRIS['statusRekamMedis']): Tone =>
  status === 'Fit to Work' ? 'emerald' : status === 'Fit with Restriction' ? 'amber' : 'rose';

export default function CoreHRModule() {
  const [karyawan, setKaryawan] = useState<KaryawanHRIS[]>(db.getKaryawanHRIS());
  const [mutasi, setMutasi] = useState<RiwayatMutasi[]>(db.getRiwayatMutasi());
  const [grading] = useState(db.getGradingJabatan());
  const [kataKunci, setKataKunci] = useState('');
  const [filterLokasi, setFilterLokasi] = useState<LokasiKerja | 'Semua'>('Semua');
  const [detail, setDetail] = useState<KaryawanHRIS | null>(null);
  const [tabDetail, setTabDetail] = useState<'induk' | 'medis' | 'mutasi'>('induk');
  const [modalMutasi, setModalMutasi] = useState(false);
  const [formMutasi, setFormMutasi] = useState({
    karyawanId: '',
    tanggalEfektif: new Date().toISOString().split('T')[0],
    jabatan: '',
    divisi: 'Manufacture',
    lokasi: 'Pabrik Manufaktur' as LokasiKerja,
    grade: 'ST2',
    alasanMutasi: ''
  });

  const daftarTampil = useMemo(() => {
    const kunci = kataKunci.trim().toLowerCase();
    return karyawan.filter((k) => {
      const cocokLokasi = filterLokasi === 'Semua' || k.lokasi === filterLokasi;
      const cocokKunci =
        !kunci ||
        [k.nama, k.nik, k.jabatan, k.divisi, k.grade].some((nilai) => nilai.toLowerCase().includes(kunci));
      return cocokLokasi && cocokKunci;
    });
  }, [karyawan, kataKunci, filterLokasi]);

  const sertifikatSiaga = useMemo(
    () =>
      karyawan.flatMap((k) =>
        k.sertifikasi
          .filter((s) => statusSertifikat(s.masaBerlaku) !== 'Aktif')
          .map((s) => ({ karyawan: k.nama, ...s }))
      ).sort((a, b) => hitungSisaHari(a.masaBerlaku) - hitungSisaHari(b.masaBerlaku)),
    [karyawan]
  );

  const simpanMutasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMutasi.karyawanId || !formMutasi.jabatan) return;
    const baru: RiwayatMutasi = {
      id: 'MUT-' + Date.now(),
      karyawanId: formMutasi.karyawanId,
      tanggalEfektif: formMutasi.tanggalEfektif,
      tanggalBerakhir: null,
      jabatan: formMutasi.jabatan,
      divisi: formMutasi.divisi,
      lokasi: formMutasi.lokasi,
      grade: formMutasi.grade,
      alasanMutasi: formMutasi.alasanMutasi || 'Mutasi internal'
    };
    db.catatMutasi(baru);
    setMutasi(db.getRiwayatMutasi());
    setKaryawan(db.getKaryawanHRIS());
    setModalMutasi(false);
  };

  const riwayatKaryawan = (id: string) =>
    mutasi
      .filter((m) => m.karyawanId === id)
      .sort((a, b) => b.tanggalEfektif.localeCompare(a.tanggalEfektif));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Personil Aktif" value={karyawan.length} hint="Master data karyawan 3 lokasi kerja" tone="blue" />
        <Stat
          label="Karyawan Tetap"
          value={karyawan.filter((k) => k.statusKaryawan === 'Tetap').length}
          hint={`PKWT ${karyawan.filter((k) => k.statusKaryawan === 'Kontrak (PKWT)').length} • Outsourcing ${karyawan.filter((k) => k.statusKaryawan === 'Outsourcing').length}`}
        />
        <Stat
          label="Sertifikat Perlu Tindak Lanjut"
          value={sertifikatSiaga.length}
          hint="Mendekati H-90 atau sudah kedaluwarsa"
          tone={sertifikatSiaga.length ? 'amber' : 'emerald'}
        />
        <Stat
          label="Rekam Medis Perlu Evaluasi"
          value={karyawan.filter((k) => k.statusRekamMedis !== 'Fit to Work').length}
          hint="Fit with Restriction / Perlu Evaluasi (MCU)"
          tone="rose"
        />
      </div>

      <Panel
        judul="Struktur Organisasi Multi-Site"
        keterangan="Pemisahan Pabrik Manufaktur (CPAKB), Kantor Pusat (CDAKB/Regulatory), dan Gudang Distribusi — klausul 5.1 ISO 13485 menuntut kejelasan tanggung jawab tiap lokasi."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {LOKASI.map((lokasi) => {
            const Ikon = IKON_LOKASI[lokasi];
            const personil = karyawan.filter((k) => k.lokasi === lokasi);
            const divisi = Array.from(new Set(personil.map((k) => k.divisi)));
            return (
              <div key={lokasi} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Ikon className="w-4 h-4 text-slate-500" />
                  <h4 className="text-xs font-bold text-slate-800">{lokasi}</h4>
                </div>
                <p className="text-[10px] text-slate-500 mb-3">{personil.length} personil • {divisi.length} divisi</p>
                <div className="space-y-2">
                  {divisi.map((d) => (
                    <div key={d} className="bg-white rounded-lg border border-slate-200 p-2.5">
                      <div className="text-[11px] font-bold text-blue-800">{d}</div>
                      <ul className="mt-1 space-y-0.5">
                        {personil
                          .filter((p) => p.divisi === d)
                          .map((p) => (
                            <li key={p.id} className="text-[10px] text-slate-600 leading-snug">
                              <button
                                type="button"
                                onClick={() => { setDetail(p); setTabDetail('induk'); }}
                                className="font-semibold text-slate-800 hover:text-blue-700 cursor-pointer"
                              >
                                {p.nama}
                              </button>
                              <span className="text-slate-500"> — {p.jabatan} ({p.grade})</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel
        judul="Master Data Karyawan"
        keterangan="Data induk personil termasuk rekam medis kerja dan daftar sertifikasi wajib beserta masa berlakunya."
        aksi={
          <button type="button" className={tombolPrimer} onClick={() => setModalMutasi(true)}>
            <Plus className="w-4 h-4" />
            Catat Mutasi
          </button>
        }
      >
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Cari nama, NIK, jabatan, divisi, atau grade..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            {(['Semua', ...LOKASI] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setFilterLokasi(l)}
                className={`px-3 py-2 rounded-lg border font-semibold cursor-pointer transition-colors ${
                  filterLokasi === l
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">NIK / Nama</th>
                <th className="py-3 px-4">Jabatan & Divisi</th>
                <th className="py-3 px-4">Lokasi & Grade</th>
                <th className="py-3 px-4">Status Kerja</th>
                <th className="py-3 px-4">Rekam Medis Kerja</th>
                <th className="py-3 px-4">Sertifikasi</th>
                <th className="py-3 px-4 text-right">Gaji Pokok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarTampil.map((k) => (
                <tr
                  key={k.id}
                  onClick={() => { setDetail(k); setTabDetail('induk'); }}
                  className="hover:bg-slate-50 cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{k.nama}</div>
                    <div className="text-[10px] font-mono text-slate-500">{k.nik}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <div>{k.jabatan}</div>
                    <div className="text-[10px] text-slate-500">{k.divisi}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <div>{k.lokasi}</div>
                    <div className="text-[10px] text-slate-500">Grade {k.grade}</div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone={k.statusKaryawan === 'Tetap' ? 'blue' : 'slate'}>{k.statusKaryawan}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone={toneMedis(k.statusRekamMedis)}>
                      <HeartPulse className="w-3 h-3" />
                      {k.statusRekamMedis}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {k.sertifikasi.slice(0, 2).map((s) => (
                        <Badge key={s.nomor} tone={toneSertifikat(s.masaBerlaku)}>
                          <Award className="w-3 h-3" />
                          {s.nama}
                        </Badge>
                      ))}
                      {k.sertifikasi.length > 2 && <Badge tone="slate">+{k.sertifikasi.length - 2} lainnya</Badge>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">{formatRupiah(k.gajiPokok)}</td>
                </tr>
              ))}
              {daftarTampil.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 px-4 text-center text-slate-500">
                    Tidak ada karyawan yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {sertifikatSiaga.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="text-[11px] font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Peringatan masa berlaku sertifikasi (ambang H-90)
            </div>
            <ul className="text-[11px] text-amber-900 space-y-0.5">
              {sertifikatSiaga.map((s) => (
                <li key={`${s.karyawan}-${s.nomor}`}>
                  <strong>{s.karyawan}</strong> — {s.nama} ({s.nomor}) berlaku sampai {formatTanggal(s.masaBerlaku)} •{' '}
                  {hitungSisaHari(s.masaBerlaku) < 0
                    ? `kedaluwarsa ${Math.abs(hitungSisaHari(s.masaBerlaku))} hari`
                    : `sisa ${hitungSisaHari(s.masaBerlaku)} hari`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      <Panel
        judul="Job Description & Grading Jabatan"
        keterangan="Rentang gaji per grade menjadi dasar perhitungan upah sejam (1/173) pada modul lembur dan payroll."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {grading.map((g) => (
            <div key={g.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-700 text-white text-[10px] font-bold">{g.kodeGrade}</span>
                  <h4 className="text-xs font-bold text-slate-900">{g.namaGrade}</h4>
                </div>
                <span className="text-[10px] font-mono text-slate-600">
                  {formatRupiah(g.rentangGajiMin)} – {formatRupiah(g.rentangGajiMax)}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed mb-2">{g.uraianTugasRingkas}</p>
              <div className="text-[10px] text-slate-500">
                Contoh jabatan: {g.contohJabatan.join(' • ')} — terisi {karyawan.filter((k) => k.grade === g.kodeGrade).length} personil
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {detail && (
        <Modal judul={detail.nama} keterangan={`${detail.jabatan} — ${detail.divisi} (${detail.lokasi})`} onClose={() => setDetail(null)}>
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs mb-4">
            {([
              ['induk', 'Data Induk', Users],
              ['medis', 'Rekam Medis & Sertifikasi', HeartPulse],
              ['mutasi', 'Riwayat Mutasi', History]
            ] as const).map(([id, label, Ikon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTabDetail(id)}
                className={`pb-2.5 px-3 font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                  tabDetail === id
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Ikon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {tabDetail === 'induk' && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              {[
                ['NIK Karyawan', detail.nik],
                ['Grade Jabatan', `Grade ${detail.grade}`],
                ['Status Karyawan', detail.statusKaryawan],
                ['Tanggal Bergabung', formatTanggal(detail.tanggalBergabung)],
                ['Tanggal Lahir', formatTanggal(detail.tanggalLahir)],
                ['Lokasi Kerja', detail.lokasi],
                ['Divisi', detail.divisi],
                ['Gaji Pokok', formatRupiah(detail.gajiPokok)]
              ].map(([label, nilai]) => (
                <div key={label}>
                  <dt className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
                  <dd className="text-slate-800 font-semibold mt-0.5">{nilai}</dd>
                </div>
              ))}
            </dl>
          )}

          {tabDetail === 'medis' && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Status Rekam Medis Kerja</div>
                <div className="mt-1">
                  <Badge tone={toneMedis(detail.statusRekamMedis)}>
                    <HeartPulse className="w-3 h-3" />
                    {detail.statusRekamMedis}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  Rekam medis disimpan terpisah dari data personil umum dan hanya dapat diakses dokter perusahaan (modul HSE/K3),
                  sesuai prinsip kerahasiaan data kesehatan karyawan.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2 px-3">Sertifikasi / Lisensi</th>
                      <th className="py-2 px-3">Nomor</th>
                      <th className="py-2 px-3">Masa Berlaku</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detail.sertifikasi.map((s) => (
                      <tr key={s.nomor}>
                        <td className="py-2 px-3 font-semibold text-slate-800">{s.nama}</td>
                        <td className="py-2 px-3 font-mono text-blue-800">{s.nomor}</td>
                        <td className="py-2 px-3 font-mono text-slate-700">{formatTanggal(s.masaBerlaku)}</td>
                        <td className="py-2 px-3">
                          <Badge tone={toneSertifikat(s.masaBerlaku)}>
                            {statusSertifikat(s.masaBerlaku)} • sisa {hitungSisaHari(s.masaBerlaku)} hari
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tabDetail === 'mutasi' && (
            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Riwayat disimpan sebagai tabel temporal (system-versioned): setiap baris punya tanggal efektif dan tanggal berakhir,
                baris aktif ditandai <code className="font-mono text-slate-700">tanggalBerakhir = null</code>.
              </p>
              <ol className="relative border-l border-slate-200 pl-4 space-y-3">
                {riwayatKaryawan(detail.id).map((m) => (
                  <li key={m.id} className="relative">
                    <span
                      className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        m.tanggalBerakhir === null ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    />
                    <div className="text-xs font-bold text-slate-900">{m.jabatan}</div>
                    <div className="text-[11px] text-slate-600">
                      {m.divisi} • {m.lokasi} • Grade {m.grade}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      {formatTanggal(m.tanggalEfektif)} — {m.tanggalBerakhir === null ? 'sekarang (baris aktif)' : formatTanggal(m.tanggalBerakhir)}
                    </div>
                    <div className="text-[11px] text-slate-700 mt-1">{m.alasanMutasi}</div>
                    {m.tanggalBerakhir === null && (
                      <div className="mt-1">
                        <Badge tone="blue">Baris Aktif</Badge>
                      </div>
                    )}
                  </li>
                ))}
                {riwayatKaryawan(detail.id).length === 0 && (
                  <li className="text-xs text-slate-500">Belum ada riwayat mutasi tercatat untuk karyawan ini.</li>
                )}
              </ol>
            </div>
          )}
        </Modal>
      )}

      {modalMutasi && (
        <Modal
          judul="Catat Mutasi Jabatan / Divisi"
          keterangan="Baris mutasi aktif sebelumnya akan ditutup otomatis pada H-1 tanggal efektif (pola tabel temporal)."
          onClose={() => setModalMutasi(false)}
        >
          <form onSubmit={simpanMutasi} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Karyawan</label>
                <select
                  required
                  className={inputClass}
                  value={formMutasi.karyawanId}
                  onChange={(e) => setFormMutasi({ ...formMutasi, karyawanId: e.target.value })}
                >
                  <option value="">— Pilih karyawan —</option>
                  {karyawan.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama} ({k.nik})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tanggal Efektif</label>
                <input
                  type="date"
                  required
                  className={inputClass}
                  value={formMutasi.tanggalEfektif}
                  onChange={(e) => setFormMutasi({ ...formMutasi, tanggalEfektif: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Jabatan Baru</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Contoh: Supervisor Produksi"
                  value={formMutasi.jabatan}
                  onChange={(e) => setFormMutasi({ ...formMutasi, jabatan: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Divisi</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  value={formMutasi.divisi}
                  onChange={(e) => setFormMutasi({ ...formMutasi, divisi: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Lokasi Kerja</label>
                <select
                  className={inputClass}
                  value={formMutasi.lokasi}
                  onChange={(e) => setFormMutasi({ ...formMutasi, lokasi: e.target.value as LokasiKerja })}
                >
                  {LOKASI.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Grade</label>
                <select
                  className={inputClass}
                  value={formMutasi.grade}
                  onChange={(e) => setFormMutasi({ ...formMutasi, grade: e.target.value })}
                >
                  {grading.map((g) => (
                    <option key={g.id} value={g.kodeGrade}>{g.kodeGrade} — {g.namaGrade}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <p className="text-[10px] text-slate-500 leading-snug">
                  Grade menentukan rentang gaji &amp; upah sejam lembur.
                </p>
              </div>
            </div>
            <div>
              <label className={labelClass}>Alasan Mutasi</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Contoh: Promosi berdasarkan hasil CPM Semester I 2026"
                value={formMutasi.alasanMutasi}
                onChange={(e) => setFormMutasi({ ...formMutasi, alasanMutasi: e.target.value })}
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setModalMutasi(false)}>Batal</button>
              <button type="submit" className={tombolPrimer}>Simpan Mutasi</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
