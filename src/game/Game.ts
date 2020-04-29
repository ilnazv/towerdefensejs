import { Path } from './Components/Path';
import { ITower, TowerType } from './Components/Towers/Models';
import { TowerFactory } from './Components/Towers/Towers';
import { Canvas } from './Components/Canvas';
import { CommandBar } from './Components/CommandBar';
import { Button } from './Components/BasicElements/Button';
import { Enemy } from './Components/Enemies/Enemy';
import { IWaveSettings } from './Models';
import { defaultPath } from './Constants';

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
    private lifes = 7;
    private canvasSize = { width: 600, height: 400 };
    private waves: Map<number, IWaveSettings> = new Map();
    private gameIsRunning = false;

    constructor(private htmlCanvas: HTMLCanvasElement) {
        this.canvas = new Canvas(htmlCanvas, this.canvasSize);
        this.waves.set(1, {
            enemiesColor: 'blue',
            enemiesMoveSpeed: 1,
            enemiesNumber: 3,
            spawnSpeed: 500,
        });
        this.waves.set(2, {
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
        this.lifes = 7;
        this.canvas = new Canvas(this.htmlCanvas, this.canvasSize);
        this.enemies = [];
        this.canvas.add(...this.towers, this.path);
        this.showMainMenu();
    }

    private readonly bottomRightButton = {
        buttonHeight: 50,
        buttonWidth: 100,
        leftTopX: this.canvasSize.width - 100,
        leftTopY: this.canvasSize.height - 50,
    };

    private showMainMenu(): void {
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
            this.run();
        }, 1000 / this.fps);
        this.gameIsRunning = true;
        this.startLevel(1);
    }

    private async startLevel(level: number): Promise<void> {
        if (this.gameIsRunning) {
            const result = await this.startEnemiesSpawn(level);
            if (result && this.gameIsRunning) {
                if (level < this.waves.size) {
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
        const levelConfigs = this.waves.get(level);
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

    private stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.gameIsRunning = false;
    }
}