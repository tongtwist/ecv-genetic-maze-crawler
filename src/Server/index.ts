import { TServerOptions } from "../parseArgs";
import { Logger } from "../Common/Logger";
import {
  DisconnectReason,
  Server as SocketIOServer,
  Socket as SocketIO,
} from "socket.io";
import express from "express";
import path from "path";
import http from "http";
import { Maze } from "./Maze";
import { IMaze } from "./Maze.spec";

export function server(options: TServerOptions) {
  let maze: IMaze | null = null;
  const httpLogger = new Logger("HTTP");
  const socketIOLogger = new Logger("SocketIO");

  httpLogger.log("Run as server on HTTP serving static files from public");

  const expressApp = express();
  const httpServer = http.createServer(expressApp);

  const socketIo = new SocketIOServer(httpServer);

  const publicPath = path.join(process.cwd(), "public");
  expressApp.use("/p/", express.static(publicPath));

  httpServer.listen(options.httpPort, () => {
    httpLogger.log(`Server is listening on port ${options.httpPort}`);
  });

  socketIo.on("connection", (socket: SocketIO) => {
    socketIOLogger.log(`Client connected: ${socket.id}`);

    let protocol = socket.conn.transport.name;
    const clientLogger = new Logger(`SocketIO/${socket.id}`);

    clientLogger.log(`Client protocol: ${protocol}`);

    socket.on("error", (error: Error) => clientLogger.error(error));

    socket.conn.once("upgrade", () => {
      protocol = socket.conn.transport.name;
      clientLogger.log(`Client protocol upgrade: ${protocol}`);
    });

    socket.on("disconnect", (reason: DisconnectReason) => {
      clientLogger.log(`Client disconnected: ${reason}`);
    });

    socket.on("getMaze", (nbCols: number, nbRows: number) => {
      clientLogger.log(`Client requested a maze of ${nbCols}x${nbRows}`);

      if (maze === null) {
        maze = new Maze(nbCols, nbRows);
        maze.generate(10, () => socket.emit("getMaze", false, maze?.toJSON()));
      }

      socket.emit("getMaze", true, maze.toJSON());
    });
  });
}
