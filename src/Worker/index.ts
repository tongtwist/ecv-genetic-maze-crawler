export type TWorkerConfig = {
	readonly nbThreads: number
	readonly serverAddr?: string
	readonly serverPort?: number
}

export function worker(cfg: TWorkerConfig) {
	console.log("Run as a worker with config:", JSON.stringify(cfg))

	
}