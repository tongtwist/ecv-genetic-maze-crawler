import {cpus} from "node:os"
import cluster from "node:cluster"
import { clearInterval, setInterval } from "node:timers"
import {Logger} from "../Common"
import type { IRemoteServer } from "./RemoteServer.spec"
import { HealthEmitter } from "./HealthEmitter"


export type TWorkerConfig = {
	readonly nbThreads: number
	readonly serverAddr: string
	readonly serverPort: number
}

export const defaultConfig: TWorkerConfig = {
	nbThreads: Math.max(1, Math.min(3, cpus().length - 1)),
	serverAddr: "127.0.0.1",
	serverPort: 5555
}

export async function processBehavior(cfg: TWorkerConfig) {
	const appLogger = Logger.create()
	const localWorker = cfg.serverAddr === "" && cfg.serverPort === -1
	const startLog = localWorker
		? `-> Run as a local worker (id: ${cluster.worker!.id}) with the following configuration: ${JSON.stringify(cfg)}`
		: `-> Run as a remote worker with the following configuration: ${JSON.stringify(cfg)}`
	appLogger.log(startLog)

	const serverLogger = Logger.create("SRV")
	const { RemoteServer } = await require(localWorker ? "./RemoteIPCServer" : "./RemoteTCPServer")
	const remoteServer: IRemoteServer = new RemoteServer(serverLogger, cfg.serverAddr, cfg.serverPort)
	
	const connected = await remoteServer.connect()
	if (!connected) {
		serverLogger.err(`Could not connect to the server. Exiting...`)
		process.exit(1)
	}

	/*const healthEmitter = new HealthEmitter()
	let emitExpandedHealth = true
	const healthInterval = setInterval(async () => {
		emitExpandedHealth = !(await healthEmitter.emit(remoteServer, emitExpandedHealth))
	}, 10000*/

	remoteServer.subscribe("stop", () => {
		//clearInterval(healthInterval)
		appLogger.log("Stopped")
		process.exit(0)
	})

	// setInterval(() =>appLogger.log("coucou"), 5000 )
}