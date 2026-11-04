import { useState } from 'react';
import { db } from '../../../services/pocketbase';
import { LayananTeknis } from '../../../types';
import { 
  Wrench, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileCheck, 
  Building, 
  Calendar,
  Printer
} from 'lucide-react';

export default function ServiceModule() {
  const [layananList, setLayananList] = useState<LayananTeknis[]>(db.getLayananTeknis());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('semua');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Service Ticket Form
  const [formData, setFormData] = useState<Partial<LayananTeknis>>({
    jenisLayanan: 'Instalasi & Uji Fungsi',
    fasyankes: '',
    namaAlkes: 'Patient Monitor Multi-Parameter AMS-V12 Pro',
    tipeModel: 'AMS-V12 Pro',
    nomorSeri: 'SN-',
    teknisi: 'Dian Nugraha, A.Md.TEM',
    tanggalJadwal: new Date().toISOString().split('T')[0],
    status: 'Menunggu Jadwal',
    hasilUjiFungsi: 'Lolos Parameter Klinis',
    catatanTeknisi: 'Pemeriksaan keselamatan listrik IEC 60601-1 dan kalibrasi sensor parameter.'
  });

  const filtered = layananList.filter(item => {
    const matchSearch = item.fasyankes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.namaAlkes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nomorSeri.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nomorTiket.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterJenis === 'semua') return matchSearch;
    return matchSearch && item.jenisLayanan.includes(filterJenis);
  });

  const handleSaveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fasyankes || !formData.nomorSeri) return;

    const newItem: LayananTeknis = {
      id: 'SRV-' + Date.now(),
      nomorTiket: `TK-2024-05-${String(layananList.length + 1).padStart(2, '0')}`,
      jenisLayanan: formData.jenisLayanan as LayananTeknis['jenisLayanan'],
      fasyankes: formData.fasyankes || '',
      namaAlkes: formData.namaAlkes || '',
      tipeModel: formData.tipeModel || 'Standar',
      nomorSeri: formData.nomorSeri || '',
      teknisi: formData.teknisi || 'Teknisi Elektromedis',
      tanggalJadwal: formData.tanggalJadwal || new Date().toISOString().split('T')[0],
      status: formData.status as LayananTeknis['status'],
      hasilUjiFungsi: formData.hasilUjiFungsi as LayananTeknis['hasilUjiFungsi'],
      catatanTeknisi: formData.catatanTeknisi || '-'
    };

    db.addLayananTeknis(newItem);
    setLayananList(db.getLayananTeknis());
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
              Layanan Purna Jual
            </span>
            <span className="text-xs text-slate-500">Klausul 7.5.4 ISO 13485 & Bab VII CDAKB</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Teknisi & Layanan Purna Jual (After-Sales Service)
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Khusus alkes elektromedik dan instrumen laboratorium di fasyankes. Menangani instalasi, uji fungsi commissioning, kalibrasi berkala (BPFK), pemeliharaan preventif, dan perbaikan darurat.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Buat Tiket Layanan Baru
        </button>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Controls */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari fasyankes, alkes, nomor seri (SN), atau tiket..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Jenis Layanan:</span>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Layanan</option>
              <option value="Instalasi">Instalasi & Uji Fungsi</option>
              <option value="Kalibrasi">Kalibrasi Berkala</option>
              <option value="Pemeliharaan">Pemeliharaan Preventif</option>
              <option value="Perbaikan">Perbaikan Kerusakan</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Nomor Tiket</th>
                <th className="py-3 px-4">Fasilitas Pelayanan (Fasyankes)</th>
                <th className="py-3 px-4">Alat Kesehatan & Serial Number</th>
                <th className="py-3 px-4">Jenis Layanan</th>
                <th className="py-3 px-4">Teknisi Bertugas</th>
                <th className="py-3 px-4">Jadwal</th>
                <th className="py-3 px-4">Status & Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-800">{item.nomorTiket}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.fasyankes}</td>
                  <td className="py-3 px-4 text-slate-700">
                    <div>{item.namaAlkes}</div>
                    <div className="font-mono text-[10px] text-slate-500">SN: {item.nomorSeri} ({item.tipeModel})</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                      {item.jenisLayanan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{item.teknisi}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{item.tanggalJadwal}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.status === 'Selesai & Berita Acara Terbit'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : item.status === 'Proses Pengerjaan'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {item.status}
                    </span>
                    <div className="text-[10px] text-emerald-700 font-medium mt-1">{item.hasilUjiFungsi}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Service Ticket */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Buat Tiket Layanan Teknisi Alkes
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pencatatan penugasan elektromedis dan penerbitan Berita Acara Uji Fungsi.
            </p>

            <form onSubmit={handleSaveTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Layanan Teknis</label>
                <select
                  value={formData.jenisLayanan}
                  onChange={(e) => setFormData({ ...formData, jenisLayanan: e.target.value as LayananTeknis['jenisLayanan'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Instalasi & Uji Fungsi">Instalasi & Uji Fungsi (Commissioning)</option>
                  <option value="Kalibrasi Berkala">Kalibrasi Berkala (Jaminan Akurasi)</option>
                  <option value="Pemeliharaan Preventif">Pemeliharaan Preventif (Maintenance)</option>
                  <option value="Perbaikan Kerusakan">Perbaikan Kerusakan (Troubleshooting)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rumah Sakit / Fasyankes Tujuan</label>
                <input
                  type="text"
                  required
                  value={formData.fasyankes}
                  onChange={(e) => setFormData({ ...formData, fasyankes: e.target.value })}
                  placeholder="Contoh: RSUP Fatmawati Jakarta"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Alat Kesehatan</label>
                <input
                  type="text"
                  required
                  value={formData.namaAlkes}
                  onChange={(e) => setFormData({ ...formData, namaAlkes: e.target.value })}
                  placeholder="Contoh: Patient Monitor Multi-Parameter"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Seri (Serial Number)</label>
                  <input
                    type="text"
                    required
                    value={formData.nomorSeri}
                    onChange={(e) => setFormData({ ...formData, nomorSeri: e.target.value })}
                    placeholder="SN-..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe / Model</label>
                  <input
                    type="text"
                    value={formData.tipeModel}
                    onChange={(e) => setFormData({ ...formData, tipeModel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teknisi Bertugas (STR Aktif)</label>
                  <input
                    type="text"
                    value={formData.teknisi}
                    onChange={(e) => setFormData({ ...formData, teknisi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Jadwal</label>
                  <input
                    type="date"
                    value={formData.tanggalJadwal}
                    onChange={(e) => setFormData({ ...formData, tanggalJadwal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Teknis / Uji Klinis</label>
                <textarea
                  rows={2}
                  value={formData.catatanTeknisi}
                  onChange={(e) => setFormData({ ...formData, catatanTeknisi: e.target.value })}
                  placeholder="Uraian pekerjaan teknis dan parameter yang diuji..."
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Simpan Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
