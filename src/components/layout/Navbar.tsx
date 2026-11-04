import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Award, 
  CheckCircle2, 
  Warehouse, 
  Wrench, 
  Factory, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Coins, 
  Cpu,
  Globe,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  CloudCheck,
  Printer,
  Search,
  QrCode,
  UserCheck,
  Shield,
  Crown,
  UserCog,
  LogOut
} from 'lucide-react';
import { ModuleId, UserRole } from '../../types';
import { db } from '../../services/pocketbase';

export type Tone = 'slate' | 'amber' | 'indigo' | 'blue' | 'emerald' | 'rose';
export type SubMenuKey = 'Regulatory Affairs' | 'Operations & Technical' | 'Sales & Marketing' | 'Supporting System';
export type NavId = ModuleId | 'overview' | 'website';

/** Menu utama, kiri ke kanan: tab langsung diselingi dropdown per divisi */
export type MainMenuItem = { kind: 'tab'; id: NavId } | { kind: 'submenu'; key: SubMenuKey };

export interface TabDef {
  id: NavId;
  label: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  group?: SubMenuKey;
  badge?: string;
}

const TONE_ACTIVE = 'bg-slate-700 text-white';

const TONE_ICON = 'text-slate-500';

const TONE_HOVER = 'hover:bg-slate-200 hover:text-slate-900';

const TONE_DOT: Record<Tone, string> = {
  slate: 'bg-slate-400',
  amber: 'bg-amber-500',
  indigo: 'bg-indigo-500',
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
};

const SUBMENU_ORDER: SubMenuKey[] = [
  'Regulatory Affairs',
  'Operations & Technical',
  'Sales & Marketing',
  'Supporting System'
];

const SUBMENU_TONE: Record<SubMenuKey, Tone> = {
  'Regulatory Affairs': 'blue',
  'Operations & Technical': 'amber',
  'Sales & Marketing': 'emerald',
  'Supporting System': 'indigo'
};

export const MAIN_MENU: MainMenuItem[] = [
  { kind: 'tab', id: 'website' },
  { kind: 'submenu', key: 'Regulatory Affairs' },
  { kind: 'submenu', key: 'Operations & Technical' },
  { kind: 'submenu', key: 'Sales & Marketing' },
  { kind: 'submenu', key: 'Supporting System' },
  { kind: 'tab', id: 'overview' }
];

export const ALL_TABS: TabDef[] = [
  { id: 'website', label: 'Website', short: 'Website', icon: Globe, badge: 'SEGERA' },

  { id: 'ra-pjt', label: 'Regulatory Affairs (RA) & Penanggung Jawab Teknis (PJT)', short: 'Izin Edar', icon: Building2, group: 'Regulatory Affairs', badge: 'WAJIB' },
  { id: 'qa-mutu', label: 'Quality Assurance (QA) / Pemastian Mutu', short: 'QA', icon: Award, group: 'Regulatory Affairs', badge: 'ISO' },
  { id: 'qc-inspeksi', label: 'Quality Control (QC) / Pengawasan Mutu', short: 'QC', icon: CheckCircle2, group: 'Regulatory Affairs', badge: 'RILIS' },
  { id: 'pms-vigilance', label: 'Post-Market Surveillance (PMS) / Vigilance', short: 'KTD', icon: AlertTriangle, group: 'Regulatory Affairs', badge: 'KTD' },

  { id: 'gudang-logistik', label: 'Warehouse & Logistics', short: 'Gudang', icon: Warehouse, group: 'Operations & Technical', badge: 'CDAKB' },
  { id: 'teknisi-service', label: 'After-Sales Service', short: 'Teknisi', icon: Wrench, group: 'Operations & Technical' },
  { id: 'produksi-cpakb', label: 'Manufacture', short: 'CPAKB', icon: Factory, group: 'Operations & Technical', badge: 'BMR' },
  { id: 'purchasing-procurement', label: 'Purchasing & Procurement', short: 'Beli', icon: ShoppingCart, group: 'Operations & Technical' },

  { id: 'sales-marketing', label: 'Sales & e-Katalog LKPP', short: 'e-Katalog', icon: TrendingUp, group: 'Sales & Marketing', badge: 'LKPP' },

  { id: 'hrd-pelatihan', label: 'Human Resources & Development (HRD)', short: 'HRD', icon: Users, group: 'Supporting System' },
  { id: 'finance-akuntansi', label: 'Finance & Accounting', short: 'Pajak', icon: Coins, group: 'Supporting System', badge: 'PPN 11%' },
  { id: 'it-traceability', label: 'Information Technology (IT)', short: 'IT Hub', icon: Cpu, group: 'Supporting System', badge: 'CADDY' },

  { id: 'overview', label: 'CDAKB & ISO', short: 'Ikhtisar', icon: LayoutDashboard, badge: 'PJT' },
];

