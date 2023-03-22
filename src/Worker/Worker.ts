import ShellLogger from "../Common/Logger";

export default function startWorker(serverSocket: string, numThreads: number) {
    const logger = new ShellLogger('WORKER', true);
    for (let i = 0; i < numThreads; i++) {
        logger.log(`Starting worker ${i} with serverSocket: ${serverSocket}`);
    }
}