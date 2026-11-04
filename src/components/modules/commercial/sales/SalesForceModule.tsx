import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { KunjunganMedRep, PenjualanAlkes, PraOrderMedRep } from '../../../../types';
import { alokasikanFEFO, validasiNomorIzinEdar, verifikasiCheckInKunjungan } from '../../../../utils/sales';
import {
  MapPin,
  Navigation,
  BookOpen,
  Video,
  Smartphone,
  QrCode,
  Search,
  ShieldCheck,
  CircleCheck,
  CircleX,
  ArrowRight,
  ChevronDown,
  Clock
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
  chipFilter,
  type Tone
} from './ui';

const TUJUAN: KunjunganMedRep['tujuanKunjungan'][] = [
  'Perkenalan Alat',
  'Demo Produk',
  'Negosiasi',
  'Pascapenjualan',
  'Pengumpulan Dokumen Tender'
];

const JALUR: PenjualanAlkes['jalurPenjualan'][] = [
  'e-Katalog LKPP',
  'Tender RS Pemerintah',
  'Pembelian Langsung RS Swasta',
  'Klinik & Laboratorium'
];

const toneTerverifikasi = (terverifikasi: boolean | null): Tone =>
  terverifikasi === true ? 'emerald' : terverifikasi === false ? 'rose' : 'amber';

