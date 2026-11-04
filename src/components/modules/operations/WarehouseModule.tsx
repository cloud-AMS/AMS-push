import { useEffect, useMemo, useState } from 'react';
import {
  Boxes,
  Bug,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  Globe,
  MapPin,
  PackageCheck,
  Radio,
  ShieldAlert,
  Thermometer,
  TrendingUp,
  Truck
} from 'lucide-react';
import { ModuleId, UserRole } from '../../../types';
import DasborAuditTab from './gudang/DasborAuditTab';
import StrukturGudangTab from './gudang/StrukturGudangTab';
import StokFefoTab from './gudang/StokFefoTab';
import RantaiDinginTab from './gudang/RantaiDinginTab';
import PengendalianHamaTab from './gudang/PengendalianHamaTab';
import PenerimaanInboundTab from './gudang/PenerimaanInboundTab';
import PengirimanOutboundTab from './gudang/PengirimanOutboundTab';
import OpnameCycleCountTab from './gudang/OpnameCycleCountTab';
import OptimasiStokTab from './gudang/OptimasiStokTab';
import ScannerRfidTab from './gudang/ScannerRfidTab';
import KarantinaRecallTab from './gudang/KarantinaRecallTab';
import GerbangPemerintahTab from './gudang/GerbangPemerintahTab';
import {
  GudangTabId,
  TANGGAL_ACUAN_BENIH,
  buatTanggalAcuan,
  chipFilter,
  identitasPeranGudang
} from './gudang/ui';

interface WarehouseModuleProps {
  currentRole?: UserRole;
  initialTab?: GudangTabId;
  onOpenPrintModal?: () => void;
  onNavigateModule?: (mod: ModuleId) => void;
}

const DAFTAR_TAB: {
  id: GudangTabId;
  nomor: number;
  label: string;
  ikon: typeof Boxes;
}[] = [
  { id: 'dasbor', nomor: 1, label: 'Dasbor & Kesiapan Audit', ikon: ClipboardCheck },
  { id: 'struktur', nomor: 2, label: 'Struktur Gudang & Bin', ikon: MapPin },
  { id: 'stok', nomor: 3, label: 'Stok & FEFO Dual-Track', ikon: Boxes },
  { id: 'rantai-dingin', nomor: 4, label: 'Rantai Dingin & Lingkungan', ikon: Thermometer },
  { id: 'hama', nomor: 5, label: 'Pengendalian Hama', ikon: Bug },
  { id: 'inbound', nomor: 6, label: 'Penerimaan (Inbound)', ikon: PackageCheck },
  { id: 'outbound', nomor: 7, label: 'Pengiriman (Outbound)', ikon: Truck },
  { id: 'opname', nomor: 8, label: 'Opname & Cycle Count', ikon: ClipboardList },
  { id: 'optimasi', nomor: 9, label: 'Optimasi Stok (Min-Max & ROP)', ikon: TrendingUp },
  { id: 'scanner', nomor: 10, label: 'Scanner & RFID', ikon: Radio },
  { id: 'recall', nomor: 11, label: 'Karantina & Penarikan (Recall)', ikon: ShieldAlert },
  { id: 'pemerintah', nomor: 12, label: 'Gerbang Pemerintah', ikon: Globe }
];

