import type {TJSON} from "../Common"
import type {TMessageType} from "../Message.spec"

export interface IRemoteServer {
	/**
	 * Partie spécifique du type de connexion
	 */
	connect(): Promise<boolean>
	close(): void
	send(data: TJSON): Promise<boolean>

	/**
	 * Partie commune
	 */
	subscribe(type: TMessageType, handler: (data: TJSON) => void): boolean
}
