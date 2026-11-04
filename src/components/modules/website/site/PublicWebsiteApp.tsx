import { useEffect, useState } from 'react';
import { Construction, ExternalLink, RefreshCw } from 'lucide-react';
import type { KonfigurasiSitus } from '../../../../types';
import { db } from '../../../../services/pocketbase';
import PublicWebsite, { adalahKonfigurasiSitus, muatSnapshot } from './PublicWebsite';

type Status = 'memuat' | 'tayang' | 'belum' | 'tahan';

const ADALAH_PRATINJAU = new URLSearchParams(window.location.search).get('pratinjau') === '1';

/** Rangkai sumber konten tayang: snapshot server → snapshot statis → penyimpanan lokal. */
export async function tentukanKontenTayang(): Promise<{ konfigurasi: KonfigurasiSitus | null; status: Status }> {
  const dariServer = await muatSnapshot('/api/website/published');
  if (dariServer) return { konfigurasi: dariServer, status: dariServer.isPublished ? 'tayang' : 'tahan' };

  const dariSnapshotStatis = await muatSnapshot('/website-published.json');
  if (dariSnapshotStatis) return { konfigurasi: dariSnapshotStatis, status: dariSnapshotStatis.isPublished ? 'tayang' : 'tahan' };

  const lokal = db.getWebsiteTerbit();
  if (!lokal) return { konfigurasi: null, status: 'belum' };
  return { konfigurasi: lokal, status: lokal.isPublished ? 'tayang' : 'tahan' };
}

export default function PublicWebsiteApp() {
  const [isi, setIsi] = useState<{ konfigurasi: KonfigurasiSitus | null; status: Status }>({
    konfigurasi: null,
    status: 'memuat'
  });
  const [drafPratinjau, setDrafPratinjau] = useState<KonfigurasiSitus | null>(null);

  /** Pratinjau dashboard: draf dikirim dari jendela induk lewat postMessage, tanpa menyentuh konten tayang. */
  useEffect(() => {
    if (!ADALAH_PRATINJAU) return;
    const terima = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const data = e.data as { type?: string; konfigurasi?: unknown };
      if (data?.type !== 'ams-website-pratinjau') return;
      if (adalahKonfigurasiSitus(data.konfigurasi)) setDrafPratinjau(data.konfigurasi);
    };
    window.addEventListener('message', terima);
    window.parent.postMessage({ type: 'ams-website-pratinjau-siap' }, window.location.origin);
    return () => window.removeEventListener('message', terima);
  }, []);

  useEffect(() => {
    if (ADALAH_PRATINJAU) return;
    let batal = false;
    tentukanKontenTayang().then((hasil) => {
      if (!batal) setIsi(hasil);
    });
    const berhenti = db.subscribe('website_published', () => {
      tentukanKontenTayang().then((hasil) => {
        if (!batal) setIsi(hasil);
      });
    });
    return () => {
      batal = true;
      berhenti();
    };
  }, []);

  if (ADALAH_PRATINJAU) {
    if (!drafPratinjau) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Menunggu draf konten dari dashboard…
          </div>
        </div>
      );
    }
    return <PublicWebsite konfigurasi={drafPratinjau} pratinjau />;
  }

  if (isi.status === 'memuat') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Memuat konten situs…
        </div>
      </div>
    );
  }

  if (isi.status === 'tayang' && isi.konfigurasi) {
    return (
      <PublicWebsite
        konfigurasi={isi.konfigurasi}
        padaMasuk={() => {
          window.location.href = '/?masuk=1';
        }}
      />
    );
  }

  const pesan =
    isi.status === 'tahan'
      ? 'Konten situs sedang ditahan (on hold). Halaman kembali tayang setelah penerbitan berikutnya.'
      : 'Belum ada konten yang diterbitkan untuk situs publik ini.';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-5">
          <Construction className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="text-lg font-bold text-slate-900">Situs Publik Belum Tayang</h1>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{pesan}</p>
        <a
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold"
        >
          <ExternalLink className="w-4 h-4" />
          Buka Dashboard Website
        </a>
      </div>
    </div>
  );
}
