import TOptions from "./parseArgs";
import parseArgs from "./parseArgs";

console.log("maze pathfinder");

async function main() {
  const options: TOptions | false = parseArgs(process.argv);
  if (!options) {
    console.error(
      `Unexpected argument(s) : ${process.argv.slice(2).join(" ")}`
    );
    process.exit(-1);
  }
  if (options.mode === "server") {
    console.log("Run as a server");
  } else {
    console.log("Run as a worker");
  }
}
main();
