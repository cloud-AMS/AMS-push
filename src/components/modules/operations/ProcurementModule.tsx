import { useState } from 'react';
import { db } from '../../../services/pocketbase';
import { PemasokAlkes, PurchaseOrderAlkes } from '../../../types';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  CheckCircle2, 
  Building2, 
  Globe, 
  FileCheck, 
  Clock,
  DollarSign
} from 'lucide-react';

export default function ProcurementModule() {
  const [activeTab, setActiveTab] = useState<'pemasok' | 'po'>('pemasok');
  const [pemasokList, setPemasokList] = useState<PemasokAlkes[]>(db.getPemasok());
  const [poList, setPoList] = useState<PurchaseOrderAlkes[]>(db.getPurchaseOrder());
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);

  // New Supplier Form
  const [supplierForm, setSupplierForm] = useState<Partial<PemasokAlkes>>({
    namaPemasok: '',
    kategori: 'Pabrikan Dalam Negeri',
    nomorIzinPenyalur: 'SDAK-',
    negara: 'Indonesia',
    statusAuditMutu: 'Terkualifikasi',
    skorEvaluasi: 90,
    tanggalEvaluasiTerakhir: new Date().toISOString().split('T')[0],
    kontak: ''
  });

  // New PO Form
  const [poForm, setPoForm] = useState<Partial<PurchaseOrderAlkes>>({
    pemasokId: pemasokList[0]?.id || '',
    namaPemasok: pemasokList[0]?.namaPemasok || '',
    tanggalPO: new Date().toISOString().split('T')[0],
    estimasiTiba: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    totalNilai: 150000000,
    status: 'Diajukan',
    catatanPJT: 'Verifikasi kesesuaian izin edar prinsipal dan sertifikat mutu ISO 13485.'
  });

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.namaPemasok) return;

    const newItem: PemasokAlkes = {
      id: 'SPL-' + Date.now(),
      namaPemasok: supplierForm.namaPemasok || '',
      kategori: supplierForm.kategori as PemasokAlkes['kategori'],
      nomorIzinPenyalur: supplierForm.nomorIzinPenyalur || '-',
      negara: supplierForm.negara || 'Indonesia',
      statusAuditMutu: supplierForm.statusAuditMutu as PemasokAlkes['statusAuditMutu'],
      skorEvaluasi: Number(supplierForm.skorEvaluasi) || 85,
      tanggalEvaluasiTerakhir: supplierForm.tanggalEvaluasiTerakhir || new Date().toISOString().split('T')[0],
      kontak: supplierForm.kontak || '-'
    };

    db.addPemasok(newItem);
    setPemasokList(db.getPemasok());
    setIsModalOpen(false);
  };

  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    const selSupplier = pemasokList.find(p => p.id === poForm.pemasokId) || pemasokList[0];

    const newItem: PurchaseOrderAlkes = {
      id: 'PO-' + Date.now(),
      nomorPO: `PO/AMS/2024/05/${String(poList.length + 1).padStart(3, '0')}`,
      pemasokId: selSupplier.id,
      namaPemasok: selSupplier.namaPemasok,
      tanggalPO: poForm.tanggalPO || new Date().toISOString().split('T')[0],
      estimasiTiba: poForm.estimasiTiba || '',
      totalNilai: Number(poForm.totalNilai) || 0,
      status: poForm.status as PurchaseOrderAlkes['status'],
      catatanPJT: poForm.catatanPJT || 'Memenuhi syarat legalitas Kemenkes'
    };

    db.addPurchaseOrder(newItem);
    setPoList(db.getPurchaseOrder());
    setIsPoModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
              Rantai Pasok Legal
            </span>
            <span className="text-xs text-slate-500">Klausul 7.4 ISO 13485:2016 (Pengendalian Pemasok)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Purchasing & Procurement Alkes
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Menjamin seluruh bahan baku dan alkes impor berasal dari produsen legal dengan sertifikasi ISO 13485 / CPAKB serta evaluasi mutu pemasok yang ketat sesuai regulasi Kemenkes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'pemasok' && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Kualifikasi Pemasok Baru
            </button>
          )}
          {activeTab === 'po' && (
            <button
              type="button"
              onClick={() => setIsPoModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Purchase Order Resmi
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('pemasok')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'pemasok'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Daftar Pemasok Terkualifikasi ({pemasokList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('po')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'po'
              ? 'border-blue-600 text-blue-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Purchase Order Resmi ({poList.length})
        </button>
      </div>

      {/* Content 1: Pemasok List */}
      {activeTab === 'pemasok' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {pemasokList.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {p.kategori}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {p.statusAuditMutu}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1">{p.namaPemasok}</h4>
                <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Negara: {p.negara}</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Izin Penyalur / SDAK / LOA:</span>
                    <span className="font-mono font-medium text-[11px] text-blue-800">{p.nomorIzinPenyalur}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Kontak Resmi:</span>
                    <span className="text-[11px] font-mono text-slate-600">{p.kontak}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Skor Evaluasi:</span>
                  <span className="font-extrabold text-blue-700 text-sm">{p.skorEvaluasi}/100</span>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  Audit: {p.tanggalEvaluasiTerakhir}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content 2: Purchase Order Table */}
      {activeTab === 'po' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Nomor PO</th>
                <th className="py-3 px-4">Pemasok Resmi</th>
                <th className="py-3 px-4">Tanggal PO</th>
                <th className="py-3 px-4">Estimasi Tiba</th>
                <th className="py-3 px-4">Total Nilai Transaksi</th>
                <th className="py-3 px-4">Status & Verifikasi PJT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {poList.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-800">{po.nomorPO}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{po.namaPemasok}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{po.tanggalPO}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">{po.estimasiTiba}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Rp {po.totalNilai.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      po.status === 'Tiba di Gudang'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {po.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">{po.catatanPJT}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add Supplier */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Kualifikasi Pemasok Alkes (ISO 13485)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pemasok alkes wajib memiliki legalitas izin edar atau sertifikasi manufaktur resmi.
            </p>

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan Pemasok / Prinsipal</label>
                <input
                  type="text"
                  required
                  value={supplierForm.namaPemasok}
                  onChange={(e) => setSupplierForm({ ...supplierForm, namaPemasok: e.target.value })}
                  placeholder="Contoh: Shenzhen Mindray Bio-Medical Co., Ltd."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Pemasok</label>
                  <select
                    value={supplierForm.kategori}
                    onChange={(e) => setSupplierForm({ ...supplierForm, kategori: e.target.value as PemasokAlkes['kategori'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Prinsipal Luar Negeri">Prinsipal Luar Negeri</option>
                    <option value="Pabrikan Dalam Negeri">Pabrikan Dalam Negeri</option>
                    <option value="Distributor Tunggal">Distributor Tunggal</option>
                    <option value="Bahan Baku Steril">Bahan Baku Steril</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Negara Asal</label>
                  <input
                    type="text"
                    value={supplierForm.negara}
                    onChange={(e) => setSupplierForm({ ...supplierForm, negara: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Izin Penyalur / SDAK / LOA</label>
                <input
                  type="text"
                  required
                  value={supplierForm.nomorIzinPenyalur}
                  onChange={(e) => setSupplierForm({ ...supplierForm, nomorIzinPenyalur: e.target.value })}
                  placeholder="Nomor izin resmi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Skor Evaluasi (0 - 100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={supplierForm.skorEvaluasi}
                    onChange={(e) => setSupplierForm({ ...supplierForm, skorEvaluasi: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email / Kontak</label>
                  <input
                    type="text"
                    value={supplierForm.kontak}
                    onChange={(e) => setSupplierForm({ ...supplierForm, kontak: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  Simpan Pemasok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add PO */}
      {isPoModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Buat Purchase Order Alkes Resmi
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Diteruskan ke Penanggung Jawab Teknis untuk verifikasi legalitas izin impor/produksi.
            </p>

            <form onSubmit={handleSavePO} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Pemasok Terkualifikasi</label>
                <select
                  value={poForm.pemasokId}
                  onChange={(e) => setPoForm({ ...poForm, pemasokId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {pemasokList.map(p => (
                    <option key={p.id} value={p.id}>{p.namaPemasok} ({p.negara})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal PO</label>
                  <input
                    type="date"
                    value={poForm.tanggalPO}
                    onChange={(e) => setPoForm({ ...poForm, tanggalPO: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estimasi Tiba di Gudang</label>
                  <input
                    type="date"
                    value={poForm.estimasiTiba}
                    onChange={(e) => setPoForm({ ...poForm, estimasiTiba: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Nilai Pembelian (Rp)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={poForm.totalNilai}
                  onChange={(e) => setPoForm({ ...poForm, totalNilai: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan PJT & Persyaratan Dokumen</label>
                <input
                  type="text"
                  value={poForm.catatanPJT}
                  onChange={(e) => setPoForm({ ...poForm, catatanPJT: e.target.value })}
                  placeholder="Wajib melampirkan COA, sertifikat kalibrasi & izin edar..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPoModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs transition-colors"
                >
                  Terbitkan Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
