import ShellLogger from "../Common/Logger";
import express from "express";
import http from "http";
import {DisconnectReason, Server as SockerIOServer} from "socket.io";
import path from "path";
import {Socket as SocketIO} from "socket.io/dist/socket";
import type {IMaze} from "./Maze.spec";
import {Maze} from "./Maze";



export default function startServer(httpPort: number, tcpPort: number) {
    let maze : IMaze | null = null;

    const expressApp = express();
    const httpServer = http.createServer(expressApp);
    const socketI0 = new SockerIOServer(httpServer);
    const PublicPath = path.join(process.cwd(), 'public');
    expressApp.use("/p/", express.static(PublicPath));

    socketI0.on('connection', (s: SocketIO) => {
        let protocol = s.conn.transport.name;
        const logger = new ShellLogger(`[Socket WS:${s.id}]`);
        logger.log(`connection using ${protocol}`);
        s.on('err', (err:Error) => {
            logger.error(err);
        });
        s.on('disconnect', (reason:DisconnectReason) => {
            logger.log(`connection closed: ${reason}`);
        });
        s.on("getMaze",(nbCols:number,nbRows:number)=>{
            logger.log(`getMaze ${nbCols} ${nbRows}`);
            if (maze === null){
                maze = new Maze(nbCols,nbRows);
                maze.generate(10,()=> s.emit("getMaze",false,maze!.toJSON()));
            }
            s.emit("getMaze",true,maze.toJSON());
        })
    });

    const Log = new ShellLogger('SERVER', true);
    Log.log(`Starting server on httpPort:${httpPort} and tcpPort:${tcpPort}`);

    const ServerLog = new ShellLogger('log Server', true);
    httpServer.listen(httpPort, () => {
        ServerLog.log("Server is up on port " + httpPort);
    });
}