import { IPoint, IDrawable, ISize, IClickable } from './models';
import { defaultBlockSize } from './constants';
import { Path } from './path';
import { SpearTowerBase, ITower, TowerFactory, TowerType } from './towers';
import { Enemy } from './enemy';
import { Canvas } from './canvas';
import { CommandBar } from './menu';

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
    private towers: ITower[] = [
        TowerFactory.createTower(
            {
                x: 50,
                y: 50,
            },
            TowerType.SpearTower,
            1
        ),
        TowerFactory.createTower(
            {
                x: 100,
                y: 250,
            },
            TowerType.SpearTower,
            1
        ),
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

    public testMode(): void {
        const commandBar = new CommandBar(this.canvasSize);
        this.canvas.add(commandBar);
        this.canvas.update();
    }

    public initialize(): void {
        this.progress = 0;
        this.lifes = 7;
        this.canvas = new Canvas(this.htmlCanvas, this.canvasSize);
        this.enemies = [];
        this.try++;
        this.canvas.add(...this.towers, this.path);
        this.showMainMenu();
    }

    private bottomRightButton = {
        buttonHeight: 50,
        buttonWidth: 100,
        leftTopX: this.canvasSize.width - 100,
        leftTopY: this.canvasSize.height - 50,
    };

    private showMainMenu() {
        const startButton = new Button(
            `Start`,
            () => {
                this.canvas.remove(startButton);
                this.canvas.update();
                this.start();
            },
            this.bottomRightButton
        );
        this.canvas.add(startButton);
        this.canvas.update();
    }

    private start(): void {
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
                    const nextLevelButton = new Button(
                        `Start level: ${++level}`,
                        () => {
                            this.canvas.remove(nextLevelButton);
                            this.startLevel(level);
                        },
                        {
                            ...this.bottomRightButton,
                            buttonWidth: 150,
                            leftTopX: this.canvasSize.width - 150,
                        }
                    );
                    this.canvas.add(nextLevelButton);
                } else {
                    const playAgainMenu = new Button(
                        'You won!',
                        () => {
                            this.canvas.remove(playAgainMenu);
                            this.initialize();
                        },
                        this.bottomRightButton
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
                    const gameOverMenu = new Button(
                        'Game over',
                        () => {
                            this.canvas.remove(gameOverMenu);
                            this.initialize();
                        },
                        this.bottomRightButton
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

export class Button implements IDrawable, IClickable {
    private path: Path2D;
    constructor(
        public text: string,
        public onClick: () => void,
        private params: {
            leftTopX: number;
            leftTopY: number;
            buttonWidth: number;
            buttonHeight: number;
        } = {
            buttonHeight: 50,
            buttonWidth: 100,
            leftTopX: 1,
            leftTopY: 2,
        }
    ) {}

    pointInPath(ctx: CanvasRenderingContext2D, point: IPoint): boolean {
        return ctx.isPointInPath(this.path, point.x, point.y);
    }

    onClickHandler(ctx: CanvasRenderingContext2D, point: IPoint): void {
        if (this.pointInPath(ctx, point)) {
            if (this.onClick) {
                this.onClick();
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, color = '#A9B665'): void {
        const radgrad = ctx.createRadialGradient(
            this.params.leftTopX + 45,
            this.params.leftTopY + 45,
            10,
            this.params.leftTopX + 52,
            this.params.leftTopY + 50,
            100
        );
        radgrad.addColorStop(0, '#A7D30C');
        radgrad.addColorStop(1, '#019F62');
        ctx.fillStyle = radgrad;
        this.path = new Path2D();
        this.path.rect(
            this.params.leftTopX,
            this.params.leftTopY,
            this.params.buttonWidth,
            this.params.buttonHeight
        );
        ctx.fill(this.path);
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        ctx.fillText(
            this.text,
            this.params.leftTopX + this.params.buttonWidth / 2,
            this.params.leftTopY + this.params.buttonHeight / 2
        );
    }
}
