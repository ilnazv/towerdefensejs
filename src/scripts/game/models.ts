import { defaultBlockSize } from './constants';

export interface IPoint {
    x: number;
    y: number;
}

export class Item {
    constructor(
        private position: IPoint,
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
    constructor(position: IPoint, blockSize = defaultBlockSize, color = 'red') {
        super(position, blockSize, color);
    }

    public draw(ctx: CanvasRenderingContext2D, color = this.color): void {
        ctx.fillStyle = color;
        ctx.fillRect(this.leftTopX, this.leftTopY, this.width, this.height);
    }
}
export class Tower extends Item {
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
}

export class Canvas {
    public emptyColor = 'white';

    constructor(
        private canvas: HTMLCanvasElement,
        private blockSize = defaultBlockSize
    ) {}

    get ctx(): CanvasRenderingContext2D {
        return this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    private drawMovable(item: Item, position?: IPoint): void {
        if (position) {
            item.draw(this.ctx, this.emptyColor);
            item.moveTo(position);
        }
        item.draw(this.ctx);
    }

    public drawTower(tower: Tower, position?: IPoint): void {
        this.drawMovable(tower, position);
    }

    public drawEnemy(enemy: Enemy, position: IPoint): void {
        this.drawMovable(enemy, position);
    }

    public drawPath(path: Path): void {
        path.draw(this.ctx);
    }
}

export class Path {
    constructor(public path: IPoint[], public color = 'gray') {}

    public getPointAtPercent(percent: number): IPoint {
        let length = 0;
        const percentPathMap = new Map<
            { start: number; end: number },
            number
        >();
        for (let index = 1; index < this.path.length; index++) {
            const point = this.path[index];
            const prevPoint = this.path[index - 1];
            const start = length;
            length += Math.abs(prevPoint.x - point.x + (prevPoint.y - point.y));
            percentPathMap.set(
                {
                    start,
                    end: length,
                },
                index
            );
        }
        const step = (length / 100) * percent;
        const sections = [...percentPathMap.keys()];
        const sectionKey = sections.find(
            ({ start, end }) => step >= start && step < end
        );
        const section = percentPathMap.get(sectionKey);
        const sectionPercent =
            (step - sectionKey.start) /
            ((sectionKey.end - sectionKey.start) / 100) /
            100;
        const point = this.path[section];
        const prevPoint = this.path[section - 1];
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
        for (let index = 0; index < this.path.length; index++) {
            const point = this.path[index];
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();
    }
}
