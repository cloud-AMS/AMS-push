import { useState } from 'react';
import { db } from '../../../services/pocketbase';
import { InspeksiQC } from '../../../types';
import { 
  CheckCircle2, 
  Plus, 
  Search, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Calendar,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

export default function QCModule() {
  const [inspeksiList, setInspeksiList] = useState<InspeksiQC[]>(db.getInspeksiQC());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterHasil, setFilterHasil] = useState<string>('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New QC Form
  const [formData, setFormData] = useState<Partial<InspeksiQC>>({
    jenisInspeksi: 'Barang Masuk Gudang',
    namaBarang: '',
    nomorBets: '',
    jumlahDiperiksa: 10,
    tanggalInspeksi: new Date().toISOString().split('T')[0],
    inspektur: 'Hendra Setiawan (QC Officer)',
    kondisiFisik: 'Baik & Utuh',
    kebersihan: 'Memenuhi Syarat',
    tanggalKedaluwarsa: '2028-12-31',
    hasilPemeriksaan: 'Lolos (Released)',
    catatanPJT: 'Label bahasa Indonesia dan nomor izin edar Kemenkes RI terverifikasi.'
  });

  const filtered = inspeksiList.filter(item => {
    const matchSearch = item.namaBarang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nomorBets.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nomorLaporan.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterHasil === 'semua') return matchSearch;
    return matchSearch && item.hasilPemeriksaan.includes(filterHasil);
  });

  const handleSaveQC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaBarang || !formData.nomorBets) return;

    const newItem: InspeksiQC = {
      id: 'QC-' + Date.now(),
      nomorLaporan: `QC/IN/2024/05/${String(inspeksiList.length + 1).padStart(3, '0')}`,
      jenisInspeksi: formData.jenisInspeksi as InspeksiQC['jenisInspeksi'],
      namaBarang: formData.namaBarang || '',
      nomorBets: formData.nomorBets || '',
      jumlahDiperiksa: Number(formData.jumlahDiperiksa) || 1,
      tanggalInspeksi: formData.tanggalInspeksi || new Date().toISOString().split('T')[0],
      inspektur: formData.inspektur || 'QC Team',
      kondisiFisik: formData.kondisiFisik as InspeksiQC['kondisiFisik'],
      kebersihan: formData.kebersihan as InspeksiQC['kebersihan'],
      tanggalKedaluwarsa: formData.tanggalKedaluwarsa || '2028-12-31',
      hasilPemeriksaan: formData.hasilPemeriksaan as InspeksiQC['hasilPemeriksaan'],
      catatanPJT: formData.catatanPJT || 'Memenuhi syarat rilis CDAKB.'
    };

    db.addInspeksiQC(newItem);
    setInspeksiList(db.getInspeksiQC());
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
              Pengawasan Mutu
            </span>
            <span className="text-xs text-slate-500">Klausul 8.2.6 ISO 13485 & Bab IV CDAKB</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Quality Control (QC) / Pengawasan Mutu
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Pemeriksaan sampling fisik alkes masuk dan keluar gudang, verifikasi integritas segel steril, kejelasan nomor bets, dan batas kedaluwarsa sebelum dirilis ke peredaran.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Catat Inspeksi QC Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block font-medium">Lolos QC (Released)</span>
            <span className="text-xl font-bold text-emerald-700">
              {inspeksiList.filter(i => i.hasilPemeriksaan.includes('Lolos')).length} Bets
            </span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/30" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block font-medium">Karantina Pengujian (Hold)</span>
            <span className="text-xl font-bold text-amber-700">
              {inspeksiList.filter(i => i.hasilPemeriksaan.includes('Karantina')).length} Bets
            </span>
          </div>
          <Clock className="w-8 h-8 text-amber-500/30" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block font-medium">Tolak (Rejected)</span>
            <span className="text-xl font-bold text-rose-700">
              {inspeksiList.filter(i => i.hasilPemeriksaan.includes('Tolak')).length} Bets
            </span>
          </div>
          <XCircle className="w-8 h-8 text-rose-500/30" />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari laporan QC, bets, atau nama barang..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Filter Hasil:</span>
            <select
              value={filterHasil}
              onChange={(e) => setFilterHasil(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
            >
              <option value="semua">Semua Hasil</option>
              <option value="Lolos">Lolos (Released)</option>
              <option value="Karantina">Karantina (Hold)</option>
              <option value="Tolak">Tolak (Rejected)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">No. Laporan & Tanggal</th>
                <th className="py-3 px-4">Nama Alkes / Bahan</th>
                <th className="py-3 px-4">Nomor Bets</th>
                <th className="py-3 px-4">Jml Diperiksa</th>
                <th className="py-3 px-4">Kondisi & Kebersihan</th>
                <th className="py-3 px-4">Kedaluwarsa</th>
                <th className="py-3 px-4">Hasil Rilis QC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    <div className="font-mono text-emerald-800">{item.nomorLaporan}</div>
                    <div className="text-[10px] text-slate-500">{item.tanggalInspeksi} • {item.jenisInspeksi}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{item.namaBarang}</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.nomorBets}</td>
                  <td className="py-3 px-4 font-medium">{item.jumlahDiperiksa} Sampel</td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{item.kondisiFisik}</div>
                    <div className="text-[10px] text-slate-500">{item.kebersihan}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">{item.tanggalKedaluwarsa}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.hasilPemeriksaan.includes('Lolos')
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : item.hasilPemeriksaan.includes('Karantina')
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {item.hasilPemeriksaan}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">Oleh: {item.inspektur}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add QC */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Catat Hasil Pemeriksaan Mutu (QC)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pemeriksaan fisik alkes berdasarkan nomor bets dan parameter standar CDAKB.
            </p>

            <form onSubmit={handleSaveQC} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tahap Inspeksi</label>
                <select
                  value={formData.jenisInspeksi}
                  onChange={(e) => setFormData({ ...formData, jenisInspeksi: e.target.value as InspeksiQC['jenisInspeksi'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Barang Masuk Gudang">Barang Masuk Gudang (Incoming Device)</option>
                  <option value="Bahan Baku Datang">Bahan Baku Datang (Raw Material)</option>
                  <option value="Produk Jadi Manufaktur">Produk Jadi Manufaktur (Finished Good)</option>
                  <option value="Pemeriksaan Pra-Kirim">Pemeriksaan Pra-Kirim (Pre-Dispatch)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Alat Kesehatan / Bahan</label>
                <input
                  type="text"
                  required
                  value={formData.namaBarang}
                  onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
                  placeholder="Contoh: Reagen Rapid Test Dengue NS1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Bets / Lot</label>
                  <input
                    type="text"
                    required
                    value={formData.nomorBets}
                    onChange={(e) => setFormData({ ...formData, nomorBets: e.target.value })}
                    placeholder="LOT-2024-..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah Diperiksa (Sampling)</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.jumlahDiperiksa}
                    onChange={(e) => setFormData({ ...formData, jumlahDiperiksa: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kondisi Kemasan Fisik</label>
                  <select
                    value={formData.kondisiFisik}
                    onChange={(e) => setFormData({ ...formData, kondisiFisik: e.target.value as InspeksiQC['kondisiFisik'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Baik & Utuh">Baik & Utuh (Segel Rapat)</option>
                    <option value="Kemasan Rusak">Kemasan Rusak / Basah</option>
                    <option value="Label Tidak Jelas">Label / NIE Tidak Jelas</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kebersihan</label>
                  <select
                    value={formData.kebersihan}
                    onChange={(e) => setFormData({ ...formData, kebersihan: e.target.value as InspeksiQC['kebersihan'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Memenuhi Syarat">Memenuhi Syarat (Bebas Debu/Kotoran)</option>
                    <option value="Tercemar">Tercemar / Debu Berlebih</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Kedaluwarsa (ED)</label>
                  <input
                    type="date"
                    value={formData.tanggalKedaluwarsa}
                    onChange={(e) => setFormData({ ...formData, tanggalKedaluwarsa: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Keputusan Rilis QC</label>
                  <select
                    value={formData.hasilPemeriksaan}
                    onChange={(e) => setFormData({ ...formData, hasilPemeriksaan: e.target.value as InspeksiQC['hasilPemeriksaan'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold text-emerald-800"
                  >
                    <option value="Lolos (Released)">Lolos (Released) - Siap Edar</option>
                    <option value="Karantina (Hold)">Karantina (Hold) - Butuh Uji Lanjut</option>
                    <option value="Tolak (Rejected)">Tolak (Rejected) - Musnah/Retur</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan PJT / Inspektur</label>
                <input
                  type="text"
                  value={formData.catatanPJT}
                  onChange={(e) => setFormData({ ...formData, catatanPJT: e.target.value })}
                  placeholder="Catatan penandaan bahasa Indonesia & buku manual..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Simpan Hasil QC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
