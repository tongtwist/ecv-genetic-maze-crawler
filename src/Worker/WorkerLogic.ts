import {
	ILogger,
	TJSON,
	IMaze,
	Maze,
	IWorld,
	World,
	Generation,
} from "../Common"
import {TMazeMessage,MazeMessage,WorldsStateMessage,SimulateMessage} from "../Message"
import type { IRemoteServer } from "./RemoteServer.spec"

export class WorkerLogic {
	private _maze: IMaze | null = null
	private _worlds: IWorld[] = []
	private _lastGenerations: Generation[] = []

	constructor (
		private readonly isLocalWorker: boolean,
		private readonly nbThreads: number,
		private readonly remoteServer: IRemoteServer,
		private readonly stopHealthEmitter: () => void,
		private readonly logger: ILogger,
	) {}

	start() {
		this.remoteServer.subscribe("stop", this.stop.bind(this))
		this.remoteServer.subscribe("maze", (data: TJSON) => {
			const retParse = MazeMessage.parse(data)
			if (retParse.isSuccess) {
				this.mazeFromMessage(retParse.value!)
			} else {
				this.logger.err(`Could not understand the maze sent from the server: ${retParse.error}`)
			}
		})
		this.remoteServer.subscribe("simulate", (data: TJSON) => {
			const retParse = SimulateMessage.fromJSON(data)
			if (retParse.isSuccess) {
				this.simulate(retParse.value!.nbGeneration, retParse.value!.growthRate)
			} else {
				this.logger.err(`Could not understand the simulation query sent from the server: ${retParse.error}`)
			}
		})
	}

	stop() {
		this.stopHealthEmitter()
		this.logger.log(this.isLocalWorker ? "Local worker stopped" : "Worker stopped")
		process.exit(0)
	}

	mazeFromMessage(maze: TMazeMessage) {
		this.logger.log("Maze received from the server")
		const nbCols = maze.c
		const nbRows = maze.g.length / maze.c
		this._maze = Maze.fromJSON(nbCols, nbRows, maze)
		this.createWorlds()
		this.evaluateWorlds()
	}

	createWorlds() {
		if(this._maze) {
			this.logger.log(`Create ${this.nbThreads} worlds`)
			this._worlds = []
			for (let i = 0; i < this.nbThreads; i++) {
				this._worlds.push(World.createRandomWorld(this._maze, 100))
			}
		}
	}

	async evaluateWorlds(): Promise<void> {
		this.logger.log(`Evaluate ${this.nbThreads} worlds`)
		this._lastGenerations = this._worlds.map((world: IWorld) => world.evaluatePopulation(1))
		const msg = new WorldsStateMessage(this._lastGenerations)
		await this.remoteServer.send(msg.toJSON())
	}

	async simulate(nbGeneration: number, growthRate: number): Promise<void> {
		this.logger.log(`Server queried to simulate ${nbGeneration} generations`)
		this._lastGenerations = this._worlds.map((world: IWorld) => {
			let lastGeneration: Generation
			let i = 0
			do {
				lastGeneration = world.nextGeneration(growthRate)
				i++
			} while (i < nbGeneration)
			return lastGeneration
		})
		const msg = new WorldsStateMessage(this._lastGenerations)
		await this.remoteServer.send(msg.toJSON())
	}
}