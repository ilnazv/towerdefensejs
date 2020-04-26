export interface IPoint {
    x: number;
    y: number;
}

export class TowerDefenseGame {
    private dragTower = false;

    private get ctx(): CanvasRenderingContext2D {
        return this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    private pointInside(point: IPoint): boolean {
        const xInside =
            point.x >= this.tower.x && point.x <= this.tower.x + this.blockSize;
        const yInside =
            point.y >= this.tower.y && point.y <= this.tower.y + this.blockSize;
        return xInside && yInside;
    }

    private handleMousedown(ev: MouseEvent): void {
        const coords: IPoint = {
            x: ev.offsetX,
            y: ev.offsetY,
        };
        if (this.pointInside(coords)) {
            this.dragTower = true;
        }
    }

    private handleMousemove(ev: MouseEvent): void {
        const coords: IPoint = {
            x: ev.offsetX,
            y: ev.offsetY,
        };
        if (this.dragTower) {
            this.drawTower(coords);
        }
    }

    private handleMouseup(ev: MouseEvent): void {
        this.dragTower = false;
    }

    private blockSize = 10;

    private tower: IPoint = {
        x: 10,
        y: 10,
    };

    private drawTower(position: IPoint): void {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(
            this.tower.x,
            this.tower.y,
            this.blockSize,
            this.blockSize
        );
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(
            position.x,
            position.y,
            this.blockSize,
            this.blockSize
        );
        this.tower = position;
    }

    constructor(private canvas: HTMLCanvasElement) {
        canvas.addEventListener('mousedown', (ev) => this.handleMousedown(ev));
        canvas.addEventListener('mousemove', (ev) => this.handleMousemove(ev));
        canvas.addEventListener('mouseup', (ev) => this.handleMouseup(ev));
    }

    start(): void {
        console.log('game started');
        this.drawTower(this.tower);
    }
}
