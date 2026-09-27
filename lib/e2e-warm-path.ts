import os from "node:os";
import path from "node:path";

export function e2eWarmMarkerPath() {
  return process.env.E2E_WARM_MARKER ?? path.join(os.tmpdir(), "ejc-e2e-warm");
}
