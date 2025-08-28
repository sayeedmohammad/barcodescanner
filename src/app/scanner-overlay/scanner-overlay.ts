import { Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { NativeScannerService } from '../services/native-scanner.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scanner-overlay',
  imports: [CommonModule],
  templateUrl: './scanner-overlay.html',
  styleUrl: './scanner-overlay.css'
})
export class ScannerOverlay implements OnDestroy {
active = false;
  torchOn = false;

  @Output() scanned = new EventEmitter<string>();
  @Output() closed = new EventEmitter<void>();

  constructor(private scannerService: NativeScannerService) {}

  async open(): Promise<void> {
    if (this.active) return;
    this.active = true;
    this.torchOn = false;

    const value = await this.scannerService.scan();
    this.active = false;

    if (this.torchOn) {
      this.torchOn = false;
      this.scannerService.setTorch(false).catch(() => {});
    }

    if (value) this.scanned.emit(value);
  }

  async close(): Promise<void> {
    if (!this.active) return;
    await this.scannerService.cancel();
    this.active = false;
    this.closed.emit();
  }

  async toggleTorch(): Promise<void> {
    if (!this.active) return;
    this.torchOn = !this.torchOn;
    await this.scannerService.setTorch(this.torchOn);
  }

  async ngOnDestroy() {
    if (this.active) await this.scannerService.cancel();
  }
}
