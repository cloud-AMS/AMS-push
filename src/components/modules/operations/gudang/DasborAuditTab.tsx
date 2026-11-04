import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { KonfigurasiGudang, StatusStokFisik } from '../../../../types';
import { nilaiKesiapanAuditCdb, ringkasanKpiGudang, type PemeriksaanKesiapanAudit } from '../../../../utils/gudang';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Settings,
  ShieldAlert
} from 'lucide-react';
import {
  Badge,
  BarCapaian,
  GudangTabId,
  Modal,
  Panel,
  Stat,
  TAB_NOMOR_KE_ID,
  chipFilter,
  inputClass,
  labelClass,
  tombolPrimerGudang,
  tombolSekunder,
  toneStatusStok,
  type Tone
} from './ui';

interface Props {
  dariAcuan: Date;
  refreshTrigger: number;
  onPilihTab: (tab: GudangTabId) => void;
  onPerubahanData: () => void;
}

const LABEL_STATUS_STOK: Record<StatusStokFisik, string> = {
  AVAILABLE: 'AVAILABLE — Bebas Dialokasikan FEFO',
  RESERVED: 'RESERVED — Terkunci Pesanan Aktif',
  QUARANTINE: 'QUARANTINE — Isolasi Mutu / Recall',
  DAMAGED: 'DAMAGED — Rusak (Bad Stock)',
  EXPIRED_LOCK: 'EXPIRED_LOCK — Terkunci Batas ED'
};

