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

export interface ILevelSettings {
    enemiesNumber: number;
    enemiesMoveSpeed: number;
    enemiesColor: string;
    spawnSpeed: number;
}

export class TowerDefenseGame {
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
    private levels: Map<number, ILevelSettings> = new Map();
    private try = 0;
    private gameIsRunning = false;

    constructor(
        private htmlCanvas: HTMLCanvasElement,
        private blockSize = defaultBlockSize
    ) {
        this.canvas = new Canvas(htmlCanvas, this.canvasSize);
        this.levels.set(1, {
            enemiesColor: 'blue',
            enemiesMoveSpeed: 1,
            enemiesNumber: 3,
            spawnSpeed: 500,
        });
        this.levels.set(2, {
            enemiesColor: 'red',
            enemiesMoveSpeed: 0.1,
            enemiesNumber: 20,
            spawnSpeed: 500,
        });
    }

    public initialize(): void {
        this.progress = 0;
        this.lifes = 7;
        this.canvas = new Canvas(this.htmlCanvas, this.canvasSize);
        this.enemies = [];
        this.try++;
        this.showMainMenu();
    }

    private showMainMenu() {
        const mainMenu = new MainMenu(this.canvasSize, `Start`, () => {
            this.canvas.remove(mainMenu);
            this.canvas.update();
            this.start();
        });
        this.canvas.add(mainMenu);
        this.canvas.update();
    }

    private start(): void {
        this.canvas.add(...this.towers, this.path);
        this.intervalId = setInterval(() => {
            if (this.progress >= 100) {
                this.stop();
            } else {
                this.run();
            }
        }, 1000 / this.fps);
        this.gameIsRunning = true;
        this.startLevel(1);
    }

    private async startLevel(level) {
        if (this.gameIsRunning) {
            const result = await this.startEnemiesSpawn(level);
            if (result && this.gameIsRunning) {
                if (level < this.levels.size) {
                    const nextLevelButton = new MainMenu(
                        this.canvasSize,
                        `Start level: ${++level}`,
                        () => {
                            this.canvas.remove(nextLevelButton);
                            this.startLevel(level);
                        }
                    );
                    this.canvas.add(nextLevelButton);
                } else {
                    const playAgainMenu = new MainMenu(
                        this.canvasSize,
                        'You won!',
                        () => {
                            this.canvas.remove(playAgainMenu);
                            this.initialize();
                        }
                    );
                    this.canvas.add(playAgainMenu);
                }
            }
        }
    }

    private async startEnemiesSpawn(level: number): Promise<boolean> {
        console.log('level: ', level);
        let enemiesCounter = 1;
        const levelConfigs = this.levels.get(level);
        const spawnEnemy = () => {
            const newEnemy = new Enemy(
                this.path,
                levelConfigs.enemiesMoveSpeed,
                undefined,
                levelConfigs.enemiesColor
            );
            this.enemies.push(newEnemy);
            this.canvas.add(newEnemy);
        };
        spawnEnemy();
        return new Promise((resolve, reject) => {
            const enemySpawnInterval = setInterval(() => {
                if (enemiesCounter >= levelConfigs.enemiesNumber) {
                    if (enemySpawnInterval) {
                        clearInterval(enemySpawnInterval);
                    }
                    resolve(true);
                    return;
                }
                spawnEnemy();
                enemiesCounter++;
                if (!this.gameIsRunning) {
                    if (enemySpawnInterval) {
                        clearInterval(enemySpawnInterval);
                    }
                    resolve(false);
                }
            }, levelConfigs.spawnSpeed);
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
                    const gameOverMenu = new MainMenu(
                        this.canvasSize,
                        'Game over',
                        () => {
                            this.canvas.remove(gameOverMenu);
                            this.initialize();
                        }
                    );
                    this.canvas.add(gameOverMenu);
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
        this.gameIsRunning = false;
    }
}

export class MainMenu implements IDrawable, IClickable {
    private path: Path2D;
    constructor(
        private canvasSize: ISize,
        public text: string,
        public onClick?: () => void
    ) {}

    onClickHandler(ctx: CanvasRenderingContext2D, point: IPoint): void {
        if (ctx.isPointInPath(this.path, point.x, point.y)) {
            if (this.onClick) {
                this.onClick();
            }
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
            this.text,
            leftTopX + buttonWidth / 2,
            leftTopY + buttonHeight / 2
        );
    }
}
