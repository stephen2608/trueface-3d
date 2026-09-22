import { Point3D, SpatialTelemetryResponse } from '../types';

export class SpatialWebSocketClient {
  private socket: WebSocket | null = null;
  private url = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:8080/ws/spatial-telemetry';
  private onTelemetry: ((data: SpatialTelemetryResponse) => void) | null = null;
  private onStatus: ((connected: boolean) => void) | null = null;
  private isExplicitlyClosed = false;
  private lastSentTime = 0;

  public connect(
    onTelemetry: (data: SpatialTelemetryResponse) => void,
    onStatus: (connected: boolean) => void
  ) {
    this.onTelemetry = onTelemetry;
    this.onStatus = onStatus;
    this.isExplicitlyClosed = false;

    // In production HTTPS without explicit secure WS configured, notify and allow local fallback
    if (typeof window !== 'undefined' && window.location.protocol === 'https:' && !import.meta.env.VITE_BACKEND_WS_URL) {
      console.info('Production HTTPS detected without VITE_BACKEND_WS_URL; using high-speed local spatial engine.');
      if (this.onStatus) this.onStatus(false);
      return;
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('Connected to Java TrueFace 3D WebSocket server');
        if (this.onStatus) this.onStatus(true);
      };

      this.socket.onmessage = (event) => {
        try {
          const data: SpatialTelemetryResponse = JSON.parse(event.data);
          if (this.onTelemetry) this.onTelemetry(data);
        } catch (e) {
          console.error('Error parsing WebSocket telemetry', e);
        }
      };

      this.socket.onerror = (err) => {
        console.warn('WebSocket error, retrying in 2s...', err);
        if (this.onStatus) this.onStatus(false);
      };

      this.socket.onclose = (event) => {
        console.log(`WebSocket closed (code: ${event.code}, reason: ${event.reason})`);
        if (this.onStatus) this.onStatus(false);
        if (!this.isExplicitlyClosed) {
          setTimeout(() => this.connect(this.onTelemetry!, this.onStatus!), 2000);
        }
      };
    } catch (e) {
      console.error('WebSocket connection failed', e);
      if (this.onStatus) this.onStatus(false);
    }
  }

  public sendFrame(sessionUuid: string, landmarks: Point3D[]) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;

    // Throttle to 25 FPS (~40ms interval) to keep network lightweight and responsive
    const now = Date.now();
    if (now - this.lastSentTime < 40) return;
    this.lastSentTime = now;

    const payload = {
      sessionUuid,
      timestampMs: now,
      landmarks,
    };
    this.socket.send(JSON.stringify(payload));
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const spatialWsClient = new SpatialWebSocketClient();
