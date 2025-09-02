import express from "express";
import axios from "axios";
import db from "../db.js";
import { sendFail, sendSuccess } from "../utils/res.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// 장소 검색 api
router.get("/search", async (req, res) => {
  const { query } = req.query;
  const apiKey = process.env.GOOGLE_PLACE_KEY;

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/textsearch/json",
      {
        params: {
          query,
          key: apiKey,
          language: "ko", // 한국어로 결과 받기
          location: "37.5665,126.9780", // 서울 시청 위도,경도
          radius: 40000, // 반경(미터) - 40km
        },
      }
    );

    const rawResults = response.data.results || []; // 데이터 없을때 대비

    const data = rawResults.map((place) => {
      let shortAddress = "";

      if (place.formatted_address) {
        const addressParts = place.formatted_address.split(" ");
        shortAddress = addressParts.slice(1).join(" "); // 맨 앞 대한민국 제거
      }

      return {
        ...place,
        formatted_address: shortAddress || "주소 정보 없음",
      };
    });

    return sendSuccess(res, data);
  } catch (e) {
    console.error("Google API fail : ", e.response?.data ?? e.message);
    return sendFail(res, "Google API 호출 에러");
  }
});

// 장소 등록 api
router.post("/save", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const {
      placeId,
      placeName,
      placeAddress,
      lat,
      lng,
      rating,
      userRatingsTotal,
      priceLevel,
      openingNow,
      photos,
    } = req.body;

    // 이미지 url 저장
    const photoUrls = Array.isArray(photos)
      ? photos.map(
          (ref) =>
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${ref}&key=${process.env.GOOGLE_PLACE_KEY}`
        )
      : [];

    const query = `
      INSERT INTO Places
      (userId, placeId, placeName, placeAddress, lat, lng, rating, userRatingsTotal, priceLevel, openingNow, photos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      userId,
      placeId,
      placeName,
      placeAddress,
      lat,
      lng,
      rating ?? null,
      userRatingsTotal ?? null,
      priceLevel ?? null,
      openingNow ?? null,
      photoUrls.length ? JSON.stringify(photoUrls) : null,
    ]);

    return sendSuccess(res, { insertId: result.insertId });
  } catch (e) {
    console.error("DB 등록 에러:", e);
    return sendFail(res, "DB 저장 실패");
  }
});

// db 저장된 장소 get
router.get("/saved", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const [rows] = await db.execute("SELECT * FROM Places WHERE userId = ?", [
      userId,
    ]);

    return sendSuccess(res, rows);
  } catch (e) {
    console.error("DB 조회 에러", e);
    return sendFail(res, "DB 조회 에러");
  }
});

export default router;
