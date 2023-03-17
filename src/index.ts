import { parseArgs } from "node:util";

const {
  values: { arg },
} = parseArgs({
  options: {
    arg: {
      type: "string",
      
    },
    
  },
});

arg === "server" ? console.log(`c'est le server`) : console.log("c'est un worker");

