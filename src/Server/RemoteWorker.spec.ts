import type {TMessageType, IBaseMessage, TJSON, THealthMessage, IMaze} from "../Common"

export interface IRemoteWorker {
	/**
	 * Partie spécifique du type de connexion
	 */
	listen(): void
	send(data: TJSON): Promise<boolean>

	/**
	 * Partie commune
	 */
	subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean
	readonly label: string
	readonly lastHealth?: THealthMessage
	setHealth(v: IBaseMessage & THealthMessage): void
	stop(): Promise<boolean>
	setMaze(maze: IMaze): Promise<boolean>
	simulate(nbGeneration: number, growthRate?: number): Promise<boolean>
}