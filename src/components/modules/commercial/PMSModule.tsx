import { useState } from 'react';
import { db } from '../../../services/pocketbase';
import { LaporanKTD, PenarikanProduk } from '../../../types';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Plus,
  ShieldAlert,
  Warehouse
} from 'lucide-react';

interface PMSModuleProps {
  onBukaRecallGudang?: () => void;
}

export default function PMSModule({ onBukaRecallGudang }: PMSModuleProps) {
  const [activeTab, setActiveTab] = useState<'ktd' | 'recall'>('ktd');
  const [ktdList, setKtdList] = useState<LaporanKTD[]>(() => db.getLaporanKTD());
  const [recallList] = useState<PenarikanProduk[]>(() => db.getPenarikanProduk());
  const [isKtdModalOpen, setIsKtdModalOpen] = useState(false);

  // New KTD Form
  const [ktdForm, setKtdForm] = useState<Partial<LaporanKTD>>({
    fasyankes: '',
    namaAlkes: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorIzinEdar: 'KEMENKES RI AKD 20501910234',
    nomorBets: 'LOT-2024-SP',
    nomorSeri: 'SN-',
    tanggalKejadian: new Date().toISOString().split('T')[0],
    dampakPasien: 'Malfungsi Tanpa Cedera',
    kronologi: '',
    statusLaporKemenkes: 'Belum Dilaporkan',
    tindakanSegera: 'Unit diamankan di karantina internal dan unit pengganti telah dipasang.',
    statusFSCA: 'Peringatan Keselamatan'
  });

  const handleSaveKTD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ktdForm.fasyankes || !ktdForm.kronologi) return;

    const newItem: LaporanKTD = {
      id: 'KTD-' + Date.now(),
      nomorLaporanKTD: `KTD/EWAT-ALKES/2024/${String(ktdList.length + 1).padStart(3, '0')}`,
      fasyankes: ktdForm.fasyankes || '',
      namaAlkes: ktdForm.namaAlkes || '',
      nomorIzinEdar: ktdForm.nomorIzinEdar || '',
      nomorBets: ktdForm.nomorBets || '',
      nomorSeri: ktdForm.nomorSeri || '-',
      tanggalKejadian: ktdForm.tanggalKejadian || new Date().toISOString().split('T')[0],
      dampakPasien: ktdForm.dampakPasien as LaporanKTD['dampakPasien'],
      kronologi: ktdForm.kronologi || '',
      statusLaporKemenkes: 'Terkirim ke e-Watch Alkes',
      tindakanSegera: ktdForm.tindakanSegera || '-',
      statusFSCA: ktdForm.statusFSCA as LaporanKTD['statusFSCA']
    };

    db.addLaporanKTD(newItem);
    setKtdList(db.getLaporanKTD());
    setIsKtdModalOpen(false);
  };

  const recallTerbuka = recallList.filter((r) => r.status !== 'Ditutup');
  const recallDitutup = recallList.filter((r) => r.status === 'Ditutup');
  const totalUnitBeredar = recallList.reduce((sum, r) => sum + r.jumlahBeredar, 0);
  const totalUnitDitarik = recallList.reduce((sum, r) => sum + r.jumlahTelahDitarik, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">
              Keselamatan Pasien &amp; Vigilans
            </span>
            <span className="text-xs text-slate-500">
              Klausul 8.2.1 ISO 13485 &amp; e-Watch Alkes Kemenkes RI
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Post-Market Surveillance (PMS) / Vigilans Alkes
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Menangani keluhan fasyankes, investigasi keselamatan pasien, dan pelaporan Kejadian Tidak Diinginkan (KTD) ke portal resmi Kementerian Kesehatan. Eksekusi kunci bets &amp; penarikan lapangan (Product Recall) dikelola penuh di Gudang &amp; Logistik (Tab 11).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'ktd' && (
            <button
              type="button"
              onClick={() => setIsKtdModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Lapor KTD e-Watch Alkes
            </button>
          )}
          {onBukaRecallGudang && (
            <button
              type="button"
              onClick={onBukaRecallGudang}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Warehouse className="w-4 h-4" />
              Eksekusi Recall di Gudang (Tab 11)
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('ktd')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'ktd'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Laporan Kejadian Tidak Diinginkan (KTD) ({ktdList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recall')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'recall'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Ringkasan Penarikan Produk / Recall ({recallTerbuka.length} Aktif)
        </button>
      </div>

      {/* Content 1: KTD List */}
      {activeTab === 'ktd' && (
        <div className="space-y-4">
          {ktdList.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                    {item.nomorLaporanKTD}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">{item.fasyankes}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                    Dampak: {item.dampakPasien}
                  </span>
                  <span className="text-2xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {item.statusLaporKemenkes}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 block mb-1">Identitas Alat &amp; Bets:</span>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                    <div>
                      Nama: <strong>{item.namaAlkes}</strong>
                    </div>
                    <div className="font-mono text-xs text-blue-800">Izin Edar: {item.nomorIzinEdar}</div>
                    <div className="font-mono text-xs">
                      Bets: {item.nomorBets} • SN: {item.nomorSeri}
                    </div>
                    <div className="text-2xs text-slate-500">Tanggal Kejadian: {item.tanggalKejadian}</div>
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 block mb-1">
                    Tindakan Cepat &amp; Evaluasi Keselamatan:
                  </span>
                  <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-200 text-slate-700 space-y-1">
                    <p className="text-xs">{item.tindakanSegera}</p>
                    <div className="pt-1 text-2xs font-bold text-rose-800">
                      Status FSCA: {item.statusFSCA}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 text-xs block mb-1">
                  Kronologi Kejadian di Fasyankes:
                </span>
                <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {item.kronologi}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content 2: Read-Only Recall Summary Panel (§0B) */}
      {activeTab === 'recall' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-amber-950">
                Pemisahan Kewenangan Regulatori vs Eksekusi Gudang (Cetak Biru §0B)
              </div>
              <p className="text-amber-900 leading-relaxed max-w-3xl">
                PMS &amp; Vigilans memantau pemenuhan regulasi penarikan produk secara baca-saja (read-only). Inisiasi edaran recall baru, penguncian fisik bets karantina, notifikasi e-Katalog LKPP / FHIR SATUSEHAT, dan verifikasi penutupan PJT dilakukan di menu <strong>Gudang &amp; Logistik → Tab 11 (Karantina &amp; Penarikan)</strong>.
              </p>
            </div>
            {onBukaRecallGudang && (
              <button
                type="button"
                onClick={onBukaRecallGudang}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs shrink-0 cursor-pointer"
              >
                <Warehouse className="w-4 h-4" />
                Buka Eksekusi Recall &amp; Kunci Bets (Tab 11)
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Recall Berjalan (Terbuka)</div>
              <div className="text-xl font-bold text-rose-700 mt-1 tabular-nums">{recallTerbuka.length}</div>
              <div className="text-2xs text-slate-500 mt-1">Dalam penarikan / karantina pusat</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Recall Selesai (Ditutup PJT)</div>
              <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums">{recallDitutup.length}</div>
              <div className="text-2xs text-slate-500 mt-1">100% unit ditarik &amp; terverifikasi</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Total Unit Ditarik Fisik</div>
              <div className="text-xl font-bold text-blue-700 mt-1 tabular-nums">
                {totalUnitDitarik} / {totalUnitBeredar}
              </div>
              <div className="text-2xs text-slate-500 mt-1">Akumulasi seluruh edaran recall</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Capaian Penarikan Nasional</div>
              <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
                {totalUnitBeredar > 0 ? Math.round((totalUnitDitarik / totalUnitBeredar) * 100) : 100}%
              </div>
              <div className="text-2xs text-slate-500 mt-1">Sumber tunggal koleksi PenarikanProduk</div>
            </div>
          </div>

          {recallList.map((rec) => {
            const persentaseTarik =
              rec.jumlahBeredar > 0
                ? Math.round((rec.jumlahTelahDitarik / rec.jumlahBeredar) * 100)
                : 0;
            return (
              <div key={rec.id} className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300">
                      {rec.nomorRecall}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{rec.namaAlkes}</span>
                  </div>
                  <span className="text-2xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                    {rec.klasifikasiRecall}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-2xs">Nomor Bets Terdampak:</span>
                    <span className="font-mono font-bold text-rose-700 text-sm">
                      {rec.nomorBetsTerdampak}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-2xs">Masa Pelaksanaan Recall:</span>
                    <span className="font-mono text-slate-700">
                      {rec.tanggalMulaiRecall} s.d. {rec.targetSelesai}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-2xs">Status Eksekusi Gudang:</span>
                    <span className="font-bold text-amber-800">{rec.status}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-700">Progres Penarikan dari Fasyankes:</span>
                    <span className="text-blue-800 tabular-nums">
                      {rec.jumlahTelahDitarik} / {rec.jumlahBeredar} Unit ({persentaseTarik}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${persentaseTarik}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-2">
                  <span className="font-semibold text-slate-800 block">Daftar Fasyankes Terdampak:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                    {rec.fasyankesTerdampak.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add KTD */}
      {isKtdModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-rose-900 mb-1">
              Catat Laporan Kejadian Tidak Diinginkan (KTD)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Format baku integrasi pelaporan ke e-Watch Alkes Kementerian Kesehatan RI.
            </p>

            <form onSubmit={handleSaveKTD} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rumah Sakit / Fasyankes Pelapor
                </label>
                <input
                  type="text"
                  required
                  value={ktdForm.fasyankes}
                  onChange={(e) => setKtdForm({ ...ktdForm, fasyankes: e.target.value })}
                  placeholder="Contoh: RSUD Tarakan Jakarta Pusat"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Alat Kesehatan</label>
                <input
                  type="text"
                  required
                  value={ktdForm.namaAlkes}
                  onChange={(e) => setKtdForm({ ...ktdForm, namaAlkes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Izin Edar</label>
                  <input
                    type="text"
                    required
                    value={ktdForm.nomorIzinEdar}
                    onChange={(e) => setKtdForm({ ...ktdForm, nomorIzinEdar: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Bets &amp; Seri</label>
                  <input
                    type="text"
                    required
                    value={ktdForm.nomorBets}
                    onChange={(e) => setKtdForm({ ...ktdForm, nomorBets: e.target.value })}
                    placeholder="LOT-2024-..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Klasifikasi Dampak</label>
                  <select
                    value={ktdForm.dampakPasien}
                    onChange={(e) =>
                      setKtdForm({
                        ...ktdForm,
                        dampakPasien: e.target.value as LaporanKTD['dampakPasien']
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Malfungsi Tanpa Cedera">Malfungsi Tanpa Cedera</option>
                    <option value="Cedera Ringan">Cedera Ringan</option>
                    <option value="Cedera Serius / Penurunan Fungsi Tubuh">
                      Cedera Serius / Penurunan Fungsi Tubuh
                    </option>
                    <option value="Kematian">Kematian Pasien</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Kejadian</label>
                  <input
                    type="date"
                    value={ktdForm.tanggalKejadian}
                    onChange={(e) => setKtdForm({ ...ktdForm, tanggalKejadian: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kronologi Kejadian</label>
                <textarea
                  rows={2}
                  required
                  value={ktdForm.kronologi}
                  onChange={(e) => setKtdForm({ ...ktdForm, kronologi: e.target.value })}
                  placeholder="Ceritakan urutan peristiwa saat alat digunakan..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tindakan Segera</label>
                <input
                  type="text"
                  value={ktdForm.tindakanSegera}
                  onChange={(e) => setKtdForm({ ...ktdForm, tindakanSegera: e.target.value })}
                  placeholder="Karantina alat, penggantian unit..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsKtdModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Kirim ke e-Watch Alkes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
