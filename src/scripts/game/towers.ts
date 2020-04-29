import {
    IPoint,
    PointHelper,
    IDrawable,
    getRandomArbitrary,
    IClickable,
} from './models';
import { defaultBlockSize } from './constants';
import { Enemy } from './enemy';

export class Item implements IDrawable {
    constructor(
        public position: IPoint,
        private blockSize = defaultBlockSize,
        public color = 'black'
    ) {}

    get x(): number {
        return this.position.x;
    }

    get y(): number {
        return this.position.y;
    }

    get leftTopX(): number {
        return this.position.x - this.blockSize / 2;
    }

    get leftTopY(): number {
        return this.position.y - this.blockSize / 2;
    }

    get leftTop(): IPoint {
        return {
            x: this.leftTopX,
            y: this.leftTopY,
        };
    }

    get width(): number {
        return this.blockSize;
    }

    get height(): number {
        return this.blockSize;
    }

    public moveTo(point: IPoint) {
        this.position = point;
    }

    public draw(ctx: CanvasRenderingContext2D, color = this.color): void {
        throw new Error('not implemented');
    }
}

export interface ITower extends IDrawable, IClickable {
    attack(enemies: Enemy[]): void;
}

export interface ITowerParams {
    damageStart: number;
    damageEnd: number;
    attackRange: number;
    attackSpeed: number;
}

export enum TowerType {
    SpearTower = 'SpearTower',
    SplashTower = 'SplashTower',
}

export const getTowerParams = (
    type: TowerType,
    level: number
): ITowerParams => {
    switch (type) {
        case TowerType.SpearTower:
            return {
                damageStart: 45,
                damageEnd: 65,
                attackRange: 100,
                attackSpeed: 5,
            };
        case TowerType.SplashTower:
            return {
                damageStart: 20,
                damageEnd: 40,
                attackRange: 50,
                attackSpeed: 2,
            };
    }
};

export class TowerFactory {
    static createTower(
        position: IPoint,
        type: TowerType,
        level: number
    ): ITower {
        switch (type) {
            case TowerType.SpearTower:
                const towerParams = getTowerParams(type, level);
                return new SpearTowerBase(position, towerParams);
            default:
                break;
        }
    }
}

export class SpearTowerBase extends Item implements ITower {
    public damageStart = 45;
    public damageEnd = 65;
    public attackRange = 100;
    public attackSpeed = 5;
    private attackCounter = 100;

    private get damage(): number {
        return getRandomArbitrary(this.damageStart, this.damageEnd);
    }

    private path: Path2D;

    constructor(
        position: IPoint,
        params: ITowerParams,
        blockSize = defaultBlockSize,
        color = 'blue'
    ) {
        super(position, blockSize, color);
        const { attackRange, attackSpeed, damageEnd, damageStart } = params;
        this.damageStart = damageStart;
        this.damageEnd = damageEnd;
        this.attackRange = attackRange;
        this.attackSpeed = attackSpeed;
    }
    onClickHandler(ctx: CanvasRenderingContext2D, point: IPoint): void {
        return;
    }
    pointInPath(ctx: CanvasRenderingContext2D, point: IPoint): boolean {
        return ctx.isPointInPath(this.path, point.x, point.y);
    }

    public draw(ctx: CanvasRenderingContext2D, color = this.color): void {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = color;
        this.path = new Path2D();
        this.path.arc(this.leftTopX, this.leftTopY, this.width, 0, 360);
        ctx.fill(this.path);
        ctx.closePath();
        this.drawAttackRange(ctx);
        ctx.restore();
    }

    private drawAttackRange(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.fillStyle = 'gray';
        ctx.arc(this.leftTopX, this.leftTopY, this.attackRange, 0, 360);
        ctx.stroke();
        ctx.closePath();
    }

    public attack(enemies: Enemy[]): void {
        if (this.attackCounter <= 100) {
            this.attackCounter += this.attackSpeed;
            return;
        }
        for (let index = 0; index < enemies.length; index++) {
            const enemy = enemies[index];
            if (
                !enemy.dead &&
                PointHelper.pointInsideCircle(
                    enemy,
                    this.position,
                    this.attackRange
                )
            ) {
                enemy.shootAt(this.damage, this.position);
                // console.log('enemy hp:', enemy.hp);
                this.attackCounter = 0;
                return;
            }
        }
        this.attackCounter = 0;
    }
}
