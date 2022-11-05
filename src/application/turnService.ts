import { connectMySql } from "../infrastructure/connection";
import { toDisc } from "../domain/turn/disc";
import { Point } from "../domain/turn/point";
import { TurnRepository } from "../domain/turn/turnRepository";
import { GameRepository } from "../domain/game/gameRepository";

const turnRepository = new TurnRepository();
const gameRepository = new GameRepository();

// データの入れ物Class DTO 【Data Transfer Object】
class FindLatestGameTurnByTurnCountOutput {
  constructor(
    private _turnCount: number,
    private _board: number[][],
    private _nextDisc: number | undefined,
    private _winnerDisc: number | undefined
  ) {}

  get turnCount() {
    return this._turnCount;
  }
  get board() {
    return this._board;
  }
  get nextDisc() {
    return this._nextDisc;
  }
  get winnerDisc() {
    return this._winnerDisc;
  }
}

export class TurnService {
  async findLatestGameTurnByTurnCount(
    turnCount: number
  ): Promise<FindLatestGameTurnByTurnCountOutput> {
    const connection = await connectMySql();
    try {
      const game = await gameRepository.findLatest(connection);
      if (!game) {
        throw new Error("Latest game not found");
      }
      if (!game.id) {
        throw new Error("game.id not exist");
      }

      const turn = await turnRepository.findForGameIdAndTurnCount(
        connection,
        game.id,
        turnCount
      );

      return new FindLatestGameTurnByTurnCountOutput(
        turnCount,
        turn.board.discs,
        turn.nextDisc,
        // 決着がついてる場合game_resultsテーブルから取得する
        undefined
      );
    } finally {
      await connection.end();
    }
  }

  async registerTurn(turnCount: number, disc: number, x: number, y: number) {
    const connection = await connectMySql();
    try {
      // ひとつ前のターンを取得する
      const game = await gameRepository.findLatest(connection);
      if (!game) {
        throw new Error("Latest game not found");
      }
      if (!game.id) {
        throw new Error("game.id not exist");
      }

      const previousTurnCount = turnCount - 1;
      const previousTurn = await turnRepository.findForGameIdAndTurnCount(
        connection,
        game.id,
        previousTurnCount
      );

      // 石を置く
      const newTurn = previousTurn.placeNext(toDisc(disc), new Point(x, y));

      // ターンを保存する
      await turnRepository.save(connection, newTurn);

      await connection.commit();
    } finally {
      await connection.end();
    }
  }
}
