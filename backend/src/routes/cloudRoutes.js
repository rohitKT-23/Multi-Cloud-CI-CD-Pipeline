const express = require('express');
const { 
  checkAzureStatus, 
  checkAWSStatus,
  getAzureMetrics,
  getAWSMetrics
} = require('../services/cloudMonitor');

const router = express.Router();

// Get overall status
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

// Get Azure metrics
router.get('/azure/metrics', async (req, res) => {
  try {
    const metrics = await getAzureMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Azure metrics' });
  }
});

// Get AWS metrics
router.get('/aws/metrics', async (req, res) => {
  try {
    const metrics = await getAWSMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch AWS metrics' });
  }
});

module.exports = router;