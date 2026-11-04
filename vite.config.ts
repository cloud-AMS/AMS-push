import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

/** Hosting statis Sites hanya melayani `/web/`, jadi `/web` tanpa garis miring dibuat explisit. */
function salinHalamanWeb() {
  return {
    name: 'situs-web-index',
    apply: 'build' as const,
    closeBundle() {
      const out = fileURLToPath(new URL('./dist/', import.meta.url));
      mkdirSync(`${out}web`, { recursive: true });
      writeFileSync(`${out}web/index.html`, readFileSync(`${out}index.html`));
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), salinHalamanWeb()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