const BOTTOM_PRIORITY: NavId[] = [
  'overview',
  'ra-pjt',
  'gudang-logistik',
  'pms-vigilance',
];

/** Nama akun aktif — dipakai sebagai pelaku pada audit trail seluruh modul. */
export const namaPengguna = (r: UserRole) => {
  switch (r) {
    case 'pjt': return 'apt. Dewi Kartika - PJT Alkes';
    case 'qa_manager': return 'Budi Utomo, S.T - QA Manager';
    case 'qc_officer': return 'Hendra Setiawan - Lead QC Inspector';
    case 'kepala_gudang': return 'Ahmad Fauzi - Kepala Gudang';
    case 'teknisi_elektromedik': return 'Dian Nugraha - Teknisi Elektromedis';
    case 'manajer_produksi': return 'Ir. Agus Santoso - Manufaktur CPAKB';
    case 'purchasing': return 'Dewi Anggraini - Purchasing Alkes';
    case 'sales_manager': return 'Farhan Maulana - Sales e-Katalog';
    case 'it_admin': return 'Admin IT & Traceability Hub';
    default: return 'Pengguna Terdaftar';
  }
};

/** Peran jabatan akun aktif. */
export const peranPengguna = (r: UserRole) => {
  switch (r) {
    case 'pjt': return 'Penanggung Jawab Teknis';
    case 'qa_manager': return 'Pemastian Mutu ISO 13485';
    case 'qc_officer': return 'Pengawasan Mutu Alkes';
    case 'kepala_gudang': return 'Gudang & Logistik CDAKB';
    case 'teknisi_elektromedik': return 'Elektromedis Ber-STR';
    case 'manajer_produksi': return 'Manufaktur CPAKB';
    case 'purchasing': return 'Purchasing & Pemasok';
    case 'sales_manager': return 'Sales e-Katalog LKPP';
    case 'it_admin': return 'IT & Traceability Hub';
    default: return 'Staff';
  }
};

