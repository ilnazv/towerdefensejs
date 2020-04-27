import { Path, IPoint, Tower, Canvas, Enemy } from './models';
import { defaultBlockSize } from './constants';

const defaultPath: Path = new Path([
    {
        x: 10,
        y: 10,
    },
    {
        x: 10,
        y: 300,
    },
    {
        x: 200,
        y: 300,
    },
    {
        x: 300,
        y: 10,
    },
]);

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
            this.canvas.drawTower(this.tower, coords);
        }
    }

    private handleMouseup(ev: MouseEvent): void {
        this.dragTower = false;
    }

    private tower: Tower = new Tower({
        x: 20,
        y: 20,
    });

    private enemy: Enemy = new Enemy({
        x: 10,
        y: 10,
    });

    private canvas: Canvas;
    private path: Path;
    private intervalId?: NodeJS.Timeout;
    private fps = 10;
    private progress = 0;

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
        this.path = defaultPath;
    }

    public start(): void {
        console.log('game started');
        this.intervalId = setInterval(() => {
            if (this.progress >= 100) {
                this.stop();
            } else {
                this.run();
            }
        }, 1000 / this.fps);
    }

    private run(): void {
        const nextPoint = this.path.getPointAtPercent(this.progress);
        this.canvas.drawPath(this.path);
        this.canvas.drawEnemy(this.enemy, nextPoint);
        this.canvas.drawTower(this.tower);
        this.progress++;
    }

    public stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}
