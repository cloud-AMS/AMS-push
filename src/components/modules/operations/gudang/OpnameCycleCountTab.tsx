import { useMemo, useState } from 'react';
import { db } from '../../../../services/pocketbase';
import { JejakPergerakan, OpnameStok, UserRole } from '../../../../types';
import {
  hitungSelisihOpname,
  lembarHitungBlind,
  verifikasiRantaiHash
} from '../../../../utils/gudang';
import {
  CheckCircle2,
  EyeOff,
  FileCheck,
  Link2,
  Plus,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import {
  Badge,
  Modal,
  Panel,
  Stat,
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
  onPerubahanData: () => void;
}

const toneOpname = (st: OpnameStok['status']): Tone => {
  if (st === 'Selesai') return 'emerald';
  if (st === 'Selisih Diajukan') return 'rose';
  if (st === 'Terkunci') return 'amber';
  return 'blue';
};

export default function OpnameCycleCountTab({ currentRole, dariAcuan, onPerubahanData }: Props) {
  const [opnameList, setOpnameList] = useState<OpnameStok[]>(() => db.getOpnameStok());
  const [pergerakanList, setPergerakanList] = useState<JejakPergerakan[]>(() => db.getJejakPergerakan());
  const [gudangList] = useState(() => db.getGudangFisik());
  const konfigurasi = useMemo(() => db.getKonfigurasiGudang(), [opnameList]);

  const [aktifOpnameId, setAktifOpnameId] = useState<string>(
    () => opnameList.find((o) => o.status === 'Berjalan')?.id ?? opnameList[0]?.id ?? ''
  );
  const [alasanVerifikasi, setAlasanVerifikasi] = useState('');
  const [modalBuat, setModalBuat] = useState(false);
  const [formBuat, setFormBuat] = useState({
    gudangId: gudangList[0]?.id ?? 'GDM-01',
    cakupanZona: 'Cycle Count Lorong A & B Tanpa Tutup Operasional',
    metode: 'Blind Count' as OpnameStok['metode']
  });

  const [hasilIntegritas, setHasilIntegritas] = useState(() => verifikasiRantaiHash(pergerakanList));
  const [cariJejak, setCariJejak] = useState('');
  const [pesan, setPesan] = useState<{ tipe: 'sukses' | 'tolak'; teks: string } | null>(null);

  const identitas = identitasPeranGudang(currentRole);

  const segarkan = () => {
    const op = db.getOpnameStok();
    const mov = db.getJejakPergerakan();
    setOpnameList(op);
    setPergerakanList(mov);
    setHasilIntegritas(verifikasiRantaiHash(mov));
    onPerubahanData();
  };

  const opnameAktif = opnameList.find((o) => o.id === aktifOpnameId) ?? opnameList[0] ?? null;
  const evaluasiAktif = useMemo(
    () => (opnameAktif ? hitungSelisihOpname(opnameAktif, konfigurasi) : null),
    [opnameAktif, konfigurasi]
  );

  // Penjaga §1 Tab 8: Saat metode Blind Count dan status masih Berjalan, angka sistem disembunyikan mutlak!
  const sembunyikanQtySistem =
    !!opnameAktif && opnameAktif.metode === 'Blind Count' && opnameAktif.status === 'Berjalan';

  const lembarButa = useMemo(
    () => (opnameAktif ? lembarHitungBlind(opnameAktif.baris) : []),
    [opnameAktif]
  );

  const ubahQtyFisikBaris = (binId: string, nomorBets: string, nilaiStr: string) => {
    if (!opnameAktif) return;
    const angka = nilaiStr.trim() === '' ? null : Math.max(0, Number(nilaiStr));
    const barisBaru = opnameAktif.baris.map((b) => {
      if (b.binId !== binId || b.nomorBets !== nomorBets) return b;
      const statusBaris: typeof b.status =
        angka === null ? 'Belum Dihitung' : angka === b.qtySistem ? 'Cocok' : 'Selisih';
      return { ...b, qtyFisik: angka, status: statusBaris };
    });
    db.ubahOpnameStok(opnameAktif.id, { baris: barisBaru }, `Input hitung fisik ${nomorBets} @ ${binId}`);
    segarkan();
  };

  const kunciDanAjukanHitung = () => {
    if (!opnameAktif || !evaluasiAktif) return;
    if (evaluasiAktif.barisBelumDihitung > 0) {
      setPesan({
        tipe: 'tolak',
        teks: `Penjaga Opname menolak penguncian lembar ${opnameAktif.nomorOpname}: masih ada ${evaluasiAktif.barisBelumDihitung} baris yang belum diisi hasil hitung fisiknya.`
      });
      return;
    }
    const ajukan = db.ajukanSelisihOpname(opnameAktif.id);
    if (ajukan) {
      setPesan({
        tipe: ajukan.hasil.butuhVerifikasiPJT ? 'tolak' : 'sukses',
        teks: `${opnameAktif.nomorOpname} beralih ke "${ajukan.status}": ${ajukan.hasil.keterangan}`
      });
    }
    segarkan();
  };

  const verifikasiPjt = () => {
    if (!opnameAktif || !evaluasiAktif) return;
    if (evaluasiAktif.butuhVerifikasiPJT && !identitas.bolehVerifikasiPjt) {
      setPesan({
        tipe: 'tolak',
        teks: `Penjaga Ambang Selisih (${evaluasiAktif.persenSelisih.toFixed(2)}% > ${konfigurasi.ambangSelisihOpnamePersen}%): penyesuaian hanya boleh disetujui oleh peran PJT atau Manajer QA (peran aktif saat ini: ${identitas.peran}).`
      });
      return;
    }
    if (evaluasiAktif.barisSelisih.length > 0 && !alasanVerifikasi.trim() && !opnameAktif.alasanSelisih.trim()) {
      setPesan({
        tipe: 'tolak',
        teks: 'Alasan selisih fisik wajib dicantumkan sebelum PJT membukukan penyesuaian ke mata rantai log.'
      });
      return;
    }

    const waktu = waktuMutasiMonoton(dariAcuan, db.getJejakPergerakan());
    const hasil = db.verifikasiSelisihOpname(
      opnameAktif.id,
      { pengguna: identitas.pengguna, peran: identitas.peran },
      alasanVerifikasi.trim(),
      waktu
    );
    setAlasanVerifikasi('');
    setPesan({ tipe: hasil.boleh ? 'sukses' : 'tolak', teks: hasil.keterangan });
    segarkan();
  };

  const buatCycleCountBaru = (e: React.FormEvent) => {
    e.preventDefault();
    const stokGudang = db.getStokGudang().filter((s) => s.gudangId === formBuat.gudangId && s.binId);
    if (stokGudang.length === 0) {
      setPesan({ tipe: 'tolak', teks: 'Gudang terpilih belum memiliki baris stok ber-bin untuk dihitung.' });
      return;
    }
    const urut = opnameList.reduce((m, o) => Math.max(m, Number(o.id.replace(/\D/g, '')) || 0), 0) + 1;
    const nomorOpname = `OPN/CC/${dariAcuan.getFullYear()}/${String(urut).padStart(3, '0')}`;
    const baru: OpnameStok = {
      id: `OPN-${String(urut).padStart(3, '0')}`,
      nomorOpname,
      tanggal: dariAcuan.toISOString().split('T')[0],
      gudangId: formBuat.gudangId,
      cakupanZona: formBuat.cakupanZona.trim(),
      petugas: identitas.pengguna,
      metode: formBuat.metode,
      baris: stokGudang.map((s) => ({
        kodeSKU: s.kodeSKU,
        namaAlkes: s.namaAlkes,
        nomorBets: s.nomorBets,
        binId: s.binId!,
        qtySistem: s.jumlahStok,
        qtyFisik: null,
        status: 'Belum Dihitung',
        catatan: ''
      })),
      status: 'Berjalan',
      selisihUnit: 0,
      verifikasiPJT: false,
      alasanSelisih: ''
    };
    db.addOpnameStok(baru);
    setModalBuat(false);
    setAktifOpnameId(baru.id);
    setPesan({ tipe: 'sukses', teks: `Lembar ${nomorOpname} (${baru.metode}) dibuka tanpa menghentikan operasional gudang.` });
    segarkan();
  };

  const jejakTampil = useMemo(() => {
    const q = cariJejak.trim().toLowerCase();
    const terbalik = [...pergerakanList].reverse();
    if (!q) return terbalik;
    return terbalik.filter((m) =>
      [m.id, m.kodeSKU, m.namaAlkes, m.nomorBets, m.tipe, m.dokumenRujukan, m.dariBin, m.keBin]
        .some((v) => v.toLowerCase().includes(q))
    );
  }, [pergerakanList, cariJejak]);

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
          label="Siklus Opname Terdaftar"
          value={opnameList.length}
          hint={`${opnameList.filter((o) => o.metode === 'Blind Count').length} lembar Blind Count`}
          tone="amber"
        />
        <Stat
          label="Menunggu Verifikasi PJT"
          value={opnameList.filter((o) => o.status === 'Selisih Diajukan' && !o.verifikasiPJT).length}
          hint={`Ambang wajib PJT > ${konfigurasi.ambangSelisihOpnamePersen}%`}
          tone={opnameList.some((o) => o.status === 'Selisih Diajukan' && !o.verifikasiPJT) ? 'rose' : 'emerald'}
        />
        <Stat
          label="Mata Rantai Pergerakan"
          value={hasilIntegritas.jumlahBaris}
          hint={hasilIntegritas.mulaiDariGenesis ? 'Utuh sejak Genesis 0000…' : 'Jendela retensi 300 baris'}
          tone="blue"
        />
        <Stat
          label="Integritas Rantai SHA-256"
          value={hasilIntegritas.utuh ? 'Terverifikasi Utuh' : `${hasilIntegritas.penyimpangan.length} Rusak`}
          hint={`Ujung hash: ${hasilIntegritas.hashTerakhir.slice(0, 12)}…`}
          tone={hasilIntegritas.utuh ? 'emerald' : 'rose'}
        />
      </div>

      {/* Daftar & Lembar Kerja Opname */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel
          judul="Daftar Lembar Cycle Count"
          keterangan="Pilih lembar opname untuk menginput hitung fisik atau verifikasi PJT."
          aksi={
            <button type="button" onClick={() => setModalBuat(true)} className={tombolPrimerGudang}>
              <Plus className="w-4 h-4" />
              Buka Opname
            </button>
          }
        >
          <div className="space-y-2">
            {opnameList.map((o) => {
              const aktif = o.id === opnameAktif?.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setAktifOpnameId(o.id)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors cursor-pointer ${
                    aktif
                      ? 'border-amber-500 bg-amber-50/70'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{o.nomorOpname}</span>
                    <Badge tone={toneOpname(o.status)}>{o.status}</Badge>
                  </div>
                  <div className="text-xs text-slate-700 mt-1">{o.cakupanZona}</div>
                  <div className="text-2xs text-slate-500 mt-1 flex items-center justify-between">
                    <span>{o.metode} · {o.tanggal}</span>
                    <span className="font-mono">{o.baris.length} baris</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        <div className="lg:col-span-2">
          {opnameAktif && evaluasiAktif && (
            <Panel
              judul={`Lembar Hitung: ${opnameAktif.nomorOpname} (${opnameAktif.metode})`}
              keterangan={
                sembunyikanQtySistem
                  ? 'Penjaga Blind Count Aktif: kolom Qty Sistem dan selisih disembunyikan sepenuhnya dari operator selama penghitungan berjalan agar petugas benar-benar menghitung fisik di rak.'
                  : evaluasiAktif.keterangan
              }
              aksi={
                <Badge tone={sembunyikanQtySistem ? 'amber' : toneOpname(opnameAktif.status)}>
                  {sembunyikanQtySistem ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      Qty Sistem Disembunyikan
                    </>
                  ) : (
                    opnameAktif.status
                  )}
                </Badge>
              }
            >
              <div className="overflow-x-auto rounded-xl border border-slate-200 mb-4">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3">Bin & Bets</th>
                      <th className="py-2.5 px-3">Produk Alkes</th>
                      {!sembunyikanQtySistem && <th className="py-2.5 px-3 text-right">Qty Sistem</th>}
                      <th className="py-2.5 px-3 text-right">Qty Fisik Terhitung</th>
                      {!sembunyikanQtySistem && <th className="py-2.5 px-3 text-right">Selisih</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sembunyikanQtySistem
                      ? lembarButa.map((baris) => {
                          const asli = opnameAktif.baris.find(
                            (x) => x.binId === baris.binId && x.nomorBets === baris.nomorBets
                          );
                          return (
                            <tr key={baris.barisId} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono">
                                <div className="font-bold text-amber-900">{baris.binId}</div>
                                <div className="text-2xs text-slate-500">{baris.nomorBets}</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-900">{baris.namaAlkes}</div>
                                <div className="text-2xs font-mono text-slate-500">{baris.kodeSKU}</div>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <input
                                  type="number"
                                  min={0}
                                  value={asli?.qtyFisik ?? ''}
                                  onChange={(e) => ubahQtyFisikBaris(baris.binId, baris.nomorBets, e.target.value)}
                                  placeholder="Hitung fisik..."
                                  className="w-28 px-2.5 py-1.5 border border-slate-300 rounded-lg text-right font-mono tabular-nums text-xs"
                                />
                              </td>
                            </tr>
                          );
                        })
                      : opnameAktif.baris.map((b) => {
                          const delta = b.qtyFisik !== null ? b.qtyFisik - b.qtySistem : null;
                          return (
                            <tr key={`${b.binId}-${b.nomorBets}`} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono">
                                <div className="font-bold text-amber-900">{b.binId}</div>
                                <div className="text-2xs text-slate-500">{b.nomorBets}</div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-semibold text-slate-900">{b.namaAlkes}</div>
                                <div className="text-2xs font-mono text-slate-500">{b.kodeSKU}</div>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-700">
                                {b.qtySistem}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {opnameAktif.status === 'Selesai' ? (
                                  <span className="font-mono tabular-nums font-bold text-slate-900">{b.qtyFisik ?? '-'}</span>
                                ) : (
                                  <input
                                    type="number"
                                    min={0}
                                    value={b.qtyFisik ?? ''}
                                    onChange={(e) => ubahQtyFisikBaris(b.binId, b.nomorBets, e.target.value)}
                                    className="w-24 px-2 py-1 border border-slate-300 rounded-lg text-right font-mono tabular-nums text-xs"
                                  />
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                                {delta === null ? (
                                  <span className="text-slate-400">-</span>
                                ) : delta === 0 ? (
                                  <span className="text-emerald-700">0 (Cocok)</span>
                                ) : (
                                  <span className="text-rose-700">{delta > 0 ? `+${delta}` : delta}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>

              {opnameAktif.status !== 'Selesai' && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  {(opnameAktif.status === 'Selisih Diajukan' || opnameAktif.status === 'Terkunci') && (
                    <div>
                      <label className={labelClass}>Alasan Investigasi Selisih & Persetujuan PJT</label>
                      <input
                        type="text"
                        value={alasanVerifikasi}
                        onChange={(e) => setAlasanVerifikasi(e.target.value)}
                        placeholder={opnameAktif.alasanSelisih || 'Contoh: 1 box sampel uji stabilitas belum tercatat di buku keluar...'}
                        className={inputClass}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {opnameAktif.status === 'Berjalan' && (
                      <button type="button" onClick={kunciDanAjukanHitung} className={tombolPrimerGudang}>
                        <FileCheck className="w-4 h-4" />
                        Kunci Lembar Hitung & Evaluasi Selisih
                      </button>
                    )}
                    {(opnameAktif.status === 'Selisih Diajukan' || opnameAktif.status === 'Terkunci') && (
                      <button type="button" onClick={verifikasiPjt} className={tombolPrimerGudang}>
                        <ShieldCheck className="w-4 h-4" />
                        Verifikasi PJT & Bukukan Penyesuaian
                      </button>
                    )}
                  </div>
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>

      {/* Immutable Movement Log & Verifikasi Rantai Hash SHA-256 */}
      <Panel
        judul="Log Pergerakan Immutable & Verifikasi Rantai Hash SHA-256"
        keterangan="Setiap penerimaan, pemindahan rak, pengiriman FEFO, dan penyesuaian opname mengunci hash baris sebelumnya (waktu|kodeSKU|nomorBets|dariBin->keBin|jumlah|tipe|dokumenRujukan|hashSebelum)."
        aksi={
          <button
            type="button"
            onClick={() => {
              const cek = verifikasiRantaiHash(db.getJejakPergerakan());
              setHasilIntegritas(cek);
              setPesan({
                tipe: cek.utuh ? 'sukses' : 'tolak',
                teks: `Hasil Pindai Integritas SHA-256: ${cek.keterangan}`
              });
            }}
            className={tombolPrimerGudang}
          >
            <Link2 className="w-4 h-4" />
            Verifikasi Integritas Rantai
          </button>
        }
      >
        <div
          className={`mb-4 rounded-xl border p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            hasilIntegritas.utuh
              ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
              : 'border-rose-200 bg-rose-50 text-rose-950'
          }`}
        >
          <div>
            <span className="font-bold">{hasilIntegritas.keterangan}</span>
            <span className="block text-2xs font-mono mt-0.5 opacity-85">
              Rentang waktu: {hasilIntegritas.rentangWaktu} · Hash ujung: {hasilIntegritas.hashTerakhir}
            </span>
          </div>
          <Badge tone={hasilIntegritas.utuh ? 'emerald' : 'rose'}>
            {hasilIntegritas.utuh ? '0 Penyimpangan' : `${hasilIntegritas.penyimpangan.length} Penyimpangan`}
          </Badge>
        </div>

        <div className="mb-3 max-w-sm">
          <input
            type="text"
            value={cariJejak}
            onChange={(e) => setCariJejak(e.target.value)}
            placeholder="Saring log pergerakan (bets, SKU, bin, rujukan)..."
            className={inputClass}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-2.5 px-3">ID & Waktu</th>
                <th className="py-2.5 px-3">Tipe & Dokumen</th>
                <th className="py-2.5 px-3">Produk & Bets</th>
                <th className="py-2.5 px-3">Asal → Tujuan</th>
                <th className="py-2.5 px-3 text-right">Jumlah</th>
                <th className="py-2.5 px-3">Rantai Hash SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jejakTampil.slice(0, 30).map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono whitespace-nowrap">
                    <div className="font-bold text-slate-900">{m.id}</div>
                    <div className="text-2xs text-slate-500">{m.waktu}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge tone={m.tipe === 'Karantina' || m.tipe === 'Penarikan Recall' ? 'rose' : m.tipe === 'Opname' ? 'amber' : 'slate'}>
                      {m.tipe}
                    </Badge>
                    <div className="text-2xs font-mono text-slate-600 mt-0.5">{m.dokumenRujukan}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-900">{m.namaAlkes}</div>
                    <div className="text-2xs font-mono text-amber-900">{m.kodeSKU} · {m.nomorBets}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-2xs text-slate-700 whitespace-nowrap">
                    {m.dariBin} → {m.keBin}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900 whitespace-nowrap">
                    {m.jumlah} {m.satuan}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-2xs text-slate-500">
                    <div>prev: {m.hashSebelum.slice(0, 12)}…</div>
                    <div className="text-slate-800 font-semibold">curr: {m.hash.slice(0, 12)}…</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Modal Buka Cycle Count Baru */}
      {modalBuat && (
        <Modal
          judul="Buka Siklus Cycle Counting Baru"
          keterangan="Metode Blind Count menyembunyikan angka stok sistem selama operator menghitung fisik di rak."
          onClose={() => setModalBuat(false)}
        >
          <form onSubmit={buatCycleCountBaru} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Unit Gudang</label>
                <select
                  value={formBuat.gudangId}
                  onChange={(e) => setFormBuat({ ...formBuat, gudangId: e.target.value })}
                  className={inputClass}
                >
                  {gudangList.map((g) => (
                    <option key={g.id} value={g.id}>{g.id} — {g.nama}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Metode Hitung</label>
                <select
                  value={formBuat.metode}
                  onChange={(e) => setFormBuat({ ...formBuat, metode: e.target.value as OpnameStok['metode'] })}
                  className={inputClass}
                >
                  <option value="Blind Count">Blind Count (Sembunyikan Qty Sistem)</option>
                  <option value="Open Count">Open Count</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Cakupan Zona / Lorong</label>
              <input
                type="text"
                required
                value={formBuat.cakupanZona}
                onChange={(e) => setFormBuat({ ...formBuat, cakupanZona: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <button type="button" onClick={() => setModalBuat(false)} className={tombolSekunder}>Batal</button>
              <button type="submit" className={tombolPrimerGudang}>Buka Lembar Opname</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
