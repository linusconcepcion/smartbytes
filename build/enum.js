export var GameKey;
(function (GameKey) {
    GameKey[GameKey["UP"] = 38] = "UP";
    GameKey[GameKey["DOWN"] = 40] = "DOWN";
    GameKey[GameKey["LEFT"] = 37] = "LEFT";
    GameKey[GameKey["RIGHT"] = 39] = "RIGHT";
    GameKey[GameKey["SPACEBAR"] = 32] = "SPACEBAR";
})(GameKey || (GameKey = {}));
export var Direction;
(function (Direction) {
    Direction[Direction["UP"] = 0] = "UP";
    Direction[Direction["RIGHT"] = 1] = "RIGHT";
    Direction[Direction["DOWN"] = 2] = "DOWN";
    Direction[Direction["LEFT"] = 3] = "LEFT";
})(Direction || (Direction = {}));
export var CellType;
(function (CellType) {
    CellType[CellType["SNAKE"] = 0] = "SNAKE";
    CellType[CellType["APPLE"] = 1] = "APPLE";
})(CellType || (CellType = {}));
export var Speed;
(function (Speed) {
    Speed[Speed["FAST"] = 0] = "FAST";
    Speed[Speed["NORMAL"] = 1] = "NORMAL";
    Speed[Speed["SLOW"] = 2] = "SLOW";
    Speed[Speed["PAUSED"] = 3] = "PAUSED";
})(Speed || (Speed = {}));
