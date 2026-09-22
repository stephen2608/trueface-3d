import { AnalysisSession, ExecutiveScorecard, TrackingMode } from '../types';

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/api';

export const api = {
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async startSession(title: string, mode: TrackingMode): Promise<AnalysisSession> {
    const res = await fetch(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, mode }),
    });
    if (!res.ok) throw new Error(`Failed to start session: ${res.statusText}`);
    return res.json();
  },

  async concludeSession(sessionUuid: string): Promise<ExecutiveScorecard> {
    const res = await fetch(`${API_BASE}/sessions/${sessionUuid}/conclude`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error(`Failed to conclude session: ${res.statusText}`);
    return res.json();
  },

  async listSessions(): Promise<AnalysisSession[]> {
    const res = await fetch(`${API_BASE}/sessions`, { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to fetch sessions: ${res.statusText}`);
    return res.json();
  },
};
