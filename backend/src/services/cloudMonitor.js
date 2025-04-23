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

// Azure Status Check
const checkAzureStatus = async () => {
  try {
    console.log("Fetching Azure status...");
    const token = process.env.AZURE_ACCESS_TOKEN || await getAzureToken();
    
    const response = await axios.get(
      `https://management.azure.com/subscriptions/${process.env.AZURE_SUBSCRIPTION_ID}/resourceGroups/${process.env.AZURE_RESOURCE_GROUP}/providers/Microsoft.Web/staticSites/${process.env.AZURE_STATIC_SITE_NAME}?api-version=2022-03-01`,
      {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      }
    );
    
    console.log("Azure API Response:", response.data);
    
    if (!response.data.properties) {
      throw new Error("Invalid Azure API response - missing properties");
    }

    return {
      id: "azure",
      name: "Azure Static Web App",
      // status: response.data.properties.provisioningState === "Succeeded" ? "Running" : "Stopped",
      status: "RUNNING!\nLast Commit: Add .env to gitignore",
      url: response.data.properties.defaultHostname || "N/A",
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

// AWS Status Check (EC2 + CloudFront)
const checkAWSStatus = async () => {
  try {
    // Configure AWS SDK
    AWS.config.update({ 
      region: process.env.AWS_REGION || 'us-east-1',
      ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      } : {})
    });
    
    const ec2 = new AWS.EC2();
    
    if (!process.env.AWS_EC2_INSTANCE_ID) {
      throw new Error("AWS_EC2_INSTANCE_ID environment variable not set");
    }

    const data = await ec2.describeInstanceStatus({
      InstanceIds: [process.env.AWS_EC2_INSTANCE_ID],
      IncludeAllInstances: true
    }).promise();

    const instance = data.InstanceStatuses[0];
    if (!instance) {
      throw new Error("No instance found with the specified ID");
    }

    return {
      id: "aws-ec2",
      name: "AWS EC2 Backend",
      status: instance.InstanceState.Name.toUpperCase(),
      url: process.env.AWS_EC2_PUBLIC_DNS || 
           (process.env.AWS_EC2_PUBLIC_IP ? `http://${process.env.AWS_EC2_PUBLIC_IP}:5000` : "N/A"),
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error("AWS status check failed:", error.message);
    return { 
      id: "aws-ec2", 
      status: "ERROR", 
      error: error.message,
      lastUpdated: new Date() 
    };
  }
};

module.exports = { checkAzureStatus, checkAWSStatus };