import {TOption, parseArgs} from "./parseArgs";

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
    
    if(!options){
        console.error(`unexpected arguments : ${process.argv.slice(2).join(" ")}`)
        process.exit(-1)
    }
    
    if(options.mode === "server"){
        console.log("Run a server")
    }else{
        console.log("Run a worker")
    }
}
main()

