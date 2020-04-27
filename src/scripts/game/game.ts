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
            this.tower.moveTo(coords);
            this.canvas.update();
        }
    }

    private handleMouseup(ev: MouseEvent): void {
        this.dragTower = false;
    }

    private tower: Tower = new Tower({
        x: 20,
        y: 20,
    });
    private path: Path = defaultPath;

    private enemies: Enemy[] = [];

    private canvas: Canvas;
    private intervalId?: NodeJS.Timeout;
    private fps = 60;
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
        this.canvas = new Canvas(htmlCanvas, { width: 600, height: 800 });
    }

    public start(): void {
        console.log('game started');
        this.canvas.add(this.tower);
        this.intervalId = setInterval(() => {
            if (this.progress >= 100) {
                this.stop();
            } else {
                this.run();
            }
        }, 1000 / this.fps);
        this.startEnemiesSpawn();
    }

    private startEnemiesSpawn(): void {
        let enemiesNumber = 0;
        const enemySpawnInterval = setInterval(() => {
            if (enemiesNumber > 10) {
                clearInterval(enemySpawnInterval);
            }
            const newEnemy = new Enemy(
                {
                    x: 10,
                    y: 10,
                },
                this.path
            );
            this.enemies.push(newEnemy);
            this.canvas.add(newEnemy);
            enemiesNumber++;
        }, 3000);
    }

    private run(): void {
        this.enemies.forEach((x) => x.moveForward());
        this.canvas.update();
    }

    public stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}
