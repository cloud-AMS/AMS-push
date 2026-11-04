import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import {
  AturanSimpan,
  GudangFisik,
  IzinEdarAlkes,
  LokasiBin,
  StokGudang,
  TipeGudang
} from '../../../../types';
import { kodeBinDariLokasi, tentukanTempatSimpan } from '../../../../utils/gudang';
import { Compass, Plus, ShieldAlert, CheckCircle2 } from 'lucide-react';
import {
  Badge,
  BarCapaian,
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
  onPerubahanData: () => void;
}

const TIPE_GUDANG: TipeGudang[] = [
  'Gudang Utama',
  'Gudang Karantina',
  'Gudang Retur',
  'Gudang Rusak (Bad Stock)',
  'Cold Room'
];

const ZONA_SUHU: StokGudang['zonaSuhu'][] = [
  'Cold Chain (2°C - 8°C)',
  'Ruang Sejuk AC (15°C - 25°C)',
  'Suhu Kamar (< 30°C)'
];

const KATEGORI_ALKES: IzinEdarAlkes['kategori'][] = [
  'Elektromedik Radiasi',
  'Elektromedik Non Radiasi',
  'Non Elektromedik Steril',
  'Non Elektromedik Non Steril',
  'Diagnostik In Vitro'
];

const toneTipeGudang = (tipe: TipeGudang): Tone => {
  if (tipe === 'Gudang Utama') return 'emerald';
  if (tipe === 'Cold Room') return 'blue';
  if (tipe === 'Gudang Karantina') return 'amber';
  if (tipe === 'Gudang Rusak (Bad Stock)') return 'rose';
  return 'slate';
};

