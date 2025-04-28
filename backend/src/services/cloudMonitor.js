const axios = require('axios');
const AWS = require('aws-sdk');

// ======================
// 🔄 CACHE & CONFIG
// ======================
let azureTokenCache = { token: null, expiresAt: 0 };

// Configure AWS once at startup
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const cloudwatch = new AWS.CloudWatch();
const ec2 = new AWS.EC2();
const costExplorer = new AWS.CostExplorer({ region: 'us-east-1' });

// ======================
// ✅ AZURE FUNCTIONS
// ======================
const getAzureToken = async () => {
  try {
    // Return cached token if valid
    if (azureTokenCache.token && Date.now() < azureTokenCache.expiresAt) {
      return azureTokenCache.token;
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', process.env.AZURE_CLIENT_ID);
    params.append('client_secret', process.env.AZURE_CLIENT_SECRET);
    params.append('resource', 'https://management.azure.com');

    const response = await axios.post(
      `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/token`,
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    // Cache token with 5-minute buffer before expiry
    azureTokenCache = {
      token: response.data.access_token,
      expiresAt: Date.now() + (response.data.expires_in * 1000 - 300000)
    };

    return response.data.access_token;
  } catch (error) {
    console.error('Azure Token Error:', error.response?.data || error.message);
    throw new Error('Failed to get Azure token');
  }
};

const getAzureMetrics = async () => {
  try {
    const token = await getAzureToken();
    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 86400000).toISOString(); // 24 hours ago

    const response = await axios.get(
      `https://management.azure.com/subscriptions/${process.env.AZURE_SUBSCRIPTION_ID}/resourceGroups/${process.env.AZURE_RESOURCE_GROUP}/providers/Microsoft.Web/staticSites/${process.env.AZURE_STATIC_SITE_NAME}/providers/microsoft.insights/metrics?api-version=2018-01-01&metricnames=SiteHits,SiteErrors,FunctionHits&timespan=${startTime}/${endTime}&interval=PT5M`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return response.data.value || [];
  } catch (error) {
    console.error("Azure metrics fetch failed:", error.response?.data || error.message);
    throw error;
  }
};

// ======================
// ☁️ AWS FUNCTIONS
// ======================
const getAWSMetrics = async () => {
  try {
    const endTime = new Date();
    const startTime = new Date(endTime - 3600000); // 1 hour ago

    const metrics = await cloudwatch.getMetricData({
      StartTime: startTime,
      EndTime: endTime,
      MetricDataQueries: [
        {
          Id: 'cpu',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'CPUUtilization',
              Dimensions: [{ Name: 'InstanceId', Value: process.env.AWS_EC2_INSTANCE_ID }]
            },
            Period: 300,
            Stat: 'Average'
          }
        },
        {
          Id: 'networkIn',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'NetworkIn',
              Dimensions: [{ Name: 'InstanceId', Value: process.env.AWS_EC2_INSTANCE_ID }]
            },
            Period: 300,
            Stat: 'Sum'
          }
        },
        {
          Id: 'networkOut',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'NetworkOut',
              Dimensions: [{ Name: 'InstanceId', Value: process.env.AWS_EC2_INSTANCE_ID }]
            },
            Period: 300,
            Stat: 'Sum'
          }
        },
        {
          Id: 'diskRead',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'DiskReadBytes',
              Dimensions: [{ Name: 'InstanceId', Value: process.env.AWS_EC2_INSTANCE_ID }]
            },
            Period: 300,
            Stat: 'Sum'
          }
        },
        {
          Id: 'diskWrite',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'DiskWriteBytes',
              Dimensions: [{ Name: 'InstanceId', Value: process.env.AWS_EC2_INSTANCE_ID }]
            },
            Period: 300,
            Stat: 'Sum'
          }
        },
        {
          Id: 'statusChecks',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'StatusCheckFailed',
              Dimensions: [{ Name: 'InstanceId', Value: process.env.AWS_EC2_INSTANCE_ID }]
            },
            Period: 300,
            Stat: 'Maximum'
          }
        }
      ]
    }).promise();

    return metrics.MetricDataResults || [];
  } catch (error) {
    console.error("AWS metrics fetch failed:", error);
    throw error;
  }
};

