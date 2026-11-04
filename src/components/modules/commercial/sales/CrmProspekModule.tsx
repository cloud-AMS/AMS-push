import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { PelangganB2B, ProspekAlkes, TahapProspek, TeritorialPenjualan } from '../../../../types';
import { statusLimitKredit, selisihHari } from '../../../../utils/sales';
import {
  Building2,
  Users,
  Search,
  MapPinned,
  Target,
  ArrowRight,
  ShieldCheck,
  Banknote
} from 'lucide-react';
import {
  Badge,
  Panel,
  Stat,
  Modal,
  BarCapaian,
  formatRupiah,
  formatTanggal,
  inputClass,
  labelClass,
  tombolPrimer,
  tombolSekunder,
  chipFilter,
  type Tone
} from './ui';

const URUTAN_TAHAP: TahapProspek[] = [
  'Perkenalan Alat',
  'Demo Produk',
  'Negosiasi Harga',
  'Penawaran Resmi',
  'Pemenang'
];

const toneTahap = (tahap: TahapProspek): Tone =>
  tahap === 'Pemenang' ? 'emerald' : tahap === 'Gagal' ? 'rose' : tahap === 'Penawaran Resmi' ? 'blue' : 'amber';

const toneLimit = (status: 'Aman' | 'Perlu Persetujuan Manajemen' | 'Diblokir'): Tone =>
  status === 'Aman' ? 'emerald' : status === 'Perlu Persetujuan Manajemen' ? 'amber' : 'rose';

const toneIzin = (tanggalBerlaku: string): Tone => {
  const sisa = selisihHari(tanggalBerlaku);
  return sisa < 0 ? 'rose' : sisa <= 90 ? 'amber' : 'emerald';
};

