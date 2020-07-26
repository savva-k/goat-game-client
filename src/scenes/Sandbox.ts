import { BaseScene } from "./BaseScene";
import { Card } from "../model/Card";
import { Player } from "../model/Player";
import  { Geom } from 'phaser';
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
    readonly CARD_DISTANCE_SHIFT = 62;
    readonly PLAYER_CARDS_START_X = 170;
    readonly TALON_DESTINATION = 'talon';

    private suits: Array<string> = ['CLUBS', 'HEARTS', 'DIAMONDS', 'SPADES'];
    private ranks: Array<string> = ['TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT',
                                    'NINE', 'TEN', 'JACK', 'QUEEN', 'KING', 'ACE'];

    private socket: Client;
    private gameStateSubscription: StompSubscription;
    private playerMadeTurnSubscription: StompSubscription;
    private neighbourPlayersSubscription: StompSubscription;

    private grabCardsEvent: Phaser.Time.TimerEvent;
    private background: Phaser.GameObjects.Image;

    private state: GameState;

    private currentPlayer: Player;
    private leftNeighbour: Player;
    private rightNeighbour: Player;
    private players: Array<Player> = [];
    private talon: Talon;

    private cardGroups = new Map<string, Phaser.GameObjects.Group>();
    private cards: Array<Card> = [];

    private playzoneHighlighting: Phaser.GameObjects.Rectangle;

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

        this.playerMadeTurnSubscription = this.socket.subscribe(
            '/user/topic/games/' + this.state.tableId + '/player_made_turn',
            this.handlePlayersTurn
        );

        this.createBackround();
        this.playzoneHighlighting = this.add.rectangle(300, 150, 300, 150, 0xFF9900, 0.5);
        this.playzoneHighlighting.setVisible(false);
        this.createPlayers();
        this.giveCards();

    }

    public update(): void {
    }


    private createBackround() {
        this.background = this.add.image(400, 300, 'background');
    }

    private swithPlayzoneHighlighting = () => {
        this.playzoneHighlighting.setVisible(!this.playzoneHighlighting.visible);
    }

    private playCard = (card: Card) => {
        if (Geom.Rectangle.Contains(this.playzoneHighlighting.getBounds(), card.x, card.y)) {
            this.socket.publish({
                destination: '/app/game/' + this.state.tableId + '/turn',
                body: JSON.stringify({ suite: card.suite, rank: card.rank, x: card.x, y: card.y })
            });
        } else {
            card.returnCard();
        }
    }

    private giveCards = () => {
        let playerToGiveCard = this.leftNeighbour;
        let previousDestination: string;
        let dealer = this.players.find(p => p.dealer);

        for (let currentIteration = 0; currentIteration <= this.CARDS_NUMBER; currentIteration++) {
            let card = this.generateCard(dealer.x, dealer.y, this.CARD_SHIRT_FRAME);

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
            this.time.addEvent({
                delay: delay,
                callback: () => {
                    this.moveCard(card, cardDestinationX, cardDestinationY);
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
                    this.showPlayersCards();
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

    private showPlayersCards = () => {
        this.currentPlayer.hand = [];

        this.state.currentUser.hand.forEach(cardVO => {
            let frame = this.getCardFrame(cardVO.suite, cardVO.rank);
            let card = this.generateCard(
                this.currentPlayer.x,
                this.currentPlayer.y,
                frame,
                cardVO.suite,
                cardVO.rank
            );
            this.currentPlayer.hand.push(card);
        });

        let x = this.PLAYER_CARDS_START_X;
        let y = this.currentPlayer.y;

        this.currentPlayer.hand.forEach(card => {
            this.time.addEvent({
                delay: this.GIVE_CARD_DELAY,
                callback: () => {
                    this.moveCard(card, x, y);
                    x += this.CARD_DISTANCE_SHIFT;
                }
            });
        });
    }

    private moveCard(card: Card, x: number, y: number) {
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

    private handlePlayersTurn = (message: IMessage) => {
        let turn = <PlayersTurn>JSON.parse(message.body);
        if (turn.card && turn.player) {
            let player = this.players.find(p => p.name.text === turn.player.name);

            if (player && player != this.currentPlayer) {
                let frame = this.getCardFrame(turn.card.suite, turn.card.rank);
                let card = this.generateCard(
                    player.x,
                    player.y,
                    frame,
                    turn.card.suite,
                    turn.card.rank
                );
                this.moveCard(card, turn.x, turn.y);
            }
        } else {
            console.log('smth wnt wrng');
            console.dir(turn);
        }
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

    private generateCard(fromX: number, fromY: number, spriteFrame: number, suite?: string, rank?: string): Card {
        let card = new Card(this, fromX, fromY, spriteFrame);
        card.suite = suite;
        card.rank = rank;
        card.switchLigting = this.swithPlayzoneHighlighting;
        card.playCard = this.playCard;
        this.add.existing(card);
        return card;
    }

}