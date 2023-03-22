import { Logger } from "../Common/Logger"
import { configArgs } from "../configArgs";

export const workerFunction =(mode: string, serverSocket: string, nbThread: string) => {
    const logger = new Logger("worker")

    logger.log("Run as a worker  ...")
    logger.log(JSON.stringify(configArgs(mode, serverSocket, nbThread)));
    
}