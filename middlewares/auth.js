import jwt from "jsonwebtoken";
import { sendFail } from "../utils/res";

const JWT_SECRET = process.env.JWT_SECRET;

// 로그인 유저 인증 미들웨어
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return sendFail(res, "토큰 없음");

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return sendFail(res, "유효하지 않은 토큰");
    req.user = decoded; // { userId, userEmail, iat, exp }
    next();
  });
};