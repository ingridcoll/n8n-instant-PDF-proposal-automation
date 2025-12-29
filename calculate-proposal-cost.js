//Used in node 4) Calculate Total Cost and Format Variables
//Normalizes pricing data from Notion and combines it with cleaned form inputs to calculate service-level costs, fees, and the final proposal total

const cleanSubmission = $("Clean Up Form Submission")?.first().json;
const notionDatabase = $("Fetch Notion Database")?.first().json;

//------- DATABASE PRICING -------
//Parse the Notion database to extract pricing information
function parseDatabaseForPrices(databaseEntries) {
  const prices = {
    SERVICES: {},
    SUPPORT: {},
    DEPLOYMENT: {},
    ENDPOINT_COST_PER_UNIT: null,
    INTEGRATION_FEE: null,
    BASELINE_COST: null,
    IMPLEMENTATION_FEE: null
  };

  if (!databaseEntries || !Array.isArray(databaseEntries)) {
    console.log("Invalid database entries");
    return prices;
  }

  //Extract services, support, and deployment options
  databaseEntries.forEach(entry => {
    const properties = entry.properties || {};
    const serviceName = properties["Service"]?.title?.[0]?.text?.content || "";
    const price = properties["Price"]?.number || 0;
    const category = properties["Category"]?.rich_text?.[0].text?.content || "";

    //Categorize based on service type
    if (category === "SERVICES") {
      prices.SERVICES[serviceName] = price;
    } else if (category === "SUPPORT") {
      prices.SUPPORT[serviceName] = price;
    } else if (category === "DEPLOYMENT") {
      prices.DEPLOYMENT[serviceName] = price;
    } 
    //Extract special pricing items
    else if (serviceName.toLowerCase().includes("endpoint cost")) {
      prices.ENDPOINT_COST_PER_UNIT = price;
    } else if (serviceName.toLowerCase().includes("integration fee")) {
      prices.INTEGRATION_FEE = price;
    } else if (serviceName.toLowerCase().includes("core platform")) {
      prices.BASELINE_COST = price;
    } else if (serviceName.toLowerCase().includes("implementation fee")) {
      prices.IMPLEMENTATION_FEE = price;
    }
  });

  return prices;
}

// Parse the Notion database entries
const parsedPrices = notionDatabase ? parseDatabaseForPrices(notionDatabase.results) : null;

const CONFIG = {
  PRICES: parsedPrices || {
    SERVICES: {
      "Threat Detection & Response": 600,
      "Cloud Security": 500,
      "Compliance Management": 1000,
      "Network Security": 250,
      "Security Awareness Training": 200
    },
    SUPPORT: {
      "Basic Support": 200,
      "Premium Support": 500
    },
    DEPLOYMENT: {
      "Cloud-Based (SaaS)": 1500,
      "Hybrid (Cloud + On-prem)": 1000,
      "On-Premises": 5000
    },
    ENDPOINT_COST_PER_UNIT: 5,
    INTEGRATION_FEE: 300,
    BASELINE_COST: 1000,
    IMPLEMENTATION_FEE: 1200
  },
  
  INDUSTRY_RISK_LEVELS: {
    HIGH: ["Financial Services / FinTech", "Healthcare / Life Sciences", "Government / Public Sector"],
    DEFAULT: "Medium"
  },
  
  DATE_FORMAT_OPTIONS: {
    locale: 'en-US',
    format: DateTime.DATE_FULL
  }
};

