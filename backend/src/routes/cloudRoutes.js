const express = require('express');
const { 
  checkAzureStatus, 
  checkAWSStatus,
  getAzureMetrics,
  getAWSMetrics,
  getAzureBilling,
  getAWSBilling,
  getCombinedBilling
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

// ✅ Get Combined Billing Info (Azure + AWS)
router.get('/billing', async (req, res) => {
  try {
    const [azure, aws] = await Promise.all([
      getAzureBilling(),
      getAWSBilling()
    ]);
    res.json({
      azure,
      aws,
      total: parseFloat((azure + aws).toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch billing info', details: error.message });
  }
});

module.exports = router;
