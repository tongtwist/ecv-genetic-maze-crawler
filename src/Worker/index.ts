import ShellLogger from "../Common/Logger";
import cluster from "cluster";
import {IRemoteServer} from "./RemoteServer.spec";
import {cpus} from "os";


export type TWorkerConfig = {
    readonly serverAddr: string;
    readonly serverPort: number;
    readonly numThreads: number;
}

export const defaultConfig: TWorkerConfig = {
    numThreads: Math.max(1, Math.min(3,cpus().length - 1)),
    serverAddr: "127.0.0.1",
    serverPort: 5555,
}
export default function startWorker(serverSocket: string, numThreads: number) {
    const logger = new ShellLogger('WORKER', true);
    for (let i = 0; i < numThreads; i++) {
        logger.log(`Starting worker ${i} with serverSocket: ${serverSocket}`);
    }
}

export async function processBehavio(cfg: TWorkerConfig){
    const appLogger = new ShellLogger('APP');
    const localWorker = cfg.serverAddr === "" && cfg.serverPort === -1;
    const startLog = localWorker
        ? `-> run as a local worker {id: ${cluster.worker?.id}} with ${cfg.numThreads} threads`
        : `-> run as a remote worker with the following configuration: ${JSON.stringify(cfg)}`;
    appLogger.log(startLog);

    const serverLogger = new ShellLogger('SRV');
    const { RemoteServer } = await require(localWorker ? "./RemoteIPCServer" : "./RemoteTCPServer");
    const remoteServer: IRemoteServer = new RemoteServer(serverLogger)


    remoteServer.subscribe("stop" ,() => {
        //clearInterval(HealthInterval);
        appLogger.log("stopped")
        process.exit(0);
    })
}
