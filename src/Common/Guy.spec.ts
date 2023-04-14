import { Genome, IGenome } from './Genome.spec'
import { Maze } from './Maze'
import { IMaze } from './Maze.spec'

export type Position = {
    x: number
    y: number
}

export type Walk = {
    steps: number
    wallHits: number
    backtracks: number
    targetReached: boolean
}

export interface IGuy {
    readonly age: number
    readonly genome: IGenome
    walk(target:Position): Walk
    mutate(rate: number): void
    vieillis(): void
}


/**
 * const buddy = Guy.create(maze: Imaze)
 * const buddy = Guy.birth(maze: Imaze, mother: IGuy, father: IGuy)
 */

export class Guy implements IGuy {
    age: number
    genome: IGenome

    private constructor(genome: IGenome, maze: IMaze) {
        this.age = 0
        this.genome = genome
    }

    static create(maze: IMaze): IGuy {
        const genome = Genome.random(maze.nbCols + maze.nbRows)
        return new Guy(genome, maze)
    }

    static birth(maze: IMaze, mother: IGuy, father: IGuy): Guy {
        const genome1 = mother.genome
        const genome2 = father.genome

        const genomeFinal = genome1.genes.map((gene, idx) => {
            if (idx % 2 === 0) {
                return gene
            } else {
                return genome2.genes[idx]
            }
        })
        const genome = Genome.from(genomeFinal)

        const child = new Guy(genome, maze)
        return child
    }
    

    walk(target: Position): Walk {
        let steps = 0
        let wallHits = 0
        let backtracks = 0
        let targetReached = false

        let position: Position = { x: 0, y: 0 }
        let direction: Position = { x: 0, y: 0 }
        
        return {steps, wallHits, backtracks, targetReached}
    }

    mutate(rate: number): void {
        const length = this.genome.length
        const n = Math.floor(rate * length)
        for (let i = 0; i < n; i++) {
            this.genome.swap()
        }
        for (let i = 0; i < n; i++) {
            this.genome.insert()
        }
        for (let i = 0; i < n; i++) {
            this.genome.delete()
        }        
    }

    vieillis(): void {
        this.age++
    }
}

