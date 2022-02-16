const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 3000;

// CORS Setup - Middleware
const corsOptions = process.env.ALLOWED_HOSTS.split(",");
app.use(cors(corsOptions));

app.use(express.static("build"));

// Use JSON by default in POST - Middleware
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.use("/api/get-tweet-data", require("./routes/get-tweet-data"));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
