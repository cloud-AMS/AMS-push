import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { GaransiInstalasi, UnitSerialAlkes } from '../../../../types';
import { selisihHari, statusGaransi } from '../../../../utils/sales';
import {
  QrCode,
  ScanLine,
  Wrench,
  ShieldCheck,
  History,
  Boxes,
  CalendarClock,
  ArrowRight,
  TriangleAlert,
  CircleCheck,
  CircleX
} from 'lucide-react';
import {
  Badge,
  Panel,
  Stat,
  Modal,
  formatTanggal,
  inputClass,
  tombolPrimer,
  tombolSekunder,
  chipFilter,
  type Tone
} from './ui';

const STATUS_UNIT: UnitSerialAlkes['statusUnit'][] = [
  'Terjual',
  'Di Gudang',
  'Unit Demo',
  'Dalam Perbaikan',
  'Ditarik (Recall)'
];

const toneUnit = (status: UnitSerialAlkes['statusUnit']): Tone =>
  status === 'Terjual'
    ? 'emerald'
    : status === 'Ditarik (Recall)'
      ? 'rose'
      : status === 'Dalam Perbaikan'
        ? 'amber'
        : status === 'Unit Demo'
          ? 'blue'
          : 'slate';

const toneGaransi = (label: string): Tone =>
  label.startsWith('Garansi berakhir') ? 'rose' : label.startsWith('Garansi sisa') ? 'amber' : label.startsWith('Garansi aktif') ? 'emerald' : 'slate';

