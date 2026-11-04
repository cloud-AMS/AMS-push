import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import {
  IzinEdarAlkes,
  StokGudang,
  TerimaBarang,
  UserRole
} from '../../../../types';
import { kodeBinDariLokasi, tentukanTempatSimpan } from '../../../../utils/gudang';
import {
  CheckCircle2,
  ClipboardCheck,
  PackageCheck,
  Plus,
  Printer,
  ShieldAlert,
  Tag
} from 'lucide-react';
import {
  Badge,
  Modal,
  Panel,
  Stat,
  chipFilter,
  identitasPeranGudang,
  inputClass,
  labelClass,
  tombolPrimerGudang,
  tombolSekunder,
  waktuMutasiMonoton,
  type Tone
} from './ui';

interface Props {
  currentRole: UserRole;
  dariAcuan: Date;
  onOpenPrintModal?: () => void;
  onPerubahanData: () => void;
}

const toneMatching = (st: TerimaBarang['statusMatching']): Tone => {
  if (st === 'Cocok') return 'emerald';
  if (st === 'Belum Dicocokkan') return 'slate';
  if (st === 'Ditolak Penerimaan') return 'rose';
  return 'amber';
};

const toneQc = (st: TerimaBarang['hasilQCMasuk']): Tone => {
  if (st === 'Lolos (Released)') return 'emerald';
  if (st === 'Karantina (Hold)') return 'amber';
  return 'rose';
};

