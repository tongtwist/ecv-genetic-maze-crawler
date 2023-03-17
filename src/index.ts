async function main(){
    var args = process.argv.slice(2);
    if(args[0] != "server" && args[0] != "worker"){
        console.log(`Unexpected argument(s): ${args[0]}`)
    }
    else{
        if(args[0] === "server"){
            console.log("Run as a server")
            ParseArgsResult = {
                mode: args[0],
                httpPort: args[1],
                tcpPort: args[2],
            }
            console.log(this.ParseArgsResult)
        }
        else{
            console.log("Run as a worker")
            ParseArgsResult = {
                mode: args[0],
                serverSocket: args[1],
                nbThreads: args[2],
            }
            console.log(this.ParseArgsResult)
        }
    }
}
main()