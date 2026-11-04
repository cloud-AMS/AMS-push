import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BERKAS_SNAPSHOT = path.resolve(__dirname, 'data', 'website-published.json');
const BERKAS_SNAPSHOT_STATIS = path.resolve(__dirname, 'public', 'website-published.json');
const BERKAS_INDEKS = path.resolve(__dirname, 'index.html');

/** Snapshot harus berbentuk KonfigurasiSitus; penolakan melindungi berkas data dari muatan sembarangan. */
function adalahKonfigurasiSitus(nilai: unknown): nilai is Record<string, any> {
  if (!nilai || typeof nilai !== 'object') return false;
  const cfg = nilai as Record<string, any>;
  return Boolean(
    cfg.identitas && typeof cfg.identitas.nama === 'string' && cfg.hero && typeof cfg.hero.judul === 'string'
  );
}

function bacaSnapshot(): Record<string, any> | null {
  try {
    const target = fs.existsSync(BERKAS_SNAPSHOT)
      ? BERKAS_SNAPSHOT
      : fs.existsSync(BERKAS_SNAPSHOT_STATIS)
        ? BERKAS_SNAPSHOT_STATIS
        : null;
    if (!target) return null;
    const isi = JSON.parse(fs.readFileSync(target, 'utf8')) as unknown;
    return adalahKonfigurasiSitus(isi) ? isi : null;
  } catch {
    return null;
  }
}

/** Ganti judul tab, meta description, dan tautan kanonik halaman /web sesuai konten terbit. */
function suntikSeo(html: string, snapshot: Record<string, any> | null): string {
  if (!snapshot) return html;
  const judul = String(snapshot.identitas.judulSitus || snapshot.identitas.nama).replace(/</g, '&lt;');
  const deskripsi = String(snapshot.identitas.metaDeskripsi || '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${judul}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${deskripsi}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${judul}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${deskripsi}$2`)
    .replace(
      '</head>',
      `<link rel="canonical" href="${process.env.APP_URL || 'http://localhost:3000'}/web" />\n</head>`
    );
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // Status and regulatory compliance info
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'aktif',
      sistem: 'AMS Integrated System - PT Anugrah Mitra Selaras',
      versi: '2.4.0-cdakb',
      standar: ['CDAKB Permenkes 4/2014', 'CPAKB Permenkes 20/2017', 'SDAK OSS-RBA', 'ISO 13485:2016'],
      basisData: 'PocketBase 0.28.1 (Real-time Kanal Terhubung) + Cache Lokal',
      waktuServer: new Date().toISOString()
    });
  });

  // IT & DevOps Deployment Guide & Config for Caddy + NSSM Windows Server
  app.get('/api/system/deployment-guides', (req, res) => {
    res.json({
      caddyfile: `# Caddyfile Konfigurasi Reverse Proxy + HTTPS Otomatis
# Lokasi: C:\\caddy\\Caddyfile
alkes.perusahaan-anda.co.id {
    reverse_proxy localhost:3000
    
    # Header keamanan standar medis & privasi data
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    # Penanganan PocketBase websocket & streaming
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
  });

  // Kemenkes NIE format verification helper
  app.post('/api/kemenkes/validasi-nie', (req, res) => {
    const { nomorIzinEdar } = req.body;
    if (!nomorIzinEdar || typeof nomorIzinEdar !== 'string') {
      return res.status(400).json({ valid: false, pesan: 'Nomor izin edar harus diisi' });
    }
    const clean = nomorIzinEdar.trim().toUpperCase();
    const regex = /^KEMENKES RI (AKL|AKD) \d{11}$/;
    const valid = regex.test(clean);
    
    const tipe = clean.includes('AKL') ? 'Alkes Luar Negeri (Impor)' : clean.includes('AKD') ? 'Alkes Dalam Negeri (Produksi Lokal)' : 'Format Belum Sesuai';
    
    res.json({
      valid,
      nomor: clean,
      tipeAlkes: tipe,
      formatResmi: 'KEMENKES RI AKL/AKD + 11 digit angka (Contoh: KEMENKES RI AKD 20501910234)',
      keterangan: valid ? 'Format izin edar sesuai standar penomoran Kemenkes RI' : 'Format belum sesuai aturan Kemenkes RI'
    });
  });

  // ================= SITUS PUBLIK (konten diatur dari menu Website di dashboard) =================
  // Snapshot terbit dibaca halaman /web lintas perangkat; hanya konfigurasi valid yang diterima.
  app.get('/api/website/published', (req, res) => {
    const snapshot = bacaSnapshot();
    if (!snapshot) return res.status(404).json({ pesan: 'Belum ada konten situs yang diterbitkan.' });
    res.set('Cache-Control', 'no-store').json({ config: snapshot });
  });

  // Salinan statis untuk hosting tanpa Node (jalur cadangan pada PublicWebsiteApp).
  app.get('/website-published.json', (req, res) => {
    const snapshot = bacaSnapshot();
    if (!snapshot) return res.status(404).json({ pesan: 'Belum ada konten situs yang diterbitkan.' });
    res.set('Cache-Control', 'no-store').json(snapshot);
  });

  app.put('/api/website/published', (req, res) => {
    const kandidat = ((req.body as Record<string, any> | undefined)?.config ?? req.body) as unknown;
    if (!adalahKonfigurasiSitus(kandidat)) {
      return res.status(400).json({ pesan: 'Bentuk konfigurasi situs tidak valid (identitas.nama dan hero.judul wajib ada).' });
    }
    try {
      const isian = JSON.stringify(kandidat, null, 2);
      fs.mkdirSync(path.dirname(BERKAS_SNAPSHOT), { recursive: true });
      fs.writeFileSync(BERKAS_SNAPSHOT, isian, 'utf8');
      // Salinan public/ ikut terbawa ke dist/ saat build → situs tetap tayang di hosting statis.
      fs.mkdirSync(path.dirname(BERKAS_SNAPSHOT_STATIS), { recursive: true });
      fs.writeFileSync(BERKAS_SNAPSHOT_STATIS, isian, 'utf8');
      res.json({
        ok: true,
        disimpanPada: new Date().toISOString(),
        byte: Buffer.byteLength(isian)
      });
    } catch {
      res.status(500).json({ pesan: 'Snapshot gagal ditulis ke penyimpanan server.' });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('/web', (req, res) => {
      const html = fs.readFileSync(path.resolve(__dirname, 'dist', 'index.html'), 'utf8');
      res.status(200).type('html').send(suntikSeo(html, bacaSnapshot()));
    });
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.get('/web', async (req, res, next) => {
      try {
        const mentah = fs.readFileSync(BERKAS_INDEKS, 'utf8');
        const html = await vite.transformIndexHtml(req.originalUrl, mentah);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(suntikSeo(html, bacaSnapshot()));
      } catch (e) {
        next(e);
      }
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AMS Integrated System Backend aktif di port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Gagal menjalankan server:', err);
  process.exit(1);
});
