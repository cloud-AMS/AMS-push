import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { KirimanSatuSehat, SinkronisasiLkpp } from '../../../../types';
import {
  bangunBundleFhir,
  bangunPayloadLkpp,
  gerbangKonfirmasiStokSales,
  stokBebas,
  validasiKirimanSatuSehat
} from '../../../../utils/gudang';
import {
  CheckCircle2,
  Code2,
  Copy,
  FileJson,
  Globe,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  Wrench
} from 'lucide-react';
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

const toneLkpp = (st: SinkronisasiLkpp['status']): Tone => {
  if (st === 'Terkirim') return 'emerald';
  if (st === 'Antre') return 'amber';
  return 'rose';
};

const toneFhir = (st: KirimanSatuSehat['status']): Tone => {
  if (st === 'Diterima (201)') return 'emerald';
  if (st === 'Antre') return 'blue';
  if (st === 'Belum Terkirim') return 'amber';
  return 'rose';
};

export default function GerbangPemerintahTab({ dariAcuan, onPerubahanData }: Props) {
  const [lkppList, setLkppList] = useState<SinkronisasiLkpp[]>(() => db.getSinkronisasiLkpp());
  const [fhirList, setFhirList] = useState<KirimanSatuSehat[]>(() => db.getKirimanSatuSehat());
  const [stokList] = useState(() => db.getStokGudang());
  const konfigurasi = useMemo(() => db.getKonfigurasiGudang(), [lkppList, fhirList]);

  const [skuCekGerbang, setSkuCekGerbang] = useState('IVD-STD-06');
  const [filterLkpp, setFilterLkpp] = useState<'Semua' | SinkronisasiLkpp['status']>('Semua');
  const [filterFhir, setFilterFhir] = useState<'Semua' | KirimanSatuSehat['status']>('Semua');

  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'tolak'; teks: string } | null>(null);
  const [pratinjauJson, setPratinjauJson] = useState<{ judul: string; endpoint: string; isi: string } | null>(null);

  const [modalLkppBaru, setModalLkppBaru] = useState(false);
  const [formLkpp, setFormLkpp] = useState({
    kodeSKU: 'ALKES-PM-01',
    nomorPaketLkpp: 'Paket LKPP/2024/0091873',
    pemicu: 'Perubahan Stok' as SinkronisasiLkpp['pemicu'],
    nomorBets: 'LOT-2024-PM44'
  });

  const [modalFhirBaru, setModalFhirBaru] = useState(false);
  const [formFhir, setFormFhir] = useState({
    tipeSumberDaya: 'SupplyDelivery' as KirimanSatuSehat['tipeSumberDaya'],
    nomorRujukan: 'SJ/CDAKB/2024/SP-EKAT-2024-118',
    kodeFasyankes: 'FKN-RS-0041',
    namaFasyankes: 'RSUD Pasar Minggu Jakarta Selatan',
    nomorBets: 'LOT-2024-PM44',
    nomorSerial: 'AMS-V12P-2406-0031',
    suhuRantaiDingin: '-'
  });

  const [perbaikanFhir, setPerbaikanFhir] = useState<KirimanSatuSehat | null>(null);
  const [formPerbaikan, setFormPerbaikan] = useState({
    kodeFasyankes: '',
    suhuRantaiDingin: '-',
    catatan: ''
  });

  const segarkan = () => {
    setLkppList(db.getSinkronisasiLkpp());
    setFhirList(db.getKirimanSatuSehat());
    onPerubahanData();
  };

  const skuUnik = useMemo(() => {
    const peta = new Map<string, { kodeSKU: string; namaAlkes: string; satuan: string; bebas: number }>();
    stokList.forEach((s) => {
      const ada = peta.get(s.kodeSKU);
      peta.set(s.kodeSKU, {
        kodeSKU: s.kodeSKU,
        namaAlkes: s.namaAlkes,
        satuan: s.satuan,
        bebas: (ada?.bebas ?? 0) + stokBebas(s)
      });
    });
    return Array.from(peta.values());
  }, [stokList]);

  const hasilGerbangSales = useMemo(
    () => gerbangKonfirmasiStokSales({ daftarLkpp: lkppList, kodeSKU: skuCekGerbang }),
    [lkppList, skuCekGerbang]
  );

  const antrekanLkpp = (e: React.FormEvent) => {
    e.preventDefault();
    const infoSku = skuUnik.find((s) => s.kodeSKU === formLkpp.kodeSKU);
    const { antrean } = db.antrekanSinkronisasiLkpp({
      kodeSKU: formLkpp.kodeSKU,
      namaProduk: infoSku?.namaAlkes ?? formLkpp.kodeSKU,
      nomorPaketLkpp: formLkpp.nomorPaketLkpp.trim(),
      qtyDilaporkan: formLkpp.pemicu === 'Recall' || formLkpp.pemicu === 'Karantina' ? 0 : infoSku?.bebas ?? 0,
      satuan: infoSku?.satuan ?? 'Unit',
      pemicu: formLkpp.pemicu,
      nomorBets: formLkpp.nomorBets.trim()
    });
    setModalLkppBaru(false);
    setPesan({
      tipe: 'sukses',
      teks: `Webhook e-Katalog LKPP ${antrean.id} (${antrean.kodeSKU}, qty ${antrean.qtyDilaporkan}) masuk antrean.`
    });
    segarkan();
  };

  const bukaPayloadLkpp = (item: SinkronisasiLkpp) => {
    const infoSku = skuUnik.find((s) => s.kodeSKU === item.kodeSKU);
    const payload = bangunPayloadLkpp({
      konfigurasi,
      kodeSKU: item.kodeSKU,
      namaProduk: item.namaProduk,
      nomorPaketLkpp: item.nomorPaketLkpp,
      qtyDilaporkan: item.qtyDilaporkan,
      satuan: infoSku?.satuan ?? 'Unit',
      pemicu: item.pemicu,
      waktu: dariAcuan
    });
    setPratinjauJson({
      judul: `Pratinjau Webhook e-Katalog LKPP — ${item.id}`,
      endpoint: `${payload.method} ${payload.endpoint}`,
      isi: JSON.stringify({ headers: payload.headers, body: payload.body }, null, 2)
    });
  };

  const kirimUlangLkpp = (item: SinkronisasiLkpp) => {
    db.ubahStatusSinkronisasiLkpp(
      item.id,
      'Terkirim',
      'HTTP 200 - sinkronisasi ulang berhasil; stok etalase e-Katalog sudah mutakhir.'
    );
    setPesan({
      tipe: 'sukses',
      teks: `Sinkronisasi ${item.id} (${item.kodeSKU}) berhasil dikirim ulang (HTTP 200) — gerbang konfirmasi pesanan dibuka kembali.`
    });
    segarkan();
  };

  const simulasiGagalLkpp = (item: SinkronisasiLkpp) => {
    db.ubahStatusSinkronisasiLkpp(
      item.id,
      'Gagal',
      'HTTP 503 - gateway LKPP timeout; konfirmasi pesanan e-Katalog untuk SKU ini ditahan otomatis.'
    );
    setSkuCekGerbang(item.kodeSKU);
    setPesan({
      tipe: 'tolak',
      teks: `Kegagalan HTTP 503 tercatat pada ${item.id}; konfirmasi pesanan e-Katalog untuk ${item.kodeSKU} kini diblokir otomatis.`
    });
    segarkan();
  };

  const tambahBundleFhir = (e: React.FormEvent) => {
    e.preventDefault();
    const { kiriman, validasi } = db.catatKirimanSatuSehat({
      tipeSumberDaya: formFhir.tipeSumberDaya,
      nomorRujukan: formFhir.nomorRujukan.trim(),
      kodeFasyankes: formFhir.kodeFasyankes.trim(),
      namaFasyankes: formFhir.namaFasyankes.trim(),
      nomorBets: formFhir.nomorBets.trim(),
      nomorSerial: formFhir.nomorSerial.trim(),
      suhuRantaiDingin: formFhir.suhuRantaiDingin.trim() || '-',
      waktu: dariAcuan
    });
    setModalFhirBaru(false);
    setPesan({
      tipe: validasi.layakKirim ? 'sukses' : 'tolak',
      teks: validasi.layakKirim
        ? `Bundle FHIR ${kiriman.id} (${kiriman.tipeSumberDaya}) lolos validasi struktur dan masuk status Antre.`
        : `Bundle FHIR ${kiriman.id} ditahan (${kiriman.status}): ${validasi.sebab.join('; ')}`
    });
    segarkan();
  };

  const simpanPerbaikanDanKirimUlangFhir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!perbaikanFhir) return;
    const bangunBaru = bangunBundleFhir({
      konfigurasi,
      tipeSumberDaya: perbaikanFhir.tipeSumberDaya,
      nomorRujukan: perbaikanFhir.nomorRujukan,
      kodeFasyankes: formPerbaikan.kodeFasyankes.trim(),
      namaFasyankes: perbaikanFhir.namaFasyankes,
      nomorBets: perbaikanFhir.nomorBets !== '-' ? perbaikanFhir.nomorBets : undefined,
      nomorSerial: perbaikanFhir.nomorSerial !== '-' ? perbaikanFhir.nomorSerial : undefined,
      suhuRantaiDingin: formPerbaikan.suhuRantaiDingin.trim() || '-',
      waktu: dariAcuan
    });

    const draf: KirimanSatuSehat = {
      ...perbaikanFhir,
      kodeFasyankes: formPerbaikan.kodeFasyankes.trim(),
      suhuRantaiDingin: formPerbaikan.suhuRantaiDingin.trim() || '-',
      payloadJson: bangunBaru.payloadJson,
      status: 'Antre'
    };

    const cek = validasiKirimanSatuSehat({
      kiriman: draf,
      daftarKiriman: fhirList,
      konfigurasi
    });

    if (!cek.layakKirim) {
      setPesan({
        tipe: 'tolak',
        teks: `Masih ditolak validator FHIR: ${cek.sebab.join('; ')}`
      });
      return;
    }

    const daftarBaru = fhirList.map((k) => (k.id === perbaikanFhir.id ? draf : k));
    db.saveKirimanSatuSehat(daftarBaru);
    db.ubahStatusKirimanSatuSehat(
      perbaikanFhir.id,
      'Diterima (201)',
      formPerbaikan.catatan.trim() ||
        `Master data kode fasyankes ${draf.kodeFasyankes} telah dipetakan dan diterima SATUSEHAT (HTTP 201 Created).`
    );

    setPerbaikanFhir(null);
    setPesan({
      tipe: 'sukses',
      teks: `Kiriman FHIR ${draf.id} berhasil diperbaiki dan diterima Kemenkes SATUSEHAT (201).`
    });
    segarkan();
  };

  const salinTeks = async (isi: string) => {
    try {
      await navigator.clipboard.writeText(isi);
      setPesan({ tipe: 'sukses', teks: 'Payload JSON berhasil disalin ke papan klip untuk tim integrasi IT.' });
    } catch {
      setPesan({ tipe: 'tolak', teks: 'Gagal menyalin otomatis; silakan pilih teks JSON dari jendela pratinjau.' });
    }
  };

  const lkppTampil = lkppList.filter((l) => (filterLkpp === 'Semua' ? true : l.status === filterLkpp));
  const fhirTampil = fhirList.filter((f) => (filterFhir === 'Semua' ? true : f.status === filterFhir));

  const lkppBermasalah = lkppList.filter((l) => l.status === 'Gagal' || l.status === 'Ditolak').length;
  const fhirBermasalah = fhirList.filter((f) => f.status === 'Ditolak (OperationOutcome)').length;

  return (
    <div className="space-y-5">
      {pesan && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            pesan.tipe === 'sukses'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {pesan.tipe === 'sukses' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
            )}
            <span>{pesan.teks}</span>
          </div>
          <button
            type="button"
            onClick={() => setPesan(null)}
            className="text-2xs font-semibold underline cursor-pointer shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Antrean & Log e-Katalog LKPP"
          value={lkppList.length}
          hint={`${lkppList.filter((l) => l.status === 'Terkirim').length} terkirim HTTP 200`}
        />
        <Stat
          label="Webhook LKPP Gagal / Ditolak"
          value={lkppBermasalah}
          hint="Memblokir konfirmasi pesanan e-Katalog SKU terkait"
          tone={lkppBermasalah > 0 ? 'rose' : 'emerald'}
        />
        <Stat
          label="Bundle HL7 FHIR SATUSEHAT"
          value={fhirList.length}
          hint={`${fhirList.filter((f) => f.status === 'Diterima (201)').length} diterima HTTP 201`}
          tone="blue"
        />
        <Stat
          label="Tolakan OperationOutcome"
          value={fhirBermasalah}
          hint="Wajib perbaikan kode fasyankes / suhu rantai dingin"
          tone={fhirBermasalah > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Panel 1: Gerbang Konfirmasi Stok Sales & Antrean LKPP */}
      <Panel
        judul="Gerbang Sinkronisasi Stok e-Katalog LKPP (Aturan §3.12)"
        keterangan={`Endpoint terdaftar: ${konfigurasi.endpointLkpp} (kredensial dikelola server proxy terpisah). Kegagalan sinkronisasi otomatis menahan konfirmasi pesanan Sales agar perusahaan terhindar dari penalti pembatalan paket LKPP.`}
        aksi={
          <button
            type="button"
            onClick={() => setModalLkppBaru(true)}
            className={tombolPrimerGudang}
          >
            <Plus className="w-4 h-4" />
            Antrekan Sinkronisasi Stok LKPP
          </button>
        }
      >
        {/* Pemeriksa Gerbang SKU */}
        <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-slate-700">Cek Gerbang Konfirmasi Sales per SKU:</span>
            <select
              value={skuCekGerbang}
              onChange={(e) => setSkuCekGerbang(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white font-mono text-xs"
            >
              {Array.from(new Set([...skuUnik.map((s) => s.kodeSKU), ...lkppList.map((l) => l.kodeSKU)])).map(
                (sku) => (
                  <option key={sku} value={sku}>
                    {sku}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={hasilGerbangSales.bolehKonfirmasi ? 'emerald' : 'rose'}>
              {hasilGerbangSales.bolehKonfirmasi ? 'BOLEH KONFIRMASI PESANAN' : 'KONFIRMASI SALES DIBLOKIR'}
            </Badge>
            <span className="text-2xs text-slate-600">{hasilGerbangSales.sebab}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {(['Semua', 'Antre', 'Terkirim', 'Gagal', 'Ditolak'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterLkpp(st)}
              className={chipFilter(filterLkpp === st)}
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
                <th className="py-3 px-3.5">SKU &amp; Paket Kontrak LKPP</th>
                <th className="py-3 px-3.5">Pemicu &amp; Qty</th>
                <th className="py-3 px-3.5">Status &amp; Percobaan</th>
                <th className="py-3 px-3.5">Respons Gateway</th>
                <th className="py-3 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lkppTampil.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3.5 font-mono tabular-nums">
                    <div className="font-bold text-slate-900">{item.id}</div>
                    <div className="text-2xs text-slate-500">{item.waktu}</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-900">{item.namaProduk}</div>
                    <div className="font-mono text-2xs text-slate-500">
                      {item.kodeSKU} • {item.nomorPaketLkpp}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 tabular-nums">
                    <div className="font-semibold text-slate-800">{item.pemicu}</div>
                    <div className="font-mono text-2xs text-slate-600">
                      Qty lapor: <strong>{item.qtyDilaporkan}</strong>
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <Badge tone={toneLkpp(item.status)}>{item.status}</Badge>
                    <div className="text-2xs text-slate-500 mt-1 tabular-nums">
                      Percobaan ke-{item.percobaan}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-2xs text-slate-600 max-w-xs leading-relaxed">
                    {item.pesanRespons}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end flex-wrap">
                      <button
                        type="button"
                        onClick={() => bukaPayloadLkpp(item)}
                        className={tombolSekunder}
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        JSON
                      </button>
                      {item.status !== 'Terkirim' ? (
                        <button
                          type="button"
                          onClick={() => kirimUlangLkpp(item)}
                          className={tombolPrimerGudang}
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Kirim / Ulangi
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => simulasiGagalLkpp(item)}
                          className={tombolSekunder}
                          title="Uji penahan konfirmasi saat gateway HTTP 503"
                        >
                          Uji 503
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Panel 2: HL7 FHIR SATUSEHAT Logistik / SMILE Kemenkes */}
      <Panel
        judul="Integrasi HL7 FHIR SATUSEHAT Logistik / SMILE Kemenkes RI"
        keterangan={`Endpoint FHIR: ${konfigurasi.endpointSatuSehat} (${konfigurasi.klienSatuSehatTerdaftar ? 'Klien Produksi Aktif' : 'Mode Pratinjau Sandbox — tanpa token di browser'}). Validator memeriksa kode fasyankes, profil Organization (201), dan kepatuhan suhu rantai dingin 2°C – 8°C.`}
        aksi={
          <button
            type="button"
            onClick={() => setModalFhirBaru(true)}
            className={tombolPrimerGudang}
          >
            <Globe className="w-4 h-4" />
            Bangun Bundle FHIR Baru
          </button>
        }
      >
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {(
            [
              'Semua',
              'Diterima (201)',
              'Antre',
              'Belum Terkirim',
              'Ditolak (OperationOutcome)'
            ] as const
          ).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterFhir(st)}
              className={chipFilter(filterFhir === st)}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3.5">ID &amp; Resource FHIR</th>
                <th className="py-3 px-3.5">Fasyankes &amp; Rujukan</th>
                <th className="py-3 px-3.5">Bets / Serial / Suhu</th>
                <th className="py-3 px-3.5">Status Kemenkes</th>
                <th className="py-3 px-3.5">Catatan &amp; Diagnostik</th>
                <th className="py-3 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fhirTampil.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3.5 font-mono">
                    <div className="font-bold text-slate-900">{f.id}</div>
                    <Badge tone="blue">{f.tipeSumberDaya}</Badge>
                    <div className="text-2xs text-slate-400 mt-0.5">{f.waktu}</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-900">{f.namaFasyankes || '-'}</div>
                    <div className="font-mono text-2xs text-slate-500">
                      Kode: {f.kodeFasyankes || '(kosong)'} • Ref: {f.nomorRujukan}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 font-mono text-2xs text-slate-700 space-y-0.5">
                    <div>Bets: {f.nomorBets}</div>
                    <div>SN: {f.nomorSerial}</div>
                    <div>Suhu: {f.suhuRantaiDingin}</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <Badge tone={toneFhir(f.status)}>{f.status}</Badge>
                  </td>
                  <td className="py-3 px-3.5 text-2xs text-slate-600 max-w-xs leading-relaxed">
                    {f.catatan}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          let rapi = f.payloadJson;
                          try {
                            rapi = JSON.stringify(JSON.parse(f.payloadJson), null, 2);
                          } catch {
                            // biarkan apa adanya bila tidak terurai
                          }
                          setPratinjauJson({
                            judul: `Bundle HL7 FHIR ${f.tipeSumberDaya} — ${f.id}`,
                            endpoint: `POST ${konfigurasi.endpointSatuSehat}`,
                            isi: rapi
                          });
                        }}
                        className={tombolSekunder}
                      >
                        <FileJson className="w-3.5 h-3.5" />
                        FHIR
                      </button>

                      {f.status === 'Ditolak (OperationOutcome)' || f.status === 'Belum Terkirim' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setPerbaikanFhir(f);
                            setFormPerbaikan({
                              kodeFasyankes: f.kodeFasyankes || 'FKN-RS-0132-TERPETAKAN',
                              suhuRantaiDingin: f.suhuRantaiDingin,
                              catatan: 'Kode organisasi fasyankes telah dipetakan ulang pada master SATUSEHAT.'
                            });
                          }}
                          className={tombolPrimerGudang}
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          Perbaiki &amp; Kirim
                        </button>
                      ) : f.status === 'Antre' ? (
                        <button
                          type="button"
                          onClick={() => {
                            db.ubahStatusKirimanSatuSehat(
                              f.id,
                              'Diterima (201)',
                              'HTTP 201 Created — Bundle diterima sandbox SATUSEHAT Kemenkes.'
                            );
                            setPesan({
                              tipe: 'sukses',
                              teks: `Kiriman FHIR ${f.id} ditandai Diterima (201).`
                            });
                            segarkan();
                          }}
                          className={tombolPrimerGudang}
                        >
                          <Send className="w-3.5 h-3.5" />
                          Kirim (201)
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Modal Tambah Webhook LKPP */}
      {modalLkppBaru && (
        <Modal
          judul="Antrekan Sinkronisasi Stok e-Katalog LKPP"
          keterangan="Menyusun payload kuantitas stok bebas saat ini untuk paket kontrak e-Katalog."
          onClose={() => setModalLkppBaru(false)}
        >
          <form onSubmit={antrekanLkpp} className="space-y-3 text-xs">
            <div>
              <label className={labelClass}>Pilih SKU Katalog</label>
              <select
                value={formLkpp.kodeSKU}
                onChange={(e) => setFormLkpp({ ...formLkpp, kodeSKU: e.target.value })}
                className={inputClass}
              >
                {skuUnik.map((s) => (
                  <option key={s.kodeSKU} value={s.kodeSKU}>
                    {s.kodeSKU} — {s.namaAlkes} (Bebas: {s.bebas} {s.satuan})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Nomor Paket Kontrak LKPP</label>
              <input
                type="text"
                required
                value={formLkpp.nomorPaketLkpp}
                onChange={(e) => setFormLkpp({ ...formLkpp, nomorPaketLkpp: e.target.value })}
                className={`${inputClass} font-mono`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Pemicu Sinkronisasi</label>
                <select
                  value={formLkpp.pemicu}
                  onChange={(e) =>
                    setFormLkpp({
                      ...formLkpp,
                      pemicu: e.target.value as SinkronisasiLkpp['pemicu']
                    })
                  }
                  className={inputClass}
                >
                  <option value="Perubahan Stok">Perubahan Stok</option>
                  <option value="Pengiriman">Pengiriman</option>
                  <option value="Karantina">Karantina (Tahan Etalase)</option>
                  <option value="Kerusakan">Kerusakan</option>
                  <option value="Recall">Recall (Tangguhkan Katalog)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Nomor Bets Terkait</label>
                <input
                  type="text"
                  value={formLkpp.nomorBets}
                  onChange={(e) =>
                    setFormLkpp({ ...formLkpp, nomorBets: e.target.value.toUpperCase() })
                  }
                  className={`${inputClass} font-mono uppercase`}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalLkppBaru(false)}
                className={tombolSekunder}
              >
                Batal
              </button>
              <button type="submit" className={tombolPrimerGudang}>
                Masukkan ke Antrean Webhook
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Builder Bundle FHIR */}
      {modalFhirBaru && (
        <Modal
          judul="Bangun Bundle HL7 FHIR SATUSEHAT Logistik"
          keterangan="Suhu di luar 2°C – 8°C atau kode fasyankes kosong otomatis ditahan oleh validator sebelum dikirim."
          onClose={() => setModalFhirBaru(false)}
        >
          <form onSubmit={tambahBundleFhir} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tipe Sumber Daya FHIR</label>
                <select
                  value={formFhir.tipeSumberDaya}
                  onChange={(e) =>
                    setFormFhir({
                      ...formFhir,
                      tipeSumberDaya: e.target.value as KirimanSatuSehat['tipeSumberDaya']
                    })
                  }
                  className={inputClass}
                >
                  <option value="SupplyDelivery">SupplyDelivery (Pengiriman Alkes)</option>
                  <option value="Device">Device (Registrasi Nomor Seri)</option>
                  <option value="Immunization">Immunization (Rantai Dingin)</option>
                  <option value="Organization">Organization (Profil SDAK Penyalur)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Nomor Dokumen Rujukan</label>
                <input
                  type="text"
                  required
                  value={formFhir.nomorRujukan}
                  onChange={(e) => setFormFhir({ ...formFhir, nomorRujukan: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Kode Fasyankes SATUSEHAT</label>
                <input
                  type="text"
                  value={formFhir.kodeFasyankes}
                  onChange={(e) => setFormFhir({ ...formFhir, kodeFasyankes: e.target.value })}
                  placeholder="Contoh: FKN-RS-0041"
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Nama Fasyankes Penerima</label>
                <input
                  type="text"
                  required
                  value={formFhir.namaFasyankes}
                  onChange={(e) => setFormFhir({ ...formFhir, namaFasyankes: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Nomor Bets</label>
                <input
                  type="text"
                  value={formFhir.nomorBets}
                  onChange={(e) =>
                    setFormFhir({ ...formFhir, nomorBets: e.target.value.toUpperCase() })
                  }
                  className={`${inputClass} font-mono uppercase`}
                />
              </div>
              <div>
                <label className={labelClass}>Nomor Serial</label>
                <input
                  type="text"
                  value={formFhir.nomorSerial}
                  onChange={(e) => setFormFhir({ ...formFhir, nomorSerial: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Lampiran Suhu (°C)</label>
                <input
                  type="text"
                  value={formFhir.suhuRantaiDingin}
                  onChange={(e) => setFormFhir({ ...formFhir, suhuRantaiDingin: e.target.value })}
                  placeholder="- atau 4.5°C"
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalFhirBaru(false)}
                className={tombolSekunder}
              >
                Batal
              </button>
              <button type="submit" className={tombolPrimerGudang}>
                Validasi &amp; Simpan Bundle FHIR
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Perbaikan Master Data OperationOutcome */}
      {perbaikanFhir && (
        <Modal
          judul={`Perbaiki Master Data FHIR — ${perbaikanFhir.id}`}
          keterangan="Lengkapi kode fasyankes atau perbaiki lampiran suhu rantai dingin (2°C – 8°C) sebelum kirim ulang."
          onClose={() => setPerbaikanFhir(null)}
        >
          <form onSubmit={simpanPerbaikanDanKirimUlangFhir} className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-2xs text-rose-900">
              <strong>Diagnostik sebelumnya:</strong> {perbaikanFhir.catatan}
            </div>

            <div>
              <label className={labelClass}>Kode Organisasi Fasyankes Terpetakan</label>
              <input
                type="text"
                required
                value={formPerbaikan.kodeFasyankes}
                onChange={(e) =>
                  setFormPerbaikan({ ...formPerbaikan, kodeFasyankes: e.target.value })
                }
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>Lampiran Suhu Rantai Dingin (2°C – 8°C atau -)</label>
              <input
                type="text"
                value={formPerbaikan.suhuRantaiDingin}
                onChange={(e) =>
                  setFormPerbaikan({ ...formPerbaikan, suhuRantaiDingin: e.target.value })
                }
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>Catatan Perbaikan untuk Audit Trail</label>
              <textarea
                rows={2}
                value={formPerbaikan.catatan}
                onChange={(e) => setFormPerbaikan({ ...formPerbaikan, catatan: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPerbaikanFhir(null)}
                className={tombolSekunder}
              >
                Batal
              </button>
              <button type="submit" className={tombolPrimerGudang}>
                <Send className="w-3.5 h-3.5" />
                Bangun Ulang &amp; Kirim ke SATUSEHAT
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Pratinjau Payload JSON */}
      {pratinjauJson && (
        <Modal
          judul={pratinjauJson.judul}
          keterangan={pratinjauJson.endpoint}
          onClose={() => setPratinjauJson(null)}
        >
          <div className="space-y-3 text-xs">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto font-mono text-2xs leading-relaxed max-h-96">
              {pratinjauJson.isi}
            </pre>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => salinTeks(pratinjauJson.isi)}
                className={tombolPrimerGudang}
              >
                <Copy className="w-3.5 h-3.5" />
                Salin Payload JSON
              </button>
              <button
                type="button"
                onClick={() => setPratinjauJson(null)}
                className={tombolSekunder}
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
