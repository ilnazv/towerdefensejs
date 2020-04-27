import { IDrawable, ISize } from './models';

export class Canvas {
    public emptyColor = 'white';
    private items: IDrawable[] = [];

    constructor(private canvas: HTMLCanvasElement, private size: ISize) {}

    private get ctx(): CanvasRenderingContext2D {
        return this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    public add(...items: IDrawable[]): void {
        this.items.push(...items);
    }

    public update(): void {
        this.ctx.fillStyle = this.emptyColor;
        this.ctx.clearRect(0, 0, this.size.width, this.size.height);
        for (let index = 0; index < this.items.length; index++) {
            const item = this.items[index];
            item.draw(this.ctx);
        }
    }
}
