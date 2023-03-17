import { parseArgs } from "node:util";
import { configArgs } from "./configArgs";

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
