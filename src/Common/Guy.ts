import { IMaze } from "../Server/Maze.spec";
import { Genome } from "./Genome";
import { IGenome, TGene } from "./Genome.spec";
import { IGuy, Position, Walk } from "./Guy.spec";

export class Guy implements IGuy {
    age: number;
    genome: IGenome;

    private constructor(genome : IGenome, maze: IMaze){
        this.age = 1
        this.genome = genome

    }
    walk(target: Position): Walk {
        throw new Error("Method not implemented.");
    }

    static create (maze: IMaze) {
        const genome = Genome.random(maze.nbCols + maze.nbRows)
        return new Guy(genome, maze)
    }

    static birth(maze: IMaze, mother: IGuy, father: IGuy) {
        const length = maze.nbCols + maze.nbRows
        const genome = []
        for(let i = 0; i < length; i++ ){
            if(i < length / 2){
                genome.push(mother.genome.genes[i]) 
            }
            else {
                genome.push(father.genome.genes[i]) 
            }
        }
        const genomeForGuy =Genome.from(genome as TGene[])
        return new Guy(genomeForGuy, maze)
    }

    mutate(rate: number): void {
        if(Math.random() > rate){
            const idxFunction = (Math.floor(Math.random() * 2))
            if(idxFunction === 0){
                this.genome.delete()
            }
            if(idxFunction === 1){
                this.genome.insert()
            }
            if(idxFunction === 2){
                this.genome.swap()
            }
        }

    }
    vieillis(): void {
        this.age = this.age+1
    }
    
}