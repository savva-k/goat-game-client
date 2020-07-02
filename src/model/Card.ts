export class Card extends Phaser.Physics.Arcade.Sprite {

    public face: String;

    constructor(scene: Phaser.Scene, x: number, y: number, frame?: string | integer) {
        super(scene, x, y, 'cards', frame);
        this.setInteractive({ draggable: true })
        .on('dragstart', function(pointer, dragX, dragY){
            // ...
        })
        .on('drag', function(pointer, dragX, dragY){
            this.setPosition(dragX, dragY);
        })
        .on('dragend', function(pointer, dragX, dragY, dropped){
            
        })
    }
}