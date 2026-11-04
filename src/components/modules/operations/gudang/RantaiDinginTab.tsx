import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { CAPARecord, LogSuhu, StokGudang } from '../../../../types';
import { deteksiExcursiRantaiDingin, statusUnitStok } from '../../../../utils/gudang';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPlus,
  Lock,
  Plus,
  ShieldAlert,
  Thermometer
} from 'lucide-react';
import {
  Badge,
  Modal,
  Panel,
  Stat,
  inputClass,
  labelClass,
  tombolBahaya,
  tombolPrimerGudang,
  tombolSekunder
} from './ui';

interface Props {
  dariAcuan: Date;
  onPerubahanData: () => void;
}

const PILIHAN_SENSOR: { nama: string; zona: StokGudang['zonaSuhu'] }[] = [
  { nama: 'Sensor Cold Room 01 (Reagen IVD)', zona: 'Cold Chain (2°C - 8°C)' },
  { nama: 'Sensor Chiller Karantina', zona: 'Cold Chain (2°C - 8°C)' },
  { nama: 'Sensor Ruang Alkes Elektromedik', zona: 'Ruang Sejuk AC (15°C - 25°C)' },
  { nama: 'Sensor Gudang Bahan Non-Steril', zona: 'Suhu Kamar (< 30°C)' }
];

