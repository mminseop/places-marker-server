import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.js";
import placesRouter from "./routes/places.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 라우터
app.use("/auth", authRouter);
app.use("/api/places", placesRouter);

router.get("/search", async (req, res) => {
  console.log("Request received:", req.query.query);
});

app.listen(3000, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);
});
