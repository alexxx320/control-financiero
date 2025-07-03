import { Injectable } from '@angular/core';

export interface DeviceFingerprint {
  deviceId: string;
  fingerprint: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private deviceId: string | null = null;

  constructor() {
    this.initializeDeviceId();
  }

  /**
   * Obtener ID único del dispositivo
   */
  getDeviceId(): string {
    if (!this.deviceId) {
      this.deviceId = this.generateDeviceId();
      localStorage.setItem('device_id', this.deviceId);
    }
    return this.deviceId;
  }

  /**
   * Obtener fingerprint completo del dispositivo
   */
  getDeviceFingerprint(): DeviceFingerprint {
    return {
      deviceId: this.getDeviceId(),
      fingerprint: this.generateFingerprint(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform
    };
  }

  /**
   * Obtener nombre amigable del dispositivo
   */
  getDeviceName(): string {
    const ua = navigator.userAgent;
    
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Firefox')) return 'Firefox Browser';
    if (ua.includes('Safari')) return 'Safari Browser';
    if (ua.includes('Edge')) return 'Edge Browser';
    if (ua.includes('Mobile')) return 'Mobile Device';
    
    return 'Unknown Device';
  }

  private initializeDeviceId(): void {
    this.deviceId = localStorage.getItem('device_id');
  }

  private generateDeviceId(): string {
    // Generar ID único basado en características del dispositivo
    const characteristics = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset()
    ].join('|');

    // Crear hash simple (en producción usar una librería de hashing)
    let hash = 0;
    for (let i = 0; i < characteristics.length; i++) {
      const char = characteristics.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32-bit integer
    }
    
    return 'device_' + Math.abs(hash).toString(16) + '_' + Date.now();
  }

  private generateFingerprint(): string {
    const components = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      screen.colorDepth,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.maxTouchPoints || 0
    ];

    // Crear fingerprint más robusto
    let fingerprint = 0;
    const str = components.join('|');
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      fingerprint = ((fingerprint << 5) - fingerprint) + char;
      fingerprint = fingerprint & fingerprint;
    }
    
    return 'fp_' + Math.abs(fingerprint).toString(16);
  }
}
