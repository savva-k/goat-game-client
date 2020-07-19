import { BaseScene } from "./BaseScene";
import { Card } from "../model/Card";
import { Player } from "../model/Player";

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

export class Sandbox extends BaseScene {

    constructor(
        config: string | Phaser.Types.Scenes.SettingsConfig,
    ) {
        super(config);
    }

    readonly CARDS_NUMBER = 25;
    readonly CARD_SHIRT_FRAME = 52;
    readonly GIVE_CARD_DELAY = 300;
    readonly TALON_DESTINATION = 'talon';

    private suits: Array<string> = ['CLUBS', 'HEARTS', 'DIAMONDS', 'SPADES'];
    private ranks: Array<string> = ['TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT',
                                    'NINE', 'TEN', 'JACK', 'QUEEN', 'KING', 'ACE'];

    private socket: Client;
    private gameStateSubscription: StompSubscription;
    private neighbourPlayersSubscription: StompSubscription;

    private grabCardsEvent: Phaser.Time.TimerEvent;

    private state: GameState;

    private currentPlayer: Player;
    private leftNeighbour: Player;
    private rightNeighbour: Player;
    private players: Array<Player> = [];
    private talon: Talon;

    private cardGroups = new Map<string, Phaser.GameObjects.Group>();
    private cards: Array<Card> = [];

    public init(data: any) {
        this.socket = data.socket;
        this.state = data.state;
        this.talon = {
            receiveCardX: 340,
            receiveCardY: 75,
            cardsCount: 0
         };
         console.dir(this.state);
    }

    public create(): void {
        this.gameStateSubscription = this.socket.subscribe('/user/topic/games/' + this.state.tableId + '/state', (message: IMessage) => {
            //console.dir(message.body);
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

    private giveCards = () => {
        let playerToGiveCard = this.leftNeighbour;
        let previousDestination: string;
        let totalDelay = 0;
        let dealer = this.players.find(p => p.dealer);

        for (let currentIteration = 0; currentIteration <= this.CARDS_NUMBER; currentIteration++) {
            let card = this.generateCard(dealer.x, dealer.y);
            let cardDestination = playerToGiveCard.role;
            let cardDestinationX = playerToGiveCard.receiveCardX;
            let cardDestinationY = playerToGiveCard.receiveCardY;

            if (this.talon.cardsCount < 2 && currentIteration > 9 && previousDestination != this.TALON_DESTINATION) {
                this.talon.cardsCount++;
                cardDestinationX = this.talon.receiveCardX;
                cardDestinationY = this.talon.receiveCardY;
                cardDestination = this.TALON_DESTINATION;
            } else {
                playerToGiveCard = this.swithPlayerToGiveCard(playerToGiveCard);
                previousDestination = cardDestination;
            }

            let delay = currentIteration * this.GIVE_CARD_DELAY;
            totalDelay += delay;

            this.time.addEvent({
                delay: delay,
                callback: () => {
                    this.giveCard(card, cardDestinationX, cardDestinationY);
                }
            });
            
            if (!this.cardGroups.get(cardDestination)) {
                this.cardGroups.set(cardDestination, this.add.group());
            }
            this.cardGroups.get(cardDestination).add(card);
            this.cards.push(card);
        }

        this.grabCardsEvent = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (this.cards.filter(c => !c.reachedDestination).length === 0) {
                    this.players.forEach(p => {
                        this.takeCards(this.cardGroups.get(p.role), p.x, p.y);
                    });
                    this.grabCardsEvent.remove(false);
                }
            }
        });
    }

    private swithPlayerToGiveCard = (currentPlayerToGiveCard: Player) => {
        if (currentPlayerToGiveCard === this.leftNeighbour) {
            return this.rightNeighbour;
        } else if (currentPlayerToGiveCard === this.rightNeighbour) {
            return this.currentPlayer;
        } else {
            return this.leftNeighbour;
        }
    }

    private giveCard(card: Card, x: number, y: number) {
        this.tweens.add({
            targets: card,
            x: x,
            y: y,
            ease: 'Cubic',
            duration: 400,
            repeat: 0,
            yoyo: false,
            callback: () => {
                card.reachedDestination = true;
            }
        });
        this.sound.play('take-card-sound');
    }

    private takeCards(cards: Phaser.GameObjects.Group, x: number, y: number) {
        console.dir(cards);

        cards.getChildren().forEach(card => {
            this.tweens.add({
                targets: card,
                alpha: { value: 0, duration: 2000, ease: 'Power1' },
                x: x,
                y: y,
                ease: 'Cubic',
                duration: 400,
                repeat: 0,
                yoyo: false
            });
        });
        this.sound.play('take-card-sound');
    }

    private createPlayers() {
        this.currentPlayer = this.createPlayer(
            75,
            300,
            340,
            300,
            this.state.currentUser.current,
            this.state.currentUser.dealer,
            this.state.currentUser.role,
            this.state.currentUser.name
            );

        this.leftNeighbour = this.createPlayer(
            75,
            75,
            180,
            190,
            this.state.leftNeighbour.current,
            this.state.leftNeighbour.dealer,
            this.state.leftNeighbour.role,
            this.state.leftNeighbour.name
            );

        this.rightNeighbour = this.createPlayer(
            592,
            75,
            500,
            190,
            this.state.rightNeighbour.current,
            this.state.rightNeighbour.dealer,
            this.state.rightNeighbour.role,
            this.state.rightNeighbour.name
            );
        
        this.players = [ this.currentPlayer, this.leftNeighbour, this.rightNeighbour ];
    }

    private createPlayer(
        x: number,
        y: number,
        receiveCardX: number,
        receiveCardY: number,
        current: boolean,
        dealer: boolean,
        role: string,
        name: string): Player {

        let player = new Player();
        player.avatar = this.add.image(0, 0, role);
        player.role = role;
        player.selection = this.add.image(0, 0, 'player-selection', 1);
        player.name = this.add.text(0, 0, name, { color: '#faf600' }).setOrigin(0.5);
        player.x = x;
        player.y = y;
        player.receiveCardX = receiveCardX;
        player.receiveCardY = receiveCardY;
        player.dealer = dealer;
        player.current = current;

        return player;
    }

    private getCardFrame(suite: string, rank: string): integer {
        let row = this.suits.indexOf(suite);
        let column = this.ranks.indexOf(rank);
        return this.ranks.length * row + column;
    }

    private generateCard(fromX: number, fromY: number): Card {
        let card = new Card(this, fromX, fromY, this.CARD_SHIRT_FRAME);
        this.add.existing(card);
        return card;
    }

}