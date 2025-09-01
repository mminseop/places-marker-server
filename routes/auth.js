import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { sendFail, sendSuccess } from "../utils/res.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// 회원가입
router.post("/register", async (req, res) => {
  const { userEmail, userPassword, userName, userPhone } = req.body;

  try {
    // 이미 존재하는 사용자 확인
    const [existingUser] = await db.execute(
      "SELECT id FROM Users WHERE userEmail = ?",
      [userEmail]
    );
    if (existingUser.length) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(userPassword, 12);

    // DB에 저장
    await db.execute(
      "INSERT INTO Users (userEmail, userPassword, userName, userPhone) VALUES (?, ?, ?, ?)",
      [userEmail, hashedPassword, userName, userPhone]
    );

    res.json({ message: "회원가입 성공" });
  } catch (err) {
    console.error("회원가입 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { userEmail, userPassword } = req.body;

  try {
    // 유저 조회
    const [rows] = await db.execute("SELECT * FROM Users WHERE userEmail = ?", [
      userEmail,
    ]);

    if (!rows.length) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const user = rows[0];

    // 2. 비밀번호 검증
    const isValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isValid) {
      return res
        .status(401)
        .json({ message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    // 3. JWT 발급
    const token = jwt.sign(
      { userId: user.id, userEmail: user.userEmail },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 마지막 로그인 날짜 업데이트
    await db.execute("UPDATE Users SET lastLoginDate = NOW() WHERE id = ?", [
      user.id,
    ]);

    // 5. 응답
    res.json({
      accessToken: token,
      userId: user.id,
      userEmail: user.userEmail,
    });
  } catch (err) {
    console.error("로그인 에러:", err);
    res.status(500).json({ message: "서버 에러" });
  }
});

export default router;