//------- HELPER FUNCTIONS -------
//Capitalizes each word in a string
function capitalize(str) {
  if (!str || typeof str !== 'string') return str || '';
  
  return str
    .split(" ")
    .map(word => {
      if (!word) return word; // Handle multiple spaces
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

//Separates strings into "before colon" and "after colon"
function extractTextBeforeColon(text) {
  if (!text || typeof text !== 'string') return { mainString: '', subString: '' };
  
  const colonIndex = text.indexOf(':');
  if (colonIndex === -1) return { mainString: text.trim(), subString: '' };
  
  const mainString = text.slice(0, colonIndex).trim();
  const subString = text.slice(colonIndex + 1).trim();
  return { mainString, subString };
}

//Formats array into string list with commas and "and"
function formatListWithOxford(items, includeOxfordComma = true) {
  if (!items || !Array.isArray(items)) return '';
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  
  const allButLast = items.slice(0, -1);
  const lastItem = items[items.length - 1];
  const separator = includeOxfordComma ? ', and ' : ' and ';
  
  return `${allButLast.join(', ')}${separator}${lastItem}`;
}

//Extracts only numbers from strings
function parseNumberFromString(str) {
  if (!str) return 0;
  const match = str.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

//Calculates industry risk level
function getIndustryRiskLevel(industry) {
  if (!industry) return CONFIG.INDUSTRY_RISK_LEVELS.DEFAULT;
  return CONFIG.INDUSTRY_RISK_LEVELS.HIGH.includes(industry) 
    ? "High" 
    : CONFIG.INDUSTRY_RISK_LEVELS.DEFAULT;
}

//------- DATA PROCESSING -------
function processSubmissionData(submission) {
  if (!submission) return {};
  
  //Capitalization
  const clientFirstName = capitalize(submission.firstName || '');
  const clientLastName = capitalize(submission.lastName || '');
  const clientCompanyName = capitalize(submission.companyName || '');
  
  //Dates
  const proposalDate = $now.setLocale(CONFIG.DATE_FORMAT_OPTIONS.locale)
    .toLocaleString(CONFIG.DATE_FORMAT_OPTIONS.format);
  const proposalExpires = $now.setLocale(CONFIG.DATE_FORMAT_OPTIONS.locale)
    .plus({ days: 7 })
    .toLocaleString(CONFIG.DATE_FORMAT_OPTIONS.format);
  
  //Industry risk
  const industryRiskLevel = getIndustryRiskLevel(submission.industry);
  
  return {
    clientFirstName,
    clientLastName,
    clientCompanyName,
    proposalDate,
    proposalExpires,
    industryRiskLevel,
    raw: submission
  };
}

function extractServiceData(servicesArray) {
  if (!servicesArray || !Array.isArray(servicesArray)) {
    return {
      formattedList: '',
      serviceNames: [],
      serviceStatus: {}
    };
  }
  
  const serviceNames = servicesArray.map(item => {
    const { mainString } = extractTextBeforeColon(item);
    return mainString;
  }).filter(name => name); // Remove empty strings
  
  const serviceStatus = {};
  serviceNames.forEach(service => {
    serviceStatus[service] = "Yes";
  });
  
  return {
    formattedList: formatListWithOxford(serviceNames),
    serviceNames,
    serviceStatus
  };
}

function extractSupportData(supportText) {
  const { mainString: level, subString: description } = extractTextBeforeColon(supportText);
  const cost = CONFIG.PRICES.SUPPORT[level] || 0;
  
  return {
    level: level || '',
    description: description || '',
    cost,
    fullText: supportText || ''
  };
}

function extractDeploymentData(deploymentText) {
  const { mainString: model, subString: description } = extractTextBeforeColon(deploymentText);
  const cost = CONFIG.PRICES.DEPLOYMENT[model] || 0;
  
  return {
    model: model || '',
    description: description || '',
    cost,
    fullText: deploymentText || ''
  };
}

//------- COST CALCULATION -------
function calculateTotalCost(data) {
  const {
    serviceNames = [],
    numberOfEndpoints = 0,
    deploymentCost = 0,
    supportCost = 0,
    requiresIntegration = false
  } = data;
  
  let totalCost = 0;
  
  //Service costs
  serviceNames.forEach(service => {
    if (CONFIG.PRICES.SERVICES[service]) {
      totalCost += CONFIG.PRICES.SERVICES[service];
    }
  });
  
  //Endpoint costs
  const endpointCost = numberOfEndpoints * CONFIG.PRICES.ENDPOINT_COST_PER_UNIT;
  totalCost += endpointCost;
  
  //Other costs
  totalCost += deploymentCost;
  totalCost += supportCost;
  
  if (requiresIntegration) {
    totalCost += CONFIG.PRICES.INTEGRATION_FEE;
  }
  
  //Fixed fees
  totalCost += CONFIG.PRICES.BASELINE_COST;
  totalCost += CONFIG.PRICES.IMPLEMENTATION_FEE;
  
  return {
    total: totalCost,
    breakdown: {
      services: totalCost - (endpointCost + deploymentCost + supportCost + 
        (requiresIntegration ? CONFIG.PRICES.INTEGRATION_FEE : 0) +
        CONFIG.PRICES.BASELINE_COST + CONFIG.PRICES.IMPLEMENTATION_FEE),
      endpoints: endpointCost,
      deployment: deploymentCost,
      support: supportCost,
      integration: requiresIntegration ? CONFIG.PRICES.INTEGRATION_FEE : 0,
      baseline: CONFIG.PRICES.BASELINE_COST,
      implementation: CONFIG.PRICES.IMPLEMENTATION_FEE
    }
  };
}

//------- MAIN EXECUTION -------
//Process base submission data
const processedData = processSubmissionData(cleanSubmission);

//Extract and process service data
const serviceData = extractServiceData(cleanSubmission?.servicesRequested);

//Extract support data
const supportData = extractSupportData(cleanSubmission?.supportLevel);

//Extract deployment data
const deploymentData = extractDeploymentData(cleanSubmission?.deploymentModel);

//Parse endpoints
const numberOfEndpoints = parseNumberFromString(cleanSubmission?.numberOfEndpoints);

//Prepare data for cost calculation
const costData = {
  serviceNames: serviceData.serviceNames,
  numberOfEndpoints,
  deploymentCost: deploymentData.cost,
  supportCost: supportData.cost,
  requiresIntegration: cleanSubmission?.requiresIntegrations === "Yes"
};

//Calculate total cost
const costCalculation = calculateTotalCost(costData);

//------- RETURN OBJECT -------
return {
  //Client Information
  clientFirstName: processedData.clientFirstName || "Hi",
  clientLastName: processedData.clientLastName || "",
  clientFullName: `${processedData.clientFirstName} ${processedData.clientLastName}`.trim() || "Client",
  clientEmail: cleanSubmission?.clientEmail || "No email provided",
  clientCompanyName: processedData.clientCompanyName || "No company name provided",
  clientCompanyWebsite: cleanSubmission?.website || "No website provided",
  
  //Proposal Information
  proposalDate: processedData.proposalDate,
  proposalExpires: processedData.proposalExpires,
  
  //Company Information
  companySize: cleanSubmission?.companySize || "",
  industryRiskLevel: processedData.industryRiskLevel,
  industry: cleanSubmission?.industry || "",
  complianceSupport: cleanSubmission?.complianceSupport || "",
  
  //Services
  servicesRequested: serviceData.formattedList,
  
  //Support
  supportLevelShort: supportData.level,
  supportLevelLong: supportData.fullText,
  supportLevelDescription: supportData.description,
  supportLevelCost: supportData.cost,
  
  //Deployment
  deploymentModelShort: deploymentData.model,
  deploymentModelLong: deploymentData.fullText,
  deploymentModelDescription: deploymentData.description,
  deploymentCost: deploymentData.cost,
  
  //Technical Details
  numberOfEndpoints: numberOfEndpoints,
  endpointTotalCost: numberOfEndpoints * CONFIG.PRICES.ENDPOINT_COST_PER_UNIT,
  requiresIntegrations: cleanSubmission?.requiresIntegrations || "",
  
  //Cost Summary
  totalCost: costCalculation.total,
  costBreakdown: costCalculation.breakdown,
  
  threatRequested: serviceData.serviceStatus["Threat Detection & Response"] || "No",
  endpointRequested: serviceData.serviceStatus["Endpoint Security"] || "No",
  encryptionRequested: serviceData.serviceStatus["Data Encryption & Protection"] || "No",
  cloudRequested: serviceData.serviceStatus["Cloud Security"] || "No",
  complianceRequested: serviceData.serviceStatus["Compliance Management"] || "No",
  networkRequested: serviceData.serviceStatus["Network Security"] || "No",
  trainingRequested: serviceData.serviceStatus["Security Awareness Training"] || "No"
};
