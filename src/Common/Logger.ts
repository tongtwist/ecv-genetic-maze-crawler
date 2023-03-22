interface LoggerInterface {
  readonly prefix: string | undefined;
  log(msg: string): void;
  error(msg: string | Error): void;
}

export class ShellLogger implements LoggerInterface {
  private static readonly prefix: string = "Logger";
  protected _colorsCodes = [
    "\x1b[33m",
    "\x1b[34m",
    "\x1b[35m",
    "\x1b[36m",
    "\x1b[37m",
    "\x1b[31m",
    "\x1b[32m",
  ];
  protected readonly _logHeader: string;
  protected readonly _logFooter: string;

  constructor(
    private readonly _prefix?: string,
    private readonly _colored: boolean = true
  ) {
    this._logHeader = `${
      _colored ? `${this._colorsCodes[Math.floor(Math.random() * 7)]}` : ""
    }`;
    this._logFooter = `${_colored ? `\x1b[0m` : ""}`;
    Object.freeze(this);
  }

  get prefix(): string {
    return this._prefix ?? "";
  }

  _buildMessage(msg: string): string {
    return `${this.prefix}: ${msg}`;
  }

  public log(msg: string): void {
    console.log(
      `${this._logHeader}${this._buildMessage(msg)} ${this._logFooter}`
    );
  }

  public error(msg: string | Error): void {
    const content = this._buildMessage(
      typeof msg === "string" ? msg : msg.message
    );
    console.error(content);
  }
}
