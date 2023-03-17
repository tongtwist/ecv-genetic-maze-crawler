'use strict';
var action = getParam(process.argv[2],process.argv[3],parseInt(process.argv[4]))
if (typeof action == "object") {
    console.log(action);
}

/*
if (process.argv[2] === 'server') {
    console.log("run in server");
    var http_port = parseInt(process.argv[3])
    var tcp_port = parseInt(process.argv[4])
    
}else{
    console.log("run in worker");
    var local = parseInt(process.argv[3])
    var nbThread = parseInt(process.argv[4])
}
*/
function getParam(mode:string, arg1:string, arg2:number, primary:number = 0) {
    if (primary != 0) {
        mode = "worker"
    }

    if (isNaN(arg2) == true || arg1 == "undefined"){
        console.log('argument manquant OU invalide');
        return ;
    };
    if (mode === 'server') {
        console.log("run in server");
        var http_port = parseInt(arg1)
        var tcp_port = arg2
        
        if(isNaN(http_port) == true || http_port < 0 || tcp_port < 0 ){
            console.log('Valeur negative');
            return ; 
        }

        getParam("", "localhost"+http_port+":"+tcp_port, 12, 1)
        console.log('je lance un worker');
        
        return {
            'http_port' : http_port, 
            'tcp_port'  : tcp_port
        }

    }else{
        console.log("run in worker");
        var local = arg1
        var nbThread = arg2

        return {
            'localhost' : local,
            'nbThread'  : nbThread 
        }
    }   
}