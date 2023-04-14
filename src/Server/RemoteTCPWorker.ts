import { ILogger, TJSON } from "../Common";
import { BaseRemoteWorker } from "./BaseRemoteWorker";
import { IRemoteWorker } from "./RemoteWorker.spec";
import { AddressInfo, Socket } from "net";

export class RemoteTCPWorker extends BaseRemoteWorker implements IRemoteWorker {
  private readonly _adr: AddressInfo | {};
  private readonly _remoteWorkerLabel: string;

  constructor(readonly _logger: ILogger, private _socket: Socket) {
    super(_logger);
    this._adr = this._socket.address();
    this._remoteWorkerLabel = `TCP Worker ${this._adrToString()}`;
  }
  private _adrToString(): string {
    return "family" in this._adr
      ? `${this._adr.family}://${this._adr.address}:${this._adr.port}`
      : "";
  }

  listen(): Promise<boolean> {
    if (this._connected && !!this._socket) {
      return Promise.resolve(true);
    }
    this._cleanState();
    return new Promise((resolve: (v: boolean) => void) => {
      const timeout = 5000;
      this._socket.on("close", () => {
        this._logger.log(`Disconnected from ${this._remoteWorkerLabel}`);
        this._cleanState();
      });
      this._socket.on("connect", () => {
        this._logger.log(`Ready to work with ${this._remoteWorkerLabel}`);
        this._connected = true;
        resolve(true);
      });
      this._socket.on("error", (err: Error) => {
        this._logger.log(
          `Error when connecting to ${this._remoteWorkerLabel}: ${err}`
        );
        this._cleanState();
      });
      this._socket.on("data", (data: Buffer) => {
        try {
          const json = JSON.parse(data.toString());
          this._messageHandler(json);
        } catch (err) {
          this._logger.log(
            `Error when parsing data from ${this._remoteWorkerLabel}: ${err}`
          );
        }
      });
      this._socket.on("timeout", () => {
        this._logger.log(
          `Connection timeout. It takes more than ${timeout}ms to connect`
        );
        this._cleanState();
      });
    });
  }

  send(data: TJSON): Promise<boolean> {
    if (!this._socket) {
      this._cleanState();
      return Promise.resolve(false);
    }
    return new Promise((resolve: (v: boolean) => void) => {
      this._socket!.write(JSON.stringify(data), "utf8", (err?: Error) => {
        if (err) {
          this._logger.log(`Error when emitting data to the Worker: ${err}`);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
  stop(): void {
    this._socket && this._socket.end();
  }
}
