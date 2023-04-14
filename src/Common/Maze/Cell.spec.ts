export type TCellJSON = number

export interface ICell {
	readonly visited: boolean
	readonly walls: [boolean, boolean, boolean, boolean]
	readonly i: number
	readonly j: number
	readonly idx: number
	setVisited(): void
	checkNeighbors(): ICell | undefined
	removeWallWith(cell: ICell): void
	toJSON(): TCellJSON
}