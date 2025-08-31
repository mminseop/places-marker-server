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
app.use("/api/auth", authRouter);
app.use("/api/places", placesRouter);

app.listen(3000, "0.0.0.0", () => {
  console.log(`server running on port ${PORT}`);
});
