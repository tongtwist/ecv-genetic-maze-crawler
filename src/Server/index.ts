import path from "path"
import cluster from "cluster"
import http from "http"
import express from "express"
import {DisconnectReason, Server as SocketIOServer, Socket as SocketIO} from "socket.io"

export type TServerConfig = {
	readonly httpPort: number
    readonly tcpPort: number
}

export function server(cfg: TServerConfig) {
    console.log("Run as a server with config:", JSON.stringify(cfg))

    const expressApp = express()
	const httpServer = http.createServer(expressApp)
	const socketIO = new SocketIOServer(httpServer)
	const publicPath = path.join(process.cwd(), "public")
	console.log(`Serve static files from "${publicPath}"`)

	expressApp.use("/p/", express.static(publicPath))

	socketIO.on("connection", (s: SocketIO) => {
		let protocol = s.conn.transport.name
		//const sLogger = console.create(`WS:${s.id}`)
		console.log(`Connection using "${protocol}" protocol`)
		s.on("error", (err: Error) => console.error(err))
		s.conn.once("upgrade", () => {
			console.log(`protocol upgrade from "${protocol}" to "${s.conn.transport.name}"`)
			protocol = s.conn.transport.name
		})
		s.on("disconnect", (reason: DisconnectReason) => console.log(`disconnected (${reason.toString()})`))
	})

    console.log("Launch a worker...")
    cluster.fork()

	httpServer.listen(cfg.httpPort, () => console.log(`Listening on port ${cfg.httpPort}...`))
}