export default function KetelusuranSalesModule() {
  const [unit] = useState<UnitSerialAlkes[]>(db.getUnitSerial());
  const [garansi, setGaransi] = useState<GaransiInstalasi[]>(db.getGaransiInstalasi());
  const [pelanggan] = useState(db.getPelangganB2B());
  const [kunciBets, setKunciBets] = useState('');
  const [filterStatus, setFilterStatus] = useState<UnitSerialAlkes['statusUnit'] | 'Semua'>('Semua');
  const [detail, setDetail] = useState<UnitSerialAlkes | null>(null);
  const [tabDetail, setTabDetail] = useState<'unit' | 'rantai' | 'garansi'>('unit');

  const namaPelanggan = (id: string) => pelanggan.find((p) => p.id === id)?.namaInstalasi ?? id;

  const unitTampil = useMemo(() => {
    const kunci = kunciBets.trim().toLowerCase();
    return unit.filter((u) => {
      const cocokStatus = filterStatus === 'Semua' || u.statusUnit === filterStatus;
      const cocokKunci =
        !kunci ||
        [u.nomorSerial, u.nomorBets, u.namaAlkes, u.nomorSalesOrder, u.nomorInvoice]
          .some((nilai) => nilai.toLowerCase().includes(kunci));
      return cocokStatus && cocokKunci;
    });
  }, [unit, kunciBets, filterStatus]);

  const betsDikenal = useMemo(() => {
    const bersih = kunciBets.trim().toUpperCase();
    if (!bersih) return false;
    const diGudang = db.getStokGudang().some((s) => s.nomorBets.toUpperCase().includes(bersih));
    const diPenjualan = db.getPenjualan().some((p) => p.nomorBets.toUpperCase().includes(bersih));
    return diGudang || diPenjualan || unit.some((u) => u.nomorBets.toUpperCase().includes(bersih));
  }, [kunciBets, unit]);

  const betsTerpilih = useMemo(() => {
    // Rantai hanya ditampilkan bila bets benar-benar ada; cariKetelusuran() selalu mengembalikan objek
    // dan akan mengarang nilai untuk nomor yang tidak terdaftar.
    if (!betsDikenal) return null;
    return db.cariKetelusuran(kunciBets.trim().toUpperCase());
  }, [kunciBets, betsDikenal]);

  const betsList = useMemo(() => Array.from(new Set(unit.map((u) => u.nomorBets))).sort(), [unit]);

  const garansiPerSerial = (nomorSerial: string) => garansi.filter((g) => g.nomorSerial === nomorSerial);
  const unitPerBets = (nomorBets: string) => {
    const bersih = nomorBets.trim().toUpperCase();
    return unit.filter((u) => u.nomorBets.toUpperCase().includes(bersih) || bersih.includes(u.nomorBets.toUpperCase()));
  };

  const garansiHabis = garansi.filter((g) => !statusGaransi(g).aktif);
  const pmMendekat = garansi.filter((g) => selisihHari(g.jadwalPemeliharaanBerikutnya) <= 30);
  const unitRecall = unit.filter((u) => u.statusUnit === 'Ditarik (Recall)');

  const jadwalkanPM = (g: GaransiInstalasi) => {
    const berikutnya = new Date();
    berikutnya.setDate(berikutnya.getDate() + 90);
    const tanggalBaru = berikutnya.toISOString().split('T')[0];
    const diperbarui: GaransiInstalasi = { ...g, jadwalPemeliharaanBerikutnya: tanggalBaru };
    db.saveGaransiInstalasi(garansi.map((x) => (x.id === g.id ? diperbarui : x)));
    setGaransi(db.getGaransiInstalasi());
    db.logAudit(
      'Sales & Marketing — Ketelusuran',
      'Penjadwalan ulang pemeliharaan preventif unit bergaransi',
      g.nomorSerial,
      'Koordinator After-Sales',
      'Operations & Technical',
      [{ kolom: 'jadwalPemeliharaanBerikutnya', nilaiLama: g.jadwalPemeliharaanBerikutnya, nilaiBaru: tanggalBaru }]
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Unit Terdaftar per Serial"
          value={unit.length}
          hint={`Dari ${betsList.length} nomor bets aktif dalam distribusi`}
          tone="blue"
        />
        <Stat
          label="Unit Dalam Recall"
          value={unitRecall.length}
          hint="Ditarik paksa mengikuti Surat Penarikan Produk / FSCA"
          tone={unitRecall.length ? 'rose' : 'emerald'}
        />
        <Stat
          label="Garansi Berakhir / Habis"
          value={garansiHabis.length}
          hint={`Dari ${garansi.length} unit terpasang dengan basis garansi`}
          tone={garansiHabis.length ? 'amber' : 'emerald'}
        />
        <Stat
          label="Pemeliharaan ≤ 30 Hari"
          value={pmMendekat.length}
          hint="Jadwal PM preventif yang harus direncanakan teknisi"
          tone={pmMendekat.length ? 'blue' : 'slate'}
        />
      </div>

      <Panel
        judul="Batch / Lot & Serial Number Tracking"
        keterangan="Setiap unit alkes elektromedik dibawa sejak bets penerimaan gudang sampai nomor serial di fasyankes. Masukkan nomor bets atau serial untuk menelusuri rantai distribusi lengkap (CDAKB Pasal Pengawasan)."
      >
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <ScanLine className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
            <input
              type="text"
              value={kunciBets}
              onChange={(e) => setKunciBets(e.target.value)}
              placeholder="Pindai/ketik nomor bets (LOT-...) atau nomor serial (SN-...)"
              className={`${inputClass} pl-9 font-mono uppercase`}
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] flex-wrap">
            {(['Semua', ...STATUS_UNIT] as const).map((s) => (
              <button key={s} type="button" onClick={() => setFilterStatus(s)} className={chipFilter(filterStatus === s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {betsList.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setKunciBets(b)}
              className={`px-2 py-1 rounded text-[10px] font-mono border cursor-pointer transition-colors ${
                kunciBets.trim().toUpperCase() === b
                  ? 'bg-slate-700 text-white border-slate-700'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        {kunciBets.trim() && !betsDikenal && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-[11px] text-rose-900 flex items-start gap-2">
            <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Nomor <span className="font-mono font-bold">{kunciBets.trim().toUpperCase()}</span> tidak ditemukan pada
              bets gudang, unit serial, maupun pesanan penjualan. Rantai ketelusuran tidak ditampilkan agar tidak ada
              data fiktif yang dipakai sebagai bukti audit.
            </span>
          </div>
        )}

        {betsTerpilih && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <QrCode className="w-4 h-4 text-emerald-700" />
              <h4 className="text-xs font-bold text-emerald-900">Rantai ketelusuran bets {betsTerpilih.nomorBets}</h4>
              <Badge tone={betsTerpilih.statusRecall.startsWith('Aman') ? 'emerald' : 'rose'}>{betsTerpilih.statusRecall}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
              {[
                ['Produk', betsTerpilih.namaAlkes],
                ['Nomor Izin Edar', betsTerpilih.nomorIzinEdar],
                ['Produsen', betsTerpilih.produsen],
                ['Masuk Gudang', formatTanggal(betsTerpilih.tanggalPenerimaan)],
                ['Hasil Inspeksi QC', betsTerpilih.hasilInspeksiQC],
                ['Lokasi Penyimpanan', betsTerpilih.lokasiGudang],
                ['Zona Suhu', betsTerpilih.logSuhuStatus],
                ['Unit Serial di Rayon', `${unitPerBets(betsTerpilih.nomorBets).length} unit`]
              ].map(([label, nilai]) => (
                <div key={label}>
                  <div className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide">{label}</div>
                  <div className="text-emerald-950 font-semibold mt-0.5">{nilai}</div>
                </div>
              ))}
            </div>
            {betsTerpilih.fasyankesPenerima.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] font-bold text-emerald-900 mb-1">Fasyankes penerima bets ini</div>
                <ul className="space-y-0.5">
                  {betsTerpilih.fasyankesPenerima.map((f) => (
                    <li key={f.nomorSuratJalan} className="text-[11px] text-emerald-900 flex items-center gap-2">
                      <ArrowRight className="w-3 h-3" />
                      {f.nama} — Surat Jalan {f.nomorSuratJalan} • {formatTanggal(f.tanggalKirim)} • {f.jumlah} unit
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Nomor Serial</th>
                <th className="py-3 px-4">Bets Asal</th>
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-4">Sales Order / Invoice</th>
                <th className="py-3 px-4">Fasyankes Pemegang</th>
                <th className="py-3 px-4">Tanggal Kirim</th>
                <th className="py-3 px-4">Status Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {unitTampil.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => {
                    setDetail(u);
                    setTabDetail('unit');
                  }}
                  className="hover:bg-slate-50 cursor-pointer"
                >
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">{u.nomorSerial}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{u.nomorBets}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{u.namaAlkes}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-600">
                    <div>{u.nomorSalesOrder}</div>
                    <div className="text-slate-500">{u.nomorInvoice}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{namaPelanggan(u.pelangganId)}</td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-600">{u.tanggalKirim}</td>
                  <td className="py-3 px-4">
                    <Badge tone={toneUnit(u.statusUnit)}>{u.statusUnit}</Badge>
                  </td>
                </tr>
              ))}
              {unitTampil.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 px-4 text-center text-slate-500">
                    Tidak ada unit yang cocok dengan pencarian atau filter status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        judul="Warranty & Instalasi Base"
        keterangan="Basis garansi per nomor serial: tanggal instalasi, teknisi pemasang, masa garansi, dan jadwal pemeliharaan preventif. Masa garansi diturunkan dari tanggal instalasi, bukan disimpan manual."
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Nomor Serial</th>
                <th className="py-3 px-4">Produk &amp; Fasyankes</th>
                <th className="py-3 px-4">Instalasi &amp; Teknisi</th>
                <th className="py-3 px-4">Masa Garansi</th>
                <th className="py-3 px-4">Berakhir Pada</th>
                <th className="py-3 px-4">Jadwal PM Berikutnya</th>
                <th className="py-3 px-4">Status Garansi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {garansi.map((g) => {
                const status = statusGaransi(g);
                const sisaPM = selisihHari(g.jadwalPemeliharaanBerikutnya);
                return (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{g.nomorSerial}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{g.namaAlkes}</div>
                      <div className="text-[10px] text-slate-500">{namaPelanggan(g.pelangganId)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-[10px] text-slate-600">{g.tanggalInstalasi}</div>
                      <div className="text-[10px] text-slate-500">{g.teknisi}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{g.masaGaransiBulan} bulan</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-700">{formatTanggal(status.berakhirPada)}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-[10px] text-slate-700">{formatTanggal(g.jadwalPemeliharaanBerikutnya)}</div>
                      <div className={`text-[10px] font-semibold ${sisaPM < 0 ? 'text-rose-700' : sisaPM <= 30 ? 'text-amber-700' : 'text-slate-500'}`}>
                        {sisaPM < 0 ? `terlambat ${Math.abs(sisaPM)} hari` : `sisa ${sisaPM} hari`}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={toneGaransi(status.label)}>
                        {status.aktif ? <CircleCheck className="w-3 h-3" /> : <CircleX className="w-3 h-3" />}
                        {status.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button type="button" className={tombolSekunder} onClick={() => jadwalkanPM(g)}>
                        <CalendarClock className="w-3.5 h-3.5" />
                        Jadwalkan PM +90 Hari
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[11px] text-slate-600 leading-relaxed">
          {garansi.filter((g) => !statusGaransi(g).aktif).length > 0 && (
            <>
              Unit di luar masa garansi dilayani sebagai perbaikan berbayar melalui modul After-Sales Service. Catatan
              instalasi: {garansi[0]?.catatan ?? '-'}.
            </>
          )}
        </div>
      </Panel>

      {detail && (
        <Modal judul={detail.nomorSerial} keterangan={`${detail.namaAlkes} — ${namaPelanggan(detail.pelangganId)}`} onClose={() => setDetail(null)}>
          <div className="flex items-center gap-2 border-b border-slate-200 text-xs mb-4">
            {([
              ['unit', 'Identitas Unit', Boxes],
              ['rantai', 'Rantai Bets', History],
              ['garansi', 'Garansi & Instalasi', Wrench]
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

          {tabDetail === 'unit' && (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
              {[
                ['Nomor Serial', detail.nomorSerial],
                ['Nomor Bets', detail.nomorBets],
                ['Nama Alkes', detail.namaAlkes],
                ['Status Unit', detail.statusUnit],
                ['Sales Order', detail.nomorSalesOrder],
                ['Nomor Invoice', detail.nomorInvoice],
                ['Tanggal Kirim', formatTanggal(detail.tanggalKirim)],
                ['Fasyankes Pemegang', namaPelanggan(detail.pelangganId)]
              ].map(([label, nilai]) => (
                <div key={label}>
                  <dt className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</dt>
                  <dd className="text-slate-800 font-semibold mt-0.5 font-mono">{nilai}</dd>
                </div>
              ))}
            </dl>
          )}

          {tabDetail === 'rantai' && (
            <div className="space-y-3 text-xs">
              {(() => {
                const rantai = db.cariKetelusuran(detail.nomorBets);
                if (!rantai) return <p className="text-slate-500">Riwayat bets tidak ditemukan.</p>;
                return (
                  <>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 grid grid-cols-2 gap-x-4 gap-y-3">
                      {[
                        ['Produsen', rantai.produsen],
                        ['Nomor Izin Edar', rantai.nomorIzinEdar],
                        ['Masuk Gudang', formatTanggal(rantai.tanggalPenerimaan)],
                        ['Hasil QC', rantai.hasilInspeksiQC],
                        ['Lokasi Gudang', rantai.lokasiGudang],
                        ['Zona Suhu', rantai.logSuhuStatus]
                      ].map(([label, nilai]) => (
                        <div key={label}>
                          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
                          <div className="text-slate-800 font-semibold mt-0.5">{nilai}</div>
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Status recall bets: <Badge tone={rantai.statusRecall.startsWith('Aman') ? 'emerald' : 'rose'}>{rantai.statusRecall}</Badge>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      {unitPerBets(detail.nomorBets).length} unit tercatat berasal dari bets yang sama.
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {tabDetail === 'garansi' && (
            <div className="space-y-3 text-xs">
              {garansiPerSerial(detail.nomorSerial).length === 0 && (
                <p className="text-slate-500 leading-relaxed">
                  Unit ini belum memiliki catatan instalasi. Unit konsumsi/non-elektromedik memang tidak memerlukan
                  basis garansi instalasi.
                </p>
              )}
              {garansiPerSerial(detail.nomorSerial).map((g) => {
                const status = statusGaransi(g);
                return (
                  <div key={g.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800">{g.masaGaransiBulan} bulan sejak instalasi</span>
                      <Badge tone={toneGaransi(status.label)}>{status.label}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {[
                        ['Tanggal Instalasi', formatTanggal(g.tanggalInstalasi)],
                        ['Teknisi Pemasang', g.teknisi],
                        ['Berakhir Pada', formatTanggal(status.berakhirPada)],
                        ['Jadwal PM Berikutnya', formatTanggal(g.jadwalPemeliharaanBerikutnya)]
                      ].map(([label, nilai]) => (
                        <div key={label}>
                          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</div>
                          <div className="text-slate-800 font-semibold mt-0.5">{nilai}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{g.catatan}</p>
                    <div className="pt-2 border-t border-slate-200 flex justify-end">
                      <button type="button" className={tombolPrimer} onClick={() => jadwalkanPM(g)}>
                        <CalendarClock className="w-4 h-4" />
                        Jadwalkan PM +90 Hari
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Modal>
      )}

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Gunakan kotak pindai di atas untuk menelusuri satu bets secara penuh (hulu: QC, produksi, suhu gudang — hilir:
        surat jalan CDAKB dan fasyankes penerima), atau klik baris unit untuk melihat rantai bets dan status garansinya.
      </p>
    </div>
  );
}
