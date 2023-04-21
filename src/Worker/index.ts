import {cpus} from "node:os"
import cluster from "node:cluster"
import { ILogger, Logger } from "../Common"
import type { IRemoteServer } from "./RemoteServer.spec"
import { HealthEmitter } from "./HealthEmitter"
import { WorkerLogic } from "./WorkerLogic"

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

function setupWorkerLogger(cfg: TWorkerConfig): [ILogger, boolean] {
	const isLocalWorker = cfg.serverAddr === "" && cfg.serverPort === -1
	const appLogger = Logger.create(isLocalWorker ? "(Local Worker)" : "(Remote Worker)")
	const workerKindLabel = isLocalWorker ? `local worker (id: ${cluster.worker!.id})` : `remote worker`
	appLogger.log(`-> Run as a ${workerKindLabel} with the following configuration: ${JSON.stringify(cfg)}`)
	return [appLogger, isLocalWorker]
}

async function setupRemoteServer(cfg: TWorkerConfig, isLocalWorker: boolean): Promise<IRemoteServer> {
	const serverLogger = Logger.create(isLocalWorker ? "(Local Worker #REMOTE-SRV) " : "(Remote Worker #REMOTE-SRV) ")
	const { RemoteServer } = await require(isLocalWorker ? "./RemoteIPCServer" : "./RemoteTCPServer")
	const remoteServer: IRemoteServer = new RemoteServer(serverLogger, cfg.serverAddr, cfg.serverPort)
	const connected = await remoteServer.connect()
	if (!connected) {
		serverLogger.err(`Could not connect to the server. Exiting...`)
		process.exit(1)
	}
	return remoteServer
}

function setupHealthEmitter(remoteServer: IRemoteServer, appLogger: ILogger): () => void {
	const healthEmitter = new HealthEmitter(remoteServer, appLogger)
	return healthEmitter.start(10000)
}

export async function processBehavior(cfg: TWorkerConfig) {
	const [appLogger, isLocalWorker] = setupWorkerLogger(cfg)
	const remoteServer = await setupRemoteServer(cfg, isLocalWorker)
	const stopHealthEmitter = setupHealthEmitter(remoteServer, appLogger)
	const workerLogic = new WorkerLogic(isLocalWorker, cfg.nbThreads, remoteServer, stopHealthEmitter, appLogger)
	workerLogic.start()
}