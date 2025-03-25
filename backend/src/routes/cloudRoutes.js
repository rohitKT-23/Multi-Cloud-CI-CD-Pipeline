const express = require('express');
const { checkAzureStatus, checkAWSStatus } = require('../services/cloudMonitor');

const router = express.Router();

router.get('/status', async (req, res) => {
  try {
    const [azure, aws] = await Promise.all([
      checkAzureStatus(),
      checkAWSStatus()
    ]);
    res.json([azure, aws]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cloud status' });
  }
});

module.exports = router;