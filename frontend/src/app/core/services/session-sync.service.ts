import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SessionSyncMessage {
  type: 'LOGIN' | 'LOGOUT' | 'TOKEN_REFRESH' | 'FORCE_LOGOUT';
  data?: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class SessionSyncService {
  private readonly CHANNEL_NAME = 'auth_sync';
  private broadcastChannel: BroadcastChannel;
  private sessionEventSubject = new BehaviorSubject<SessionSyncMessage | null>(null);

  public sessionEvent$ = this.sessionEventSubject.asObservable();

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel(this.CHANNEL_NAME);
      this.setupMessageListener();
    }
  }

  /**
   * Notificar login a otras pestañas
   */
  notifyLogin(userData: any): void {
    this.sendMessage({
      type: 'LOGIN',
      data: userData,
      timestamp: Date.now()
    });
  }

  /**
   * Notificar logout a otras pestañas
   */
  notifyLogout(): void {
    this.sendMessage({
      type: 'LOGOUT',
      timestamp: Date.now()
    });
  }

  /**
   * Notificar renovación de token
   */
  notifyTokenRefresh(): void {
    this.sendMessage({
      type: 'TOKEN_REFRESH',
      timestamp: Date.now()
    });
  }

  /**
   * Forzar logout en todas las pestañas
   */
  forceLogoutAll(): void {
    this.sendMessage({
      type: 'FORCE_LOGOUT',
      timestamp: Date.now()
    });
  }

  private setupMessageListener(): void {
    this.broadcastChannel.onmessage = (event) => {
      const message: SessionSyncMessage = event.data;
      console.log('📡 Mensaje de sincronización recibido:', message);
      this.sessionEventSubject.next(message);
    };
  }

  private sendMessage(message: SessionSyncMessage): void {
    if (this.broadcastChannel) {
      console.log('📡 Enviando mensaje de sincronización:', message);
      this.broadcastChannel.postMessage(message);
    }
  }
}
