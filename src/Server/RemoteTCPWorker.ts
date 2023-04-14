import { Socket } from "node:net"
import {
    TJSON,
    ILogger,
} from "../Common";
import { BaseRemoteWorker } from "./BaseRemoteWorker"
import type { IRemoteWorker } from "./RemoteWorker.spec";

export class RemoteTCPWorker extends BaseRemoteWorker implements IRemoteWorker {
    constructor(
        readonly _logger: ILogger,
        private readonly _socket: Socket
    ) {
      super(_logger)
      // this._adr = this._socket.address();
  		// this._remoteWorkerLabel = `IPC Worker ${_worker.id}`
    }


    listen() {
        this._socket!.on("data", this._messageHandler.bind(this));
        this._listening = true;
        this._logger.log(`Listening TCP Worker ...`);
    }

    async send(data: TJSON): Promise<boolean> {
        return new Promise((resolve, reject) => {
          if (!this._socket || !this._listening) {
            resolve(false);
          } else {
            this._socket.write(JSON.stringify(data), (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(true);
              }
            });
          }
        });
      }
}