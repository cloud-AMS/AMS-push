import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { DistribusiApd, InsidenK3, RekamMcu } from '../../../../types';
import { hitungSisaHari } from '../../../../utils/hris';
import {
  HardHat,
  AlertTriangle,
  Stethoscope,
  Shield,
  Plus,
  Activity,
  ClipboardList,
  CalendarClock
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

const toneRisiko = (tingkat: InsidenK3['tingkatRisiko']): Tone =>
  tingkat === 'Tinggi' ? 'rose' : tingkat === 'Sedang' ? 'amber' : 'slate';

const toneStatusInsiden = (status: InsidenK3['status']): Tone =>
  status === 'Ditutup' ? 'emerald' : status === 'CAPA Berjalan' ? 'blue' : 'amber';

const toneHasilMcu = (hasil: RekamMcu['hasil']): Tone =>
  hasil === 'Fit to Work' ? 'emerald' : hasil === 'Fit with Restriction' ? 'amber' : 'rose';

const JAM_KERJA_BULANAN = 8 * 22;

export default function HSEModule() {
  const [insiden, setInsiden] = useState<InsidenK3[]>(db.getInsidenK3());
  const [mcu] = useState<RekamMcu[]>(db.getRekamMcu());
  const [apd, setApd] = useState<DistribusiApd[]>(db.getDistribusiApd());
  const [karyawan] = useState(db.getKaryawanHRIS());
  const [modalInsiden, setModalInsiden] = useState(false);
  const [modalApd, setModalApd] = useState(false);

  const [formInsiden, setFormInsiden] = useState({
    area: '',
    jenis: 'Near Miss' as InsidenK3['jenis'],
    kronologi: '',
    tingkatRisiko: 'Sedang' as InsidenK3['tingkatRisiko'],
    tindakanKorektif: '',
    hariKehilangan: 0
  });

  const [formApd, setFormApd] = useState({
    karyawanId: '',
    jenisApd: '',
    standar: 'SNI / EN',
    jumlah: 1,
    kondisi: 'Baru' as DistribusiApd['kondisi']
  });

  const statistik = useMemo(() => {
    const jamKerjaTotal = karyawan.length * JAM_KERJA_BULANAN * 12;
    const hariKehilanganTotal = insiden.reduce((t, i) => t + i.hariKehilangan, 0);
    const ltifr = Math.round(((hariKehilanganTotal * 8 * 1000000) / Math.max(jamKerjaTotal, 1)) * 100) / 100;
    return {
      kecelakaan: insiden.filter((i) => i.jenis === 'Kecelakaan Kerja').length,
      nearMiss: insiden.filter((i) => i.jenis === 'Near Miss').length,
      pakj: insiden.filter((i) => i.jenis === 'Penyakit Akibat Kerja').length,
      hariKehilanganTotal,
      ltifr,
      openCapa: insiden.filter((i) => i.status !== 'Ditutup').length
    };
  }, [insiden, karyawan]);

  const simpanInsiden = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formInsiden.area || !formInsiden.kronologi) return;
    const nomor = `K3/AMS/${new Date().getFullYear()}/${String(db.getInsidenK3().length + 16).padStart(3, '0')}`;
    const baru: InsidenK3 = {
      id: 'K3-' + Date.now(),
      nomorLaporan: nomor,
      tanggal: new Date().toISOString().split('T')[0],
      area: formInsiden.area,
      jenis: formInsiden.jenis,
      kronologi: formInsiden.kronologi,
      tingkatRisiko: formInsiden.tingkatRisiko,
      tindakanKorektif: formInsiden.tindakanKorektif || 'Menunggu investigasi tim HSE/K3',
      status: 'Investigasi',
      hariKehilangan: Number(formInsiden.hariKehilangan) || 0
    };
    db.addInsidenK3(baru);
    setInsiden(db.getInsidenK3());
    setModalInsiden(false);
    setFormInsiden({ ...formInsiden, area: '', kronologi: '', tindakanKorektif: '', hariKehilangan: 0 });
  };

  const simpanApd = (e: React.FormEvent) => {
    e.preventDefault();
    const dipilih = karyawan.find((k) => k.id === formApd.karyawanId);
    if (!dipilih || !formApd.jenisApd) return;
    const baru: DistribusiApd = {
      id: 'APD-' + Date.now(),
      karyawanId: dipilih.id,
      nama: dipilih.nama,
      jenisApd: formApd.jenisApd,
      standar: formApd.standar,
      tanggalDistribusi: new Date().toISOString().split('T')[0],
      jumlah: Number(formApd.jumlah) || 1,
      kondisi: formApd.kondisi,
      tandaTerima: false
    };
    db.addDistribusiApd(baru);
    setApd(db.getDistribusiApd());
    setModalApd(false);
    setFormApd({ ...formApd, jenisApd: '' });
  };

  const tandaiTerima = (id: string) => {
    const diperbarui = apd.map((a) => (a.id === id ? { ...a, tandaTerima: true } : a));
    db.saveDistribusiApd(diperbarui);
    setApd(diperbarui);
  };

  const ubahStatusInsiden = (id: string, status: InsidenK3['status']) => {
    const diperbarui = insiden.map((i) => (i.id === id ? { ...i, status } : i));
    db.saveInsidenK3(diperbarui);
    setInsiden(diperbarui);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Insiden Tercatat"
          value={insiden.length}
          hint={`Kecelakaan ${statistik.kecelakaan} • Near Miss ${statistik.nearMiss} • PAK ${statistik.pakj}`}
          tone="blue"
        />
        <Stat
          label="Hari Kehilangan Kerja"
          value={`${statistik.hariKehilanganTotal} Hari`}
          hint={`LTIFR ${statistik.ltifr} per 1 juta jam kerja (dasar ${karyawan.length} personil × ${JAM_KERJA_BULANAN} jam/bulan selama 12 bulan; rasio belum representatif untuk sampel sekecil ini)`}
          tone={statistik.hariKehilanganTotal > 0 ? 'amber' : 'emerald'}
        />
        <Stat
          label="Insiden Belum Ditutup"
          value={statistik.openCapa}
          hint="Investigasi & CAPA wajib ditutup ≤ 30 hari"
          tone={statistik.openCapa ? 'amber' : 'emerald'}
        />
        <Stat
          label="MCU Perlu Tindak Lanjut"
          value={mcu.filter((m) => m.hasil !== 'Fit to Work').length}
          hint="Karyawan dengan paparan bahan kimia, bising, atau suhu dingin"
          tone="rose"
        />
      </div>

      <Panel
        judul="Pelaporan Kecelakaan & Near Miss (HSE/K3)"
        keterangan="Setiap laporan langsung masuk jejak audit trail dan menjadi dasar CAPA lintas fungsi; near miss wajib dilaporkan walau tanpa korban."
        aksi={
          <button type="button" className={tombolPrimer} onClick={() => setModalInsiden(true)}>
            <Plus className="w-4 h-4" />
            Lapor Insiden
          </button>
        }
      >
        <div className="space-y-3">
          {insiden.map((i) => (
            <div key={i.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-slate-500" />
                    <h4 className="text-xs font-bold text-slate-900">{i.nomorLaporan} — {i.jenis}</h4>
                    <Badge tone={toneRisiko(i.tingkatRisiko)}>Risiko {i.tingkatRisiko}</Badge>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">
                    {i.area} • {formatTanggal(i.tanggal)} •{' '}
                    {i.hariKehilangan > 0 ? `${i.hariKehilangan} hari kehilangan kerja` : 'tanpa hari kehilangan'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={toneStatusInsiden(i.status)}>{i.status}</Badge>
                  <select
                    className="text-[10px] border border-slate-300 rounded px-1.5 py-1 bg-white cursor-pointer"
                    value={i.status}
                    onChange={(e) => ubahStatusInsiden(i.id, e.target.value as InsidenK3['status'])}
                  >
                    <option value="Investigasi">Investigasi</option>
                    <option value="CAPA Berjalan">CAPA Berjalan</option>
                    <option value="Ditutup">Ditutup</option>
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed mt-2">{i.kronologi}</p>
              <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                  Tindakan korektif / preventif
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">{i.tindakanKorektif}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        judul="Rekam MCU Paparan Khusus (Chemical, Bising, Suhu Dingin, Cleanroom)"
        keterangan="Pemeriksaan kesehatan khusus sesuai jenis paparan kerja; hasilnya menentukan kelayakan penempatan pada area kritis."
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Jenis Pemeriksaan</th>
                <th className="py-3 px-4">Bentuk Paparan</th>
                <th className="py-3 px-4">Tanggal MCU</th>
                <th className="py-3 px-4">Hasil</th>
                <th className="py-3 px-4">Dokter Pemeriksa</th>
                <th className="py-3 px-4">MCU Berikutnya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mcu.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{m.nama}</td>
                  <td className="py-3 px-4 text-slate-700">
                    <span className="inline-flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
                      {m.jenisPemeriksaan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-600">{m.paparan}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{formatTanggal(m.tanggalMcu)}</td>
                  <td className="py-3 px-4">
                    <Badge tone={toneHasilMcu(m.hasil)}>{m.hasil}</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{m.dokterPemeriksa}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 font-mono text-slate-700">
                      <CalendarClock className="w-3.5 h-3.5 text-slate-500" />
                      {formatTanggal(m.jadwalBerikutnya)}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      sisa {hitungSisaHari(m.jadwalBerikutnya)} hari
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        judul="Distribusi & Pelacakan APD (Alat Pelindung Diri)"
        keterangan="Bukti distribusi APD beserta standar SNI/EN dan tanda terima karyawan — dokumen wajib saat inspeksi K3 dan audit ISO 13485 klausul 6.3."
        aksi={
          <button type="button" className={tombolPrimer} onClick={() => setModalApd(true)}>
            <Plus className="w-4 h-4" />
            Catat Distribusi APD
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {apd.map((a) => (
            <div key={a.id} className="rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-500" />
                    {a.jenisApd}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{a.nama}</div>
                </div>
                <Badge tone={a.tandaTerima ? 'emerald' : 'amber'}>
                  {a.tandaTerima ? 'Tanda Tangan Diterima' : 'Menunggu Tanda Tangan'}
                </Badge>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                <div>Standar: <strong className="text-slate-800">{a.standar}</strong></div>
                <div>Jumlah: <strong className="text-slate-800">{a.jumlah} unit</strong></div>
                <div>Tanggal: <strong className="font-mono text-slate-800">{formatTanggal(a.tanggalDistribusi)}</strong></div>
                <div>Kondisi: <strong className="text-slate-800">{a.kondisi}</strong></div>
              </div>
              {!a.tandaTerima && (
                <div className="mt-2 flex justify-end">
                  <button type="button" className={tombolSekunder} onClick={() => tandaiTerima(a.id)}>
                    <ClipboardList className="w-3.5 h-3.5 inline mr-1" />
                    Tandai Sudah Diterima
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {modalInsiden && (
        <Modal
          judul="Lapor Kecelakaan / Near Miss"
          keterangan="Laporan otomatis tercatat pada audit trail dan memicu investigasi tim HSE/K3 paling lambat 1×24 jam."
          onClose={() => setModalInsiden(false)}
        >
          <form onSubmit={simpanInsiden} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Area / Lokasi Kejadian</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Contoh: Lini Perakitan Syringe Pump"
                  value={formInsiden.area}
                  onChange={(e) => setFormInsiden({ ...formInsiden, area: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Jenis Kejadian</label>
                <select
                  className={inputClass}
                  value={formInsiden.jenis}
                  onChange={(e) => setFormInsiden({ ...formInsiden, jenis: e.target.value as InsidenK3['jenis'] })}
                >
                  <option value="Kecelakaan Kerja">Kecelakaan Kerja</option>
                  <option value="Near Miss">Near Miss</option>
                  <option value="Penyakit Akibat Kerja">Penyakit Akibat Kerja</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Tingkat Risiko</label>
                <select
                  className={inputClass}
                  value={formInsiden.tingkatRisiko}
                  onChange={(e) => setFormInsiden({ ...formInsiden, tingkatRisiko: e.target.value as InsidenK3['tingkatRisiko'] })}
                >
                  <option value="Tinggi">Tinggi</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Rendah">Rendah</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Hari Kehilangan Kerja</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={formInsiden.hariKehilangan}
                  onChange={(e) => setFormInsiden({ ...formInsiden, hariKehilangan: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-end">
                <p className="text-[10px] text-slate-500 leading-snug">
                  0 untuk near miss tanpa korban; dihitung untuk komponen LTIFR.
                </p>
              </div>
            </div>
            <div>
              <label className={labelClass}>Kronologi Kejadian</label>
              <textarea
                rows={3}
                required
                className={inputClass}
                placeholder="Jelaskan urutan kejadian, alat yang terlibat, dan kondisi tidak aman yang teramati."
                value={formInsiden.kronologi}
                onChange={(e) => setFormInsiden({ ...formInsiden, kronologi: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Tindakan Korektif Awal</label>
              <textarea
                rows={2}
                className={inputClass}
                placeholder="Contoh: LOTO diaktifkan, operator diamankan, area dipasangkan garis pembatas."
                value={formInsiden.tindakanKorektif}
                onChange={(e) => setFormInsiden({ ...formInsiden, tindakanKorektif: e.target.value })}
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setModalInsiden(false)}>Batal</button>
              <button type="submit" className={tombolPrimer}>
                <HardHat className="w-4 h-4" />
                Simpan Laporan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalApd && (
        <Modal
          judul="Catat Distribusi APD"
          keterangan="Pencatatan distribusi menjadi bukti pemenuhan kewajiban penyediaaan APD kepada pekerja sesuai PP 50/2012."
          onClose={() => setModalApd(false)}
        >
          <form onSubmit={simpanApd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Penerima</label>
                <select
                  required
                  className={inputClass}
                  value={formApd.karyawanId}
                  onChange={(e) => setFormApd({ ...formApd, karyawanId: e.target.value })}
                >
                  <option value="">— Pilih karyawan —</option>
                  {karyawan.map((k) => (
                    <option key={k.id} value={k.id}>{k.nama} — {k.divisi}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Jenis APD</label>
                <input
                  type="text"
                  required
                  className={inputClass}
                  placeholder="Contoh: Sarung Tangan Nitril (Cleanroom)"
                  value={formApd.jenisApd}
                  onChange={(e) => setFormApd({ ...formApd, jenisApd: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Standar</label>
                <input
                  type="text"
                  className={inputClass}
                  value={formApd.standar}
                  onChange={(e) => setFormApd({ ...formApd, standar: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>Jumlah</label>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={formApd.jumlah}
                  onChange={(e) => setFormApd({ ...formApd, jumlah: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>Kondisi</label>
                <select
                  className={inputClass}
                  value={formApd.kondisi}
                  onChange={(e) => setFormApd({ ...formApd, kondisi: e.target.value as DistribusiApd['kondisi'] })}
                >
                  <option value="Baru">Baru</option>
                  <option value="Penggantian Berkala">Penggantian Berkala</option>
                </select>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setModalApd(false)}>Batal</button>
              <button type="submit" className={tombolPrimer}>
                <Activity className="w-4 h-4" />
                Simpan Distribusi
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
