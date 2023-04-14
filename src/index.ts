import * as process from "node:process"
import cluster from "node:cluster"
import type {IResult} from "./Common"
import {TOptions, parseArgs, TWorkerOptions} from "./ParseArgs"
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
main()