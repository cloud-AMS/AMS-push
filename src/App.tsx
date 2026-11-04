import { useState } from 'react';
import Navbar, { NavId } from './components/layout/Navbar';
import ExecutiveOverview from './components/dashboard/ExecutiveOverview';
import TraceabilityModal from './components/traceability/TraceabilityModal';
import PrintModal from './components/common/PrintModal';
import HalamanDepan from './components/modules/website/site/HalamanDepan';

// Module components
import RegulatoryModule from './components/modules/regulatory/RegulatoryModule';
import QAModule from './components/modules/regulatory/QAModule';
import QCModule from './components/modules/regulatory/QCModule';
import WarehouseModule from './components/modules/operations/WarehouseModule';
import type { GudangTabId } from './components/modules/operations/gudang/ui';
import ServiceModule from './components/modules/operations/ServiceModule';
import ProductionModule from './components/modules/operations/ProductionModule';
import ProcurementModule from './components/modules/operations/ProcurementModule';
import SalesModule from './components/modules/commercial/SalesModule';
import PMSModule from './components/modules/commercial/PMSModule';
import HRDModule from './components/modules/supporting/HRDModule';
import FinanceModule from './components/modules/supporting/FinanceModule';
import ITModule from './components/modules/supporting/ITModule';
import WebsiteModule from './components/modules/website/WebsiteModule';

import { UserRole } from './types';
import { ShieldCheck, X } from 'lucide-react';
import { akhiriSesi, bacaSesi, type SesiLogin } from './utils/autentikasi';

export default function App() {
  const [sesi, setSesi] = useState<SesiLogin | null>(() => bacaSesi());

  if (!sesi) return <HalamanDepan onMasuk={setSesi} />;

  return (
    <Dasbor
      sesi={sesi}
      onKeluar={() => {
        akhiriSesi();
        setSesi(null);
      }}
    />
  );
}

/** Isi dashboard; tab awal 'overview' adalah menu CDAKB & ISO. */
function Dasbor({ sesi, onKeluar }: { sesi: SesiLogin; onKeluar: () => void }) {
  const [activeTab, setActiveTab] = useState<NavId>('overview');
  const [currentRole, setCurrentRole] = useState<UserRole>(sesi.peran);
  const [isTraceabilityOpen, setIsTraceabilityOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [showComplianceBanner, setShowComplianceBanner] = useState(true);
  const [gudangTabAwal, setGudangTabAwal] = useState<GudangTabId | undefined>(undefined);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#00AAFF] selection:text-white">
      
      {/* Top Banner (Diselaraskan dengan gaya banner notifikasi bejo-pos) */}
      {showComplianceBanner && (
        <div className="bg-slate-900 text-slate-200 px-3 sm:px-5 py-1.5 text-xs border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2 max-w-[1440px] mx-auto flex-1 justify-center text-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0 hidden sm:inline-block" />
            <span className="text-[11px] text-slate-300">
              <strong className="text-white">Standar Resmi Kementerian Kesehatan RI:</strong> Kepatuhan Izin Edar Alkes (NIE), Sertifikat Distribusi (SDAK), CDAKB Permenkes 4/2014 & ISO 13485:2016.
            </span>
          </div>
          <button 
            type="button"
            onClick={() => setShowComplianceBanner(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            title="Tutup pemberitahuan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navbar (2-Baris Desktop, Drawer & Bottom Bar Mobile sesuai bejo-pos) */}
      <Navbar
        currentTab={activeTab}
        setCurrentTab={setActiveTab}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenTraceability={() => setIsTraceabilityOpen(true)}
        onKeluar={onKeluar}
      />

      {/* Main Application Content Container */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-5 py-4 sm:py-6 pb-24 lg:pb-8">
        {activeTab === 'overview' && (
          <ExecutiveOverview
            onSelectModule={(mod) => setActiveTab(mod)}
            onOpenTraceability={() => setIsTraceabilityOpen(true)}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
          />
        )}

        {/* Website */}
        {activeTab === 'website' && <WebsiteModule currentRole={currentRole} />}

        {/* Regulatory Affairs */}
        {activeTab === 'ra-pjt' && <RegulatoryModule />}
        {activeTab === 'qa-mutu' && <QAModule />}
        {activeTab === 'qc-inspeksi' && <QCModule />}

        {/* Operations & Technical */}
        {activeTab === 'gudang-logistik' && (
          <WarehouseModule
            currentRole={currentRole}
            initialTab={gudangTabAwal}
            onOpenPrintModal={() => setIsPrintModalOpen(true)}
            onNavigateModule={(mod) => setActiveTab(mod)}
          />
        )}
        {activeTab === 'teknisi-service' && <ServiceModule />}
        {activeTab === 'produksi-cpakb' && <ProductionModule />}
        {activeTab === 'purchasing-procurement' && <ProcurementModule />}

        {/* Sales & Marketing */}
        {activeTab === 'sales-marketing' && <SalesModule currentRole={currentRole} />}
        {activeTab === 'pms-vigilance' && (
          <PMSModule
            onBukaRecallGudang={() => {
              setGudangTabAwal('recall');
              setActiveTab('gudang-logistik');
            }}
          />
        )}

        {/* Supporting System */}
        {activeTab === 'hrd-pelatihan' && <HRDModule />}
        {activeTab === 'finance-akuntansi' && <FinanceModule />}
        {activeTab === 'it-traceability' && <ITModule />}
      </main>

      {/* Universal Batch / Lot Traceability Dialog Modal */}
      <TraceabilityModal
        isOpen={isTraceabilityOpen}
        onClose={() => setIsTraceabilityOpen(false)}
      />

      {/* Official Regulatory Printable Document Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />

    </div>
  );
}
