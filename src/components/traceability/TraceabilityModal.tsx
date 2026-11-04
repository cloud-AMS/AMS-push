import { useState } from 'react';
import { db } from '../../services/pocketbase';
import { TraceabilityResult } from '../../types';
import { 
  X, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Thermometer, 
  Building, 
  FileCheck, 
  Truck, 
  Printer,
  QrCode
} from 'lucide-react';

interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export default function TraceabilityModal({
  isOpen,
  onClose,
  initialQuery = 'LOT-2024-PM44'
}: TraceabilityModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<TraceabilityResult | null>(db.cariKetelusuran(initialQuery));

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const res = db.cariKetelusuran(query);
      setResult(res);
    }
  };

  const handleQuickPick = (batch: string) => {
    setQuery(batch);
    setResult(db.cariKetelusuran(batch));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header - Bejo POS dark bar */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Ketelusuran Digital Nomor Bets (Traceability)</h3>
              <p className="text-xs text-slate-400">Klausul 7.5.8 ISO 13485:2016 & CDAKB Permenkes 4/2014</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Masukkan Nomor Bets / Lot (Contoh: LOT-2024-PM44, LOT-2024-DNG12)..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono shadow-xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 sm:px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
              Lacak Bets
            </button>
          </form>

          {/* Quick Examples */}
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 flex-wrap">
            <span className="font-semibold text-slate-600">Pilih Bets Cepat:</span>
            {['LOT-2024-PM44', 'LOT-2024-SP12', 'LOT-2024-DNG12', 'LOT-2023-B991'].map(b => (
              <button
                key={b}
                type="button"
                onClick={() => handleQuickPick(b)}
                className="px-2.5 py-1 bg-white border border-slate-300 hover:border-blue-400 hover:bg-blue-50 text-blue-700 rounded-lg font-mono text-[11px] font-semibold transition-colors cursor-pointer"
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {result ? (
            <div className="space-y-6">
              
              {/* Product Info Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                      Nomor Bets: <span className="font-mono text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded ml-1">{result.nomorBets}</span>
                    </div>
                    <h4 className="font-bold text-base sm:text-lg text-slate-900 mt-1">{result.namaAlkes}</h4>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Nomor Izin Edar: <span className="text-blue-700 font-mono font-bold">{result.nomorIzinEdar}</span>
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                    result.statusRecall.includes('Aman')
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200 animate-pulse'
                  }`}>
                    {result.statusRecall.includes('Aman') ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    )}
                    {result.statusRecall}
                  </span>
                </div>
              </div>

              {/* 4-Step Timeline */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Jejak Rantai Pasok Alkes (Supply Chain Trace)
                </h5>

                <div className="relative pl-6 border-l-2 border-blue-500/30 space-y-4">
                  
                  {/* Step 1: Produsen */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200" />
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Building className="w-3.5 h-3.5 text-blue-600" />
                        <span>Produsen & Asal Bets</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 font-medium">{result.produsen}</p>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">Sertifikasi CPAKB / ISO 13485 diverifikasi PJT</p>
                    </div>
                  </div>

                  {/* Step 2: Penerimaan & QC */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200" />
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Penerimaan & Pengujian QC Mutu</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">{result.tanggalPenerimaan}</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">Hasil: <span className="font-bold text-emerald-700">{result.hasilInspeksiQC}</span></p>
                    </div>
                  </div>

                  {/* Step 3: Gudang & Suhu */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200" />
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>Penyimpanan Gudang & Pemantauan Suhu CDAKB</span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">Lokasi: <span className="font-semibold">{result.lokasiGudang}</span></p>
                      <div className="flex items-center gap-2 text-[11px] text-blue-800 font-semibold mt-1">
                        <Thermometer className="w-3.5 h-3.5 text-blue-600" />
                        <span>Kondisi Suhu: {result.logSuhuStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Fasyankes Penerima */}
                  <div className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-200" />
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                        <Truck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Penyaluran ke Rumah Sakit / Klinik Penerima</span>
                      </div>
                      
                      {result.fasyankesPenerima.length > 0 ? (
                        <div className="space-y-2">
                          {result.fasyankesPenerima.map((f, i) => (
                            <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-900 block">{f.nama}</span>
                                <span className="text-[11px] text-slate-500 font-mono">Surat Jalan: {f.nomorSuratJalan}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-bold text-blue-700">{f.jumlah} Unit/Box</span>
                                <span className="text-[10px] text-slate-500 block">{f.tanggalKirim}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Belum ada penyaluran ke fasyankes (Stok aman di gudang)</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-sm text-slate-700">Nomor Bets Tidak Ditemukan</p>
              <p className="text-xs text-slate-500 mt-1">Pastikan nomor bets sesuai pada kemasan atau surat jalan</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Klausul 7.5.8 ISO 13485:2016 (Ketelusuran Alkes)
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Cetak Riwayat Bets
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
