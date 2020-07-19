interface GameState {
    tableId: string;
    currentScene: string;
    currentUser: PlayerVO
    currentPlayer: PlayerVO;
    leftNeighbour: PlayerVO;
    rightNeighbour: PlayerVO;
}