import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/search", async (req, res) => {
  console.log("Request received:", req.query.query);
  const { query } = req.query;
  const apiKey = process.env.GOOGLE_PLACE_KEY;
  console.log("api Key:", apiKey);

  try {
    console.log("query:", query);
    const res = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      { params: { query, key: apiKey } }
    );
    console.log("google aip res:", res.data);
    res.json(res.data);
  } catch (e) {
    console.eor("Google API call failed:", e.response?.data || err.message);
    res.status(500).json({ error: "API 호출 에러" });
  }
});

export default router;
