import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NativeScannerService {
  private get cap() { return (window as any).Capacitor; }
  get isNative(): boolean { return !!this.cap?.isNativePlatform?.(); }
  private get scanner() { return this.cap?.Plugins?.BarcodeScanner; }

  async scan(): Promise<string | null> {
    if (!this.isNative || !this.scanner) {
      return window.prompt('Enter barcode (web fallback):') || null;
    }

    const perm = await this.scanner.requestPermissions();
    const granted =
      (typeof perm?.camera === 'string' && perm.camera === 'granted') ||
      (typeof perm?.camera === 'boolean' && perm.camera === true);
    if (!granted) return null;

    document.body.classList.add('scanner-active');

    return new Promise<string | null>(async (resolve) => {
      let finished = false;
      const cleanup = async (sub?: { remove?: () => Promise<void> }) => {
        if (finished) return;
        finished = true;
        try { await sub?.remove?.(); } catch {}
        try { await this.scanner.stopScan(); } catch {}
        document.body.classList.remove('scanner-active');
      };

      const sub = await this.scanner.addListener('barcodeScanned', async (ev: any) => {
        const b = ev?.barcode;
        const fmt = b?.format?.toString?.().toLowerCase?.() || '';
        const isITF = fmt === 'itf' || fmt === 'interleaved2of5' || fmt === 'itf-14';
        if (isITF && b?.rawValue) {
          await cleanup(sub);
          resolve(String(b.rawValue));
        }
      });

      await this.scanner.startScan({
        formats: ['Itf'],
        resolution: '1280x720',
        // If your build supports it, you can limit detection to your rectangle:
        // regionOfInterest: { x: 0.05, y: 0.42, width: 0.90, height: 0.20 },
      });

      setTimeout(async () => { await cleanup(sub); resolve(null); }, 120000);
    });
  }

  async cancel(): Promise<void> {
    if (!this.isNative || !this.scanner) return;
    try { await this.scanner.stopScan(); } catch {}
    document.body.classList.remove('scanner-active');
  }

  async setTorch(on: boolean): Promise<void> {
    if (!this.isNative || !this.scanner) return;
    try { await this.scanner.setTorch?.({ enabled: on }); } catch {}
  }
}
