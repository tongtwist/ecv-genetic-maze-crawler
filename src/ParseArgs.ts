console.log("maze pathfinder")

export default function ReturnArgs() {
    var args = process.argv.slice(2);

    args.forEach(function (res) {
        console.log(res);
    });

    if (args.length == 0) {
        console.log("No arguments passed.");
    }

    if(args[0] === "server"){
        console.log("run as server");
    } else {
        console.log("run as worker");
    }
}
