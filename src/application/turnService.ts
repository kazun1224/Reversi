import { connectMySql } from "../dataaccess/connection";
import { GameGateway } from "../dataaccess/gameGateway";
import { SquareGateway } from "../dataaccess/squareGateway";
import { TurnGateway } from "../dataaccess/turnGateway";
import { MoveGateway } from "../dataaccess/moveGateway";
import { Turn } from "../domain/turn";
import { Board } from "../domain/board";
import { toDisc } from "../domain/disc";
import { Point } from "../domain/point";
import { TurnRepository } from "../domain/turnRepository";

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();

const turnRepository = new TurnRepository();

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
      const gameRecord = await gameGateway.findLatest(connection);
      if (!gameRecord) {
        throw new Error("Latest game not found");
      }

      const turn = await turnRepository.findForGameIdAndTurnCount(
        connection,
        gameRecord.id,
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
      const gameRecord = await gameGateway.findLatest(connection);
      if (!gameRecord) {
        throw new Error("Latest game not found");
      }

      const previousTurnCount = turnCount - 1;
      const previousTurn = await turnRepository.findForGameIdAndTurnCount(
        connection,
        gameRecord.id,
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
