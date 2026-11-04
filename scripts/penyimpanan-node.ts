// localStorage versi memori untuk penjaga yang berjalan di Node (tsx).
// Modul ini harus diimpor lebih dulu dari service pocketbase, karena singleton
// AMSDatabaseManager dibuat pada saat modul dimuat dan langsung membaca penyimpanan.
class PenyimpananMemori {
  private isi = new Map<string, string>();

  get length() {
    return this.isi.size;
  }
  key(indeks: number) {
    return Array.from(this.isi.keys())[indeks] ?? null;
  }
  getItem(kunci: string) {
    return this.isi.has(kunci) ? (this.isi.get(kunci) as string) : null;
  }
  setItem(kunci: string, nilai: string) {
    this.isi.set(kunci, String(nilai));
  }
  removeItem(kunci: string) {
    this.isi.delete(kunci);
  }
  clear() {
    this.isi.clear();
  }
}

export const penyimpananMemori = new PenyimpananMemori();

Object.defineProperty(globalThis, 'localStorage', {
  value: penyimpananMemori,
  configurable: true,
  writable: true
});
