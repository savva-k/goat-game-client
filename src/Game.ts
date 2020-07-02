import { Sandbox } from "./scenes/Sandbox";
import { Login } from "./scenes/Login";
//import { Client } from '@stomp/stompjs';

export class Game extends Phaser.Game {

    constructor(config: any) {        
        super(config);
        let socket = this.connectToServer(config);
        this.scene.add("Sandbox", Sandbox, null, { socket: socket });
        this.scene.start('Sandbox')
    }
    
    private connectToServer(config: any) {
        // let socket = new Client();
        // socket.brokerURL = "http://localhost:3000/game";

        // socket.onConnect = function(frame) {
        //     console.log('Connected...');
        //     console.dir(frame);
        // };

        // socket.onStompError = function(frame) {
        //     console.log('Error...');
        //     console.dir(frame);
        // };
    }
}