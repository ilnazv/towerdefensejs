import { IPoint, IDrawable, ISize, IClickable } from './models';
import { defaultBlockSize } from './constants';
import { Path } from './path';
import { Tower } from './towers';
import { Enemy } from './enemy';
import { Canvas } from './canvas';

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

    private handleMouseClicks(ev: MouseEvent): void {
        this.canvas.handleOnClick({
            x: ev.offsetX,
            y: ev.offsetY,
        });
    }

    private towers: Tower[] = [
        new Tower({
            x: 50,
            y: 50,
        }),
        new Tower({
            x: 100,
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
    private canvasSize = { width: 600, height: 400 };

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
        htmlCanvas.addEventListener('startgame', this.start);
        htmlCanvas.addEventListener('click', (ev) =>
            this.handleMouseClicks(ev)
        );
        this.canvas = new Canvas(htmlCanvas, this.canvasSize);
    }

    public initialize(): void {
        // this.start();
        this.showMainMenu();
    }

    private showMainMenu() {
        this.canvas.add(
            new MainMenu(this.canvasSize, () => console.log('start click'))
        );
        this.canvas.update();
    }

    private start(): void {
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
        const enemiesNumber = level === 1 ? 3 : 20;
        const spawnSpeed = level === 1 ? 1000 : 500;
        const moveSpeed = level === 1 ? 0.2 : 0.1;
        const spawnEnemy = () => {
            const newEnemy = new Enemy(this.path, moveSpeed);
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
                    return;
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

export class MainMenu implements IDrawable, IClickable {
    private path: Path2D;
    constructor(
        private canvasSize: ISize,
        private onClickHandler: () => void
    ) {}

    onClick(ctx: CanvasRenderingContext2D, point: IPoint): void {
        if (ctx.isPointInPath(this.path, point.x, point.y)) {
            this.onClickHandler();
        }
    }

    draw(ctx: CanvasRenderingContext2D, color = '#A9B665'): void {
        const buttonWidth = 100;
        const buttonHeight = 50;
        const leftTopX = this.canvasSize.width / 2 - buttonWidth / 2;
        const leftTopY = this.canvasSize.height / 2 - buttonHeight / 2;
        const radgrad = ctx.createRadialGradient(
            leftTopX + 45,
            leftTopY + 45,
            10,
            leftTopX + 52,
            leftTopY + 50,
            100
        );
        radgrad.addColorStop(0, '#A7D30C');
        radgrad.addColorStop(1, '#019F62');
        ctx.fillStyle = radgrad;
        this.path = new Path2D();
        this.path.rect(leftTopX, leftTopY, buttonWidth, buttonHeight);
        ctx.fill(this.path);
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        ctx.fillText(
            'Start',
            leftTopX + buttonWidth / 2,
            leftTopY + buttonHeight / 2
        );
        // ctx.isPointInPath();
    }
}
