
    export type TOptions =
    | {
          mode: string
          httpPort: number
          tcpPort: number
      }
    | {
          mode: string
          serverAddr: string
          serverPort: number
          nbThreads: number
      }

export function parseArgs(args: string[]) {
    args = args.slice(2)

    if (args.length > 0) {
        return args[0] === 'server'
            ? parseServerArgs(args)
            : parseWorkerArgs(args)
    } else {
        return false
    }
}

function parseServerArgs(args: string[]) {
    const httpPort = args[1] ?? '8090'
    const tcpPort = args[2] ?? '5555'

    const options: TOptions = {
        mode: args[0],
        httpPort: parseInt(httpPort),
        tcpPort: parseInt(tcpPort),
    }

    return options
}

function parseWorkerArgs(args: string[]) {
    const serverPort = args[2] ?? '5555'
    const nbThreads = args[3] ?? '12'

    const options: TOptions = {
        mode: args[0],
        serverAddr: args[1] ?? '127.0.0.1:5555',
        serverPort: parseInt(serverPort),
        nbThreads: parseInt(nbThreads),
    }

    return options
}