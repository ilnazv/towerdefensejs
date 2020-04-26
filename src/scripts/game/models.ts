import { defaultBlockSize } from './constants';

export interface IPoint {
    x: number;
    y: number;
}

export class Tower {
    /**
     *
     */
    constructor(
        private position: IPoint,
        private blockSize = defaultBlockSize
    ) {}

    get x(): number {
        return this.position.x;
    }

    get y(): number {
        return this.position.y;
    }

    public moveTo(point: IPoint) {
        this.position = point;
    }

    public pointInside(point: IPoint): boolean {
        const xInside = point.x >= this.x && point.x <= this.x + this.blockSize;
        const yInside = point.y >= this.y && point.y <= this.y + this.blockSize;
        return xInside && yInside;
    }
}

export class Canvas {
    private emptyColor = 'white';
    private brushColor = 'black';
    /**
     *
     */
    constructor(
        private canvas: HTMLCanvasElement,
        private blockSize = defaultBlockSize
    ) {}

    private get ctx(): CanvasRenderingContext2D {
        return this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    public drawTower(position: IPoint, tower: Tower): void {
        this.ctx.fillStyle = this.emptyColor;
        this.ctx.fillRect(
            tower.x - this.blockSize / 2,
            tower.y - this.blockSize / 2,
            this.blockSize,
            this.blockSize
        );
        this.ctx.fillStyle = this.brushColor;
        this.ctx.fillRect(
            position.x - this.blockSize / 2,
            position.y - this.blockSize / 2,
            this.blockSize,
            this.blockSize
        );
        tower.moveTo(position);
    }

    public drawPath(path: Path): void {
        this.ctx.fillStyle = this.brushColor;
        this.ctx.beginPath();
        this.ctx.setLineDash([5, 15]);
        this.ctx.lineCap = 'round';
        for (let index = 0; index < path.path.length; index++) {
            const point = path.path[index];
            if (index === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        this.ctx.stroke();
    }
}

export class Path {
    /**
     *
     */
    constructor(public path: IPoint[]) {}

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
}
