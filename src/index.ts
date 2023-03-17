async function main(){
    var args = process.argv.slice(2);
    if(args[0] != "server" && args[0] != "worker"){
        console.log(`Unexpected argument(s): ${args[0]}`)
        process.exit(-1);
    }
    else if (args[2] == undefined){
        console.log(`Il n'y a pas le bon nombre d'argument`)
        process.exit(-1);
    }
    else if(parseInt(args[1]) < 0 || parseInt(args[2]) < 0){
        console.log(`Le serverSocket et/ou tcpPort et/ou nbThreads n'est pas un entier positif`)
        process.exit(-1);
    }
    else{
        if(args[0] === "server"){
            console.log("Run as a server")
            ParseArgsResult = {
                mode: args[0],
                httpPort: args[1],
                tcpPort: args[2],
            }
            console.log(ParseArgsResult)
        }
        else{
            console.log("Run as a worker")
            ParseArgsResult = {
                mode: args[0],
                serverSocket: args[1],
                nbThreads: args[2],
            }
            console.log(ParseArgsResult)
        }
    }
}
main()