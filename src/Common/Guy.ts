import { IGenome, TGene } from './Genome.spec'
import { Genome } from './Genome'
import { IGuy, TPosition, TWalk } from './Guy.spec'

export class Guy implements IGuy {
    private constructor(public _genome: IGenome, private _age: number) {}

    get age(): number {
        return this._age
    }

    get genome(): IGenome {
        return this._genome
    }

    walk(target: TPosition): TWalk {
        const walk: TWalk = {
            steps: 0,
            wallHits: 0,
            backtracks: 0,
            targetReached: false,
        }

        const position: TPosition = { x: 0, y: 0 }

        for (const gene of this._genome.genes) {
            walk.steps++

            switch (gene) {
                case 0:
                    position.x++
                    break
                case 1:
                    position.x--
                    break
                case 2:
                    position.y++
                    break
                case 3:
                    position.y--
                    break
            }

            // Selon la valeur de gene, je sais de quel côté je vais
            // Je compare ma case de destination à la case dans IMaze
            // Selon de quel côté j'arrive, je vérifie si cette case a un mur selon la propriété walls de la cell
            // Si oui, je compte un wallHit et ne met pas à jour ma position
        }

        return walk
    }

    mutate(rate: number) {
        if (Math.random() >= rate) {
            const index = Math.floor(Math.random() * 2) as 0 | 1 | 2

            switch (index) {
                case 0:
                    this._genome.swap()
                    break
                case 1:
                    this._genome.insert()
                    break
                case 2:
                    this._genome.delete()
                    break
            }
        }
    }

    ages() {
        this._age++
    }

    static create(): Guy {
        const genome = Genome.random(100)
        return new Guy(genome, 0)
    }

    static birth(mother: IGuy, father: IGuy): Guy {
        const motherGenome = [...mother.genome.genes]
        const fatherGenome = [...father.genome.genes]

        const motherHalf = Math.ceil(mother.genome.length / 2)
        const fatherHalf = Math.ceil(father.genome.length / 2)

        const childGenome: TGene[] = [
            ...motherGenome.slice(0, motherHalf),
            ...fatherGenome.slice(fatherHalf),
        ]

        const genome = Genome.from(childGenome)
        return new Guy(genome, 0)
    }
}
