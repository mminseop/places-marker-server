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
    const data = response.data.results.map((place) => {
      //   주소 가공: "대한민국 서울특별시 성동구 마조로1길 2" → "서울 성동구 마조로1길 2"
      const addressParts = place.formatted_address.split(" ");
      const shortAddress = addressParts.slice(1).join(" "); // 맨 앞 대한민국 제거

      return {
        ...place,
        formatted_address: shortAddress,
      };
    });
    console.log(data);
    res.json(data);
  } catch (e) {
    console.error("Google API fail : ", e.response.data ?? e.message);
    res.status(500).json({ error: "API 호출 에러" });
  }
});

export default router;
