import { IDrawable, IPoint, ISize, IClickable } from '../Models';
import { Item } from './Towers/Towers';
import { ITower } from './Towers/Models';
import { log } from '../Utils';

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

    private handleTouchstart(ev: TouchEvent): void {
        const touchPoint = ev.touches.length && ev.touches[0];
        const point: IPoint = {
            x: touchPoint.pageX - this.htmlCanvas.offsetLeft,
            y: touchPoint.pageY - this.htmlCanvas.offsetTop,
        };
        log(`handleTouchstart: ${JSON.stringify(point)}`);
        this.handleOnClick(point);
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

    private handleTouchmove(ev: TouchEvent): void {
        const touchPoint = ev.touches.length && ev.touches[0];
        const coords: IPoint = {
            x: touchPoint.pageX - this.htmlCanvas.offsetLeft,
            y: touchPoint.pageY - this.htmlCanvas.offsetTop,
        };
        if (this.dragItem) {
            this.dragItem.moveTo(coords);
            this.update();
        }
    }

    private handleMouseup(_ev: MouseEvent): void {
        this.dragItem = undefined;
    }

    private handleTouchend(_ev: TouchEvent): void {
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
        htmlCanvas.addEventListener('touchstart', (ev) =>
            this.handleTouchstart(ev)
        );
        htmlCanvas.addEventListener('mousemove', (ev) =>
            this.handleMousemove(ev)
        );
        htmlCanvas.addEventListener('touchmove', (ev) =>
            this.handleTouchmove(ev)
        );
        htmlCanvas.addEventListener('mouseup', (ev) =>
            this.handleMouseup(ev as MouseEvent)
        );
        htmlCanvas.addEventListener('touchend', (ev) =>
            this.handleTouchend(ev)
        );
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
