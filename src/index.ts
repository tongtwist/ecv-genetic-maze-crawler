console.log("maze pathfinder")

function ReturnArgs() {
    var args = process.argv.slice(2);

    args.forEach(function (res) {
        console.log(res);
    });
}

ReturnArgs();