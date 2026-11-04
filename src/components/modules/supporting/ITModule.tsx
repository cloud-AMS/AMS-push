import { useState, useEffect } from 'react';
import { db } from '../../../services/pocketbase';
import { LogAuditTrail } from '../../../types';
import { 
  Cpu, 
  Terminal, 
  Database, 
  ShieldCheck, 
  Copy, 
  Check, 
  RefreshCw, 
  Download, 
  Server,
  Lock,
  Layers,
  FileCode,
  CheckCircle2
} from 'lucide-react';

export default function ITModule() {
  const [activeTab, setActiveTab] = useState<'traceability' | 'audit' | 'deployment'>('traceability');
  const [auditList, setAuditList] = useState<LogAuditTrail[]>(db.getAuditTrail());
  const [connStatus, setConnStatus] = useState(db.getConnectionStatus());
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Deployment configs
  const [deploymentConfig, setDeploymentConfig] = useState<{
    caddyfile: string;
    nssmCommands: string[];
  }>({
    caddyfile: `# Caddyfile Konfigurasi Reverse Proxy + HTTPS Otomatis
# Lokasi file: C:\\caddy\\Caddyfile
alkes.perusahaan-anda.co.id {
    # Reverse proxy ke dev/prod server port 3000
    reverse_proxy localhost:3000

    # Header Keamanan Standar Medis & Privasi Data
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    # Penanganan PocketBase websocket & REST API
    handle /api/pocketbase/* {
        reverse_proxy localhost:8090
    }

    log {
        output file C:\\caddy\\logs\\ams_access.log {
            roll_size 20mb
            roll_keep 10
        }
    }
}`,
    nssmCommands: [
      '# 1. Build lebih dulu (hasilkan dist/ untuk aset dan server.js untuk bundel runtime)',
      'cd C:\\inetpub\\ams-alkes',
      'npm ci',
      'npm run build',
      '',
      '# 2. Pasang Node Express Server sebagai Service Windows',
      'nssm install AMS_AppService "C:\\Program Files\\nodejs\\node.exe" "C:\\inetpub\\ams-alkes\\server.js"',
      'nssm set AMS_AppService AppDirectory "C:\\inetpub\\ams-alkes"',
      'nssm set AMS_AppService AppEnvironmentExtra NODE_ENV=production PORT=3000',
      'nssm set AMS_AppService AppStdout "C:\\inetpub\\ams-alkes\\logs\\service_output.log"',
      'nssm set AMS_AppService AppStderr "C:\\inetpub\\ams-alkes\\logs\\service_error.log"',
      'nssm start AMS_AppService',
      '',
      '# 3. Pasang PocketBase Service di Windows Server',
      'nssm install AMS_PocketBase "C:\\pocketbase\\pocketbase.exe" "serve --http=0.0.0.0:8090"',
      'nssm set AMS_PocketBase AppDirectory "C:\\pocketbase"',
      'nssm set AMS_PocketBase AppStdout "C:\\pocketbase\\logs\\pb_output.log"',
      'nssm start AMS_PocketBase',
      '',
      '# 4. Pasang Caddy Web Server sebagai Service',
      'nssm install CaddyWebServer "C:\\caddy\\caddy.exe" "run --config C:\\caddy\\Caddyfile"',
      'nssm start CaddyWebServer'
    ]
  });

  useEffect(() => {
    fetch('/api/system/deployment-guides')
      .then(res => res.json())
      .then(data => {
        if (data.caddyfile && data.nssmCommands) {
          setDeploymentConfig(data);
        }
      })
      .catch(() => {});

    const unsub = db.subscribe('audit_trail', () => {
      setAuditList(db.getAuditTrail());
    });
    return unsub;
  }, []);

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleExportBackup = () => {
    const data = {
      tanggalEkspor: new Date().toISOString(),
      izinEdar: db.getIzinEdar(),
      sertifikat: db.getSertifikat(),
      stokGudang: db.getStokGudang(),
      layananTeknis: db.getLayananTeknis(),
      betsProduksi: db.getBetsProduksi(),
      capa: db.getCAPA(),
      ktd: db.getLaporanKTD(),
      penjualan: db.getPenjualan(),
      auditTrail: db.getAuditTrail()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AMS_Backup_Alkes_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (window.confirm('Apakah Anda yakin ingin memulihkan seluruh data simulasi ke pengaturan awal standar?')) {
      db.resetToDefaults();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
              Infrastruktur & Ketelusuran Digital
            </span>
            <span className="text-xs text-slate-500">Integritas Data FDA 21 CFR Part 11 & CDAKB</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Information Technology (IT) & Traceability Hub
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Infrastruktur basis data PocketBase 0.28.1 realtime, jejak audit digital tanpa celah manipulasi, sinkronisasi offline-first, serta konfigurasi Windows Server NSSM + Caddy reverse proxy HTTPS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Ekspor Cadangan Basis Data (JSON)
          </button>
        </div>
      </div>

      {/* Connection & Architecture Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Basis Data & Kanal Realtime:</span>
            <span className="font-bold text-slate-900">PocketBase 0.28.1</span>
            <span className="text-[10px] text-indigo-700 block">Kanal SSE & SQLite Ringan</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Web Server & HTTPS:</span>
            <span className="font-bold text-slate-900">Caddy Reverse Proxy</span>
            <span className="text-[10px] text-blue-700 block">Sertifikat SSL Otomatis Let's Encrypt</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Layanan Windows Server:</span>
            <span className="font-bold text-slate-900">NSSM (Service Manager)</span>
            <span className="text-[10px] text-amber-700 block">Auto-Restart & Startup Otomatis</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('traceability')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'traceability'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          Penyimpanan & Sinkronisasi
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Jejak Audit Trail Digital ({auditList.length})
        </button>

        <button
          onClick={() => setActiveTab('deployment')}
          className={`pb-3 px-3 font-semibold transition-colors border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'deployment'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Konfigurasi Caddy & NSSM Windows Server
        </button>
      </div>

      {/* Tab 1: Storage & Sync Status */}
      {activeTab === 'traceability' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Status Arsitektur Sistem Dual-Layer</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-900">1. Offline-First Cache Layer (Browser Storage)</span>
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Menyimpan seluruh data operasional di memori lokal terenkripsi sehingga sistem gudang dan penerimaan barang tetap dapat bekerja tanpa henti meski koneksi internet terputus.
                </p>
                <div className="text-[10px] text-indigo-800 font-mono">Status: Aktif & Siap Baca-Tulis</div>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900">2. PocketBase 0.28.1 Realtime Connector</span>
                  <Server className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Menghubungkan aplikasi ke server PocketBase pada <code>{connStatus.url}</code> untuk sinkronisasi multi-pengguna dan notifikasi instan perubahan bets.
                </p>
                <div className="text-[10px] text-blue-800 font-mono">Konektor: {connStatus.statusLabel}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Kelola data simulasi untuk keperluan demo atau uji coba audit internal:
              </span>
              <button
                onClick={handleResetData}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Reset ke Data Standar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-semibold">Log Jejak Rekam Digital Sesuai Klausul Integritas Data ISO 13485:</span>
            <span>Total Catatan: {auditList.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Pengguna & Peran</th>
                  <th className="py-3 px-4">Divisi / Modul</th>
                  <th className="py-3 px-4">Aktivitas Operasional</th>
                  <th className="py-3 px-4">Nomor Referensi</th>
                  <th className="py-3 px-4">Integritas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditList.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600 text-[11px] whitespace-nowrap">{log.waktu}</td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-bold text-slate-900">{log.pengguna}</div>
                      <div className="text-[10px] text-slate-500">{log.peran}</div>
                    </td>
                    <td className="py-3 px-4 font-sans font-medium text-blue-800">{log.modul}</td>
                    <td className="py-3 px-4 font-sans text-slate-700">{log.aktivitas}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{log.nomorReferensi}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {log.statusIntegritas}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Caddy + NSSM Deployment */}
      {activeTab === 'deployment' && (
        <div className="space-y-6">
          
          {/* Caddyfile Box */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-xs text-white">1. Caddyfile (Reverse Proxy + HTTPS Otomatis)</h4>
              </div>
              <button
                onClick={() => handleCopy(deploymentConfig.caddyfile, 'caddy')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedSection === 'caddy' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'caddy' ? 'Tersalin' : 'Salin Caddyfile'}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              {deploymentConfig.caddyfile}
            </pre>
          </div>

          {/* NSSM Commands Box */}
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-xs text-white">2. Perintah Instalasi NSSM di Windows Server (Service Background)</h4>
              </div>
              <button
                onClick={() => handleCopy(deploymentConfig.nssmCommands.join('\n'), 'nssm')}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                {copiedSection === 'nssm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'nssm' ? 'Tersalin' : 'Salin Perintah CMD'}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 rounded-xl text-slate-300 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
              {deploymentConfig.nssmCommands.join('\n')}
            </pre>
          </div>

        </div>
      )}

    </div>
  );
}
