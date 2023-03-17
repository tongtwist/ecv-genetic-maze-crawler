export type TOptions = {
    mode: "server" | "worker";
    httpPort?: number;
    tcpPort?: number;
    serverSocket?: string;
    nbThreads?: number;
};

export function parseArgs(args: string[]): TOptions {

    if (args[2] === "server") {
        /*     
        mode: "server",
        httpPort: 8090,
        tcpPort: 5555
        */
        let httpPort = parseInt(args[3]); 
        let tcpPort = parseInt(args[4]);

        return { mode: "server", httpPort, tcpPort }
    } else {
        /*     
        mode: "worker",
        serverSocket: "127.0.0.1:5555",
        nbThreads: 12
        */
        let serverSocket = args[5];
        let nbThreads = parseInt(args[6]);

        return { mode: "worker", serverSocket, nbThreads }
    }
}

