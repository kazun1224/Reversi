import express from "express";

const PORT = 3000;

const app = express();

app.get("/", async (req, res) => {
  res.json({
    message: "hello express",
  });
});

app.listen(PORT, () => {
  console.log(`Reversi application started: http://localhost:${PORT}`);
});
