import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { HasilValidasiSO, PenjualanAlkes, SkemaHargaAlkes } from '../../../../types';
import {
  alokasikanFEFO,
  hargaTerkunciAktif,
  hitungDiskonKuantitas,
  selisihHari,
  statusLimitKredit,
  validasiSalesOrder
} from '../../../../utils/sales';
import { TANGGAL_ACUAN_BENIH, buatTanggalAcuan, waktuMutasiMonoton } from '../../operations/gudang/ui';
import {
  AlertTriangle,
  BadgeCheck,
  BanknoteIcon,
  Calculator,
  CircleCheck,
  CircleX,
  Coins,
  History,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Truck
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
  tombolBahaya,
  chipFilter,
  type Tone
} from './ui';

const ALUR_STATUS: PenjualanAlkes['statusKirim'][] = [
  'Verifikasi Pesanan',
  'Menunggu Alokasi FEFO',
  'Terkirim',
  'Diterima Fasyankes'
];

const AWALAN_JALUR: Record<PenjualanAlkes['jalurPenjualan'], string> = {
  'e-Katalog LKPP': 'SP-EKAT',
  'Tender RS Pemerintah': 'SP-TENDER',
  'Pembelian Langsung RS Swasta': 'SP-RS',
  'Klinik & Laboratorium': 'SP-KLINIK'
};

function nomorPesananBaru(daftar: PenjualanAlkes[], jalur: PenjualanAlkes['jalurPenjualan'], tanggal: string) {
  const tahun = tanggal.slice(0, 4);
  const awalan = AWALAN_JALUR[jalur];
  const pola = new RegExp(`^${awalan}-${tahun}-(\\d{3})$`);
  const urutan = daftar
    .map((d) => Number(d.nomorPesanan.match(pola)?.[1]))
    .filter((n) => !Number.isNaN(n));
  const berikutnya = (urutan.length > 0 ? Math.max(...urutan) : 120) + 1;
  return `${awalan}-${tahun}-${String(berikutnya).padStart(3, '0')}`;
}

const toneStatusKirim = (status: PenjualanAlkes['statusKirim']): Tone => {
  if (status === 'Diterima Fasyankes') return 'emerald';
  if (status === 'Terkirim') return 'blue';
  if (status === 'Dibatalkan') return 'rose';
  return 'amber';
};

const toneLimit = (status: ReturnType<typeof statusLimitKredit>['status']): Tone =>
  status === 'Diblokir' ? 'rose' : status === 'Perlu Persetujuan Manajemen' ? 'amber' : 'emerald';

