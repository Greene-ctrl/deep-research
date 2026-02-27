import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  data?: any[];
}

interface DebugStore {
  logs: LogEntry[];
  addLog: (level: "info" | "warn" | "error", message: string, ...data: any[]) => void;
  clearLogs: () => void;
  exportLogs: () => string;
}

// Intercept console methods to capture logs
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

export const useDebugStore = create<DebugStore>()(
  persist(
    (set, get) => ({
      logs: [],
      addLog: (level, message, ...data) => {
        const entry: LogEntry = {
          timestamp: new Date().toISOString(),
          level,
          message: String(message),
          data: data.length > 0 ? data : undefined,
        };
        // Limit logs to last 1000 entries to prevent memory issues
        set((state) => ({
          logs: [...state.logs.slice(-999), entry],
        }));
      },
      clearLogs: () => set({ logs: [] }),
      exportLogs: () => {
        const { logs } = get();
        return JSON.stringify(logs, null, 2);
      },
    }),
    {
      name: "deep-research-debug-store",
    }
  )
);

// Function to initialize log interception
export function initLogInterception() {
  if (typeof window === "undefined") return; // Client-side only

  console.log = (...args) => {
    originalConsoleLog(...args);
    useDebugStore.getState().addLog("info", args[0], ...args.slice(1));
  };

  console.warn = (...args) => {
    originalConsoleWarn(...args);
    useDebugStore.getState().addLog("warn", args[0], ...args.slice(1));
  };

  console.error = (...args) => {
    originalConsoleError(...args);
    useDebugStore.getState().addLog("error", args[0], ...args.slice(1));
  };
}
