import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { PenjualanAlkes, PurchaseOrderAlkes } from '../../../../types';
import { proyeksikanPermintaan, statusLimitKredit } from '../../../../utils/sales';
import {
  ChartColumn,
  Activity,
  TrendingUp,
  TrendingDown,
  Target,
  Gauge,
  ShoppingCart,
  Boxes,
  ArrowRight,
  MapPinned
} from 'lucide-react';
import {
  Badge,
  Panel,
  Stat,
  BarCapaian,
  formatRupiah,
  formatTanggal,
  formatPersen,
  inputClass,
  labelClass,
  tombolPrimer,
  type Tone
} from './ui';

const NAMA_BULAN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

const tonePeramalan = (status: 'Risiko Stockout' | 'Aman' | 'Risiko Overstock'): Tone =>
  status === 'Risiko Stockout' ? 'rose' : status === 'Risiko Overstock' ? 'amber' : 'emerald';

const labelBulan = (bulan: string) => {
  const [tahun, nomor] = bulan.split('-');
  return `${NAMA_BULAN[Number(nomor) - 1] ?? bulan} ${tahun ? `'${tahun.slice(2)}` : ''}`;
};

export default function AnalitikSalesModule() {
  const [riwayat] = useState(db.getRiwayatPenjualanBulanan());
  const [pesanan] = useState<PenjualanAlkes[]>(db.getPenjualan());
  const [teritorial] = useState(db.getTeritorial());
  const [pelanggan] = useState(db.getPelangganB2B());
  const [prospek] = useState(db.getProspek());
  const [stok] = useState(db.getStokGudang());
  const [pemasok] = useState(db.getPemasok());
  const [terbitPO, setTerbitPO] = useState<string[]>([]);

  const [leadTimeHari, setLeadTimeHari] = useState(21);
  const [safetyStockHari, setSafetyStockHari] = useState(14);

  const daftarProduk = useMemo(() => Array.from(new Set(riwayat.map((r) => r.namaAlkes))), [riwayat]);

  const perBulan = useMemo(() => {
    const peta = new Map<string, { unit: number; nilai: number }>();
    riwayat.forEach((r) => {
      const sebelumnya = peta.get(r.bulan) ?? { unit: 0, nilai: 0 };
      peta.set(r.bulan, { unit: sebelumnya.unit + r.unitTerjual, nilai: sebelumnya.nilai + r.nilaiPenjualan });
    });
    return Array.from(peta.entries())
      .map(([bulan, angka]) => ({ bulan, ...angka }))
      .sort((a, b) => a.bulan.localeCompare(b.bulan));
  }, [riwayat]);

  const perProduk = useMemo(
    () =>
      daftarProduk
        .map((namaAlkes) => {
          const baris = riwayat.filter((r) => r.namaAlkes === namaAlkes);
          const kategori = baris[0]?.kategoriProduk ?? '-';
          return {
            namaAlkes,
            kategori,
            unit: baris.reduce((total, r) => total + r.unitTerjual, 0),
            nilai: baris.reduce((total, r) => total + r.nilaiPenjualan, 0)
          };
        })
        .sort((a, b) => b.nilai - a.nilai),
    [riwayat, daftarProduk]
  );

  const perRayon = useMemo(() => {
    const peta = new Map<string, { unit: number; nilai: number }>();
    riwayat.forEach((r) => {
      const sebelumnya = peta.get(r.rayonDistribusi) ?? { unit: 0, nilai: 0 };
      peta.set(r.rayonDistribusi, { unit: sebelumnya.unit + r.unitTerjual, nilai: sebelumnya.nilai + r.nilaiPenjualan });
    });
    return peta;
  }, [riwayat]);

  const perMedRep = useMemo(() => {
    const nama = new Map<string, { prospek: number; pipeline: number; kunjungan: number }>();
    prospek.forEach((p) => {
      const sebelumnya = nama.get(p.medRep) ?? { prospek: 0, pipeline: 0, kunjungan: 0 };
      nama.set(p.medRep, {
        prospek: sebelumnya.prospek + 1,
        pipeline: sebelumnya.pipeline + (p.nilaiEstimasi * p.probabilitasPersen) / 100,
        kunjungan: sebelumnya.kunjungan
      });
    });
    db.getKunjunganMedRep().forEach((k) => {
      const sebelumnya = nama.get(k.medRep) ?? { prospek: 0, pipeline: 0, kunjungan: 0 };
      nama.set(k.medRep, { ...sebelumnya, kunjungan: sebelumnya.kunjungan + 1 });
    });
    return Array.from(nama.entries())
      .map(([medRep, angka]) => ({ medRep, ...angka }))
      .sort((a, b) => b.pipeline - a.pipeline);
  }, [prospek]);

  const totalUnit = riwayat.reduce((total, r) => total + r.unitTerjual, 0);
  const totalNilai = riwayat.reduce((total, r) => total + r.nilaiPenjualan, 0);
  const bulanMax = Math.max(...perBulan.map((b) => b.nilai), 1);
  const produkMax = perProduk[0]?.nilai ?? 1;

  const peramalan = useMemo(
    () =>
      daftarProduk.map((namaAlkes) => {
        const stokProduk = stok
          .filter((s) => s.namaAlkes === namaAlkes && s.tanggalKedaluwarsa >= new Date().toISOString().split('T')[0])
          .reduce((total, s) => total + s.jumlahStok, 0);
        return proyeksikanPermintaan(riwayat, namaAlkes, stokProduk, { leadTimeHari, safetyStockHari });
      }),
    [daftarProduk, riwayat, stok, leadTimeHari, safetyStockHari]
  );

  const risikoStockout = peramalan.filter((p) => p.status === 'Risiko Stockout');
  const risikoOverstock = peramalan.filter((p) => p.status === 'Risiko Overstock');

  const rataPiutangRasio = useMemo(() => {
    const aktif = pelanggan.filter((p) => p.statusPelanggan === 'Aktif');
    if (aktif.length === 0) return 0;
    return aktif.reduce((total, p) => total + statusLimitKredit(p).rasioPersen, 0) / aktif.length;
  }, [pelanggan]);

  const ajukanPurchaseOrder = (hasil: (typeof peramalan)[number]) => {
    const acuanHarga = perProduk.find((p) => p.namaAlkes === hasil.namaAlkes);
    const bulanTerjual = riwayat.filter((r) => r.namaAlkes === hasil.namaAlkes).length || 1;
    const rataJualPerUnit = acuanHarga ? acuanHarga.nilai / (acuanHarga.unit || 1) : 0;
    const estimasiHpp = Math.round(rataJualPerUnit * 0.75);
    const pemasokTerpilih = pemasok[0];
    const estimasiTiba = new Date();
    estimasiTiba.setDate(estimasiTiba.getDate() + leadTimeHari);

    const po: PurchaseOrderAlkes = {
      id: 'PO-' + Date.now(),
      nomorPO: `PO-IMP-${new Date().getFullYear()}-${String(db.getPurchaseOrder().length + 101).padStart(3, '0')}`,
      pemasokId: pemasokTerpilih?.id ?? '-',
      namaPemasok: pemasokTerpilih?.namaPemasok ?? 'Prinsipal Belum Terpilih',
      tanggalPO: new Date().toISOString().split('T')[0],
      estimasiTiba: estimasiTiba.toISOString().split('T')[0],
      totalNilai: estimasiHpp * hasil.saranPesanan,
      status: 'Diajukan',
      catatanPJT: `Pengajuan otomatis Demand Forecasting ${bulanTerjual} bulan: proyeksi ${hasil.proyeksiBulanBerikutnya} unit/bulan, titik pesan ulang ${hasil.titikPesanUlang} unit. Jumlah diajukan ${hasil.saranPesanan} unit.`
    };
    db.addPurchaseOrder(po);
    setTerbitPO((sebelumnya) => [...sebelumnya, po.nomorPO]);
    db.logAudit(
      'Sales & Marketing — Analitik',
      'Pengajuan Purchase Order dari hasil peramalan permintaan',
      po.nomorPO,
      'Manajer Penjualan',
      'Sales & Marketing',
      [{ kolom: 'status', nilaiLama: 'belum ada pengajuan', nilaiBaru: 'Diajukan' }]
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Nilai Penjualan Historis"
          value={formatRupiah(totalNilai)}
          hint={`${totalUnit} unit tercatat pada ${perBulan.length} periode bulan`}
          tone="emerald"
        />
        <Stat
          label="Sales Order Aktif"
          value={pesanan.filter((s) => s.statusKirim !== 'Dibatalkan' && s.statusKirim !== 'Diterima Fasyankes').length}
          hint={`Dari ${pesanan.length} pesanan terdaftar • nilai ${formatRupiah(pesanan.reduce((t, s) => t + s.totalHarga, 0))}`}
          tone="blue"
        />
        <Stat
          label="Risiko Stok"
          value={`${risikoStockout.length} stockout / ${risikoOverstock.length} overstock`}
          hint="Berdasarkan titik pesan ulang dan proyeksi bulan berikutnya"
          tone={risikoStockout.length ? 'rose' : 'emerald'}
        />
        <Stat
          label="Rata-rata Paparan Kredit"
          value={formatPersen(rataPiutangRasio, 0)}
          hint="Rasio piutang berjalan terhadap pagu kredit pelanggan aktif"
          tone={rataPiutangRasio > 85 ? 'rose' : rataPiutangRasio > 60 ? 'amber' : 'emerald'}
        />
      </div>

      <Panel
        judul="Sales Performance Dashboard"
        keterangan="Capaian bulanan, kontribusi produk, realisasi per rayon terhadap target tahunan, dan peringkat med rep berdasarkan nilai pipeline tertimbang probabilitas."
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <h4 className="text-[11px] font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Tren nilai penjualan per bulan
            </h4>
            <div className="space-y-1.5">
              {perBulan.map((b) => (
                <div key={b.bulan} className="flex items-center gap-2">
                  <span className="w-14 text-[10px] font-mono text-slate-500 shrink-0">{labelBulan(b.bulan)}</span>
                  <div className="flex-1 h-5 rounded bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded bg-emerald-600/85"
                      style={{ width: `${Math.max((b.nilai / bulanMax) * 100, 2)}%` }}
                    />
                  </div>
                  <span className="w-28 text-right text-[10px] font-mono font-semibold text-slate-700 shrink-0">
                    {formatRupiah(b.nilai)}
                  </span>
                  <span className="w-14 text-right text-[10px] font-mono text-slate-500 shrink-0">{b.unit} unit</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              Batang memakai skala nilai penjualan relatif terhadap bulan tertinggi pada periode yang sama.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <ChartColumn className="w-3.5 h-3.5 text-emerald-600" />
              Kontribusi produk terhadap pendapatan
            </h4>
            <div className="space-y-2">
              {perProduk.map((p) => (
                <div key={p.namaAlkes} className="rounded-lg border border-slate-200 p-2.5">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-slate-800">{p.namaAlkes}</span>
                    <span className="text-[10px] font-mono text-slate-500">{formatPersen((p.nilai / produkMax) * 100, 0)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-1">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max((p.nilai / produkMax) * 100, 2)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{p.kategori}</span>
                    <span className="font-mono">
                      {p.unit} unit • {formatRupiah(p.nilai)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <MapPinned className="w-3.5 h-3.5 text-emerald-600" />
              Capaian target tahunan per rayon
            </h4>
            <div className="space-y-3">
              {teritorial.map((t) => {
                const realisasiRayon = perRayon.get(t.namaRayon)?.nilai ?? 0;
                const capaian = t.targetTahunan > 0 ? (realisasiRayon / t.targetTahunan) * 100 : 0;
                return (
                  <BarCapaian
                    key={t.id}
                    label={`${t.namaRayon} (${t.medRep})`}
                    persen={capaian}
                    hint={`Realisasi riwayat rayon ${formatRupiah(realisasiRayon)} dari target ${formatRupiah(t.targetTahunan)} • Ytd sistem ${formatRupiah(t.realisasiYtd)}`}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold text-slate-800 mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              Peringkat med rep
            </h4>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-2.5 px-3">Med Rep</th>
                    <th className="py-2.5 px-3">Prospek</th>
                    <th className="py-2.5 px-3">Kunjungan</th>
                    <th className="py-2.5 px-3 text-right">Pipeline Tertimbang</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perMedRep.map((m) => (
                    <tr key={m.medRep}>
                      <td className="py-2 px-3 font-semibold text-slate-800">{m.medRep}</td>
                      <td className="py-2 px-3 text-slate-600">{m.prospek}</td>
                      <td className="py-2 px-3 text-slate-600">{m.kunjungan}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">{formatRupiah(m.pipeline)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Funnel Sales Order berdasarkan status pengiriman
              </div>
              {(['Verifikasi Pesanan', 'Menunggu Alokasi FEFO', 'Terkirim', 'Diterima Fasyankes', 'Dibatalkan'] as const).map((status) => {
                const jumlah = pesanan.filter((s) => s.statusKirim === status).length;
                const persen = pesanan.length > 0 ? (jumlah / pesanan.length) * 100 : 0;
                return (
                  <div key={status} className="flex items-center justify-between text-[10px] py-1">
                    <span className="text-slate-600">{status}</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {jumlah} <span className="text-slate-400">({formatPersen(persen, 0)})</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {terbitPO.length > 0 && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-900 flex items-start gap-2">
            <ShoppingCart className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Purchase Order berhasil diajukan dari peramalan: {terbitPO.join(', ')}. Status tercatat Diajukan dan
              menunggu persetujuan PJT pada modul Purchasing &amp; Procurement.
            </span>
          </div>
        )}
      </Panel>

      <Panel
        judul="Demand Forecasting"
        keterangan="Proyeksi permintaan moving-average tiga bulan terakhir dengan penyesuaian tren (dibatasi ±25%), titik pesan ulang dari lead time dan safety stock, serta saran pengajuan Purchase Order."
        aksi={
          <div className="flex items-end gap-3">
            <div>
              <label className={labelClass}>Lead Time (hari)</label>
              <input
                type="number"
                min={1}
                max={120}
                value={leadTimeHari}
                onChange={(e) => setLeadTimeHari(Number(e.target.value))}
                className={`${inputClass} w-24`}
              />
            </div>
            <div>
              <label className={labelClass}>Safety Stock (hari)</label>
              <input
                type="number"
                min={1}
                max={120}
                value={safetyStockHari}
                onChange={(e) => setSafetyStockHari(Number(e.target.value))}
                className={`${inputClass} w-24`}
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Rata-rata / Bulan</th>
                <th className="py-3 px-4">Tren</th>
                <th className="py-3 px-4">Proyeksi Bulan Depan</th>
                <th className="py-3 px-4">Titik Pesan Ulang</th>
                <th className="py-3 px-4">Stok Aktif Sekarang</th>
                <th className="py-3 px-4">Status Risiko</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {peramalan.map((h) => (
                <tr key={h.namaAlkes} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{h.namaAlkes}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{h.rataRataBulanan.toFixed(1)} unit</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${h.trenPersen >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {h.trenPersen >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatPersen(h.trenPersen, 1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">{h.proyeksiBulanBerikutnya} unit</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{h.titikPesanUlang} unit</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">{h.stokSekarang} unit</td>
                  <td className="py-3 px-4">
                    <Badge tone={tonePeramalan(h.status)}>
                      <Gauge className="w-3 h-3" />
                      {h.status}
                    </Badge>
                    <div className="text-[10px] text-slate-500 mt-1 max-w-xs leading-relaxed">{h.keterangan}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {h.status === 'Risiko Stockout' ? (
                      <button type="button" className={tombolPrimer} onClick={() => ajukanPurchaseOrder(h)}>
                        <Boxes className="w-3.5 h-3.5" />
                        Ajukan PO {h.saranPesanan} Unit
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        {h.status === 'Risiko Overstock' ? 'tekankan penyaluran FEFO' : 'stok seimbang'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
          Titik pesan ulang = permintaan harian × (lead time + safety stock). Permintaan harian memakai asumsi 26 hari
          kerja per bulan. Stok aktif hanya menghitung bets yang belum kedaluwarsa agar sesuai prinsip FEFO CDAKB.
          Data peramalan per bulan juga tersedia untuk partisi waktu pada skema PostgreSQL produksi.
        </p>
      </Panel>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-[11px] text-slate-600 leading-relaxed">
        <span className="font-bold text-slate-800">Catatan analitik:</span> Dashboard membaca riwayat penjualan bulanan
        {` (${perBulan.map((b) => labelBulan(b.bulan)).join(', ')}`}) dan Sales Order berjalan{' '}
        {pesanan.length > 0 ? `terakhir ${formatTanggal(pesanan[0].tanggalPesanan)}` : 'belum ada'} — seluruh perubahan
        status pesanan tercatat pada audit trail beserta nilai lama dan baru.
      </div>
    </div>
  );
}
