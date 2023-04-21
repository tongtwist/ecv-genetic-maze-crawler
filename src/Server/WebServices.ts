import path from "node:path"
import http from "node:http"
import express from "express"
import { DisconnectReason, Server as SocketIOServer, Socket as SocketIO } from "socket.io"
import { ILogger, Logger } from "../Common"
import { TServerConfig } from "."
import { ServerLogic } from "./ServerLogic"

export function setupWebServices(
	cfg: TServerConfig,
	socketIOMessageHandlers: Record<string, (ctx: {s: SocketIO, logger: ILogger}, ...args: any[]) => void>,
	logger: ILogger
): (logic: ServerLogic) => void {
	const expressApp = express()
	const httpServer = http.createServer(expressApp)
	const socketIO = new SocketIOServer(httpServer)
	const publicPath = path.join(process.cwd(), "public")
	logger.log(`HTTP service will serve static files from "${publicPath}"`)
	expressApp.use("/", express.static(publicPath))
	return (logic: ServerLogic) => {
		socketIO.on("connection", (s: SocketIO) => {
			let protocol = s.conn.transport.name
			const sLogger = Logger.create(`(Server.WS:${s.id})`)
			sLogger.log(`Connection using "${protocol}" protocol`)
			s.conn.once("upgrade", () => {
				sLogger.log(`protocol upgrade from "${protocol}" to "${s.conn.transport.name}"`)
				protocol = s.conn.transport.name
			})
			socketIOMessageHandlers["error"] = (ctx: {s: SocketIO, logger: ILogger}, err: Error) => {
				ctx.logger.err(err)
				logic.removeSocketIO(ctx.s)
			}
			socketIOMessageHandlers["disconnect"] = (ctx: {s: SocketIO, logger: ILogger}, reason: DisconnectReason) => {
				ctx.logger.log(`disconnected (${reason.toString()})`)
				logic.removeSocketIO(ctx.s)
			}
			for (const [name, handler] of Object.entries(socketIOMessageHandlers)) {
				s.on(name, (...args: any[]) => handler({s, logger: sLogger}, ...args))
			}
			logic.addSocketIO(s)
		})
		httpServer.listen(cfg.httpPort, "127.0.0.1", () => logger.log(`HTTP service listening on port ${cfg.httpPort}...`))
	}
}
