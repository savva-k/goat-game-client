interface PlayerVO {
    id: string;
    name: string;
    role: string;
    current: boolean;
    dealer: boolean;
    hand: Array<CardVO>;
}