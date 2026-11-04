import { useState } from 'react';
import {
  Building2,
  Clock3,
  Wallet,
  UserSearch,
  GraduationCap,
  Target,
  HardHat
} from 'lucide-react';
import CoreHRModule from './hris/CoreHRModule';
import TimeAttendanceModule from './hris/TimeAttendanceModule';
import PayrollModule from './hris/PayrollModule';
import RecruitmentModule from './hris/RecruitmentModule';
import LearningModule from './hris/LearningModule';
import PerformanceModule from './hris/PerformanceModule';
import HSEModule from './hris/HSEModule';

type HrisTab = 'core' | 'attendance' | 'payroll' | 'recruitment' | 'learning' | 'performance' | 'hse';

const TABS: { id: HrisTab; label: string; ikon: typeof Building2 }[] = [
  { id: 'core', label: 'Core HR & Organization Management', ikon: Building2 },
  { id: 'attendance', label: 'Time & Attendance Management', ikon: Clock3 },
  { id: 'payroll', label: 'Payroll, Benefits & Tax Compliance', ikon: Wallet },
  { id: 'recruitment', label: 'Strategic Recruitment & Onboarding (ATS)', ikon: UserSearch },
  { id: 'learning', label: 'Learning & Competency Development', ikon: GraduationCap },
  { id: 'performance', label: 'Performance & Talent Management', ikon: Target },
  { id: 'hse', label: 'HSE / K3 (Health, Safety & Environment)', ikon: HardHat }
];

export default function HRDModule() {
  const [activeTab, setActiveTab] = useState<HrisTab>('core');

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
            Sumber Daya Manusia
          </span>
          <span className="text-xs text-slate-500">Klausul 6.2 ISO 13485 & Bab II CDAKB (Personalia)</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Human Resources & Development (HRD) Alkes
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
          Sistem HRIS terpadu untuk industri distribusi & manufaktur alat kesehatan: manajemen organisasi multi-site,
          absensi shift 24/7 dengan geofencing dan biometrik, payroll beserta kepatuhan PPh 21 dan BPJS, rekrutmen
          berbasiskan kata kunci regulasi, pengembangan kompetensi CDAKB/CPAKB/K3, penilaian kinerja ganda, serta
          keselamatan dan kesehatan kerja.
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
                aktif ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Ikon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'core' && <CoreHRModule />}
      {activeTab === 'attendance' && <TimeAttendanceModule />}
      {activeTab === 'payroll' && <PayrollModule />}
      {activeTab === 'recruitment' && <RecruitmentModule />}
      {activeTab === 'learning' && <LearningModule />}
      {activeTab === 'performance' && <PerformanceModule />}
      {activeTab === 'hse' && <HSEModule />}
    </div>
  );
}
