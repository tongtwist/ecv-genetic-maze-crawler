import {TOptions, parseArgs} from "./parseArgs"

/*
//TOptions
type ParseArgsResult =  {
    mode: "server",
    httpPort: 8090,
    tcpPort: 5555
} | {
    mode: "worker",
    httpPort: "127.0.0.1:5555",
    tcpPort: 12
}
*/

async function main() {
    const options: TOptions | false = parseArgs(process.argv)
    console.log("config:", options)
    if (!options) {
        console.error(`Unexpected argument(s): ${process.argv.slice(2).join(" ")}`)
        process.exit(-1)
    }

    if (options.mode === "server") {
        console.log("Run as a server")
    } else {
        console.log("Run as a worker")
    }
}

main()
