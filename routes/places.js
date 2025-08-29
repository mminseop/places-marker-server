import express from "express";
import axios from "axios";
import db from "../db.js";

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

    const rawResults = response.data.results || []; // undefined 대비(항상 데이터가 있을순 없음)

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

    console.log(data);
    res.json(data);
  } catch (e) {
    console.error("Google API fail : ", e.response.data ?? e.message);
    res.status(500).json({ error: "API 호출 에러" });
  }
});

// 장소 등록 api
router.post("/save", async (req, res) => {
  const {
    userId,
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

  try {
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
      photos ? JSON.stringify(photos) : null,
    ]);

    res.json({ success: true, insertId: result.insertId });
  } catch (e) {
    console.error("DB 등록 에러:", e);
    res.status(500).json({ error: "DB 저장 실패" });
  }
});

export default router;

// db 저장된 장소 get
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const [data] = await db.execute(
      "SELECT id, placeId, placeName, placeAddress, lat, lng FROM Places WHERE userId = ?",
      [userId]
    );
    res.json(data);
  } catch (e) {
    console.log("DB 조회 에러", e);
    res.status(500).json({
      error: "DB 조회 에러",
    });
  }
});
