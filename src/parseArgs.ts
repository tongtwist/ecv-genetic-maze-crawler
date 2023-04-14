import * as os from "node:os"
import cluster from "node:cluster"
import {IResult, Result} from "./Common"
import {TServerConfig, defaultConfig as defaultServerConfig} from "./Server"
import type {TWorkerConfig} from "./Worker"

export type TServerOptions = { readonly mode: "server" } & TServerConfig
export type TWorkerOptions = { readonly mode: "worker" } & TWorkerConfig
export type TOptions = TServerOptions | TWorkerOptions


/**
 * Parse un texte sensé représenter un entier
 *
 * @param {string} txt
 * @return {*}  {IResult<number>}
 */
function parseInteger(txt: string): IResult<number> {
	const res = parseInt(txt)
	return isNaN(res)
		? Result.failureIn("parseInteger", `"${txt}" is not a supported integer string representation`)
		: Result.success(res)
}

/**
 * Parse un texte sensé représenter un numéro de port (userland)
 *
 * @param {string} txt
 * @return {*}  {IResult<number>}
 */
function parsePort(txt: string): IResult<number> {
	const resPort = parseInteger(txt)
	if (resPort.isFailure) {
		return Result.failureIn("parsePort", resPort.error!)
	}
	const port = resPort.value!
	if (port < 5000 || port > 65535) {
		return Result.failureIn("parsePort", `A userland port number should be an integer between 5000 and 65535, but you provide ${txt}`)
	}
	return Result.success(port)
}

/**
 * Parse un texte sensé représenter une adresse IPv4 unicast
 *
 * @param {string} txt
 * @return {*}  {IResult<string>}
 */
function parseIPv4(txt: string): IResult<string> {
	const ipMinimums = [1,0,0,1]
	const ipMaximums = [223,255,255,254]
	const ipParts: string[] = txt.split(".")
	for (let i = 0; i < ipParts.length; i++) {
		const resN = parseInteger(ipParts[i])
		if (resN.isFailure) {
			return Result.failureIn("parseIPv4", resN.error!)
		}
		const n = resN.value!
		if (n < ipMinimums[i] || n > ipMaximums[i]) {
			const intervals: string[] = ipMinimums.reduce((res: string[], min: number, idx: number) => [...res, `[${min},${ipMaximums[idx]}]`], [])
			return Result.failureIn("parseIPv4", `A valid unicast IPv4 address should be a serie of 4 integer joined by a "." within the following respective intervals ${intervals.join(", ")}, but you provide "${txt}"`)
		}
	}
	return Result.success(txt)
}

/**
 * Parse un texte sensé représenter une socket IPv4 unicast
 *
 * @param {string} txt
 * @return {*}  {IResult<[string, number]>}
 */
function parseSocket(txt: string): IResult<[string, number]> {
	const socketMatches: RegExpMatchArray | null = txt.match(/[0-9]{1,3}\.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}:[0-9]{4,5}/g)
	if (socketMatches === null || socketMatches[0] !== txt) {
		return Result.failureIn("parseSocket", `Expected a socket format like "192.168.0.1:5555" but you provide "${txt}"`)
	}
	const socketParts: string[] = txt.split(":")
	
	const resPort = parsePort(socketParts[1])
	if (resPort.isFailure) {
		return Result.failureIn("parseSocket", resPort.error!)
	}
	const port = resPort.value!

	const resIPv4 = parseIPv4(socketParts[0])
	if (resIPv4.isFailure) {
		return Result.failureIn("parseSocket", resIPv4.error!)
	}

	return Result.success([socketParts[0], port])
}

/**
 * Parse les arguments d'un worker
 *
 * @param {string[]} argv
 * @return {*}  {IResult<TWorkerOptions>}
 */
function parseWorkerArgs(argv: string[]): IResult<TWorkerOptions> {
	const resSocket = parseSocket(argv[3])
	if (resSocket.isFailure) {
		return Result.failureIn("parseWorkerArgs", resSocket.error!)
	}
	const [serverAddr, serverPort] = resSocket.value!

	const resNbThreads = parseInteger(argv[4])
	if (resNbThreads.isFailure) {
		return Result.failureIn("parseWorkerArgs", resNbThreads.error!)
	}
	let usableCores = os.cpus().length
	if (cluster.isPrimary) {
		usableCores--
	}
	const maxThread = Math.max(1, usableCores)
	const nbThreads = Math.max(1, Math.min(maxThread, resNbThreads.value!))

	return Result.success({mode: "worker", nbThreads, serverAddr, serverPort})
}

/**
 * Parse les arguments d'un serveur
 *
 * @param {string[]} argv
 * @return {*}  {IResult<TServerOptions>}
 */
function parseServerArgs(argv: string[]): IResult<TServerOptions> {
	let resPort = parsePort(argv[3])
	if (resPort.isFailure) {
		return Result.failureIn("parseServerArgs", resPort.error!)
	}
	const httpPort = resPort.value!

	resPort = parsePort(argv[4])
	if (resPort.isFailure) {
		return Result.failureIn("parseServerArgs", resPort.error!)
	}
	const tcpPort = resPort.value!
	
	return Result.success({mode: "server", httpPort, tcpPort})
}

/**
 * Parse les arguments
 *
 * @export
 * @param {string[]} argv
 * @return {*}  {IResult<TOptions>}
 */
export function parseArgs(argv: string[]): IResult<TOptions> {
	if (argv.length === 2) {
		return Result.success({...defaultServerConfig, mode: "server"})
	} else if (argv.length < 5) {
		return Result.failureIn("parseArgs", `Expected either 3 or 5 arguments, but you provide ${argv.length}`)
	} else if (argv[2] === "worker") {
		return parseWorkerArgs(argv)
	} else if (argv[2] === "server") {
		return parseServerArgs(argv)
	}
	return Result.failure(`Third argument should be either "server" or "worker" but you provide "${argv[2]}"`)
}