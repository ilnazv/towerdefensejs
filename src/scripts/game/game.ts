const defaultBlockSize = 10;

export interface IPoint {
    x: number;
    y: number;
}

export class Tower {
    /**
     *
     */
    constructor(
        private position: IPoint,
        private blockSize = defaultBlockSize
    ) {}

    get x(): number {
        return this.position.x;
    }

    get y(): number {
        return this.position.y;
    }

    public moveTo(point: IPoint) {
        this.position = point;
    }

    public pointInside(point: IPoint): boolean {
        const xInside = point.x >= this.x && point.x <= this.x + this.blockSize;
        const yInside = point.y >= this.y && point.y <= this.y + this.blockSize;
        return xInside && yInside;
    }
}

export class Canvas {
    /**
     *
     */
    constructor(
        private canvas: HTMLCanvasElement,
        private blockSize = defaultBlockSize
    ) {}

    private get ctx(): CanvasRenderingContext2D {
        return this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    public drawTower(position: IPoint, tower: Tower): void {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(tower.x, tower.y, this.blockSize, this.blockSize);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(
            position.x,
            position.y,
            this.blockSize,
            this.blockSize
        );
        tower.moveTo(position);
    }
}

export class TowerDefenseGame {
    private dragTower = false;

    private handleMousedown(ev: MouseEvent): void {
        const coords: IPoint = {
            x: ev.offsetX,
            y: ev.offsetY,
        };
        if (this.tower.pointInside(coords)) {
            this.dragTower = true;
        }
    }

    private handleMousemove(ev: MouseEvent): void {
        const coords: IPoint = {
            x: ev.offsetX,
            y: ev.offsetY,
        };
        if (this.dragTower) {
            this.canvas.drawTower(coords, this.tower);
        }
    }

    private handleMouseup(ev: MouseEvent): void {
        this.dragTower = false;
    }

    private tower: Tower = new Tower({
        x: 10,
        y: 10,
    });

    private canvas: Canvas;

    constructor(
        private htmlCanvas: HTMLCanvasElement,
        private blockSize = defaultBlockSize
    ) {
        htmlCanvas.addEventListener('mousedown', (ev) =>
            this.handleMousedown(ev)
        );
        htmlCanvas.addEventListener('mousemove', (ev) =>
            this.handleMousemove(ev)
        );
        htmlCanvas.addEventListener('mouseup', (ev) => this.handleMouseup(ev));
        this.canvas = new Canvas(htmlCanvas);
    }

    start(): void {
        console.log('game started');
        this.canvas.drawTower(
            {
                x: this.tower.x,
                y: this.tower.y,
            },
            this.tower
        );
    }
}
