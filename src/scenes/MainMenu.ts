import { BaseScene } from "./BaseScene";
import { Client } from '@stomp/stompjs';
import { post } from '../util/Http'
import button_hover_sound from '../assets/sound/button_hover.ogg';
import button_click_sound from '../assets/sound/button_click.wav';
import take_card_sound from '../assets/sound/taking_card.wav';
import bgimage from '../assets/table_background.jpg';
import avatars from '../assets/player_avatars/*.png';
import cards from '../assets/cards.png';
import playersSelection from '../assets/player_selection.png';

export class MainMenu extends BaseScene {

    private socket: Client;
    private loginForm: Phaser.GameObjects.DOMElement;

    constructor(
        config: string | Phaser.Types.Scenes.SettingsConfig
    ) {
        super(config);
    }

    public init(data: any) {
        this.socket = data.socket;
    }

    public preload(): void {
        this.load.audio('button-click-sound', button_click_sound);
        this.load.audio('button-hover-sound', button_hover_sound);
        this.load.audio('take-card-sound', take_card_sound);

        this.load.image('background', bgimage);
        this.load.image('player1', avatars.player1);
        this.load.image('player2', avatars.player2);
        this.load.image('player3', avatars.player3);
        this.load.spritesheet('cards', cards, { frameWidth: 62, frameHeight: 84 });
        this.load.spritesheet('player-selection', playersSelection, { frameWidth: 102, frameHeight: 102 });
    }

    public create(): void {
        this.loginForm = this.add.dom(100, 200).createFromHTML(`
        <style>
            .button-container {
                width: 100%;
            }

            .green-button {
                width: 100%;
                height: 35px;
                background-color: #4ec24f;
                border-bottom: 10px solid #286a28;
            }

            .green-button:hover {
                background-color: #bec24e;
                border-bottom: 10px solid #6a5228;
            }

            .green-button:active {
                background-color: #bec24e;
                border-bottom: 4px solid #6a5228;
            }

            .label-container {
                font-size: 16px;
                color: white;
                text-align: center;
            }

            .margin-top {
                margin-top: 15px;
            }

            .double-margin-top {
                margin-top: 30px;
            }

            .margin-bottom {
                margin-bottom: 15px;
            }
        </style>
        <div>
            <div class="label-container margin-bottom">Имя игрока</div>
            <div class="text-container"><input type="text" name="username"/></div>
            <div class="label-container margin-top margin-bottom">Номер стола</div>
            <div class="text-container"><input type="text" name="table-id"/></div>
            <div class="button-container double-margin-top"><input type="button" class="green-button" id="create-table-button" value="Создать стол"/></div>
            <div class="button-container margin-top"><input type="button" class="green-button" id="join-table-button" value="Подключиться к столу"/></div>
        </div>
        `);

        this.loginForm.addListener('click');
        this.loginForm.addListener('mouseover');

        this.loginForm.on('click', (event: any) => {
            if (event.target.type === 'button') {
                this.sound.play('button-click-sound');
            }
        });

        this.loginForm.on('click', this.handleCreateTable);
        this.loginForm.on('click', this.handleJoinTable);

        this.loginForm.on('mouseover', (event: any) => {
            if (event.target.type === 'button') {
                this.sound.play('button-hover-sound');
            }
        });

    }

    private handleCreateTable = (event: { target: { id: string; }; }) => {
        if (event.target.id === 'create-table-button') {
            console.log('creating a table');
            let playerName = this.loginForm.getChildByName('username').value;
            post('/game/create', { playerName: playerName }, (response) => {
                if (response.tableId) {
                    this.scene.start('Lobby', { tableId: response.tableId, socket: this.socket, playerName: playerName });
                }
            });
        }
    }

    private handleJoinTable = (event: any) => {
        if (event.target.id === 'join-table-button') {
            console.log('joining a table');
            let playerName = this.loginForm.getChildByName('username').value;
            let tableId = this.loginForm.getChildByName('table-id').value;
            post('/game/' + tableId + '/join', { playerName: playerName }, (response) => {
                if (response.tableId) {
                    this.scene.start('Lobby', { tableId: response.tableId, socket: this.socket });
                }
            });
        }
    }

}