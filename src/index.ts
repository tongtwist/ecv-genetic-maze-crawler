import parseArgs, {Toption} from './ParseArgs';
import startServer from './Server';
import startWorker from './Worker';
import cluster from "cluster";
async function main() {
    const options: Toption | null = parseArgs(process.argv);

    if (!options) {
        console.error('Unexpected arguments');
        process.exit(1);
    }

    if (options.mode === 'server' && cluster.isPrimary) {
        startServer(options.httpPort,options.tcpPort)
        cluster.fork();
    } else if (options.mode === 'worker' || cluster.isWorker){
        if (options.mode === 'worker' ){
            startWorker(options.serverSoket,options.nbThread)
            console.log('Running as worker');
        } else {
            console.log('Running as cluster worker');
        }
    }
}

main();
