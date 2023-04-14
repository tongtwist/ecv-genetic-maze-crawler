import cluster from "cluster";
import { cpus } from "os";
import { ShellLogger } from "../Common";
import { TWorkerOptions } from "../parseArgs";
import { IRemoteServer } from "./RemoteServer.spec";

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

export type TWorkerConfig = {
  readonly serverAddr: string;
  readonly serverPort: number;
  readonly nbThreads: number;
};

export const defaultConfig: TWorkerConfig = {
  nbThreads: Math.max(1, Math.min(3, cpus().length - 1)),
  serverAddr: "127.0.0.1",
  serverPort: 5555,
};

export async function processBehavior(cfg: TWorkerConfig) {
  const appLogger = new ShellLogger("[WORKER]");
  const localWorker = cfg.serverAddr === "" && cfg.serverPort === -1;
  const startLog = localWorker
    ? ` -> Run as a local worker (id: ${
        cluster.worker!.id
      }) with the following configuration: ${JSON.stringify(cfg)}`
    : ` -> Run as a remote worker with the following configuration: ${JSON.stringify(
        cfg
      )}`;
  appLogger.log(startLog);

  const serverLogger = new ShellLogger("[SERVER]");
  const { RemoteServer } = await require(localWorker
    ? "./RemoteIPCServer"
    : "./RemoteTCPServer");
  const remoteServer: IRemoteServer = new RemoteServer(
    serverLogger,
    cfg.serverAddr,
    cfg.serverPort
  );

  const connected = await remoteServer.connect();
  if (!connected) {
    serverLogger.error("Could not connect to remote server. Exiting...");
    process.exit(1);
  }

  remoteServer.subscribe("stop", () => {
    appLogger.log("Stopped...");
    process.exit(0);
  });

  setInterval(() => {
    console.log("coucou ");
  }, 1000);
}
