import { defaultBlockSize } from './constants';

export interface IPoint {
    x: number;
    y: number;
}

export class PointHelper {
    static pointInsideRect(
        point: IPoint,
        rectCenter: IPoint,
        size: ISize
    ): boolean {
        const xInside =
            point.x >= rectCenter.x - size.width / 2 &&
            point.x <= rectCenter.x + size.width / 2;
        const yInside =
            point.y >= rectCenter.y - size.width / 2 &&
            point.y <= rectCenter.y + size.width / 2;
        return xInside && yInside;
    }

    static pointInsideCircle(
        point: IPoint,
        circleCenter: IPoint,
        radius: number
    ): boolean {
        return (
            Math.sqrt(
                (point.x - circleCenter.x) ** 2 +
                    (point.y - circleCenter.y) ** 2
            ) < radius
        );
    }
}

export interface IDrawable {
    draw(ctx: CanvasRenderingContext2D, color?: string): void;
}

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

    /**
     * @deprecated
     */
    public pointInside(point: IPoint): boolean {
        const xInside = point.x >= this.x && point.x <= this.x + this.blockSize;
        const yInside = point.y >= this.y && point.y <= this.y + this.blockSize;
        return xInside && yInside;
    }

    public draw(ctx: CanvasRenderingContext2D, color = this.color): void {
        throw new Error('not implemented');
    }
}

export class Enemy extends Item {
    private progress = 0;
    private _dead = false;
    private healthPoints = 100;

    get dead(): boolean {
        return this._dead;
    }

    constructor(
        private path: Path,
        blockSize = defaultBlockSize,
        color = 'red',
        private moveSpeed = 0.3
    ) {
        super(path.points[0], blockSize, color);
    }

    public doDamage(dmg: number): void {
        this.healthPoints -= dmg;
        if (this.healthPoints <= 0) {
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
    }

    public moveForward(): boolean {
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

export class Tower extends Item {
    private damage = 1;

    constructor(
        position: IPoint,
        blockSize = defaultBlockSize,
        color = 'blue'
    ) {
        super(position, blockSize, color);
    }

    public draw(ctx: CanvasRenderingContext2D, color = this.color): void {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.leftTopX, this.leftTopY, this.width, 0, 360);
        ctx.fill();
        ctx.closePath();
    }

    public attack(enemies: Enemy[]): void {
        for (let index = 0; index < enemies.length; index++) {
            const enemy = enemies[index];
            if (PointHelper.pointInsideCircle(enemy, this.position, 100)) {
                enemy.doDamage(this.damage);
            }
        }
    }
}

export interface ISize {
    width: number;
    height: number;
}

export class Canvas {
    public emptyColor = 'white';
    private items: IDrawable[] = [];

    constructor(
        private canvas: HTMLCanvasElement,
        private size: ISize,
        private blockSize = defaultBlockSize
    ) {}

    private get ctx(): CanvasRenderingContext2D {
        return this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    public add(...items: IDrawable[]): void {
        this.items.push(...items);
    }

    public update(): void {
        this.ctx.fillStyle = this.emptyColor;
        this.ctx.fillRect(0, 0, this.size.width, this.size.height);
        for (let index = 0; index < this.items.length; index++) {
            const item = this.items[index];
            item.draw(this.ctx);
        }
    }
}

export class Path implements IDrawable {
    private percentPathMap = new Map<{ start: number; end: number }, number>();
    private length = 0;

    constructor(public points: IPoint[], public color = 'gray') {
        this.calculateSections();
    }

    private calculateSections(): void {
        for (let index = 1; index < this.points.length; index++) {
            const point = this.points[index];
            const prevPoint = this.points[index - 1];
            const start = this.length;
            this.length += Math.abs(
                prevPoint.x - point.x + (prevPoint.y - point.y)
            );
            this.percentPathMap.set(
                {
                    start,
                    end: this.length,
                },
                index
            );
        }
    }

    public getPointAtPercent(percent: number): IPoint {
        const step = (this.length / 100) * percent;
        const sections = [...this.percentPathMap.keys()];
        const sectionKey = sections.find(
            ({ start, end }) => step >= start && step <= end
        );
        const section = this.percentPathMap.get(sectionKey);
        if (!section) {
            return null;
        }
        const sectionPercent =
            (step - sectionKey.start) /
            ((sectionKey.end - sectionKey.start) / 100) /
            100;
        const point = this.points[section];
        const prevPoint = this.points[section - 1];
        var dx = point.x - prevPoint.x;
        var dy = point.y - prevPoint.y;
        var X = prevPoint.x + dx * sectionPercent;
        var Y = prevPoint.y + dy * sectionPercent;
        return { x: Math.round(X), y: Math.round(Y) };
    }

    public draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.setLineDash([5, 15]);
        ctx.lineCap = 'round';
        for (let index = 0; index < this.points.length; index++) {
            const point = this.points[index];
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();
        this.drawStartEnd(ctx);
    }

    private drawStartEnd(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.fillStyle = 'orange';
        ctx.arc(this.points[0].x, this.points[0].y, 10, 0, 360);
        ctx.arc(
            this.points[this.points.length - 1].x,
            this.points[this.points.length - 1].y,
            10,
            0,
            360
        );
        ctx.fill();
        ctx.closePath();
    }
}
