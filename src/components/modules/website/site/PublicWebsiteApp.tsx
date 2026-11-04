import { useEffect, useMemo, useState } from 'react';
import { Construction, ExternalLink, RefreshCw } from 'lucide-react';
import type { KonfigurasiSitus } from '../../../../types';
import { db, KOLEKSI_OPERASIONAL_SITUS } from '../../../../services/pocketbase';
import { selaraskanKontenOperasional } from '../../../../utils/website';
import PublicWebsite, { adalahKonfigurasiSitus, muatSnapshot } from './PublicWebsite';

export type StatusTayangPublik = 'tayang' | 'belum' | 'tahan';
type Status = 'memuat' | StatusTayangPublik;

const ADALAH_PRATINJAU = new URLSearchParams(window.location.search).get('pratinjau') === '1';

function capWaktuSnapshot(cfg: KonfigurasiSitus): number {
  return Math.max(cfg.lastPublishedAt ?? 0, cfg.lastModifiedAt ?? 0);
}

/**
 * Pasang pendengar real-time terhadap perubahan status stok gudang, izin edar, recall,
 * serta skema/kontrak harga dari basis data operasional (lintas modul, lintas tab, & PocketBase SSE).
 */
export function pasangPendengarOperasionalPublik(onSegarkan: (pemicu: string) => void): () => void {
  const lepasKoleksi = db.subscribeKoleksi(KOLEKSI_OPERASIONAL_SITUS, (kunciKoleksi) => {
    onSegarkan(kunciKoleksi);
  });

  const padaFokus = () => onSegarkan('window_focus');
  const padaVisibilitas = () => {
    if (document.visibilityState === 'visible') {
      onSegarkan('visibility_visible');
    }
  };

  window.addEventListener('focus', padaFokus);
  document.addEventListener('visibilitychange', padaVisibilitas);

  return () => {
    lepasKoleksi();
    window.removeEventListener('focus', padaFokus);
    document.removeEventListener('visibilitychange', padaVisibilitas);
  };
}

/** Hook penyelarasan real-time agar konfigurasi situs selalu mencerminkan stok & harga operasional terbaru. */
export function useKonfigurasiOperasionalSinkron(dasar: KonfigurasiSitus | null): KonfigurasiSitus | null {
  const [versiOperasional, setVersiOperasional] = useState(0);

  useEffect(() => {
    return pasangPendengarOperasionalPublik(() => {
      setVersiOperasional((v) => v + 1);
    });
  }, []);

  return useMemo(() => {
    void versiOperasional;
    if (!dasar) return null;
    return selaraskanKontenOperasional(dasar, db.getSumberOperasionalWebsite());
  }, [dasar, versiOperasional]);
}

/** Rangkai sumber konten tayang: pilih snapshot paling mutakhir lalu selaraskan dengan stok & harga terkini. */
export async function tentukanKontenTayang(): Promise<{
  konfigurasi: KonfigurasiSitus | null;
  status: StatusTayangPublik;
}> {
  const dariServer = (await muatSnapshot('/api/website/published')) ?? (await muatSnapshot('/website-published.json'));
  const lokal = db.getWebsiteTerbit();

  const terpilih =
    dariServer && lokal
      ? capWaktuSnapshot(lokal) >= capWaktuSnapshot(dariServer)
        ? lokal
        : dariServer
      : dariServer ?? lokal;

  if (!terpilih) return { konfigurasi: null, status: 'belum' };

  const terselaraskan = selaraskanKontenOperasional(terpilih, db.getSumberOperasionalWebsite());
  return {
    konfigurasi: terselaraskan,
    status: terselaraskan.isPublished ? 'tayang' : 'tahan'
  };
}

export default function PublicWebsiteApp() {
  const [isi, setIsi] = useState<{ konfigurasi: KonfigurasiSitus | null; status: Status }>({
    konfigurasi: null,
    status: 'memuat'
  });
  const [drafPratinjau, setDrafPratinjau] = useState<KonfigurasiSitus | null>(null);

  const konfigurasiTayangSinkron = useKonfigurasiOperasionalSinkron(isi.konfigurasi);
  const drafPratinjauSinkron = useKonfigurasiOperasionalSinkron(drafPratinjau);

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
    const muatKonten = () => {
      tentukanKontenTayang().then((hasil) => {
        if (!batal) setIsi(hasil);
      });
    };

    muatKonten();
    const berhentiTerbit = db.subscribe('website_published', muatKonten);

    return () => {
      batal = true;
      berhentiTerbit();
    };
  }, []);

  if (ADALAH_PRATINJAU) {
    if (!drafPratinjauSinkron) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Menunggu draf konten dari dashboard…
          </div>
        </div>
      );
    }
    return <PublicWebsite konfigurasi={drafPratinjauSinkron} pratinjau />;
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

  if (isi.status === 'tayang' && konfigurasiTayangSinkron) {
    return (
      <PublicWebsite
        konfigurasi={konfigurasiTayangSinkron}
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
