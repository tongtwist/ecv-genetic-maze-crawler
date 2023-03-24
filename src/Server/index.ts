import { IResult } from './../Common/Result.spec';
import express  from 'express'
import path from 'node:path'
import http from 'node:http'
import cluster,{Worker} from 'node:cluster'
import process from 'node:process'
import {DisconnectReason, Server as SocketIOServer, Socket as SocketIO} from 'socket.io'
import type { IMaze } from "./Maze.spec"
import { Maze } from './Maze'
import { IBaseMessage, ShellLogger } from '../Common'
import { TMessageType, TJSON, messageFromJSON } from '../Common'

export type TServerConfig = {
    readonly nbThreads: number;
    readonly socketServer: string;
    readonly mode: "server";
    readonly httpPort: number;
}

export function server(cfg: TServerConfig)  {
    console.log('Running server', JSON.stringify(cfg))
 
    const appLogger = new ShellLogger('Server')
    let maze: IMaze | null = null
    appLogger.log('Hello world')

    const expressApp = express()
    const httpServer = http.createServer(expressApp)
    const socketIO = new SocketIOServer(httpServer)
    const publicPath = path.join(process.cwd(), 'public')

appLogger.log(`Public path: ${publicPath}`)
expressApp.use("/p/", express.static(publicPath))

socketIO.on('connection', (s: SocketIO) => {
    let protocol = s.conn.transport.name
    const sLogger = new ShellLogger(`WS:${s.id}`)
    sLogger.log(`Connexion using "(${protocol})" protocol`)
    s.on("error", (err:Error) => sLogger.err(err))
    s.conn.once("upgrade", () => {
        protocol = s.conn.transport.name
        sLogger.log(`Protocol upgraded to "${protocol}"`)
    }
    )
    s.on("disconnect",(reason: DisconnectReason)  => sLogger.log(`disconnected (${reason.toString()})`))
    s.on("getMaze", (nbCols: number, nbRows: number) => {
        sLogger.log(`Ui ready nbCols:${nbCols}x nbRows:${nbRows}`)
        if (maze === null) {
            maze = new Maze(nbCols, nbRows)
            maze.generate(10, () => s.emit("getMaze", false, maze!.toJSON()))
        }
        s.emit("getMaze", true, maze.toJSON())
    })
}
)
httpServer.listen(cfg.httpPort, () => 
 appLogger.log(`Server started ${cfg.httpPort}`))

    const remoteWorkers: {[id: string]: IRemoteWorker} = {}
    cluster.on("online" ,(worker: Worker)   => {
        const workerID = `IPC${worker.id}`
        remoteWorkers[workerID] = new RemoteIPCWorker(Logger.create(workerID), worker)
        remoteWorkers[workerID].listen()
        remoteWorkers[workerID].subscribe("health", (data: TJSON) => {
            const retHealthMessage = messageFromJSON(data) as IResult<IBaseMessage & THealthMessage>
            if (retHealthMessage.isFailure) {
                appLogger.err(retHealthMessage.error!.message)
                return
            }
            remoteWorkers[workerID].setHealth(retHealthMessage.value!)
        })
        worker.on("disconnect", () => delete remoteWorkers[workerID])
        appLogger.log(`Remote local worker ${workerID} is online`)
        setTimeout(() => remoteWorkers[workerID].stop(), 1000)
    })
    appLogger.log("Launch a local worker")
    cluster.fork()
}