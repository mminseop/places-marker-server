import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/search", async (req, res) => {
  console.log("Request received:", req.query.query);
  const { query } = req.query;
  const apiKey = process.env.GOOGLE_PLACE_KEY;

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/textsearch/json`,
      {
        params: {
          query: query,
          key: apiKey,
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "api 호출 에러" });
  }
});

export default router;
