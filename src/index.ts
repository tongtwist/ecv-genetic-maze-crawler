import {TOption, parseArgs} from "./parseArgs";
import cluster from 'node:cluster';
// import * as process from "node:cluster"

// type ParseArgsResult = {
//     mode : "server",
//     httpPort : 80090,
//     tcpPort : 5555,
// } | {
//     mode : "worker",
//     serverSocket:"127.0.0.1:5555",
//     nbThreads:12,
// }

async function main(){

    const options: TOption | false = parseArgs(process.argv)
    console.log(options)
    
    if(!options && cluster.isPrimary){
        console.error(`unexpected arguments : ${process.argv.slice(2).join(" ")}`)
        process.exit(-1)
    }
    
    if(cluster.isPrimary && (options as TOption).mode === "server"){
        const {server} = await require("./Server")
        server(options)
    }else if(cluster.isWorker || (options as TOption )){
        const {worker} = await require("./Worker")
        worker(cluster.isWorker ? {mode:"worker", sockerServer:"127.0.0.1:55555", nbThreds:12} 
        : options)
    }

}
main()

