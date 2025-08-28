import { Component } from '@angular/core';

import { NativeScannerService } from './services/native-scanner.service';
import { CommonModule } from '@angular/common';
import { ScannerOverlay } from './scanner-overlay/scanner-overlay';


@Component({
  selector: 'app-root',
  imports: [CommonModule, ScannerOverlay],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
 lastScan: string | null = null;

  constructor(private scanner: NativeScannerService) {}

  async onScan() {
    const val = await this.scanner.scan();
    if (val) {
      this.lastScan = val;
      // TODO: handle scanned value in your app
    }
  }
  

  last: string | null = null;

onScanned(value: any) {
  this.last = value;
  // TODO: handle your scanned value (route, lookup, etc.)
}
onClosed() {
  // optional: overlay was closed without a result
}

}
