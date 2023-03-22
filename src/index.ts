import parseArgs, {Toption} from './ParseArgs';
import ShellLogger from "./Common/Logger";

function startServer(httpPort: number, tcpPort: number) {
    const logger = new ShellLogger('SERVER', true);
    logger.log(`Starting server on httpPort:${httpPort} and tcpPort:${tcpPort}`);
}

function startWorker(serverSocket: string, numThreads: number) {
    const logger = new ShellLogger('WORKER', true);
    for (let i = 0; i < numThreads; i++) {
        logger.log(`Starting worker ${i} with serverSocket: ${serverSocket}`);
    }
}

async function main() {
    const options: Toption | null = parseArgs(process.argv);

    if (!options) {
        console.error('Unexpected arguments');
        process.exit(1);
    }

    console.log(options);

    if (options.mode === 'server') {
        startServer(options.httpPort,options.tcpPort)
        console.log('Running as Server');
    } else {
        startWorker(options.serverSoket,options.nbThread)
        console.log('Running as worker');
    }
}

main();
