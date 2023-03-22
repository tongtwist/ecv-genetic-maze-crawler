import { TOptions, TServerOptions, TWorkerOptions } from "./parseArgs";
import parseArgs from "./parseArgs";
import cluster from "cluster";

async function main() {
  const options: TOptions | null = parseArgs(process.argv) as TOptions;

  if (!options && cluster.isPrimary) {
    console.error(
      `Unexpected argument(s) : ${process.argv.slice(2).join(" ")}`
    );
    process.exit(-1);
  }

  if ((options as TOptions).mode === "server" && cluster.isPrimary) {
    let { server } = await require("./Server");
    server(options as TServerOptions);
    cluster.fork();
  } else if ((options as TOptions).mode === "worker" || cluster.isWorker) {
    let { worker } = await require("./Worker");
    worker(options as TWorkerOptions);
  }
}

main();
