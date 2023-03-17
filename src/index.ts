import cluster from 'node:cluster';
import http from 'node:http';
import { parseArgs } from "node:util";
import { configArgs } from "./configArgs";
import {workerFunction} from "./worker";
import {serverFunction} from "./server";

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

mode === "server" ? console.log(`c'est le server`) : console.log("c'est un worker");

const config = configArgs(mode, config1, config2);

console.log(config)

if (config.mode === "server" && cluster.isPrimary) {
  // require("./server.ts")
  serverFunction()
} 
else {
    // require("./worker.ts")
    workerFunction()
    }