export default function SalesForceModule() {
  const [kunjungan, setKunjungan] = useState<KunjunganMedRep[]>(db.getKunjunganMedRep());
  const [praOrder, setPraOrder] = useState<PraOrderMedRep[]>(db.getPraOrder());
  const [produk] = useState(db.getPengetahuanProduk());
  const [pelanggan] = useState(db.getPelangganB2B());
  const [izinEdar] = useState(db.getIzinEdar());
  const [stok] = useState(db.getStokGudang());

  const [filterTujuan, setFilterTujuan] = useState<KunjunganMedRep['tujuanKunjungan'] | 'Semua'>('Semua');
  const [kataKunci, setKataKunci] = useState('');
  const [produkDibuka, setProdukDibuka] = useState<string | null>(null);

  const [modalCheckIn, setModalCheckIn] = useState<KunjunganMedRep | null>(null);
  const [koordinat, setKoordinat] = useState({ lat: '', lon: '' });
  const [modalKonversi, setModalKonversi] = useState<PraOrderMedRep | null>(null);
  const [formKonversi, setFormKonversi] = useState({
    jalurPenjualan: 'Pembelian Langsung RS Swasta' as PenjualanAlkes['jalurPenjualan'],
    nomorBets: ''
  });

  const namaPelanggan = (id: string) => pelanggan.find((p) => p.id === id)?.namaInstalasi ?? id;

  const kunjunganTampil = useMemo(() => {
    const kunci = kataKunci.trim().toLowerCase();
    return kunjungan
      .filter((k) => filterTujuan === 'Semua' || k.tujuanKunjungan === filterTujuan)
      .filter((k) => !kunci || [k.medRep, namaPelanggan(k.pelangganId), k.hasilKunjungan].some((n) => n.toLowerCase().includes(kunci)))
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [kunjungan, filterTujuan, kataKunci]);

  const hasilVerifikasi = useMemo(
    () => new Map(kunjungan.map((k) => [k.id, verifikasiCheckInKunjungan(k)])),
    [kunjungan]
  );

  const belumCheckIn = kunjungan.filter((k) => !k.koordinatCheckIn);
  const gagalGeofence = kunjungan.filter((k) => hasilVerifikasi.get(k.id)?.terverifikasi === false);
  const praOrderMenunggu = praOrder.filter((p) => p.statusPraOrder === 'Draf' || p.statusPraOrder === 'Terkirim ke Gudang');

  const simpanCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCheckIn) return;
    const lat = Number(koordinat.lat);
    const lon = Number(koordinat.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    db.catatCheckInKunjungan(modalCheckIn.id, { lat, lon }, new Date().toTimeString().slice(0, 5));
    setKunjungan(db.getKunjunganMedRep());
    setModalCheckIn(null);
    setKoordinat({ lat: '', lon: '' });
  };

  const usulanBets = useMemo(() => {
    if (!modalKonversi) return null;
    const item = modalKonversi.item[0];
    if (!item) return null;
    return { alokasi: alokasikanFEFO(stok, item.namaAlkes, item.jumlah), item };
  }, [modalKonversi, stok]);

  const simpanKonversi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalKonversi || !formKonversi.nomorBets) return;
    db.konversiPraOrderKeSalesOrder(modalKonversi.id, formKonversi.jalurPenjualan, formKonversi.nomorBets.toUpperCase());
    setPraOrder(db.getPraOrder());
    setModalKonversi(null);
    setFormKonversi({ ...formKonversi, nomorBets: '' });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Kunjungan Lapangan Tercatat"
          value={kunjungan.length}
          hint={`${kunjungan.filter((k) => k.jamCheckOut === null).length} masih berlangsung / belum check-out`}
          tone="blue"
        />
        <Stat
          label="Belum Check-in Geotag"
          value={belumCheckIn.length}
          hint="Wajib geotag GPS agar evidence kunjungan valid saat audit CDAKB"
          tone={belumCheckIn.length ? 'amber' : 'emerald'}
        />
        <Stat
          label="Check-in Di Luar Geofence"
          value={gagalGeofence.length}
          hint="Jarak GPS melebihi radius fasyankes — kunjungan perlu diverifikasi supervisor"
          tone={gagalGeofence.length ? 'rose' : 'emerald'}
        />
        <Stat
          label="Pre-Order Menunggu Konversi"
          value={praOrderMenunggu.length}
          hint={`Dari ${praOrder.length} pra-order lapangan med rep`}
        />
      </div>

      <Panel
        judul="Visit Planner & Geo-Tagging"
        keterangan="Perencanaan kunjungan med rep per fasyankes dengan verifikasi lokasi GPS saat check-in (geofencing). Koordinat fasyankes dan radius pagar disimpan per kunjungan."
      >
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={kataKunci}
              onChange={(e) => setKataKunci(e.target.value)}
              placeholder="Cari med rep, fasyankes, atau hasil kunjungan..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] flex-wrap">
            {(['Semua', ...TUJUAN] as const).map((t) => (
              <button key={t} type="button" onClick={() => setFilterTujuan(t)} className={chipFilter(filterTujuan === t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Tanggal &amp; Med Rep</th>
                <th className="py-3 px-4">Fasyankes Tujuan</th>
                <th className="py-3 px-4">Tujuan Kunjungan</th>
                <th className="py-3 px-4">Koordinat Check-in</th>
                <th className="py-3 px-4">Jarak vs Geofence</th>
                <th className="py-3 px-4">Jam Kunjungan</th>
                <th className="py-3 px-4">Verifikasi</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kunjunganTampil.map((k) => {
                const verifikasi = hasilVerifikasi.get(k.id);
                return (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] font-bold text-emerald-800">{k.tanggal}</div>
                      <div className="text-[10px] text-slate-500">{k.medRep}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{namaPelanggan(k.pelangganId)}</td>
                    <td className="py-3 px-4">
                      <Badge tone="slate">{k.tujuanKunjungan}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-600">
                      {k.koordinatCheckIn
                        ? `${k.koordinatCheckIn.lat.toFixed(5)}, ${k.koordinatCheckIn.lon.toFixed(5)}`
                        : '— belum ada —'}
                    </td>
                    <td className="py-3 px-4">
                      {verifikasi?.jarakKm === null || verifikasi?.jarakKm === undefined ? (
                        <span className="text-[10px] text-slate-400">belum diukur</span>
                      ) : (
                        <div className="text-[10px]">
                          <span className="font-mono font-semibold text-slate-700">{verifikasi.jarakKm.toFixed(2)} km</span>
                          <span className="text-slate-500"> / radius {k.radiusGeofenceMeter} m</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-600">
                      <div>in {k.jamCheckIn}</div>
                      <div>out {k.jamCheckOut ?? '—'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={toneTerverifikasi(verifikasi?.terverifikasi ?? null)}>
                        {verifikasi?.terverifikasi === true ? (
                          <CircleCheck className="w-3 h-3" />
                        ) : verifikasi?.terverifikasi === false ? (
                          <CircleX className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {verifikasi?.label ?? 'Belum check-in di lapangan'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        className={tombolSekunder}
                        onClick={() => {
                          setModalCheckIn(k);
                          setKoordinat({
                            lat: String(k.koordinatFasyankes.lat),
                            lon: String(k.koordinatFasyankes.lon)
                          });
                        }}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        Check-in Lapangan
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[10px] text-slate-500 leading-relaxed">
          Hasil dan tindak lanjut kunjungan:
          {kunjunganTampil.slice(0, 3).map((k) => (
            <div key={k.id} className="mt-1">
              <strong className="text-slate-700">{k.medRep} @ {namaPelanggan(k.pelangganId)}</strong> — {k.hasilKunjungan}
              {' '}
              <span className="text-slate-500">Tindak lanjut: {k.tindakLanjut}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        judul="Product Knowledge & Digital Brochure"
        keterangan="Bekal materi promosi med rep. Setiap brosur wajib mencantumkan Nomor Izin Edar aktif dan telah lolos verifikasi etika promosi PJT — tanpa klaim medis di luar indikasi terdaftar."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {produk.map((p) => {
            const nie = validasiNomorIzinEdar(p.nomorIzinEdar, izinEdar);
            const dibuka = produkDibuka === p.id;
            return (
              <div key={p.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p.namaAlkes}</h4>
                    <p className="text-[10px] text-slate-500">{p.tipeModel} — {p.produsen}</p>
                  </div>
                  <Badge tone={nie.status === 'Lolos' ? 'emerald' : 'rose'}>
                    <ShieldCheck className="w-3 h-3" />
                    NIE {nie.status}
                  </Badge>
                </div>
                <div className="text-[10px] font-mono text-emerald-800 mb-1">{p.nomorIzinEdar}</div>
                <p className="text-[10px] text-slate-500 mb-2">
                  {p.kategori} • berlaku sampai {formatTanggal(p.tanggalKedaluwarsaNie)}
                </p>
                <p className="text-[11px] text-slate-700 leading-relaxed mb-2">{p.spesifikasiRingkas}</p>
                <ul className="space-y-0.5 mb-2">
                  {p.poinJual.map((s) => (
                    <li key={s} className="text-[10px] text-slate-600 flex items-start gap-1.5">
                      <span className="text-emerald-600 mt-0.5">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="font-mono truncate">{p.tautanBrosur}</span>
                  <Video className="w-3.5 h-3.5 ml-auto" />
                  <span className="font-mono truncate">{p.tautanVideoDemo}</span>
                </div>
                <button type="button" onClick={() => setProdukDibuka(dibuka ? null : p.id)} className={`${tombolSekunder} justify-center`}>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dibuka ? 'rotate-180' : ''}`} />
                  Pertanyaan Teknis Umum ({p.pertanyaanTeknisUmum.length})
                </button>
                {dibuka && (
                  <div className="mt-2 space-y-2">
                    {p.pertanyaanTeknisUmum.map((t) => (
                      <div key={t.pertanyaan} className="bg-white rounded-lg border border-slate-200 p-2.5">
                        <div className="text-[10px] font-bold text-slate-800">{t.pertanyaan}</div>
                        <div className="text-[10px] text-slate-600 mt-1 leading-relaxed">{t.jawaban}</div>
                      </div>
                    ))}
                  </div>
                )}
                {nie.status === 'Ditolak' && (
                  <div className="mt-2 text-[10px] rounded-lg p-2 bg-rose-50 border border-rose-200 text-rose-900 leading-relaxed">
                    Materi promosi produk ini tidak boleh diedarkan: {nie.keterangan}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel
        judul="Mobile Order Taking (Pre-Order)"
        keterangan="Pesanan yang diambil med rep di lapangan memakai aplikasi seluler. Pra-order dikonversi menjadi Sales Order resmi setelah bets FEFO dialokasikan gudang."
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Nomor Pra-Order</th>
                <th className="py-3 px-4">Tanggal &amp; Med Rep</th>
                <th className="py-3 px-4">Fasyankes</th>
                <th className="py-3 px-4">Item Dipesan</th>
                <th className="py-3 px-4 text-right">Nilai Pra-Order</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {praOrder.map((p) => {
                const nilai = p.item.reduce((total, i) => total + i.jumlah * i.hargaSatuan, 0);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{p.nomorPraOrder}</td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-[11px] text-slate-700">{p.tanggal}</div>
                      <div className="text-[10px] text-slate-500">{p.medRep}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{namaPelanggan(p.pelangganId)}</td>
                    <td className="py-3 px-4 text-slate-700">
                      {p.item.map((i) => (
                        <div key={`${p.id}-${i.namaAlkes}`} className="leading-snug">
                          {i.namaAlkes} — {i.jumlah} unit @ {formatRupiah(i.hargaSatuan)}
                          <div className="text-[10px] font-mono text-slate-500">Bets diminta: {i.nomorBets}</div>
                        </div>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">{formatRupiah(nilai)}</td>
                    <td className="py-3 px-4">
                      <Badge
                        tone={
                          p.statusPraOrder === 'Konversi Sales Order'
                            ? 'emerald'
                            : p.statusPraOrder === 'Ditolak'
                              ? 'rose'
                              : p.statusPraOrder === 'Draf'
                                ? 'slate'
                                : 'blue'
                        }
                      >
                        {p.statusPraOrder}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.statusPraOrder === 'Draf' || p.statusPraOrder === 'Terkirim ke Gudang' ? (
                        <button
                          type="button"
                          className={tombolPrimer}
                          onClick={() => {
                            setModalKonversi(p);
                            const alokasi = alokasikanFEFO(stok, p.item[0]?.namaAlkes ?? '', p.item[0]?.jumlah ?? 1);
                            setFormKonversi({
                              jalurPenjualan: 'Pembelian Langsung RS Swasta',
                              nomorBets: alokasi.usulan.map((u) => u.nomorBets).join(' + ')
                            });
                          }}
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          Konversi Sales Order
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">selesai diproses</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {modalCheckIn && (
        <Modal
          judul="Check-in Kunjungan dengan Geotag"
          keterangan={`${modalCheckIn.medRep} — ${namaPelanggan(modalCheckIn.pelangganId)} (${formatTanggal(modalCheckIn.tanggal)})`}
          onClose={() => setModalCheckIn(null)}
        >
          <form onSubmit={simpanCheckIn} className="space-y-3 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                Titik koordinat fasyankes (acuan geofence)
              </div>
              <div className="font-mono">
                {modalCheckIn.koordinatFasyankes.lat.toFixed(6)}, {modalCheckIn.koordinatFasyankes.lon.toFixed(6)}
              </div>
              <div className="text-slate-500 mt-1">Radius pagar: {modalCheckIn.radiusGeofenceMeter} meter</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Lintang GPS (lat)</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={koordinat.lat}
                  onChange={(e) => setKoordinat({ ...koordinat, lat: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Bujur GPS (lon)</label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={koordinat.lon}
                  onChange={(e) => setKoordinat({ ...koordinat, lon: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Check-in tersimpan bersama jam server dan dicatat pada audit trail (kolom{' '}
              <code className="font-mono">koordinatCheckIn</code> lama dan baru). Kunjungan di luar radius ditandai gagal
              verifikasi dan wajib ditindaklanjuti supervisor wilayah.
            </p>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalCheckIn(null)} className={tombolSekunder}>
                Batal
              </button>
              <button type="submit" className={tombolPrimer}>
                <Navigation className="w-4 h-4" />
                Simpan Check-in
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modalKonversi && (
        <Modal
          judul="Konversi Pra-Order Menjadi Sales Order"
          keterangan={`${modalKonversi.nomorPraOrder} — ${namaPelanggan(modalKonversi.pelangganId)}`}
          onClose={() => setModalKonversi(null)}
        >
          <form onSubmit={simpanKonversi} className="space-y-3 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Rincian pesanan lapangan</div>
              {modalKonversi.item.map((i) => (
                <div key={`${modalKonversi.id}-${i.namaAlkes}`} className="flex items-center justify-between text-[11px] py-0.5">
                  <span className="text-slate-700">{i.namaAlkes} × {i.jumlah}</span>
                  <span className="font-mono font-semibold text-slate-800">{formatRupiah(i.jumlah * i.hargaSatuan)}</span>
                </div>
              ))}
            </div>

            {usulanBets && (
              <div className={`rounded-xl border p-3 text-[11px] leading-relaxed ${usulanBets.alokasi.sisaKekurangan > 0 ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'}`}>
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <QrCode className="w-3.5 h-3.5" />
                  Usulan alokasi FEFO gudang
                </div>
                {usulanBets.alokasi.usulan.length === 0 && 'Tidak ada bets aktif dengan stok mencukupi untuk produk ini.'}
                {usulanBets.alokasi.usulan.map((u) => (
                  <div key={u.nomorBets} className="font-mono">
                    {u.nomorBets} — kedaluwarsa {u.tanggalKedaluwarsa} — diambil {u.diambil} unit
                  </div>
                ))}
                {usulanBets.alokasi.sisaKekurangan > 0 && (
                  <div className="font-semibold mt-1">Kurang {usulanBets.alokasi.sisaKekurangan} unit — tunggu PO berikutnya.</div>
                )}
                {usulanBets.alokasi.betsKedaluwarsaDilewati > 0 && (
                  <div className="mt-1">{usulanBets.alokasi.betsKedaluwarsaDilewati} unit bets kedaluwarsa dilewati (karantina).</div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Jalur Distribusi</label>
                <select
                  value={formKonversi.jalurPenjualan}
                  onChange={(e) => setFormKonversi({ ...formKonversi, jalurPenjualan: e.target.value as PenjualanAlkes['jalurPenjualan'] })}
                  className={`${inputClass} bg-white`}
                >
                  {JALUR.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Nomor Bets Alokasi FEFO</label>
                <input
                  type="text"
                  required
                  value={formKonversi.nomorBets}
                  onChange={(e) => setFormKonversi({ ...formKonversi, nomorBets: e.target.value })}
                  placeholder="LOT-..."
                  className={`${inputClass} font-mono uppercase`}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalKonversi(null)} className={tombolSekunder}>
                Batal
              </button>
              <button type="submit" className={tombolPrimer}>
                <ArrowRight className="w-4 h-4" />
                Terbitkan Sales Order
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
