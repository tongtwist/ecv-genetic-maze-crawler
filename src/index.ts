import { TOption, parseArgs } from "./parseArgs";

// type ParseArgsResult = {
//     mode: "server",
//     httpPort: 8090,
//     tcpPort: 5555
// } | {
//     mode: "worker",
//     serverSocket: "127.0.0.1:5555",
//     nbThreads: 12
// }

async function main() {
    const options: TOption | false = parseArgs(process.argv)

    
    if (!options) {
        console.error(`unexpected arguments : ${process.argv.slice(2).join(" ")}`)
        process.exit(-1)
    }
    
    console.log(options)
    
    if (options.mode === "server") {
        console.log("Run a server")
    } else {
        console.log("Run a worker")
    }
}

main()
