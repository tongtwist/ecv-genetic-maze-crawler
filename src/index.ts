import * as process from "node:process"
import cluster from "node:cluster"
import {TOptions, parseArgs} from "./parseArgs"

async function main() {
    const options: TOptions | false = parseArgs(process.argv)
	if (!options && cluster.isPrimary) {
		console.error(`Unexpected argument(s): ${process.argv.slice(2).join(" ")}`)
		process.exit(-1)
	}

    if (cluster.isPrimary && (options as TOptions).mode === "server") {
        const {server} = await require("./Server")
        server(options)
    } else if (cluster.isWorker || (options as TOptions).mode === "worker") {
        const {worker} = await require("./Worker")
		worker(cluster.isWorker
            ? {mode: "worker", socketServer: "127.0.0.1:5555", nbThreads: 12}
            : options
        )
    }
}
main()