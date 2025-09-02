import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.js";
import placesRouter from "./routes/places.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "127.0.0.1";

const allowedOrigins = [
  "https://tastemap-lovat.vercel.app", // Vercel 도메인
  "http://localhost:5173", // 로컬 개발용
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 라우터
app.use("/api/auth", authRouter);
app.use("/api/places", placesRouter);

app.listen(PORT, HOST, () => {
  console.log(`server running on port ${PORT}`);
});
