import * as process from "node:process";
import cluster from "node:cluster";
import type { IResult } from "./Common";
import { TOptions, parseArgs, TWorkerOptions } from "./parseArgs";
import { defaultConfig as defaultWorkerConfig } from "./Worker";

const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("node:worker_threads");

async function main() {
  const resArgs: IResult<TOptions> = parseArgs(process.argv);
  if (resArgs.isFailure) {
    console.error(resArgs.error);
    process.exit(-1);
  }
  const options: TOptions = resArgs.value!;

  if (cluster.isPrimary && options.mode === "server") {
    const { processBehavior } = await require("./Server");
    processBehavior(options);
  } else if (cluster.isWorker || options.mode === "worker") {
    /* --- Gestion des threads --- */
    if (isMainThread) {
      const workerOptions: TWorkerOptions = cluster.isWorker
        ? {
            mode: "worker",
            nbThreads: defaultWorkerConfig.nbThreads,
            serverAddr: "",
            serverPort: -1,
          }
        : (options as TWorkerOptions);

      // Créez des threads worker pour chaque tâche sous-jacente
      const numThreads = workerOptions.nbThreads;
      for (let i = 0; i < numThreads; i++) {
        // new Worker("./Worker.js", { workerData: workerOptions });
      }
    } else {
      // Ici, nous sommes dans un thread worker et nous pouvons gérer la logique
      const { processBehavior } = await require("./Worker");
      processBehavior(workerData);
    }
  } else {
    console.error("Unable to determine a run mode");
    process.exit(-1);
  }
}
main();
