import type {TGene, IGenome} from "./Genome.spec"

export class Genome implements IGenome {
	static randomGene(): TGene {
		return Math.min(3, Math.floor(Math.random() * 4)) as TGene
	}

	static create(nbGenes: number): IGenome {
		const genes: TGene[] = []
		for (let i = 0; i < nbGenes; i++) {
			genes.push(Genome.randomGene())
		}
		return new Genome(genes)
	}

	static crossOver(mother: IGenome, father: IGenome): IGenome {
		const minCrossIndex = 1
		const maxCrossIndex = Math.min(mother.length - 1, father.length - 1)
		const crossIndex = Math.floor(Math.random() * (maxCrossIndex - minCrossIndex + 1)) + minCrossIndex
		const childGenes = mother.genes.slice(0, crossIndex).concat(father.genes.slice(crossIndex))
		return new Genome(childGenes)
	}

	private constructor(
		private _genes: TGene[],
	) {}

	get genes(): TGene[] { return [...this._genes] }
	get length(): number { return this._genes.length }

	swap(givenIdx?: number): void {
		const idx = givenIdx ?? Math.floor(Math.random() * this._genes.length)
		const lastGene = this._genes[idx]
		while(this._genes[idx] === lastGene) {
			this._genes[idx] = Genome.randomGene()
		}
	}

	insert(givenIdx?: number): void {
		const idx = givenIdx ?? Math.floor(Math.random() * this._genes.length)
		const lastGenes = this._genes
		this._genes = idx > 0 ? lastGenes.slice(0, idx - 1) : [] as TGene[]
		this._genes.push(Genome.randomGene())
		this._genes = this._genes.concat(lastGenes.slice(idx))
	}

	delete(givenIdx?: number): void {
		if (this._genes.length <= 2) return
		const idx = givenIdx ?? Math.floor(Math.random() * this._genes.length)
		this._genes = this._genes.slice(0, idx).concat(this._genes.slice(idx + 1))
	}
}