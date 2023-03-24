// import { argv } from 'node:process';

// export type TOptions = {
//     mode: "server" | "worker";
//     httpPort?: number;
//     tcpPort?: number;
//     serverSocket?: string;
//     nbThreads?: number;
// };

// export function parseArgs(argv:string[]): TOptions | false{
//     if(argv.length === 2) {
//         return {mode:"server", httpPort:defaultPort, tcpPort:defaultPort};
//     }
//     else if(argv[2] === "worker") {
//         return parseWorkerArgs(argv);
//     }
//     return parseServerArgs(argv);
// }

// export function parseWorkerArgs(argv:string[]): TWorkerOptions | false{
// if(argv.length === 3) {
//     return {mode:"server", httpPort:defaultPort, nbThreads:defaultNbThreads};
// }
// if(argv.length === 3) {
//     return {mode:"worker", httpPort:defaultPort, tcpPort:defaultPort};
// }
// }
// export function parseServerArgs(argv:string[]): TServerOptions | false{
//     if(argv.length === 3) {
//         return {mode:"server", httpPort:defaultPort, nbThreads:defaultNbThreads};
//     }
//     if(argv.length === 3) {
//         return {mode:"worker", httpPort:defaultPort, tcpPort:defaultPort};
//     }
//     }