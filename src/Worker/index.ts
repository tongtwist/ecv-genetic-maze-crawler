import { ShellLogger } from "../Common/Logger";
import { TWorkerOptions } from "../parseArgs";

export function worker(cfg: TWorkerOptions) {
  const appLogger = new ShellLogger("[WORKER]");
  if (cfg.mode === "worker") {
    for (let i = 0; i < cfg.nbThreads; i++) {
      appLogger.log("Run as a worker " + JSON.stringify(cfg));
    }
  } else {
    appLogger.log("Run as a local worker");
  }
}
