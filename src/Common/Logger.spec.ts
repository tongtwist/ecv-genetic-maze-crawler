export interface ILogger {
    readonly prefix:string
    log(msg:string):void
    err(msg:string | Error):void
}