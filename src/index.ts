import * as process from 'node:process'
import { Express } from 'express'
import path from 'node:path'
import cluster from 'node:cluster'
import { TOptions, parseArgs } from './parseArgs'
import { ShellLogger } from './Common/Logger'

async function main() {
    const options: TOptions | false = parseArgs(process.argv)
    const logger =  new ShellLogger('Main')

    if (!options && cluster.isPrimary) {
        logger.err(
            `Unexpected argument(s) : ${process.argv.slice(2).join(' ')}`
        )
        process.exit(-1)
    }

    if (cluster.isPrimary && (options as TOptions).mode === 'server') {
        const { server } = await require('./Server')
        server(options)
    } else if (
        cluster.isWorker ||
        (options as TOptions).mode === 'worker'
    ) {
        const { worker } = await require('./Worker')
        worker(cluster.isWorker ? { mode: 'worker' } : options)
    }
}

main()