export default function PenerimaanInboundTab({
  currentRole,
  dariAcuan,
  onOpenPrintModal,
  onPerubahanData
}: Props) {
  const [terimaList, setTerimaList] = useState<TerimaBarang[]>(() => db.getTerimaBarang());
  const [poList] = useState(() => db.getPurchaseOrder());
  const [binList, setBinList] = useState(() => db.getLokasiBin());
  const [gudangList] = useState(() => db.getGudangFisik());
  const [aturanList] = useState(() => db.getAturanSimpan());

  const [filterPosting, setFilterPosting] = useState<'Semua' | 'Antre' | 'Sudah Posting'>('Semua');
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'tolak'; teks: string } | null>(null);
  const [modalBaru, setModalBaru] = useState(false);
  const [targetQc, setTargetQc] = useState<TerimaBarang | null>(null);

  // Form Penerimaan Baru
  const [formBaru, setFormBaru] = useState({
    purchaseOrderId: poList[0]?.id ?? 'PO-001',
    kodeSKU: 'ALKES-SYR-01',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    kategoriProduk: 'Elektromedik Non Radiasi' as IzinEdarAlkes['kategori'],
    zonaSuhu: 'Ruang Sejuk AC (15°C - 25°C)' as StokGudang['zonaSuhu'],
    nomorBets: 'LOT-2024-INB09',
    tanggalKedaluwarsa: '2027-10-31',
    qtyDipesan: 10,
    qtyDiterima: 10,
    qtyDitolak: 0,
    satuan: 'Unit',
    butuhUjiFungsi: true,
    hasilUjiFungsi: 'Belum Diuji' as TerimaBarang['hasilUjiFungsi'],
    hasilQCMasuk: 'Karantina (Hold)' as TerimaBarang['hasilQCMasuk'],
    nomorLaporanQC: 'QC/INB/2024/019',
    binManual: '',
    alasanManual: ''
  });

  // Form Evaluasi QC & Uji Fungsi
  const [formQc, setFormQc] = useState({
    statusMatching: 'Cocok' as TerimaBarang['statusMatching'],
    hasilQCMasuk: 'Lolos (Released)' as TerimaBarang['hasilQCMasuk'],
    hasilUjiFungsi: 'Lolos Parameter Klinis' as TerimaBarang['hasilUjiFungsi'],
    nomorLaporanQC: '',
    catatan: ''
  });

  const identitas = identitasPeranGudang(currentRole);

  const segarkan = () => {
    setTerimaList(db.getTerimaBarang());
    setBinList(db.getLokasiBin());
    onPerubahanData();
  };

  const rekomendasiPutAway = useMemo(
    () =>
      tentukanTempatSimpan({
        daftarAturan: aturanList,
        daftarGudang: gudangList,
        daftarBin: binList,
        kategoriProduk: formBaru.kategoriProduk,
        zonaSuhuDibutuhkan: formBaru.zonaSuhu,
        butuhUjiFungsi: formBaru.butuhUjiFungsi,
        jumlah: Math.max(1, formBaru.qtyDiterima),
        satuan: formBaru.satuan,
        binTujuanManual: formBaru.binManual || undefined,
        alasanManual: formBaru.alasanManual || undefined
      }),
    [aturanList, gudangList, binList, formBaru]
  );

  const daftarTampil = useMemo(() => {
    if (filterPosting === 'Antre') return terimaList.filter((t) => !t.sudahDipostingKeStok);
    if (filterPosting === 'Sudah Posting') return terimaList.filter((t) => !!t.sudahDipostingKeStok);
    return terimaList;
  }, [terimaList, filterPosting]);

  const simpanDokumenInbound = (e: React.FormEvent) => {
    e.preventDefault();
    if (rekomendasiPutAway.penolakan || !rekomendasiPutAway.bin) {
      setPesan({
        tipe: 'tolak',
        teks: `Directed Put-Away menolak dokumen masuk: ${rekomendasiPutAway.penolakan ?? 'bin tujuan belum tervalidasi'}.`
      });
      return;
    }

    const po = poList.find((p) => p.id === formBaru.purchaseOrderId);
    const selisih = Number(formBaru.qtyDiterima) !== Number(formBaru.qtyDipesan);
    const statusMatching: TerimaBarang['statusMatching'] =
      Number(formBaru.qtyDiterima) === 0 && Number(formBaru.qtyDitolak) > 0
        ? 'Ditolak Penerimaan'
        : selisih
          ? 'Selisih Jumlah'
          : 'Cocok';

    const urut = terimaList.reduce((m, t) => Math.max(m, Number(t.id.replace(/\D/g, '')) || 0), 0) + 1;
    const nomorTerima = `GRN/CDAKB/${dariAcuan.getFullYear()}/${String(urut).padStart(3, '0')}`;

    const baru: TerimaBarang = {
      id: `TRM-${String(urut).padStart(3, '0')}`,
      nomorTerima,
      tanggalTerima: dariAcuan.toISOString().split('T')[0],
      purchaseOrderId: po?.id ?? formBaru.purchaseOrderId,
      nomorPurchaseOrder: po?.nomorPO ?? 'PO-MANUAL',
      namaPemasok: po?.namaPemasok ?? 'Pemasok Terkualifikasi',
      statusMatching,
      baris: [
        {
          kodeSKU: formBaru.kodeSKU.trim(),
          namaAlkes: formBaru.namaAlkes.trim(),
          nomorBets: formBaru.nomorBets.trim().toUpperCase(),
          tanggalKedaluwarsa: formBaru.tanggalKedaluwarsa,
          qtyDipesan: Number(formBaru.qtyDipesan),
          qtyDiterima: Number(formBaru.qtyDiterima),
          qtyDitolak: Number(formBaru.qtyDitolak),
          satuan: formBaru.satuan,
          binTujuanId: rekomendasiPutAway.bin.id,
          alasanPenolakan: Number(formBaru.qtyDitolak) > 0 ? 'Kemasan penyok saat inspeksi dock' : ''
        }
      ],
      hasilQCMasuk: formBaru.hasilQCMasuk,
      butuhUjiFungsi: formBaru.butuhUjiFungsi,
      hasilUjiFungsi: formBaru.butuhUjiFungsi ? formBaru.hasilUjiFungsi : 'Lolos Parameter Klinis',
      nomorLaporanQC: formBaru.nomorLaporanQC.trim(),
      labelDicetak: false,
      rfidDitempel: false,
      sudahDipostingKeStok: false,
      petugas: identitas.pengguna,
      catatan: rekomendasiPutAway.keterangan
    };

    db.addTerimaBarang(baru);
    setModalBaru(false);
    setPesan({
      tipe: selisih ? 'tolak' : 'sukses',
      teks: selisih
        ? `Dokumen ${nomorTerima} dicatat dengan status "Selisih Jumlah" (diterima ${baru.baris[0].qtyDiterima} vs PO ${baru.baris[0].qtyDipesan}) — pelepasan ke rak ditahan sampai rekonsiliasi PO selesai.`
        : `Dokumen ${nomorTerima} berhasil dicatat dengan arah rak ${kodeBinDariLokasi(rekomendasiPutAway.bin)}.`
    });
    segarkan();
  };

  const simpanEvaluasiQc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetQc) return;
    db.ubahTerimaBarang(
      targetQc.id,
      {
        statusMatching: formQc.statusMatching,
        hasilQCMasuk: formQc.hasilQCMasuk,
        hasilUjiFungsi: targetQc.butuhUjiFungsi ? formQc.hasilUjiFungsi : 'Lolos Parameter Klinis',
        nomorLaporanQC: formQc.nomorLaporanQC.trim(),
        catatan: formQc.catatan.trim()
      },
      `Pembaruan QC incoming & uji fungsi pada ${targetQc.nomorTerima}`
    );
    setTargetQc(null);
    setPesan({ tipe: 'sukses', teks: `Hasil QC incoming ${targetQc.nomorTerima} berhasil diperbarui.` });
    segarkan();
  };

  const rilisKeStok = (dok: TerimaBarang) => {
    // Penjaga §1 Tab 6: Jumlah diterima ≠ jumlah PO → status "Selisih Jumlah" tidak bisa release
    if (dok.statusMatching !== 'Cocok') {
      setPesan({
        tipe: 'tolak',
        teks: `Penjaga Inbound menolak release ${dok.nomorTerima}: status pencocokan PO masih "${dok.statusMatching}". Rekonsiliasi selisih dengan Purchasing/QC terlebih dahulu.`
      });
      return;
    }

    // Penjaga §1 Tab 6: Alat berat wajib lolos uji fungsi sebelum menjadi AVAILABLE (bila belum lolos dan QC mencoba Lolos Released, tahan!)
    if (dok.butuhUjiFungsi && dok.hasilUjiFungsi !== 'Lolos Parameter Klinis' && dok.hasilQCMasuk === 'Lolos (Released)') {
      setPesan({
        tipe: 'tolak',
        teks: `Penjaga Uji Fungsi menolak rilis AVAILABLE pada ${dok.nomorTerima}: alat elektromedik membutuhkan uji fungsi klinis (saat ini "${dok.hasilUjiFungsi}"). Selesaikan uji fungsi atau ubah QC ke Karantina (Hold) untuk isolasi rak karantina.`
      });
      return;
    }

    const waktu = waktuMutasiMonoton(dariAcuan, db.getJejakPergerakan());
    const hasil = db.releasePenerimaanKeStok(
      dok.id,
      { pengguna: identitas.pengguna, peran: identitas.peran },
      waktu
    );
    setPesan({
      tipe: hasil.boleh ? 'sukses' : 'tolak',
      teks: `${dok.nomorTerima}: ${hasil.keterangan}`
    });
    segarkan();
  };

  const cetakLabelDokumen = (dok: TerimaBarang) => {
    db.ubahTerimaBarang(
      dok.id,
      { labelDicetak: true, rfidDitempel: true },
      `Pencetakan label bets/ED & penempelan tag RFID untuk ${dok.nomorTerima}`
    );
    segarkan();
    if (onOpenPrintModal) {
      onOpenPrintModal();
    } else {
      setPesan({ tipe: 'sukses', teks: `Antrean label barcode/RFID ${dok.nomorTerima} ditandai tercetak.` });
    }
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
          label="Dokumen Penerimaan (GRN)"
          value={terimaList.length}
          hint="Terhubung ke Purchase Order pengadaan"
          tone="amber"
        />
        <Stat
          label="Selisih PO / Tertahan QC"
          value={terimaList.filter((t) => t.statusMatching !== 'Cocok' || t.hasilQCMasuk !== 'Lolos (Released)').length}
          hint="Diblokir dari rak jual sampai verifikasi selesai"
          tone="rose"
        />
        <Stat
          label="Antrean Cetak Label & RFID"
          value={terimaList.filter((t) => !t.labelDicetak || !t.rfidDitempel).length}
          hint="SKU, nomor bets, ED & kode bin tujuan"
          tone="blue"
        />
        <Stat
          label="Sudah Diposting ke Kartu Stok"
          value={terimaList.filter((t) => !!t.sudahDipostingKeStok).length}
          hint="Posting idempoten sekali-jalan dengan rantai hash"
          tone="emerald"
        />
      </div>

      <Panel
        judul="Penerimaan Barang Masuk (PO Matching · QC Incoming · Directed Put-Away)"
        keterangan="Penjaga inbound menahan dokumen berselisih jumlah dari rilis stok, mewajibkan uji fungsi pada alat berat sebelum berstatus AVAILABLE, dan mencegah posting ganda atas nomor terima yang sama."
        aksi={
          <>
            <div className="flex items-center gap-1 flex-wrap">
              {(['Semua', 'Antre', 'Sudah Posting'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterPosting(f)}
                  className={chipFilter(filterPosting === f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setModalBaru(true)} className={tombolPrimerGudang}>
              <Plus className="w-4 h-4" />
              Catat Penerimaan PO
            </button>
          </>
        }
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Nomor Terima & PO</th>
                <th className="py-3 px-4">Baris Barang, Bets & Bin Tujuan</th>
                <th className="py-3 px-4">Pencocokan PO</th>
                <th className="py-3 px-4">QC Masuk & Uji Fungsi</th>
                <th className="py-3 px-4">Label & Posting</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarTampil.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 align-top">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-amber-900">{t.nomorTerima}</div>
                    <div className="text-2xs font-mono text-slate-600">{t.nomorPurchaseOrder}</div>
                    <div className="text-2xs text-slate-500">{t.namaPemasok} · {t.tanggalTerima}</div>
                  </td>
                  <td className="py-3 px-4 space-y-1.5">
                    {t.baris.map((b) => (
                      <div key={`${t.id}-${b.nomorBets}`} className="rounded-lg bg-slate-50 border border-slate-200/80 px-2.5 py-1.5">
                        <div className="font-semibold text-slate-900">{b.namaAlkes}</div>
                        <div className="text-2xs font-mono text-slate-600 tabular-nums">
                          {b.nomorBets} · ED {b.tanggalKedaluwarsa} · Bin {b.binTujuanId}
                        </div>
                        <div className="text-2xs text-slate-700 tabular-nums">
                          PO: <strong>{b.qtyDipesan}</strong> · Diterima: <strong>{b.qtyDiterima}</strong> · Ditolak: <strong className={b.qtyDitolak > 0 ? 'text-rose-700' : ''}>{b.qtyDitolak}</strong> {b.satuan}
                        </div>
                      </div>
                    ))}
                  </td>
                  <td className="py-3 px-4">
                    <Badge tone={toneMatching(t.statusMatching)}>{t.statusMatching}</Badge>
                  </td>
                  <td className="py-3 px-4 space-y-1">
                    <div>
                      <Badge tone={toneQc(t.hasilQCMasuk)}>{t.hasilQCMasuk}</Badge>
                    </div>
                    {t.butuhUjiFungsi && (
                      <div className="text-2xs text-slate-600">
                        Uji Fungsi: <strong className={t.hasilUjiFungsi === 'Lolos Parameter Klinis' ? 'text-emerald-800' : 'text-rose-800'}>{t.hasilUjiFungsi}</strong>
                      </div>
                    )}
                    <div className="text-2xs font-mono text-slate-500">{t.nomorLaporanQC || '-'}</div>
                  </td>
                  <td className="py-3 px-4 space-y-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge tone={t.labelDicetak ? 'emerald' : 'amber'}>
                        <Tag className="w-3 h-3" />
                        {t.labelDicetak ? 'Label OK' : 'Belum Cetak'}
                      </Badge>
                      <Badge tone={t.sudahDipostingKeStok ? 'blue' : 'slate'}>
                        {t.sudahDipostingKeStok ? 'Terposting' : 'Belum Posting'}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetQc(t);
                          setFormQc({
                            statusMatching: t.statusMatching,
                            hasilQCMasuk: t.hasilQCMasuk,
                            hasilUjiFungsi: t.hasilUjiFungsi,
                            nomorLaporanQC: t.nomorLaporanQC,
                            catatan: t.catatan
                          });
                        }}
                        className={tombolSekunder}
                      >
                        <span className="inline-flex items-center gap-1">
                          <ClipboardCheck className="w-3 h-3" />
                          QC
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => cetakLabelDokumen(t)}
                        className={tombolSekunder}
                        title="Cetak Label Barcode/QR & Tandai RFID"
                      >
                        <span className="inline-flex items-center gap-1">
                          <Printer className="w-3 h-3" />
                          Label
                        </span>
                      </button>
                      {!t.sudahDipostingKeStok && (
                        <button
                          type="button"
                          onClick={() => rilisKeStok(t)}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          Release Stok
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

      {/* Modal Catat Penerimaan Baru */}
      {modalBaru && (
        <Modal
          judul="Catat Penerimaan Barang Masuk (Inbound GRN)"
          keterangan="Sistem mencocokkan kuantitas terhadap PO dan mengarahkan bin tujuan melalui aturan Directed Put-Away."
          onClose={() => setModalBaru(false)}
        >
          <form onSubmit={simpanDokumenInbound} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Rujukan Purchase Order (PO)</label>
                <select
                  value={formBaru.purchaseOrderId}
                  onChange={(e) => setFormBaru({ ...formBaru, purchaseOrderId: e.target.value })}
                  className={inputClass}
                >
                  {poList.map((p) => (
                    <option key={p.id} value={p.id}>{p.nomorPO} — {p.namaPemasok}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Kategori Katalog</label>
                <select
                  value={formBaru.kategoriProduk}
                  onChange={(e) => setFormBaru({ ...formBaru, kategoriProduk: e.target.value as IzinEdarAlkes['kategori'] })}
                  className={inputClass}
                >
                  <option value="Elektromedik Non Radiasi">Elektromedik Non Radiasi</option>
                  <option value="Elektromedik Radiasi">Elektromedik Radiasi</option>
                  <option value="Non Elektromedik Steril">Non Elektromedik Steril</option>
                  <option value="Non Elektromedik Non Steril">Non Elektromedik Non Steril</option>
                  <option value="Diagnostik In Vitro">Diagnostik In Vitro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Nama Alkes</label>
                <input
                  type="text"
                  required
                  value={formBaru.namaAlkes}
                  onChange={(e) => setFormBaru({ ...formBaru, namaAlkes: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Kode SKU</label>
                <input
                  type="text"
                  required
                  value={formBaru.kodeSKU}
                  onChange={(e) => setFormBaru({ ...formBaru, kodeSKU: e.target.value })}
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Nomor Bets</label>
                <input
                  type="text"
                  required
                  value={formBaru.nomorBets}
                  onChange={(e) => setFormBaru({ ...formBaru, nomorBets: e.target.value })}
                  className={`${inputClass} font-mono uppercase`}
                />
              </div>
              <div>
                <label className={labelClass}>Tanggal ED</label>
                <input
                  type="date"
                  required
                  value={formBaru.tanggalKedaluwarsa}
                  onChange={(e) => setFormBaru({ ...formBaru, tanggalKedaluwarsa: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Zona Suhu</label>
                <select
                  value={formBaru.zonaSuhu}
                  onChange={(e) => setFormBaru({ ...formBaru, zonaSuhu: e.target.value as StokGudang['zonaSuhu'] })}
                  className={inputClass}
                >
                  <option value="Ruang Sejuk AC (15°C - 25°C)">Ruang Sejuk AC (15°C - 25°C)</option>
                  <option value="Cold Chain (2°C - 8°C)">Cold Chain (2°C - 8°C)</option>
                  <option value="Suhu Kamar (< 30°C)">Suhu Kamar (&lt; 30°C)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className={labelClass}>Qty PO</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formBaru.qtyDipesan}
                  onChange={(e) => setFormBaru({ ...formBaru, qtyDipesan: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass}>Qty Diterima</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={formBaru.qtyDiterima}
                  onChange={(e) => setFormBaru({ ...formBaru, qtyDiterima: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums font-bold`}
                />
              </div>
              <div>
                <label className={labelClass}>Qty Ditolak</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={formBaru.qtyDitolak}
                  onChange={(e) => setFormBaru({ ...formBaru, qtyDitolak: Number(e.target.value) })}
                  className={`${inputClass} tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClass}>Satuan</label>
                <select
                  value={formBaru.satuan}
                  onChange={(e) => setFormBaru({ ...formBaru, satuan: e.target.value })}
                  className={inputClass}
                >
                  <option value="Unit">Unit</option>
                  <option value="Box">Box</option>
                  <option value="Kit">Kit</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Hasil QC Incoming Awal</label>
                <select
                  value={formBaru.hasilQCMasuk}
                  onChange={(e) => setFormBaru({ ...formBaru, hasilQCMasuk: e.target.value as TerimaBarang['hasilQCMasuk'] })}
                  className={inputClass}
                >
                  <option value="Lolos (Released)">Lolos (Released)</option>
                  <option value="Karantina (Hold)">Karantina (Hold)</option>
                  <option value="Tolak (Rejected)">Tolak (Rejected)</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 font-semibold text-slate-700 mb-1">
                  <input
                    type="checkbox"
                    checked={formBaru.butuhUjiFungsi}
                    onChange={(e) => setFormBaru({ ...formBaru, butuhUjiFungsi: e.target.checked })}
                  />
                  <span>Wajib Uji Fungsi Elektromedik</span>
                </label>
                {formBaru.butuhUjiFungsi && (
                  <select
                    value={formBaru.hasilUjiFungsi}
                    onChange={(e) => setFormBaru({ ...formBaru, hasilUjiFungsi: e.target.value as TerimaBarang['hasilUjiFungsi'] })}
                    className={inputClass}
                  >
                    <option value="Belum Diuji">Belum Diuji</option>
                    <option value="Lolos Parameter Klinis">Lolos Parameter Klinis</option>
                    <option value="Perlu Penyetelan">Perlu Penyetelan</option>
                    <option value="Tidak Layak Pakai">Tidak Layak Pakai</option>
                  </select>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
              <div className="font-bold text-amber-950">
                Rekomendasi Directed Put-Away: {rekomendasiPutAway.bin ? `${kodeBinDariLokasi(rekomendasiPutAway.bin)} (${rekomendasiPutAway.bin.id})` : 'Membutuhkan Override'}
              </div>
              <p className="text-2xs text-amber-900">{rekomendasiPutAway.penolakan ?? rekomendasiPutAway.keterangan}</p>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formBaru.binManual}
                  onChange={(e) => setFormBaru({ ...formBaru, binManual: e.target.value })}
                  className={inputClass}
                >
                  <option value="">— Gunakan Bin Rekomendasi —</option>
                  {binList.map((b) => (
                    <option key={b.id} value={b.id}>{b.id} ({kodeBinDariLokasi(b)})</option>
                  ))}
                </select>
                {formBaru.binManual && (
                  <input
                    type="text"
                    value={formBaru.alasanManual}
                    onChange={(e) => setFormBaru({ ...formBaru, alasanManual: e.target.value })}
                    placeholder="Alasan penempatan manual..."
                    className={inputClass}
                  />
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalBaru(false)} className={tombolSekunder}>Batal</button>
              <button type="submit" className={tombolPrimerGudang}>Simpan Dokumen Terima</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Evaluasi QC & Uji Fungsi */}
      {targetQc && (
        <Modal
          judul={`Evaluasi QC Incoming — ${targetQc.nomorTerima}`}
          keterangan={`${targetQc.namaPemasok} · PO ${targetQc.nomorPurchaseOrder}`}
          onClose={() => setTargetQc(null)}
        >
          <form onSubmit={simpanEvaluasiQc} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Status Pencocokan PO</label>
                <select
                  value={formQc.statusMatching}
                  onChange={(e) => setFormQc({ ...formQc, statusMatching: e.target.value as TerimaBarang['statusMatching'] })}
                  className={inputClass}
                >
                  <option value="Cocok">Cocok</option>
                  <option value="Selisih Jumlah">Selisih Jumlah</option>
                  <option value="Bets Tidak Sesuai PO">Bets Tidak Sesuai PO</option>
                  <option value="Ditolak Penerimaan">Ditolak Penerimaan</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Keputusan QC Masuk</label>
                <select
                  value={formQc.hasilQCMasuk}
                  onChange={(e) => setFormQc({ ...formQc, hasilQCMasuk: e.target.value as TerimaBarang['hasilQCMasuk'] })}
                  className={inputClass}
                >
                  <option value="Lolos (Released)">Lolos (Released)</option>
                  <option value="Karantina (Hold)">Karantina (Hold)</option>
                  <option value="Tolak (Rejected)">Tolak (Rejected)</option>
                </select>
              </div>
            </div>

            {targetQc.butuhUjiFungsi && (
              <div>
                <label className={labelClass}>Hasil Uji Fungsi & Kalibrasi Elektromedik</label>
                <select
                  value={formQc.hasilUjiFungsi}
                  onChange={(e) => setFormQc({ ...formQc, hasilUjiFungsi: e.target.value as TerimaBarang['hasilUjiFungsi'] })}
                  className={inputClass}
                >
                  <option value="Belum Diuji">Belum Diuji</option>
                  <option value="Lolos Parameter Klinis">Lolos Parameter Klinis</option>
                  <option value="Perlu Penyetelan">Perlu Penyetelan</option>
                  <option value="Tidak Layak Pakai">Tidak Layak Pakai</option>
                </select>
              </div>
            )}

            <div>
              <label className={labelClass}>Nomor Laporan Inspeksi QC</label>
              <input
                type="text"
                value={formQc.nomorLaporanQC}
                onChange={(e) => setFormQc({ ...formQc, nomorLaporanQC: e.target.value })}
                className={`${inputClass} font-mono`}
              />
            </div>

            <div>
              <label className={labelClass}>Catatan Rekonsiliasi / PJT</label>
              <textarea
                rows={2}
                value={formQc.catatan}
                onChange={(e) => setFormQc({ ...formQc, catatan: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setTargetQc(null)} className={tombolSekunder}>Batal</button>
              <button type="submit" className={tombolPrimerGudang}>Simpan Keputusan QC</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
