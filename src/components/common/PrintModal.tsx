import { useState } from 'react';
import { 
  X, 
  Printer, 
  FileCheck, 
  AlertTriangle, 
  Truck, 
  ShieldCheck, 
  ClipboardList
} from 'lucide-react';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DocType = 'berita-acara' | 'laporan-ktd' | 'surat-recall' | 'surat-jalan-fefo' | 'form-capa';

export default function PrintModal({ isOpen, onClose }: PrintModalProps) {
  const [activeDoc, setActiveDoc] = useState<DocType>('berita-acara');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Top Header (Bejo POS dark bar) */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Cetak Dokumen Resmi Regulasi Kemenkes & CDAKB</h3>
              <p className="text-xs text-slate-400">Pilih format dokumen resmi siap cetak / PDF untuk kepatuhan inspeksi</p>
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

        {/* Tab Navigation for Document Types */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0 [scrollbar-width:none]">
          <button
            type="button"
            onClick={() => setActiveDoc('berita-acara')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeDoc === 'berita-acara' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Berita Acara Uji Fungsi
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('laporan-ktd')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeDoc === 'laporan-ktd' ? 'bg-rose-700 text-white shadow-xs' : 'text-slate-600 hover:bg-rose-100/80 hover:text-rose-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Laporan KTD e-Watch
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('surat-recall')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeDoc === 'surat-recall' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-amber-100/80 hover:text-amber-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Pemberitahuan Recall
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('surat-jalan-fefo')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeDoc === 'surat-jalan-fefo' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-blue-100/80 hover:text-blue-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Surat Jalan CDAKB (FEFO)
          </button>

          <button
            type="button"
            onClick={() => setActiveDoc('form-capa')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeDoc === 'form-capa' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-indigo-100/80 hover:text-indigo-900'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Formulir CAPA ISO 13485
          </button>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100 flex justify-center">
          <div className="bg-white text-slate-900 w-full max-w-2xl p-8 rounded-xl shadow-xs border border-slate-300 font-sans text-xs leading-relaxed print:m-0 print:p-4 print:shadow-none print:border-none">
            
            {/* Kop Surat Perusahaan */}
            <div className="border-b-2 border-slate-900 pb-3 mb-4 text-center">
              <h2 className="text-base font-extrabold tracking-wide uppercase text-slate-900">
                PT ANUGRAH MITRA SELARAS
              </h2>
              <p className="text-[11px] text-slate-700">
                Sertifikat Distribusi Alat Kesehatan (SDAK) No: SDAK-91203049201940001 • Sertifikat CPAKB Kemenkes RI
              </p>
              <p className="text-[10px] text-slate-500">
                Kawasan Industri Medis Cikarang Blok B-12, Bekasi, Jawa Barat | Telepon: (021) 8990-2134 | Email: pjt@anugrahmitraselaras.co.id
              </p>
            </div>

            {/* Document Content Switcher */}
            {activeDoc === 'berita-acara' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-sm underline uppercase">
                  BERITA ACARA INSTALASI, UJI FUNGSI & PELATIHAN PENGGUNA
                </div>
                <div className="text-center text-[11px] text-slate-600 -mt-3">
                  Nomor: BAI/AMS/2024/05/041
                </div>

                <p>
                  Pada hari ini, <strong>Jumat</strong>, tanggal <strong>24 Mei 2024</strong>, telah dilakukan pemasangan, pengujian fungsi teknis, dan pelatihan operasional alat kesehatan di:
                </p>

                <table className="w-full border-collapse border border-slate-300 text-[11px]">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-44 p-2 bg-slate-50 font-semibold">Nama Fasilitas Pelayanan (Fasyankes)</td>
                      <td className="p-2">RSUD Pasar Minggu, Jakarta Selatan</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Ruangan Penempatan</td>
                      <td className="p-2">Ruang Intensive Care Unit (ICU) - Bed 3</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Nama Alat Kesehatan</td>
                      <td className="p-2 font-bold">Patient Monitor Multi-Parameter (AMS-V12 Pro)</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Nomor Izin Edar Kemenkes RI</td>
                      <td className="p-2 font-mono">KEMENKES RI AKL 20501819203</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Nomor Seri (Serial Number)</td>
                      <td className="p-2 font-mono">SN-V12-99014</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Hasil Pengujian Parameter</td>
                      <td className="p-2 text-emerald-800 font-semibold">
                        Lolos Uji Keselamatan Listrik & Parameter ECG, SpO2, NIBP, Suhu dalam Batas Akurasi Normal
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className="text-[11px]">
                  Peralatan diserahkan dalam kondisi baru, lengkap dengan manual operasional berbahasa Indonesia, kartu garansi resmi, dan sertifikat pengujian.
                </p>

                <div className="grid grid-cols-2 gap-8 pt-8 text-center text-[11px]">
                  <div>
                    <p className="font-semibold text-slate-700">Pihak Fasyankes (Penerima):</p>
                    <div className="h-16 flex items-end justify-center font-bold text-slate-900 border-b border-slate-400 mx-8">
                      dr. Rahmat Hidayat, Sp.An
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Kepala Instalasi ICU</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Teknisi Elektromedis Resmi:</p>
                    <div className="h-16 flex items-end justify-center font-bold text-slate-900 border-b border-slate-400 mx-8">
                      Dian Nugraha, A.Md.TEM
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">STR-TEM: 140261118-294021</p>
                  </div>
                </div>
              </div>
            )}

            {activeDoc === 'laporan-ktd' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-sm underline uppercase text-rose-900">
                  FORMULIR LAPORAN KEJADIAN TIDAK DIINGINKAN (KTD) ALKES
                </div>
                <div className="text-center text-[11px] text-slate-600 -mt-3">
                  Format Baku Sistem Surveilans Pasca Pemasaran (e-Watch Alkes Kemenkes RI)
                </div>

                <table className="w-full border-collapse border border-slate-300 text-[11px]">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-44 p-2 bg-slate-50 font-semibold">Nomor Referensi AMS</td>
                      <td className="p-2 font-mono">KTD/EWAT-ALKES/2024/001</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Nama Alat Kesehatan</td>
                      <td className="p-2 font-bold">Syringe Pump Presisi Tinggi (AMS-SP500)</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Nomor Izin Edar & Bets</td>
                      <td className="p-2 font-mono">KEMENKES RI AKD 20501910234 | Bets: LOT-2024-SP08</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Fasilitas Pelapor</td>
                      <td className="p-2">RSUD Tarakan Jakarta Pusat</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Klasifikasi Dampak Pasien</td>
                      <td className="p-2 font-bold text-amber-700">Malfungsi Alat Tanpa Cedera Klinis Pasien</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Kronologi Insiden</td>
                      <td className="p-2 text-justify">
                        Alarm oklusi terpicu palsu saat pemberian infus obat inotropik. Perawat segera mengganti unit dengan alat cadangan tanpa mengganggu hemodinamik pasien.
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Tindakan Mitigasi Segera</td>
                      <td className="p-2">
                        Alat dikarantina di RS dan unit baru pengganti telah dipasang. Dilakukan evaluasi sensor tekanan dengan PJT.
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="grid grid-cols-2 gap-8 pt-8 text-center text-[11px]">
                  <div>
                    <p className="font-semibold text-slate-700">Penanggung Jawab Teknis (PJT):</p>
                    <div className="h-16 flex items-end justify-center font-bold text-slate-900 border-b border-slate-400 mx-8">
                      apt. Dewi Kartika, S.Si
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">STRA Terdaftar Kemenkes</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Manajer Pemastian Mutu (QA):</p>
                    <div className="h-16 flex items-end justify-center font-bold text-slate-900 border-b border-slate-400 mx-8">
                      Budi Utomo, S.T
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">SMM ISO 13485:2016</p>
                  </div>
                </div>
              </div>
            )}

            {activeDoc === 'surat-recall' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-sm underline uppercase text-amber-900">
                  SURAT PEMBERITAHUAN PENARIKAN PRODUK (PRODUCT RECALL NOTICE)
                </div>
                <div className="text-center text-[11px] text-slate-600 -mt-3">
                  Nomor: REC/CDAKB/2024/001 • Lampiran e-Watch Alkes Kemenkes
                </div>

                <p>
                  Kepada Yth. <strong>Direktur / Kepala Instalasi Farmasi & Sarana RS</strong> mitra distribusi, dengan ini kami sampaikan penarikan sukarela (Voluntary Recall) untuk bets alat kesehatan:
                </p>

                <table className="w-full border-collapse border border-slate-300 text-[11px]">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-44 p-2 bg-slate-50 font-semibold">Nama Produk Alkes</td>
                      <td className="p-2 font-bold">Benang Bedah Polyglactin 910 Braided Absorbable</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Nomor Bets Terdampak</td>
                      <td className="p-2 font-mono font-bold text-rose-700">LOT-2023-B991</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Tingkat Klasifikasi Recall</td>
                      <td className="p-2 font-bold text-amber-800">Kelas II (Risiko Medis Sementara / Terbatas)</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Alasan Penarikan</td>
                      <td className="p-2 text-justify">
                        Indikasi rembesan air pada kemasan luar karton sekunder pada pengiriman ekspedisi yang berpotensi mempengaruhi kelembaban segel foil.
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Instruksi Bagi Fasyankes</td>
                      <td className="p-2 font-semibold text-rose-800">
                        Hentikan penggunaan bets tersebut, simpan di area karantina RS, dan petugas kami akan menjemput serta mengganti dengan bets baru.
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="pt-8 text-center text-[11px] max-w-xs mx-auto">
                  <p className="font-semibold text-slate-700">Ditetapkan oleh Penanggung Jawab Teknis:</p>
                  <div className="h-16 flex items-end justify-center font-bold text-slate-900 border-b border-slate-400">
                    apt. Dewi Kartika, S.Si
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">PJT Alkes PT Anugrah Mitra Selaras</p>
                </div>
              </div>
            )}

            {activeDoc === 'surat-jalan-fefo' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-sm underline uppercase">
                  SURAT JALAN DISTRIBUSI ALAT KESEHATAN (CDAKB COMPLIANT)
                </div>
                <div className="text-center text-[11px] text-slate-600 -mt-3">
                  Nomor: SJ/CDAKB/2024/05/118 • Sistem Alokasi FEFO
                </div>

                <div className="grid grid-cols-2 gap-4 text-[11px] pb-2">
                  <div>
                    <span className="text-slate-500 block">Tujuan Pengiriman:</span>
                    <strong className="block text-slate-800">RSUD Pasar Minggu</strong>
                    <span>Jl. TB Simatupang No. 1, Jakarta Selatan</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tanggal Dokumen:</span>
                    <strong className="block text-slate-800">18 Mei 2024</strong>
                    <span>Kondisi Angkut: Mobil Box AC Terkendali</span>
                  </div>
                </div>

                <table className="w-full border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <th className="p-2 text-left">Nama Alkes</th>
                      <th className="p-2 text-left">No. Izin Edar</th>
                      <th className="p-2 text-left">No. Bets</th>
                      <th className="p-2 text-left">Kedaluwarsa</th>
                      <th className="p-2 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-medium">Patient Monitor Multi-Parameter (AMS-V12 Pro)</td>
                      <td className="p-2 font-mono">AKL 20501819203</td>
                      <td className="p-2 font-mono">LOT-2024-PM44</td>
                      <td className="p-2">01/05/2029</td>
                      <td className="p-2 text-right font-bold text-blue-700">2 Unit</td>
                    </tr>
                  </tbody>
                </table>

                <div className="grid grid-cols-3 gap-4 pt-8 text-center text-[11px]">
                  <div>
                    <p className="font-semibold text-slate-700">Petugas Gudang:</p>
                    <div className="h-16 flex items-end justify-center font-bold text-slate-900 border-b border-slate-400 mx-4">
                      Ahmad Fauzi
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Pengemudi / Ekspedisi:</p>
                    <div className="h-16 flex items-end justify-center font-bold text-slate-900 border-b border-slate-400 mx-4">
                      Siti Rahma
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Penerima Fasyankes:</p>
                    <div className="h-16 flex items-end justify-center font-bold text-slate-900 border-b border-slate-400 mx-4">
                      Farmasi RSUD
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDoc === 'form-capa' && (
              <div className="space-y-4">
                <div className="text-center font-bold text-sm underline uppercase text-indigo-900">
                  LEMBAR TINDAKAN KOREKTIF & PENCEGAHAN (CAPA)
                </div>
                <div className="text-center text-[11px] text-slate-600 -mt-3">
                  Klausul 8.5.2 & 8.5.3 ISO 13485:2016 • SMM Alat Kesehatan
                </div>

                <table className="w-full border-collapse border border-slate-300 text-[11px]">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="w-44 p-2 bg-slate-50 font-semibold">Nomor CAPA</td>
                      <td className="p-2 font-mono font-bold">CAPA/CDAKB/24/001</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Sumber Temuan</td>
                      <td className="p-2">Ketidaksesuaian Suhu Cold Room</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Uraian Masalah</td>
                      <td className="p-2">Suhu Chiller 1 naik ke 9.2°C selama 45 menit saat proses un-loading reagen impor.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Analisis Akar Penyebab</td>
                      <td className="p-2">Tirai udara PVC rusak dan ketiadaan buzzer alarm otomatis jika pintu terbuka melebihi batas waktu.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Tindakan Koreksi</td>
                      <td className="p-2">Relokasi reagen ke Chiller cadangan dan evaluasi fisik kemasan.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Tindakan Pencegahan</td>
                      <td className="p-2">Pemasangan buzzer alarm pintu 90 detik & refresh training CDAKB staf gudang.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-50 font-semibold">Status Efektivitas</td>
                      <td className="p-2 font-bold text-emerald-800">Telah Diverifikasi Efektif oleh PJT</td>
                    </tr>
                  </tbody>
                </table>

                <div className="grid grid-cols-2 gap-8 pt-8 text-center text-[11px]">
                  <div>
                    <p className="font-semibold text-slate-700">Disusun oleh QA Manager:</p>
                    <div className="h-16 flex items-end justify-center font-bold text-slate-900 border-b border-slate-400 mx-8">
                      Budi Utomo, S.T
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Disetujui oleh PJT:</p>
                    <div className="h-16 flex items-end justify-center font-bold text-slate-900 border-b border-slate-400 mx-8">
                      apt. Dewi Kartika, S.Si
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Format sesuai pedoman standar audit sertifikasi Kementerian Kesehatan RI
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Dokumen Sekarang (PDF)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-300"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
