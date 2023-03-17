export type TOption = {
    mode: "server" | "worker",
    httpPort?: number,
    tcpPort?: number,
    serverSocket?: string,
    nbThreads?: number
};

export function parseArgs(args: string[]): TOption | false {
    if (args.length < 3) {
        return false;
    }

    const mode = args[2];

    if (mode === "server") {
        const httpPort = args[3] ? parseInt(args[3]) : 8090;
        const tcpPort = args[4] ? parseInt(args[4]) : 5555;
        return {
            mode,
            httpPort,
            tcpPort
        };
    } else if (mode === "worker") {
        const serverSocket = args[3] ? args[3] : "127.0.0.1:5555";
        const nbThreads = args[4] ? parseInt(args[4]) : 12;
        return {
            mode,
            serverSocket,
            nbThreads
        };
    } else {
        return false;
    }
}