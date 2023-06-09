class Cell {
	constructor(ctx, i, j, idx, walls) {
		this.ctx = ctx;
		this.i = i;
		this.j = j;
		this.idx = idx;
		this.walls = walls;
	}

	drawWall(x1, y1, x2, y2) {
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = "#FFF";
		this.ctx.beginPath();
		this.ctx.moveTo(x1, y1);
		this.ctx.lineTo(x2, y2);
		this.ctx.stroke();
		this.ctx.closePath();
	}

	draw(color, cellSize) {
		const x = this.i * cellSize;
		const y = this.j * cellSize;
		const x2 = x + cellSize;
		const y2 = y + cellSize;
		this.ctx.fillStyle = color;
		this.ctx.fillRect(x, y, cellSize, cellSize);
		this.walls[0] && this.drawWall(x, y, x2, y);
		this.walls[1] && this.drawWall(x, y, x, y2);
		this.walls[2] && this.drawWall(x2, y, x2, y2);
		this.walls[3] && this.drawWall(x, y2, x2, y2);
	}

	static wallsFromJson(flags) {
		return [(1 & flags),(2 & flags),(4 & flags),(8 & flags)];
	}
}

class Maze {
	constructor(ctx, cellSize, nbCols, walls) {
		this.ctx = ctx;
		this.cellSize = cellSize;
		this.nbCols = nbCols;
		this.nbRows = walls.length / nbCols;
		this.width = cellSize * nbCols;
		this.height = cellSize * this.nbRows;
		this.grid = [];
		for (let wallIdx = 0, j = 0; j < this.nbRows; j++) {
			for (let i = 0; i < this.nbCols; i++, wallIdx++) {
				const cell = new Cell(ctx, i, j, this.getIdx(i,j), walls[wallIdx]);
				this.grid.push(cell);
			}
		}
	}

	getIdx(i, j) {
		return j * this.nbCols + i;
	}

	drawVisit(idx, n) {
		const j = Math.floor(idx / this.nbCols);
		const i = idx - j * this.nbCols;
		const v = 255 - Math.round(n * 255);
		const x = (i + 0.5) * this.cellSize;
		const y = (j + 0.5) * this.cellSize;
		this.ctx.beginPath();
		this.ctx.arc(x, y, this.cellSize * 0.4, 0, Math.PI * 1.9);
		this.ctx.fillStyle = `rgb(255,${v},128)`;
		this.ctx.fill();
	}

	drawExplorations(explorations) {
		let maxVisit = 0;
		for (const idx in explorations) {
			maxVisit = Math.max(maxVisit, explorations[idx]);
		}
		for (const idx in explorations) {
			this.drawVisit(idx, explorations[idx] / maxVisit);
		}
	}

    draw(state) {
		this.ctx.fillStyle = "#000";
		this.ctx.fillRect(0, 0, this.width, this.height);
		for (let i = 0; i < this.grid.length; i++) {
			this.grid[i].draw("#00F", this.cellSize);
		}
		if (state) {
			this.drawExplorations(state.explorations);
		}
	}

	static fromJSON(ctx, cellSize, json) {
		const walls = json.g.map(flags => Cell.wallsFromJson(flags));
		return new Maze(ctx, cellSize, json.c, walls);
	}
}
