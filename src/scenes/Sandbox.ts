import { BaseScene } from "./BaseScene";
import { Card } from "../model/Card";
import { Point } from "../model/Point"
import { Player } from "../model/Player";

export class Sandbox extends BaseScene {

    constructor(
        config: string | Phaser.Types.Scenes.SettingsConfig,
    ) {
        super(config);
    }


    private colors: Array<string> = ['S', 'D', 'H', 'C'];
    private faces: Array<string> = ['2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'D', 'K', 'A'];

    private players: Array<Player> = [];

    private cards: Card[] = [];

    private positions: Array<any> = [
        {
            x: 500,
            y: 190,
            type: 'player'
        },
        {
            x: 340,
            y: 300,
            type: 'player'
        },
        {
            x: 180,
            y: 190,
            type: 'player'
        },
        {
            x: 340,
            y: 75,
            type: 'talon'
        }
    ];

    private cardsInTalon = 0;
    private giveCardsLap = 0;

    private player: Phaser.Physics.Arcade.Sprite;

    public preload(): void {
        this.load.setBaseURL('/src');
        this.load.image('background', './assets/table_background.jpg');
        this.load.image('player1', './assets/player_avatars/1.png');
        this.load.image('player2', './assets/player_avatars/2.png');
        this.load.image('player3', './assets/player_avatars/3.png');
        //this.load.image('ground', './assets/ground.png');
        this.load.spritesheet('cards', './assets/cards.png', { frameWidth: 62, frameHeight: 84 });
        this.load.spritesheet('player-selection', './assets/player_selection.png', { frameWidth: 102, frameHeight: 102 });
        //this.load.spritesheet('player', './assets/player.png', { frameWidth: 64, frameHeight: 64 });
        
    }

    public create(): void {
        this.createBackround();
        this.generateCards();
        this.shuffleDeck();
        this.createPlayers();

        this.giveCards([...this.cards], 0);

    }

    public update(): void {
    }


    private createBackround() {
        this.add.image(400, 300, 'background');
    }

    private giveCards(cards: Array<Card>, position: number) {
        if (cards.length == 0) return;
        if (position >= this.positions.length) position = 0;
        let cardDestination = this.positions[position];

        if (cardDestination.type === 'talon') {
            if (this.cardsInTalon >= 2 || this.giveCardsLap < 2) {
                this.giveCards(cards, ++position);
                this.giveCardsLap++;
                return;
            } else {
                this.cardsInTalon++;
            }
        }

        let card = cards.pop();
        console.dir(card);
        this.children.bringToTop(card);

        let tween = this.tweens.add({
            targets: card,
            // alpha: 1,
            // alpha: '+=1',
            ...cardDestination,
            ease: 'Cubic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 400,
            repeat: 0,            // -1: infinity
            yoyo: false
        });
        tween.setCallback('onComplete', () => {
            this.giveCards(cards, ++position);
        }, []);
    }

    private createPlayers() {
        // let positions:any = {
        //     player1: [ new Point(300, 300) ],
        //     player2: [],
        //     player3: [],
        // };

        
        let playersGroup = this.physics.add.staticGroup([
            this.add.image(75, 75, 'player2'),
            this.add.image(75, 75, 'player-selection', 0),
            this.add.image(592, 75, 'player1'),
            this.add.image(592, 75, 'player-selection', 1),
            this.add.image(75, 300, 'player3'),
            this.add.image(75, 300, 'player-selection', 1)
        ]);

        playersGroup.children.each((player: Phaser.GameObjects.Image) => {
            player.displayWidth = 100;
            player.displayHeight = 100;
        })


    }

    private shuffleDeck() {
        let x = 75;
        let y = 75;
        this.cards = this.shuffle(this.cards);

        for (let card of this.cards) {
            card.x = x;
            card.y = y;
        }
    }

    private getFrameByCardFace(face: string): integer {
        let color = face.charAt(0);
        let value = face.charAt(1);
        let row = this.colors.indexOf(color);
        let column = this.faces.indexOf(value);
        return this.faces.length * row + column;
    }

    private generateCards() {
        let x = 305;
        let y = 305;

        for (let color of this.colors) {
            for (let face of this.faces) {
                let cardValue = color + face;
                let card = new Card(this, x, y, this.getFrameByCardFace(cardValue))
                card.face = cardValue;;
                this.add.existing(card);
                this.cards.push(card);
            }
        }
    }

    private shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

}