import { IPoint } from './models';
import { Projectile } from './projectile';
import { defaultBlockSize } from './constants';
import { Item } from './towers';
import { Path } from './path';

export class Enemy extends Item {
    private progress = 0;
    private _dead = false;
    private _healthPoints = 100;

    private projectiles: Projectile[] = [];

    get dead(): boolean {
        return this._dead;
    }

    get hp(): number {
        return this._healthPoints;
    }

    constructor(
        private path: Path,
        private moveSpeed = 0.3,
        blockSize = defaultBlockSize,
        color = 'red'
    ) {
        super(path.points[0], blockSize, color);
    }

    public shootAt(dmg: number, towerPosition: IPoint): void {
        this.projectiles.push(new Projectile(dmg, towerPosition, this));
    }

    public doDamage(dmg: number): void {
        this._healthPoints -= dmg;
        if (this._healthPoints <= 0) {
            this._dead = true;
        }
    }

    public draw(ctx: CanvasRenderingContext2D, color = this.color): void {
        if (this.dead) {
            ctx.fillStyle = 'gray';
        } else {
            ctx.fillStyle = color;
        }
        ctx.fillRect(this.leftTopX, this.leftTopY, this.width, this.height);
        this.projectiles.forEach((x) => x.draw(ctx));
    }

    public moveForward(): boolean {
        const reachedProjectiles = this.projectiles.filter((x) =>
            x.moveForward()
        );
        if (reachedProjectiles.length > 0) {
            reachedProjectiles.forEach((x) => this.doDamage(x.dmg));
            this.projectiles = this.projectiles.filter(
                (x) => !reachedProjectiles.includes(x)
            );
        }
        if (this.dead) {
            return false;
        }
        const nextPoint = this.path.getPointAtPercent(this.progress);
        if (!nextPoint) {
            return;
        }
        this.moveTo(nextPoint);
        if (this.progress >= 100) {
            return true;
        }
        if (this.progress + this.moveSpeed > 100) {
            this.progress = 100;
            return true;
        }
        this.progress += this.moveSpeed;
        return false;
    }
}
