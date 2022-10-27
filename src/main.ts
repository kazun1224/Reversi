import express from "express";
import morgan from "morgan";

const PORT = 3000;

const app = express();

app.use(morgan("dev"))

app.get("/", async (req, res) => {
  res.json({
    message: "hello express",
  });
});

app.listen(PORT, () => {
  console.log(`Reversi application started: http://localhost:${PORT}`);
});
