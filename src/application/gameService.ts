import { DARK, INITIAL_BOARD } from "../application/constants";
import { connectMySql } from "../dataaccess/connection";
import { GameGateway } from "../dataaccess/gameGateway";
import { SquareGateway } from "../dataaccess/squareGateway";
import { TurnGateway } from "../dataaccess/turnGateway";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const squareGateway = new SquareGateway();

export class GameService {
  async startNewGame() {
    const now = new Date();
    const connection = await connectMySql();
    try {
      await connection.beginTransaction();
      // games tableに保存
      const gameRecord = await gameGateway.insert(connection, now);

      // turns tableに保存
      const turnRecord = await turnGateway.insert(
        connection,
        gameRecord.id,
        0,
        DARK,
        now
      );

      // マスの数を計算
      await squareGateway.insertAll(connection, turnRecord.id, INITIAL_BOARD);

      await connection.commit();
    } finally {
      await connection.end();
    }
  }
}
