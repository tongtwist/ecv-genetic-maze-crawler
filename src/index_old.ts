import { Logger } from "./common/logger";
import process from "node:process";
import { thisServer } from "./server/server";


// MY CODE 

var action = getParam(process.argv[2],process.argv[3],parseInt(process.argv[4]))
if (typeof action == "object") {
    console.log(action);
}

function getParam(mode:string, arg1:string, arg2:number, primary:number = 0) {

    var thisMode = mode
    if (primary != 0) {
        thisMode = "worker"
        if (arg2 == 0) {
            arg2 = 1
        }
    }
    const mylog = new Logger (thisMode)
    //mylog.log(thisMode)

    //console.log('je suis mode : ', thisMode);
    
    if (isNaN(arg2) == true || arg1 == "undefined"){
        //console.log('argument manquant OU invalide');
        return ;
    };
    if (thisMode === 'server') {
        //console.log("run in server");
        //console.log(arg1, arg2);
        
        var http_port = parseInt(arg1)
        var tcp_port = arg2
        
        if(isNaN(http_port) == true || http_port < 0 || tcp_port < 0 ){
            //console.log('Valeur negative');
            return ; 
        }
        
        // test

        thisServer(thisMode,arg1,arg2)
        mylog.log(JSON.stringify(getParam(mode, http_port.toString(), tcp_port))); 

        // fin test


        var worker:any = getParam("", "localhost:"+http_port, 0, 1)
        
        return {
        'server' : 
            {
            'http_port' : http_port, 
            'tcp_port'  : tcp_port
            },
        worker
        }
        
// port max : 65535 port min : 5000 
// os -> CPU 
    }else{
        console.log("run in worker");
        console.log(arg1, arg2);
        
        var local = arg1
        var nbThread = arg2

        return {
            'localhost' : local,
            'nbThread'  : nbThread 
        }
    }   
}