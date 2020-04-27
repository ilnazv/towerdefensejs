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

export interface IClickable {
    onClick(ctx: CanvasRenderingContext2D, point: IPoint): void;
}

export function getRandomArbitrary(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export interface ISize {
    width: number;
    height: number;
}
