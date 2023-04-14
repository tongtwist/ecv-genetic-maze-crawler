import { TWorkerOptions } from "../parseArgs";

export function worker(cfg: TWorkerOptions) {
    console.log("worker" + JSON.stringify(cfg));
}