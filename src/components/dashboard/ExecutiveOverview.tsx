import { useState, useEffect } from 'react';
import { db } from '../../services/pocketbase';
import { 
  Building2, 
  Award, 
  Warehouse, 
  Wrench, 
  AlertTriangle, 
  CheckCircle2, 
  Thermometer, 
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { ModuleId } from '../../types';

interface ExecutiveOverviewProps {
  onSelectModule: (module: ModuleId) => void;
  onOpenTraceability: () => void;
  onOpenPrintModal: () => void;
}

export default function ExecutiveOverview({
  onSelectModule,
  onOpenTraceability,
  onOpenPrintModal
}: ExecutiveOverviewProps) {
  const [izinList, setIzinList] = useState(db.getIzinEdar());
  const [sertifikatList] = useState(db.getSertifikat());
  const [stokList] = useState(db.getStokGudang());
  const [logSuhuList, setLogSuhuList] = useState(db.getLogSuhu());
  const [layananList] = useState(db.getLayananTeknis());
  const [capaList] = useState(db.getCAPA());
  const [ktdList] = useState(db.getLaporanKTD());
  const [recallList] = useState(db.getPenarikanProduk());

  useEffect(() => {
    const unsub1 = db.subscribe('izin_edar', () => setIzinList(db.getIzinEdar()));
    const unsub2 = db.subscribe('log_suhu', () => setLogSuhuList(db.getLogSuhu()));
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const niePerluPerpanjangan = izinList.filter(i => i.status === 'Perpanjangan' || i.statusPerpanjangan === 'Harus Diperpanjang Segera');
  const coldRoomSensor = logSuhuList.find(s => s.zona.includes('Cold Chain')) || logSuhuList[0];
  const activeRecall = recallList.filter(r => r.status !== 'Ditutup');
  const pendingKalibrasi = layananList.filter(l => l.jenisLayanan === 'Kalibrasi Berkala' && l.status !== 'Selesai & Berita Acara Terbit');

  return (
    <div className="space-y-6">
      
      {/* Welcome & Regulatory Banner (Bejo POS dark card styling) */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-[0_1px_2px_rgba(15,23,42,0.06)] border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(circle_at_right,rgba(0,170,255,0.18),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Pusat Kepatuhan Penanggung Jawab Teknis (PJT)
              </span>
              <span className="text-xs text-slate-400">CDAKB Permenkes 4/2014 & ISO 13485:2016</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Sistem Manajemen Terintegrasi Perusahaan Alat Kesehatan
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Memantau legalitas izin edar NIE, audit mutu berkala, integritas rantai dingin (cold chain 2-8°C), alokasi FEFO, layanan teknis elektromedik, serta pengawasan pasca pasar secara langsung.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenTraceability}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Lacak Nomor Bets
            </button>
            <button
              type="button"
              onClick={onOpenPrintModal}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Cetak Dokumen
            </button>
          </div>
        </div>

        {/* 4 Pillars Badge Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-200 block text-[11px]">SDAK Kemenkes RI</span>
              <span className="text-[10px] text-slate-400">Sertifikat Distribusi Aktif</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-200 block text-[11px]">ISO 13485:2016</span>
              <span className="text-[10px] text-slate-400">SMM Alkes Terakreditasi KAN</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-200 block text-[11px]">CPAKB Manufaktur</span>
              <span className="text-[10px] text-slate-400">Cleanroom & BMR Terpenuhi</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-200 block text-[11px]">e-Watch Alkes Kemenkes</span>
              <span className="text-[10px] text-slate-400">Kanal Pelaporan Terhubung</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Summary Stat Cards (Bejo POS metric card style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Izin Edar NIE */}
        <div 
          onClick={() => onSelectModule('ra-pjt')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Izin Edar Alkes (NIE)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{izinList.length}</span>
            <span className="text-xs text-slate-500">Produk Terdaftar</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className={`font-semibold ${niePerluPerpanjangan.length > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {niePerluPerpanjangan.length > 0 ? `${niePerluPerpanjangan.length} Perlu Perpanjangan` : 'Semua NIE Aktif'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

        {/* Card 2: Pemantauan Cold Chain Suhu */}
        <div 
          onClick={() => onSelectModule('gudang-logistik')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-400 shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Sensor Suhu Cold Chain</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{coldRoomSensor?.suhu ?? 4.2}°C</span>
            <span className="text-xs text-slate-500">Standar 2°C - 8°C</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              Sensor Aktif Normal
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
        </div>

        {/* Card 3: Status Recall & KTD */}
        <div 
          onClick={() => onSelectModule('pms-vigilance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-rose-400 shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vigilans & Recall</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeRecall.length}</span>
            <span className="text-xs text-slate-500">Penarikan Aktif</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-rose-700 font-semibold">
              {ktdList.length} Laporan KTD Terdata
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
          </div>
        </div>

        {/* Card 4: Layanan Teknisi & Kalibrasi */}
        <div 
          onClick={() => onSelectModule('teknisi-service')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Purna Jual & Kalibrasi</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{layananList.length}</span>
            <span className="text-xs text-slate-500">Tiket Layanan</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-blue-700 font-semibold">
              {pendingKalibrasi.length} Kalibrasi Terjadwal
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

      </div>

      {/* Main Grid: Regulatory Priorities & Operational Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Operational & Quality Watchlist */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section: Tindakan Mendesak Kepatuhan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Perhatian Kepatuhan & Masa Berlaku</h3>
                <p className="text-xs text-slate-500">Izin edar dan sertifikasi yang memerlukan tindakan perpanjangan</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectModule('ra-pjt')}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                Lihat Semua <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {izinList.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">{item.namaAlkes}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-200 text-slate-800">
                        {item.kelasRisiko}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {item.nomorIzinEdar} • Produsen: {item.produsen}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10.5px] text-slate-500">Masa Berlaku:</div>
                      <div className="text-xs font-semibold text-slate-800">{item.tanggalKedaluwarsa}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      item.status === 'Perpanjangan'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Alokasi FEFO & Stok Kritis */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Alokasi Gudang CDAKB (Prinsip FEFO)</h3>
                <p className="text-xs text-slate-500">Produk yang mendekati tanggal kedaluwarsa diprioritaskan keluar terlebih dahulu</p>
              </div>
              <button
                type="button"
                onClick={() => onSelectModule('gudang-logistik')}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                Modul Gudang <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 bg-slate-100/80 font-bold">
                    <th className="py-2.5 px-3">Nama Alkes</th>
                    <th className="py-2.5 px-3">Nomor Bets</th>
                    <th className="py-2.5 px-3">Lokasi Rak</th>
                    <th className="py-2.5 px-3">Kedaluwarsa</th>
                    <th className="py-2.5 px-3">Status FEFO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stokList.map((stok) => (
                    <tr key={stok.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{stok.namaAlkes}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{stok.nomorBets}</td>
                      <td className="py-2.5 px-3 text-slate-600">{stok.lokasiPenyimpanan}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 font-medium">{stok.tanggalKedaluwarsa}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          stok.statusFEFO.includes('Kritis')
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {stok.statusFEFO}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Quality Management & System Quick Access */}
        <div className="space-y-6">
          
          {/* Sertifikat Perusahaan */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Sertifikasi Legalitas Perusahaan
            </h3>
            <div className="space-y-3">
              {sertifikatList.map((s) => (
                <div key={s.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{s.jenis}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {s.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono mt-1">{s.nomorSertifikat}</div>
                  <div className="text-[10px] text-slate-500 mt-1">Berlaku s.d {s.tanggalHabis} ({s.penerbit})</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sistem Manajemen Mutu CAPA Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Status CAPA ISO 13485
              </h3>
              <button
                type="button"
                onClick={() => onSelectModule('qa-mutu')}
                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Detail QA
              </button>
            </div>

            <div className="space-y-3">
              {capaList.slice(0, 2).map((c) => (
                <div key={c.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-indigo-800">{c.nomorCAPA}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-slate-700 mt-1 line-clamp-2 text-[11px]">{c.deskripsiMasalah}</p>
                  <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
                    <span>Target: {c.targetSelesai}</span>
                    <span>PJ: {c.penanggungJawab}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access to 12 Modules (Bejo POS dark card) */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <h3 className="font-bold text-sm text-white mb-1">Navigasi Modul Cepat</h3>
            <p className="text-xs text-slate-400 mb-4">Akses langsung ke divisi operasional alkes:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => onSelectModule('ra-pjt')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-left font-semibold transition-colors cursor-pointer"
              >
                Izin Edar (NIE)
              </button>
              <button
                type="button"
                onClick={() => onSelectModule('gudang-logistik')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-left font-semibold transition-colors cursor-pointer"
              >
                Gudang CDAKB
              </button>
              <button
                type="button"
                onClick={() => onSelectModule('teknisi-service')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-left font-semibold transition-colors cursor-pointer"
              >
                Layanan Teknisi
              </button>
              <button
                type="button"
                onClick={() => onSelectModule('sales-marketing')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-left font-semibold transition-colors cursor-pointer"
              >
                e-Katalog LKPP
              </button>
              <button
                type="button"
                onClick={() => onSelectModule('pms-vigilance')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-left font-semibold transition-colors cursor-pointer"
              >
                e-Watch KTD
              </button>
              <button
                type="button"
                onClick={() => onSelectModule('it-traceability')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-left font-semibold transition-colors cursor-pointer"
              >
                Server IT Caddy
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
