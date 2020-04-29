import { IDrawable, IClickable, IPoint } from '../../Models';
import { IButtonParams } from './Models';

export class Button implements IDrawable, IClickable {
    private path: Path2D;
    constructor(
        public text: string,
        public onClick: () => void,
        private params: IButtonParams = {
            buttonHeight: 50,
            buttonWidth: 100,
            leftTopX: 1,
            leftTopY: 2,
        }
    ) {}

    pointInPath(ctx: CanvasRenderingContext2D, point: IPoint): boolean {
        return ctx.isPointInPath(this.path, point.x, point.y);
    }

    onClickHandler(ctx: CanvasRenderingContext2D, point: IPoint): void {
        if (this.pointInPath(ctx, point)) {
            if (this.onClick) {
                this.onClick();
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, color = '#A9B665'): void {
        const radgrad = ctx.createRadialGradient(
            this.params.leftTopX + 45,
            this.params.leftTopY + 45,
            10,
            this.params.leftTopX + 52,
            this.params.leftTopY + 50,
            100
        );
        radgrad.addColorStop(0, '#A7D30C');
        radgrad.addColorStop(1, '#019F62');
        ctx.fillStyle = radgrad;
        this.path = new Path2D();
        this.path.rect(
            this.params.leftTopX,
            this.params.leftTopY,
            this.params.buttonWidth,
            this.params.buttonHeight
        );
        ctx.fill(this.path);
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        ctx.fillText(
            this.text,
            this.params.leftTopX + this.params.buttonWidth / 2,
            this.params.leftTopY + this.params.buttonHeight / 2
        );
    }
}
