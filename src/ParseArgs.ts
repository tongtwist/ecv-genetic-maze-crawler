export default function parseArgs(argv: string[]) {
    var parseArgs = process.argv.slice(2);

    if (parseArgs.length == 0) {
        console.log("No arguments passed.");
        return null;
    }

    const options: Toption = {
        mode: 'server',
        httpPort: 80,
        tcpPort: 3000,
    };

    if (parseArgs.length >= 1) {
        options.mode = parseArgs[0] as 'server' | 'worker';
    }

    if (parseArgs.length >= 2) {
        options.httpPort = parseInt(parseArgs[1]);
    }

    if (parseArgs.length >= 3) {
        options.tcpPort = parseInt(parseArgs[2]);
    }

    return options;
}
export interface Toption {
    mode: 'server' | 'worker';
    httpPort: number;
    tcpPort: number;
}