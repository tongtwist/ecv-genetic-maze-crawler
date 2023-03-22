import cluster from 'node:cluster';
import { parseArgs } from "node:util";
import { configArgs } from "./configArgs";
import {workerFunction} from "./Worker/worker";
import {serverFunction} from "./Server/server";

// pour lancer la commande : node dist/index.js --mode worker --config1 conf1 --config2 conf2
const {
  values: { mode, config1, config2 },
} = parseArgs({
  options: {
    mode: {
      type: "string",  
    }, 
    config1 : {
        type: "string",
    } ,
    config2: {
        type: "string",
    }
  },
});
const config = configArgs(mode, config1, config2);
if(mode && config1  && config2){
  if (config.mode === "server" && cluster.isPrimary) {
    serverFunction(mode, config1, config2)
   
  } 
  else {
    workerFunction(mode, config1, config2)
  }
}
