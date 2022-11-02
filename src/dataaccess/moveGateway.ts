import mysql from "mysql2/promise";
import { MoveRecord } from "./moveRecord";

export class MoveGateway {
  async insert(
    connection: mysql.Connection,
    turnId: number,
    disc: number,
    x: number,
    y: number
  ) {
    await connection.execute(
      "insert into moves (turn_id, disc, x, y) values (?,?, ?, ?)",
      [turnId, disc, x, y]
    );
  }
}
