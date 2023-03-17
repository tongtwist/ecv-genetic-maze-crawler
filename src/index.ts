'use strict';

getParam(process.argv[2],process.argv[3],process.argv[4])

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
function getParam(mode:string, arg1:string, arg2:string) {
    if (mode === 'server') {
        console.log("run in server");
        var http_port = parseInt(arg1)
        var tcp_port = arg2
        
    }else{
        console.log("run in worker");
        var local = arg1
        var nbThread = arg2
    }   
}