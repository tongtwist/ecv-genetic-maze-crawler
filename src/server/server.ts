import path from "node:path";
import http from "node:http";
import { DisconnectReason ,Socket as SocketIO, Server as SocketIOServer} from "socket.io";
import express from "express";
import { IMaze } from "./Maze.spec";
import { Maze } from "./Maze";
import { Logger } from "./../common/logger";

export const thisServer = (mode : string, http_port: string, tcp_port:number) => {

        const mylog = new Logger(mode)

        let maze: null | Maze = null;

        mylog.log("Run as a server  ...")
        
        const expressApp = express()
        const httpServer = http.createServer(expressApp);
        const socketIO= new SocketIOServer(httpServer)
        const publicPath = path.join(process.cwd(), "public")
    
        mylog.log(`HTTP service will serve static file from ${publicPath}`)
    
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
    
        httpServer.listen(http_port, () => mylog.log(`HTTP service listen on port ${http_port}`))
        
} 
