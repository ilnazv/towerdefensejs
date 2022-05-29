import { IDrawable, IPoint } from '../Models';

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
        const sections = [...Array.from(this.percentPathMap.keys())];
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
        ctx.save();
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
        ctx.restore();
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
