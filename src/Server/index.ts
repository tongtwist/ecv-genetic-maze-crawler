import process from "node:process"
import cluster, {Worker} from "node:cluster"
import {Socket, createServer, Server as SocketServer} from "node:net"
import { ILogger, Logger } from "../Common"
import { RemoteIPCWorker } from "./RemoteIPCWorker"
import { RemoteTCPWorker } from "./RemoteTCPWorker"
import { setupWebServices } from "./WebServices"
import { ServerLogic } from "./ServerLogic"

export type TServerConfig = {
	readonly httpPort: number
	readonly tcpPort: number
}
export const defaultConfig: TServerConfig = {
	httpPort: 8090,
	tcpPort: 5555
} as const

function setupAppLogger(cfg: TServerConfig): ILogger {
	const logger = Logger.create("(Server)")
	logger.log(`-> Run as a server with the following configuration: ${JSON.stringify(cfg)}`)
	return logger
}

function setupProcess(serverLogic: ServerLogic, logger: ILogger) {
	let exitHandling = false
	async function stopServer(exitCode?: number): Promise<void> {
		if (!exitHandling) {
			exitHandling = true
			logger.log("Server is stopping, stop all remote workers ...")
			await serverLogic.stopAllWorkers()
			logger.log("Server stopped")
		}
		setTimeout(() => process.exit(exitCode ?? 0), 0)
	}
	process.on("SIGINT", stopServer)
	process.on("exit", stopServer)
	cluster.on("online", (worker: Worker) => {
		const workerID = `IPC${worker.id}`
		serverLogic.setWorker(workerID, new RemoteIPCWorker(Logger.create(`(Server #${workerID}) `), worker))
		worker.on("disconnect", () => serverLogic.deleteWorker(workerID))
	})
	logger.log("Launch a local worker")
	cluster.fork()
}

function startTCPService(cfg: TServerConfig, logger: ILogger, serverTCPSocket: SocketServer) {
	logger.log(`TCP service listening on port ${cfg.tcpPort}...`)
	serverTCPSocket.listen(cfg.tcpPort)
}

export function processBehavior(cfg: TServerConfig) {
	const logger = setupAppLogger(cfg)
	const logic = new ServerLogic(logger)
	const startWebService = setupWebServices(cfg, logic.socketIOMessageHandlers, logger)
	setupProcess(logic, logger)
	startWebService(logic)
	startTCPService(cfg, logger, createServer({
		noDelay: true,
		keepAlive: true,
		keepAliveInitialDelay: 1000,
	}, (socket: Socket) => {
		const workerID = `TCP://${socket.remoteAddress}:${socket.remotePort}`
		logic.setWorker(workerID, new RemoteTCPWorker(Logger.create(`(Server #${workerID}) `), socket))
		socket.on("close", () => logic.deleteWorker(workerID))
	}))
}