export default function DasborAuditTab({ dariAcuan, refreshTrigger, onPilihTab, onPerubahanData }: Props) {
  const [filterAudit, setFilterAudit] = useState<'Semua' | PemeriksaanKesiapanAudit['status']>('Semua');
  const [modalPengaturan, setModalPengaturan] = useState(false);
  const [konfigurasi, setKonfigurasi] = useState<KonfigurasiGudang>(() => db.getKonfigurasiGudang());
  const [drafKonfig, setDrafKonfig] = useState<KonfigurasiGudang>(konfigurasi);
  const [umpanBalik, setUmpanBalik] = useState<string | null>(null);

  const data = useMemo(() => {
    void refreshTrigger;
    const daftarStok = db.getStokGudang();
    const daftarPergerakan = db.getJejakPergerakan();
    const daftarTerima = db.getTerimaBarang();
    const daftarSuratJalan = db.getSuratJalan();
    const daftarOpname = db.getOpnameStok();
    const daftarLkpp = db.getSinkronisasiLkpp();
    const daftarFhir = db.getKirimanSatuSehat();
    const daftarAmbang = db.getAmbangStok();
    const daftarGudang = db.getGudangFisik();
    const daftarUnit = db.getUnitSerial();
    const daftarIzinEdar = db.getIzinEdar();
    const daftarRecall = db.getPenarikanProduk();
    const daftarCapa = db.getCAPA();
    const logSuhu = db.getLogSuhu();
    const cfg = db.getKonfigurasiGudang();

    const kpi = ringkasanKpiGudang({
      daftarStok,
      daftarTerima,
      daftarSuratJalan,
      konfigurasi: cfg,
      dari: dariAcuan
    });

    const audit = nilaiKesiapanAuditCdb({
      daftarStok,
      daftarPergerakan,
      daftarTerima,
      daftarSuratJalan,
      daftarOpname,
      daftarLkpp,
      daftarFhir,
      daftarAmbang,
      daftarGudang,
      daftarUnit,
      daftarIzinEdar,
      daftarRecall,
      daftarCapa,
      logSuhu,
      konfigurasi: cfg,
      dari: dariAcuan
    });

    return { kpi, audit, cfg };
  }, [dariAcuan, refreshTrigger, konfigurasi]);

  const daftarPemeriksaan = useMemo(() => {
    if (filterAudit === 'Semua') return data.audit.pemeriksaan;
    return data.audit.pemeriksaan.filter((p) => p.status === filterAudit);
  }, [data.audit.pemeriksaan, filterAudit]);

  const alarmPrioritas = useMemo(
    () => data.audit.pemeriksaan.filter((p) => p.status !== 'Lolos'),
    [data.audit.pemeriksaan]
  );

  const tonePredikat: Tone =
    data.audit.predikat === 'Siap Audit'
      ? 'emerald'
      : data.audit.predikat === 'Perlu Pembenahan'
        ? 'amber'
        : 'rose';

  const toneBaris = (status: PemeriksaanKesiapanAudit['status']): Tone =>
    status === 'Lolos' ? 'emerald' : status === 'Perlu Tindakan' ? 'amber' : 'rose';

  const simpanPengaturan = (e: React.FormEvent) => {
    e.preventDefault();
    db.saveKonfigurasiGudang(drafKonfig);
    const terbaru = db.getKonfigurasiGudang();
    setKonfigurasi(terbaru);
    setModalPengaturan(false);
    setUmpanBalik('Konfigurasi ambang regulasi & endpoint gerbang pemerintah diperbarui dan tercatat pada jejak audit.');
    onPerubahanData();
  };

  return (
    <div className="space-y-5">
      {umpanBalik && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900 flex items-center justify-between gap-3">
          <span>{umpanBalik}</span>
          <button
            type="button"
            onClick={() => setUmpanBalik(null)}
            className="text-2xs font-bold text-emerald-800 hover:underline cursor-pointer whitespace-nowrap"
          >
            Tutup
          </button>
        </div>
      )}

      {/* KPI Ringkas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Unit Bebas FEFO / Total Stok"
          value={`${data.kpi.unitBebas.toLocaleString('id-ID')} / ${data.kpi.totalUnit.toLocaleString('id-ID')}`}
          hint={`${data.kpi.unitTerkunciPesanan.toLocaleString('id-ID')} unit sedang dikunci pesanan aktif`}
          tone="emerald"
        />
        <Stat
          label="Porsi Unit Tidak Bebas"
          value={`${data.kpi.persenUnitTidakBebas}%`}
          hint="Mencakup karantina, rusak, batas ED, dan alokasi pesanan"
          tone={data.kpi.persenUnitTidakBebas > 25 ? 'amber' : 'slate'}
        />
        <Stat
          label="Antrean Inbound / Outbound"
          value={`${data.kpi.antreInbound} Terima · ${data.kpi.antreOutbound} Kirim`}
          hint="Dokumen menunggu rilis QC/label dan surat jalan belum terkirim"
          tone={data.kpi.antreInbound + data.kpi.antreOutbound > 0 ? 'blue' : 'emerald'}
        />
        <Stat
          label="Skor Kesiapan Audit CDB"
          value={`${data.audit.skorPersen}% · ${data.audit.predikat}`}
          hint={`${data.audit.jumlahBahaya} temuan bahaya · ${data.audit.jumlahPerluTindakan} perlu tindakan`}
          tone={tonePredikat}
        />
      </div>

      {/* Alarm Lintas Tab & Komposisi Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel
            judul="Alarm Kepatuhan Lintas Tab (Penjaga Aktif)"
            keterangan="Senarai periksa dikunci dari predikat Siap Audit selama masih ada excursion suhu tanpa CAPA, uji fungsi alat berat tertunda, isolasi fisik karantina melanggar, atau kegagalan sinkronisasi LKPP."
            aksi={
              <button
                type="button"
                onClick={() => {
                  const cfg = db.getKonfigurasiGudang();
                  setDrafKonfig(cfg);
                  setModalPengaturan(true);
                }}
                className={tombolSekunder}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  Ambang & Endpoint
                </span>
              </button>
            }
          >
            {alarmPrioritas.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Seluruh 15 poin kesiapan audit CDB terpenuhi tanpa temuan terbuka.</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {alarmPrioritas.map((item) => (
                  <div key={item.kode} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge tone={toneBaris(item.status)}>
                          {item.status === 'Bahaya' ? <ShieldAlert className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {item.status}
                        </Badge>
                        <span className="text-xs font-bold text-slate-900">{item.label}</span>
                        <span className="text-2xs text-slate-500">· Tab {item.tab}: {item.area}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.keterangan}</p>
                      <p className="text-2xs text-slate-500">Tindak lanjut: {item.tindakan}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPilihTab(TAB_NOMOR_KE_ID[item.tab] ?? 'dasbor')}
                      className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      Buka Tab {item.tab}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <Panel
          judul="Sebaran Status Stok Fisik"
          keterangan={`Ambang kunci umur simpan aktif: ${data.cfg.umurKunciEdHari} hari sebelum ED.`}
        >
          <div className="space-y-3.5">
            {(['AVAILABLE', 'RESERVED', 'QUARANTINE', 'DAMAGED', 'EXPIRED_LOCK'] as StatusStokFisik[]).map((st) => {
              const baris = data.kpi.perStatus.find((p) => p.status === st);
              const jumlah = baris?.jumlah ?? 0;
              const persen = baris?.persen ?? 0;
              return (
                <div key={st} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <Badge tone={toneStatusStok(st)}>{st}</Badge>
                    <span className="font-mono tabular-nums font-semibold text-slate-700">
                      {jumlah.toLocaleString('id-ID')} unit ({persen}%)
                    </span>
                  </div>
                  <BarCapaian label={LABEL_STATUS_STOK[st].split(' — ')[1]} persen={persen} />
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Senarai Periksa 15 Poin Kesiapan Audit CDB */}
      <Panel
        judul="Senarai Periksa Kesiapan Audit CDB (15 Parameter Lintas Modul)"
        keterangan={data.audit.keteranganRingkas}
        aksi={
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['Semua', 'Bahaya', 'Perlu Tindakan', 'Lolos'] as const).map((opsi) => (
              <button
                key={opsi}
                type="button"
                onClick={() => setFilterAudit(opsi)}
                className={chipFilter(filterAudit === opsi)}
              >
                {opsi}
              </button>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Kode</th>
                <th className="py-3 px-4">Area & Parameter Audit</th>
                <th className="py-3 px-4">Bukti / Kondisi Saat Ini</th>
                <th className="py-3 px-4">Rekomendasi Kepatuhan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Pintasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarPemeriksaan.map((item) => (
                <tr key={item.kode} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">{item.kode}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{item.label}</div>
                    <div className="text-2xs text-slate-500">Tab {item.tab} · {item.area}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-sm leading-relaxed">{item.keterangan}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs leading-relaxed">{item.tindakan}</td>
                  <td className="py-3 px-4">
                    <Badge tone={toneBaris(item.status)}>
                      <ClipboardCheck className="w-3 h-3" />
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onPilihTab(TAB_NOMOR_KE_ID[item.tab] ?? 'dasbor')}
                      className="text-xs font-semibold text-amber-800 hover:text-amber-950 hover:underline cursor-pointer whitespace-nowrap"
                    >
                      Ke Tab {item.tab}
                    </button>
                  </td>
                </tr>
              ))}
              {daftarPemeriksaan.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 px-4 text-center text-slate-500">
                    Tidak ada butir pemeriksaan dengan status {filterAudit}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Modal Konfigurasi Gudang */}
      {modalPengaturan && (
        <Modal
          judul="Konfigurasi Ambang Gudang & Endpoint Pemerintah"
          keterangan="Perubahan ambang langsung mengevaluasi ulang kunci ED, toleransi rantai dingin, ambang opname PJT, serta URL pratinjau payload pemerintah (kredensial/token tidak pernah disimpan di aplikasi)."
          onClose={() => setModalPengaturan(false)}
        >
          <form onSubmit={simpanPengaturan} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Ambang Kunci Umur Simpan ED (Hari)</label>
                <input
                  type="number"
                  min={30}
                  max={730}
                  required
                  value={drafKonfig.umurKunciEdHari}
                  onChange={(e) => setDrafKonfig({ ...drafKonfig, umurKunciEdHari: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass}>Ambang Selisih Opname Wajib PJT (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={25}
                  required
                  value={drafKonfig.ambangSelisihOpnamePersen}
                  onChange={(e) => setDrafKonfig({ ...drafKonfig, ambangSelisihOpnamePersen: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Cold Chain Min (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={drafKonfig.coldChainMinSuhu}
                  onChange={(e) => setDrafKonfig({ ...drafKonfig, coldChainMinSuhu: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass}>Cold Chain Maks (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={drafKonfig.coldChainMaxSuhu}
                  onChange={(e) => setDrafKonfig({ ...drafKonfig, coldChainMaxSuhu: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass}>Maks Excursion (Menit)</label>
                <input
                  type="number"
                  min={5}
                  required
                  value={drafKonfig.menitMaksimumDiLuarRentang}
                  onChange={(e) => setDrafKonfig({ ...drafKonfig, menitMaksimumDiLuarRentang: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Frekuensi Wajib Log Suhu / Hari</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  required
                  value={drafKonfig.frekuensiLogSuhuPerHari}
                  onChange={(e) => setDrafKonfig({ ...drafKonfig, frekuensiLogSuhuPerHari: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass}>Prefix Nomor Surat Jalan</label>
                <input
                  type="text"
                  required
                  value={drafKonfig.prefixSuratJalan}
                  onChange={(e) => setDrafKonfig({ ...drafKonfig, prefixSuratJalan: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Endpoint Webhook Stok e-Katalog LKPP</label>
              <input
                type="url"
                required
                value={drafKonfig.endpointLkpp}
                onChange={(e) => setDrafKonfig({ ...drafKonfig, endpointLkpp: e.target.value })}
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>Endpoint HL7 FHIR SATUSEHAT Logistik</label>
              <input
                type="url"
                required
                value={drafKonfig.endpointSatuSehat}
                onChange={(e) => setDrafKonfig({ ...drafKonfig, endpointSatuSehat: e.target.value })}
                className={`${inputClass} font-mono`}
              />
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={drafKonfig.klienSatuSehatTerdaftar}
                onChange={(e) => setDrafKonfig({ ...drafKonfig, klienSatuSehatTerdaftar: e.target.checked })}
                className="rounded border-slate-300"
              />
              <span className="text-xs text-slate-700 font-medium">
                Klien SATUSEHAT sudah terdaftar resmi pada produksi Kemenkes
              </span>
            </label>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalPengaturan(false)} className={tombolSekunder}>
                Batal
              </button>
              <button type="submit" className={tombolPrimerGudang}>
                Simpan Konfigurasi
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
