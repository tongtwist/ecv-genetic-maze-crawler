import parseArgs, {Toption} from './ParseArgs';

async function main() {
    const options: Toption | false = parseArgs(process.argv);

    if (!options) {
        console.error('Unexpected arguments');
        process.exit(1);
    }

    console.log("argv:", options);

    if (options.mode === 'server') {
        console.log('Running as server');
    } else {
        console.log('Running as worker');
    }
}

main();