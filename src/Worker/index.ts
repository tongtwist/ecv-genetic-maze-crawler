import { TWorkerOptions } from "../parseArgs";

export function worker(cfg: TWorkerOptions) {
  console.log("Run as a worker with config" + JSON.stringify(cfg));
}
