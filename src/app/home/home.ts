import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScannerOverlay } from '../scanner-overlay/scanner-overlay';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ScannerOverlay],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  last: string | null = null;

  onScanned(value: any) {
    this.last = value;
  }

  onClosed() {
    // overlay closed without result
  }
}

