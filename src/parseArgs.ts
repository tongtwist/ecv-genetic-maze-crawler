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
        const httpPort = 80090;
        const tcpPort = 5555;
        return {
            mode,
            httpPort,
            tcpPort
        };
    } else if (mode === "worker") {
        const serverSocket = "127.0.0.1:5555";
        const nbThreads = 12;
        return {
            mode,
            serverSocket,
            nbThreads
        };
    } else {
        return false;
    }
}