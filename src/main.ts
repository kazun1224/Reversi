import express from "express";
import morgan from "morgan";
import "express-async-errors";
import mysql from "mysql2/promise";

const PORT = 3000;

const app = express();

app.use(morgan("dev"))
app.use(express.static('static',{extensions: ['html']}))

app.get("/api/hello", async (req, res) => {
  res.json({
    message: "hello express",
  });
});

app.get("/api/error", async (req, res) => {
  throw new Error("Error endpoint");
});

app.post("/api/games", async (req, res) => {
  const startedAt = new Date();
  const connection = await mysql.createConnection({
    host: "localhost",
    database: "reversi",
    user: "reversi",
    password: "password",

  });
  try {
  await connection.beginTransaction()
  await connection.execute("insert into games (started_at) values (?)",[startedAt])
  await connection.commit()
  } finally {
    await connection.end()
  }
  res.send();
});

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Reversi application started: http://localhost:${PORT}`);
});

function errorHandler(err: any ,_req: express.Request, res: express.Response, next: express.NextFunction) {
  console.error('Unexpected error occurred', err)
  res.status(500).send({
    message:"Unexpected error occurred",
  })
}
