import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// 회원가입
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // 이미 존재하는 사용자 확인
    const [existing] = await pool.query("SELECT id FROM Users WHERE username = ?", [username]);
    if (existing.length) return res.status(409).json({ message: "USERNAME_TAKEN" });

    // 비밀번호 해시
    const hash = await bcrypt.hash(password, 12);

    // DB에 저장
    await pool.query("INSERT INTO Users (username, password_hash) VALUES (?, ?)", [username, hash]);

    res.json({ message: "REGISTER_OK" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM Users WHERE username = ?", [username]);
    if (!rows.length) return res.status(401).json({ message: "INVALID_CREDENTIALS" });

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ message: "INVALID_CREDENTIALS" });

    // JWT 토큰 발급
    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ accessToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
});

export default router;