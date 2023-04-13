import * as os from "node:os"
import type {TServerConfig} from "./Server"
import type {TWorkerConfig} from "./Worker"

export type TServerOptions = { readonly mode: "server" } & TServerConfig
export type TWorkerOptions = { readonly mode: "worker" } & TWorkerConfig
export type TOptions = TServerOptions | TWorkerOptions

const defaultHttpPort = 8089
const defaultTcpPort = 5555

function parseInteger(txt: string): number | false {
	const res = parseInt(txt)
	return isNaN(res) ? false : res
}

function parseServerArgs(argv: string[]): TServerOptions | false {
	let argvIdx: number
	for (argvIdx = 2; argv.length && argv[argvIdx] === "server"; argvIdx++);
	const httpPort: number | false = argvIdx < argv.length && parseInteger(argv[argvIdx++])
	const tcpPort: number | false = argvIdx < argv.length && parseInteger(argv[argvIdx])
	if (typeof httpPort === "number" && typeof tcpPort === "number") {
		return {mode: "server", httpPort, tcpPort}
	} else if(argvIdx > 2 && argvIdx >= argv.length) {
		return {mode: "server", httpPort: defaultHttpPort, tcpPort: defaultTcpPort}
	}
	return false
}

function parseWorkerArgs(argv: string[]): TWorkerOptions | false {
	if (argv.length < 4) {
		return false
	}
	let serverAddr: string | undefined
	let serverPort: number | undefined
	let threadIdx = 3
	const socketMatches: RegExpMatchArray | null = argv[3].match(/[0-9]{1,3}\.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}:[0-9]{4,5}/g)
	const threadMatches: RegExpMatchArray | null = argv[3].match(/[0-9]+/g)
	if (socketMatches !== null && socketMatches[0] === argv[3]) {
		const socketParts: string[] = argv[3].split(":")
		const port = parseInt(socketParts[1])
		const ipParts = socketParts[0].split(".")
		const ipOk = ipParts.reduce((acc: boolean, v: string, idx: number) => {
			const i = parseInt(v)
			return acc && i + [0,1,1,0][idx] > 0 && i < 255
		}, true)
		if (!ipOk || port < 5000 || port > 65535) {
			return false
		}
		serverAddr = socketParts[0]
		serverPort = port
		threadIdx++
	} else if (threadMatches === null || threadMatches[0] !== argv[3]) {
		return false
	}
	let nbThreads: number | false = false
	if (argv.length > threadIdx) {
		nbThreads = parseInteger(argv[threadIdx])
	}
	if (nbThreads === false || isNaN(nbThreads)) {
		nbThreads = os.cpus().length
	}
	nbThreads = Math.max(1, Math.min(os.cpus().length, nbThreads))
	return {mode: "worker", nbThreads, serverAddr, serverPort}
}

export function parseArgs(argv: string[]): TOptions | false {
	if (argv.length === 2) {
		return {mode: "server", httpPort: defaultHttpPort, tcpPort: defaultTcpPort}
	} else if (argv[2] === "worker") {
		return parseWorkerArgs(argv)
	}
	return parseServerArgs(argv)
}