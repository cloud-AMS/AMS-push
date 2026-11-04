import { useState } from 'react';
import {
  Users,
  Gavel,
  MapPinned,
  ShoppingCart,
  Megaphone,
  ChartColumn,
  Mail
} from 'lucide-react';
import { UserRole } from '../../../types';
import CrmProspekModule from './sales/CrmProspekModule';
import TenderKontrakModule from './sales/TenderKontrakModule';
import SalesForceModule from './sales/SalesForceModule';
import SalesOrderModule from './sales/SalesOrderModule';
import KampanyeMarketingModule from './sales/KampanyeMarketingModule';
import AnalitikSalesModule from './sales/AnalitikSalesModule';
import ListmonkModule from './sales/ListmonkModule';

type SalesTab = 'crm' | 'tender' | 'sfa' | 'order' | 'kampanye' | 'listmonk' | 'analitik';

const TABS: { id: SalesTab; label: string; ikon: typeof Users }[] = [
  { id: 'crm', label: 'CRM & Management Prospek', ikon: Users },
  { id: 'tender', label: 'Manajemen Tender & Kontrak (e-Katalog & LPSE)', ikon: Gavel },
  { id: 'sfa', label: 'Otomasi Sales Force (SFA)', ikon: MapPinned },
  { id: 'order', label: 'Manajemen Order & Penjualan', ikon: ShoppingCart },
  { id: 'kampanye', label: 'Marketing, Promo & Campaign Management', ikon: Megaphone },
  { id: 'listmonk', label: 'Newsletter & Mailing List (listmonk)', ikon: Mail },
  { id: 'analitik', label: 'Analitik & Dashboard (BI)', ikon: ChartColumn }
];

export default function SalesModule({ currentRole }: { currentRole: UserRole }) {
  const [activeTab, setActiveTab] = useState<SalesTab>('order');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
            Komersialisasi &amp; e-Katalog
          </span>
          <span className="text-xs text-slate-500">Etika Promosi Alkes Permenkes RI &amp; LKPP</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Sales &amp; Marketing Alkes (e-Katalog LKPP)
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Distribusi alkes ke Rumah Sakit Pemerintah (LKPP), RS Swasta, dan Klinik dengan verifikasi etika promosi alkes oleh PJT (bebas dari klaim medis palsu) dan alokasi stok sistem FEFO sadar-kunci.
        </p>
        <p className="text-xs text-slate-500 mt-2 max-w-3xl leading-relaxed">
          Cetak biru divisi komersial: 7 kelompok kerja (CRM &amp; Prospek, Tender &amp; Kontrak, Otomasi Sales Force,
          Manajemen Order, Kampanye &amp; Rebate, Newsletter &amp; Mailing List, Analitik BI). Ketertelusuran bets &amp;
          nomor serial dipusatkan penuh pada menu Gudang &amp; Logistik (Tab 3). Setiap perubahan harga, status, dan
          pagu kredit tercatat pada audit trail berisi User, Timestamp, Old Value, dan New Value.
        </p>
      </div>

      <div className="flex items-center gap-1.5 border-b border-slate-200 text-xs overflow-x-auto">
        {TABS.map((tab) => {
          const Ikon = tab.ikon;
          const aktif = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                aktif ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Ikon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'crm' && <CrmProspekModule />}
      {activeTab === 'tender' && <TenderKontrakModule />}
      {activeTab === 'sfa' && <SalesForceModule />}
      {activeTab === 'order' && <SalesOrderModule />}
      {activeTab === 'kampanye' && <KampanyeMarketingModule />}
      {activeTab === 'listmonk' && <ListmonkModule currentRole={currentRole} />}
      {activeTab === 'analitik' && <AnalitikSalesModule />}
    </div>
  );
}
