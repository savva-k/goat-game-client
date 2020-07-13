import { Sandbox } from "./scenes/Sandbox";
import { MainMenu } from "./scenes/MainMenu";
import { Client } from '@stomp/stompjs';
import { Lobby } from "./scenes/Lobby";

export class Game extends Phaser.Game {

    private tableId: string;

    constructor(config: any) {        
        super(config);
        let socket = this.connectToServer(config);
        socket.activate();
        this.scene.add("Sandbox", Sandbox);
        this.scene.add("MainMenu", MainMenu);
        this.scene.add("Lobby", Lobby);
        this.scene.start('MainMenu', { socket: socket });
    }
    
    private connectToServer(config: any): Client {
        let socket = new Client({
            brokerURL: "ws://192.168.0.45:3000/game",
            debug: (str) => console.log(str)
        });

        socket.onConnect = function(frame) {
            console.log('Connected...');
            // socket.subscribe('/topic/game/new_game_created', (message) => {
            //     let response = JSON.parse(message.body);
            //     this.tableId = response.tableId;
            //     socket.subscribe("/topic/" + this.tableId, (message) => {
            //         console.log(message.body);
            //     });
            // });
        };

        socket.onStompError = function(frame) {
            console.log('Error...');
            console.dir(frame);
        };

        socket.onDisconnect = function(fram) {
            console.log('Disconnected');
        }
        return socket;
    }
}