export default function SalesOrderModule() {
  const [pesanan, setPesanan] = useState<PenjualanAlkes[]>(db.getPenjualan());
  const [pelanggan] = useState(db.getPelangganB2B());
  const [skema] = useState<SkemaHargaAlkes[]>(db.getSkemaHarga());
  const [kontrak] = useState(db.getKontrakHarga());
  const [izinEdar] = useState(db.getIzinEdar());
  const [stok, setStok] = useState(db.getStokGudang());
  const [produk] = useState(db.getPengetahuanProduk());
  const acuanFefo = useMemo(() => buatTanggalAcuan(TANGGAL_ACUAN_BENIH), []);

  const [kataKunci, setKataKunci] = useState('');
  const [filterStatus, setFilterStatus] = useState<PenjualanAlkes['statusKirim'] | 'Semua'>('Semua');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [tabDetail, setTabDetail] = useState<'induk' | 'validasi' | 'audit'>('induk');

  const [formTerbuka, setFormTerbuka] = useState(false);
  const [form, setForm] = useState({
    pelangganId: '',
    fasyankes: '',
    jalurPenjualan: 'e-Katalog LKPP' as PenjualanAlkes['jalurPenjualan'],
    namaAlkes: produk[0]?.namaAlkes ?? '',
    nomorBets: '',
    jumlah: 1,
    satuan: 'Unit',
    totalHarga: 0,
    metodePembayaran: 'TOP 30 Hari' as NonNullable<PenjualanAlkes['metodePembayaran']>,
    tanggalPesanan: new Date().toISOString().split('T')[0]
  });
  const [tolakanValidasi, setTolakanValidasi] = useState<HasilValidasiSO | null>(null);
  const [penolakanKirim, setPenolakanKirim] = useState<{ id: string; sebab: string } | null>(null);

  const [revisiTarget, setRevisiTarget] = useState<PenjualanAlkes | null>(null);
  const [formRevisi, setFormRevisi] = useState({ totalHarga: 0, statusKirim: 'Verifikasi Pesanan' as PenjualanAlkes['statusKirim'] });

  const [kalibrasiTarget, setKalibrasiTarget] = useState<string>('');
  const [formLimit, setFormLimit] = useState({ batasKredit: 0, termsOfPaymentHari: 30, statusPelanggan: 'Aktif' as 'Aktif' | 'Non-aktif' });

  const [ujiSkemaId, setUjiSkemaId] = useState(skema[0]?.id ?? '');
  const [ujiJumlah, setUjiJumlah] = useState(10);
  const [prakualifikasi, setPrakualifikasi] = useState<HasilValidasiSO | null>(null);
  const [uji, setUji] = useState({ pelangganId: pelanggan[0]?.id ?? '', namaAlkes: produk[0]?.namaAlkes ?? '', jumlah: 5 });

  const produkTerpilih = produk.find((p) => p.namaAlkes === form.namaAlkes);
  const pelangganTerpilih = pelanggan.find((c) => c.id === form.pelangganId);

  const usulanFefo = useMemo(
    () => alokasikanFEFO(stok, form.namaAlkes, form.jumlah, acuanFefo),
    [stok, form.namaAlkes, form.jumlah, acuanFefo]
  );

  const hargaTerakui = useMemo(() => {
    const terkunci = hargaTerkunciAktif(kontrak, form.pelangganId, form.namaAlkes);
    if (terkunci.baris) return { sumber: `Kontrak ${terkunci.kontrak?.nomorKontrak}`, unit: terkunci.baris.hargaTerkunci };
    const skemaProduk = skema.find((s) => s.namaAlkes === form.namaAlkes && s.status === 'Aktif');
    if (skemaProduk) {
      const hasil = hitungDiskonKuantitas(skemaProduk, form.jumlah);
      return { sumber: `Skema ${skemaProduk.namaSkema}`, unit: Math.round(hasil.hargaPerUnitEfektif) };
    }
    return { sumber: 'Harga eceran terdaftar', unit: 0 };
  }, [kontrak, skema, form.pelangganId, form.namaAlkes, form.jumlah]);

  const daftarTampil = useMemo(() => {
    const kunci = kataKunci.trim().toLowerCase();
    return pesanan.filter((p) => {
      const cocokStatus = filterStatus === 'Semua' || p.statusKirim === filterStatus;
      const cocokKunci =
        !kunci ||
        [p.fasyankes, p.namaAlkes, p.nomorPesanan, p.nomorBets].some((nilai) => nilai.toLowerCase().includes(kunci));
      return cocokStatus && cocokKunci;
    });
  }, [pesanan, kataKunci, filterStatus]);

  const detail = pesanan.find((p) => p.id === detailId) ?? null;
  const berjalan = pesanan.filter((p) => p.statusKirim !== 'Diterima Fasyankes' && p.statusKirim !== 'Dibatalkan');
  const menungguFefo = pesanan.filter((p) => p.statusKirim === 'Menunggu Alokasi FEFO');
  const pelangganDiblokir = pelanggan.filter((c) => statusLimitKredit(c).status === 'Diblokir');
  const skemaTerpilih = skema.find((s) => s.id === ujiSkemaId);
  const ujiHasil = skemaTerpilih ? hitungDiskonKuantitas(skemaTerpilih, ujiJumlah) : null;

  const jalankanPrakualifikasi = () => {
    const infoProduk = produk.find((p) => p.namaAlkes === uji.namaAlkes);
    setPrakualifikasi(
      validasiSalesOrder({
        pelanggan: pelanggan.find((c) => c.id === uji.pelangganId),
        nomorIzinEdar: infoProduk?.nomorIzinEdar ?? '',
        daftarIzinEdar: izinEdar,
        namaAlkes: uji.namaAlkes,
        jumlah: uji.jumlah,
        daftarStok: stok,
        nilaiPesanan: 0,
        dari: acuanFefo
      })
    );
  };

  const bukaForm = () => {
    const defaultProduk = produk[0];
    setForm((sebelum) => ({
      ...sebelum,
      namaAlkes: defaultProduk?.namaAlkes ?? '',
      nomorBets: '',
      jumlah: 1,
      totalHarga: 0,
      fasyankes: '',
      pelangganId: ''
    }));
    setTolakanValidasi(null);
    setFormTerbuka(true);
  };

  const pilihPelanggan = (id: string) => {
    const dipilih = pelanggan.find((c) => c.id === id);
    setForm({ ...form, pelangganId: id, fasyankes: dipilih?.namaInstalasi ?? form.fasyankes });
  };

  const isiUlangForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fasyankes || !form.namaAlkes) return;

    const hasil = validasiSalesOrder({
      pelanggan: pelangganTerpilih,
      nomorIzinEdar: produkTerpilih?.nomorIzinEdar ?? '',
      daftarIzinEdar: izinEdar,
      namaAlkes: form.namaAlkes,
      jumlah: form.jumlah,
      daftarStok: stok,
      nilaiPesanan: form.totalHarga || hargaTerakui.unit * form.jumlah,
      dari: acuanFefo
    });

    if (hasil.status === 'Ditolak') {
      setTolakanValidasi(hasil);
      return;
    }

    const betsTerkirim = form.nomorBets.trim().toUpperCase() || usulanFefo.usulan[0]?.nomorBets || form.nomorBets;
    const totalHarga = form.totalHarga || hargaTerakui.unit * form.jumlah;
    const item: PenjualanAlkes = {
      id: 'SO-' + Date.now(),
      nomorPesanan: nomorPesananBaru(pesanan, form.jalurPenjualan, form.tanggalPesanan),
      fasyankes: form.fasyankes,
      jalurPenjualan: form.jalurPenjualan,
      namaAlkes: form.namaAlkes,
      nomorBets: betsTerkirim,
      jumlah: form.jumlah,
      satuan: form.satuan,
      totalHarga,
      statusVerifikasiEtikaIklan: 'Memenuhi Etika Promosi',
      statusKirim: 'Verifikasi Pesanan',
      tanggalPesanan: form.tanggalPesanan,
      pelangganId: form.pelangganId || undefined,
      nomorIzinEdar: produkTerpilih?.nomorIzinEdar,
      hargaSatuan: hargaTerakui.unit,
      ppnPersen: 11,
      metodePembayaran: form.metodePembayaran,
      tanggalJatuhTempo: new Date(
        new Date(form.tanggalPesanan).getTime() + Number(form.metodePembayaran.replace(/\D/g, '')) * 86400000
      ).toISOString().split('T')[0],
      hasilValidasiRegulasi: hasil
    };

    db.addPenjualan(item);
    setPesanan(db.getPenjualan());
    setTolakanValidasi(null);
    setFormTerbuka(false);
  };

  const mundurkanStatus = (item: PenjualanAlkes, statusBaru: PenjualanAlkes['statusKirim']) => {
    db.updatePenjualan(item.id, { statusKirim: statusBaru });
    setPesanan(db.getPenjualan());
  };

  const kirimPesanan = (item: PenjualanAlkes) => {
    const waktuKirim = waktuMutasiMonoton(acuanFefo, db.getJejakPergerakan());
    const hasil = db.catatPengirimanSalesOrder(item.id, waktuKirim);
    setPenolakanKirim(hasil.boleh ? null : { id: item.id, sebab: hasil.keterangan });
    setPesanan(db.getPenjualan());
    setStok(db.getStokGudang());
  };

  const simpanRevisi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisiTarget) return;
    db.updatePenjualan(revisiTarget.id, {
      totalHarga: Number(formRevisi.totalHarga),
      statusKirim: formRevisi.statusKirim
    });
    setPesanan(db.getPenjualan());
    setRevisiTarget(null);
  };

  const simpanLimit = (e: React.FormEvent) => {
    e.preventDefault();
    db.updatePelangganB2B(kalibrasiTarget, {
      batasKredit: Number(formLimit.batasKredit),
      termsOfPaymentHari: Number(formLimit.termsOfPaymentHari),
      statusPelanggan: formLimit.statusPelanggan
    });
    setKalibrasiTarget('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Pesanan Terdaftar" value={pesanan.length} hint="Sales order lintas jalur distribusi" tone="emerald" />
        <Stat
          label="Pesanan Berjalan"
          value={berjalan.length}
          hint={formatRupiah(berjalan.reduce((total, p) => total + p.totalHarga, 0)) + ' nilai terbuka'}
        />
        <Stat
          label="Menunggu Alokasi FEFO"
          value={menungguFefo.length}
          hint="Antre pengeluaran bets tertua"
          tone={menungguFefo.length ? 'amber' : 'emerald'}
        />
        <Stat
          label="Pelanggan Terblokir Kredit"
          value={pelangganDiblokir.length}
          hint="Piutang lewat jatuh tempo atau melampaui batas kredit"
          tone={pelangganDiblokir.length ? 'rose' : 'emerald'}
        />
      </div>

      <Panel
        judul="Izin Edar & Compliance Validator"
        keterangan="Uji pra-order: sistem menolak sales order bila nomor izin edar kedaluwarsa/tidak terdaftar, izin operasional fasyankes habis masa, pagu kredit terlampaui, atau stok FEFO tidak mencukupi (CDAKB Permenkes 4/2014)."
        aksi={
          <button type="button" className={tombolPrimer} onClick={jalankanPrakualifikasi}>
            <ShieldCheck className="w-4 h-4" />
            Jalankan Uji
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className={labelClass}>Fasyankes Tujuan</label>
            <select className={inputClass} value={uji.pelangganId} onChange={(e) => setUji({ ...uji, pelangganId: e.target.value })}>
              {pelanggan.map((c) => (
                <option key={c.id} value={c.id}>{c.namaInstalasi}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Produk Alkes</label>
            <select className={inputClass} value={uji.namaAlkes} onChange={(e) => setUji({ ...uji, namaAlkes: e.target.value })}>
              {produk.map((p) => (
                <option key={p.id} value={p.namaAlkes}>{p.namaAlkes}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Jumlah Diminta</label>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={uji.jumlah}
              onChange={(e) => setUji({ ...uji, jumlah: Number(e.target.value) })}
            />
          </div>
        </div>

        {prakualifikasi ? (
          <div
            className={`rounded-xl border p-4 ${
              prakualifikasi.status === 'Lolos' ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {prakualifikasi.status === 'Lolos' ? (
                <CircleCheck className="w-4 h-4 text-emerald-700" />
              ) : (
                <CircleX className="w-4 h-4 text-rose-700" />
              )}
              <span className={`text-xs font-bold ${prakualifikasi.status === 'Lolos' ? 'text-emerald-900' : 'text-rose-900'}`}>
                {prakualifikasi.status === 'Lolos' ? 'Sales order boleh diproses' : 'Sales order ditolak otomatis oleh validator'}
              </span>
            </div>
            <ul className="space-y-1.5">
              {prakualifikasi.pemeriksaan.map((p) => (
                <li key={p.aturan} className="text-[11px] leading-relaxed">
                  <Badge tone={p.status === 'Lolos' ? 'emerald' : 'rose'}>{p.aturan}</Badge>
                  <span className="ml-2 text-slate-700">{p.keterangan}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500">
            Pilih fasyankes, produk, dan jumlah lalu jalankan uji untuk melihat daftar periksa kepatuhan sebelum pesanan dibuat.
          </p>
        )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel
          judul="Multi-Level Pricing & Discount Engine"
          keterangan="Skema harga berjenjang per level pelanggan dengan potongan kuantitas dan bonus unit. Harga terkunci kontrak aktif selalu mengalahkan skema umum."
        >
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className={labelClass}>Skema Harga</label>
              <select className={inputClass} value={ujiSkemaId} onChange={(e) => setUjiSkemaId(e.target.value)}>
                {skema.map((s) => (
                  <option key={s.id} value={s.id}>{s.namaSkema}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Jumlah Unit</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={ujiJumlah}
                onChange={(e) => setUjiJumlah(Number(e.target.value))}
              />
            </div>
          </div>

          {ujiHasil && skemaTerpilih && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                {[
                  ['Subtotal (harga dasar × unit)', formatRupiah(ujiHasil.subtotal)],
                  ['Ambang diskon terpakai', ujiHasil.ambangTerpakai ? `${ujiHasil.ambangTerpakai} unit` : 'Belum mencapai ambang'],
                  ['Potongan kuantitas', `${ujiHasil.diskonPersen}% (${formatRupiah(ujiHasil.diskonNilai)})`],
                  ['Bonus unit sample', ujiHasil.bonusUnit ? `${ujiHasil.bonusUnit} unit` : '-'],
                  ['Nilai bersih', formatRupiah(ujiHasil.netSetelahDiskon)],
                  ['Harga per unit efektif', formatRupiah(Math.round(ujiHasil.hargaPerUnitEfektif))]
                ].map(([label, nilai]) => (
                  <div key={label}>
                    <dt className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
                    <dd className="text-slate-800 font-bold mt-0.5">{nilai}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3">Skema & Produk</th>
                  <th className="py-2.5 px-3">Level</th>
                  <th className="py-2.5 px-3 text-right">Harga Dasar</th>
                  <th className="py-2.5 px-3">Tingkat Diskon</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {skema.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">{s.namaSkema}</div>
                      <div className="text-[10px] text-slate-500">{s.namaAlkes}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge tone={s.level === 'Harga Eceran' ? 'slate' : s.level === 'Harga Institusi' ? 'emerald' : 'blue'}>{s.level}</Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">{formatRupiah(s.hargaDasar)}</td>
                    <td className="py-2.5 px-3 text-[10px] text-slate-600">
                      {s.potonganKuantitas.map((t) => `≥${t.ambangMinUnit}: ${t.diskonPersen}%`).join(' • ')}
                      {s.bonusUnit > 0 && ` • bonus ${s.bonusUnit}`}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge tone={s.status === 'Aktif' ? 'emerald' : 'rose'}>{s.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          judul="Credit Limit & Term of Payment (TOP) Control"
          keterangan="Pesanan baru diblokir otomatis bila piutang melewati jatuh tempo atau paparan kredit melampaui pagu. Perubahan pagu dicatat lengkap dengan nilai lama dan nilai baru."
        >
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3">Fasyankes</th>
                  <th className="py-2.5 px-3 text-right">Piutang</th>
                  <th className="py-2.5 px-3 text-right">Batas Kredit</th>
                  <th className="py-2.5 px-3">Jatuh Tempo</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pelanggan.map((c) => {
                  const hasil = statusLimitKredit(c);
                  const sisaTempo = selisihHari(c.tanggalJatuhTempoPiutang);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{c.namaInstalasi}</div>
                        <div className="text-[10px] text-slate-500">{c.kodePelanggan} • TOP {c.termsOfPaymentHari} hari</div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(c.piutangBerjalan)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(c.batasKredit)}</td>
                      <td className="py-2.5 px-3 text-[10px] text-slate-600">
                        {formatTanggal(c.tanggalJatuhTempoPiutang)}
                        <div className={sisaTempo < 0 ? 'text-rose-700 font-bold' : ''}>
                          {sisaTempo < 0 ? `lewat ${Math.abs(sisaTempo)} hari` : `sisa ${sisaTempo} hari`}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={toneLimit(hasil.status)}>
                          {hasil.status === 'Diblokir' && <Lock className="w-3 h-3" />}
                          {hasil.status}
                        </Badge>
                        <div className="text-[10px] text-slate-500 mt-1">paparan {hasil.rasioPersen.toFixed(0)}%</div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setKalibrasiTarget(c.id);
                            setFormLimit({
                              batasKredit: c.batasKredit,
                              termsOfPaymentHari: c.termsOfPaymentHari,
                              statusPelanggan: c.statusPelanggan
                            });
                          }}
                          className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-[10px] font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                        >
                          Ubah Pagu
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Panel
        judul="Manajemen Order & Penjualan"
        keterangan="Jantung transaksi komersial. Setiap pesanan yang tersimpan telah melewati daftar periksa NIE, izin operasional fasyankes, pagu kredit, dan ketersediaan stok FEFO."
        aksi={
          <button type="button" className={tombolPrimer} onClick={bukaForm}>
            <Plus className="w-4 h-4" />
            Input Pesanan Fasyankes Baru
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
              placeholder="Cari fasyankes, alkes, atau nomor pesanan..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] flex-wrap">
            {(['Semua', ...ALUR_STATUS, 'Dibatalkan'] as const).map((status) => (
              <button key={status} type="button" className={chipFilter(filterStatus === status)} onClick={() => setFilterStatus(status)}>
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Nomor Pesanan & Tanggal</th>
                <th className="py-3 px-4">Fasilitas Pelayanan (Fasyankes)</th>
                <th className="py-3 px-4">Jalur Distribusi</th>
                <th className="py-3 px-4">Alkes & Bets Terpilih (FEFO)</th>
                <th className="py-3 px-4">Total Nilai</th>
                <th className="py-3 px-4">Etika Promosi</th>
                <th className="py-3 px-4">Status Pengiriman</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarTampil.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => { setDetailId(item.id); setTabDetail('induk'); }}
                  className="hover:bg-slate-50 cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    <div>{item.nomorPesanan}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{item.tanggalPesanan}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.fasyankes}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                      {item.jalurPenjualan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    <div className="font-medium">{item.namaAlkes} ({item.jumlah} {item.satuan})</div>
                    <div className="font-mono text-[10px] text-slate-500">Bets: {item.nomorBets}</div>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">Rp {item.totalHarga.toLocaleString('id-ID')}</td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      {item.statusVerifikasiEtikaIklan}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone={toneStatusKirim(item.statusKirim)}>{item.statusKirim}</Badge>
                  </td>
                </tr>
              ))}
              {daftarTampil.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 px-4 text-center text-slate-500">
                    Tidak ada pesanan yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[11px] text-slate-500">
          Total Transaksi: <strong>{pesanan.length}</strong> pesanan terdaftar
        </div>
      </Panel>

      {detail && (
        <Modal judul={detail.nomorPesanan} keterangan={`${detail.fasyankes} — ${detail.jalurPenjualan}`} onClose={() => setDetailId(null)}>
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs mb-4">
            {([
              ['induk', 'Data Pesanan', ShoppingCart],
              ['validasi', 'Daftar Periksa Regulasi', ShieldCheck],
              ['audit', 'Jejak Perubahan', History]
            ] as const).map(([id, label, Ikon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTabDetail(id)}
                className={`pb-2.5 px-3 font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                  tabDetail === id ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Ikon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {tabDetail === 'induk' && (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                {[
                  ['Fasyankes', detail.fasyankes],
                  ['Tanggal Pesanan', formatTanggal(detail.tanggalPesanan)],
                  ['Produk Alkes', detail.namaAlkes],
                  ['Nomor Bets FEFO', detail.nomorBets],
                  ['Jumlah', `${detail.jumlah} ${detail.satuan}`],
                  ['Nomor Izin Edar', detail.nomorIzinEdar ?? 'Belum tercatat dari modul RA'],
                  ['Harga Satuan', detail.hargaSatuan ? formatRupiah(detail.hargaSatuan) : '-'],
                  ['Total Nilai', formatRupiah(detail.totalHarga)],
                  ['PPN', detail.ppnPersen ? `${detail.ppnPersen}%` : '-'],
                  ['Metode Pembayaran', detail.metodePembayaran ?? 'Belum tercatat'],
                  ['Jatuh Tempo', detail.tanggalJatuhTempo ? formatTanggal(detail.tanggalJatuhTempo) : '-'],
                  ['Nomor Faktur', detail.nomorFaktur ?? 'Belum terbit']
                ].map(([label, nilai]) => (
                  <div key={label}>
                    <dt className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
                    <dd className="text-slate-800 font-semibold mt-0.5">{nilai}</dd>
                  </div>
                ))}
              </dl>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Kemajuan status pengiriman</div>
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  {ALUR_STATUS.map((status, indeks) => {
                    const posisi = ALUR_STATUS.indexOf(detail.statusKirim);
                    const tercapai = posisi >= indeks && detail.statusKirim !== 'Dibatalkan';
                    return (
                      <span
                        key={status}
                        className={`px-2.5 py-1 rounded-lg border font-semibold ${
                          tercapai ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'
                        }`}
                      >
                        {status}
                      </span>
                    );
                  })}
                  {detail.statusKirim === 'Dibatalkan' && <Badge tone="rose">Pesanan Dibatalkan</Badge>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {detail.statusKirim === 'Verifikasi Pesanan' && (
                  <button type="button" className={tombolPrimer} onClick={() => mundurkanStatus(detail, 'Menunggu Alokasi FEFO')}>
                    <BadgeCheck className="w-4 h-4" />
                    Setujui & Minta Alokasi FEFO
                  </button>
                )}
                {detail.statusKirim === 'Menunggu Alokasi FEFO' && (
                  <button type="button" className={tombolPrimer} onClick={() => kirimPesanan(detail)}>
                    <Truck className="w-4 h-4" />
                    Catat Pengiriman & Terbitkan Faktur
                  </button>
                )}
                {detail.statusKirim === 'Terkirim' && (
                  <button type="button" className={tombolPrimer} onClick={() => mundurkanStatus(detail, 'Diterima Fasyankes')}>
                    <CircleCheck className="w-4 h-4" />
                    Tandai Diterima Fasyankes
                  </button>
                )}
                {(detail.statusKirim === 'Verifikasi Pesanan' || detail.statusKirim === 'Menunggu Alokasi FEFO') && (
                  <>
                    <button
                      type="button"
                      className={tombolSekunder}
                      onClick={() => {
                        setRevisiTarget(detail);
                        setFormRevisi({ totalHarga: detail.totalHarga, statusKirim: detail.statusKirim });
                      }}
                    >
                      Revisi Harga
                    </button>
                    <button type="button" className={tombolBahaya} onClick={() => mundurkanStatus(detail, 'Dibatalkan')}>
                      <CircleX className="w-4 h-4" />
                      Batalkan Pesanan
                    </button>
                  </>
                )}
                {penolakanKirim?.id === detail.id && (
                  <p className="w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 leading-relaxed text-[11px] text-amber-900">
                    Gerbang gudang menahan pengiriman: {penolakanKirim.sebab}
                  </p>
                )}
              </div>
            </div>
          )}

          {tabDetail === 'validasi' && (
            <div className="space-y-3">
              {detail.hasilValidasiRegulasi ? (
                <>
                  <p className="text-[11px] text-slate-500">
                    Tervalidasi pada {formatTanggal(detail.hasilValidasiRegulasi.tanggalValidasi)} oleh {detail.hasilValidasiRegulasi.pengguna} —
                    hasil keseluruhan <strong>{detail.hasilValidasiRegulasi.status}</strong>.
                  </p>
                  <ul className="space-y-1.5">
                    {detail.hasilValidasiRegulasi.pemeriksaan.map((p) => (
                      <li key={p.aturan} className="text-[11px] leading-relaxed">
                        <Badge tone={p.status === 'Lolos' ? 'emerald' : 'rose'}>{p.aturan}</Badge>
                        <span className="ml-2 text-slate-700">{p.keterangan}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pesanan ini dibuat sebelum gerbang validasi otomatis berlaku. Jalankan uji pada panel
                  <span className="font-semibold text-slate-700"> Izin Edar &amp; Compliance Validator</span> untuk
                  memperoleh daftar periksa regulasi terbaru atas bets dan fasyankes yang sama.
                </p>
              )}
              {detail.nomorIzinEdar && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-700 leading-relaxed">
                  Tautan regulasi: NIE <span className="font-mono font-bold">{detail.nomorIzinEdar}</span> — sah hanya bila
                  masih tercantum aktif pada register Regulatory Affairs (PJT).
                </div>
              )}
            </div>
          )}

          {tabDetail === 'audit' && (
            <div className="space-y-3">
              {(() => {
                const log = db.getAuditTrail().filter((a) => a.nomorReferensi === detail.nomorPesanan);
                if (log.length === 0)
                  return <p className="text-xs text-slate-500">Belum ada entri audit untuk pesanan ini.</p>;
                return (
                  <ol className="space-y-3">
                    {log.map((entri) => (
                      <li key={entri.id} className="rounded-xl border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
                          <span>{entri.waktu}</span>
                          <Badge tone={entri.statusIntegritas === 'Tervalidasi Digital' ? 'emerald' : 'amber'}>{entri.statusIntegritas}</Badge>
                        </div>
                        <div className="text-xs font-bold text-slate-900 mt-1">{entri.aktivitas}</div>
                        <div className="text-[11px] text-slate-600">
                          {entri.modul} • {entri.pengguna} ({entri.peran})
                        </div>
                        {entri.perubahan && entri.perubahan.length > 0 && (
                          <table className="w-full text-[10px] mt-2">
                            <thead>
                              <tr className="text-slate-500 border-b border-slate-200">
                                <th className="py-1 text-left font-semibold">Kolom</th>
                                <th className="py-1 text-left font-semibold">Nilai Lama</th>
                                <th className="py-1 text-left font-semibold">Nilai Baru</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {entri.perubahan.map((p) => (
                                <tr key={p.kolom}>
                                  <td className="py-1 pr-2 font-mono text-slate-700">{p.kolom}</td>
                                  <td className="py-1 pr-2 text-rose-700">{p.nilaiLama}</td>
                                  <td className="py-1 text-emerald-700 font-semibold">{p.nilaiBaru}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </li>
                    ))}
                  </ol>
                );
              })()}
            </div>
          )}
        </Modal>
      )}

      {formTerbuka && (
        <Modal
          judul="Catat Pesanan Alkes Fasyankes"
          keterangan="Pesanan hanya dapat disimpan bila lolos daftar periksa regulasi; alokasi bets FEFO diusulkan otomatis dari stok gudang."
          onClose={() => setFormTerbuka(false)}
        >
          <form onSubmit={isiUlangForm} className="space-y-3">
            <div>
              <label className={labelClass}>Fasyankes dari Master Pelanggan</label>
              <select className={inputClass} value={form.pelangganId} onChange={(e) => pilihPelanggan(e.target.value)}>
                <option value="">— Ketik manual / belum terdaftar —</option>
                {pelanggan.map((c) => (
                  <option key={c.id} value={c.id}>{c.namaInstalasi} ({c.kodePelanggan})</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Nama Rumah Sakit / Klinik</label>
              <input
                type="text"
                required
                value={form.fasyankes}
                onChange={(e) => setForm({ ...form, fasyankes: e.target.value })}
                placeholder="Contoh: RSUD Tarakan Jakarta Pusat"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Jalur Distribusi</label>
                <select
                  className={inputClass}
                  value={form.jalurPenjualan}
                  onChange={(e) => setForm({ ...form, jalurPenjualan: e.target.value as PenjualanAlkes['jalurPenjualan'] })}
                >
                  <option value="e-Katalog LKPP">e-Katalog LKPP (Pemerintah)</option>
                  <option value="Tender RS Pemerintah">Tender RS Pemerintah</option>
                  <option value="Pembelian Langsung RS Swasta">Pembelian Langsung RS Swasta</option>
                  <option value="Klinik & Laboratorium">Klinik & Laboratorium</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Tanggal Pesanan</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.tanggalPesanan}
                  onChange={(e) => setForm({ ...form, tanggalPesanan: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Nama Produk Alkes</label>
              <select className={inputClass} value={form.namaAlkes} onChange={(e) => setForm({ ...form, namaAlkes: e.target.value })}>
                {produk.map((p) => (
                  <option key={p.id} value={p.namaAlkes}>{p.namaAlkes}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                NIE terdaftar: <span className="font-mono font-semibold text-slate-700">{produkTerpilih?.nomorIzinEdar ?? '-'}</span> •
                berlaku sampai {formatTanggal(produkTerpilih?.tanggalKedaluwarsaNie ?? '-')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Nomor Bets Alokasi FEFO</label>
                <input
                  type="text"
                  className={`${inputClass} font-mono uppercase`}
                  placeholder="LOT-2024-..."
                  value={form.nomorBets}
                  onChange={(e) => setForm({ ...form, nomorBets: e.target.value })}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {usulanFefo.usulan.length > 0
                    ? `Usulan sistem: ${usulanFefo.usulan.map((u) => `${u.nomorBets} (${u.diambil} unit, ED ${u.tanggalKedaluwarsa})`).join(' + ')}`
                    : 'Tidak ada bets aktif yang mencukupi untuk produk ini.'}
                  {usulanFefo.sisaKekurangan > 0 && ` — kurang ${usulanFefo.sisaKekurangan} unit`}
                </p>
              </div>
              <div>
                <label className={labelClass}>Jumlah</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    value={form.jumlah}
                    onChange={(e) => setForm({ ...form, jumlah: Number(e.target.value) })}
                  />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    placeholder="Unit"
                    value={form.satuan}
                    onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Metode Pembayaran / TOP</label>
                <select
                  className={inputClass}
                  value={form.metodePembayaran}
                  onChange={(e) => setForm({ ...form, metodePembayaran: e.target.value as NonNullable<PenjualanAlkes['metodePembayaran']> })}
                >
                  <option value="Tunai">Tunai</option>
                  <option value="TOP 30 Hari">TOP 30 Hari</option>
                  <option value="TOP 45 Hari">TOP 45 Hari</option>
                  <option value="TOP 60 Hari">TOP 60 Hari</option>
                  <option value="Termin Bertahap">Termin Bertahap</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Total Nilai Pesanan (Rp)</label>
                <input
                  type="number"
                  min={1000}
                  required
                  className={`${inputClass} font-bold`}
                  value={form.totalHarga || hargaTerakui.unit * form.jumlah}
                  onChange={(e) => setForm({ ...form, totalHarga: Number(e.target.value) })}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Diisi otomatis dari {hargaTerakui.sumber} sebesar {formatRupiah(hargaTerakui.unit)}/unit.
                </p>
              </div>
            </div>

            {tolakanValidasi && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-900 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Pesanan ditolak validator — perbaiki hal berikut sebelum simpan
                </div>
                <ul className="space-y-1">
                  {tolakanValidasi.pemeriksaan
                    .filter((p) => p.status === 'Ditolak')
                    .map((p) => (
                      <li key={p.aturan} className="text-[11px] text-rose-900 leading-relaxed">
                        <strong>{p.aturan}:</strong> {p.keterangan}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setFormTerbuka(false)}>Batal</button>
              <button type="submit" className={tombolPrimer}>Simpan Pesanan</button>
            </div>
          </form>
        </Modal>
      )}

      {revisiTarget && (
        <Modal
          judul="Revisi Harga & Status Pesanan"
          keterangan="Perubahan tercatat pada audit trail lengkap dengan nilai lama dan nilai baru (syarat data integrity audit CDAKB/ISO 13485)."
          onClose={() => setRevisiTarget(null)}
        >
          <form onSubmit={simpanRevisi} className="space-y-3">
            <div>
              <label className={labelClass}>Total Nilai Pesanan (Rp)</label>
              <input
                type="number"
                min={1000}
                className={inputClass}
                value={formRevisi.totalHarga}
                onChange={(e) => setFormRevisi({ ...formRevisi, totalHarga: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className={labelClass}>Status Pengiriman</label>
              <select
                className={inputClass}
                value={formRevisi.statusKirim}
                onChange={(e) => setFormRevisi({ ...formRevisi, statusKirim: e.target.value as PenjualanAlkes['statusKirim'] })}
              >
                {[...ALUR_STATUS, 'Dibatalkan'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setRevisiTarget(null)}>Batal</button>
              <button type="submit" className={tombolPrimer}>Simpan Perubahan</button>
            </div>
          </form>
        </Modal>
      )}

      {kalibrasiTarget && (
        <Modal
          judul="Ubah Pagu Kredit & Terms of Payment"
          keterangan="Perubahan pagu langsung memengaruhi blokir/validasi sales order pelanggan terkait."
          onClose={() => setKalibrasiTarget('')}
        >
          <form onSubmit={simpanLimit} className="space-y-3">
            <div>
              <label className={labelClass}>Batas Kredit (Rp)</label>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={formLimit.batasKredit}
                onChange={(e) => setFormLimit({ ...formLimit, batasKredit: Number(e.target.value) })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>TOP (hari)</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={formLimit.termsOfPaymentHari}
                  onChange={(e) => setFormLimit({ ...formLimit, termsOfPaymentHari: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelClass}>Status Pelanggan</label>
                <select
                  className={inputClass}
                  value={formLimit.statusPelanggan}
                  onChange={(e) => setFormLimit({ ...formLimit, statusPelanggan: e.target.value as 'Aktif' | 'Non-aktif' })}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Non-aktif">Non-aktif</option>
                </select>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" className={tombolSekunder} onClick={() => setKalibrasiTarget('')}>Batal</button>
              <button type="submit" className={tombolPrimer}>Simpan Pagu</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
