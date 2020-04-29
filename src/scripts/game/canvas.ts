import { IDrawable, ISize, IPoint, IClickable } from './models';
import { ITower, Item } from './towers';

export class Canvas {
    public emptyColor = 'white';
    private items: IDrawable[] = [];

    private dragItem: Item;

    private handleMousedown(ev: MouseEvent): void {
        const point: IPoint = {
            x: ev.offsetX,
            y: ev.offsetY,
        };
        this.dragItem = this.items
            .filter((x) => ((x as unknown) as ITower).pointInPath)
            .find((x) =>
                ((x as unknown) as ITower).pointInPath(this.ctx, point)
            ) as Item;
    }

    private handleMousemove(ev: MouseEvent): void {
        const coords: IPoint = {
            x: ev.offsetX,
            y: ev.offsetY,
        };
        if (this.dragItem) {
            this.dragItem.moveTo(coords);
            this.update();
        }
    }

    private handleMouseup(ev: MouseEvent): void {
        this.dragItem = undefined;
    }

    private handleMouseClicks(ev: MouseEvent): void {
        this.handleOnClick({
            x: ev.offsetX,
            y: ev.offsetY,
        });
    }

    constructor(private htmlCanvas: HTMLCanvasElement, private size: ISize) {
        htmlCanvas.addEventListener('mousedown', (ev) =>
            this.handleMousedown(ev)
        );
        htmlCanvas.addEventListener('mousemove', (ev) =>
            this.handleMousemove(ev)
        );
        htmlCanvas.addEventListener('mouseup', (ev) => this.handleMouseup(ev));
        htmlCanvas.addEventListener('click', (ev) =>
            this.handleMouseClicks(ev)
        );
    }

    private get ctx(): CanvasRenderingContext2D {
        return this.htmlCanvas.getContext('2d') as CanvasRenderingContext2D;
    }

    public add(...items: IDrawable[]): void {
        this.items.push(...items);
    }

    public remove(...items: IDrawable[]): void {
        this.items = this.items.filter((x) => !items.includes(x));
    }

    public update(): void {
        this.ctx.fillStyle = this.emptyColor;
        this.ctx.clearRect(0, 0, this.size.width, this.size.height);
        for (let index = 0; index < this.items.length; index++) {
            const item = this.items[index];
            item.draw(this.ctx);
        }
    }

    public handleOnClick(point: IPoint): void {
        this.items
            .filter((x) => ((x as unknown) as IClickable).onClickHandler)
            .forEach((x) =>
                ((x as unknown) as IClickable).onClickHandler(this.ctx, point)
            );
    }
}
