// import { ILogger } from "./Logger.spec";

// export abstract class Logger implements ILogger {
//     public readonly _prefix: string;

//     public constructor(prefix: string) {
//         this._prefix = prefix;
//     }
//     get prefix(): string { return this._prefix }

//     protected abstract _buildLog(msg: string): string
//     protected abstract _buildErr(msg: string | Error): string

//     public log(msg: string): void {
//         console.log(`${this.prefix} ${msg}`);
//     }
//     public err(msg: string | Error): void {
//         console.error(`${this.prefix} ${msg}`);
//     }
// }