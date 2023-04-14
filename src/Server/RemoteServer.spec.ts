import type { TMessageType, TJSON } from "../Common";

export interface IRemoteServer {
  connect(): Promise<boolean>;
  close(): void;
  send(data: TJSON): Promise<boolean>;
  subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean;
}
