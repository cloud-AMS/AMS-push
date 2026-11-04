import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import {
  AmbangStok,
  ModuleId,
  PurchaseOrderAlkes,
  StokGudang
} from '../../../../types';
import {
  daftarStokPerluKunciAgeing,
  hitungReorderPoint,
  nilaiUmurStok,
  statusTerkunci,
  statusUnitStok,
  stokBebas
} from '../../../../utils/gudang';
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Edit3,
  Lock,
  Plus,
  ShoppingCart,
  TrendingDown
} from 'lucide-react';
import {
  Badge,
  Modal,
  Panel,
  Stat,
  chipFilter,
  formatRupiah,
  inputClass,
  labelClass,
  tombolPrimerGudang,
  tombolSekunder,
  toneStatusStok,
  type Tone
} from './ui';

interface Props {
  dariAcuan: Date;
  onNavigateModule?: (mod: ModuleId) => void;
  onPerubahanData: () => void;
}

const toneRop = (status: 'Aman' | 'Perlu Pesan' | 'Kritis'): Tone => {
  if (status === 'Aman') return 'emerald';
  if (status === 'Perlu Pesan') return 'amber';
  return 'rose';
};

export default function OptimasiStokTab({
  dariAcuan,
  onNavigateModule,
  onPerubahanData
}: Props) {
  const [ambangList, setAmbangList] = useState<AmbangStok[]>(() => db.getAmbangStok());
  const [stokList, setStokList] = useState<StokGudang[]>(() => db.getStokGudang());
  const [poList, setPoList] = useState<PurchaseOrderAlkes[]>(() => db.getPurchaseOrder());
  const [pemasokList] = useState(() => db.getPemasok());
  const [gudangList] = useState(() => db.getGudangFisik());
  const konfigurasi = useMemo(() => db.getKonfigurasiGudang(), [stokList, ambangList]);

  const [filterRop, setFilterRop] = useState<'Semua' | 'Aman' | 'Perlu Pesan' | 'Kritis'>('Semua');
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'peringatan'; teks: string } | null>(null);

  const [modalAmbang, setModalAmbang] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formAmbang, setFormAmbang] = useState({
    kodeSKU: 'ALKES-NEW-01',
    namaAlkes: '',
    rataRataTerjualPerHari: 1,
    leadTimeHari: 14,
    safetyStockHari: 7,
    minStok: 21,
    maxStok: 60,
    gudangId: gudangList[0]?.id ?? 'GDM-01',
    namaPemasok: pemasokList[0]?.namaPemasok ?? 'Shenzhen Mindray Bio-Medical Co., Ltd.',
    isActive: true
  });

  const [modalUsulPo, setModalUsulPo] = useState<{
    ambang: AmbangStok;
    qtyUsulan: number;
    estimasiHargaUnit: number;
    catatan: string;
  } | null>(null);

  const segarkan = () => {
    setAmbangList(db.getAmbangStok());
    setStokList(db.getStokGudang());
    setPoList(db.getPurchaseOrder());
    onPerubahanData();
  };

  // Evaluasi ROP per baris AmbangStok terhadap total stok bebas SKU terkait
  const evaluasiAmbang = useMemo(() => {
    return ambangList.map((ambang) => {
      const barisSku = stokList.filter((s) => s.kodeSKU === ambang.kodeSKU);
      const tersedia = barisSku.reduce((total, s) => total + stokBebas(s), 0);
      const fisikTotal = barisSku.reduce((total, s) => total + s.jumlahStok, 0);
      const rop = hitungReorderPoint(ambang, tersedia);
      return {
        ambang,
        tersedia,
        fisikTotal,
        rop
      };
    });
  }, [ambangList, stokList]);

  const daftarRopTampil = useMemo(() => {
    return evaluasiAmbang.filter((item) =>
      filterRop === 'Semua' ? true : item.rop.status === filterRop
    );
  }, [evaluasiAmbang, filterRop]);

  // Analisis umur stok (Ageing) & kandidat EXPIRED_LOCK
  const kandidatAgeing = useMemo(
    () => daftarStokPerluKunciAgeing({ daftarStok: stokList, konfigurasi, dari: dariAcuan }),
    [stokList, konfigurasi, dariAcuan]
  );

  const sebaranUmur = useMemo(() => {
    return stokList
      .map((s) => ({
        stok: s,
        umur: nilaiUmurStok(s, konfigurasi, dariAcuan),
        statusFisik: statusUnitStok(s)
      }))
      .sort((a, b) => a.umur.sisaHari - b.umur.sisaHari);
  }, [stokList, konfigurasi, dariAcuan]);

  const bukaTambahAmbang = () => {
    setEditId(null);
    setFormAmbang({
      kodeSKU: 'ALKES-',
      namaAlkes: '',
      rataRataTerjualPerHari: 1.5,
      leadTimeHari: 21,
      safetyStockHari: 10,
      minStok: 47,
      maxStok: 95,
      gudangId: gudangList[0]?.id ?? 'GDM-01',
      namaPemasok: pemasokList[0]?.namaPemasok ?? '',
      isActive: true
    });
    setModalAmbang(true);
  };

  const bukaUbahAmbang = (item: AmbangStok) => {
    setEditId(item.id);
    setFormAmbang({
      kodeSKU: item.kodeSKU,
      namaAlkes: item.namaAlkes,
      rataRataTerjualPerHari: item.rataRataTerjualPerHari,
      leadTimeHari: item.leadTimeHari,
      safetyStockHari: item.safetyStockHari,
      minStok: item.minStok,
      maxStok: item.maxStok,
      gudangId: item.gudangId,
      namaPemasok: item.namaPemasok,
      isActive: item.isActive
    });
    setModalAmbang(true);
  };

  const simpanAmbang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmbang.kodeSKU.trim() || !formAmbang.namaAlkes.trim()) return;
    const safety = Math.ceil(formAmbang.rataRataTerjualPerHari * formAmbang.safetyStockHari);
    const ropHitung = Math.ceil(formAmbang.rataRataTerjualPerHari * formAmbang.leadTimeHari) + safety;
    const minStokFinal = Math.max(Number(formAmbang.minStok) || ropHitung, ropHitung);
    const maxStokFinal = Math.max(Number(formAmbang.maxStok) || minStokFinal + 20, minStokFinal + 1);

    if (editId) {
      db.ubahAmbangStok(editId, {
        ...formAmbang,
        minStok: minStokFinal,
        maxStok: maxStokFinal
      });
      setPesan({
        tipe: 'sukses',
        teks: `Parameter Min-Max & Lead Time untuk ${formAmbang.kodeSKU} berhasil diperbarui dan tercatat di jejak audit.`
      });
    } else {
      const urut = ambangList.length + 1;
      const baru: AmbangStok = {
        id: `AMB-${String(urut).padStart(2, '0')}`,
        ...formAmbang,
        kodeSKU: formAmbang.kodeSKU.trim().toUpperCase(),
        minStok: minStokFinal,
        maxStok: maxStokFinal
      };
      db.addAmbangStok(baru);
      setPesan({
        tipe: 'sukses',
        teks: `Ambang stok baru ${baru.kodeSKU} ditambahkan dengan titik pesan (ROP) ${minStokFinal} unit.`
      });
    }
    setModalAmbang(false);
    segarkan();
  };

  const bukaModalUsulPo = (ambang: AmbangStok, usulanQty: number) => {
    setModalUsulPo({
      ambang,
      qtyUsulan: Math.max(usulanQty, 1),
      estimasiHargaUnit: ambang.kodeSKU.startsWith('IVD-') ? 850_000 : 12_500_000,
      catatan: `Usulan otomatis Reorder Point gudang (${ambang.kodeSKU}): stok bebas menyentuh ambang pemesanan dengan lead time ${ambang.leadTimeHari} hari.`
    });
  };

  const kirimUsulanPo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalUsulPo) return;
    const { ambang, qtyUsulan, estimasiHargaUnit, catatan } = modalUsulPo;
    const pemasok = pemasokList.find((p) => p.namaPemasok === ambang.namaPemasok) ?? pemasokList[0];
    const tanggalPO = dariAcuan.toISOString().split('T')[0];
    const estimasiTiba = new Date(dariAcuan.getTime() + ambang.leadTimeHari * 86_400_000)
      .toISOString()
      .split('T')[0];
    const nomorPO = `PO/AMS/${dariAcuan.getFullYear()}/${String(dariAcuan.getMonth() + 1).padStart(2, '0')}/ROP-${String(poList.length + 1).padStart(3, '0')}`;

    const poBaru: PurchaseOrderAlkes = {
      id: `PO-ROP-${Date.now()}`,
      nomorPO,
      pemasokId: pemasok?.id ?? 'SUP-01',
      namaPemasok: ambang.namaPemasok,
      tanggalPO,
      estimasiTiba,
      totalNilai: qtyUsulan * estimasiHargaUnit,
      status: 'Diajukan',
      catatanPJT: `${qtyUsulan} unit ${ambang.namaAlkes} (${ambang.kodeSKU}) — ${catatan}`
    };

    db.addPurchaseOrder(poBaru);
    db.logAudit(
      'Gudang & Logistik — Optimasi Stok',
      `Usulan PO pengisian ulang ROP: ${qtyUsulan} unit ${ambang.kodeSKU} ke ${ambang.namaPemasok}`,
      nomorPO,
      'Kepala Gudang',
      'Operations & Technical',
      [
        { kolom: 'status', nilaiLama: '-', nilaiBaru: 'Diajukan' },
        { kolom: 'kodeSKU', nilaiLama: '-', nilaiBaru: `${ambang.kodeSKU} (${qtyUsulan} unit)` }
      ]
    );

    setModalUsulPo(null);
    setPesan({
      tipe: 'sukses',
      teks: `Purchase Order ${nomorPO} senilai ${formatRupiah(poBaru.totalNilai)} berhasil diajukan ke modul Purchasing & PJT.`
    });
    segarkan();
  };

  const kunciStokAgeing = (stok: StokGudang, sisaHari: number) => {
    const tanggalDikunci = dariAcuan.toISOString().split('T')[0];
    const alasanKunci =
      sisaHari < 0
        ? `Kedaluwarsa ${Math.abs(sisaHari)} hari lalu — ditahan untuk pemindahan Bad Stock & berita acara pemusnahan`
        : `Ageing Lock (< ${konfigurasi.umurKunciEdHari} hari, sisa ${sisaHari} hari) — ditahan dari FEFO reguler & diusulkan program cuci gudang berdisklosur ED ke Sales`;

    db.ubahStokGudang(
      stok.id,
      {
        statusStok: 'EXPIRED_LOCK',
        tanggalDikunci,
        alasanKunci,
        statusFEFO: nilaiUmurStok(stok, konfigurasi, dariAcuan).label
      },
      `Penguncian EXPIRED_LOCK bets mendekati ED (${sisaHari} hari) & usulan cuci gudang ke Sales`,
      'Kepala Gudang'
    );

    setPesan({
      tipe: 'peringatan',
      teks: `Bets ${stok.nomorBets} (${stok.namaAlkes}) dikunci berstatus EXPIRED_LOCK dan rekomendasi cuci gudang/pemusnahan tercatat di audit trail.`
    });
    segarkan();
  };

  const jumlahKritisRop = evaluasiAmbang.filter((e) => e.ambang.isActive && e.rop.status !== 'Aman').length;
  const jumlahExpiredLock = stokList.filter((s) => statusUnitStok(s) === 'EXPIRED_LOCK').length;

  return (
    <div className="space-y-5">
      {pesan && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            pesan.tipe === 'sukses'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {pesan.tipe === 'sukses' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
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
          label="SKU Dipantau Min-Max"
          value={ambangList.filter((a) => a.isActive).length}
          hint={`Dari total ${ambangList.length} parameter SKU terdaftar`}
        />
        <Stat
          label="SKU Perlu Reorder (ROP)"
          value={jumlahKritisRop}
          hint="Stok bebas ≤ titik pesan (lead time + safety stock)"
          tone={jumlahKritisRop > 0 ? 'rose' : 'emerald'}
        />
        <Stat
          label="Bets Wajib Kunci Ageing"
          value={kandidatAgeing.length}
          hint={`Sisa ED < ${konfigurasi.umurKunciEdHari} hari belum terkunci`}
          tone={kandidatAgeing.length > 0 ? 'amber' : 'emerald'}
        />
        <Stat
          label="Bets Terkunci EXPIRED_LOCK"
          value={jumlahExpiredLock}
          hint="Keluar dari antrean FEFO otomatis; siap cuci gudang/pemusnahan"
          tone={jumlahExpiredLock > 0 ? 'amber' : 'slate'}
        />
      </div>

      {/* Panel 1: Min-Max & Reorder Point */}
      <Panel
        judul="Perencanaan Min-Max, Safety Stock & Reorder Point (ROP)"
        keterangan="Rumus aturan §3.5: Safety Stock = Rata-Rata Harian × Hari Safety; Titik Pesan (ROP) = (Rata-Rata Harian × Lead Time) + Safety Stock. Ketika stok bebas ≤ ROP, gudang menerbitkan usulan PO ke Purchasing."
        aksi={
          <>
            {onNavigateModule && (
              <button
                type="button"
                onClick={() => onNavigateModule('purchasing-procurement')}
                className={tombolSekunder}
              >
                Buka Purchasing ({poList.filter((p) => p.status === 'Diajukan').length} PO Diajukan)
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button type="button" onClick={bukaTambahAmbang} className={tombolPrimerGudang}>
              <Plus className="w-4 h-4" />
              Tambah Ambang SKU
            </button>
          </>
        }
      >
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {(['Semua', 'Kritis', 'Perlu Pesan', 'Aman'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterRop(st)}
              className={chipFilter(filterRop === st)}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3.5">SKU &amp; Nama Alkes</th>
                <th className="py-3 px-3.5">Konsumsi &amp; Lead Time</th>
                <th className="py-3 px-3.5">Safety / ROP / Max</th>
                <th className="py-3 px-3.5">Stok Bebas vs Fisik</th>
                <th className="py-3 px-3.5">Estimasi Habis</th>
                <th className="py-3 px-3.5">Status ROP</th>
                <th className="py-3 px-3.5 text-right">Tindakan Pengadaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarRopTampil.map(({ ambang, tersedia, fisikTotal, rop }) => (
                <tr
                  key={ambang.id}
                  className={`hover:bg-slate-50 ${!ambang.isActive ? 'opacity-60' : ''}`}
                >
                  <td className="py-3 px-3.5">
                    <div className="font-semibold text-slate-900">{ambang.namaAlkes}</div>
                    <div className="font-mono text-2xs text-slate-500 mt-0.5">
                      {ambang.kodeSKU} • {ambang.gudangId} • {ambang.namaPemasok}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 tabular-nums text-slate-700">
                    <div>{ambang.rataRataTerjualPerHari} unit/hari</div>
                    <div className="text-2xs text-slate-500">
                      Lead time {ambang.leadTimeHari} hr • Safety {ambang.safetyStockHari} hr
                    </div>
                  </td>
                  <td className="py-3 px-3.5 font-mono tabular-nums text-slate-800">
                    <div>
                      SS: <strong>{rop.safetyStock}</strong> | ROP: <strong>{rop.titikPesan}</strong>
                    </div>
                    <div className="text-2xs text-slate-500">Max: {ambang.maxStok} unit</div>
                  </td>
                  <td className="py-3 px-3.5 tabular-nums">
                    <div className="font-bold text-slate-900">{tersedia} bebas</div>
                    <div className="text-2xs text-slate-500">Fisik total: {fisikTotal}</div>
                  </td>
                  <td className="py-3 px-3.5 tabular-nums text-slate-700">
                    {rop.hariSebelumHabis !== null ? `${rop.hariSebelumHabis} hari` : '—'}
                  </td>
                  <td className="py-3 px-3.5">
                    <Badge tone={ambang.isActive ? toneRop(rop.status) : 'slate'}>
                      {ambang.isActive ? rop.status : 'Non-aktif'}
                    </Badge>
                    {rop.usulanQtyBeli > 0 && ambang.isActive && (
                      <div className="text-2xs text-rose-700 font-semibold mt-1 tabular-nums">
                        Usul beli +{rop.usulanQtyBeli} unit
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end flex-wrap">
                      <button
                        type="button"
                        onClick={() => bukaUbahAmbang(ambang)}
                        className={tombolSekunder}
                        title="Sunting parameter Min-Max"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Parameter
                      </button>
                      {ambang.isActive && rop.status !== 'Aman' && (
                        <button
                          type="button"
                          onClick={() => bukaModalUsulPo(ambang, rop.usulanQtyBeli)}
                          className={tombolPrimerGudang}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Usulkan PO ({rop.usulanQtyBeli})
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

      {/* Panel 2: Ageing Analysis & Cuci Gudang */}
      <Panel
        judul={`Analisis Umur Simpan (Ageing Analysis) & Kunci ED (< ${konfigurasi.umurKunciEdHari} Hari)`}
        keterangan="Aturan §3.6: Bets dengan sisa masa berlaku di bawah ambang kunci wajib diberi status EXPIRED_LOCK agar tidak terkirim tanpa persetujuan ke fasyankes, serta diteruskan ke Sales untuk program cuci gudang berdisklosur ED atau berita acara pemusnahan."
      >
        {kandidatAgeing.length > 0 ? (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs text-amber-950">
              <CalendarClock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  Perhatian Penjaga Ageing: {kandidatAgeing.length} bets aktif berada di bawah ambang{' '}
                  {konfigurasi.umurKunciEdHari} hari namun belum dikunci!
                </div>
                <p className="text-2xs text-amber-800 mt-0.5">
                  Kunci sekarang agar senarai kesiapan audit CDB poin AGEING-ED berubah menjadi Lolos.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                kandidatAgeing.forEach((k) => kunciStokAgeing(k.stok, k.sisaHari));
              }}
              className={tombolPrimerGudang}
            >
              <Lock className="w-3.5 h-3.5" />
              Kunci Semua Bets Ageing ({kandidatAgeing.length})
            </button>
          </div>
        ) : (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              Seluruh bets dengan sisa ED &lt; {konfigurasi.umurKunciEdHari} hari sudah terkunci dari alokasi FEFO reguler.
            </span>
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-3.5">Bets &amp; Nama Alkes</th>
                <th className="py-3 px-3.5">Lokasi Bin</th>
                <th className="py-3 px-3.5">Qty Stok</th>
                <th className="py-3 px-3.5">Kedaluwarsa &amp; Sisa Hari</th>
                <th className="py-3 px-3.5">Status Kartu</th>
                <th className="py-3 px-3.5">Rekomendasi Tindakan</th>
                <th className="py-3 px-3.5 text-right">Eksekusi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sebaranUmur.slice(0, 12).map(({ stok, umur, statusFisik }) => {
                const terkunci = statusTerkunci(statusFisik);
                return (
                  <tr key={stok.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3.5">
                      <div className="font-mono font-bold text-slate-900">{stok.nomorBets}</div>
                      <div className="text-slate-600">{stok.namaAlkes}</div>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-2xs text-slate-600">
                      {stok.binId ?? stok.lokasiPenyimpanan}
                    </td>
                    <td className="py-3 px-3.5 font-bold tabular-nums text-slate-900">
                      {stok.jumlahStok} {stok.satuan}
                    </td>
                    <td className="py-3 px-3.5 font-mono tabular-nums">
                      <div className="text-slate-900">{stok.tanggalKedaluwarsa}</div>
                      <div
                        className={`text-2xs font-bold ${
                          umur.sisaHari < 0
                            ? 'text-rose-700'
                            : umur.perluKunci
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                        }`}
                      >
                        {umur.sisaHari < 0
                          ? `Lewat ${Math.abs(umur.sisaHari)} hari`
                          : `${umur.sisaHari} hari lagi`}
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <Badge tone={toneStatusStok(statusFisik)}>{statusFisik}</Badge>
                    </td>
                    <td className="py-3 px-3.5 text-2xs text-slate-600 max-w-sm leading-relaxed">
                      {stok.alasanKunci ? stok.alasanKunci : umur.saran}
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      {umur.perluKunci && !terkunci ? (
                        <button
                          type="button"
                          onClick={() => kunciStokAgeing(stok, umur.sisaHari)}
                          className={tombolPrimerGudang}
                        >
                          <TrendingDown className="w-3.5 h-3.5" />
                          Kunci &amp; Usul Cuci Gudang
                        </button>
                      ) : statusFisik === 'EXPIRED_LOCK' && onNavigateModule ? (
                        <button
                          type="button"
                          onClick={() => onNavigateModule('sales-marketing')}
                          className={tombolSekunder}
                        >
                          Koordinasi Sales
                        </button>
                      ) : (
                        <span className="text-2xs text-slate-400">Sesuai FEFO</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Modal Tambah/Sunting Ambang Stok */}
      {modalAmbang && (
        <Modal
          judul={editId ? 'Sunting Parameter Min-Max & Lead Time' : 'Tambah Parameter Min-Max SKU'}
          keterangan="Perubahan parameter tercatat otomatis dengan Old Value / New Value pada jejak audit."
          onClose={() => setModalAmbang(false)}
        >
          <form onSubmit={simpanAmbang} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Kode SKU</label>
                <input
                  type="text"
                  required
                  value={formAmbang.kodeSKU}
                  onChange={(e) => setFormAmbang({ ...formAmbang, kodeSKU: e.target.value })}
                  className={`${inputClass} font-mono uppercase`}
                />
              </div>
              <div>
                <label className={labelClass}>Gudang Acuan</label>
                <select
                  value={formAmbang.gudangId}
                  onChange={(e) => setFormAmbang({ ...formAmbang, gudangId: e.target.value })}
                  className={inputClass}
                >
                  {gudangList.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.id} — {g.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Nama Alat Kesehatan / Reagen</label>
              <input
                type="text"
                required
                value={formAmbang.namaAlkes}
                onChange={(e) => setFormAmbang({ ...formAmbang, namaAlkes: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Pemasok Utama Terkualifikasi</label>
              <select
                value={formAmbang.namaPemasok}
                onChange={(e) => setFormAmbang({ ...formAmbang, namaPemasok: e.target.value })}
                className={inputClass}
              >
                {pemasokList.map((p) => (
                  <option key={p.id} value={p.namaPemasok}>
                    {p.namaPemasok} ({p.statusAuditMutu})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Konsumsi / Hari</label>
                <input
                  type="number"
                  step="0.1"
                  min={0.1}
                  required
                  value={formAmbang.rataRataTerjualPerHari}
                  onChange={(e) =>
                    setFormAmbang({ ...formAmbang, rataRataTerjualPerHari: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Lead Time (Hari)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formAmbang.leadTimeHari}
                  onChange={(e) =>
                    setFormAmbang({ ...formAmbang, leadTimeHari: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Safety Stock (Hari)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formAmbang.safetyStockHari}
                  onChange={(e) =>
                    setFormAmbang({ ...formAmbang, safetyStockHari: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Min Stok (ROP Minimal)</label>
                <input
                  type="number"
                  min={1}
                  value={formAmbang.minStok}
                  onChange={(e) => setFormAmbang({ ...formAmbang, minStok: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Max Stok Gudang</label>
                <input
                  type="number"
                  min={1}
                  value={formAmbang.maxStok}
                  onChange={(e) => setFormAmbang({ ...formAmbang, maxStok: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={formAmbang.isActive}
                onChange={(e) => setFormAmbang({ ...formAmbang, isActive: e.target.checked })}
                className="rounded border-slate-300"
              />
              <span className="text-slate-700 font-medium">Aktifkan pemantauan ROP otomatis</span>
            </label>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalAmbang(false)}
                className={tombolSekunder}
              >
                Batal
              </button>
              <button type="submit" className={tombolPrimerGudang}>
                Simpan Parameter
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Usulan PO ke Purchasing */}
      {modalUsulPo && (
        <Modal
          judul={`Terbitkan Usulan PO Pengadaan — ${modalUsulPo.ambang.kodeSKU}`}
          keterangan="Dokumen masuk ke daftar Purchase Order resmi dengan status Diajukan untuk persetujuan PJT."
          onClose={() => setModalUsulPo(null)}
        >
          <form onSubmit={kirimUsulanPo} className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">{modalUsulPo.ambang.namaAlkes}</div>
              <div className="text-2xs text-slate-600">
                Pemasok: <strong>{modalUsulPo.ambang.namaPemasok}</strong> • Lead time{' '}
                {modalUsulPo.ambang.leadTimeHari} hari
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Kuantitas Usulan Beli (Unit)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={modalUsulPo.qtyUsulan}
                  onChange={(e) =>
                    setModalUsulPo({ ...modalUsulPo, qtyUsulan: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Estimasi Harga Satuan (Rp)</label>
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  required
                  value={modalUsulPo.estimasiHargaUnit}
                  onChange={(e) =>
                    setModalUsulPo({ ...modalUsulPo, estimasiHargaUnit: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold flex justify-between">
              <span>Estimasi Nilai PO:</span>
              <span className="font-mono tabular-nums">
                {formatRupiah(modalUsulPo.qtyUsulan * modalUsulPo.estimasiHargaUnit)}
              </span>
            </div>

            <div>
              <label className={labelClass}>Catatan Perencana Stok untuk PJT &amp; Purchasing</label>
              <textarea
                rows={2}
                value={modalUsulPo.catatan}
                onChange={(e) => setModalUsulPo({ ...modalUsulPo, catatan: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalUsulPo(null)}
                className={tombolSekunder}
              >
                Batal
              </button>
              <button type="submit" className={tombolPrimerGudang}>
                <ShoppingCart className="w-3.5 h-3.5" />
                Kirim Usulan PO ke Purchasing
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
