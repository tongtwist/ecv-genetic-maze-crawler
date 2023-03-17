export function configArgs(mode? : string, config1?: string, config2?: string) {
    if(mode && config1 && config2){
        if(mode === "server"){
            return {
                mode: "server",
                httpPort : config1,
                tcpPort : config2
            }
        }
        return {
            mode: "worker",
            serverSocker: config1,
            nbThread: config2
        }
    }
    return console.log("error: un des élements de config est undefined")
}