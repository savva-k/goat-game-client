export class Player {

    readonly AVATAR_WIDTH = 100;
    readonly AVATAR_HEIGHT = 100;

    private _avatar: Phaser.GameObjects.Image;
    private _x: number;
    private _y: number;
    private _current: boolean;

    name: Phaser.GameObjects.Text;
    selection: Phaser.GameObjects.Image;
    receiveCardX: number;
    receiveCardY: number;
    role: string;
    dealer: boolean;

    get x(): number {
        return this._x;
    }

    set x(x: number): void {
        this._x = x;
        this._avatar.setX(x);
        this.selection.setX(x);
        this.name.setX(x);
    }

    get y(): number {
        return this._y;
    }

    set y(y: number): void {
        this._y = y;
        this._avatar.setY(y);
        this.selection.setY(y);
        this.name.setY(y - this.AVATAR_HEIGHT / 2 - 15);
    }

    get avatar(): Phaser.GameObjects.Image {
        return this._avatar;
    }

    set avatar(avatar: Phaser.GameObjects.Image): void {
        this._avatar = avatar;
        this._avatar.displayWidth = this.AVATAR_WIDTH;
        this._avatar.displayHeight = this.AVATAR_HEIGHT;
    }

    get current(): boolean {
        return this._selected;
    }

    set current(current: boolean): void {
        this._current = current;
        this.selection.setFrame(this._current ? 1 : 0);
    }
}