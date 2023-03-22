import ShellLogger from "../Common/Logger";

export default function startServer(httpPort: number, tcpPort: number) {
    const logger = new ShellLogger('SERVER', true);
    logger.log(`Starting server on httpPort:${httpPort} and tcpPort:${tcpPort}`);
}