import parseArgs, {Toption} from './ParseArgs';

function startServer(httpPort: number, tcpPort: number) {
    console.log("serveur" + httpPort + "et" + tcpPort);
}

function startWorker(serverSocket: string, numThreads: number) {
    for (let i = 0; i < numThreads; i++) {
        console.log("worker"+i);
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
        console.log('Running as server');
    } else {
        startWorker(options.serverSoket,options.nbThread)
        console.log('Running as worker');
    }
}

main();
