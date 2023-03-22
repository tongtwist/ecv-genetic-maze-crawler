import { ShellLogger } from './../Common/Logger';

export type TServerConfig = {
    readonly nbThreads:number
    readonly serverAddr?:string
    readonly serverPort?:number
}

export function server(cfg:TServerConfig){
    
    const serveLogger = new ShellLogger
    const resultat = "Run as a server with config:" + JSON.stringify(cfg)
    serveLogger.log(resultat)
}