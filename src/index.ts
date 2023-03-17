import parseArgs, {Toption} from './ParseArgs';
import cluster from 'cluster';
import os from 'os';
import http from 'http';

export function startServer(httpPort: number, tcpPort: number) {
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello, World!\n');
    });

    server.listen(httpPort, () => {
        console.log(`HTTP server listening on port ${httpPort}`);
    });

    const net = require('net');
    const tcpServer = net.createServer();

    tcpServer.on('connection', (socket: any) => {
        console.log('Client connected');

        socket.on('data', (data: any) => {
            console.log(`Received data from client: ${data.toString()}`);
        });

        socket.on('end', () => {
            console.log('Client disconnected');
        });

        socket.write('Welcome to the TCP server!\n');
    });

    tcpServer.listen(tcpPort, () => {
        console.log(`TCP server listening on port ${tcpPort}`);
    });
}
export function startWorker(serverSocket: string, numThreads: number) {
    if (cluster.isMaster) {
        for (let i = 0; i < numThreads; i++) {
            const worker = cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died`);
        });
    } else {
        const net = require('net');
        const client = net.connect({ path: serverSocket });

        client.on('connect', () => {
            console.log(`Worker ${process.pid} connected to server`);
        });

        client.on('data', (data: any) => {
            console.log(`Worker ${process.pid} received data: ${data.toString()}`);
        });

        client.on('end', () => {
            console.log(`Worker ${process.pid} disconnected from server`);
        });
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