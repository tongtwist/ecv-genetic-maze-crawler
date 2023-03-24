import { RemoteServer } from './RemoteIPCServer';
import { TWorkerConfig } from './index';
import { Logger } from '../Common';
import cluster,{Worker} from 'node:cluster'


export type TWorkerConfig = {
    readonly nbThreads: number
    readonly serverAddr: string
    readonly serverPort: number
}

export const defaultConfig: TWorkerConfig = {
    nbThreads: Math.max(1,Math.min(3,cpus().length -1)),
    serverAddr : "127.0.0.1",
    serverPort: 5555
}

export async function processBehavior(cfg : TWorkerConfig) {
    const appLogger = Logger.create() //new Logger("App")
    const localWorker = cfg.serverAddr === "" && cfg.serverPort === -1
    const startLog = localWorker
     ? `Starting local worker (id: ${cluster.worker!.id})" : "Starting remote worker`
     : `Starting remote worker (id: ${JSON.stringify(cfg)})"`
    appLogger.log(startLog)

    const serverLogger = Logger.create("Server") //new Logger("Server")
    const {RemoteServer} = await require(localWorker ? "./RemoteIPCServer" : "./RemoteTCPServer")
    const remoteServer: IRemoteServer = new RemoteServer(serverLogger, cfg.serverAddr, cfg.serverPort)

    const connected = await RemoteServer.connect()
    if(!connected){
        serverLogger.err('Unable to connect to remote server')
        process.exit(1)
    }
    remoteServer.subscribe("stop", () => {
        appLogger.log("Stop message received")
        process.exit(0)
    })
    setInterval(() =>appLogger.log('coucou'), 5000)
}