// ======================
// 📊 STATUS CHECKS
// ======================
const checkAzureStatus = async () => {
  try {
    const [statusRes, metrics] = await Promise.all([
      axios.get(
        `https://management.azure.com/subscriptions/${process.env.AZURE_SUBSCRIPTION_ID}/resourceGroups/${process.env.AZURE_RESOURCE_GROUP}/providers/Microsoft.Web/staticSites/${process.env.AZURE_STATIC_SITE_NAME}?api-version=2022-03-01`,
        { headers: { Authorization: `Bearer ${await getAzureToken()}` } }
      ),
      getAzureMetrics()
    ]);

    return {
      id: "azure",
      name: "Azure Static Web App",
      status: statusRes.data?.properties?.provisioningState || "UNKNOWN",
      url: statusRes.data?.properties?.defaultHostname || "N/A",
      metrics: metrics,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error("Azure status check failed:", error.response?.data || error.message);
    return {
      id: "azure",
      status: "ERROR",
      error: error.response?.data?.error?.message || error.message,
      lastUpdated: new Date().toISOString()
    };
  }
};

const checkAWSStatus = async () => {
  try {
    const [instanceData, metrics] = await Promise.all([
      ec2.describeInstanceStatus({
        InstanceIds: [process.env.AWS_EC2_INSTANCE_ID],
        IncludeAllInstances: true
      }).promise(),
      getAWSMetrics()
    ]);

    const instance = instanceData.InstanceStatuses?.[0];

    return {
      id: "aws-ec2",
      name: "AWS EC2 Backend",
      status: instance?.InstanceState?.Name?.toUpperCase() || "UNKNOWN",
      url: process.env.AWS_EC2_PUBLIC_DNS || 
           (process.env.AWS_EC2_PUBLIC_IP ? `http://${process.env.AWS_EC2_PUBLIC_IP}:5000` : "N/A"),
      metrics: metrics,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error("AWS status check failed:", error);
    return {
      id: "aws-ec2",
      status: "ERROR",
      error: error.message,
      lastUpdated: new Date().toISOString()
    };
  }
};

// ======================
// 💰 BILLING UTILS
// ======================
const getAzureBilling = async () => {
  try {
    const token = await getAzureToken();
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

    const response = await axios.post(
      `https://management.azure.com/subscriptions/${process.env.AZURE_SUBSCRIPTION_ID}/providers/Microsoft.CostManagement/query?api-version=2021-10-01`,
      {
        type: "ActualCost",
        timeframe: "Custom",
        timePeriod: { from: start, to: today.toISOString() },
        dataset: {
          granularity: "None",
          aggregation: { totalCost: { name: "PreTaxCost", function: "Sum" } },
          filter: {
            dimensions: {
              name: "ResourceType",
              operator: "In",
              values: ["microsoft.web/staticsites"]
            }
          }
        }
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const amount = response.data?.properties?.rows?.[0]?.[0];
    return amount ? parseFloat(amount.toFixed(2)) : 0;
  } catch (error) {
    console.error("Azure billing fetch failed:", error.response?.data || error.message);
    return 0;
  }
};

const getAWSBilling = async () => {
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const end = today.toISOString().split('T')[0];

    const data = await costExplorer.getCostAndUsage({
      TimePeriod: { Start: start, End: end },
      Granularity: "MONTHLY",
      Metrics: ["UnblendedCost"],
      Filter: {
        Dimensions: {
          Key: "SERVICE",
          Values: ["Amazon Elastic Compute Cloud - Compute"]
        }
      }
    }).promise();

    const amount = data.ResultsByTime?.[0]?.Total?.UnblendedCost?.Amount;
    return amount ? parseFloat(parseFloat(amount).toFixed(2)) : 0;
  } catch (error) {
    console.error("AWS billing fetch failed:", error);
    return 0;
  }
};

// ======================
// 🚀 EXPORTED METHODS
// ======================
module.exports = {
  checkAzureStatus,
  checkAWSStatus,
  getAzureMetrics,
  getAWSMetrics,
  getAzureBilling,
  getAWSBilling,
  getCombinedBilling: async (req, res) => {
    try {
      const [azureCost, awsCost] = await Promise.all([
        getAzureBilling(),
        getAWSBilling()
      ]);
      
      res.json({
        azure: azureCost,
        aws: awsCost,
        total: parseFloat((azureCost + awsCost).toFixed(2))
      });
    } catch (error) {
      console.error("Combined billing failed:", error);
      res.status(500).json({ 
        error: "Billing fetch failed", 
        details: error.message 
      });
    }
  }
};