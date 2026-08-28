import * as signalR from '@microsoft/signalr';
import type { Ticket } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  public async startConnection(tenantId: string, onTicketCreated: (ticket: Ticket) => void, onCriticalAlert: (data: any) => void): Promise<void> {
    const token = localStorage.getItem('auth_token');

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/tickets`, {
        accessTokenFactory: () => token || '',
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('OnTicketCreated', (ticket: Ticket) => {
      onTicketCreated(ticket);
    });

    this.connection.on('OnCriticalAlert', (data: any) => {
      onCriticalAlert(data);
    });

    try {
      await this.connection.start();
      await this.connection.invoke('JoinTenantGroup', tenantId);
    } catch (err) {
      console.error('SignalR Connection Error:', err);
    }
  }

  public async stopConnection(tenantId: string): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.invoke('LeaveTenantGroup', tenantId);
        await this.connection.stop();
      } catch (err) {
        console.error('SignalR Disconnect Error:', err);
      }
      this.connection = null;
    }
  }
}

export const signalRService = new SignalRService();
