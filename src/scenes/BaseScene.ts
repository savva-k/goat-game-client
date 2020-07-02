import 'phaser';

export class BaseScene extends Phaser.Scene {

    constructor(
        config: string | Phaser.Types.Scenes.SettingsConfig
    ) {
        super(config);
    }
        
    public get gameWidth(): number {
        return this.sys.game.config.width as number;
    }

    public get gameHeight(): number {
        return this.sys.game.config.height as number;
    }

    protected setView(): void {
        this.cameras.main.centerOn(0, 0);
    }

    protected createAnim(
        key: string,
        frames: Phaser.Types.Animations.AnimationFrame[],
        frameRate: number = 60,
        repeat: number = -1
    ) {
        this.anims.create({
            key: key,
            frames: frames,
            frameRate: frameRate,
            repeat: repeat
        });
    }

}