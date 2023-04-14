import cluster from "cluster";
import { Logger } from "../Common/Logger"
import { configArgs } from "../configArgs";

export const workerFunction =async (mode: string = "worker", serverSocket: string = "8080", nbThread: string = "2") => {
    const serverAddr ="127.0.0.1";
    const logger = new Logger("worker")

    const localWorker = serverSocket === "";

    const startLog = localWorker ? `-> Run as a local worker (id : ${cluster.worker!.id})` : `-> Run as a remote worker `
    logger.log(startLog)

    const serverLogger = new Logger("server")
    const { RemoteServer} = await require(localWorker ? "./RemoteIPCServer": "./RemoteTCPServer")

    const remoteServer = new RemoteServer(serverLogger, serverSocket, serverAddr)
    // logger.log(JSON.stringify(configArgs(mode, serverSocket, nbThread)));

    const connected = await remoteServer.connect()
    if(!connected){
        serverLogger.err("Could not connect to the server. Exiting...")
        process.exit(1)
    }
    
    // const healthEmitter = new HealthEmitter()
    // let emitExpandedHealth = true
    // const healthInterval = setInterval(async () => {
    //     emit
    // })

    remoteServer.subscribe("stop", () => {
        logger.log("Stopped")
        process.exit(0)
    })

    setInterval(() => logger.log("coucou", 5000))
    
}