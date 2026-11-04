import { useState } from 'react';
import { db } from '../../../services/pocketbase';
import { BetsProduksi } from '../../../types';
import { 
  Factory, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Wind, 
  ShieldCheck, 
  Layers,
  Sparkles
} from 'lucide-react';

export default function ProductionModule() {
  const [bmrList, setBmrList] = useState<BetsProduksi[]>(db.getBetsProduksi());
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New BMR Form
  const [formData, setFormData] = useState<Partial<BetsProduksi>>({
    namaProduk: 'Syringe Pump Presisi Tinggi AMS-SP500',
    nomorBets: 'LOT-2024-SP',
    jumlahRencana: 50,
    satuan: 'Unit',
    ruangBersih: 'Area Perakitan Terkendali',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalTarget: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'Penimbangan',
    catatanSanitasi: 'Sanitasi ruang bersih alkohol 70% dan inspeksi tekanan diferensial +15 Pa.',
    penanggungJawab: 'Ir. Agus Santoso (Manajer Manufaktur)'
  });

  const filtered = bmrList.filter(b =>
    b.namaProduk.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.nomorBets.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.nomorBMR.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveBMR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaProduk || !formData.nomorBets) return;

    const newItem: BetsProduksi = {
      id: 'BMR-' + Date.now(),
      nomorBMR: `BMR/CPAKB/24/${String(bmrList.length + 1).padStart(3, '0')}`,
      namaProduk: formData.namaProduk || '',
      nomorBets: formData.nomorBets || '',
      jumlahRencana: Number(formData.jumlahRencana) || 10,
      jumlahRealisasi: Number(formData.jumlahRencana) || 10,
      satuan: formData.satuan || 'Unit',
      ruangBersih: formData.ruangBersih as BetsProduksi['ruangBersih'],
      tanggalMulai: formData.tanggalMulai || new Date().toISOString().split('T')[0],
      tanggalTarget: formData.tanggalTarget || '',
      status: formData.status as BetsProduksi['status'],
      catatanSanitasi: formData.catatanSanitasi || 'Sesuai SOP CPAKB',
      penanggungJawab: formData.penanggungJawab || 'Manajer Manufaktur'
    };

    db.addBetsProduksi(newItem);
    setBmrList(db.getBetsProduksi());
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
              Manufaktur CPAKB
            </span>
            <span className="text-xs text-slate-500">Permenkes RI No. 20/2017 & ISO 13485:2016</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Produksi / Manufaktur Alkes (CPAKB)
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Pengelolaan proses perakitan alkes dalam negeri (TKDN), pengendalian lingkungan ruang bersih (cleanroom), validasi proses sterilisasi, serta dokumentasi Catatan Bets Produksi (BMR).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Mulai Bets Produksi (BMR)
        </button>
      </div>

      {/* Cleanroom Environment Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Cleanroom Kelas C</span>
            <Wind className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">+15.4 Pa (Tekanan Positif)</div>
          <p className="text-[10px] text-slate-500 mt-1">Mencegah infiltrasi partikel debu dari koridor luar</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Partikel Udara 0.5 µm</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-lg font-bold text-emerald-700">12,400 partikel/m³</div>
          <p className="text-[10px] text-slate-500 mt-1">Batas aman ISO Class 7 / Kelas C (maks 352,000)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Sanitasi Ruang Bersih</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900">Alkohol 70% & UV 254nm</div>
          <p className="text-[10px] text-slate-500 mt-1">Siklus sterilisasi terjadwal setiap pergantian shift</p>
        </div>
      </div>

      {/* BMR Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="font-semibold text-slate-800">
            Daftar Catatan Bets Produksi (Batch Manufacturing Record - BMR)
          </div>
          <div className="text-slate-500">
            Total: <strong>{bmrList.length}</strong> bets terdaftar
          </div>
        </div>

        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <th className="py-3 px-4">Nomor BMR</th>
              <th className="py-3 px-4">Nama Produk Alkes</th>
              <th className="py-3 px-4">Nomor Bets</th>
              <th className="py-3 px-4">Jumlah Rencana / Realisasi</th>
              <th className="py-3 px-4">Ruang Bersih</th>
              <th className="py-3 px-4">Jadwal Produksi</th>
              <th className="py-3 px-4">Tahapan CPAKB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-indigo-800">{item.nomorBMR}</td>
                <td className="py-3 px-4 font-semibold text-slate-900">{item.namaProduk}</td>
                <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.nomorBets}</td>
                <td className="py-3 px-4 font-medium">
                  {item.jumlahRealisasi} / {item.jumlahRencana} {item.satuan}
                </td>
                <td className="py-3 px-4 text-slate-600">{item.ruangBersih}</td>
                <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                  {item.tanggalMulai} s.d {item.tanggalTarget}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    item.status === 'Rilis QC'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : item.status === 'Sterilisasi'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {item.status}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">PJ: {item.penanggungJawab}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add BMR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Buka Catatan Bets Produksi (BMR) Baru
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Standar CPAKB Permenkes RI No. 20/2017 & ISO 13485.
            </p>

            <form onSubmit={handleSaveBMR} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Produk yang Dirakit/Dibuat</label>
                <input
                  type="text"
                  required
                  value={formData.namaProduk}
                  onChange={(e) => setFormData({ ...formData, namaProduk: e.target.value })}
                  placeholder="Contoh: Syringe Pump Presisi Tinggi AMS-SP500"
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
                  <label className="block font-semibold text-slate-700 mb-1">Target Jumlah Rencana</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={formData.jumlahRencana}
                      onChange={(e) => setFormData({ ...formData, jumlahRencana: Number(e.target.value) })}
                      className="w-20 px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={formData.satuan}
                      onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                      placeholder="Unit"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Area / Ruang Bersih</label>
                  <select
                    value={formData.ruangBersih}
                    onChange={(e) => setFormData({ ...formData, ruangBersih: e.target.value as BetsProduksi['ruangBersih'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Area Perakitan Terkendali">Area Perakitan Terkendali</option>
                    <option value="Cleanroom Kelas C">Cleanroom Kelas C</option>
                    <option value="Cleanroom Kelas D">Cleanroom Kelas D</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahap Awal</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as BetsProduksi['status'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Penimbangan">Penimbangan Bahan</option>
                    <option value="Perakitan">Perakitan / Assembling</option>
                    <option value="Pengemasan Primer">Pengemasan Primer</option>
                    <option value="Sterilisasi">Sterilisasi Gas ETO</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={formData.tanggalMulai}
                    onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Selesai</label>
                  <input
                    type="date"
                    value={formData.tanggalTarget}
                    onChange={(e) => setFormData({ ...formData, tanggalTarget: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Sanitasi & Lingkungan</label>
                <input
                  type="text"
                  value={formData.catatanSanitasi}
                  onChange={(e) => setFormData({ ...formData, catatanSanitasi: e.target.value })}
                  placeholder="Kondisi filter HEPA, tekanan udara, dan disinfektan..."
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Buka Bets Produksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
