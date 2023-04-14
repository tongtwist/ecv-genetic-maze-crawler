import { Socket } from "node:net";
import { TJSON, ILogger } from "../Common";
import { BaseRemoteWorker } from "./BaseRemoteWorker";

export class RemoteTCPWorker extends BaseRemoteWorker {
  constructor(
    protected readonly _logger: ILogger,
    private readonly _socket: Socket
  ) {
    super(_logger);
  }

  listen(): void {
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
