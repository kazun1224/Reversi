import express from "express";
import { DARK, INITIAL_BOARD } from "../application/constants";
import { connectMySql } from "../dataaccess/connection";
import { GameGateway } from "../dataaccess/gameGateway";
import { MoveGateway } from "../dataaccess/moveGateway";
import { SquareGateway } from "../dataaccess/squareGateway";
import { TurnGateway } from "../dataaccess/turnGateway";

export const gameRouter = express.Router();

const gameGateway = new GameGateway();
const turnGateway = new TurnGateway();
const moveGateway = new MoveGateway();
const squareGateway = new SquareGateway();


gameRouter.post("/api/games", async (req, res) => {
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
  res.status(201).end();
});
