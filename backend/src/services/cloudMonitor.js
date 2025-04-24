const axios = require('axios');
const AWS = require('aws-sdk');

// Azure Token Service
const getAzureToken = async () => {
  try {
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
    return response.data.access_token;
  } catch (error) {
    console.error('Azure Token Error:', error.response?.data || error.message);
    throw new Error('Failed to get Azure token');
  }
};

// Get Azure Metrics
const getAzureMetrics = async () => {
  try {
    const token = await getAzureToken();

    const endTime = new Date().toISOString();
    const startTime = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
    const response = await axios.get(
      `https://management.azure.com/subscriptions/${process.env.AZURE_SUBSCRIPTION_ID}/resourceGroups/${process.env.AZURE_RESOURCE_GROUP}/providers/Microsoft.Web/staticSites/${process.env.AZURE_STATIC_SITE_NAME}/providers/microsoft.insights/metrics?api-version=2018-01-01&metricnames=SiteHits,SiteErrors,FunctionHits&timespan=${startTime}/${endTime}&interval=PT5M`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data.value;
  } catch (error) {
    console.error("Azure metrics fetch failed:", error.response?.data || error.message);
    throw error;
  }
};

// Get AWS CloudWatch Metrics
const getAWSMetrics = async () => {
  try {
    const cloudwatch = new AWS.CloudWatch({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const endTime = new Date();
    const startTime = new Date(endTime - 1000 * 60 * 60); // Last hour

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
              Dimensions: [{
                Name: 'InstanceId',
                Value: process.env.AWS_EC2_INSTANCE_ID
              }]
            },
            Period: 60,
            Stat: 'Average'
          }
        },
        {
          Id: 'memory',
          MetricStat: {
            Metric: {
              Namespace: 'AWS/EC2',
              MetricName: 'MemoryUtilization',
              Dimensions: [{
                Name: 'InstanceId',
                Value: process.env.AWS_EC2_INSTANCE_ID
              }]
            },
            Period: 60,
            Stat: 'Average'
          }
        }
      ]
    }).promise();

    return metrics.MetricDataResults;
  } catch (error) {
    console.error("AWS metrics fetch failed:", error);
    throw error;
  }
};

// Azure Status Check
const checkAzureStatus = async () => {
  try {
    console.log("Fetching Azure status...");
    const [status, metrics] = await Promise.all([
      axios.get(
        `https://management.azure.com/subscriptions/${process.env.AZURE_SUBSCRIPTION_ID}/resourceGroups/${process.env.AZURE_RESOURCE_GROUP}/providers/Microsoft.Web/staticSites/${process.env.AZURE_STATIC_SITE_NAME}?api-version=2022-03-01`,
        {
          headers: { Authorization: `Bearer ${await getAzureToken()}` }
        }
      ),
      getAzureMetrics()
    ]);

    return {
      id: "azure",
      name: "Azure Static Web App",
      status: status.data.properties.provisioningState,
      url: status.data.properties.defaultHostname || "N/A",
      metrics: metrics,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error("Azure status check failed:", error.response?.data || error.message);
    return { 
      id: "azure", 
      status: "Error", 
      error: error.response?.data?.error?.message || error.message,
      lastUpdated: new Date()
    };
  }
};

// AWS Status Check with Metrics
const checkAWSStatus = async () => {
  try {
    AWS.config.update({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    const ec2 = new AWS.EC2();
    const [instanceData, metrics] = await Promise.all([
      ec2.describeInstanceStatus({
        InstanceIds: [process.env.AWS_EC2_INSTANCE_ID],
        IncludeAllInstances: true
      }).promise(),
      getAWSMetrics()
    ]);

    const instance = instanceData.InstanceStatuses[0];

    return {
      id: "aws-ec2",
      name: "AWS EC2 Backend",
      status: instance.InstanceState.Name.toUpperCase(),
      url: process.env.AWS_EC2_PUBLIC_DNS || 
           (process.env.AWS_EC2_PUBLIC_IP ? `http://${process.env.AWS_EC2_PUBLIC_IP}:5000` : "N/A"),
      metrics: metrics,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error("AWS status check failed:", error);
    return { 
      id: "aws-ec2", 
      status: "ERROR", 
      error: error.message,
      lastUpdated: new Date()
    };
  }
};

module.exports = { 
  checkAzureStatus, 
  checkAWSStatus,
  getAzureMetrics,
  getAWSMetrics
};
