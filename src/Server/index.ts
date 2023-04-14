import path from "node:path";
import http from "node:http";
import process from "node:process";
import cluster, { Worker } from "node:cluster";
import { Socket, createServer } from "node:net";
import express from "express";
import {
  DisconnectReason,
  Server as SocketIOServer,
  Socket as SocketIO,
} from "socket.io";
import type { IMaze } from "./Maze.spec";

import {
  IResult,
  TJSON,
  messageFromJSON,
  Logger,
  IBaseMessage,
  THealthMessage,
} from "../Common";
import type { IRemoteWorker } from "./RemoteWorker.spec";
import { RemoteIPCWorker } from "./RemoteIPCWorker";
import { RemoteTCPWorker } from "./RemoteTCPWorker";
import { Maze } from "./Maze";

export type TServerConfig = {
  readonly httpPort: number;
  readonly tcpPort: number;
};
export const defaultConfig: TServerConfig = {
  httpPort: 8090,
  tcpPort: 5555,
} as const;

export function processBehavior(cfg: TServerConfig) {
  let maze: IMaze | null = null;

  const appLogger = Logger.create();
  appLogger.log(
    `-> Run as a server with the following configuration: ${JSON.stringify(
      cfg
    )}`
  );

  const expressApp = express();
  const httpServer = http.createServer(expressApp);
  const socketIO = new SocketIOServer(httpServer);
  const publicPath = path.join(process.cwd(), "public");

  appLogger.log(`HTTP service will serve static files from "${publicPath}"`);
  expressApp.use("/p/", express.static(publicPath));

  socketIO.on("connection", (s: SocketIO) => {
    let protocol = s.conn.transport.name;
    const sLogger = Logger.create(`WS:${s.id}`);
    sLogger.log(`Connection using "${protocol}" protocol`);
    s.on("error", (err: Error) => sLogger.err(err));
    s.conn.once("upgrade", () => {
      sLogger.log(
        `protocol upgrade from "${protocol}" to "${s.conn.transport.name}"`
      );
      protocol = s.conn.transport.name;
    });
    s.on("disconnect", (reason: DisconnectReason) =>
      sLogger.log(`disconnected (${reason.toString()})`)
    );
    s.on("getMaze", (nbCols: number, nbRows: number) => {
      sLogger.log(
        `UI ready to display a maze with these parameters: nbCols:${nbCols}, nbRows:${nbRows}`
      );
      if (maze === null) {
        maze = new Maze(nbCols, nbRows);
        maze.generate(10, () => s.emit("getMaze", false, maze!.toJSON()));
      }
      s.emit("getMaze", true, maze.toJSON());
    });
  });

  httpServer.listen(cfg.httpPort, () =>
    appLogger.log(`HTTP service listening on port ${cfg.httpPort}...`)
  );

  const remoteWorkers: { [id: string]: IRemoteWorker } = {};
  let exitHandling = false;
  cluster.on("online", (worker: Worker) => {
    const workerID = `IPC${worker.id}`;
    appLogger.log(`Remote local worker "${workerID}" is online`);
    remoteWorkers[workerID] = new RemoteIPCWorker(
      Logger.create(`(from ${workerID}) `),
      worker
    );
    remoteWorkers[workerID].listen();
    remoteWorkers[workerID].subscribe("health", (data: TJSON) => {
      const retHealthMessage = messageFromJSON(data) as IResult<
        IBaseMessage & THealthMessage
      >;
      if (retHealthMessage.isFailure) {
        appLogger.err(retHealthMessage.error!.message);
        return;
      }
      remoteWorkers[workerID].setHealth(retHealthMessage.value!);
      appLogger.log(`Remote worker "${workerID}" is healthy`);
    });
    worker.on("disconnect", () => delete remoteWorkers[workerID]);
  });

  const serverTCPSocket = createServer(
    {
      noDelay: true,
      keepAlive: true,
      keepAliveInitialDelay: 1000,
    },
    (socket: Socket) => {
      const workerID = `TCP://${socket.remoteAddress}:${socket.remotePort}`;
      appLogger.log(`Remote local worker "${workerID}" is online`);
      remoteWorkers[workerID] = new RemoteTCPWorker(
        Logger.create(`(from ${workerID}) `),
        socket
      );
      remoteWorkers[workerID].listen();
      remoteWorkers[workerID].subscribe("health", (data: TJSON) => {
        const retHealthMessage = messageFromJSON(data) as IResult<
          IBaseMessage & THealthMessage
        >;
        if (retHealthMessage.isFailure) {
          appLogger.err(retHealthMessage.error!.message);
          return;
        }
        remoteWorkers[workerID].setHealth(retHealthMessage.value!);
        appLogger.log(`Remote worker "${workerID}" is healthy`);
      });
      socket.on("close", () => delete remoteWorkers[workerID]);
    }
  );

  async function stopServer(exitCode?: number): Promise<void> {
    if (!exitHandling) {
      exitHandling = true;
      appLogger.log("Server is stopping, stop all remote workers ...");
      for (const workerID in remoteWorkers) {
        await remoteWorkers[workerID].stop();
      }
      appLogger.log("Server stopped");
    }
    setTimeout(() => process.exit(exitCode ?? 0), 0);
  }

  process.on("SIGINT", stopServer);
  process.on("exit", stopServer);

  appLogger.log("Launch a local worker");
  cluster.fork();

  appLogger.log(`TCP service listening on port ${cfg.tcpPort}...`);
  serverTCPSocket.listen(cfg.tcpPort);
}
