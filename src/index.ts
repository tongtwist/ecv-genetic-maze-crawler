import parseArgs, {Toption} from './ParseArgs';
import startServer from './Server/Server';
import startWorker from './Worker/Worker';
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
