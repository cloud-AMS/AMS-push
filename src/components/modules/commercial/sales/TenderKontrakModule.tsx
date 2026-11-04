import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { KontrakHarga, PelangganB2B, TenderAlkes } from '../../../../types';
import { hitungMarginTender, hargaTerkunciAktif, selisihHari, validasiNomorIzinEdar } from '../../../../utils/sales';
import {
  Gavel,
  Search,
  Clock,
  FileCheck,
  Calculator,
  Link2,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import {
  Badge,
  Panel,
  Stat,
  Modal,
  BarCapaian,
  formatRupiah,
  formatTanggal,
  formatPersen,
  inputClass,
  labelClass,
  tombolPrimer,
  tombolSekunder,
  chipFilter,
  type Tone
} from './ui';

const SUMBER: TenderAlkes['sumber'][] = ['LPSE', 'e-Katalog LKPP', 'E-Purchasing', 'Tender Mandiri RS'];

const toneTender = (status: TenderAlkes['statusTender']): Tone =>
  status === 'Dimenangkan'
    ? 'emerald'
    : status === 'Kalah'
      ? 'rose'
      : status === 'Hampir Tutup'
        ? 'rose'
        : status === 'Sudah Tutup'
          ? 'slate'
          : 'blue';

const toneKontrak = (status: KontrakHarga['statusKontrak']): Tone =>
  status === 'Aktif' ? 'emerald' : status === 'Dibatalkan' ? 'rose' : 'slate';

export default function TenderKontrakModule() {
  const [tender] = useState<TenderAlkes[]>(db.getTender());
  const [kontrak] = useState<KontrakHarga[]>(db.getKontrakHarga());
  const [pelanggan] = useState<PelangganB2B[]>(db.getPelangganB2B());
  const [izinEdar] = useState(db.getIzinEdar());
  const [kataKunci, setKataKunci] = useState('');
  const [filterSumber, setFilterSumber] = useState<TenderAlkes['sumber'] | 'Semua'>('Semua');
  const [detail, setDetail] = useState<TenderAlkes | null>(null);
  const [detailKontrak, setDetailKontrak] = useState<KontrakHarga | null>(null);

  const [margin, setMargin] = useState({
    nomorTender: '',
    hargaPenawaranPersen: 5,
    hppBarang: 0,
    biayaLogistik: 25000000,
    komisiPersen: 2.5,
    biayaInstalasi: 15000000,
    ppnPersen: 11
  });

  const daftarTampil = useMemo(() => {
    const kunci = kataKunci.trim().toLowerCase();
    return tender.filter((t) => {
      const cocokSumber = filterSumber === 'Semua' || t.sumber === filterSumber;
      const cocokKunci =
        !kunci ||
        [t.namaPengadaan, t.nomorPengumuman, t.instansiPembuat, t.provinsi, t.produkDitawarkan]
          .some((nilai) => nilai.toLowerCase().includes(kunci));
      return cocokSumber && cocokKunci;
    });
  }, [tender, kataKunci, filterSumber]);

  const hampirTutup = useMemo(
    () => tender.filter((t) => (t.statusTender === 'Aktif' || t.statusTender === 'Hampir Tutup') && selisihHari(t.batasAkhirPengajuan) <= 7),
    [tender]
  );

  const namaPelanggan = (id: string) => pelanggan.find((p) => p.id === id)?.namaInstalasi ?? id;

  const tenderTerpilih = tender.find((t) => t.nomorPengumuman === margin.nomorTender) ?? null;
  const hps = tenderTerpilih?.nilaiHps ?? 0;
  const hasilMargin = useMemo(
    () => (hps > 0 ? hitungMarginTender({ ...margin, nilaiHps: hps }) : null),
    [hps, margin]
  );

  const kontrakAktif = kontrak.filter((k) => k.statusKontrak === 'Aktif');
  const nilaiHpsAktif = tender
    .filter((t) => t.statusTender === 'Aktif' || t.statusTender === 'Hampir Tutup')
    .reduce((total, t) => total + t.nilaiHps, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Paket Tender Dipantau"
          value={tender.length}
          hint={`Aktif ${tender.filter((t) => t.statusTender === 'Aktif').length} • Dimenangkan ${tender.filter((t) => t.statusTender === 'Dimenangkan').length} • Kalah ${tender.filter((t) => t.statusTender === 'Kalah').length}`}
          tone="blue"
        />
        <Stat
          label="Alert Batas Akhir ≤ 7 Hari"
          value={hampirTutup.length}
          hint="Scraper LPSE/e-Katalog memberi peringatan dini sebelum penutupan"
          tone={hampirTutup.length ? 'rose' : 'emerald'}
        />
        <Stat
          label="Nilai HPS Sedang Berjalan"
          value={formatRupiah(nilaiHpsAktif)}
          hint="Total pagu paket yang masih dapat diikuti"
        />
        <Stat
          label="Kontrak Harga Aktif"
          value={kontrakAktif.length}
          hint={`Dari ${kontrak.length} perjanjian penguncian harga terdaftar`}
          tone={kontrakAktif.length ? 'emerald' : 'amber'}
        />
      </div>

      {hampirTutup.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 flex items-start gap-3">
          <Clock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Alert Sistem Lelang (LPSE Scraper)</span>
            {hampirTutup.map((t) => (
              <div key={t.id} className="text-[11px] leading-relaxed">
                {t.nomorPengumuman} — {t.namaPengadaan} ({t.instansiPembuat}) tutup{' '}
                {formatTanggal(t.batasAkhirPengajuan)} • sisa {selisihHari(t.batasAkhirPengajuan)} hari •{' '}
                {t.sumber}
              </div>
            ))}
            <div className="text-[11px] mt-1 leading-relaxed">
              Pastikan SDAK, ISO 13485, dan Nomor Izin Edar produk dilampirkan sebelum batas akhir; penawaran di bawah
              ambang margin wajar berisiko dinyatakan tidak memenuhi prinsip harga wajar LKPP.
            </div>
          </div>
        </div>
      )}

      <Panel
        judul="LPSE Scraper & Alert System"
        keterangan="Hasil pemantauan pengumuman LPSE, e-Katalog LKPP, E-Purchasing, dan tender mandiri RS beserta persyaratan kunci dan Nomor Izin Edar yang dipersyaratkan."
      >
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Cari nama pengadaan, nomor pengumuman, instansi, atau produk..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] flex-wrap">
            {(['Semua', ...SUMBER] as const).map((s) => (
              <button key={s} type="button" onClick={() => setFilterSumber(s)} className={chipFilter(filterSumber === s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Nomor Pengumuman</th>
                <th className="py-3 px-4">Paket Pengadaan</th>
                <th className="py-3 px-4">Sumber &amp; Instansi</th>
                <th className="py-3 px-4">Nilai HPS</th>
                <th className="py-3 px-4">Batas Akhir</th>
                <th className="py-3 px-4">Kecukupan NIE</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarTampil.map((t) => {
                const sisa = selisihHari(t.batasAkhirPengajuan);
                const nie = validasiNomorIzinEdar(t.nomorIzinEdarDipersyaratkan, izinEdar);
                return (
                  <tr key={t.id} onClick={() => setDetail(t)} className="hover:bg-slate-50 cursor-pointer">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{t.nomorPengumuman}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{t.namaPengadaan}</div>
                      <div className="text-[10px] text-slate-500">{t.produkDitawarkan}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone="slate">{t.sumber}</Badge>
                      <div className="text-[10px] text-slate-600 mt-1">{t.instansiPembuat}</div>
                      <div className="text-[10px] text-slate-500">{t.provinsi}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{formatRupiah(t.nilaiHps)}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-slate-700">{formatTanggal(t.batasAkhirPengajuan)}</div>
                      <div className={`text-[10px] font-semibold ${sisa < 0 ? 'text-slate-500' : sisa <= 7 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {sisa < 0 ? `lewat ${Math.abs(sisa)} hari` : `sisa ${sisa} hari`}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={nie.status === 'Lolos' ? 'emerald' : 'rose'}>
                        <ShieldCheck className="w-3 h-3" />
                        {t.nomorIzinEdarDipersyaratkan}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={toneTender(t.statusTender)}>{t.statusTender}</Badge>
                    </td>
                  </tr>
                );
              })}
              {daftarTampil.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 px-4 text-center text-slate-500">
                    Tidak ada pengumuman tender yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        judul="Contract & Pricing Agreement"
        keterangan="Perjanjian penguncian harga hasil tender atau kontrak tahunan. Harga terkunci pada kontrak aktif mengalahkan skema harga umum saat Sales Order dibuat."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {kontrak.map((k) => {
            const sisaSelesai = selisihHari(k.periodeSelesai);
            return (
              <div key={k.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 font-mono">{k.nomorKontrak}</h4>
                  </div>
                  <Badge tone={toneKontrak(k.statusKontrak)}>{k.statusKontrak}</Badge>
                </div>
                <p className="text-[11px] text-slate-700 font-semibold">{namaPelanggan(k.pelangganId)}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Periode {formatTanggal(k.periodeMulai)} — {formatTanggal(k.periodeSelesai)}
                  {k.statusKontrak === 'Aktif' && ` • sisa ${sisaSelesai} hari`}
                </p>
                <div className="mt-2 space-y-1">
                  {k.daftarHargaTerkunci.map((h) => (
                    <div key={h.namaAlkes} className="flex items-center justify-between text-[10px] bg-white rounded-lg border border-slate-200 px-2.5 py-1.5">
                      <span className="text-slate-700">{h.namaAlkes}</span>
                      <span className="font-mono font-semibold text-emerald-800">
                        {formatRupiah(h.hargaTerkunci)} / {h.satuan}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">Ditandatangani {k.ditandatanganiOleh}</span>
                  <button type="button" onClick={() => setDetailKontrak(k)} className={tombolSekunder}>
                    Detail Kontrak
                  </button>
                </div>
                <div className={`mt-2 text-[10px] rounded-lg p-2 border ${k.verifikasiEtikaPromosiPjt === 'Memenuhi Etika Promosi' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                  Verifikasi etika promosi PJT: {k.verifikasiEtikaPromosiPjt}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel
        judul="Margin Calculator"
        keterangan="Simulasi profitabilitas penawaran sebelum diajukan: penurunan dari HPS, HPP, logistik, komisi med rep, biaya instalasi, dan PPN 11%."
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-3">
            <div>
              <label className={labelClass}>Paket Tender Acuan</label>
              <select
                value={margin.nomorTender}
                onChange={(e) => setMargin({ ...margin, nomorTender: e.target.value })}
                className={`${inputClass} bg-white`}
              >
                <option value="">— Pilih paket untuk memakai HPS-nya —</option>
                {tender.map((t) => (
                  <option key={t.id} value={t.nomorPengumuman}>
                    {t.nomorPengumuman} — {t.namaPengadaan}
                  </option>
                ))}
              </select>
              {tenderTerpilih && (
                <p className="text-[10px] text-slate-500 mt-1">
                  HPS {formatRupiah(tenderTerpilih.nilaiHps)} • {tenderTerpilih.instansiPembuat} • tutup{' '}
                  {formatTanggal(tenderTerpilih.batasAkhirPengajuan)}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Penawaran di bawah HPS (%)</label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={margin.hargaPenawaranPersen}
                  onChange={(e) => setMargin({ ...margin, hargaPenawaranPersen: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>HPP Barang (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={margin.hppBarang}
                  onChange={(e) => setMargin({ ...margin, hppBarang: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Biaya Logistik (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={margin.biayaLogistik}
                  onChange={(e) => setMargin({ ...margin, biayaLogistik: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Komisi Penjualan (%)</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={margin.komisiPersen}
                  onChange={(e) => setMargin({ ...margin, komisiPersen: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Biaya Instalasi (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={margin.biayaInstalasi}
                  onChange={(e) => setMargin({ ...margin, biayaInstalasi: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>PPN (%)</label>
                <input
                  type="number"
                  min={0}
                  value={margin.ppnPersen}
                  onChange={(e) => setMargin({ ...margin, ppnPersen: Number(e.target.value) })}
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="button"
              className={tombolPrimer}
              onClick={() => {
                const acuan = tenderTerpilih ?? tender[0];
                if (!acuan) return;
                setMargin({
                  ...margin,
                  nomorTender: acuan.nomorPengumuman,
                  hppBarang: Math.round(acuan.nilaiHps * 0.72)
                });
              }}
            >
              <Calculator className="w-4 h-4" />
              Isi dari HPS Paket Terpilih
            </button>
          </div>

          <div className="lg:col-span-3">
            {!hasilMargin ? (
              <p className="text-xs text-slate-500">Pilih paket tender terlebih dahulu untuk memakai nilai HPS sebagai dasar simulasi.</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Harga Penawaran</div>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-1">{formatRupiah(hasilMargin.hargaPenawaran)}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Termasuk PPN: {formatRupiah(hasilMargin.hargaSetelahPpn)}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Margin Kotor</div>
                    <div className="text-sm font-bold text-blue-700 font-mono mt-1">{formatRupiah(hasilMargin.marginKotor)}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{formatPersen(hasilMargin.marginKotorPersen, 1)} dari penawaran</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Margin Bersih</div>
                    <div className={`text-sm font-bold font-mono mt-1 ${hasilMargin.marginBersihPersen >= 15 ? 'text-emerald-700' : hasilMargin.marginBersihPersen >= 8 ? 'text-amber-700' : 'text-rose-700'}`}>
                      {formatRupiah(hasilMargin.marginBersih)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{formatPersen(hasilMargin.marginBersihPersen, 1)} dari penawaran</div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="py-2.5 px-4">Komponen</th>
                        <th className="py-2.5 px-4 text-right">Nilai</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {hasilMargin.rincian.map((r) => (
                        <tr key={r.komponen}>
                          <td className="py-2 px-4 text-slate-700">{r.komponen}</td>
                          <td className={`py-2 px-4 text-right font-mono font-semibold ${r.nilai < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {formatRupiah(r.nilai)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50">
                        <td className="py-2 px-4 font-bold text-slate-900">Total Biaya Terpakai</td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-slate-900">{formatRupiah(hasilMargin.totalBiaya)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mb-2">
                  <BarCapaian
                    label="Margin bersih terhadap ambang 15%"
                    persen={Math.max(0, Math.min((hasilMargin.marginBersihPersen / 15) * 100, 100))}
                    hint={`Ambang kelayakan internal 15%, batas minimum 8% • saat ini ${formatPersen(hasilMargin.marginBersihPersen, 1)}`}
                  />
                </div>

                <div className={`text-[11px] leading-relaxed rounded-xl p-3 border flex items-start gap-2 ${hasilMargin.marginBersihPersen >= 15 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : hasilMargin.marginBersihPersen >= 8 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                  <TrendingDown className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{hasilMargin.rekomendasi}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {detail && (
        <Modal judul={detail.namaPengadaan} keterangan={`${detail.nomorPengumuman} — ${detail.instansiPembuat} (${detail.provinsi})`} onClose={() => setDetail(null)}>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {[
                ['Sumber Pengumuman', detail.sumber],
                ['Status Tender', detail.statusTender],
                ['Nilai HPS', formatRupiah(detail.nilaiHps)],
                ['Batas Akhir', formatTanggal(detail.batasAkhirPengajuan)],
                ['Produk Ditawarkan', detail.produkDitawarkan],
                ['NIE Dipersyaratkan', detail.nomorIzinEdarDipersyaratkan]
              ].map(([label, nilai]) => (
                <div key={label}>
                  <dt className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
                  <dd className="text-slate-800 font-semibold mt-0.5">{nilai}</dd>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5" />
                Persyaratan kunci dokumen
              </h4>
              <ul className="space-y-1">
                {detail.persyaratanKunci.map((s) => (
                  <li key={s} className="text-[11px] text-slate-700 flex items-start gap-2">
                    <Badge tone="slate">Wajib</Badge>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Hasil pengecekan Nomor Izin Edar</div>
              {(() => {
                const nie = validasiNomorIzinEdar(detail.nomorIzinEdarDipersyaratkan, izinEdar);
                return (
                  <div className="flex items-start gap-2">
                    <Badge tone={nie.status === 'Lolos' ? 'emerald' : 'rose'}>{nie.status}</Badge>
                    <p className="text-[11px] text-slate-700 leading-relaxed">{nie.keterangan}</p>
                  </div>
                );
              })()}
            </div>

            <div className="text-[11px] text-slate-600 flex items-center gap-2">
              <Link2 className="w-3.5 h-3.5" />
              Berkas pengumuman: <span className="font-mono">{detail.tautanPengumuman}</span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                className={tombolPrimer}
                onClick={() => {
                  setMargin({ ...margin, nomorTender: detail.nomorPengumuman, hppBarang: Math.round(detail.nilaiHps * 0.72) });
                  setDetail(null);
                }}
              >
                <Calculator className="w-4 h-4" />
                Hitung Margin Paket Ini
              </button>
            </div>
          </div>
        </Modal>
      )}

      {detailKontrak && (
        <Modal judul={detailKontrak.nomorKontrak} keterangan={`${namaPelanggan(detailKontrak.pelangganId)} — ${formatTanggal(detailKontrak.periodeMulai)} sampai ${formatTanggal(detailKontrak.periodeSelesai)}`} onClose={() => setDetailKontrak(null)}>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-4">Alkes</th>
                  <th className="py-2.5 px-4 text-right">Harga Terkunci</th>
                  <th className="py-2.5 px-4">Satuan</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detailKontrak.daftarHargaTerkunci.map((h) => (
                  <tr key={h.namaAlkes}>
                    <td className="py-2 px-4 text-slate-800 font-semibold">{h.namaAlkes}</td>
                    <td className="py-2 px-4 text-right font-mono font-bold text-emerald-800">{formatRupiah(h.hargaTerkunci)}</td>
                    <td className="py-2 px-4 text-slate-600">{h.satuan}</td>
                    <td className="py-2 px-4">
                      <Badge tone={toneKontrak(detailKontrak.statusKontrak)}>
                        {hargaTerkunciAktif([detailKontrak], detailKontrak.pelangganId, h.namaAlkes).baris
                          ? 'Berlaku hari ini'
                          : 'Tidak aktif hari ini'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
            Ditandatangani oleh {detailKontrak.ditandatanganiOleh}. Verifikasi etika promosi PJT:{' '}
            {detailKontrak.verifikasiEtikaPromosiPjt}.
          </p>
        </Modal>
      )}
    </div>
  );
}
