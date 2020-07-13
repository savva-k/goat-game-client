import { Game } from "./Game";

let config = {
    type: Phaser.AUTO,
    parent: "app",
    width: 667,
    height: 375,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    dom: {
        createContainer: true
    },
    title: "Likinsky Kozel – online card game",
    physics: {
        default: 'arcade',
        arcade: {
            debug: true
        }
    }
}

function run(): void {
    new Game(config);
}

window.onload = run;