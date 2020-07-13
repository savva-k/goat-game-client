import { BaseScene } from "./BaseScene";
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

export class Lobby extends BaseScene {

    private socket: Client;
    private players: Array<string> = [];
    private tableId: string;

    private playersLabel: Phaser.GameObjects.Text;

    private gameStateSubscription: StompSubscription;

    constructor(
        config: string | Phaser.Types.Scenes.SettingsConfig
    ) {
        super(config);
    }

    public init(data: any) {
        this.socket = data.socket;
        this.tableId = data.tableId;
        this.players.push(data.playerName);
    }

    public preload(): void {
    }

    public create(): void {

        this.gameStateSubscription = this.socket.subscribe('/topic/games/' + this.tableId + '/state', this.updateState);

        this.add.text(50, 25, "Код стола: " + this.tableId);
        this.add.text(50, 50, "Игроки в лобби:");
        this.playersLabel = this.add.text(50, 75, "");
    }

    public update(): void {
        this.playersLabel.text = this.players.join('\n');
    }

    private updateState = (message: IMessage) => {
        let gameState = <GameState>JSON.parse(message.body);
        this.players = gameState.players.flatMap(p => p.name);

        if ('WAITING_FOR_PLAYERS' !== gameState.currentScene) {
            this.gameStateSubscription.unsubscribe();
            console.log('LOADING SCENE');
            this.scene.start('Sandbox', { tableId: this.tableId, socket: this.socket });
        }
    }

}