export default function WarehouseModule({
  currentRole = 'kepala_gudang',
  initialTab,
  onOpenPrintModal,
  onNavigateModule
}: WarehouseModuleProps) {
  const [activeTab, setActiveTab] = useState<GudangTabId>(initialTab ?? 'dasbor');
  const [modeTanggal, setModeTanggal] = useState<'benih' | 'hari-ini'>('benih');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const dariAcuan = useMemo(() => {
    if (modeTanggal === 'benih') {
      return buatTanggalAcuan(TANGGAL_ACUAN_BENIH);
    }
    return new Date();
  }, [modeTanggal]);

  const identitas = identitasPeranGudang(currentRole);

  const picuSegarkan = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header Modul Gudang & Logistik */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900">
              Rantai Pasok CDAKB
            </span>
            <span className="text-xs text-slate-500">
              Permenkes RI No. 4/2014 &amp; ISO 13485 (Gudang &amp; Logistik)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Gudang &amp; Logistik (Warehouse &amp; Logistics)
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Menjamin tata kelola penyimpanan alkes berizin, penegakan alokasi FEFO sadar-kunci (First Expired First Out), integritas rantai dingin (cold chain 2–8°C), ketertelusuran bets &amp; nomor serial alat berat, hingga sinkronisasi e-Katalog LKPP dan HL7 FHIR SATUSEHAT.
          </p>
          <p className="text-xs text-slate-500 mt-2 max-w-3xl leading-relaxed">
            Cetak biru divisi operasional: 12 kelompok kerja (Dasbor Audit CDB, Struktur Multi-Gudang &amp; Bin, Stok &amp; FEFO Dual-Track + Ketertelusuran, Rantai Dingin, Pengendalian Hama, Penerimaan Inbound, Pengiriman Outbound, Opname Blind Count &amp; Hash Log, Optimasi Min-Max/ROP, Scanner &amp; RFID, Karantina &amp; Recall, serta Gerbang Pemerintah).
          </p>
        </div>

        {/* Kontrol Tanggal Acuan Evaluasi & Identitas Peran */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 shrink-0 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-amber-700" />
            <span>Tanggal Acuan Umur Simpan &amp; FEFO</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setModeTanggal('benih')}
              className={chipFilter(modeTanggal === 'benih')}
            >
              Acuan Data (15 Jun 2024)
            </button>
            <button
              type="button"
              onClick={() => setModeTanggal('hari-ini')}
              className={chipFilter(modeTanggal === 'hari-ini')}
            >
              Jam Sistem Hari Ini
            </button>
          </div>
          <div className="text-2xs text-slate-500">
            Petugas aktif: <strong className="text-slate-700">{identitas.pengguna}</strong>
          </div>
        </div>
      </div>

      {/* Strip 12 Tab (Pola SalesModule, aksen Amber khas Operations) */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 text-xs overflow-x-auto">
        {DAFTAR_TAB.map((tab) => {
          const Ikon = tab.ikon;
          const aktif = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                aktif
                  ? 'border-amber-600 text-amber-800 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Ikon className="w-4 h-4 shrink-0" />
              <span>
                <span className="font-mono text-2xs mr-1 opacity-75">{tab.nomor}.</span>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Isi Sub-Modul Aktif */}
      {activeTab === 'dasbor' && (
        <DasborAuditTab
          dariAcuan={dariAcuan}
          refreshTrigger={refreshTrigger}
          onPilihTab={(tujuan) => setActiveTab(tujuan)}
          onPerubahanData={picuSegarkan}
        />
      )}

      {activeTab === 'struktur' && (
        <StrukturGudangTab key={refreshTrigger} onPerubahanData={picuSegarkan} />
      )}

      {activeTab === 'stok' && (
        <StokFefoTab
          key={refreshTrigger}
          currentRole={currentRole}
          dariAcuan={dariAcuan}
          onPerubahanData={picuSegarkan}
        />
      )}

      {activeTab === 'rantai-dingin' && (
        <RantaiDinginTab
          key={refreshTrigger}
          dariAcuan={dariAcuan}
          onPerubahanData={picuSegarkan}
        />
      )}

      {activeTab === 'hama' && (
        <PengendalianHamaTab
          key={refreshTrigger}
          dariAcuan={dariAcuan}
          onPerubahanData={picuSegarkan}
        />
      )}

      {activeTab === 'inbound' && (
        <PenerimaanInboundTab
          key={refreshTrigger}
          currentRole={currentRole}
          dariAcuan={dariAcuan}
          onOpenPrintModal={onOpenPrintModal}
          onPerubahanData={picuSegarkan}
        />
      )}

      {activeTab === 'outbound' && (
        <PengirimanOutboundTab
          key={refreshTrigger}
          dariAcuan={dariAcuan}
          onOpenPrintModal={onOpenPrintModal}
          onPerubahanData={picuSegarkan}
        />
      )}

      {activeTab === 'opname' && (
        <OpnameCycleCountTab
          key={refreshTrigger}
          currentRole={currentRole}
          dariAcuan={dariAcuan}
          onPerubahanData={picuSegarkan}
        />
      )}

      {activeTab === 'optimasi' && (
        <OptimasiStokTab
          key={refreshTrigger}
          dariAcuan={dariAcuan}
          onNavigateModule={onNavigateModule}
          onPerubahanData={picuSegarkan}
        />
      )}

      {activeTab === 'scanner' && (
        <ScannerRfidTab
          key={refreshTrigger}
          currentRole={currentRole}
          dariAcuan={dariAcuan}
          onPerubahanData={picuSegarkan}
        />
      )}

      {activeTab === 'recall' && (
        <KarantinaRecallTab
          key={refreshTrigger}
          currentRole={currentRole}
          dariAcuan={dariAcuan}
          onPerubahanData={picuSegarkan}
        />
      )}

      {activeTab === 'pemerintah' && (
        <GerbangPemerintahTab
          key={refreshTrigger}
          dariAcuan={dariAcuan}
          onPerubahanData={picuSegarkan}
        />
      )}
    </div>
  );
}
