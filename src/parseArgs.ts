export default function parseArgs(argv: string[]) {
    var parseArgs = process.argv.slice(2);

    if (parseArgs.length == 0) {
        console.log("No arguments passed.");
        return null;
    }

    let options: Toption;

    if (parseArgs[0] === "server") {
        options = {
            mode: 'server',
            httpPort: 80,
            tcpPort: 3000,
        };

        if (parseArgs.length >= 2) {
            options.httpPort = parseInt(parseArgs[1], 10);
        }

        if (parseArgs.length >= 3) {
            options.tcpPort = parseInt(parseArgs[2], 10);
        }
    } else if (parseArgs[0] === "worker") {
        options = {
            mode: 'worker',
            serverSoket: "",
            nbThread: 1,
        };

        if (parseArgs.length >= 2) {
            options.serverSoket = parseArgs[1];
        }

        if (parseArgs.length >= 3) {
            options.nbThread = parseInt(parseArgs[2], 10);
        }
    } else {
        console.log(`Unknown mode: ${parseArgs[0]}`);
        return null;
    }

    return options;
}

export type Toption =
    | {
    mode: 'server';
    httpPort: number;
    tcpPort: number;
}
    | {
    mode: 'worker';
    serverSoket: string;
    nbThread: number;
};