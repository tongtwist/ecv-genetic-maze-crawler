export function configArgs(mode? : string, config1?: string, config2?: string) {
    if(mode && config1 && config2){
        if(mode === "server" && !isNaN(parseInt(config1)) && !isNaN(parseInt(config2)) ){
            return {
                mode: "server",
                httpPort : parseInt(config1),
                tcpPort : parseInt(config2)
            }
        }
        if(mode === "worker" &&  !isNaN(parseInt(config2)) ){
            return {
                mode: "worker",
                serverSocket: config1,
                nbThread: parseInt(config2)
            }
        }
    }
    console.log("error: un des élements de config est undefined ou pas du bon type")
    return {config: false}
}