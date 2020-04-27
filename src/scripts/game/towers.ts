import { IPoint, PointHelper, IDrawable, getRandomArbitrary } from './models';
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
export class Tower extends Item {
    private damageStart = 45;
    private damageEnd = 65;
    private attackRange = 100;
    private attackSpeed = 5;
    private attackCounter = 100;

    private get damage(): number {
        return getRandomArbitrary(this.damageStart, this.damageEnd);
    }

    constructor(
        position: IPoint,
        blockSize = defaultBlockSize,
        color = 'blue'
    ) {
        super(position, blockSize, color);
    }

    public draw(ctx: CanvasRenderingContext2D, color = this.color): void {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.leftTopX, this.leftTopY, this.width, 0, 360);
        ctx.fill();
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
