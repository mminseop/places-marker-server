import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// 회원가입
router.post("/register", async (req, res) => {
  const { userEmail, userPassword, userName, userPhone } = req.body;

  try {
    // 이미 존재하는 사용자 확인
    const [existing] = await pool.query(
      "SELECT id FROM Users WHERE userEmail = ?",
      [userEmail]
    );
    if (existing.length) return res.status(409).json({ message: "EMAIL_TAKEN" });

    // 비밀번호 해시
    const hash = await bcrypt.hash(userPassword, 12);

    // DB에 저장
    await pool.query(
      "INSERT INTO Users (userEmail, userPassword, userName, userPhone) VALUES (?, ?, ?, ?)",
      [userEmail, hash, userName, userPhone]
    );

    res.json({ message: "REGISTER_OK" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { userEmail, userPassword } = req.body;

  try {
    const [rows] = await pool.query(
      "SELECT * FROM Users WHERE userEmail = ?",
      [userEmail]
    );
    if (!rows.length) return res.status(401).json({ message: "INVALID_CREDENTIALS" });

    const user = rows[0];
    const isValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isValid) return res.status(401).json({ message: "INVALID_CREDENTIALS" });

    // JWT 토큰 발급
    const token = jwt.sign(
      { sub: user.id, userEmail: user.userEmail },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 로그인 날짜 갱신
    await pool.query(
      "UPDATE Users SET lastLoginDate = NOW() WHERE id = ?",
      [user.id]
    );

    res.json({ accessToken: token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "SERVER_ERROR" });
  }
});

export default router;