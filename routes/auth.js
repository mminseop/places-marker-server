import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

// 회원가입
router.post("/register", async (req, res) => {
  const { userEmail, userPassword, userName, userPhone } = req.body;

  try {
    // 이미 존재하는 사용자 확인
    const [rows] = await db.execute(
      "SELECT id FROM Users WHERE userEmail = ?",
      [userEmail]
    );
    if (rows.length)
      return res.status(409).json({ message: "이메일 중복 에러" });

    // 비밀번호 해시
    const hash = await bcrypt.hash(userPassword, 12);

    // DB에 저장
    await db.execute(
      "INSERT INTO Users (userEmail, userPassword, userName, userPhone) VALUES (?, ?, ?, ?)",
      [userEmail, hash, userName, userPhone]
    );

    res.json({ message: "success" });
  } catch (err) {
    console.error("회원가입 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  console.log("로그인 요청:", req.body);
  const { userEmail, userPassword } = req.body;

  try {
    const [rows] = await db.execute("SELECT * FROM Users WHERE userEmail = ?", [
      userEmail,
    ]);
    if (!rows.length) return res.status(401).json({ message: "로그인 실패" });

    const user = rows[0];
    const isValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isValid) return res.status(401).json({ message: "로그인 실패" });

    // JWT 토큰 발급
    const token = jwt.sign(
      { sub: user.id, userEmail: user.userEmail },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 로그인 날짜 갱신
    await db.execute("UPDATE Users SET lastLoginDate = NOW() WHERE id = ?", [
      user.id,
    ]);

    res.json({ 
  accessToken: token,
  userId: user.id,
  userEmail: user.userEmail
});
  } catch (err) {
    console.error("로그인 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
});

export default router;
