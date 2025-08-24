import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/api/places", async (req, res) => {
  try {
    const { query = "중화요리 서울" } = req.query;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${process.env.GOOGLE_PLACE_KEY}`;

    const response = await axios.get(url);
    const data = response.data;
    console.log(data);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "API 호출 실패" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