export default function RantaiDinginTab({ dariAcuan, onPerubahanData }: Props) {
  const [logSuhuList, setLogSuhuList] = useState<LogSuhu[]>(() => db.getLogSuhu());
  const [stokList, setStokList] = useState<StokGudang[]>(() => db.getStokGudang());
  const [capaList, setCapaList] = useState<CAPARecord[]>(() => db.getCAPA());
  const konfigurasi = useMemo(() => db.getKonfigurasiGudang(), [logSuhuList]);

  const [modalSuhu, setModalSuhu] = useState(false);
  const [modalCapa, setModalCapa] = useState(false);
  const [kunciOtomatisSaatExcursi, setKunciOtomatisSaatExcursi] = useState(true);
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'peringatan'; teks: string } | null>(null);

  const [formSuhu, setFormSuhu] = useState({
    sensor: PILIHAN_SENSOR[0].nama,
    zona: PILIHAN_SENSOR[0].zona,
    suhu: 4.6,
    kelembaban: 55
  });

  const [formCapa, setFormCapa] = useState({
    deskripsiMasalah: 'Excursion suhu rantai dingin melampaui batas toleransi 2°C – 8°C pada ruang penyimpanan reagen IVD.',
    akarPenyebab: 'Fluktuasi kompresor cadangan saat pembongkaran palet masuk.',
    tindakanKorektif: 'Isolasi bets cold chain terdampak ke Chiller Karantina dan verifikasi stabilitas reagen bersama QA.',
    tindakanPreventif: 'Kalibrasi ulang alarm termohigrometer dan pembatasan durasi buka pintu cold room maksimal 3 menit.',
    penanggungJawab: 'Apt. Sari Dewi, S.Farm (PJT)'
  });

  const segarkan = () => {
    setLogSuhuList(db.getLogSuhu());
    setStokList(db.getStokGudang());
    setCapaList(db.getCAPA());
    onPerubahanData();
  };

  const excursi = useMemo(
    () => deteksiExcursiRantaiDingin(logSuhuList, konfigurasi),
    [logSuhuList, konfigurasi]
  );

  const stokColdChainBebas = useMemo(
    () =>
      stokList.filter(
        (s) => s.zonaSuhu === 'Cold Chain (2°C - 8°C)' && statusUnitStok(s) === 'AVAILABLE' && s.jumlahStok > 0
      ),
    [stokList]
  );

  const capaSuhuTerbuka = useMemo(
    () => capaList.filter((c) => c.sumber === 'Ketidaksesuaian Suhu' && c.status !== 'Ditutup'),
    [capaList]
  );

  const kunciSemuaColdChain = (alasan: string) => {
    let jumlahDikunci = 0;
    stokColdChainBebas.forEach((s) => {
      db.kunciStokKarantina(s.id, alasan);
      jumlahDikunci += 1;
    });
    return jumlahDikunci;
  };

  const simpanLogSuhu = (e: React.FormEvent) => {
    e.preventDefault();
    const nilaiSuhu = Number(formSuhu.suhu);
    let status: LogSuhu['status'] = 'Normal';
    if (formSuhu.zona === 'Cold Chain (2°C - 8°C)') {
      if (nilaiSuhu < konfigurasi.coldChainMinSuhu) status = 'Peringatan Suhu Rendah';
      else if (nilaiSuhu > konfigurasi.coldChainMaxSuhu) status = 'Peringatan Suhu Tinggi';
    } else if (formSuhu.zona === 'Ruang Sejuk AC (15°C - 25°C)' && (nilaiSuhu < 15 || nilaiSuhu > 25)) {
      status = nilaiSuhu > 25 ? 'Peringatan Suhu Tinggi' : 'Peringatan Suhu Rendah';
    }

    const sekarang = new Date();
    const waktuBaca = `${dariAcuan.toISOString().split('T')[0]} ${String(sekarang.getHours()).padStart(2, '0')}:${String(sekarang.getMinutes()).padStart(2, '0')}`;
    const baru: LogSuhu = {
      id: `SMR-${Date.now()}`,
      sensor: formSuhu.sensor,
      zona: formSuhu.zona,
      suhu: nilaiSuhu,
      kelembaban: Number(formSuhu.kelembaban),
      waktu: waktuBaca,
      status
    };

    db.catatLogSuhu(baru);
    const daftarBaru = db.getLogSuhu();
    const cekExcursi = deteksiExcursiRantaiDingin(daftarBaru, konfigurasi);

    let infoKunci = '';
    if (kunciOtomatisSaatExcursi && cekExcursi.wajibKunciColdChain && stokColdChainBebas.length > 0) {
      const n = kunciSemuaColdChain(
        `Kunci otomatis rantai dingin: pembacaan ${formSuhu.sensor} mencapai ${nilaiSuhu}°C (di luar ${konfigurasi.coldChainMinSuhu}°C–${konfigurasi.coldChainMaxSuhu}°C)`
      );
      infoKunci = ` Penjaga rantai dingin langsung mengunci ${n} bets Cold Chain ke status QUARANTINE.`;
    }

    setModalSuhu(false);
    setPesan({
      tipe: status === 'Normal' ? 'sukses' : 'peringatan',
      teks: `Bacaan ${formSuhu.sensor} (${nilaiSuhu}°C / ${formSuhu.kelembaban}% RH) tercatat sebagai ${status}.${infoKunci}`
    });
    segarkan();
  };

  const terbitkanCapaSuhu = (e: React.FormEvent) => {
    e.preventDefault();
    const target = new Date(dariAcuan.getTime() + 14 * 86400000).toISOString().split('T')[0];
    const nomor = `CAPA/TEMP/${dariAcuan.getFullYear()}/${String(capaList.length + 1).padStart(3, '0')}`;
    const item: CAPARecord = {
      id: `CAPA-${Date.now()}`,
      nomorCAPA: nomor,
      sumber: 'Ketidaksesuaian Suhu',
      deskripsiMasalah: formCapa.deskripsiMasalah.trim(),
      akarPenyebab: formCapa.akarPenyebab.trim(),
      tindakanKorektif: formCapa.tindakanKorektif.trim(),
      tindakanPreventif: formCapa.tindakanPreventif.trim(),
      penanggungJawab: formCapa.penanggungJawab.trim(),
      targetSelesai: target,
      status: 'Terbuka',
      verifikasiPJT: false
    };
    db.addCAPA(item);
    db.logAudit(
      'Gudang & Logistik — Rantai Dingin',
      `Penerbitan CAPA ketidaksesuaian suhu ${nomor}`,
      nomor,
      item.penanggungJawab,
      'Penanggung Jawab Teknis',
      [{ kolom: 'status', nilaiLama: '-', nilaiBaru: 'Terbuka' }]
    );
    setModalCapa(false);
    setPesan({ tipe: 'sukses', teks: `Formulir ${nomor} berhasil dibuka dan ditautkan ke kesiapan audit CDB.` });
    segarkan();
  };

  return (
    <div className="space-y-5">
      {pesan && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs flex items-start justify-between gap-3 ${
            pesan.tipe === 'peringatan'
              ? 'border-amber-300 bg-amber-50 text-amber-950'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          <div className="flex items-start gap-2">
            {pesan.tipe === 'peringatan' ? (
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Bacaan Sensor Tercatat"
          value={excursi.bacaanDinilai}
          hint={`Wajib minimal ${konfigurasi.frekuensiLogSuhuPerHari}x bacaan per hari`}
          tone="blue"
        />
        <Stat
          label="Episode Excursion Suhu"
          value={excursi.episode.length}
          hint={`${excursi.episodeKritis.length} episode melampaui ${konfigurasi.menitMaksimumDiLuarRentang} menit`}
          tone={excursi.episodeKritis.length > 0 ? 'rose' : excursi.episode.length > 0 ? 'amber' : 'emerald'}
        />
        <Stat
          label="Bets Cold Chain Bebas"
          value={stokColdChainBebas.length}
          hint={`Rentang wajib ${konfigurasi.coldChainMinSuhu}°C – ${konfigurasi.coldChainMaxSuhu}°C`}
          tone="emerald"
        />
        <Stat
          label="CAPA Suhu Terbuka"
          value={capaSuhuTerbuka.length}
          hint="Wajib terbit bila terjadi excursion kritis"
          tone={excursi.episodeKritis.length > 0 && capaSuhuTerbuka.length === 0 ? 'rose' : 'slate'}
        />
      </div>

      {/* Penjaga Excursion Otomatis */}
      {excursi.wajibKunciColdChain && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-700" />
              <span>Penjaga Rantai Dingin Aktif: Excursion Melampaui Ambang {konfigurasi.menitMaksimumDiLuarRentang} Menit</span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">{excursi.keterangan}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {stokColdChainBebas.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const n = kunciSemuaColdChain(
                    `Excursion rantai dingin > ${konfigurasi.menitMaksimumDiLuarRentang} menit — isolasi otomatis wajib verifikasi PJT`
                  );
                  setPesan({
                    tipe: 'peringatan',
                    teks: `${n} bets Cold Chain berhasil dikunci ke status QUARANTINE untuk mencegah pengiriman sebelum uji stabilitas.`
                  });
                  segarkan();
                }}
                className={tombolBahaya}
              >
                <Lock className="w-4 h-4" />
                Kunci Karantina {stokColdChainBebas.length} Bets Cold Chain
              </button>
            )}
            <button type="button" onClick={() => setModalCapa(true)} className={tombolPrimerGudang}>
              <ClipboardPlus className="w-4 h-4" />
              Terbitkan CAPA Suhu
            </button>
          </div>
        </div>
      )}

      {/* Kartu Sensor Gudang (dipertahankan & disempurnakan dengan tipografi token) */}
      <Panel
        judul="Pemantauan Sensor Termohigrometer & Cold Chain (2°C – 8°C)"
        keterangan="Data suhu dan kelembaban menjadi lampiran wajib kiriman HL7 FHIR SATUSEHAT serta bukti audit CDAKB Kemenkes."
        aksi={
          <>
            <button type="button" onClick={() => setModalCapa(true)} className={tombolSekunder}>
              <span className="inline-flex items-center gap-1.5">
                <ClipboardPlus className="w-3.5 h-3.5" />
                Buka CAPA Suhu
              </span>
            </button>
            <button type="button" onClick={() => setModalSuhu(true)} className={tombolPrimerGudang}>
              <Plus className="w-4 h-4" />
              Catat Log Suhu Manual
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {logSuhuList.slice(0, 8).map((sensor) => (
            <div key={sensor.id} className="bg-slate-50/70 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-2xs font-semibold text-slate-500">{sensor.zona}</span>
                <Badge tone={sensor.status === 'Normal' ? 'emerald' : 'rose'}>{sensor.status}</Badge>
              </div>
              <h4 className="font-bold text-slate-900 text-xs mb-3 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{sensor.sensor}</span>
              </h4>
              <div className="flex items-baseline justify-between mb-2 tabular-nums">
                <div className="text-2xl font-extrabold text-slate-900">{sensor.suhu}°C</div>
                <div className="text-xs font-semibold text-slate-600">{sensor.kelembaban}% RH</div>
              </div>
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-2xs text-slate-500 font-mono">
                <span>ID: {sensor.id}</span>
                <span>{sensor.waktu}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-950 leading-relaxed">
          <span className="font-bold block mb-1">Standar Pemantauan Suhu CDAKB Permenkes 4/2014:</span>
          Pencatatan suhu dilakukan minimal {konfigurasi.frekuensiLogSuhuPerHari} kali sehari dengan termometer atau datalogger terkalibrasi KAN. Bila fluktuasi melampaui toleransi ({konfigurasi.coldChainMinSuhu}°C – {konfigurasi.coldChainMaxSuhu}°C selama &gt; {konfigurasi.menitMaksimumDiLuarRentang} menit), bets rantai dingin dikunci karantina dan PJT menerbitkan formulir CAPA.
        </div>
      </Panel>

      {/* Tabel Episode Excursion & Bukti CAPA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel
          judul="Evaluasi Durasi Excursion di Luar Rentang"
          keterangan={excursi.keterangan}
        >
          {excursi.episode.length === 0 ? (
            <p className="text-xs text-slate-600">Tidak ditemukan bacaan di luar rentang suhu yang ditetapkan.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-3">Sensor & Arah</th>
                    <th className="py-2.5 px-3">Rentang Suhu</th>
                    <th className="py-2.5 px-3">Estimasi Durasi</th>
                    <th className="py-2.5 px-3">Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {excursi.episode.map((ep, idx) => (
                    <tr key={`${ep.sensor}-${idx}`} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900">{ep.sensor}</div>
                        <div className="text-2xs text-slate-500">Suhu {ep.arah} · {ep.jumlahBacaan} bacaan</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-800">
                        {ep.nilaiTerendah}°C – {ep.nilaiTertinggi}°C
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-slate-700">
                        {ep.menitDiLuar} menit
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={ep.melewatiAmbang ? 'rose' : 'amber'}>
                          {ep.melewatiAmbang ? 'Wajib Kunci & CAPA' : 'Pantau Ketat'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel
          judul="Riwayat CAPA Ketidaksesuaian Suhu"
          keterangan="Tindak lanjut korektif & preventif PJT sebagai syarat penutupan temuan audit rantai dingin."
        >
          {capaList.filter((c) => c.sumber === 'Ketidaksesuaian Suhu').length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada formulir CAPA bersumber Ketidaksesuaian Suhu.</p>
          ) : (
            <div className="space-y-2.5">
              {capaList
                .filter((c) => c.sumber === 'Ketidaksesuaian Suhu')
                .map((c) => (
                  <div key={c.id} className="rounded-xl border border-slate-200 p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-900">{c.nomorCAPA}</span>
                      <Badge tone={c.status === 'Ditutup' ? 'emerald' : 'amber'}>{c.status}</Badge>
                    </div>
                    <p className="text-slate-700">{c.deskripsiMasalah}</p>
                    <div className="text-2xs text-slate-500">
                      PJ: {c.penanggungJawab} · Target: {c.targetSelesai}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Modal Catat Suhu */}
      {modalSuhu && (
        <Modal
          judul="Catat Log Suhu & Kelembaban Gudang"
          keterangan="Bacaan di luar 2°C – 8°C pada Cold Chain akan dievaluasi oleh penjaga excursion rantai dingin."
          onClose={() => setModalSuhu(false)}
        >
          <form onSubmit={simpanLogSuhu} className="space-y-3 text-xs">
            <div>
              <label className={labelClass}>Lokasi Sensor</label>
              <select
                value={formSuhu.sensor}
                onChange={(e) => {
                  const pilih = PILIHAN_SENSOR.find((p) => p.nama === e.target.value);
                  setFormSuhu({
                    ...formSuhu,
                    sensor: e.target.value,
                    zona: pilih?.zona ?? formSuhu.zona
                  });
                }}
                className={inputClass}
              >
                {PILIHAN_SENSOR.map((p) => (
                  <option key={p.nama} value={p.nama}>{p.nama} — {p.zona}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Suhu Terukur (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formSuhu.suhu}
                  onChange={(e) => setFormSuhu({ ...formSuhu, suhu: Number(e.target.value) })}
                  className={`${inputClass} font-bold tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass}>Kelembaban Relatif (% RH)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={formSuhu.kelembaban}
                  onChange={(e) => setFormSuhu({ ...formSuhu, kelembaban: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={kunciOtomatisSaatExcursi}
                onChange={(e) => setKunciOtomatisSaatExcursi(e.target.checked)}
              />
              <span className="text-slate-700">
                Kunci otomatis seluruh bets Cold Chain ke QUARANTINE bila bacaan memicu excursion kritis
              </span>
            </label>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalSuhu(false)} className={tombolSekunder}>Batal</button>
              <button type="submit" className={tombolPrimerGudang}>Simpan Log Suhu</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal CAPA Suhu */}
      {modalCapa && (
        <Modal
          judul="Terbitkan Formulir CAPA Ketidaksesuaian Suhu"
          keterangan="CAPA suhu menghubungkan investigasi rantai dingin dengan modul QA & senarai periksa kesiapan audit CDB."
          onClose={() => setModalCapa(false)}
        >
          <form onSubmit={terbitkanCapaSuhu} className="space-y-3 text-xs">
            <div>
              <label className={labelClass}>Deskripsi Penyimpangan Suhu</label>
              <textarea
                rows={2}
                required
                value={formCapa.deskripsiMasalah}
                onChange={(e) => setFormCapa({ ...formCapa, deskripsiMasalah: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Analisis Akar Penyebab (Root Cause)</label>
              <input
                type="text"
                required
                value={formCapa.akarPenyebab}
                onChange={(e) => setFormCapa({ ...formCapa, akarPenyebab: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tindakan Korektif Segera</label>
              <input
                type="text"
                required
                value={formCapa.tindakanKorektif}
                onChange={(e) => setFormCapa({ ...formCapa, tindakanKorektif: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tindakan Preventif</label>
              <input
                type="text"
                required
                value={formCapa.tindakanPreventif}
                onChange={(e) => setFormCapa({ ...formCapa, tindakanPreventif: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Penanggung Jawab Verifikasi</label>
              <input
                type="text"
                required
                value={formCapa.penanggungJawab}
                onChange={(e) => setFormCapa({ ...formCapa, penanggungJawab: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalCapa(false)} className={tombolSekunder}>Batal</button>
              <button type="submit" className={tombolPrimerGudang}>Terbitkan CAPA</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
