export class Button extends Phaser.Physics.Arcade.Sprite {

    public static readonly BUTTON_IDLE = 0;
    public static readonly BUTTON_HOVER = 1;
    public static readonly BUTTON_PRESSED = 2;

    public text: string;

    constructor(scene: Phaser.Scene, x: number, y: number, text: string, frame?: string | integer) {
        super(scene, x, y, 'button', frame);
        this.text = text;
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