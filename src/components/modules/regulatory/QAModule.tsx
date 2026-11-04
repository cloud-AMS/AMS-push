import { useState } from 'react';
import { db } from '../../../services/pocketbase';
import { CAPARecord, ProdukKembalian, DokumenMutu } from '../../../types';
import { 
  Award, 
  Plus, 
  FileCheck, 
  AlertTriangle, 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  Clock, 
  FileText
} from 'lucide-react';

export default function QAModule() {
  const [activeTab, setActiveTab] = useState<'capa' | 'retur' | 'dokumen'>('capa');
  const [capaList, setCapaList] = useState<CAPARecord[]>(db.getCAPA());
  const [returList, setReturList] = useState<ProdukKembalian[]>(db.getProdukKembalian());
  const [dokumenList] = useState<DokumenMutu[]>(db.getDokumenMutu());
  const [isCapaModalOpen, setIsCapaModalOpen] = useState(false);
  const [isReturModalOpen, setIsReturModalOpen] = useState(false);

  // New CAPA Form
  const [capaForm, setCapaForm] = useState<Partial<CAPARecord>>({
    sumber: 'Audit Internal',
    deskripsiMasalah: '',
    akarPenyebab: '',
    tindakanKorektif: '',
    tindakanPreventif: '',
    penanggungJawab: 'Budi Utomo, S.T (QA Manager)',
    targetSelesai: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    status: 'Penyelidikan',
    verifikasiPJT: true
  });

  // New Retur Form
  const [returForm, setReturForm] = useState<Partial<ProdukKembalian>>({
    fasyankes: '',
    namaAlkes: '',
    nomorBets: '',
    jumlah: 1,
    satuan: 'Unit',
    alasanRetur: 'Cacat Kemasan',
    statusKarantina: 'Di Ruang Karantina',
    catatanInspeksiQA: ''
  });

  const handleSaveCAPA = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capaForm.deskripsiMasalah) return;
    const item: CAPARecord = {
      id: 'CAPA-' + Date.now(),
      nomorCAPA: `CAPA/ISO/24/${String(capaList.length + 1).padStart(3, '0')}`,
      sumber: capaForm.sumber as CAPARecord['sumber'],
      deskripsiMasalah: capaForm.deskripsiMasalah || '',
      akarPenyebab: capaForm.akarPenyebab || '',
      tindakanKorektif: capaForm.tindakanKorektif || '',
      tindakanPreventif: capaForm.tindakanPreventif || '',
      penanggungJawab: capaForm.penanggungJawab || 'QA Team',
      targetSelesai: capaForm.targetSelesai || '',
      status: capaForm.status as CAPARecord['status'],
      verifikasiPJT: true
    };
    db.addCAPA(item);
    setCapaList(db.getCAPA());
    setIsCapaModalOpen(false);
  };

  const handleSaveRetur = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returForm.namaAlkes || !returForm.nomorBets) return;
    const item: ProdukKembalian = {
      id: 'RET-' + Date.now(),
      nomorRetur: `RET/CDAKB/24/${String(returList.length + 1).padStart(3, '0')}`,
      fasyankes: returForm.fasyankes || 'Rumah Sakit Rekanan',
      namaAlkes: returForm.namaAlkes || '',
      nomorBets: returForm.nomorBets || '',
      jumlah: Number(returForm.jumlah) || 1,
      satuan: returForm.satuan || 'Unit',
      alasanRetur: returForm.alasanRetur as ProdukKembalian['alasanRetur'],
      statusKarantina: returForm.statusKarantina as ProdukKembalian['statusKarantina'],
      catatanInspeksiQA: returForm.catatanInspeksiQA || 'Barang ditahan di ruang karantina bertanda khusus.',
      tanggalMasukKarantina: new Date().toISOString().split('T')[0]
    };
    db.addProdukKembalian(item);
    setReturList(db.getProdukKembalian());
    setIsReturModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-100 text-indigo-800">
              Modul Mutu
            </span>
            <span className="text-xs text-slate-500">Klausul 8.5 ISO 13485:2016 & Bab V CDAKB</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Quality Assurance (QA) / Pemastian Mutu
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Menjamin kepatuhan sistem manajemen mutu (SMM), penanganan tindakan korektif dan pencegahan (CAPA), pengendalian dokumen mutu, serta karantina produk alkes kembalian (retur).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'capa' && (
            <button
              type="button"
              onClick={() => setIsCapaModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Buat Tindakan CAPA
            </button>
          )}
          {activeTab === 'retur' && (
            <button
              type="button"
              onClick={() => setIsReturModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Catat Retur Karantina
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('capa')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'capa'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          Tindakan CAPA ({capaList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('retur')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'retur'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          Produk Kembalian / Karantina ({returList.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dokumen')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'dokumen'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Pengendalian Dokumen Mutu ({dokumenList.length})
        </button>
      </div>

      {/* Content 1: CAPA List */}
      {activeTab === 'capa' && (
        <div className="space-y-4">
          {capaList.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200">
                    {item.nomorCAPA}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">Sumber: {item.sumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.status === 'Efektif Diverifikasi'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status}
                  </span>
                  {item.verifikasiPJT && (
                    <span className="text-[10px] font-semibold text-indigo-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi PJT
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-slate-700 block">Uraian Ketidaksesuaian:</span>
                    <p className="text-slate-600 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {item.deskripsiMasalah}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Analisis Akar Penyebab (Root Cause):</span>
                    <p className="text-slate-600 leading-relaxed text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {item.akarPenyebab}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-slate-700 block">Tindakan Korektif (Corrective Action):</span>
                    <p className="text-slate-600 leading-relaxed text-[11px] bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                      {item.tindakanKorektif}
                    </p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Tindakan Pencegahan (Preventive Action):</span>
                    <p className="text-slate-600 leading-relaxed text-[11px] bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                      {item.tindakanPreventif}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Penanggung Jawab: <strong>{item.penanggungJawab}</strong></span>
                <span>Target Selesai: <strong>{item.targetSelesai}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content 2: Produk Kembalian */}
      {activeTab === 'retur' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-amber-50/70 border-b border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Kepatuhan CDAKB:</strong> Produk kembalian wajib ditempatkan di Area Karantina terpisah berpintu terkunci dengan penandaan jelas hingga keputusan rilis/pemusnahan dikeluarkan PJT.
            </span>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Nomor Retur</th>
                <th className="py-3 px-4">Fasilitas Pelayanan (Fasyankes)</th>
                <th className="py-3 px-4">Alkes & Bets</th>
                <th className="py-3 px-4">Jumlah</th>
                <th className="py-3 px-4">Alasan Retur</th>
                <th className="py-3 px-4">Status Karantina</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {returList.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-800">{r.nomorRetur}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{r.fasyankes}</td>
                  <td className="py-3 px-4 text-slate-700">
                    <div>{r.namaAlkes}</div>
                    <div className="font-mono text-[10px] text-slate-500">Bets: {r.nomorBets}</div>
                  </td>
                  <td className="py-3 px-4 font-bold">{r.jumlah} {r.satuan}</td>
                  <td className="py-3 px-4 text-slate-700">{r.alasanRetur}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      {r.statusKarantina}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Content 3: Dokumen Mutu */}
      {activeTab === 'dokumen' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4">Kode Dokumen</th>
                <th className="py-3 px-4">Judul Dokumen Mutu</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Revisi</th>
                <th className="py-3 px-4">Tanggal Efektif</th>
                <th className="py-3 px-4">Penyusun & Penyetuju</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dokumenList.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-indigo-800">{doc.kodeDokumen}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">{doc.judul}</td>
                  <td className="py-3 px-4 text-slate-600">{doc.kategori}</td>
                  <td className="py-3 px-4 font-mono">Rev. 0{doc.revisi}</td>
                  <td className="py-3 px-4 text-slate-700">{doc.tanggalEfektif}</td>
                  <td className="py-3 px-4 text-[11px] text-slate-600">
                    <div>Penyusun: {doc.penyusun}</div>
                    <div className="font-semibold text-indigo-800">Penyetuju: {doc.penyetujui}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Add CAPA */}
      {isCapaModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Catat Tindakan Korektif & Pencegahan (CAPA)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Klausul 8.5.2 & 8.5.3 ISO 13485:2016
            </p>

            <form onSubmit={handleSaveCAPA} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sumber Temuan</label>
                <select
                  value={capaForm.sumber}
                  onChange={(e) => setCapaForm({ ...capaForm, sumber: e.target.value as CAPARecord['sumber'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Audit Internal">Audit Internal</option>
                  <option value="Inspeksi Kemenkes">Inspeksi Kemenkes RI</option>
                  <option value="Keluhan Fasyankes">Keluhan Fasyankes</option>
                  <option value="Temuan QC">Temuan QC</option>
                  <option value="Ketidaksesuaian Suhu">Ketidaksesuaian Suhu Cold Chain</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Uraian Masalah / Temuan</label>
                <textarea
                  rows={2}
                  required
                  value={capaForm.deskripsiMasalah}
                  onChange={(e) => setCapaForm({ ...capaForm, deskripsiMasalah: e.target.value })}
                  placeholder="Jelaskan ketidaksesuaian yang terjadi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Akar Penyebab (Root Cause)</label>
                <textarea
                  rows={2}
                  value={capaForm.akarPenyebab}
                  onChange={(e) => setCapaForm({ ...capaForm, akarPenyebab: e.target.value })}
                  placeholder="Mengapa masalah ini bisa terjadi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tindakan Korektif (Perbaikan Sekarang)</label>
                <input
                  type="text"
                  value={capaForm.tindakanKorektif}
                  onChange={(e) => setCapaForm({ ...capaForm, tindakanKorektif: e.target.value })}
                  placeholder="Tindakan langsung memperbaiki masalah..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tindakan Preventif (Pencegahan Ke Depan)</label>
                <input
                  type="text"
                  value={capaForm.tindakanPreventif}
                  onChange={(e) => setCapaForm({ ...capaForm, tindakanPreventif: e.target.value })}
                  placeholder="Perubahan prosedur agar tidak terulang..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penanggung Jawab</label>
                  <input
                    type="text"
                    value={capaForm.penanggungJawab}
                    onChange={(e) => setCapaForm({ ...capaForm, penanggungJawab: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Selesai</label>
                  <input
                    type="date"
                    value={capaForm.targetSelesai}
                    onChange={(e) => setCapaForm({ ...capaForm, targetSelesai: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCapaModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Simpan CAPA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Retur */}
      {isReturModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              Catat Alkes Kembalian (Retur Karantina)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Penerimaan produk retur wajib masuk area karantina khusus sesuai CDAKB.
            </p>

            <form onSubmit={handleSaveRetur} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Asal Fasyankes / Rumah Sakit</label>
                <input
                  type="text"
                  required
                  value={returForm.fasyankes}
                  onChange={(e) => setReturForm({ ...returForm, fasyankes: e.target.value })}
                  placeholder="Contoh: RSUD Pasar Minggu"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Alkes</label>
                <input
                  type="text"
                  required
                  value={returForm.namaAlkes}
                  onChange={(e) => setReturForm({ ...returForm, namaAlkes: e.target.value })}
                  placeholder="Contoh: Patient Monitor AMS-V12 Pro"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Bets / Lot</label>
                  <input
                    type="text"
                    required
                    value={returForm.nomorBets}
                    onChange={(e) => setReturForm({ ...returForm, nomorBets: e.target.value })}
                    placeholder="LOT-2024-..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jumlah</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={returForm.jumlah}
                      onChange={(e) => setReturForm({ ...returForm, jumlah: Number(e.target.value) })}
                      className="w-20 px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <input
                      type="text"
                      value={returForm.satuan}
                      onChange={(e) => setReturForm({ ...returForm, satuan: e.target.value })}
                      placeholder="Unit/Box"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Retur</label>
                <select
                  value={returForm.alasanRetur}
                  onChange={(e) => setReturForm({ ...returForm, alasanRetur: e.target.value as ProdukKembalian['alasanRetur'] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Cacat Kemasan">Cacat Kemasan Saat Pengiriman</option>
                  <option value="Salah Kirim">Salah Kirim Spesifikasi / Tipe</option>
                  <option value="Mendekati Kedaluwarsa">Mendekati Kedaluwarsa</option>
                  <option value="Dugaan Kerusakan Fungsi">Dugaan Kerusakan Fungsi / Keluhan User</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Pemeriksaan Awal QA</label>
                <textarea
                  rows={2}
                  value={returForm.catatanInspeksiQA}
                  onChange={(e) => setReturForm({ ...returForm, catatanInspeksiQA: e.target.value })}
                  placeholder="Catatan kondisi fisik saat diterima di pintu masuk..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReturModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold"
                >
                  Masuk Karantina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
