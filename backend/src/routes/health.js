const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "UP",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;