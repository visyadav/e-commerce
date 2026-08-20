import * as signalR from "@microsoft/signalr";
import Cookies from "js-cookie";
import { API_BASE_URL } from "@/src/constants/app";

export interface OrderNotificationPayload {
  id: string;
  orderNumber: string;
  totalAmount: number;
  customerName: string;
  createdAt: string;
  message: string;
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private listeners: ((payload: OrderNotificationPayload) => void)[] = [];

  private getHubUrl(): string {
    // Replaces /api/v1 with /hubs/notification
    const base = API_BASE_URL.replace(/\/api\/v1\/?$/, "");
    return `${base}/hubs/notification`;
  }

  public async startConnection(): Promise<void> {
    if (this.connection && this.connection.state !== signalR.HubConnectionState.Disconnected) {
      return;
    }

    const token = Cookies.get("token");
    if (!token) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(this.getHubUrl(), {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.on("NewOrderPlaced", (payload: OrderNotificationPayload) => {
      this.listeners.forEach((listener) => listener(payload));
    });

    try {
      await this.connection.start();
      console.log("[SignalR] Connected to Notification Hub");
    } catch (err) {
      console.warn("[SignalR Error] Connection failed:", err);
    }
  }

  public stopConnection(): void {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
    }
  }

  public onNewOrderPlaced(callback: (payload: OrderNotificationPayload) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }
}

export const signalRService = new SignalRService();
