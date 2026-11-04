import { useState } from 'react';
import { db } from '../../../services/pocketbase';
import { IzinEdarAlkes, SertifikatPerusahaan } from '../../../types';
import { 
  Building2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Search, 
  FileCheck, 
  Shield, 
  Award,
  Globe,
  ExternalLink
} from 'lucide-react';

export default function RegulatoryModule() {
  const [activeTab, setActiveTab] = useState<'nie' | 'sertifikat' | 'validasi'>('nie');
  const [izinList, setIzinList] = useState<IzinEdarAlkes[]>(db.getIzinEdar());
  const [sertifikatList] = useState<SertifikatPerusahaan[]>(db.getSertifikat());
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Validation tester state
  const [testNIE, setTestNIE] = useState('');
  const [validationResult, setValidationResult] = useState<{
    valid?: boolean;
    nomor?: string;
    tipeAlkes?: string;
    keterangan?: string;
  } | null>(null);

  // New NIE Form State
  const [formData, setFormData] = useState<Partial<IzinEdarAlkes>>({
    namaAlkes: '',
    tipeModel: '',
    nomorIzinEdar: 'KEMENKES RI AKD ',
    kategori: 'Elektromedik Non Radiasi',
    kelasRisiko: 'Kelas B',
    produsen: 'PT Anugrah Mitra Selaras',
    negaraAsal: 'Indonesia',
    tanggalTerbit: new Date().toISOString().split('T')[0],
    tanggalKedaluwarsa: '2029-12-31',
    status: 'Aktif',
    statusPerpanjangan: 'Aman',
    keterangan: 'Pendaftaran izin edar resmi Kemenkes RI'
  });

  const filteredIzin = izinList.filter(i => 
    i.namaAlkes.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.nomorIzinEdar.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.produsen.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleValidateApi = async () => {
    if (!testNIE.trim()) return;
    try {
      const res = await fetch('/api/kemenkes/validasi-nie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomorIzinEdar: testNIE })
      });
      const data = await res.json();
      if (!res.ok || typeof data?.valid !== 'boolean') throw new Error('validasi server tidak tersedia');
      setValidationResult(data);
    } catch {
      // Fallback local regex
      const regex = /^KEMENKES RI (AKL|AKD) \d{11}$/;
      const valid = regex.test(testNIE.trim().toUpperCase());
      setValidationResult({
        valid,
        nomor: testNIE.trim().toUpperCase(),
        tipeAlkes: testNIE.includes('AKL') ? 'Alkes Impor' : 'Alkes Dalam Negeri',
        keterangan: valid ? 'Format izin edar sesuai standar penomoran Kemenkes RI' : 'Format belum sesuai (Harus 11 digit)'
      });
    }
  };

  const handleSaveNIE = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaAlkes || !formData.nomorIzinEdar) return;

    const newItem: IzinEdarAlkes = {
      id: 'NIE-' + Date.now(),
      namaAlkes: formData.namaAlkes || '',
      tipeModel: formData.tipeModel || 'Standar Medis',
      nomorIzinEdar: formData.nomorIzinEdar || '',
      kategori: formData.kategori as IzinEdarAlkes['kategori'],
      kelasRisiko: formData.kelasRisiko as IzinEdarAlkes['kelasRisiko'],
      produsen: formData.produsen || 'PT Anugrah Mitra Selaras',
      negaraAsal: formData.negaraAsal || 'Indonesia',
      tanggalTerbit: formData.tanggalTerbit || new Date().toISOString().split('T')[0],
      tanggalKedaluwarsa: formData.tanggalKedaluwarsa || '2029-12-31',
      status: formData.status as IzinEdarAlkes['status'],
      statusPerpanjangan: formData.statusPerpanjangan as IzinEdarAlkes['statusPerpanjangan'],
      keterangan: formData.keterangan || '-'
    };

    db.addIzinEdar(newItem);
    setIzinList(db.getIzinEdar());
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
              Modul Utama
            </span>
            <span className="text-xs text-slate-500">Kemenkes RI e-Registration & Regalkes</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Regulatory Affairs (RA) & Penanggung Jawab Teknis (PJT)
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Dipimpin oleh PJT berizin resmi Kemenkes untuk pengelolaan Izin Edar Alkes (NIE AKL/AKD), sertifikasi SDAK/IPAK, dan kepatuhan regulasi Kementerian Kesehatan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Izin Edar (NIE)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('nie')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'nie'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Izin Edar Alkes (NIE) ({izinList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sertifikat')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'sertifikat'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Sertifikat Perusahaan (SDAK / CPAKB / ISO) ({sertifikatList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('validasi')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'validasi'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          Uji Validasi Format NIE Kemenkes
        </button>
      </div>

      {/* Tab 1: Izin Edar Table */}
      {activeTab === 'nie' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari alkes, nomor NIE, atau produsen..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-800"
              />
            </div>
            <div className="text-xs text-slate-500">
              Total: <strong>{filteredIzin.length}</strong> produk terdaftar
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-4">Nama Produk Alkes</th>
                  <th className="py-3 px-4">Nomor Izin Edar (NIE)</th>
                  <th className="py-3 px-4">Kelas Risiko</th>
                  <th className="py-3 px-4">Produsen & Asal</th>
                  <th className="py-3 px-4">Masa Berlaku</th>
                  <th className="py-3 px-4">Status NIE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIzin.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{item.namaAlkes}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{item.tipeModel} • {item.kategori}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {item.nomorIzinEdar}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.kelasRisiko === 'Kelas A' ? 'bg-slate-100 text-slate-800' :
                        item.kelasRisiko === 'Kelas B' ? 'bg-blue-100 text-blue-800' :
                        item.kelasRisiko === 'Kelas C' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {item.kelasRisiko}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <div>{item.produsen}</div>
                      <div className="text-[10px] text-slate-500">{item.negaraAsal}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      {item.tanggalKedaluwarsa}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Sertifikat Perusahaan */}
      {activeTab === 'sertifikat' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sertifikatList.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200">
                    {s.jenis}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {s.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{s.nomorSertifikat}</h4>
                <p className="text-xs text-slate-500 mb-3">Diterbitkan oleh: {s.penerbit}</p>
                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-semibold block mb-0.5">Lingkup Legal:</span>
                  <p className="leading-relaxed text-[11px]">{s.lingkup}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Berlaku s.d: <strong>{s.tanggalHabis}</strong></span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi Kemenkes
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Format Validator */}
      {activeTab === 'validasi' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl">
          <h3 className="font-bold text-sm text-slate-900 mb-1">
            Pemeriksaan Format Nomor Izin Edar Kemenkes RI
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Memverifikasi format penulisan nomor izin edar sesuai standar Kementerian Kesehatan Republik Indonesia (Permenkes RI).
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ketik Nomor Izin Edar:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testNIE}
                  onChange={(e) => setTestNIE(e.target.value)}
                  placeholder="KEMENKES RI AKD 20501910234"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 uppercase"
                />
                <button
                  type="button"
                  onClick={handleValidateApi}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Uji Format
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="font-semibold text-slate-700 block">Kaidah Penomoran Kemenkes:</span>
              <p>• <strong>AKD</strong>: Alat Kesehatan Produksi Dalam Negeri (11 Digit)</p>
              <p>• <strong>AKL</strong>: Alat Kesehatan Impor Luar Negeri (11 Digit)</p>
              <p>• Contoh baku: <code>KEMENKES RI AKD 20501910234</code></p>
            </div>

            {validationResult && (
              <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                validationResult.valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {validationResult.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{validationResult.keterangan}</span>
                </div>
                <div>Klasifikasi Asal: <strong>{validationResult.tipeAlkes}</strong></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Add NIE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Tambah Pendaftaran Izin Edar (NIE)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Diverifikasi oleh Penanggung Jawab Teknis (PJT) sebelum dipasarkan.
            </p>

            <form onSubmit={handleSaveNIE} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Alat Kesehatan</label>
                <input
                  type="text"
                  required
                  value={formData.namaAlkes}
                  onChange={(e) => setFormData({ ...formData, namaAlkes: e.target.value })}
                  placeholder="Contoh: Defibrillator Bifasik Otomatis"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipe / Model</label>
                  <input
                    type="text"
                    value={formData.tipeModel}
                    onChange={(e) => setFormData({ ...formData, tipeModel: e.target.value })}
                    placeholder="Contoh: AMS-DF300"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas Risiko</label>
                  <select
                    value={formData.kelasRisiko}
                    onChange={(e) => setFormData({ ...formData, kelasRisiko: e.target.value as IzinEdarAlkes['kelasRisiko'] })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Kelas A">Kelas A (Risiko Rendah)</option>
                    <option value="Kelas B">Kelas B (Risiko Rendah-Sedang)</option>
                    <option value="Kelas C">Kelas C (Risiko Sedang-Tinggi)</option>
                    <option value="Kelas D">Kelas D (Risiko Tinggi)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Izin Edar Kemenkes RI</label>
                <input
                  type="text"
                  required
                  value={formData.nomorIzinEdar}
                  onChange={(e) => setFormData({ ...formData, nomorIzinEdar: e.target.value })}
                  placeholder="KEMENKES RI AKD 20501910234"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Produsen</label>
                  <input
                    type="text"
                    value={formData.produsen}
                    onChange={(e) => setFormData({ ...formData, produsen: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Negara Asal</label>
                  <input
                    type="text"
                    value={formData.negaraAsal}
                    onChange={(e) => setFormData({ ...formData, negaraAsal: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Terbit</label>
                  <input
                    type="date"
                    value={formData.tanggalTerbit}
                    onChange={(e) => setFormData({ ...formData, tanggalTerbit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Kedaluwarsa</label>
                  <input
                    type="date"
                    value={formData.tanggalKedaluwarsa}
                    onChange={(e) => setFormData({ ...formData, tanggalKedaluwarsa: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Simpan Izin Edar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
