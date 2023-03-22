import parseArgs, {Toption} from './ParseArgs';
import startServer from './Server';
import startWorker from './Worker';
async function main() {
    const options: Toption | null = parseArgs(process.argv);

    if (!options) {
        console.error('Unexpected arguments');
        process.exit(1);
    }

    if (options.mode === 'server') {
        startServer(options.httpPort,options.tcpPort)
    } else {
        startWorker(options.serverSoket,options.nbThread)
        console.log('Running as worker');
    }
}

main();
