import { TServerOptions } from "../parseArgs";

export function server(options: TServerOptions) {
  console.log("Run as server on HTTP port " + options.httpPort);
}
