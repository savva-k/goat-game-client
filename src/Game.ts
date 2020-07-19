import { Sandbox } from "./scenes/Sandbox";
import { MainMenu } from "./scenes/MainMenu";
import { Client } from '@stomp/stompjs';
import { Lobby } from "./scenes/Lobby";

export class Game extends Phaser.Game {

    private socket: Client;

    constructor(config: any) {        
        super(config);
        this.socket = this.connectToServer(config);
        this.socket.activate();
        this.scene.add("Sandbox", Sandbox);
        this.scene.add("MainMenu", MainMenu);
        this.scene.add("Lobby", Lobby);
    }
    
    private connectToServer = (config: any): Client => {
        let socket = new Client({
            brokerURL: "ws://192.168.0.45:3000/game",
            //debug: (str) => console.log(str)
        });

        socket.onConnect = (frame) => {
            console.log('Connected...');
            this.scene.start('MainMenu', { socket: this.socket });
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