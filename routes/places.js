import express from "express";
import axios from "axios";

const router = express.Router();

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
          radius: 40000, // 반경 (미터) - 40km
        },
      }
    );

    res.json(response.data);
  } catch (e) {
    console.error("Google API fail : ", e.response.data ?? e.message);
    res.status(500).json({ error: "API 호출 에러" });
  }
});

export default router;
