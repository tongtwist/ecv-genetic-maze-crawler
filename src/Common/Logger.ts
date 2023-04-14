import { pid } from "node:process";
import type { ILogger } from "./Logger.spec";

export abstract class Logger implements ILogger {
  private static readonly _colorCodes = [
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "90",
    "91",
    "92",
    "93",
    "94",
    "95",
    "96",
  ];
  protected static _nextColorIndex = (pid * 3) % Logger._colorCodes.length;
  protected readonly _logHeader: string;
  protected readonly _colorCode?: string;

  protected constructor(private _prefix: string, colored: boolean = true) {
    if (colored) {
      this._colorCode = Logger._colorCodes[Logger._getColorIndex()];
    }
    const _logPrefix = _prefix.trim();
    this._logHeader = `${colored ? `\x1b[${this._colorCode}m` : ""}${
      _logPrefix === "" ? "" : `${_logPrefix} `
    }`;
  }

  get prefix(): string {
    return this._prefix;
  }

  protected abstract _buildLog(msg: string): string;
  protected abstract _buildErr(msg: string | Error): string;

  public log(msg: string): void {
    const txt = `${this._buildLog(msg)}${
      this._colorCode !== "" ? `\x1b[0m` : ""
    }`;
    console.log(txt);
  }

  public err(msg: string | Error): void {
    const txt = this._buildErr(msg);
    console.error(txt);
  }

  protected _errorToString(err: string | Error): string {
    return typeof err === "string" ? err : `${err.name} (${err.message})`;
  }

  static create(logPrefix: string = "", timestamped: boolean = true): ILogger {
    return timestamped
      ? new TimestampedLogger(logPrefix)
      : new SimpleLogger(logPrefix);
  }

  private static _getColorIndex(): number {
    const ret = Logger._nextColorIndex;
    Logger._nextColorIndex =
      (Logger._nextColorIndex + 1) % Logger._colorCodes.length;
    return ret;
  }
}

class SimpleLogger extends Logger {
  constructor(logPrefix: string, colored: boolean = true) {
    super(`|${pid.toString().padStart(6, "0")}| ${logPrefix}`, colored);
  }

  protected _buildLog(msg: string): string {
    return `${this._logHeader}${msg}`;
  }

  protected _buildErr(msg: string | Error): string {
    return this._errorToString(`${this._logHeader}${msg}`);
  }
}

class TimestampedLogger extends Logger {
  private static _offset: number | null = null;

  constructor(logPrefix: string, colored: boolean = true) {
    super(`|${pid.toString().padStart(6, "0")}| ${logPrefix}`, colored);
    if (TimestampedLogger._offset === null) {
      const dt = new Date();
      dt.setHours(0, 0, 0, 0);
      TimestampedLogger._offset = dt.valueOf();
    }
  }

  private _timestampedText(txt: string): string {
    const timestamp = (Date.now() - (TimestampedLogger._offset || 0)) / 1000;
    return `${timestamp.toFixed(3)} ${txt}`;
  }

  protected _buildLog(msg: string): string {
    return this._timestampedText(`${this._logHeader}${msg}`);
  }

  protected _buildErr(msg: string): string {
    return this._timestampedText(`${this._logHeader}${msg}`);
  }
}
