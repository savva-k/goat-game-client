import { BaseScene } from "./BaseScene";
import { Card } from "../model/Card";

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

export class Sandbox extends BaseScene {

    constructor(
        config: string | Phaser.Types.Scenes.SettingsConfig,
    ) {
        super(config);
    }

    private colors: Array<string> = ['CLUBS', 'HEARTS', 'DIAMONDS', 'SPADES'];
    private faces: Array<string> = ['TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT',
                                    'NINE', 'TEN', 'JACK', 'QUEEN', 'KING', 'ACE'];

    private socket: Client;
    private gameStateSubscription: StompSubscription;
    private tableId: string;
    private players: Array<Player> = [];

    private cards: Card[] = [];

    private cardGroups = new Map<string, Phaser.GameObjects.Group>();

    private positions: Array<CardDestination> = [
        {
            x: 500,
            y: 190,
            type: 'player1'
        },
        {
            x: 340,
            y: 300,
            type: 'player2'
        },
        {
            x: 180,
            y: 190,
            type: 'player3'
        },
        {
            x: 340,
            y: 75,
            type: 'talon'
        }
    ];

    public init(data: any) {
        this.socket = data.socket;
        this.tableId = data.tableId;
    }

    public create(): void {
        this.gameStateSubscription = this.socket.subscribe('/topic/games/' + this.tableId + '/state', (message: IMessage) => {
            console.dir(message.body);
        });

        this.createBackround();
        this.createPlayers();
        this.giveCards();
    }

    public update(): void {
    }


    private createBackround() {
        this.add.image(400, 300, 'background');
    }

    private giveCards() {
        let cardsInTalon = 0;
        let position = 0;

        for (let currentIteration = 0; currentIteration < 26; currentIteration++) {
            if (position >= this.positions.length) position = 0;
            let card = this.generateCard();
            let cardDestination = this.positions[position];

            if (cardDestination.type === 'talon') {
                if (cardsInTalon < 2 && currentIteration > 9) {
                    cardsInTalon++;
                } else {
                    if (++position >= this.positions.length) position = 0;
                    cardDestination = this.positions[position];
                }
            }

            this.time.addEvent({
                delay: currentIteration * 300,
                callback: () => {
                    this.moveCard(card, cardDestination);
                }
            });
            
            if (!this.cardGroups.get(cardDestination.type)) {
                this.cardGroups.set(cardDestination.type, this.add.group());
            }
            this.cardGroups.get(cardDestination.type).add(card);

            position++;
        }
    }

    private moveCard(card: Card, cardDestination: CardDestination) {
        let tween = this.tweens.add({
            targets: card,
            ...cardDestination,
            ease: 'Cubic',
            duration: 400,
            repeat: 0,
            yoyo: false
        });
        this.sound.play('take-card-sound');
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

    private getFrameByCardFace(face: string): integer {
        let color = face.charAt(0);
        let value = face.charAt(1);
        let row = this.colors.indexOf(color);
        let column = this.faces.indexOf(value);
        return this.faces.length * row + column;
    }

    private generateCard(): Card {
        let x = 75;
        let y = 75;

        let card = new Card(this, x, y, 52);
        this.add.existing(card);
        this.cards.push(card);
        return card;
    }

}