interface NavbarProps {
  currentTab: NavId;
  setCurrentTab: (tab: NavId) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenTraceability: () => void;
  onKeluar: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  currentRole,
  onRoleChange,
  onOpenTraceability,
  onKeluar
}: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<SubMenuKey | null>(null);
  const [openGroup, setOpenGroup] = useState<SubMenuKey | null>(null);
  const [connStatus, setConnStatus] = useState(db.getConnectionStatus());

  useEffect(() => {
    const unsub = db.subscribe('connection_status', () => {
      setConnStatus(db.getConnectionStatus());
    });
    return unsub;
  }, []);

  const go = (id: NavId) => {
    setCurrentTab(id);
    setDrawerOpen(false);
    setShowUserMenu(false);
    setOpenMenu(null);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      /* ignore */
    }
  };

  /* Tutup drawer/dropdown saat Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setDrawerOpen(false);
      setOpenMenu(null);
      setShowUserMenu(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* Lock body scroll when mobile drawer open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const activeTabDef = ALL_TABS.find((t) => t.id === currentTab);

  const bottomTabs = useMemo(
    () => BOTTOM_PRIORITY.map((id) => ALL_TABS.find((t) => t.id === id)!).filter(Boolean),
    []
  );

  const subMenuMap = useMemo(() => {
    const map = {} as Record<SubMenuKey, TabDef[]>;
    SUBMENU_ORDER.forEach((key) => {
      map[key] = ALL_TABS.filter((t) => t.group === key);
    });
    return map;
  }, []);

  /* Buka grup yang memuat modul aktif saat drawer dibuka */
  useEffect(() => {
    if (!drawerOpen) return;
    if (activeTabDef?.group) setOpenGroup(activeTabDef.group);
  }, [drawerOpen, activeTabDef]);

  const RoleAvatar = () => {
    if (currentRole === 'pjt') {
      return (
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs">
          <Crown className="w-3.5 h-3.5" />
        </div>
      );
    }
    if (currentRole === 'qa_manager') {
      return (
        <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs">
          <Shield className="w-3.5 h-3.5" />
        </div>
      );
    }
    if (currentRole === 'qc_officer') {
      return (
        <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white text-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
      );
    }
    if (currentRole === 'kepala_gudang') {
      return (
        <div className="w-6 h-6 rounded-md bg-amber-600 flex items-center justify-center text-white text-xs">
          <Warehouse className="w-3.5 h-3.5" />
        </div>
      );
    }
    return (
      <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-white text-xs">
        <UserCog className="w-3.5 h-3.5" />
      </div>
    );
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.06)] print:shadow-none">
      
      {/* ================= BARIS ATAS (IDENTITAS & STATUS BEJO STYLE) ================= */}
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 h-14 flex items-center gap-2 sm:gap-3">
        
        {/* Tombol menu (mobile) */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Buka menu aplikasi"
          className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-700 bg-white active:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand App Identity */}
        <button
          type="button"
          onClick={() => go('overview')}
          className="flex items-center gap-2.5 min-w-0 shrink sm:shrink text-left"
          title="AMS Integrated System"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white shadow-xs shrink-0 ring-2 ring-blue-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 text-left">
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-tight truncate whitespace-nowrap">
              AMS Integrated System
            </h1>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap hidden sm:block">
              Perusahaan Alat Kesehatan • CDAKB & ISO 13485
            </p>
            {/* Judul tab aktif pada mobile */}
            <p className="text-[10.5px] font-semibold text-blue-600 truncate whitespace-nowrap sm:hidden">
              {activeTabDef?.label || 'Ikhtisar'}
            </p>
          </div>
        </button>

        <div className="flex-1" />

        {/* Status Server / PocketBase */}
        <div
          title={connStatus.statusLabel}
          className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            connStatus.isPocketBaseConnected
              ? 'bg-slate-100 text-slate-800 border-slate-300'
              : 'bg-amber-50 text-amber-900 border-amber-300'
          }`}
        >
          <CloudCheck className={`w-3.5 h-3.5 ${connStatus.isPocketBaseConnected ? 'text-blue-600' : 'text-amber-600'}`} />
          <span className="text-[11px]">{connStatus.isPocketBaseConnected ? 'PocketBase Realtime' : 'Mode Cache Lokal'}</span>
        </div>

        {/* Profil Pengguna Dropdown */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="Menu pengguna"
            className="flex items-center gap-2 p-1 pl-1.5 pr-1.5 sm:pl-2 sm:pr-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer"
          >
            <RoleAvatar />
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[150px]">
                {namaPengguna(currentRole).split('-')[0].trim()}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {currentRole.replace('_', ' ')}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 divide-y divide-slate-100">
                <div className="px-3.5 py-2">
                  <div className="text-xs font-bold text-slate-900 truncate">{namaPengguna(currentRole)}</div>
                  <div className="mt-1">
                    <span className="text-[10px] bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded inline-block border border-slate-200">
                      {peranPengguna(currentRole)}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-1">Pilih peran aktif untuk simulasi otorisasi divisi:</p>
                </div>

                <div className="py-1 max-h-60 overflow-y-auto">
                  {[
                    { r: 'pjt', label: 'apt. Dewi Kartika (PJT Kemenkes)' },
                    { r: 'qa_manager', label: 'Budi Utomo, S.T (QA Manager)' },
                    { r: 'qc_officer', label: 'Hendra Setiawan (Lead QC)' },
                    { r: 'kepala_gudang', label: 'Ahmad Fauzi (Gudang CDAKB)' },
                    { r: 'teknisi_elektromedik', label: 'Dian Nugraha (Teknisi STR)' },
                    { r: 'manajer_produksi', label: 'Ir. Agus Santoso (CPAKB)' },
                    { r: 'purchasing', label: 'Dewi Anggraini (Purchasing)' },
                    { r: 'sales_manager', label: 'Farhan Maulana (e-Katalog)' },
                    { r: 'it_admin', label: 'Admin IT & Hub' },
                  ].map((item) => (
                    <button
                      key={item.r}
                      type="button"
                      onClick={() => {
                        onRoleChange(item.r as UserRole);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                        currentRole === item.r ? 'bg-blue-50 text-blue-700' : 'text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.label}</span>
                      {currentRole === item.r && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>

                <div className="py-1.5 px-1.5">
                  <button
                    type="button"
                    onClick={onKeluar}
                    className="w-full flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Keluar
                  </button>
                </div>

                <div className="border-t border-slate-100 px-3.5 py-2 text-[10px] font-semibold text-slate-400">
                  Sistem Standar CDAKB & ISO 13485:2016
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {/* ================= STRIP TAB HORIZONTAL (DESKTOP BEJO STYLE) ================= */}
      <nav className="hidden lg:flex w-full max-w-[1440px] mx-auto px-3 sm:px-5 pb-2 -mt-0.5 gap-1">

        {/* Scrim tunggal: di bawah semua pemicu agar dropdown bisa berpindah langsung */}
        {openMenu && (
          <div className="fixed inset-0 z-0 cursor-default" onClick={() => setOpenMenu(null)} />
        )}

        {/* Menu utama: tab langsung + dropdown per divisi, sesuai urutan MAIN_MENU */}
        {MAIN_MENU.map((entry) => {
          if (entry.kind === 'tab') {
            const tab = ALL_TABS.find((t) => t.id === entry.id)!;
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => go(tab.id)}
                title={tab.label}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive ? `${TONE_ACTIVE} shadow-xs` : `text-slate-600 ${TONE_HOVER}`
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : TONE_ICON}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          }

          const { key } = entry;
          const items = subMenuMap[key];
          const containsActive = items.some((t) => t.id === currentTab);
          const isOpen = openMenu === key;
          return (
            <div key={key} className="relative shrink-0 z-50">
              <button
                type="button"
                onClick={() => setOpenMenu(isOpen ? null : key)}
                aria-expanded={isOpen}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  containsActive || isOpen ? `${TONE_ACTIVE} shadow-xs` : `text-slate-600 ${TONE_HOVER}`
                }`}
              >
                <span>{key}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <p className="px-3 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    {key}
                  </p>
                  {items.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => go(tab.id)}
                        className={`w-full text-left px-3 py-2 flex items-start gap-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                          isActive ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${TONE_ICON}`} />
                        <span className="flex-1 leading-snug">{tab.label}</span>
                        {tab.badge && (
                          <span className="shrink-0 text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold bg-slate-200 text-slate-600">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ================= DRAWER SLIDE-OVER (MOBILE BEJO STYLE) ================= */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" onClick={() => setDrawerOpen(false)} />
          <div className="relative z-10 flex h-full w-[86%] max-w-[330px] flex-col bg-white shadow-2xl">
            
            {/* Header Drawer */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-slate-900 leading-tight truncate">
                    AMS Integrated System
                  </p>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                    CDAKB & ISO 13485
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Tutup menu"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 active:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Isi Drawer: menu utama sesuai urutan MAIN_MENU */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-1">
              {MAIN_MENU.map((entry) => {
                if (entry.kind === 'tab') {
                  const tab = ALL_TABS.find((t) => t.id === entry.id)!;
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => go(tab.id)}
                      className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                        isActive ? TONE_ACTIVE : 'text-slate-700 active:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : TONE_ICON}`} />
                      <span className="flex-1 text-[13px] font-semibold truncate">{tab.label}</span>
                      {tab.badge && (
                        <span
                          className={`shrink-0 text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                            isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                const { key } = entry;
                const items = subMenuMap[key];
                const tone = SUBMENU_TONE[key];
                const isOpen = openGroup === key;
                const containsActive = items.some((t) => t.id === currentTab);
                return (
                  <div key={key}>
                    <button
                      type="button"
                      onClick={() => setOpenGroup(isOpen ? null : key)}
                      aria-expanded={isOpen}
                      className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors active:bg-slate-100 ${
                        containsActive && !isOpen ? 'bg-slate-100' : ''
                      }`}
                    >
                      <span className={`w-2 h-2 shrink-0 rounded-full ${TONE_DOT[tone]}`} />
                      <span className="flex-1 text-[13px] font-semibold truncate text-slate-700">
                        {key}
                      </span>
                      <span className="shrink-0 text-[10px] font-mono text-slate-400">{items.length}</span>
                      <ChevronRight className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="mt-1 mb-1.5 ml-3 pl-3 border-l border-slate-200 space-y-1">
                        {items.map((tab) => {
                          const Icon = tab.icon;
                          const isActive = currentTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => go(tab.id)}
                              className={`w-full flex items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors ${
                                isActive ? TONE_ACTIVE : 'text-slate-700 active:bg-slate-100'
                              }`}
                            >
                              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-white' : TONE_ICON}`} />
                              <span className="flex-1 text-[12px] font-semibold leading-snug">{tab.label}</span>
                              {tab.badge && (
                                <span
                                  className={`shrink-0 text-[8px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                                    isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                                  }`}
                                >
                                  {tab.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Drawer */}
            <div className="border-t border-slate-200 p-3 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  onOpenTraceability();
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-700 bg-slate-50 border border-slate-200 active:bg-slate-100 text-xs font-semibold"
              >
                <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Ketelusuran Nomor Bets</span>
              </button>
              <p className="text-center text-[10px] font-semibold text-slate-400">
                AMS Integrated System v2.4.0
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ================= BOTTOM BAR (MOBILE BEJO STYLE) ================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-2px_12px_rgba(15,23,42,0.06)] flex items-stretch px-1 pt-1 pb-[calc(4px+env(safe-area-inset-bottom))]">
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => go(tab.id)}
              className={`flex-1 min-w-0 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors cursor-pointer ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-500 font-medium'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-50 text-blue-600' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] truncate max-w-full">{tab.short}</span>
            </button>
          );
        })}
        {/* Tombol Menu Lainnya */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex-1 min-w-0 py-1 flex flex-col items-center justify-center gap-0.5 rounded-xl text-slate-500 cursor-pointer"
        >
          <div className="p-1 rounded-lg">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-semibold truncate">Lainnya</span>
        </button>
      </nav>

    </header>
  );
}
