export interface ILogger {
  readonly prefix: string;
  log(msg: string): void;
  error(msg: string | Error): void;
}
