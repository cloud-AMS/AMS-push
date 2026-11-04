import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import {
  PenarikanProduk,
  ProdukKembalian,
  StokGudang,
  UserRole
} from '../../../../types';
import {
  dampakRecallBets,
  gerbangPenutupanRecall,
  statusTerkunci,
  statusUnitStok
} from '../../../../utils/gudang';
import {
  AlertTriangle,
  CheckCircle2,
  Lock,
  Plus,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Unlock
} from 'lucide-react';
import {
  Badge,
  BarCapaian,
  Modal,
  Panel,
  Stat,
  chipFilter,
  identitasPeranGudang,
  inputClass,
  labelClass,
  tombolBahaya,
  tombolPrimerGudang,
  tombolSekunder,
  toneStatusStok,
  type Tone
} from './ui';

interface Props {
  currentRole: UserRole;
  dariAcuan: Date;
  onPerubahanData: () => void;
}

const STATUS_RECALL: PenarikanProduk['status'][] = [
  'Pemberitahuan Dikirim',
  'Penarikan Lapangan',
  'Karantina Pusat',
  'Pemusnahan / Return Pabrik',
  'Ditutup'
];

const DISPOSISI_RETUR: ProdukKembalian['statusKarantina'][] = [
  'Di Ruang Karantina',
  'Layak Jual Kembali',
  'Dikembalikan ke Pabrik',
  'Dimusnahkan'
];

const toneRecall = (st: PenarikanProduk['status']): Tone => {
  if (st === 'Ditutup') return 'emerald';
  if (st === 'Karantina Pusat' || st === 'Pemusnahan / Return Pabrik') return 'blue';
  if (st === 'Penarikan Lapangan') return 'amber';
  return 'rose';
};