export default function CrmProspekModule() {
  const [pelanggan, setPelanggan] = useState<PelangganB2B[]>(db.getPelangganB2B());
  const [prospek, setProspek] = useState<ProspekAlkes[]>(db.getProspek());
  const [teritorial] = useState<TeritorialPenjualan[]>(db.getTeritorial());
  const [kataKunci, setKataKunci] = useState('');
  const [filterRayon, setFilterRayon] = useState<string>('Semua');
  const [detail, setDetail] = useState<PelangganB2B | null>(null);
  const [tabDetail, setTabDetail] = useState<'profil' | 'keuangan' | 'kunjungan'>('profil');

  const daftarRayon = useMemo(
    () => Array.from(new Set(pelanggan.map((p) => p.rayonDistribusi))).sort(),
    [pelanggan]
  );

  const pelangganTampil = useMemo(() => {
    const kunci = kataKunci.trim().toLowerCase();
    return pelanggan.filter((p) => {
      const cocokRayon = filterRayon === 'Semua' || p.rayonDistribusi === filterRayon;
      const cocokKunci =
        !kunci ||
        [p.namaInstalasi, p.kodePelanggan, p.provinsi, p.penanggungJawabPengadaan, p.namaDokterPenanggungJawab]
          .some((nilai) => nilai.toLowerCase().includes(kunci));
      return cocokRayon && cocokKunci;
    });
  }, [pelanggan, kataKunci, filterRayon]);

  const pipeline = useMemo(() => {
    const perTahap = URUTAN_TAHAP.map((tahap) => {
      const item = prospek.filter((p) => p.tahap === tahap);
      return {
        tahap,
        item,
        nilaiBobot: item.reduce((total, p) => total + (p.nilaiEstimasi * p.probabilitasPersen) / 100, 0),
        nilaiKotor: item.reduce((total, p) => total + p.nilaiEstimasi, 0)
      };
    });
    const nilaiPipeline = perTahap.reduce((total, t) => total + t.nilaiBobot, 0);
    return { perTahap, nilaiPipeline };
  }, [prospek]);

  const prospekLewatiTenggat = useMemo(
    () => prospek.filter((p) => p.tahap !== 'Pemenang' && p.tahap !== 'Gagal' && selisihHari(p.tanggalTindakLanjut) < 0),
    [prospek]
  );

  const majukanTahap = (prospekDipilih: ProspekAlkes) => {
    const indeks = URUTAN_TAHAP.indexOf(prospekDipilih.tahap);
    const berikutnya = indeks < 0 ? 'Gagal' : URUTAN_TAHAP[Math.min(indeks + 1, URUTAN_TAHAP.length - 1)];
    db.majukanTahapProspek(prospekDipilih.id, berikutnya);
    setProspek(db.getProspek());
  };

  const kunjunganPelanggan = (id: string) => db.getKunjunganMedRep().filter((k) => k.pelangganId === id);
  const soPelanggan = (nama: string) => db.getPenjualan().filter((s) => s.fasyankes === nama);

  const totalPiutang = pelanggan.reduce((total, p) => total + p.piutangBerjalan, 0);
  const totalBatasKredit = pelanggan.reduce((total, p) => total + p.batasKredit, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Pelanggan B2B Terdaftar"
          value={pelanggan.length}
          hint={`Aktif ${pelanggan.filter((p) => p.statusPelanggan === 'Aktif').length} • Non-aktif ${pelanggan.filter((p) => p.statusPelanggan === 'Non-aktif').length}`}
          tone="blue"
        />
        <Stat
          label="Prospek dalam Pipeline"
          value={prospek.filter((p) => p.tahap !== 'Pemenang' && p.tahap !== 'Gagal').length}
          hint={`Nilai tertimbang ${formatRupiah(pipeline.nilaiPipeline)}`}
        />
        <Stat
          label="Prospek Melewati Tindak Lanjut"
          value={prospekLewatiTenggat.length}
          hint="Tanggal tindak lanjut sudah lewat dan belum konversi"
          tone={prospekLewatiTenggat.length ? 'amber' : 'emerald'}
        />
        <Stat
          label="Paparan Piutang Menyeluruh"
          value={totalBatasKredit > 0 ? `${Math.round((totalPiutang / totalBatasKredit) * 100)}%` : '0%'}
          hint={`${formatRupiah(totalPiutang)} dari pagar kredit ${formatRupiah(totalBatasKredit)}`}
          tone={totalPiutang > totalBatasKredit * 0.85 ? 'rose' : 'emerald'}
        />
      </div>

      <Panel
        judul="B2B Customer Profiling"
        keterangan="Profil fasyankes sebagai dasar Credit Limit & Term of Payment: akreditasi, izin operasional, penanggung jawab pengadaan, dokter penanggung jawab, pagu kredit, dan TOP."
        aksi={
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Data profil diperbarui dengan jejak audit Old Value / New Value
          </div>
        }
      >
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Cari nama instalasi, kode pelanggan, provinsi, atau penanggung jawab..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] flex-wrap">
            {['Semua', ...daftarRayon].map((rayon) => (
              <button
                key={rayon}
                type="button"
                onClick={() => setFilterRayon(rayon)}
                className={chipFilter(filterRayon === rayon)}
              >
                {rayon}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Kode / Nama Fasyankes</th>
                <th className="py-3 px-4">Tipe &amp; Akreditasi</th>
                <th className="py-3 px-4">Rayon &amp; Provinsi</th>
                <th className="py-3 px-4">Izin Operasional</th>
                <th className="py-3 px-4">Dokter Penanggung Jawab</th>
                <th className="py-3 px-4">Pagu Kredit vs Piutang</th>
                <th className="py-3 px-4">Status Limit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pelangganTampil.map((p) => {
                const kredit = statusLimitKredit(p);
                return (
                  <tr
                    key={p.id}
                    onClick={() => {
                      setDetail(p);
                      setTabDetail('profil');
                    }}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{p.namaInstalasi}</div>
                      <div className="text-[10px] font-mono text-slate-500">{p.kodePelanggan}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700">{p.tipeFasyankes}</div>
                      <Badge tone={p.akreditasi === 'Paripurna' ? 'emerald' : p.akreditasi === 'Belum Terakreditasi' ? 'rose' : 'slate'}>
                        {p.akreditasi}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{p.rayonDistribusi}</div>
                      <div className="text-[10px] text-slate-500">{p.provinsi}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-[10px] text-slate-600">{p.nomorIzinOperasional}</div>
                      <Badge tone={toneIzin(p.tanggalBerlakuIzin)}>
                        <ShieldCheck className="w-3 h-3" />
                        {formatTanggal(p.tanggalBerlakuIzin)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{p.namaDokterPenanggungJawab}</div>
                      <div className="text-[10px] text-slate-500">{p.spesialisasiDokter}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-800">
                        {formatRupiah(p.piutangBerjalan)} / {formatRupiah(p.batasKredit)}
                      </div>
                      <div className="text-[10px] text-slate-500">TOP {p.termsOfPaymentHari} hari • JT {formatTanggal(p.tanggalJatuhTempoPiutang)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={toneLimit(kredit.status)}>{kredit.status}</Badge>
                    </td>
                  </tr>
                );
              })}
              {pelangganTampil.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 px-4 text-center text-slate-500">
                    Tidak ada pelanggan yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        judul={'Lead & Opportunity Pipelines'}
        keterangan="Tujuh sumber lead (pameran, simposium, LPSE, e-Katalog, E-Purchasing, rujukan, situs web) disusun per tahap penjualan dengan nilai bobot probabilitas. Memajukan tahap tercatat pada audit trail."
      >
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {pipeline.perTahap.map((kolom) => (
            <div key={kolom.tahap} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[11px] font-bold text-slate-800">{kolom.tahap}</h4>
                <Badge tone={toneTahap(kolom.tahap)}>{kolom.item.length}</Badge>
              </div>
              <p className="text-[10px] text-slate-500 mb-2">
                Bobot {formatRupiah(kolom.nilaiBobot)} dari {formatRupiah(kolom.nilaiKotor)}
              </p>
              <div className="space-y-2">
                {kolom.item.map((p) => {
                  const lewat = p.tahap !== 'Pemenang' && p.tahap !== 'Gagal' && selisihHari(p.tanggalTindakLanjut) < 0;
                  return (
                    <div key={p.id} className="bg-white rounded-lg border border-slate-200 p-2.5">
                      <div className="text-[11px] font-bold text-slate-900 leading-snug">{p.namaProspek}</div>
                      <div className="text-[10px] font-mono text-emerald-800 mt-0.5">{p.nomorProspek}</div>
                      <div className="text-[10px] text-slate-600 mt-1">{p.produkDiminati}</div>
                      <div className="text-[10px] font-semibold text-slate-800 mt-1">{formatRupiah(p.nilaiEstimasi)}</div>
                      <div className="text-[10px] text-slate-500">
                        {p.sumberLead} • {p.medRep} • {p.rayonDistribusi}
                      </div>
                      <div className="mt-1.5">
                        <BarCapaian label="Probabilitas" persen={p.probabilitasPersen} />
                      </div>
                      <div className={`text-[10px] mt-1 ${lewat ? 'text-rose-700 font-semibold' : 'text-slate-500'}`}>
                        Tindak lanjut {formatTanggal(p.tanggalTindakLanjut)}
                        {lewat && ` • terlambat ${Math.abs(selisihHari(p.tanggalTindakLanjut))} hari`}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-1 leading-relaxed">{p.catatan}</div>
                      {p.tahap !== 'Pemenang' && p.tahap !== 'Gagal' && (
                        <button type="button" onClick={() => majukanTahap(p)} className={`${tombolSekunder} mt-2 w-full justify-center`}>
                          <ArrowRight className="w-3.5 h-3.5" />
                          Majukan Tahap
                        </button>
                      )}
                    </div>
                  );
                })}
                {kolom.item.length === 0 && (
                  <p className="text-[10px] text-slate-400 italic">Belum ada prospek pada tahap ini.</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-500">
          <Target className="w-3.5 h-3.5" />
          Konversi pipeline ke penjualan: prospek yang mencapai tahap Pemenang dilanjutkan sebagai Sales Order pada tab
          Manajemen Order &amp; Penjualan.
        </div>
      </Panel>

      <Panel
        judul={'Mapping Area & Sales Territory'}
        keterangan="Pembagian rayon distribusi dan med rep penanggung jawab. Daftar pelanggan per rayon dipakai untuk mendeteksi tumpang tindih wilayah (double coverage) dan menghitung capaian target."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {teritorial.map((t) => {
            const capaian = t.targetTahunan > 0 ? (t.realisasiYtd / t.targetTahunan) * 100 : 0;
            const pelangganRayon = pelanggan.filter((p) => p.rayonDistribusi === t.namaRayon);
            return (
              <div key={t.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <MapPinned className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900">{t.namaRayon}</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{t.kodeRayon}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">
                  Med Rep {t.medRep} (NIK {t.nikMedRep})
                </p>
                <div className="text-[10px] text-slate-600 mb-2">
                  Provinsi dilayani: {t.provinsiDilayani.join(' • ')}
                </div>
                <div className="mb-2">
                  <BarCapaian
                    label="Capaian target tahunan"
                    persen={capaian}
                    hint={`${formatRupiah(t.realisasiYtd)} dari target ${formatRupiah(t.targetTahunan)}`}
                  />
                </div>
                <div className="text-[10px] text-slate-500 mb-1">
                  {pelangganRayon.length} pelanggan terdaftar dari {t.daftarPelanggan.length} kode di kontrak wilayah
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {pelangganRayon.slice(0, 4).map((p) => (
                    <Badge key={p.id} tone="slate">
                      <Building2 className="w-3 h-3" />
                      {p.kodePelanggan}
                    </Badge>
                  ))}
                  {pelangganRayon.length > 4 && <Badge tone="slate">+{pelangganRayon.length - 4} lainnya</Badge>}
                </div>
                <div className={`text-[10px] leading-relaxed rounded-lg p-2 ${t.catatanTumpangTindih ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'}`}>
                  {t.catatanTumpangTindih || 'Tidak ada tumpang tindih wilayah terdeteksi.'}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {detail && (
        <Modal judul={detail.namaInstalasi} keterangan={`${detail.tipeFasyankes} — ${detail.rayonDistribusi} (${detail.provinsi})`} onClose={() => setDetail(null)}>
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs mb-4">
            {([
              ['profil', 'Profil Fasyankes', Building2],
              ['keuangan', 'Kredit & TOP', Banknote],
              ['kunjungan', 'Riwayat Kunjungan & SO', Users]
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

          {tabDetail === 'profil' && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              {[
                ['Kode Pelanggan', detail.kodePelanggan],
                ['Tipe Fasyankes', detail.tipeFasyankes],
                ['Akreditasi', detail.akreditasi],
                ['Nomor Izin Operasional', detail.nomorIzinOperasional],
                ['Berlaku Hingga', formatTanggal(detail.tanggalBerlakuIzin)],
                ['Penanggung Jawab Pengadaan', detail.penanggungJawabPengadaan],
                ['Dokter Penanggung Jawab', `${detail.namaDokterPenanggungJawab} — ${detail.spesialisasiDokter}`],
                ['Status Pelanggan', detail.statusPelanggan]
              ].map(([label, nilai]) => (
                <div key={label}>
                  <dt className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
                  <dd className="text-slate-800 font-semibold mt-0.5">{nilai}</dd>
                </div>
              ))}
            </dl>
          )}

          {tabDetail === 'keuangan' && (
            <div className="space-y-3 text-xs">
              {(() => {
                const kredit = statusLimitKredit(detail);
                return (
                  <div className={`rounded-xl border p-3 ${kredit.status === 'Diblokir' ? 'border-rose-200 bg-rose-50' : kredit.status === 'Perlu Persetujuan Manajemen' ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-900">Hasil evaluasi pagu kredit</span>
                      <Badge tone={toneLimit(kredit.status)}>{kredit.status}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">{kredit.keterangan}</p>
                  </div>
                );
              })()}
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                {[
                  ['Pagu Kredit', formatRupiah(detail.batasKredit)],
                  ['Piutang Berjalan', formatRupiah(detail.piutangBerjalan)],
                  ['Jatuh Tempo Piutang', formatTanggal(detail.tanggalJatuhTempoPiutang)],
                  ['Term of Payment', `${detail.termsOfPaymentHari} hari`]
                ].map(([label, nilai]) => (
                  <div key={label}>
                    <dt className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
                    <dd className="text-slate-800 font-semibold mt-0.5 font-mono">{nilai}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Sales Order baru untuk pelanggan ini diblokir otomatis apabila piutang melewati jatuh tempo atau paparan
                melebihi 100% pagu; di atas 85% butuh persetujuan manajer penjualan.
              </p>
            </div>
          )}

          {tabDetail === 'kunjungan' && (
            <div className="space-y-4 text-xs">
              <div>
                <h4 className="text-[11px] font-bold text-slate-800 mb-2">Riwayat kunjungan med rep</h4>
                <ol className="relative border-l border-slate-200 pl-4 space-y-3">
                  {kunjunganPelanggan(detail.id).map((k) => (
                    <li key={k.id} className="relative">
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-emerald-600" />
                      <div className="text-xs font-bold text-slate-900">{k.tujuanKunjungan}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {formatTanggal(k.tanggal)} • {k.medRep} • check-in {k.jamCheckIn} / {k.jamCheckOut ?? 'belum check-out'}
                      </div>
                      <div className="text-[11px] text-slate-700 mt-1">{k.hasilKunjungan}</div>
                    </li>
                  ))}
                  {kunjunganPelanggan(detail.id).length === 0 && (
                    <p className="text-[11px] text-slate-500 italic">Belum ada kunjungan tercatat untuk pelanggan ini.</p>
                  )}
                </ol>
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-slate-800 mb-2">Sales Order terkait</h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                        <th className="py-2 px-3">Nomor Pesanan</th>
                        <th className="py-2 px-3">Tanggal</th>
                        <th className="py-2 px-3">Alkes</th>
                        <th className="py-2 px-3">Nilai</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {soPelanggan(detail.namaInstalasi).map((s) => (
                        <tr key={s.id}>
                          <td className="py-2 px-3 font-mono font-bold text-emerald-800">{s.nomorPesanan}</td>
                          <td className="py-2 px-3 font-mono text-slate-600">{s.tanggalPesanan}</td>
                          <td className="py-2 px-3 text-slate-700">{s.namaAlkes} ({s.jumlah} {s.satuan})</td>
                          <td className="py-2 px-3 font-mono font-semibold text-slate-800">{formatRupiah(s.totalHarga)}</td>
                          <td className="py-2 px-3">
                            <Badge tone={s.statusKirim === 'Diterima Fasyankes' ? 'emerald' : s.statusKirim === 'Dibatalkan' ? 'rose' : 'amber'}>
                              {s.statusKirim}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {soPelanggan(detail.namaInstalasi).length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-4 px-3 text-center text-slate-500 italic">
                            Belum ada Sales Order atas nama instalasi ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
