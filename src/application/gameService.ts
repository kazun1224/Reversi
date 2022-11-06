import { connectMySql } from "../infrastructure/connection";
import { Game } from "../domain/model/game/game";
import { GameRepository } from "../domain/model/game/gameRepository";
import { firstTurn } from "../domain/model/turn/turn";
import { TurnRepository } from "../domain/model/turn/turnRepository";

const turnRepository = new TurnRepository();
const gameRepository = new GameRepository();

export class GameService {
  async startNewGame() {
    const now = new Date();
    const connection = await connectMySql();
    try {
      await connection.beginTransaction();
      // games tableに保存
      const game = await gameRepository.save(
        connection,
        new Game(undefined, now)
      );

      if (!game.id) {
        throw new Error("game.id not exist");
      }

      const turn = firstTurn(game.id, now);

      // turns tableに保存
      await turnRepository.save(connection, turn);

      await connection.commit();
    } finally {
      await connection.end();
    }
  }
}
