import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { sendFail, sendSuccess } from "../utils/res.js";
import { authenticateToken } from "../middlewares/auth.js";

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
      return sendError(res, "이미 존재하는 이메일입니다.");
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(userPassword, 12);

    // DB에 저장
    await db.execute(
      "INSERT INTO Users (userEmail, userPassword, userName, userPhone) VALUES (?, ?, ?, ?)",
      [userEmail, hashedPassword, userName, userPhone]
    );

    return sendSuccess(res, null, "회원가입 성공");
  } catch (e) {
    console.error("회원가입 에러:", e);
    return sendError(res, "서버 에러");
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
      return sendError(res, "이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const user = rows[0];

    // 비밀번호 검증
    const isValid = await bcrypt.compare(userPassword, user.userPassword);
    if (!isValid) {
      return sendError(res, "이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    // JWT 발급
    const token = jwt.sign(
      { userId: user.id, userEmail: user.userEmail },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 마지막 로그인 날짜 업데이트
    await db.execute("UPDATE Users SET lastLoginDate = NOW() WHERE id = ?", [
      user.id,
    ]);

    // 응답
    return sendSuccess(
      res,
      {
        accessToken: token,
        // userId: user.id,
        // userEmail: user.userEmail,
      },
      "로그인 성공"
    );
  } catch (e) {
    console.error("로그인 에러:", e);
    return sendError(res, "서버 에러");
  }
});

// 이메일 중복 확인
router.post("/checkemail", async (req, res) => {
  const { userEmail } = req.body;

  if (!userEmail) {
    return sendFail(res, "이메일을 입력해주세요.");
  }

  try {
    const [check] = await db.execute(
      "SELECT id FROM Users WHERE userEmail = ?",
      [userEmail]
    );

    if (check.length > 0) {
      return sendSuccess(res, "이미 사용 중인 이메일입니다.");
    }

    return sendSuccess(res, "사용 가능한 이메일입니다.");
  } catch (e) {
    console.error("이메일 중복 확인 에러:", e);
    return sendFail(res, "서버 에러");
  }
});

// 유저 정보 조회
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const [rows] = await db.execute(
      "SELECT id, userEmail, userName, userPhone, lastLoginDate FROM Users WHERE id = ?",
      [userId]
    );

    if (!rows.length) {
      return sendFail(res, "유저를 찾을 수 없습니다.");
    }

    return sendSuccess(res, rows[0]);
  } catch (e) {
    console.error("유저정보 조회 에러:", e);
    return sendFail(res, "서버 에러");
  }
});

export default router;
