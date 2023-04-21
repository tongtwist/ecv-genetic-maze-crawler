import type { Socket as SocketIO } from "socket.io"
import {
	ILogger,
	IResult,
	TJSON,
	IMaze,
	Maze,
	Generation,
	Solution,
} from "../Common"
import {
	messageFromJSON,
	THealthMessage,
	WorldsStateMessage,
	HealthMessage,
} from "../Message"
import type { IBaseMessage } from "../Message.spec"
import type { IRemoteWorker } from "./RemoteWorker.spec"

export class ServerLogic {
	private _maze: IMaze | null = null
	private _mazeGenerated: boolean = false
	readonly socketIOMessageHandlers: Record<string, (ctx: {s: SocketIO, logger: ILogger}, ...args: any[]) => void>
	private readonly _remoteWorkers: Map<string, IRemoteWorker> = new Map()
	private readonly _workersHavingMaze: Set<string> = new Set()
	private readonly _sio: Set<SocketIO> = new Set()
	private readonly _lastWorldsState: Map<string, Generation[]> = new Map()
	private _lastDrawnTime: number = 0
	private _simulationStarted: boolean = false

	constructor(
		private readonly logger: ILogger,
	) {
		this.socketIOMessageHandlers = {
			"getMaze": (ctx: {s: SocketIO, logger: ILogger}, nbCols: number, nbRows: number) => {
				ctx.logger.log(`UI ready to display a maze with these parameters: nbCols:${nbCols}, nbRows:${nbRows}`)
				if (this._maze === null) {
					this._maze = new Maze(nbCols, nbRows)
					this._maze.generate(10)
					this._mazeGenerated = true
				}
				ctx.s.emit("getMaze", this._mazeGenerated, this._maze.toJSON())
				ctx.logger.log(`Maze generated`)
				this.sendMazeToWorkers()
			},
			"drawn": (ctx: {s: SocketIO, logger: ILogger}) => {
				const now = Date.now()
				if (now - this._lastDrawnTime > 200) {
					setTimeout(() => {
						ctx.logger.log(`UI has drawn the world state`)
						if (this._simulationStarted) {
							this.askSimulation(10)
						}
					}, 200)
				}
				this._lastDrawnTime = now
			},
			"start": (ctx: {s: SocketIO, logger: ILogger}) => {
				if (!this._simulationStarted) {
					ctx.logger.log(`Simulation started`)
					this._simulationStarted = true
					this.askSimulation(10)
				}
			},
		}
	}

	async stopAllWorkers(): Promise<void> {
		for (const worker of this._remoteWorkers.values()) await worker.stop()
	}

	deleteWorker(id: string) {
		return this._remoteWorkers.delete(id)
	}

	sendMazeToWorkers(id?: string) {
		if (this._maze === null || !this._mazeGenerated) {
			return false
		}
		if (id && !this._workersHavingMaze.has(id)) {
			this.logger.log(`Send maze to remote worker "${id}"`)
			this._remoteWorkers.get(id)!.setMaze(this._maze)
			this._workersHavingMaze.add(id)
			return
		}
		this.logger.log(`Send maze to ${this._remoteWorkers.size} workers ...`)
		for (const id of this._remoteWorkers.keys()) {
			this._lastWorldsState.delete(id)
			this.sendMazeToWorkers(id)
		}
	}

	setWorker(id: string, remoteWorker: IRemoteWorker) {
		this.logger.log(`Remote worker "${id}" is online`)
		this._remoteWorkers.set(id, remoteWorker)
		remoteWorker.listen()
		remoteWorker.subscribe(HealthMessage.type, (data: TJSON) => {
			const retHealthMessage = messageFromJSON(data) as IResult<IBaseMessage & THealthMessage>
			if (retHealthMessage.isFailure) {
				this.logger.err(retHealthMessage.error!.message)
				return
			}
			remoteWorker.setHealth(retHealthMessage.value!)
		})
		remoteWorker.subscribe(WorldsStateMessage.type, (data: TJSON) => {
			const retWorldsStateMessage = messageFromJSON(data) as IResult<WorldsStateMessage>
			if (retWorldsStateMessage.isFailure) {
				this.logger.err(retWorldsStateMessage.error!.message)
				return
			}
			this.logger.log(`Remote worker "${id}" has sent new worlds states`)
			this._lastWorldsState.set(id, retWorldsStateMessage.value!.states)
			if (this._lastWorldsState.size === this._remoteWorkers.size) {
				this.draw()
			}
		})
		this.sendMazeToWorkers(id)
	}

	addSocketIO(s: SocketIO) {
		this._sio.add(s)
	}

	removeSocketIO(s: SocketIO): boolean {
		return this._sio.delete(s)
	}

	draw() {
		const globalState: Generation = {
			population: 0,
			generation: 0,
			minAge: Number.MAX_SAFE_INTEGER,
			maxAge: 0,
			avgAge: 0,
			minFitness: Number.MAX_SAFE_INTEGER,
			maxFitness: 0,
			avgFitness: 0,
			solutions: [],
			explorations: {},
		}
		let totalAge = 0
		let totalFitness = 0
		for (const states of this._lastWorldsState.values()) {
			states.forEach((state: Generation) => {
				globalState.population += state.population
				globalState.generation = Math.max(globalState.generation, state.generation)
				globalState.minAge = Math.min(globalState.minAge, state.minAge)
				globalState.maxAge = Math.max(globalState.maxAge, state.maxAge)
				totalAge += state.avgAge * state.population
				globalState.minFitness = Math.min(globalState.minFitness, state.minFitness)
				globalState.maxFitness = Math.max(globalState.maxFitness, state.maxFitness)
				totalFitness += state.avgFitness * state.population
				state.solutions.forEach((solution: Solution) => globalState.solutions.push(solution))
				for (const idx in state.explorations) {
					globalState.explorations[idx] = (globalState.explorations[idx] ?? 0) + state.explorations[idx]
				}
			})
		}
		globalState.avgAge = totalAge / globalState.population
		globalState.avgFitness = totalFitness / globalState.population
		this._lastWorldsState.clear()
		this._sio.forEach((s: SocketIO) => s.emit(WorldsStateMessage.type, globalState))
	}

	async askSimulation(nbGenerations: number): Promise<void> {
		for (const worker of this._remoteWorkers.values()) {
			await worker.simulate(nbGenerations)
		}
	}
}
