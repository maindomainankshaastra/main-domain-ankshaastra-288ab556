/// <reference types="vite/client" />

interface Window {
  fbq?: (
    action: "track",
    event: string,
    params?: Record<string, unknown>,
    options?: { eventID?: string },
  ) => void;
}
