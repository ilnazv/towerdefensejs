import { IDrawable, ISize } from '../Models';

export class CommandBar implements IDrawable {
    private readonly barHeight = 100;
    constructor(private canvasSize: ISize) {}

    draw(ctx: CanvasRenderingContext2D, color?: string): void {
        ctx.fillStyle = 'green';
        ctx.fillRect(0, 0, this.canvasSize.width, this.barHeight);
        this.drawMenuItems();
    }

    private drawMenuItems(): void {}
}
