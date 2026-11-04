import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { KampanyeAlkes, ProgramRebate, UnitDemoAlkes } from '../../../../types';
import { hitungRebateTerutang, hitungRoiKampanye, statusUnitDemo } from '../../../../utils/sales';
import {
  CalendarDays,
  Handshake,
  FlaskConical,
  Star,
  CircleDollarSign,
  Percent,
  TriangleAlert,
  Check,
  Search,
  MapPin
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
  tombolPrimer,
  tombolSekunder,
  chipFilter,
  type Tone
} from './ui';

const JENIS: KampanyeAlkes['jenisKegiatan'][] = ['Simposium', 'Pameran Internasional', 'Workshop Klinis', 'Edukasi Spesialis'];

const toneKampanye = (status: KampanyeAlkes['status']): Tone =>
  status === 'Selesai' ? 'emerald' : status === 'Berjalan' ? 'blue' : 'slate';

const toneRebate = (status: ProgramRebate['statusPembayaran']): Tone =>
  status === 'Terbayar' ? 'emerald' : status === 'Terverifikasi' ? 'blue' : 'amber';

export default function KampanyeMarketingModule() {
  const [kampanye, setKampanye] = useState<KampanyeAlkes[]>(db.getKampanye());
  const [unitDemo, setUnitDemo] = useState<UnitDemoAlkes[]>(db.getUnitDemo());
  const [rebate, setRebate] = useState<ProgramRebate[]>(db.getProgramRebate());
  const [pelanggan] = useState(db.getPelangganB2B());

  const [filterJenis, setFilterJenis] = useState<KampanyeAlkes['jenisKegiatan'] | 'Semua'>('Semua');
  const [kataKunci, setKataKunci] = useState('');
  const [detail, setDetail] = useState<KampanyeAlkes | null>(null);

  const namaMitra = (id: string) => pelanggan.find((p) => p.id === id)?.namaInstalasi ?? id;

  const kampanyeTampil = useMemo(() => {
    const kunci = kataKunci.trim().toLowerCase();
    return kampanye
      .filter((k) => filterJenis === 'Semua' || k.jenisKegiatan === filterJenis)
      .filter((k) => !kunci || [k.namaKegiatan, k.lokasi, k.penanggungJawab].some((n) => n.toLowerCase().includes(kunci)));
  }, [kampanye, filterJenis, kataKunci]);

  const totalAnggaran = kampanye.reduce((total, k) => total + k.anggaran, 0);
  const totalRealisasiBiaya = kampanye.reduce((total, k) => total + k.realisasiBiaya, 0);
  const totalKonversi = kampanye.reduce((total, k) => total + k.nilaiKonversi, 0);
  const totalProspek = kampanye.reduce((total, k) => total + k.prospekDihasilkan, 0);

  const demoTerlambat = unitDemo.filter((u) => statusUnitDemo(u).label === 'Terlambat');
  const demoHilang = unitDemo.filter((u) => u.statusPinjam === 'Hilang');
  const rebateTerutang = rebate.reduce((total, r) => total + hitungRebateTerutang(r).nilaiRebate, 0);
  const rebateBelumTerbayar = rebate.filter((r) => r.statusPembayaran !== 'Terbayar');

  const tutupKampanye = (k: KampanyeAlkes) => {
    db.saveKampanye(kampanye.map((x) => (x.id === k.id ? { ...x, status: 'Selesai' } : x)));
    setKampanye(db.getKampanye());
    setDetail(null);
    db.logAudit(
      'Sales & Marketing — Kampanye',
      'Penutupan kegiatan promosi dan pencatatan realisasi',
      k.namaKegiatan,
      'Manajer Pemasaran',
      'Sales & Marketing',
      [{ kolom: 'status', nilaiLama: k.status, nilaiBaru: 'Selesai' }]
    );
  };

  const kembalikanUnitDemo = (u: UnitDemoAlkes) => {
    const tanggalHariIni = new Date().toISOString().split('T')[0];
    db.saveUnitDemo(
      unitDemo.map((x) => (x.id === u.id ? { ...x, statusPinjam: 'Dikembalikan', tanggalHarusKembali: tanggalHariIni } : x))
    );
    setUnitDemo(db.getUnitDemo());
    db.logAudit(
      'Sales & Marketing — Unit Demo',
      'Pengembalian unit demo dan berita acara serah terima',
      u.nomorUnit,
      'Koordinator Pemasaran',
      'Sales & Marketing',
      [{ kolom: 'statusPinjam', nilaiLama: u.statusPinjam, nilaiBaru: 'Dikembalikan' }]
    );
  };

  const majukanStatusRebate = (r: ProgramRebate) => {
    const berikutnya: ProgramRebate['statusPembayaran'] =
      r.statusPembayaran === 'Belum Jatuh Tempo' ? 'Terverifikasi' : r.statusPembayaran === 'Terverifikasi' ? 'Terbayar' : 'Terbayar';
    db.saveProgramRebate(rebate.map((x) => (x.id === r.id ? { ...x, statusPembayaran: berikutnya } : x)));
    setRebate(db.getProgramRebate());
    db.logAudit(
      'Sales & Marketing — Rebate',
      'Perubahan status pembayaran program rebate mitra',
      r.namaProgram,
      'Manajer Penjualan',
      'Sales & Marketing',
      [{ kolom: 'statusPembayaran', nilaiLama: r.statusPembayaran, nilaiBaru: berikutnya }]
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Kegiatan Promosi Terkelola"
          value={kampanye.length}
          hint={`Berjalan ${kampanye.filter((k) => k.status === 'Berjalan').length} • Rencana ${kampanye.filter((k) => k.status === 'Rencana').length} • Selesai ${kampanye.filter((k) => k.status === 'Selesai').length}`}
          tone="blue"
        />
        <Stat
          label="Efektivitas Biaya Kampanye"
          value={totalProspek > 0 ? formatRupiah(Math.round(totalRealisasiBiaya / totalProspek)) : '-'}
          hint={`Realisasi ${formatRupiah(totalRealisasiBiaya)} dari pagu ${formatRupiah(totalAnggaran)} • ${totalProspek} prospek dihasilkan`}
        />
        <Stat
          label="Unit Demo Bermasalah"
          value={demoTerlambat.length + demoHilang.length}
          hint={`${demoTerlambat.length} terlambat dikembalikan • ${demoHilang.length} dilaporkan hilang`}
          tone={demoTerlambat.length + demoHilang.length ? 'rose' : 'emerald'}
        />
        <Stat
          label="Rebate Terutang"
          value={formatRupiah(rebateTerutang)}
          hint={`${rebateBelumTerbayar.length} program menunggu verifikasi/pembayaran`}
          tone={rebateBelumTerbayar.length ? 'amber' : 'emerald'}
        />
      </div>

      <Panel
        judul="Event & Simposium Manager"
        keterangan="Perencanaan dan realisasi kegiatan promosi (simposium, pameran, workshop klinis, edukasi spesialis). Nilai konversi diukur dari prospek yang lahir pada kegiatan yang sama."
        aksi={
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-emerald-600" />
            ROI = (nilai konversi − realisasi biaya) / realisasi biaya
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
              placeholder="Cari nama kegiatan, lokasi, atau penanggung jawab..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] flex-wrap">
            {(['Semua', ...JENIS] as const).map((j) => (
              <button key={j} type="button" onClick={() => setFilterJenis(j)} className={chipFilter(filterJenis === j)}>
                {j}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Kegiatan</th>
                <th className="py-3 px-4">Jenis &amp; Lokasi</th>
                <th className="py-3 px-4">Periode</th>
                <th className="py-3 px-4">Pagu vs Realisasi</th>
                <th className="py-3 px-4">Prospek</th>
                <th className="py-3 px-4">Nilai Konversi</th>
                <th className="py-3 px-4">ROI</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kampanyeTampil.map((k) => {
                const roi = hitungRoiKampanye(k);
                return (
                  <tr key={k.id} onClick={() => setDetail(k)} className="hover:bg-slate-50 cursor-pointer">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{k.namaKegiatan}</div>
                      <div className="text-[10px] text-slate-500">PIC {k.penanggungJawab}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone="slate">{k.jenisKegiatan}</Badge>
                      <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {k.lokasi}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-600">
                      <div>{k.tanggalMulai}</div>
                      <div>{k.tanggalSelesai}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono font-semibold text-slate-800">{formatRupiah(k.realisasiBiaya)}</div>
                      <div className="text-[10px] text-slate-500">pagu {formatRupiah(k.anggaran)}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{k.prospekDihasilkan} prospek</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{formatRupiah(k.nilaiKonversi)}</td>
                    <td className="py-3 px-4">
                      <Badge tone={roi.roiPersen >= 100 ? 'emerald' : roi.roiPersen >= 0 ? 'amber' : 'rose'}>
                        {k.realisasiBiaya === 0 ? 'belum ada realisasi' : formatPersen(roi.roiPersen, 0)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={toneKampanye(k.status)}>{k.status}</Badge>
                    </td>
                  </tr>
                );
              })}
              {kampanyeTampil.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 px-4 text-center text-slate-500">
                    Tidak ada kegiatan yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2 text-[11px] text-amber-900">
          <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
          Materi yang dibagikan pada simposium (brosur, slide, handout) wajib lolos verifikasi etika promosi PJT dan
          mencantumkan Nomor Izin Edar. Sponsorship tenaga kesehatan mengikuti batas hadiah/UHC Kemenkes.
        </div>
      </Panel>

      <Panel
        judul="Sample & Demo Unit Tracking"
        keterangan="Peminjaman unit demo dan sampel ke fasyankes dengan berita acara serah terima. Status Terlambat diturunkan dari tanggal harus kembali, bukan disimpan manual."
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Nomor Unit</th>
                <th className="py-3 px-4">Produk &amp; Bets</th>
                <th className="py-3 px-4">Fasyankes Peminjam</th>
                <th className="py-3 px-4">Tanggal Pinjam</th>
                <th className="py-3 px-4">Harus Kembali</th>
                <th className="py-3 px-4">Status Efektif</th>
                <th className="py-3 px-4">Berita Acara</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unitDemo.map((u) => {
                const status = statusUnitDemo(u);
                const sisa = status.sisaHari;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{u.nomorUnit}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{u.namaAlkes}</div>
                      <div className="text-[10px] font-mono text-slate-500">{u.nomorBets}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{namaMitra(u.pelangganId)}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-600">{u.tanggalPinjam}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-[10px] text-slate-700">{formatTanggal(u.tanggalHarusKembali)}</div>
                      {u.statusPinjam === 'Terpinjam' && (
                        <div className={`text-[10px] font-semibold ${sisa < 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                          {sisa < 0 ? `lewat ${Math.abs(sisa)} hari` : `sisa ${sisa} hari`}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={status.tone}>
                        {status.label === 'Hilang' && <TriangleAlert className="w-3 h-3" />}
                        {status.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-600">{u.nomorBeritaAcara}</td>
                    <td className="py-3 px-4 text-right">
                      {u.statusPinjam === 'Terpinjam' && (
                        <button type="button" className={tombolSekunder} onClick={() => kembalikanUnitDemo(u)}>
                          <Check className="w-3.5 h-3.5" />
                          Tandai Dikembalikan
                        </button>
                      )}
                      {u.statusPinjam !== 'Terpinjam' && <span className="text-[10px] text-slate-400">riwayat tertutup</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[10px] text-slate-500 leading-relaxed">
          PIC peminjaman: {unitDemo[0]?.penanggungJawab ?? '-'} dan seluruh med rep terkait. Unit demo yang dikonversi
          menjadi penjualan dibuatkan Sales Order pada tab Manajemen Order &amp; Penjualan dengan status unit berubah
          menjadi Terjual.
        </p>
      </Panel>

      <Panel
        judul="Loyalty & Rebate Program"
        keterangan="Program volume untuk mitra distribusi dan fasyankes. Target tidak tercapai membayar rebate prorata sesuai perjanjian; nilai terutang dihitung dari nilai transaksi periode."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rebate.map((r) => {
            const hasil = hitungRebateTerutang(r);
            return (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{r.namaProgram}</h4>
                    <p className="text-[10px] text-slate-500">
                      Mitra {namaMitra(r.mitraId)} • periode {r.periode}
                    </p>
                  </div>
                  <Badge tone={toneRebate(r.statusPembayaran)}>{r.statusPembayaran}</Badge>
                </div>

                <div className="my-3">
                  <BarCapaian
                    label={`Volume ${r.realisasiVolumeUnit} / ${r.targetVolumeUnit} unit`}
                    persen={hasil.capaianPersen}
                    hint={hasil.keterangan}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] mb-3">
                  <div className="bg-white rounded-lg border border-slate-200 p-2">
                    <div className="text-slate-500">Nilai Transaksi</div>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">{formatRupiah(r.nilaiTransaksiPeriode)}</div>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 p-2">
                    <div className="text-slate-500">Persen Dibayar</div>
                    <div className="font-mono font-bold text-slate-800 mt-0.5">{r.persenRebate}% → {hasil.persenDibayar.toFixed(2)}%</div>
                  </div>
                  <div className="bg-white rounded-lg border border-slate-200 p-2">
                    <div className="text-slate-500">Rebate Terutang</div>
                    <div className="font-mono font-bold text-emerald-800 mt-0.5">{formatRupiah(hasil.nilaiRebate)}</div>
                  </div>
                </div>

                {!hasil.tercapai && (
                  <p className="text-[10px] text-amber-800 mb-2">
                    Kekurangan {hasil.kekuranganUnit} unit menuju target volume periode.
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1.5">
                    <Percent className="w-3 h-3" />
                    Rebate dibayar sebagai nota kredit, bukan kas langsung.
                  </span>
                  {r.statusPembayaran !== 'Terbayar' && (
                    <button type="button" className={tombolPrimer} onClick={() => majukanStatusRebate(r)}>
                      <Handshake className="w-4 h-4" />
                      {r.statusPembayaran === 'Belum Jatuh Tempo' ? 'Verifikasi Tagihan' : 'Tandai Terbayar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {detail && (
        <Modal judul={detail.namaKegiatan} keterangan={`${detail.jenisKegiatan} — ${detail.lokasi}`} onClose={() => setDetail(null)}>
          {(() => {
            const roi = hitungRoiKampanye(detail);
            const serapan = detail.anggaran > 0 ? (detail.realisasiBiaya / detail.anggaran) * 100 : 0;
            return (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    ['Periode Kegiatan', `${formatTanggal(detail.tanggalMulai)} — ${formatTanggal(detail.tanggalSelesai)}`],
                    ['Penanggung Jawab', detail.penanggungJawab],
                    ['Pagu Anggaran', formatRupiah(detail.anggaran)],
                    ['Realisasi Biaya', formatRupiah(detail.realisasiBiaya)],
                    ['Prospek Dihasilkan', `${detail.prospekDihasilkan} prospek`],
                    ['Nilai Konversi', formatRupiah(detail.nilaiKonversi)]
                  ].map(([label, nilai]) => (
                    <div key={label}>
                      <dt className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
                      <dd className="text-slate-800 font-semibold mt-0.5">{nilai}</dd>
                    </div>
                  ))}
                </div>

                <BarCapaian label="Serapan anggaran" persen={serapan} hint={`${formatPersen(serapan, 1)} dari pagu yang disetujui manajemen`} />

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-slate-800">
                    <CircleDollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    Efektivitas biaya
                  </div>
                  <div className="text-[11px] text-slate-700">
                    Biaya per prospek: <span className="font-mono font-semibold">{detail.prospekDihasilkan > 0 ? formatRupiah(Math.round(roi.biayaPerProspek)) : '-'}</span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    ROI: <span className="font-mono font-semibold">{detail.realisasiBiaya > 0 ? formatPersen(roi.roiPersen, 1) : '-'}</span> — {roi.label}
                  </div>
                </div>

                <div className="flex items-start gap-2 text-[10px] text-slate-600 rounded-xl border border-slate-200 p-3">
                  <FlaskConical className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  Prospek hasil kegiatan masuk ke pipeline pada tab CRM &amp; Management Prospek dengan sumber lead
                  mengikuti jenis kegiatan (Simposium / Pameran).
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                  <button type="button" onClick={() => setDetail(null)} className={tombolSekunder}>
                    Tutup
                  </button>
                  {detail.status !== 'Selesai' && (
                    <button type="button" className={tombolPrimer} onClick={() => tutupKampanye(detail)}>
                      <CalendarDays className="w-4 h-4" />
                      Tutup Kegiatan &amp; Catat Realisasi
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
