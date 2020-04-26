const blockSize = 10;
export class Tower {
    /**
     *
     */
    constructor(position, blockSize = blockSize) {
        this.position = position;
        this.blockSize = blockSize;
    }
    get x() {
        return this.position.x;
    }
    get y() {
        return this.position.y;
    }
    moveTo(point) {
        this.position = point;
    }
    pointInside(point) {
        const xInside = point.x >= this.position.x &&
            point.x <= this.position.x + this.blockSize;
        const yInside = point.y >= this.position.y &&
            point.y <= this.position.y + this.blockSize;
        return xInside && yInside;
    }
}
export class TowerDefenseGame {
    constructor(canvas, blockSize = blockSize) {
        this.canvas = canvas;
        this.blockSize = blockSize;
        this.dragTower = false;
        this.tower = new Tower({
            x: 10,
            y: 10,
        });
        canvas.addEventListener('mousedown', (ev) => this.handleMousedown(ev));
        canvas.addEventListener('mousemove', (ev) => this.handleMousemove(ev));
        canvas.addEventListener('mouseup', (ev) => this.handleMouseup(ev));
    }
    get ctx() {
        return this.canvas.getContext('2d');
    }
    handleMousedown(ev) {
        const coords = {
            x: ev.offsetX,
            y: ev.offsetY,
        };
        if (this.tower.pointInside(coords)) {
            this.dragTower = true;
        }
    }
    handleMousemove(ev) {
        const coords = {
            x: ev.offsetX,
            y: ev.offsetY,
        };
        if (this.dragTower) {
            this.drawTower(coords);
        }
    }
    handleMouseup(ev) {
        this.dragTower = false;
    }
    drawTower(position) {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.tower.x, this.tower.y, this.blockSize, this.blockSize);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(position.x, position.y, this.blockSize, this.blockSize);
        this.tower.moveTo(position);
    }
    start() {
        console.log('game started');
        this.drawTower(this.tower);
    }
}
//# sourceMappingURL=game.js.map