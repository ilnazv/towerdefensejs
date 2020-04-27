import { IDrawable, IPoint } from './models';
import { Enemy } from './enemy';

export class Projectile implements IDrawable {
    private progress = 0;
    private speed = 0.3;

    constructor(
        public dmg: number,
        private position: IPoint,
        private target: Enemy
    ) {}

    public draw(ctx: CanvasRenderingContext2D, color = 'green'): void {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.position.x, this.position.y, 2, 0, 360);
        ctx.fill();
        ctx.closePath();
    }

    public moveForward(): boolean {
        const targetPosition = this.target.position;
        var dx = targetPosition.x - this.position.x;
        var dy = targetPosition.y - this.position.y;
        var X = this.position.x + dx * this.progress;
        var Y = this.position.y + dy * this.progress;
        this.position = { x: Math.round(X), y: Math.round(Y) };
        this.progress += this.speed;
        return this.progress >= 1;
    }
}
