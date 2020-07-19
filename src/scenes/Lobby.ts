import { BaseScene } from "./BaseScene";
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

export class Lobby extends BaseScene {

    private socket: Client;
    private players: Array<string> = [];

    private playersLabel: Phaser.GameObjects.Text;

    private state: GameState;

    private gameStateSubscription: StompSubscription;
    private playerJoinedSubscription: StompSubscription;

    constructor(
        config: string | Phaser.Types.Scenes.SettingsConfig
    ) {
        super(config);
    }

    public init(data: any) {
        this.socket = data.socket;
        this.state = data.state;
        this.players.push(this.state.currentUser.name);
    }

    public create(): void {
        this.gameStateSubscription = this.socket.subscribe('/user/topic/games/' + this.state.tableId + '/state', this.handleGameState);
        this.playerJoinedSubscription = this.socket.subscribe('/user/topic/games/' + this.state.tableId + '/player_added', this.handleGameState);

        this.add.text(50, 25, "Код стола: " + this.state.tableId);
        this.add.text(50, 50, "Игроки в лобби:");
        this.playersLabel = this.add.text(50, 75, "");
    }

    public update(): void {
        this.playersLabel.text = this.players.join('\n');
    }

    private handleGameState = (message: IMessage) => {
        this.state = <GameState>JSON.parse(message.body);
        this.players = [
            this.state.currentUser ? this.state.currentUser.name : 'Место свободно',
            this.state.leftNeighbour ? this.state.leftNeighbour.name : 'Место свободно',
            this.state.rightNeighbour ? this.state.rightNeighbour.name : 'Место свободно'
        ];

        if ('WAITING_FOR_PLAYERS' !== this.state.currentScene) {
            this.playerJoinedSubscription.unsubscribe();
            this.gameStateSubscription.unsubscribe();
            console.log('LOADING SCENE');
            this.scene.start('Sandbox', { state: this.state, socket: this.socket });
        }
    }

}