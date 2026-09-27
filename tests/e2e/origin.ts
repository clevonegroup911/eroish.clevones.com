const DEFAULT_ORIGIN = "http://127.0.0.1:3100";

export function e2eOrigin(): string {
  return process.env.E2E_ORIGIN?.trim() || DEFAULT_ORIGIN;
}

export function e2eBind(): { host: string; port: string } {
  const url = new URL(e2eOrigin());
  return {
    host: url.hostname || "127.0.0.1",
    port: url.port || (url.protocol === "https:" ? "443" : "80"),
  };
}
