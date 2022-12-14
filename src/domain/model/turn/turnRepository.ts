import mysql from "mysql2/promise";
import { Turn } from "./turn";
import { SquareGateway } from "../../../infrastructure/squareGateway";
import { TurnGateway } from "../../../infrastructure/turnGateway";
import { MoveGateway } from "../../../infrastructure/moveGateway";
import { Move } from "./move.";
import { toDisc } from "./disc";
import { Point } from "./point";
import { MoveRecord } from "../../../infrastructure/moveRecord";
import { Board } from "./board";
import { DomainError } from "../../error/domainError";

const turnGateway = new TurnGateway();
const squareGateway = new SquareGateway();
const moveGateway = new MoveGateway();

export class TurnRepository {
  async findForGameIdAndTurnCount(
    connection: mysql.Connection,
    gameId: number,
    turnCount: number
  ): Promise<Turn> {
    const turnRecord = await turnGateway.findForGameIdAndTurnCount(
      connection,
      gameId,
      turnCount
    );

    if (!turnRecord) {
      throw new DomainError(
        "SpecifiedTurnNotFound",
        "Specified record not found"
      );
    }

    const squareRecords = await squareGateway.findForTurnId(
      connection,
      turnRecord.id
    );

    const board = Array.from(Array(8)).map(() => Array.from(Array(8)));
    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc;
    });

    const moveRecord = await moveGateway.findForTurnId(
      connection,
      turnRecord.id
    );

    let move: Move | undefined;
    if (moveRecord) {
      move = new Move(
        toDisc(moveRecord.disc),
        new Point(moveRecord.x, moveRecord.y)
      );
    }

    return new Turn(
      gameId,
      turnCount,
      toDisc(turnRecord.nextDisc),
      move,
      new Board(board),
      turnRecord.endAt
    );
  }

  async save(connection: mysql.Connection, turn: Turn) {
    const turnRecord = await turnGateway.insert(
      connection,
      turn.gameId,
      turn.turnCount,
      turn.nextDisc,
      turn.endAt
    );

    await squareGateway.insertAll(connection, turnRecord.id, turn.board.discs);

    if (turn.move) {
      await moveGateway.insert(
        connection,
        turnRecord.id,
        turn.move.disc,
        turn.move.point.x,
        turn.move.point.y
      );
    }
  }
}
