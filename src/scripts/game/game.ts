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
    {
        x: 500,
        y: 10,
    },
    {
        x: 500,
        y: 300,
    },
]);

export class TowerDefenseGame {
    private dragTower = false;

    private handleMousedown(ev: MouseEvent): void {
        const coords: IPoint = {
            x: ev.offsetX,
            y: ev.offsetY,
        };
        // if (this.tower.pointInside(coords)) {
        //     this.dragTower = true;
        // }
    }

    private handleMousemove(ev: MouseEvent): void {
        const coords: IPoint = {
            x: ev.offsetX,
            y: ev.offsetY,
        };
        if (this.dragTower) {
            // this.tower.moveTo(coords);
            this.canvas.update();
        }
    }

    private handleMouseup(ev: MouseEvent): void {
        this.dragTower = false;
    }

    private towers: Tower[] = [
        new Tower({
            x: 50,
            y: 50,
        }),
        new Tower({
            x: 50,
            y: 250,
        }),
    ];
    private path: Path = defaultPath;

    private enemies: Enemy[] = [];

    private canvas: Canvas;
    private intervalId?: NodeJS.Timeout;
    private fps = 60;
    private progress = 0;
    private lifes = 7;

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
        this.canvas = new Canvas(htmlCanvas, { width: 600, height: 400 });
    }

    public start(): void {
        console.log('game started');
        this.canvas.add(...this.towers, this.path);
        this.intervalId = setInterval(() => {
            if (this.progress >= 100) {
                this.stop();
            } else {
                this.run();
            }
        }, 1000 / this.fps);
        this.startEnemiesSpawn(1).then(() => this.startEnemiesSpawn(2));
    }

    private async startEnemiesSpawn(level: number): Promise<boolean> {
        console.log('level: ', level);
        let enemiesCounter = 1;
        const enemiesNumber = level === 1 ? 2 : 20;
        const spawnSpeed = level === 1 ? 1000 : 500;
        const spawnEnemy = () => {
            const newEnemy = new Enemy(this.path);
            this.enemies.push(newEnemy);
            this.canvas.add(newEnemy);
        };
        spawnEnemy();
        return new Promise((resolve, reject) => {
            const enemySpawnInterval = setInterval(() => {
                if (enemiesCounter >= enemiesNumber) {
                    if (enemySpawnInterval) {
                        clearInterval(enemySpawnInterval);
                    }
                    resolve(true);
                }
                spawnEnemy();
                enemiesCounter++;
            }, spawnSpeed);
        });
    }

    private run(): void {
        this.enemies.forEach((x) => {
            const reachedFinish = x.moveForward();
            if (reachedFinish) {
                this.lifes--;
                this.enemies = this.enemies.filter((y) => y !== x);
                console.log('lifes: ', this.lifes);
                if (this.lifes <= 0) {
                    this.stop();
                    console.log('game over');
                }
            }
        });
        this.towers.forEach((x) => x.attack(this.enemies));
        this.canvas.update();
    }

    public stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
}
