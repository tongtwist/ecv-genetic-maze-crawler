<<<<<<< HEAD
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

=======
import * as process from "node:process"
import cluster from "node:cluster"
import type {IResult} from "./Common"
import {TOptions, parseArgs, TWorkerOptions} from "./parseArgs"
import {defaultConfig as defaultWorkerConfig} from "./Worker"

async function main() {
	const resArgs: IResult<TOptions> = parseArgs(process.argv)
	if (resArgs.isFailure) {
		console.error(resArgs.error)
		process.exit(-1)
	}
	const options: TOptions = resArgs.value!

	if (cluster.isPrimary && options.mode === "server") {
		const {processBehavior} = await require("./Server")
		processBehavior(options)
	} else if (cluster.isWorker || options.mode === "worker") {
		const {processBehavior} = await require("./Worker")
		const workerOptions: TWorkerOptions = cluster.isWorker
			? {mode: "worker", nbThreads: defaultWorkerConfig.nbThreads, serverAddr: "", serverPort: -1}
			: options as TWorkerOptions
		processBehavior(workerOptions)
	} else {
		console.error("Unable to determine a run mode")
		process.exit(-1)
	}
}
>>>>>>> tongtwist
main()
