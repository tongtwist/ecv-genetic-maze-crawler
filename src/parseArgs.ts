export type TOptions =
  | {
      mode: string;
      httpPort: number;
      tcpPort: number;
    }
  | {
      mode: string;
      serverSocket: string;
      nbThreads: number;
    };

export type TServerOptions = {
  mode: string;
  httpPort: number;
  tcpPort: number;
};

export type TWorkerOptions = {
  mode: string;
  nbThreads: number;
  serverSocket: string;
};

export default function parseArgs(args: string[]): TOptions | false {
  const mode = args[2] ?? null;
  if (args.length < 3 || (mode !== "server" && mode !== "worker")) {
    return false;
  }
  if (mode === "server") {
    return parseServerArgs(args.slice(3));
  } else {
    return parseWorkerArgs(args.slice(3));
  }
}

function parseServerArgs(args: string[]): TServerOptions {
  let httpPort = parseInt(args[0]);
  let tcpPort = parseInt(args[1]);
  if (isNaN(httpPort)) {
    httpPort = 8080;
  }
  if (isNaN(tcpPort)) {
    tcpPort = 5555;
  }
  return { httpPort, tcpPort, mode: "server" };
}

function parseWorkerArgs(args: string[]): TWorkerOptions | false {
  if (args.length < 2) {
    return false;
  }
  const nbThreads = parseInt(args[1]);
  const serverSocket = args[0].toString();
  return { nbThreads, serverSocket, mode: "worker" };
}