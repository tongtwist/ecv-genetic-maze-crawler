import { Logger } from "../Common/Logger"
import { configArgs } from "../configArgs";
import { workerFunction } from "../Worker/worker";
import path from "node:path";
import http from "node:http";
import express from "express";
import {Socket as SocketIO, Server as SocketIOServer} from "socket.io"
import { Maze } from "./Maze";
import { IRemoteWorker } from "./RemoteWorker.spec";
import { RemoteIPCWorker } from "./RemoteIPCWorker";
import { IBaseMessage, IResult, messageFromJSON, THealthMessage, TJSON } from "../Common";
import cluster from "cluster";
import { Worker } from "node:cluster";

export const serverFunction =(mode: string, httpPort: string, tcpPort: string) => {
    const logger = new Logger("server")
    let maze: null | Maze = null;

    logger.log("Run as a server  ...")
    const expressApp = express()
    const httpServer = http.createServer(expressApp);
    const socketIO= new SocketIOServer(httpServer)
    const publicPath = path.join(process.cwd(), "public")

    logger.log(`HTTP service will serve static file from ${publicPath}`)

    expressApp.use("/p/", express.static(publicPath))

    socketIO.on("connection", (s: SocketIO) => {
        let protocol =s.conn.transport.name
        const sLogger = new Logger(`socket ${s.id}`)

        sLogger.log(`Websocket connection OK using ${protocol} protocol`)
        s.on("error", (err: Error) => sLogger.err(err))
        s.conn.once("upgrade", () => {
            sLogger.log(`protocol upgrade from ${protocol} to ${s.conn.transport.name}`)
        })

        s.on("disconnect", (reason: any) => sLogger.log(`disconnected ${reason.toString()}`))
        s.on("getMaze", (nbCols: number, nbRows: number) => {
            sLogger.log(`UI ready to display a maze`)
            if(maze === null){
                maze = new Maze(nbCols, nbRows)
                maze.generate(10, () => s.emit("getMaze", false , maze!.toJSON()))
            }
            s.emit("getMaze", true, maze.toJSON())
        })
    })

    httpServer.listen(httpPort, () => logger.log(`HTTP service listen on port ${httpPort}`))

    const remoteWorkers: {[id :string]: IRemoteWorker} = {}
    cluster.on("online", (worker : Worker) => {
        const workerId = `IPC${worker.id}`
        remoteWorkers[workerId] = new RemoteIPCWorker(new Logger(workerId), worker)
        remoteWorkers[workerId].listen()
        remoteWorkers[workerId].subscribe("health", (data: TJSON) => {
            const retHealthMessage = messageFromJSON(data)as IResult<IBaseMessage & THealthMessage>
            if(retHealthMessage.isFailure){
                logger.log(retHealthMessage.error!.message)
                return
            }
            remoteWorkers[workerId].setHealth(retHealthMessage.value!)
        })
            worker.on("disconnect", () => delete remoteWorkers[workerId])
            logger.log(`remote local worker ${workerId} is online`)
            setTimeout(() => remoteWorkers[workerId].stop(), 10000)

        })
        logger.log("launch a local worker")
        cluster.fork()
   

    logger.log(JSON.stringify(configArgs(mode, httpPort, tcpPort)));
    workerFunction("worker", httpPort, "2")
}