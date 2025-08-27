import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/search", async (req, res) => {
  const { query } = req.query;
  const apiKey = process.env.GOOGLE_PLACE_KEY;

  try {
    console.log("query:", query);

    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/textsearch/json",
      { params: { query, key: apiKey } }
    );

    console.log("Google API response:", response.data);
    res.json(response.data); // Express res 객체 사용
  } catch (e) {
    console.error("Google API call failed:", e.response?.data || e.message);
    res.status(500).json({ error: "API 호출 에러" });
  }
});

export default router;