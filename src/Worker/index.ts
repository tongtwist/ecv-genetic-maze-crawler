import { ShellLogger } from "../Common/Logger"

export type TWorkerConfig = {
    readonly nbThreads:number
    readonly serverAddr?:string
    readonly serverPort?:number
}

export function worker(cfg:TWorkerConfig){
    const workerLogger = new ShellLogger("worker", true)
    const resultat = "Run as a worker with config:" + JSON.stringify(cfg)
    workerLogger.log(resultat)
}