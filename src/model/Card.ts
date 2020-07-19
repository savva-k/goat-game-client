export class Card extends Phaser.Physics.Arcade.Sprite {

    public suite: string;
    public rank: string;
    public reachedDestination = false;
    public switchLigting: () => void;

    public startX: number;
    public startY: number;

    constructor(scene: Phaser.Scene, x: number, y: number, frame?: string | integer) {
        super(scene, x, y, 'cards', frame);
        this.setInteractive();
        this.scene.input.setDraggable(this);
        this.on('dragstart', function(pointer, dragX, dragY){
            this.startX = this.x;
            this.startY = this.y;
            this.switchLigting();
        }, this)
        .on('drag', function(pointer, dragX, dragY){
            this.setPosition(dragX, dragY);
        })
        .on('dragend', function(pointer, dragX, dragY, dropped){
            this.switchLigting();
            this.setPosition(this.startX, this.startY);
        }, this);
    }
}