export default function KarantinaRecallTab({ currentRole, dariAcuan, onPerubahanData }: Props) {
  const [recallList, setRecallList] = useState<PenarikanProduk[]>(() => db.getPenarikanProduk());
  const [returList, setReturList] = useState<ProdukKembalian[]>(() => db.getProdukKembalian());
  const [stokList, setStokList] = useState<StokGudang[]>(() => db.getStokGudang());
  const [sjList] = useState(() => db.getSuratJalan());
  const [unitSerialList, setUnitSerialList] = useState(() => db.getUnitSerial());

  const [betsCari, setBetsCari] = useState('LOT-2024-PM44');
  const [modalRecallBaru, setModalRecallBaru] = useState(false);
  const [filterKarantina, setFilterKarantina] = useState<'Semua' | 'QUARANTINE' | 'DAMAGED' | 'EXPIRED_LOCK'>('Semua');
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'tolak'; teks: string } | null>(null);

  const [formRecall, setFormRecall] = useState({
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorBetsTerdampak: 'LOT-2024-SP08',
    alasanRecall: 'Temuan penyimpangan sensor oklusi dari buletin keselamatan prinsipal & tindak lanjut KTD.',
    klasifikasiRecall: 'Kelas II (Risiko Medis Sementara)' as PenarikanProduk['klasifikasiRecall'],
    jumlahBeredar: 12,
    fasyankesTerdampakTeks: 'RSUP Dr. Sardjito Yogyakarta, RSUD Tarakan Jakarta Pusat',
    tanggalMulaiRecall: dariAcuan.toISOString().split('T')[0],
    targetSelesai: new Date(dariAcuan.getTime() + 30 * 86_400_000).toISOString().split('T')[0]
  });

  const identitas = identitasPeranGudang(currentRole);

  const segarkan = () => {
    setRecallList(db.getPenarikanProduk());
    setReturList(db.getProdukKembalian());
    setStokList(db.getStokGudang());
    setUnitSerialList(db.getUnitSerial());
    onPerubahanData();
  };

  // Analisis dampak recall real-time atas nomor bets yang dipilih
  const evaluasiDampak = useMemo(() => {
    const bersih = betsCari.trim().toUpperCase();
    const dampak = dampakRecallBets({
      nomorBets: bersih,
      daftarStok: stokList,
      daftarSuratJalan: sjList,
      daftarUnit: unitSerialList
    });
    const ketelusuran = bersih ? db.cariKetelusuran(bersih) : null;
    return { bersih, dampak, ketelusuran };
  }, [betsCari, stokList, sjList, unitSerialList]);

  const eksekusiKunciBetsRecall = () => {
    const { bersih, dampak, ketelusuran } = evaluasiDampak;
    if (!bersih) return;
    if (dampak.barisTerkunci.length === 0 && dampak.daftarPenerima.length === 0) {
      setPesan({
        tipe: 'tolak',
        teks: `Nomor bets ${bersih} tidak ditemukan pada kartu stok maupun riwayat surat jalan.`
      });
      return;
    }

    const alasan = `Recall Hold CDAKB atas bets ${bersih} — diblokir otomatis dari alokasi FEFO`;
    dampak.barisTerkunci.forEach((b) => {
      db.kunciStokKarantina(b.stokId, alasan);
    });

    if (dampak.unitSerialTerdampak.length > 0) {
      const serialBaru = unitSerialList.map((u) =>
        u.nomorBets === bersih
          ? { ...u, statusUnit: 'Ditarik (Recall)' as const }
          : u
      );
      db.saveUnitSerial(serialBaru);
    }

    const barisContoh = stokList.find((s) => s.nomorBets === bersih);
    if (barisContoh) {
      db.antrekanSinkronisasiLkpp({
        kodeSKU: barisContoh.kodeSKU,
        namaProduk: barisContoh.namaAlkes,
        nomorPaketLkpp: `RECALL-${bersih}`,
        qtyDilaporkan: 0,
        satuan: barisContoh.satuan,
        pemicu: 'Recall',
        nomorBets: bersih
      });
    }

    const fasyankesPertama =
      dampak.daftarPenerima[0]?.fasyankes ??
      ketelusuran?.fasyankesPenerima[0]?.nama ??
      'RS Mitra Terdampak';

    db.catatKirimanSatuSehat({
      tipeSumberDaya: 'SupplyDelivery',
      nomorRujukan: `RECALL/${dariAcuan.getFullYear()}/${bersih}`,
      kodeFasyankes: 'FKN-RS-0041',
      namaFasyankes: fasyankesPertama,
      nomorBets: bersih,
      namaAlkes: barisContoh?.namaAlkes ?? ketelusuran?.namaAlkes,
      nomorIzinEdar: barisContoh?.nomorIzinEdar ?? ketelusuran?.nomorIzinEdar,
      jumlah: dampak.totalUnitGudang + dampak.unitBeredar,
      satuan: barisContoh?.satuan ?? 'Unit',
      waktu: dariAcuan
    });

    db.logAudit(
      'Gudang & Logistik — Karantina & Recall',
      `Eksekusi kunci massal bets recall ${bersih}: ${dampak.totalUnitGudang} unit gudang dikarantina + antrean LKPP & SATUSEHAT`,
      bersih,
      identitas.pengguna,
      identitas.peran,
      [
        { kolom: 'statusStok', nilaiLama: 'AVAILABLE', nilaiBaru: 'QUARANTINE' },
        { kolom: 'unitSerialTerdampak', nilaiLama: '-', nilaiBaru: `${dampak.unitSerialTerdampak.length} serial` }
      ]
    );

    setPesan({
      tipe: 'sukses',
      teks: `Bets ${bersih} berhasil dikunci (${dampak.totalUnitGudang} unit di gudang), ${dampak.unitSerialTerdampak.length} nomor serial ditandai Ditarik (Recall), serta notifikasi LKPP & SATUSEHAT masuk antrean.`
    });
    segarkan();
  };

  const simpanRecallBaru = (e: React.FormEvent) => {
    e.preventDefault();
    const betsBersih = formRecall.nomorBetsTerdampak.trim().toUpperCase();
    if (!formRecall.namaAlkes.trim() || !betsBersih) return;

    const nomorRecall = `REC/CDAKB/${dariAcuan.getFullYear()}/${String(recallList.length + 1).padStart(3, '0')}`;
    const fasyankes = formRecall.fasyankesTerdampakTeks
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const baru: PenarikanProduk = {
      id: `RCL-${Date.now()}`,
      nomorRecall,
      namaAlkes: formRecall.namaAlkes.trim(),
      nomorBetsTerdampak: betsBersih,
      alasanRecall: formRecall.alasanRecall.trim(),
      klasifikasiRecall: formRecall.klasifikasiRecall,
      jumlahBeredar: Math.max(Number(formRecall.jumlahBeredar) || 1, 1),
      jumlahTelahDitarik: 0,
      fasyankesTerdampak: fasyankes.length ? fasyankes : ['Fasyankes Penerima Bets Terkait'],
      tanggalMulaiRecall: formRecall.tanggalMulaiRecall,
      targetSelesai: formRecall.targetSelesai,
      status: 'Pemberitahuan Dikirim'
    };

    // Kunci otomatis kartu stok dengan bets terdampak agar tidak lolos FEFO
    stokList
      .filter((s) => s.nomorBets === betsBersih)
      .forEach((s) => {
        db.kunciStokKarantina(s.id, `Edaran Recall Resmi ${nomorRecall}: ${baru.alasanRecall}`);
      });

    db.savePenarikanProduk([baru, ...recallList]);
    db.logAudit(
      'Gudang & Logistik — Karantina & Recall',
      `Inisiasi edaran penarikan produk ${nomorRecall} (${baru.klasifikasiRecall}) untuk bets ${betsBersih}`,
      nomorRecall,
      identitas.pengguna,
      identitas.peran,
      [
        { kolom: 'status', nilaiLama: '-', nilaiBaru: baru.status },
        { kolom: 'jumlahBeredar', nilaiLama: '0', nilaiBaru: String(baru.jumlahBeredar) }
      ]
    );

    setModalRecallBaru(false);
    setBetsCari(betsBersih);
    setPesan({
      tipe: 'sukses',
      teks: `Edaran ${nomorRecall} diterbitkan di Gudang & Logistik; seluruh stok bets ${betsBersih} langsung dikunci karantina.`
    });
    segarkan();
  };

  const perbaruiProgresRecall = (
    rec: PenarikanProduk,
    jumlahBaru: number,
    statusBaru: PenarikanProduk['status']
  ) => {
    const jumlahValid = Math.max(0, Math.min(jumlahBaru, rec.jumlahBeredar));
    if (statusBaru === 'Ditutup') {
      const kandidat = { ...rec, jumlahTelahDitarik: jumlahValid };
      const cek = gerbangPenutupanRecall(kandidat);
      if (!cek.bolehDitutup) {
        setPesan({
          tipe: 'tolak',
          teks: `Penutupan ${rec.nomorRecall} ditolak penjaga: ${cek.sebab.join('; ')}.`
        });
        return;
      }
      if (!identitas.bolehVerifikasiPjt) {
        setPesan({
          tipe: 'tolak',
          teks: `Penutupan recall ${rec.nomorRecall} wajib diverifikasi oleh peran PJT atau Manajer QA (peran aktif saat ini: ${identitas.peran}).`
        });
        return;
      }
    }

    const daftarBaru = recallList.map((r) =>
      r.id === rec.id ? { ...r, jumlahTelahDitarik: jumlahValid, status: statusBaru } : r
    );
    db.savePenarikanProduk(daftarBaru);
    db.logAudit(
      'Gudang & Logistik — Karantina & Recall',
      `Pembaruan progres lapangan ${rec.nomorRecall}`,
      rec.nomorRecall,
      identitas.pengguna,
      identitas.peran,
      [
        { kolom: 'jumlahTelahDitarik', nilaiLama: String(rec.jumlahTelahDitarik), nilaiBaru: String(jumlahValid) },
        { kolom: 'status', nilaiLama: rec.status, nilaiBaru: statusBaru }
      ]
    );

    setPesan({
      tipe: 'sukses',
      teks: `Status ${rec.nomorRecall} diperbarui menjadi "${statusBaru}" (${jumlahValid}/${rec.jumlahBeredar} unit ditarik).`
    });
    segarkan();
  };

  const ubahDisposisiRetur = (
    retur: ProdukKembalian,
    statusBaru: ProdukKembalian['statusKarantina']
  ) => {
    if (statusBaru !== 'Di Ruang Karantina' && !identitas.bolehVerifikasiPjt) {
      setPesan({
        tipe: 'tolak',
        teks: `Keputusan disposisi produk kembalian (${statusBaru}) memerlukan otorisasi PJT atau Manajer QA.`
      });
      return;
    }

    const daftarBaru = returList.map((r) =>
      r.id === retur.id ? { ...r, statusKarantina: statusBaru } : r
    );
    db.saveProdukKembalian(daftarBaru);
    db.logAudit(
      'Gudang & Logistik — Karantina & Recall',
      `Keputusan disposisi retur ${retur.nomorRetur} (${retur.namaAlkes})`,
      retur.nomorRetur,
      identitas.pengguna,
      identitas.peran,
      [{ kolom: 'statusKarantina', nilaiLama: retur.statusKarantina, nilaiBaru: statusBaru }]
    );
    setPesan({
      tipe: 'sukses',
      teks: `Disposisi retur ${retur.nomorRetur} diubah menjadi "${statusBaru}" dan tercatat di audit trail.`
    });
    segarkan();
  };

  const rilisStokKarantina = (stok: StokGudang) => {
    if (!identitas.bolehVerifikasiPjt) {
      setPesan({
        tipe: 'tolak',
        teks: `Pelepasan kunci stok ${stok.nomorBets} hanya diizinkan bagi PJT atau Manajer QA.`
      });
      return;
    }
    const sedangRecall = recallList.some(
      (r) => r.nomorBetsTerdampak === stok.nomorBets && r.status !== 'Ditutup'
    );
    if (sedangRecall) {
      setPesan({
        tipe: 'tolak',
        teks: `Bets ${stok.nomorBets} terikat edaran recall aktif — tidak boleh dilepas kembali ke stok jual!`
      });
      return;
    }
    db.lepasKunciStok(stok.id, `Rilis mutu oleh ${identitas.pengguna} setelah verifikasi dokumen karantina`);
    setPesan({
      tipe: 'sukses',
      teks: `Kunci karantina pada bets ${stok.nomorBets} dilepas; stok kembali AVAILABLE untuk FEFO.`
    });
    segarkan();
  };

  const stokTerkunci = useMemo(() => {
    return stokList.filter((s) => {
      const st = statusUnitStok(s);
      if (!statusTerkunci(st)) return false;
      return filterKarantina === 'Semua' ? true : st === filterKarantina;
    });
  }, [stokList, filterKarantina]);

  const recallAktif = recallList.filter((r) => r.status !== 'Ditutup');

  return (
    <div className="space-y-5">
      {pesan && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            pesan.tipe === 'sukses'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {pesan.tipe === 'sukses' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-700 shrink-0" />
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
          label="Edaran Recall Aktif"
          value={recallAktif.length}
          hint={`Dari ${recallList.length} total histori recall produk`}
          tone={recallAktif.length > 0 ? 'rose' : 'emerald'}
        />
        <Stat
          label="Baris Stok Terkunci"
          value={stokList.filter((s) => statusTerkunci(statusUnitStok(s))).length}
          hint="QUARANTINE, DAMAGED & EXPIRED_LOCK diblokir dari FEFO"
          tone="amber"
        />
        <Stat
          label="Retur di Ruang Karantina"
          value={returList.filter((r) => r.statusKarantina === 'Di Ruang Karantina').length}
          hint="Menunggu keputusan disposisi QA / PJT"
          tone="amber"
        />
        <Stat
          label="Hak Verifikasi Rilis / Tutup"
          value={identitas.bolehVerifikasiPjt ? 'Diizinkan (PJT/QA)' : 'Baca & Eksekusi Lapangan'}
          hint={`Peran aktif: ${identitas.peran}`}
          tone={identitas.bolehVerifikasiPjt ? 'emerald' : 'slate'}
        />
      </div>

      {/* Panel 1: Pelacak Dampak Bets & Kunci Recall Satu Klik */}
      <Panel
        judul="Pelacak Dampak Bets & Kunci Karantina Recall Terpadu (Aturan §3.11)"
        keterangan="Masukkan nomor bets untuk memetakan sisa fisik di bin gudang, unit serial alat berat, dan daftar fasyankes penerima pada surat jalan, lalu kunci serentak beserta antrean LKPP & FHIR SATUSEHAT."
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 mb-4">
          <div className="flex-1">
            <label className={labelClass}>Nomor Bets / Lot yang Diperiksa</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={betsCari}
                onChange={(e) => setBetsCari(e.target.value.toUpperCase())}
                placeholder="Contoh: LOT-2024-SP08 atau LOT-2024-PM44"
                className={`${inputClass} pl-9 font-mono uppercase`}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {['LOT-2024-SP08', 'LOT-2024-PM44', 'LOT-2023-B991'].map((contoh) => (
              <button
                key={contoh}
                type="button"
                onClick={() => setBetsCari(contoh)}
                className={tombolSekunder}
              >
                {contoh}
              </button>
            ))}
            <button
              type="button"
              onClick={eksekusiKunciBetsRecall}
              className={tombolBahaya}
            >
              <Lock className="w-3.5 h-3.5" />
              Kunci Bets Recall + Antrekan LKPP &amp; FHIR
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Posisi Stok Gudang ({evaluasiDampak.dampak.totalUnitGudang} unit)</span>
              <Badge tone={evaluasiDampak.dampak.barisTerkunci.length ? 'amber' : 'slate'}>
                {evaluasiDampak.dampak.barisTerkunci.length} baris kartu stok
              </Badge>
            </div>
            {evaluasiDampak.dampak.barisTerkunci.length === 0 ? (
              <p className="text-2xs text-slate-500">
                Tidak ada sisa unit bets {evaluasiDampak.bersih || '-'} di dalam rak gudang.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {evaluasiDampak.dampak.barisTerkunci.map((b) => (
                  <li
                    key={b.stokId}
                    className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200"
                  >
                    <span className="font-mono text-2xs text-slate-700">
                      {b.stokId} • {b.binId || b.gudangId}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold tabular-nums">
                        {b.jumlah} {b.satuan}
                      </span>
                      <Badge tone={toneStatusStok(b.statusLama)}>{b.statusLama}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {evaluasiDampak.dampak.unitSerialTerdampak.length > 0 && (
              <div className="pt-2 border-t border-slate-200 text-2xs text-slate-600">
                <strong>Unit Serial Terkait:</strong>{' '}
                <span className="font-mono">{evaluasiDampak.dampak.unitSerialTerdampak.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900 flex items-center justify-between">
              <span>Fasyankes Penerima Bets ({evaluasiDampak.dampak.unitBeredar} unit via DO)</span>
              <Badge tone={evaluasiDampak.dampak.daftarPenerima.length ? 'rose' : 'slate'}>
                {evaluasiDampak.dampak.daftarPenerima.length} surat jalan
              </Badge>
            </div>
            {evaluasiDampak.dampak.daftarPenerima.length === 0 &&
            (!evaluasiDampak.ketelusuran || evaluasiDampak.ketelusuran.fasyankesPenerima.length === 0) ? (
              <p className="text-2xs text-slate-500">
                Belum ada catatan distribusi fasyankes untuk bets ini.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {evaluasiDampak.dampak.daftarPenerima.map((p) => (
                  <li
                    key={p.nomorSuratJalan}
                    className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{p.fasyankes}</div>
                      <div className="font-mono text-2xs text-slate-500">
                        {p.nomorSuratJalan} • {p.tanggal}
                      </div>
                    </div>
                    <Badge tone="blue">{p.qty} unit</Badge>
                  </li>
                ))}
                {evaluasiDampak.dampak.daftarPenerima.length === 0 &&
                  evaluasiDampak.ketelusuran?.fasyankesPenerima.map((f) => (
                    <li
                      key={f.nomorSuratJalan}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{f.nama}</div>
                        <div className="font-mono text-2xs text-slate-500">
                          {f.nomorSuratJalan} • {f.tanggalKirim}
                        </div>
                      </div>
                      <Badge tone="blue">{f.jumlah} unit</Badge>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </Panel>

      {/* Panel 2: Manajemen Eksekusi Penarikan Produk (Pemilik Penuh §0B) */}
      <Panel
        judul="Daftar Eksekusi Penarikan Produk / Product Recall (Pemilik Penuh Gudang §0B)"
        keterangan="Penutupan recall dikawal gerbangPenutupanRecall: seluruh unit beredar wajib sudah ditarik ke Karantina Pusat atau Pemusnahan / Return Pabrik, serta diverifikasi PJT/QA."
        aksi={
          <button
            type="button"
            onClick={() => setModalRecallBaru(true)}
            className={tombolPrimerGudang}
          >
            <Plus className="w-4 h-4" />
            Inisiasi Edaran Recall Baru
          </button>
        }
      >
        <div className="space-y-4">
          {recallList.map((rec) => {
            const persen = rec.jumlahBeredar > 0 ? (rec.jumlahTelahDitarik / rec.jumlahBeredar) * 100 : 0;
            const cekTutup = gerbangPenutupanRecall(rec);
            return (
              <div
                key={rec.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      {rec.nomorRecall}
                    </span>
                    <span className="font-bold text-sm text-slate-900">{rec.namaAlkes}</span>
                    <Badge tone="rose">{rec.klasifikasiRecall}</Badge>
                  </div>
                  <Badge tone={toneRecall(rec.status)}>{rec.status}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-2xs text-slate-500 block">Nomor Bets Terdampak</span>
                    <span className="font-mono font-bold text-rose-700">{rec.nomorBetsTerdampak}</span>
                  </div>
                  <div>
                    <span className="text-2xs text-slate-500 block">Periode Target Penarikan</span>
                    <span className="font-mono text-slate-800">
                      {rec.tanggalMulaiRecall} s.d. {rec.targetSelesai}
                    </span>
                  </div>
                  <div>
                    <span className="text-2xs text-slate-500 block">Fasyankes Terdampak</span>
                    <span className="text-slate-700">{rec.fasyankesTerdampak.join(', ')}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <strong>Alasan Recall:</strong> {rec.alasanRecall}
                </p>

                <BarCapaian
                  label={`Realisasi Penarikan Fisik (${rec.jumlahTelahDitarik} dari ${rec.jumlahBeredar} unit)`}
                  persen={persen}
                  hint={
                    cekTutup.bolehDitutup
                      ? 'Memenuhi syarat kuantitas & tahapan untuk verifikasi penutupan PJT.'
                      : `Syarat tutup belum terpenuhi: ${cekTutup.sebab.join(' • ')}`
                  }
                />

                {rec.status !== 'Ditutup' && (
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          perbaruiProgresRecall(
                            rec,
                            Math.min(rec.jumlahTelahDitarik + 5, rec.jumlahBeredar),
                            rec.jumlahTelahDitarik + 5 >= rec.jumlahBeredar
                              ? 'Karantina Pusat'
                              : 'Penarikan Lapangan'
                          )
                        }
                        className={tombolSekunder}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Catat +5 Unit Masuk Karantina
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          perbaruiProgresRecall(rec, rec.jumlahBeredar, 'Karantina Pusat')
                        }
                        className={tombolSekunder}
                      >
                        Tandai 100% Terkumpul di Karantina Pusat
                      </button>
                      <select
                        value={rec.status}
                        onChange={(e) =>
                          perbaruiProgresRecall(
                            rec,
                            rec.jumlahTelahDitarik,
                            e.target.value as PenarikanProduk['status']
                          )
                        }
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                      >
                        {STATUS_RECALL.filter((s) => s !== 'Ditutup').map((st) => (
                          <option key={st} value={st}>
                            Tahap: {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => perbaruiProgresRecall(rec, rec.jumlahTelahDitarik, 'Ditutup')}
                      className={tombolPrimerGudang}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Tutup Recall (Verifikasi PJT)
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Panel 3: Isolasi Stok Terkunci & Disposisi Produk Kembalian */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Panel
          judul="Daftar Kartu Stok Terkunci (Isolasi Karantina, Rusak & ED)"
          keterangan="Stok di bawah ini tidak pernah disentuh mesin FEFO sampai dilepas secara resmi oleh PJT/QA."
        >
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {(['Semua', 'QUARANTINE', 'DAMAGED', 'EXPIRED_LOCK'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterKarantina(st)}
                className={chipFilter(filterKarantina === st)}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3">Bets &amp; Alkes</th>
                  <th className="py-2.5 px-3">Bin &amp; Qty</th>
                  <th className="py-2.5 px-3">Status &amp; Alasan Kunci</th>
                  <th className="py-2.5 px-3 text-right">Rilis QA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stokTerkunci.map((s) => {
                  const st = statusUnitStok(s);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold text-slate-900">{s.nomorBets}</div>
                        <div className="text-2xs text-slate-600">{s.namaAlkes}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-2xs tabular-nums">
                        <div>{s.binId ?? s.lokasiPenyimpanan}</div>
                        <div className="font-bold text-slate-800">
                          {s.jumlahStok} {s.satuan}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge tone={toneStatusStok(st)}>{st}</Badge>
                        <div className="text-2xs text-slate-500 mt-1">
                          {s.alasanKunci || 'Tanpa catatan alasan kunci'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {st === 'QUARANTINE' ? (
                          <button
                            type="button"
                            onClick={() => rilisStokKarantina(s)}
                            className={tombolSekunder}
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Rilis PJT
                          </button>
                        ) : (
                          <span className="text-2xs text-slate-400">Non-rilis</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          judul="Jalur Retur Fasyankes & Pemusnahan (Produk Kembalian)"
          keterangan="Evaluasi fisik barang kembalian di Gudang Retur sebelum diputuskan layak jual kembali, retur prinsipal, atau pemusnahan."
        >
          <div className="space-y-3">
            {returList.map((ret) => (
              <div
                key={ret.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{ret.nomorRetur}</span>
                    <span className="text-slate-500 mx-1.5">•</span>
                    <span className="font-semibold text-slate-800">{ret.fasyankes}</span>
                  </div>
                  <Badge
                    tone={
                      ret.statusKarantina === 'Layak Jual Kembali'
                        ? 'emerald'
                        : ret.statusKarantina === 'Di Ruang Karantina'
                          ? 'amber'
                          : 'rose'
                    }
                  >
                    {ret.statusKarantina}
                  </Badge>
                </div>

                <div className="text-2xs text-slate-700">
                  <strong>{ret.namaAlkes}</strong> • Bets{' '}
                  <span className="font-mono font-bold">{ret.nomorBets}</span> • {ret.jumlah}{' '}
                  {ret.satuan} • Alasan: {ret.alasanRetur}
                </div>
                <div className="text-2xs text-slate-500 italic">{ret.catatanInspeksiQA}</div>

                <div className="pt-1 flex items-center justify-between gap-2">
                  <span className="text-2xs text-slate-500 font-mono">
                    Masuk: {ret.tanggalMasukKarantina}
                  </span>
                  <select
                    value={ret.statusKarantina}
                    onChange={(e) =>
                      ubahDisposisiRetur(
                        ret,
                        e.target.value as ProdukKembalian['statusKarantina']
                      )
                    }
                    className="px-2.5 py-1 border border-slate-300 rounded-lg bg-white text-2xs font-semibold"
                  >
                    {DISPOSISI_RETUR.map((d) => (
                      <option key={d} value={d}>
                        Disposisi: {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Modal Inisiasi Recall Baru */}
      {modalRecallBaru && (
        <Modal
          judul="Inisiasi Edaran Penarikan Produk (Product Recall)"
          keterangan="Bets terdampak akan langsung dikunci berstatus QUARANTINE pada kartu stok gudang."
          onClose={() => setModalRecallBaru(false)}
        >
          <form onSubmit={simpanRecallBaru} className="space-y-3 text-xs">
            <div>
              <label className={labelClass}>Nama Alat Kesehatan</label>
              <input
                type="text"
                required
                value={formRecall.namaAlkes}
                onChange={(e) => setFormRecall({ ...formRecall, namaAlkes: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Nomor Bets Terdampak</label>
                <input
                  type="text"
                  required
                  value={formRecall.nomorBetsTerdampak}
                  onChange={(e) =>
                    setFormRecall({ ...formRecall, nomorBetsTerdampak: e.target.value.toUpperCase() })
                  }
                  className={`${inputClass} font-mono uppercase`}
                />
              </div>
              <div>
                <label className={labelClass}>Jumlah Unit Beredar di Fasyankes</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formRecall.jumlahBeredar}
                  onChange={(e) =>
                    setFormRecall({ ...formRecall, jumlahBeredar: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Klasifikasi Risiko Recall Kemenkes</label>
              <select
                value={formRecall.klasifikasiRecall}
                onChange={(e) =>
                  setFormRecall({
                    ...formRecall,
                    klasifikasiRecall: e.target.value as PenarikanProduk['klasifikasiRecall']
                  })
                }
                className={inputClass}
              >
                <option value="Kelas I (Risiko Kematian/Cedera Serius)">
                  Kelas I (Risiko Kematian/Cedera Serius)
                </option>
                <option value="Kelas II (Risiko Medis Sementara)">
                  Kelas II (Risiko Medis Sementara)
                </option>
                <option value="Kelas III (Tidak Menimbulkan Risiko Medis)">
                  Kelas III (Tidak Menimbulkan Risiko Medis)
                </option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Daftar Fasyankes Penerima (pisahkan dengan koma)</label>
              <input
                type="text"
                required
                value={formRecall.fasyankesTerdampakTeks}
                onChange={(e) =>
                  setFormRecall({ ...formRecall, fasyankesTerdampakTeks: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Tanggal Mulai Recall</label>
                <input
                  type="date"
                  value={formRecall.tanggalMulaiRecall}
                  onChange={(e) =>
                    setFormRecall({ ...formRecall, tanggalMulaiRecall: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Target Selesai Penarikan</label>
                <input
                  type="date"
                  value={formRecall.targetSelesai}
                  onChange={(e) => setFormRecall({ ...formRecall, targetSelesai: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Alasan Teknis &amp; Rujukan FSCA / KTD</label>
              <textarea
                rows={2}
                required
                value={formRecall.alasanRecall}
                onChange={(e) => setFormRecall({ ...formRecall, alasanRecall: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalRecallBaru(false)}
                className={tombolSekunder}
              >
                Batal
              </button>
              <button type="submit" className={tombolPrimerGudang}>
                <AlertTriangle className="w-3.5 h-3.5" />
                Terbitkan Recall &amp; Kunci Bets
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
