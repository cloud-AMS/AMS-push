import { useState } from 'react';
import { db } from '../../../services/pocketbase';
import { TransaksiKeuangan } from '../../../types';
import { 
  Coins, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText,
  DollarSign
} from 'lucide-react';

export default function FinanceModule() {
  const [transaksiList, setTransaksiList] = useState<TransaksiKeuangan[]>(db.getTransaksi());
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Transaction Form
  const [formData, setFormData] = useState<Partial<TransaksiKeuangan>>({
    kategori: 'Pendapatan Alkes',
    fasyankesAtauPemasok: '',
    tanggal: new Date().toISOString().split('T')[0],
    jumlah: 50000000,
    statusPembayaran: 'Menunggu Jatuh Tempo',
    ppnStatus: 'PPN 11% Terbit Faktur Pajak'
  });

  const filtered = transaksiList.filter(t =>
    t.nomorFaktur.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.fasyankesAtauPemasok.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.kategori.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPendapatan = transaksiList
    .filter(t => t.kategori === 'Pendapatan Alkes')
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const totalBiayaMutu = transaksiList
    .filter(t => t.kategori !== 'Pendapatan Alkes')
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fasyankesAtauPemasok) return;

    const newItem: TransaksiKeuangan = {
      id: 'INV-' + Date.now(),
      nomorFaktur: `INV/AMS/2024/05/${String(transaksiList.length + 101).padStart(3, '0')}`,
      kategori: formData.kategori as TransaksiKeuangan['kategori'],
      fasyankesAtauPemasok: formData.fasyankesAtauPemasok || '',
      tanggal: formData.tanggal || new Date().toISOString().split('T')[0],
      jumlah: Number(formData.jumlah) || 0,
      statusPembayaran: formData.statusPembayaran as TransaksiKeuangan['statusPembayaran'],
      ppnStatus: formData.ppnStatus as TransaksiKeuangan['ppnStatus']
    };

    db.addTransaksi(newItem);
    setTransaksiList(db.getTransaksi());
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
              Keuangan & Anggaran Mutu
            </span>
            <span className="text-xs text-slate-500">Perpajakan PPN Alkes & Biaya Audit Kepatuhan</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Finance & Accounting Perusahaan Alkes
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Pencatatan faktur komersial fasyankes, kepatuhan pajak PPN 11% alkes, serta pemantauan anggaran jaminan mutu (biaya kalibrasi BPFK, audit ISO 13485, dan retur).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Catat Faktur Transaksi Baru
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 block font-medium">Total Penerimaan Faktur Fasyankes</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            Rp {totalPendapatan.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Telah diverifikasi PPN 11%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 block font-medium">Alokasi Biaya Mutu & Regulasi</span>
          <div className="text-xl font-bold text-blue-700 mt-1">
            Rp {totalBiayaMutu.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Audit ISO 13485 & Kalibrasi BPFK</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-slate-500 block font-medium">Status Faktur Pajak</span>
          <div className="text-xl font-bold text-emerald-700 mt-1">100% Taat Pajak</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Faktur Pajak Elektronik e-Faktur DJP</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor faktur atau pihak fasyankes..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>
          <div className="text-slate-500">
            Total Transaksi: <strong>{transaksiList.length}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Nomor Faktur & Tanggal</th>
                <th className="py-3 px-4">Kategori Akuntansi</th>
                <th className="py-3 px-4">Pihak Fasyankes / Pemasok</th>
                <th className="py-3 px-4">Jumlah Transaksi</th>
                <th className="py-3 px-4">Status PPN</th>
                <th className="py-3 px-4">Status Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-blue-800">
                    <div>{item.nomorFaktur}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{item.tanggal}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{item.fasyankesAtauPemasok}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    Rp {item.jumlah.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{item.ppnStatus}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      item.statusPembayaran === 'Lunas'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {item.statusPembayaran}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Transaction */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Catat Faktur Transaksi Keuangan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pencatatan pendapatan distribusi alkes atau biaya kepatuhan mutu ISO/CDAKB.
            </p>

            <form onSubmit={handleSaveTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Transaksi</label>
                <select
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value as TransaksiKeuangan['kategori'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Pendapatan Alkes">Pendapatan Penjualan Alkes</option>
                  <option value="Biaya Uji Kalibrasi">Biaya Uji Kalibrasi (BPFK / Lab Terakreditasi)</option>
                  <option value="Biaya Audit ISO/CDAKB">Biaya Audit Sertifikasi ISO/CDAKB</option>
                  <option value="Pengadaan Suku Cadang">Pengadaan Suku Cadang Resmi</option>
                  <option value="Biaya Retur Mutu">Biaya Penanganan Retur Mutu</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pihak Rumah Sakit / Vendor Rekanan</label>
                <input
                  type="text"
                  required
                  value={formData.fasyankesAtauPemasok}
                  onChange={(e) => setFormData({ ...formData, fasyankesAtauPemasok: e.target.value })}
                  placeholder="Contoh: RSUD Pasar Minggu"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    min={1000}
                    required
                    value={formData.jumlah}
                    onChange={(e) => setFormData({ ...formData, jumlah: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Pajak PPN</label>
                  <select
                    value={formData.ppnStatus}
                    onChange={(e) => setFormData({ ...formData, ppnStatus: e.target.value as TransaksiKeuangan['ppnStatus'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="PPN 11% Terbit Faktur Pajak">PPN 11% Terbit Faktur Pajak</option>
                    <option value="Bebas PPN">Bebas PPN (Sesuai Aturan)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Pembayaran</label>
                  <select
                    value={formData.statusPembayaran}
                    onChange={(e) => setFormData({ ...formData, statusPembayaran: e.target.value as TransaksiKeuangan['statusPembayaran'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Lunas">Lunas</option>
                    <option value="Menunggu Jatuh Tempo">Menunggu Jatuh Tempo</option>
                    <option value="Lewat Jatuh Tempo">Lewat Jatuh Tempo</option>
                  </select>
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
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
