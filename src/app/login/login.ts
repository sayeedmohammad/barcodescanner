import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NativeBiometric, BiometryType } from 'capacitor-native-biometric';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = '';
  password = '';
  error = '';
  biometricAvailable = false;
  biometryLabel = '';
  biometricOptIn = false;

  private readonly credServer = 'com.sm.bm';

  constructor(private router: Router, private auth: AuthService) {}

  async ngOnInit() {
    await this.checkBiometricAvailability();
    this.biometricOptIn = this.getBiometricOptIn();
    if (this.isNative() && this.biometricAvailable && this.biometricOptIn) {
      this.tryBiometricAutoLogin();
    }
  }

  async onSubmit() {
    const ok = await this.auth.login(this.username, this.password);
    if (!ok) {
      this.error = 'Invalid credentials. Please try again.';
      return;
    }

    this.error = '';
    // Ask once after first successful login whether to enable biometric sign-in
    try {
      if (this.isNative() && this.biometricAvailable && !this.biometricOptIn) {
        const enable = typeof window !== 'undefined' && (window as any).confirm
          ? (window as any).confirm(`Enable ${this.biometryLabel || 'biometric'} sign-in for next time?`)
          : false;
        if (enable) {
          await this.setBiometricCredentials(this.username, this.password);
          this.setBiometricOptIn(true);
          this.biometricOptIn = true;
        }
      }
    } catch {}

    this.router.navigate(['/home']);
  }

  private isNative(): boolean {
    const cap = (window as any).Capacitor;
    // Support both v6 and v7 style checks if present
    return cap?.Platform?.isNativePlatform?.() ?? cap?.isNativePlatform?.() ?? false;
  }

  private async checkBiometricAvailability() {
    try {
      if (!this.isNative()) {
        this.biometricAvailable = false;
        return;
      }
      const { isAvailable, biometryType } = await NativeBiometric.isAvailable();
      // Consider available when plugin reports available and type is not NONE
      this.biometricAvailable = !!isAvailable && biometryType !== BiometryType.NONE;
      if (this.biometricAvailable) {
        this.biometryLabel =
          biometryType === BiometryType.FACE_ID
            ? 'Face ID'
            : biometryType === BiometryType.TOUCH_ID || biometryType === BiometryType.FINGERPRINT
            ? 'Touch ID'
            : 'Biometrics';
      }
    } catch {
      this.biometricAvailable = false;
    }
  }

  async signInWithBiometrics() {
    this.error = '';
    try {
      if (!this.isNative()) return;

      // Simple biometric verification; resolves on success, throws on failure/cancel
      await NativeBiometric.verifyIdentity({
        reason: 'Authenticate to continue',
        title: 'Sign in',
        subtitle: this.biometryLabel ? `Use ${this.biometryLabel}` : undefined,
        description: this.biometryLabel ? `Quickly authenticate with ${this.biometryLabel}` : undefined,
        negativeButtonText: 'Cancel'
      });

      // Retrieve stored creds (requires prior opt-in)
      try {
        const creds = await NativeBiometric.getCredentials({ server: this.credServer });
        if (creds?.username && creds?.password) {
          const ok = await this.auth.login(creds.username, creds.password);
          if (ok) {
            this.username = creds.username;
            this.password = creds.password;
            this.router.navigate(['/home']);
            return;
          } else {
            // Stored creds invalid; clear opt-in
            await this.clearBiometricOptIn();
            this.error = 'Saved credentials are no longer valid. Please log in again.';
            return;
          }
        }
      } catch {
        // No stored creds
      }
      this.error = `Biometric sign-in not enabled yet. Log in once, then opt-in when prompted.`;
    } catch (err) {
      this.error = 'Biometric auth error';
      console.error(err);
    }
  }

  private async setBiometricCredentials(username: string, password: string) {
    try {
      if (!this.isNative()) return;
      await NativeBiometric.setCredentials({
        username,
        password,
        server: this.credServer
      });
    } catch {
      // Ignore storing failures; not critical for basic login
    }
  }

  private async clearBiometricOptIn() {
    try {
      if (this.isNative()) {
        await NativeBiometric.deleteCredentials({ server: this.credServer });
      }
    } catch {
      // ignore
    } finally {
      this.setBiometricOptIn(false);
      this.biometricOptIn = false;
    }
  }

  private async tryBiometricAutoLogin() {
    try {
      await NativeBiometric.verifyIdentity({
        reason: 'Authenticate to continue',
        title: 'Sign in',
        subtitle: this.biometryLabel ? `Use ${this.biometryLabel}` : undefined,
        description: this.biometryLabel ? `Quickly authenticate with ${this.biometryLabel}` : undefined,
        negativeButtonText: 'Cancel'
      });
      const creds = await NativeBiometric.getCredentials({ server: this.credServer });
      if (creds?.username && creds?.password) {
        const ok = await this.auth.login(creds.username, creds.password);
        if (ok) {
          this.username = creds.username;
          this.password = creds.password;
          this.router.navigate(['/home']);
        } else {
          await this.clearBiometricOptIn();
        }
      }
    } catch {
      // user canceled or error; ignore
    }
  }

  private getBiometricOptIn(): boolean {
    try {
      const v = localStorage.getItem('biometricOptIn');
      return v === 'true';
    } catch {
      return false;
    }
  }

  private setBiometricOptIn(value: boolean) {
    try {
      localStorage.setItem('biometricOptIn', value ? 'true' : 'false');
    } catch {
      // ignore
    }
  }
}
