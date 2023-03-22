import { Logger } from "../Common/Logger"
import { configArgs } from "../configArgs";
import { workerFunction } from "../Worker/worker";

export const serverFunction =(mode: string, httpPort: string, tcpPort: string) => {
    const logger = new Logger("server")

    logger.log("Run as a server  ...")

    logger.log(JSON.stringify(configArgs(mode, httpPort, tcpPort)));
    workerFunction("worker", httpPort, "2")
}