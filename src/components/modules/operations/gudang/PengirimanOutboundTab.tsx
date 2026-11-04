import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { PenjualanAlkes, StatusSuratJalan, SuratJalan } from '../../../../types';
import { gerbangSuratJalan, susunRutePicking } from '../../../../utils/gudang';
import {
  CheckCircle2,
  MapPin,
  Printer,
  Route,
  ShieldAlert,
  Truck
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
  waktuMutasiMonoton,
  type Tone
} from './ui';

interface Props {
  dariAcuan: Date;
  onOpenPrintModal?: () => void;
  onPerubahanData: () => void;
}

const ALUR_SURAT_JALAN: StatusSuratJalan[] = [
  'Antre Picking',
  'Rute Tersusun',
  'Sedang Picking',
  'Selesai Packing',
  'Dimuat',
  'Terkirim',
  'Diterima Penerima'
];

const toneStatusSj = (st: StatusSuratJalan): Tone => {
  if (st === 'Diterima Penerima') return 'emerald';
  if (st === 'Terkirim' || st === 'Dimuat') return 'blue';
  if (st === 'Antre Picking') return 'rose';
  return 'amber';
};

export default function PengirimanOutboundTab({
  dariAcuan,
  onOpenPrintModal,
  onPerubahanData
}: Props) {
  const [sjList, setSjList] = useState<SuratJalan[]>(() => db.getSuratJalan());
  const [pesananList, setPesananList] = useState<PenjualanAlkes[]>(() => db.getPenjualan());
  const [binList] = useState(() => db.getLokasiBin());
  const konfigurasi = useMemo(() => db.getKonfigurasiGudang(), [sjList]);

  const [filterStatus, setFilterStatus] = useState<'Semua' | StatusSuratJalan>('Semua');
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'tolak'; teks: string } | null>(null);
  const [targetManifes, setTargetManifes] = useState<SuratJalan | null>(null);
  const [formManifes, setFormManifes] = useState({
    status: 'Rute Tersusun' as StatusSuratJalan,
    pengangkut: 'Armada Internal' as SuratJalan['pengangkut'],
    namaKurir: '',
    nomorLacak: '',
    statusEFaktur: 'Terbit' as SuratJalan['statusEFaktur'],
    nomorFaktur: '',
    nomorPaketLkpp: '',
    catatan: ''
  });

  const segarkan = () => {
    setSjList(db.getSuratJalan());
    setPesananList(db.getPenjualan());
    onPerubahanData();
  };

  const pesananAntreFefo = useMemo(
    () =>
      pesananList.filter(
        (p) => p.statusKirim === 'Menunggu Alokasi FEFO' || p.statusKirim === 'Verifikasi Pesanan'
      ),
    [pesananList]
  );

  const daftarTampil = useMemo(
    () => (filterStatus === 'Semua' ? sjList : sjList.filter((s) => s.status === filterStatus)),
    [sjList, filterStatus]
  );

  const susunRute = (sj: SuratJalan) => {
    const hasil = db.susunRuteSuratJalan(sj.id, dariAcuan);
    setPesan({
      tipe: hasil.boleh ? 'sukses' : 'tolak',
      teks: hasil.boleh
        ? `Rute picking tersusun: ${hasil.keterangan}`
        : `Gerbang Surat Jalan menahan penyusunan rute ${sj.nomorPesanan}: ${hasil.keterangan}`
    });
    segarkan();
  };

  const eksekusiFefoSalesOrder = (so: PenjualanAlkes) => {
    const waktu = waktuMutasiMonoton(dariAcuan, db.getJejakPergerakan());
    const hasil = db.catatPengirimanSalesOrder(so.id, waktu);
    setPesan({
      tipe: hasil.boleh ? 'sukses' : 'tolak',
      teks: hasil.boleh
        ? `Eksekusi FEFO ${so.nomorPesanan} tuntas: Surat Jalan ${hasil.nomorSuratJalan} & Faktur ${hasil.nomorFaktur} terbit (${hasil.bets.map((b) => `${b.nomorBets}:${b.diambil}`).join(', ')}).`
        : `Gerbang FEFO menahan ${so.nomorPesanan}: ${hasil.keterangan}`
    });
    segarkan();
  };

  const simpanManifes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetManifes) return;

    // Penjaga §1 Tab 7: Surat jalan tidak dapat terbit/dikirim bila rute belum tersusun atau alokasi FEFO kurang
    if (formManifes.status !== 'Antre Picking') {
      const pesanan = pesananList.find(
        (p) => p.id === targetManifes.penjualanId || p.nomorPesanan === targetManifes.nomorPesanan
      );
      const qtyDiminta = pesanan?.jumlah ?? targetManifes.qtyTotal;
      const qtyTerkumpul = targetManifes.rute.reduce((t, r) => t + r.qty, 0);
      const gerbang = gerbangSuratJalan({
        rute: targetManifes.rute,
        qtyDiminta,
        qtyTerkumpul,
        prefixSuratJalan: konfigurasi.prefixSuratJalan,
        nomorPesanan: targetManifes.nomorPesanan,
        dari: dariAcuan
      });
      if (!gerbang.bolehTerbit) {
        setPesan({
          tipe: 'tolak',
          teks: `Gerbang Surat Jalan memblokir status "${formManifes.status}": ${gerbang.sebab.join('; ')}.`
        });
        return;
      }
    }

    db.ubahSuratJalan(
      targetManifes.id,
      {
        status: formManifes.status,
        pengangkut: formManifes.pengangkut,
        namaKurir: formManifes.namaKurir.trim(),
        nomorLacak: formManifes.nomorLacak.trim(),
        statusEFaktur: formManifes.statusEFaktur,
        nomorFaktur: formManifes.nomorFaktur.trim(),
        nomorPaketLkpp: formManifes.nomorPaketLkpp.trim(),
        catatan: formManifes.catatan.trim()
      },
      `Pembaruan manifes kurir & tahap pengiriman (${formManifes.status})`
    );
    setTargetManifes(null);
    setPesan({ tipe: 'sukses', teks: `Manifes & tahap pengiriman ${targetManifes.nomorSuratJalan || targetManifes.nomorPesanan} diperbarui.` });
    segarkan();
  };

  return (
    <div className="space-y-5">
      {pesan && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs flex items-start justify-between gap-3 ${
            pesan.tipe === 'tolak'
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          <div className="flex items-start gap-2">
            {pesan.tipe === 'tolak' ? (
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
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
          label="Total Surat Jalan (DO)"
          value={sjList.length}
          hint="Alur 7 tahap dari picking sampai bukti terima"
          tone="amber"
        />
        <Stat
          label="Antre Picking / Rute Kosong"
          value={sjList.filter((s) => s.status === 'Antre Picking' || s.rute.length === 0).length}
          hint="Tertahan gerbang sebelum rute & stok cukup"
          tone={sjList.some((s) => s.status === 'Antre Picking') ? 'rose' : 'emerald'}
        />
        <Stat
          label="Sales Order Menunggu FEFO"
          value={pesananAntreFefo.length}
          hint="Siap dieksekusi ke kartu stok & piutang"
          tone="blue"
        />
        <Stat
          label="e-Faktur Terbit Sinkron Keuangan"
          value={sjList.filter((s) => s.statusEFaktur === 'Terbit').length}
          hint={`Dari ${sjList.length} dokumen pengiriman`}
          tone="emerald"
        />
      </div>

      {/* Antrean Sales Order Siap Eksekusi FEFO */}
      <Panel
        judul="Antrean Pesanan Penjualan Siap Eksekusi FEFO Sadar-Kunci"
        keterangan="Menjalankan eksekusi di bawah ini mengalokasikan bets AVAILABLE tertua, memotong kartu stok & kuota dipesan, menyusun rute picking terpendek, menerbitkan Surat Jalan + e-Faktur + piutang Keuangan, dan mengantrekan webhook LKPP bila berjalur e-Katalog."
      >
        {pesananAntreFefo.length === 0 ? (
          <p className="text-xs text-slate-600">Seluruh Sales Order aktif telah dieksekusi pengirimannya.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-4">Nomor Pesanan & Jalur</th>
                  <th className="py-2.5 px-4">Fasyankes Tujuan</th>
                  <th className="py-2.5 px-4">Produk & Jumlah</th>
                  <th className="py-2.5 px-4">Status Saat Ini</th>
                  <th className="py-2.5 px-4 text-right">Eksekusi Gudang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pesananAntreFefo.map((so) => (
                  <tr key={so.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{so.nomorPesanan}</div>
                      <div className="text-2xs text-slate-500">{so.jalurPenjualan}</div>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">{so.fasyankes}</td>
                    <td className="py-2.5 px-4 tabular-nums">
                      <div className="font-semibold text-slate-900">{so.namaAlkes}</div>
                      <div className="text-2xs text-slate-500">{so.jumlah} {so.satuan} · Bets awal {so.nomorBets}</div>
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge tone="amber">{so.statusKirim}</Badge>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => eksekusiFefoSalesOrder(so)}
                        className={tombolPrimerGudang}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Eksekusi FEFO & Terbitkan SJ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* Daftar Surat Jalan & Rute Picking */}
      <Panel
        judul="Surat Jalan (Delivery Order), Rute Picking Terpendek & Manifes 3PL"
        keterangan="Urutan langkah pengambilan diurutkan berdasarkan Lorong → Baris → Rak → Laci dan jarak dari dock untuk menghemat tempuhan operator."
        aksi={
          <div className="flex items-center gap-1 flex-wrap">
            {(['Semua', ...ALUR_SURAT_JALAN] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={chipFilter(filterStatus === st)}
              >
                {st}
              </button>
            ))}
          </div>
        }
      >
        <div className="space-y-3">
          {daftarTampil.map((sj) => {
            const detailRute =
              sj.rute.length > 0
                ? susunRutePicking({
                    item: sj.rute.map((r) => ({ binId: r.binId, nomorBets: r.nomorBets, qty: r.qty })),
                    daftarBin: binList
                  })
                : null;
            return (
              <div key={sj.id} className="rounded-xl border border-slate-200 p-4 space-y-3 hover:border-slate-300 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-amber-900">
                        {sj.nomorSuratJalan || `(Belum Terbit — ${sj.nomorPesanan})`}
                      </span>
                      <Badge tone={toneStatusSj(sj.status)}>{sj.status}</Badge>
                      <Badge tone={sj.statusEFaktur === 'Terbit' ? 'emerald' : 'amber'}>
                        e-Faktur: {sj.statusEFaktur} {sj.nomorFaktur ? `(${sj.nomorFaktur})` : ''}
                      </Badge>
                      {sj.nomorPaketLkpp && (
                        <Badge tone={sj.statusSyncLkpp === 'Tersinkron' ? 'blue' : 'amber'}>
                          LKPP {sj.nomorPaketLkpp}: {sj.statusSyncLkpp}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-600">
                      Tujuan: <strong className="text-slate-900">{sj.fasyankesTujuan}</strong> · Pesanan {sj.nomorPesanan} · Total {sj.qtyTotal} {sj.satuan} · Tanggal {sj.tanggalTerbit}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {sj.rute.length === 0 && (
                      <button
                        type="button"
                        onClick={() => susunRute(sj)}
                        className={tombolPrimerGudang}
                      >
                        <Route className="w-3.5 h-3.5" />
                        Susun Rute FEFO
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setTargetManifes(sj);
                        setFormManifes({
                          status: sj.status,
                          pengangkut: sj.pengangkut,
                          namaKurir: sj.namaKurir,
                          nomorLacak: sj.nomorLacak,
                          statusEFaktur: sj.statusEFaktur,
                          nomorFaktur: sj.nomorFaktur,
                          nomorPaketLkpp: sj.nomorPaketLkpp,
                          catatan: sj.catatan
                        });
                      }}
                      className={tombolSekunder}
                    >
                      Manifes & Tahap
                    </button>
                    {onOpenPrintModal && sj.nomorSuratJalan && (
                      <button type="button" onClick={onOpenPrintModal} className={tombolSekunder}>
                        <span className="inline-flex items-center gap-1">
                          <Printer className="w-3.5 h-3.5" />
                          Cetak SJ
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Rute Picking & Kurir */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
                  <div className="lg:col-span-2">
                    <div className="text-2xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
                      <span>Urutan Rute Picking Antar Bin:</span>
                      {detailRute && (
                        <span className="font-mono tabular-nums text-emerald-700">
                          Total {sj.jarakTotalMeter} m {detailRute.hematMeter > 0 ? `(hemat ${detailRute.hematMeter} m)` : ''} · Lorong {detailRute.lorongTerlibat.join(', ')}
                        </span>
                      )}
                    </div>
                    {sj.rute.length === 0 ? (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900 text-2xs">
                        Rute belum tersusun. Gerbang pengiriman menahan penerbitan Surat Jalan sampai alokasi FEFO mencukupi.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {sj.rute.map((langkah) => (
                          <div
                            key={`${sj.id}-${langkah.urutan}`}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-2xs tabular-nums flex items-center gap-2"
                          >
                            <span className="font-bold text-amber-800">#{langkah.urutan}</span>
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="font-bold text-slate-900">{langkah.kodeBin}</span>
                            <span className="text-slate-600">({langkah.nomorBets} · {langkah.qty} {sj.satuan} · {langkah.jarakMeter} m)</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 space-y-1 text-2xs">
                    <div className="font-semibold text-slate-700">Manifes Ekspedisi / 3PL:</div>
                    <div className="text-slate-800">Moda: <strong>{sj.pengangkut}</strong> {sj.namaKurir ? `· ${sj.namaKurir}` : ''}</div>
                    <div className="font-mono text-slate-600">Resi/AWB: {sj.nomorLacak || '-'}</div>
                    {sj.catatan && <div className="text-slate-500">{sj.catatan}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Modal Manifes & Status 7 Tahap */}
      {targetManifes && (
        <Modal
          judul={`Manifes & Status Pengiriman — ${targetManifes.nomorSuratJalan || targetManifes.nomorPesanan}`}
          keterangan="Tahap di atas Antre Picking hanya diizinkan oleh gerbang apabila rute picking telah tersusun penuh."
          onClose={() => setTargetManifes(null)}
        >
          <form onSubmit={simpanManifes} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tahap Alur Pengiriman (7 Tahap)</label>
                <select
                  value={formManifes.status}
                  onChange={(e) => setFormManifes({ ...formManifes, status: e.target.value as StatusSuratJalan })}
                  className={inputClass}
                >
                  {ALUR_SURAT_JALAN.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Moda Pengangkut</label>
                <select
                  value={formManifes.pengangkut}
                  onChange={(e) => setFormManifes({ ...formManifes, pengangkut: e.target.value as SuratJalan['pengangkut'] })}
                  className={inputClass}
                >
                  <option value="Armada Internal">Armada Internal (Berpendingin)</option>
                  <option value="3PL Ekspedisi">3PL Ekspedisi Medis</option>
                  <option value="Kargo Udara">Kargo Udara</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Nama Kurir / Ekspedisi</label>
                <input
                  type="text"
                  value={formManifes.namaKurir}
                  onChange={(e) => setFormManifes({ ...formManifes, namaKurir: e.target.value })}
                  placeholder="Contoh: Armada Box Medis B-9124-TCD"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Nomor Lacak / Resi Manifes</label>
                <input
                  type="text"
                  value={formManifes.nomorLacak}
                  onChange={(e) => setFormManifes({ ...formManifes, nomorLacak: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Status e-Faktur</label>
                <select
                  value={formManifes.statusEFaktur}
                  onChange={(e) => setFormManifes({ ...formManifes, statusEFaktur: e.target.value as SuratJalan['statusEFaktur'] })}
                  className={inputClass}
                >
                  <option value="Belum Terbit">Belum Terbit</option>
                  <option value="Terbit">Terbit</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Nomor Faktur Keuangan</label>
                <input
                  type="text"
                  value={formManifes.nomorFaktur}
                  onChange={(e) => setFormManifes({ ...formManifes, nomorFaktur: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Nomor Paket LKPP</label>
                <input
                  type="text"
                  value={formManifes.nomorPaketLkpp}
                  onChange={(e) => setFormManifes({ ...formManifes, nomorPaketLkpp: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Catatan Serah Terima</label>
              <input
                type="text"
                value={formManifes.catatan}
                onChange={(e) => setFormManifes({ ...formManifes, catatan: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setTargetManifes(null)} className={tombolSekunder}>Batal</button>
              <button type="submit" className={tombolPrimerGudang}>Simpan Perubahan</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