export default function StrukturGudangTab({ onPerubahanData }: Props) {
  const [gudangList, setGudangList] = useState<GudangFisik[]>(() => db.getGudangFisik());
  const [binList, setBinList] = useState<LokasiBin[]>(() => db.getLokasiBin());
  const [aturanList, setAturanList] = useState<AturanSimpan[]>(() => db.getAturanSimpan());

  const [filterGudangId, setFilterGudangId] = useState<string>('Semua');
  const [modalGudang, setModalGudang] = useState(false);
  const [modalBin, setModalBin] = useState(false);
  const [modalAturan, setModalAturan] = useState(false);
  const [pesanPenjaga, setPesanPenjaga] = useState<{ tipe: 'sukses' | 'tolak'; teks: string } | null>(null);

  // Form Gudang Fisik
  const [formGudang, setFormGudang] = useState({
    nama: '',
    tipe: 'Gudang Utama' as TipeGudang,
    alamat: 'Kawasan Industri Pulogadung Blok J-12, Jakarta Timur',
    penanggungJawab: 'Kepala Gudang CDAKB',
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)' as StokGudang['zonaSuhu'],
    catatan: ''
  });

  // Form Lokasi Bin
  const [formBin, setFormBin] = useState({
    gudangId: gudangList[0]?.id ?? 'GDM-01',
    lorong: 'A',
    baris: '01',
    rak: '01',
    laci: '03',
    zonaSuhu: (gudangList[0]?.zonaSuhu ?? 'Ruang Sejuk AC (15°C - 25°C)') as StokGudang['zonaSuhu'],
    kategoriTersimpan: 'Elektromedik Non Radiasi',
    kapasitas: 50,
    satuan: 'Unit',
    rfidTagId: 'RFID-BIN-NEW01',
    jarakDariDockMeter: 18
  });

  // Form Aturan Simpan
  const [formAturan, setFormAturan] = useState({
    namaAturan: '',
    kategoriProduk: '' as '' | IzinEdarAlkes['kategori'],
    zonaSuhuDibutuhkan: 'Cold Chain (2°C - 8°C)' as '' | StokGudang['zonaSuhu'],
    butuhUjiFungsi: false,
    steril: false,
    terikatRecall: false,
    gudangTujuanId: gudangList[0]?.id ?? 'GDM-02',
    prioritas: 25,
    alasanRegulasi: ''
  });

  // Simulator Directed Put-Away
  const [simulasi, setSimulasi] = useState({
    kategoriProduk: 'Diagnostik In Vitro' as IzinEdarAlkes['kategori'],
    zonaSuhuDibutuhkan: 'Cold Chain (2°C - 8°C)' as StokGudang['zonaSuhu'],
    butuhUjiFungsi: false,
    steril: false,
    terikatRecall: false,
    jumlah: 10,
    satuan: 'Box',
    binTujuanManual: '',
    alasanManual: ''
  });

  const segarkan = () => {
    setGudangList(db.getGudangFisik());
    setBinList(db.getLokasiBin());
    setAturanList(db.getAturanSimpan());
    onPerubahanData();
  };

  const namaGudang = (id: string) => gudangList.find((g) => g.id === id)?.nama ?? id;

  const binTampil = useMemo(
    () => (filterGudangId === 'Semua' ? binList : binList.filter((b) => b.gudangId === filterGudangId)),
    [binList, filterGudangId]
  );

  const hasilSimulasi = useMemo(
    () =>
      tentukanTempatSimpan({
        daftarAturan: aturanList,
        daftarGudang: gudangList,
        daftarBin: binList,
        kategoriProduk: simulasi.kategoriProduk,
        zonaSuhuDibutuhkan: simulasi.zonaSuhuDibutuhkan,
        butuhUjiFungsi: simulasi.butuhUjiFungsi,
        steril: simulasi.steril,
        terikatRecall: simulasi.terikatRecall,
        jumlah: simulasi.jumlah,
        satuan: simulasi.satuan || undefined,
        binTujuanManual: simulasi.binTujuanManual || undefined,
        alasanManual: simulasi.alasanManual || undefined
      }),
    [aturanList, gudangList, binList, simulasi]
  );

  const totalKapasitas = binList.reduce((t, b) => t + b.kapasitas, 0);
  const totalTerpakai = binList.reduce((t, b) => t + b.terpakai, 0);
  const persenOkupansi = totalKapasitas > 0 ? Math.round((totalTerpakai / totalKapasitas) * 100) : 0;

  const simpanGudang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGudang.nama.trim()) return;
    const item: GudangFisik = {
      id: `GDM-${String(gudangList.length + 1).padStart(2, '0')}`,
      nama: formGudang.nama.trim(),
      tipe: formGudang.tipe,
      alamat: formGudang.alamat.trim(),
      penanggungJawab: formGudang.penanggungJawab.trim(),
      zonaSuhu: formGudang.zonaSuhu,
      jumlahBin: 0,
      isActive: true,
      catatan: formGudang.catatan.trim() || 'Terdaftar mengikuti standar isolasi ruang CDAKB.'
    };
    db.addGudangFisik(item);
    setModalGudang(false);
    setPesanPenjaga({ tipe: 'sukses', teks: `Unit gudang ${item.nama} (${item.id}) berhasil ditambahkan.` });
    segarkan();
  };

  const simpanBin = (e: React.FormEvent) => {
    e.preventDefault();
    const induk = gudangList.find((g) => g.id === formBin.gudangId);
    if (!induk) return;

    // Penjaga §1 Tab 2: Bin tidak boleh menampung zona suhu berbeda dari gudang / aturan simpan
    if (formBin.zonaSuhu !== induk.zonaSuhu) {
      setPesanPenjaga({
        tipe: 'tolak',
        teks: `Penjaga Struktur Gudang menolak pembukaan bin: zona suhu bin (${formBin.zonaSuhu}) bertentangan dengan zona suhu ${induk.nama} (${induk.zonaSuhu}).`
      });
      return;
    }

    const aturanGudang = aturanList.filter((a) => a.isActive && a.gudangTujuanId === induk.id && a.zonaSuhuDibutuhkan);
    const aturanBertentangan = aturanGudang.find((a) => a.zonaSuhuDibutuhkan !== formBin.zonaSuhu);
    if (aturanBertentangan) {
      setPesanPenjaga({
        tipe: 'tolak',
        teks: `Penjaga Directed Put-Away menolak bin: aturan "${aturanBertentangan.namaAturan}" mewajibkan ${aturanBertentangan.zonaSuhuDibutuhkan} pada ${induk.nama}.`
      });
      return;
    }

    const kode = `BIN-${formBin.lorong}${formBin.baris}-${formBin.rak}-${formBin.laci}`;
    if (binList.some((b) => b.id === kode)) {
      setPesanPenjaga({ tipe: 'tolak', teks: `Kode lokasi bin ${kode} sudah terdaftar pada struktur rak.` });
      return;
    }

    const baru: LokasiBin = {
      id: kode,
      gudangId: formBin.gudangId,
      lorong: formBin.lorong.toUpperCase(),
      baris: formBin.baris,
      rak: formBin.rak,
      laci: formBin.laci,
      zonaSuhu: formBin.zonaSuhu,
      kategoriTersimpan: formBin.kategoriTersimpan,
      kapasitas: Math.max(1, Number(formBin.kapasitas)),
      terpakai: 0,
      satuan: formBin.satuan || 'Unit',
      rfidTagId: formBin.rfidTagId.trim() || `RFID-${kode}`,
      jarakDariDockMeter: Math.max(1, Number(formBin.jarakDariDockMeter))
    };
    db.addLokasiBin(baru);
    db.ubahGudangFisik(induk.id, { jumlahBin: binList.filter((b) => b.gudangId === induk.id).length + 1 });
    setModalBin(false);
    setPesanPenjaga({ tipe: 'sukses', teks: `Bin ${kodeBinDariLokasi(baru)} berhasil dibuka pada ${induk.nama}.` });
    segarkan();
  };

  const simpanAturan = (e: React.FormEvent) => {
    e.preventDefault();
    const gudangTujuan = gudangList.find((g) => g.id === formAturan.gudangTujuanId);
    if (!gudangTujuan) return;

    if (formAturan.zonaSuhuDibutuhkan && formAturan.zonaSuhuDibutuhkan !== gudangTujuan.zonaSuhu) {
      setPesanPenjaga({
        tipe: 'tolak',
        teks: `Penjaga Aturan Simpan menolak: aturan meminta ${formAturan.zonaSuhuDibutuhkan}, sedangkan ${gudangTujuan.nama} berzona ${gudangTujuan.zonaSuhu}.`
      });
      return;
    }

    const baru: AturanSimpan = {
      id: `ATR-${String(aturanList.length + 1).padStart(2, '0')}`,
      namaAturan: formAturan.namaAturan.trim(),
      ...(formAturan.kategoriProduk ? { kategoriProduk: formAturan.kategoriProduk } : {}),
      ...(formAturan.zonaSuhuDibutuhkan ? { zonaSuhuDibutuhkan: formAturan.zonaSuhuDibutuhkan } : {}),
      ...(formAturan.butuhUjiFungsi ? { butuhUjiFungsi: true } : {}),
      ...(formAturan.steril ? { steril: true } : {}),
      ...(formAturan.terikatRecall ? { terikatRecall: true } : {}),
      gudangTujuanId: formAturan.gudangTujuanId,
      prioritas: Number(formAturan.prioritas),
      isActive: true,
      alasanRegulasi: formAturan.alasanRegulasi.trim() || 'Pemisahan zona sesuai pedoman teknis CDAKB.'
    };
    db.addAturanSimpan(baru);
    setModalAturan(false);
    setPesanPenjaga({ tipe: 'sukses', teks: `Aturan directed put-away "${baru.namaAturan}" diaktifkan.` });
    segarkan();
  };

  return (
    <div className="space-y-5">
      {pesanPenjaga && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs flex items-start justify-between gap-3 ${
            pesanPenjaga.tipe === 'tolak'
              ? 'border-rose-200 bg-rose-50 text-rose-900'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          <div className="flex items-start gap-2">
            {pesanPenjaga.tipe === 'tolak' ? (
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            )}
            <span>{pesanPenjaga.teks}</span>
          </div>
          <button
            type="button"
            onClick={() => setPesanPenjaga(null)}
            className="text-2xs font-bold hover:underline cursor-pointer whitespace-nowrap"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Unit Gudang Aktif"
          value={`${gudangList.filter((g) => g.isActive).length} / ${gudangList.length}`}
          hint="Utama, Cold Room, Karantina, Retur & Bad Stock"
          tone="amber"
        />
        <Stat
          label="Lokasi Bin Terpetakan"
          value={binList.length}
          hint="Kode Aisle-Row-Shelf-Bin + tag RFID"
          tone="blue"
        />
        <Stat
          label="Okupansi Rak Gabungan"
          value={`${persenOkupansi}%`}
          hint={`${totalTerpakai.toLocaleString('id-ID')} dari ${totalKapasitas.toLocaleString('id-ID')} kapasitas terpakai`}
          tone={persenOkupansi > 85 ? 'rose' : 'emerald'}
        />
        <Stat
          label="Aturan Directed Put-Away"
          value={aturanList.filter((a) => a.isActive).length}
          hint="Prioritas angka terkecil dieksekusi lebih dulu"
          tone="slate"
        />
      </div>

      {/* Multi-Warehouse Setup */}
      <Panel
        judul="Multi-Warehouse Setup (Isolasi Ruang Fisik CDAKB)"
        keterangan="Setiap zona fisik memiliki penanggung jawab tetap dan pemisahan tegas antara rak barang layak jual, rantai dingin, karantina mutu, retur fasyankes, serta barang rusak."
        aksi={
          <button type="button" onClick={() => setModalGudang(true)} className={tombolPrimerGudang}>
            <Plus className="w-4 h-4" />
            Tambah Unit Gudang
          </button>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Kode & Nama Gudang</th>
                <th className="py-3 px-4">Tipe Ruang</th>
                <th className="py-3 px-4">Zona Suhu Standar</th>
                <th className="py-3 px-4">Penanggung Jawab</th>
                <th className="py-3 px-4">Jumlah Bin</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gudangList.map((g) => {
                const jmlBin = binList.filter((b) => b.gudangId === g.id).length;
                return (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{g.nama}</div>
                      <div className="text-2xs text-slate-500 font-mono">{g.id} · {g.alamat}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge tone={toneTipeGudang(g.tipe)}>{g.tipe}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{g.zonaSuhu}</td>
                    <td className="py-3 px-4 text-slate-700">{g.penanggungJawab}</td>
                    <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-800">{jmlBin} bin</td>
                    <td className="py-3 px-4">
                      <Badge tone={g.isActive ? 'emerald' : 'slate'}>{g.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          db.ubahGudangFisik(g.id, { isActive: !g.isActive });
                          segarkan();
                        }}
                        className={tombolSekunder}
                      >
                        {g.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Lokasi Bin */}
      <Panel
        judul="Pemetaan Lokasi Bin (Aisle-Row-Shelf-Bin)"
        keterangan="Penjaga struktur menolak pembukaan atau pengubahan bin yang zona suhunya menyimpang dari unit gudang induknya."
        aksi={
          <>
            <div className="flex items-center gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => setFilterGudangId('Semua')}
                className={chipFilter(filterGudangId === 'Semua')}
              >
                Semua Gudang
              </button>
              {gudangList.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setFilterGudangId(g.id)}
                  className={chipFilter(filterGudangId === g.id)}
                >
                  {g.id}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const g = gudangList.find((x) => x.id === (filterGudangId === 'Semua' ? 'GDM-01' : filterGudangId)) ?? gudangList[0];
                if (g) setFormBin((prev) => ({ ...prev, gudangId: g.id, zonaSuhu: g.zonaSuhu }));
                setModalBin(true);
              }}
              className={tombolPrimerGudang}
            >
              <Plus className="w-4 h-4" />
              Buka Lokasi Bin
            </button>
          </>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Kode Bin (Lorong-Baris-Rak-Laci)</th>
                <th className="py-3 px-4">Gudang & Kategori</th>
                <th className="py-3 px-4">Zona Suhu</th>
                <th className="py-3 px-4">Tag RFID & Jarak Dock</th>
                <th className="py-3 px-4 w-56">Okupansi Kapasitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {binTampil.map((b) => {
                const persen = b.kapasitas > 0 ? Math.round((b.terpakai / b.kapasitas) * 100) : 0;
                return (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-amber-900">{kodeBinDariLokasi(b)}</div>
                      <div className="text-2xs font-mono text-slate-500">{b.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{namaGudang(b.gudangId)}</div>
                      <div className="text-2xs text-slate-500">{b.kategoriTersimpan}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{b.zonaSuhu}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">
                      <div>{b.rfidTagId}</div>
                      <div className="text-2xs text-slate-500">{b.jarakDariDockMeter} m dari dock</div>
                    </td>
                    <td className="py-3 px-4">
                      <BarCapaian
                        label={`${b.terpakai} / ${b.kapasitas} ${b.satuan}`}
                        persen={persen}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Aturan Directed Put-Away & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Panel
            judul="Aturan Directed Put-Away"
            keterangan="Resolusi otomatis membaca atribut katalog produk (kategori, zona suhu, uji fungsi, steril, status recall) lalu mengarahkan ke bin terdekat dari dock yang masih memuat kapasitas."
            aksi={
              <button type="button" onClick={() => setModalAturan(true)} className={tombolPrimerGudang}>
                <Plus className="w-4 h-4" />
                Tambah Aturan
              </button>
            }
          >
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-3 px-4">Prioritas</th>
                    <th className="py-3 px-4">Nama Aturan & Kondisi</th>
                    <th className="py-3 px-4">Gudang Tujuan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[...aturanList]
                    .sort((a, b) => a.prioritas - b.prioritas)
                    .map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold tabular-nums text-slate-800">#{a.prioritas}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{a.namaAturan}</div>
                          <div className="text-2xs text-slate-500 leading-relaxed">
                            {[
                              a.kategoriProduk,
                              a.zonaSuhuDibutuhkan,
                              a.butuhUjiFungsi ? 'Wajib Uji Fungsi' : null,
                              a.steril ? 'Steril' : null,
                              a.terikatRecall ? 'Khusus Recall/KTD' : null
                            ]
                              .filter(Boolean)
                              .join(' · ') || 'Aturan umum'}
                          </div>
                          <div className="text-2xs text-slate-400 mt-0.5">{a.alasanRegulasi}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">{namaGudang(a.gudangTujuanId)}</td>
                        <td className="py-3 px-4">
                          <Badge tone={a.isActive ? 'emerald' : 'slate'}>{a.isActive ? 'Aktif' : 'Nonaktif'}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              db.ubahAturanSimpan(a.id, { isActive: !a.isActive });
                              segarkan();
                            }}
                            className={tombolSekunder}
                          >
                            {a.isActive ? 'Matikan' : 'Aktifkan'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel
          judul="Simulator Directed Put-Away"
          keterangan="Uji penentuan rak otomatis atau simulasi penempatan manual beralasan."
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className={labelClass}>Kategori Katalog</label>
              <select
                value={simulasi.kategoriProduk}
                onChange={(e) => setSimulasi({ ...simulasi, kategoriProduk: e.target.value as IzinEdarAlkes['kategori'] })}
                className={inputClass}
              >
                {KATEGORI_ALKES.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Zona Suhu Dibutuhkan</label>
              <select
                value={simulasi.zonaSuhuDibutuhkan}
                onChange={(e) => setSimulasi({ ...simulasi, zonaSuhuDibutuhkan: e.target.value as StokGudang['zonaSuhu'] })}
                className={inputClass}
              >
                {ZONA_SUHU.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelClass}>Jumlah Masuk</label>
                <input
                  type="number"
                  min={1}
                  value={simulasi.jumlah}
                  onChange={(e) => setSimulasi({ ...simulasi, jumlah: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass}>Satuan</label>
                <select
                  value={simulasi.satuan}
                  onChange={(e) => setSimulasi({ ...simulasi, satuan: e.target.value })}
                  className={inputClass}
                >
                  <option value="Box">Box</option>
                  <option value="Unit">Unit</option>
                  <option value="Kit">Kit</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulasi.butuhUjiFungsi}
                  onChange={(e) => setSimulasi({ ...simulasi, butuhUjiFungsi: e.target.checked })}
                />
                <span>Uji Fungsi</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulasi.steril}
                  onChange={(e) => setSimulasi({ ...simulasi, steril: e.target.checked })}
                />
                <span>Steril</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulasi.terikatRecall}
                  onChange={(e) => setSimulasi({ ...simulasi, terikatRecall: e.target.checked })}
                />
                <span>Bets Recall</span>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className={labelClass}>Override Bin Manual (Opsional)</label>
              <select
                value={simulasi.binTujuanManual}
                onChange={(e) => setSimulasi({ ...simulasi, binTujuanManual: e.target.value })}
                className={inputClass}
              >
                <option value="">— Ikuti Aturan Otomatis —</option>
                {binList.map((b) => (
                  <option key={b.id} value={b.id}>{b.id} ({kodeBinDariLokasi(b)})</option>
                ))}
              </select>
              {simulasi.binTujuanManual && (
                <input
                  type="text"
                  value={simulasi.alasanManual}
                  onChange={(e) => setSimulasi({ ...simulasi, alasanManual: e.target.value })}
                  placeholder="Wajib isi alasan penempatan manual..."
                  className={`${inputClass} mt-2`}
                />
              )}
            </div>

            <div
              className={`rounded-xl border p-3 leading-relaxed ${
                hasilSimulasi.penolakan
                  ? 'border-rose-200 bg-rose-50 text-rose-900'
                  : 'border-amber-200 bg-amber-50 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Hasil Resolusi ({hasilSimulasi.sumber})</span>
              </div>
              {hasilSimulasi.penolakan ? (
                <p>{hasilSimulasi.penolakan}</p>
              ) : (
                <>
                  <p>{hasilSimulasi.keterangan}</p>
                  {hasilSimulasi.bin && (
                    <p className="font-mono text-2xs mt-1 font-semibold">
                      Rekomendasi Bin: {kodeBinDariLokasi(hasilSimulasi.bin)} ({hasilSimulasi.bin.id}) · Sisa {hasilSimulasi.bin.kapasitas - hasilSimulasi.bin.terpakai} {hasilSimulasi.bin.satuan}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </Panel>
      </div>

      {/* Modal Tambah Gudang */}
      {modalGudang && (
        <Modal
          judul="Tambah Unit Gudang Fisik"
          keterangan="Setiap ruang penyimpanan tercatat dengan tipe isolasi dan zona suhu terstandar."
          onClose={() => setModalGudang(false)}
        >
          <form onSubmit={simpanGudang} className="space-y-3 text-xs">
            <div>
              <label className={labelClass}>Nama Unit Gudang</label>
              <input
                type="text"
                required
                value={formGudang.nama}
                onChange={(e) => setFormGudang({ ...formGudang, nama: e.target.value })}
                placeholder="Contoh: Gudang Steril Sekunder Blok K"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tipe Ruang</label>
                <select
                  value={formGudang.tipe}
                  onChange={(e) => setFormGudang({ ...formGudang, tipe: e.target.value as TipeGudang })}
                  className={inputClass}
                >
                  {TIPE_GUDANG.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Zona Suhu Gudang</label>
                <select
                  value={formGudang.zonaSuhu}
                  onChange={(e) => setFormGudang({ ...formGudang, zonaSuhu: e.target.value as StokGudang['zonaSuhu'] })}
                  className={inputClass}
                >
                  {ZONA_SUHU.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Penanggung Jawab</label>
                <input
                  type="text"
                  required
                  value={formGudang.penanggungJawab}
                  onChange={(e) => setFormGudang({ ...formGudang, penanggungJawab: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Alamat Fasilitas</label>
                <input
                  type="text"
                  required
                  value={formGudang.alamat}
                  onChange={(e) => setFormGudang({ ...formGudang, alamat: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Catatan Isolasi / Regulasi</label>
              <input
                type="text"
                value={formGudang.catatan}
                onChange={(e) => setFormGudang({ ...formGudang, catatan: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalGudang(false)} className={tombolSekunder}>Batal</button>
              <button type="submit" className={tombolPrimerGudang}>Simpan Unit Gudang</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Buka Bin */}
      {modalBin && (
        <Modal
          judul="Buka Lokasi Bin Baru (Aisle-Row-Shelf-Bin)"
          keterangan="Zona suhu bin wajib selaras dengan zona suhu unit gudang tempat bin dibuka."
          onClose={() => setModalBin(false)}
        >
          <form onSubmit={simpanBin} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Unit Gudang Induk</label>
                <select
                  value={formBin.gudangId}
                  onChange={(e) => {
                    const g = gudangList.find((x) => x.id === e.target.value);
                    setFormBin({ ...formBin, gudangId: e.target.value, ...(g ? { zonaSuhu: g.zonaSuhu } : {}) });
                  }}
                  className={inputClass}
                >
                  {gudangList.map((g) => (
                    <option key={g.id} value={g.id}>{g.id} — {g.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Zona Suhu Bin (Diuji Penjaga)</label>
                <select
                  value={formBin.zonaSuhu}
                  onChange={(e) => setFormBin({ ...formBin, zonaSuhu: e.target.value as StokGudang['zonaSuhu'] })}
                  className={inputClass}
                >
                  {ZONA_SUHU.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className={labelClass}>Lorong</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formBin.lorong}
                  onChange={(e) => setFormBin({ ...formBin, lorong: e.target.value.toUpperCase() })}
                  className={`${inputClass} font-mono uppercase`}
                />
              </div>
              <div>
                <label className={labelClass}>Baris</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formBin.baris}
                  onChange={(e) => setFormBin({ ...formBin, baris: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Rak</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formBin.rak}
                  onChange={(e) => setFormBin({ ...formBin, rak: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
              <div>
                <label className={labelClass}>Laci</label>
                <input
                  type="text"
                  required
                  maxLength={3}
                  value={formBin.laci}
                  onChange={(e) => setFormBin({ ...formBin, laci: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Kapasitas Maksimum</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formBin.kapasitas}
                  onChange={(e) => setFormBin({ ...formBin, kapasitas: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass}>Satuan</label>
                <input
                  type="text"
                  required
                  value={formBin.satuan}
                  onChange={(e) => setFormBin({ ...formBin, satuan: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Jarak dari Dock (m)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formBin.jarakDariDockMeter}
                  onChange={(e) => setFormBin({ ...formBin, jarakDariDockMeter: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Kategori Produk Tersimpan</label>
                <input
                  type="text"
                  required
                  value={formBin.kategoriTersimpan}
                  onChange={(e) => setFormBin({ ...formBin, kategoriTersimpan: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Tag RFID Rak</label>
                <input
                  type="text"
                  required
                  value={formBin.rfidTagId}
                  onChange={(e) => setFormBin({ ...formBin, rfidTagId: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalBin(false)} className={tombolSekunder}>Batal</button>
              <button type="submit" className={tombolPrimerGudang}>Simpan Lokasi Bin</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Tambah Aturan Simpan */}
      {modalAturan && (
        <Modal
          judul="Tambah Aturan Directed Put-Away"
          keterangan="Aturan mengarahkan barang masuk ke gudang yang sesuai dengan atribut regulasi produk."
          onClose={() => setModalAturan(false)}
        >
          <form onSubmit={simpanAturan} className="space-y-3 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Nama Aturan</label>
                <input
                  type="text"
                  required
                  value={formAturan.namaAturan}
                  onChange={(e) => setFormAturan({ ...formAturan, namaAturan: e.target.value })}
                  placeholder="Contoh: Reagen IVD Dingin Terkontrol"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Prioritas (Angka Kecil = Utama)</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  required
                  value={formAturan.prioritas}
                  onChange={(e) => setFormAturan({ ...formAturan, prioritas: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Gudang Tujuan</label>
                <select
                  value={formAturan.gudangTujuanId}
                  onChange={(e) => setFormAturan({ ...formAturan, gudangTujuanId: e.target.value })}
                  className={inputClass}
                >
                  {gudangList.map((g) => (
                    <option key={g.id} value={g.id}>{g.nama} ({g.zonaSuhu})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Zona Suhu Wajib</label>
                <select
                  value={formAturan.zonaSuhuDibutuhkan}
                  onChange={(e) => setFormAturan({ ...formAturan, zonaSuhuDibutuhkan: e.target.value as '' | StokGudang['zonaSuhu'] })}
                  className={inputClass}
                >
                  <option value="">— Semua Zona —</option>
                  {ZONA_SUHU.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Filter Kategori Produk (Opsional)</label>
              <select
                value={formAturan.kategoriProduk}
                onChange={(e) => setFormAturan({ ...formAturan, kategoriProduk: e.target.value as '' | IzinEdarAlkes['kategori'] })}
                className={inputClass}
              >
                <option value="">— Semua Kategori —</option>
                {KATEGORI_ALKES.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formAturan.butuhUjiFungsi}
                  onChange={(e) => setFormAturan({ ...formAturan, butuhUjiFungsi: e.target.checked })}
                />
                <span>Khusus Alat Wajib Uji Fungsi</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formAturan.steril}
                  onChange={(e) => setFormAturan({ ...formAturan, steril: e.target.checked })}
                />
                <span>Khusus Produk Steril</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formAturan.terikatRecall}
                  onChange={(e) => setFormAturan({ ...formAturan, terikatRecall: e.target.checked })}
                />
                <span>Hanya Saat Recall / KTD</span>
              </label>
            </div>

            <div>
              <label className={labelClass}>Alasan Regulasi CDAKB / ISO 13485</label>
              <input
                type="text"
                required
                value={formAturan.alasanRegulasi}
                onChange={(e) => setFormAturan({ ...formAturan, alasanRegulasi: e.target.value })}
                placeholder="Contoh: Isolasi suhu 2-8°C mencegah degradasi reagen diagnostik"
                className={inputClass}
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalAturan(false)} className={tombolSekunder}>Batal</button>
              <button type="submit" className={tombolPrimerGudang}>Simpan Aturan</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
