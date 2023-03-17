import { parseArgs } from "node:util";

const {
  values: { name },
} = parseArgs({
  options: {
    name: {
      type: "string",
      short: "n",
    },
    
  },
});

console.log(`le nom est : ${name} `);