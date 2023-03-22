import express from "express";
import path from "node:path";
import http from "node:http";
import {
  Server as SocketIOServer,
  DisconnectReason,
  Socket as SocketIO,
} from "socket.io";
import { ShellLogger } from "../Common/Logger";
import { TServerOptions } from "../parseArgs";
import { Maze } from "./Maze";
import { IMaze } from "./Maze.spec";

export function server(options: TServerOptions) {
  let maze: IMaze | null = null;
  const appLogger = new ShellLogger("[SERVER]");
  appLogger.log("Run as server on HTTP port " + options.httpPort);

  const expressApp = express();
  const httpServer = http.createServer(expressApp);
  const socketIO = new SocketIOServer(httpServer);
  const publicPath = path.join(process.cwd(), "public");
  expressApp.use("/p/", express.static(publicPath));

  socketIO.on("connection", (socket: SocketIO) => {
    let protocol = socket.conn.transport.name;
    const sLogger = new ShellLogger(`[SOCKET WS:${socket.id}]`);
    sLogger.log(`Connection using "${protocol}" protocol`);
    socket.on("err", (err: Error) => {
      sLogger.error(err);
    });
    socket.on("disconnect", (reason: DisconnectReason) => {
      sLogger.log(`Connection closed: ${reason}`);
    });

    socket.on("getMaze", (nbCols: number, nbRows: number) => {
      sLogger.log(
        `UI ready to display a maze with these parameters : nbCols:${nbCols} & nbRows:${nbRows}`
      );
      if (maze === null) {
        maze = new Maze(nbCols, nbRows);
        maze.generate(10, () => socket.emit("getMaze", false, maze!.toJSON()));
      }
      socket.emit("getMaze", true, maze.toJSON());
    });
  });

  httpServer.listen(options.httpPort, () => {
    const serverLogger = new ShellLogger("[SERVER]");
    serverLogger.log(`Server listening on port ${options.httpPort}`);
  });
}
