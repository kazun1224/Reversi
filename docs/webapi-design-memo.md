# API 設計

## 対戦を開始する

「対戦を登録する」
POST /api/games

## 現在の盤面を表示する

GET /api/games/latest/turns/{turnCount}

 - 空：０
 - 黒：１
 - 白：２

### Reversiの石はDiscとする

Response Body
```json
{
  "turnCount":1,
  "board": [
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,1,2,0,0,0],
    [0,0,0,2,1,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  "nextDisc":1,
  "winnerDisc":1,
}
```

winnerDiscは勝者が決まってない場合nullにする

## 石を打つ

「ターンを登録する」

Response Body
```json
{
  "turnCount":1,
  "move": {
    "disc": 1,
    "x":1,
    "y":1,
  }
}
```

## 自分の対戦結果を表示する

「対戦」の一覧を取得する
```json
{
  "games": [
    {
      "id": 1,
      "winnerDisc": 1,
      "startedAt": "YYYY-MM-DD hh:mm:ss",
    }
  ]
}
```

