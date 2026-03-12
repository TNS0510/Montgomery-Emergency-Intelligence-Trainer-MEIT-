/**
 * NOTE ON SECURITY AND CONFIGURATION
 * 
 * This service requires an API Key and a Dataset ID to interact with the Bright Data API.
 * To keep these keys secure and avoid committing them to version control, follow these steps:
 * 
 * 1. Create a new file named `.env` in the root of your project directory (alongside `package.json`).
 * 2. Open the `.env.example` file, copy its contents, and paste them into your new `.env` file.
 * 3. In the `.env` file, replace the placeholder values with your actual Bright Data credentials.
 *    
 *    VITE_BRIGHT_DATA_API_KEY="your_actual_api_key"
 *    VITE_BRIGHT_DATA_DATASET_ID="your_actual_dataset_id"
 * 
 * The `VITE_` prefix is essential for Vite projects to expose these variables to the client-side code.
 * The `.env` file is listed in your `.gitignore` and will not be tracked by git.
 */
 
import { Scenario, ResponseCategory } from '../types';
import { StandardizedIncident } from './arcgisService';

const API_BASE_URL = 'https://api.brightdata.com/dca';

// Define types locally to avoid import errors if they are not in the global types file
export interface BrightDataIncident {
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  details: string;
  urgency: 'low' | 'medium' | 'high';
  timestamp?: string;
}

interface ApiConfig {
  apiKey: string;
  datasetId: string;
}

type CrawlStatus = string;

/**
 * Retrieves the Bright Data API configuration from environment variables.
 */
function getApiConfig(): ApiConfig {
  // Support both VITE_ and REACT_APP_ prefixes for compatibility
  const apiKey = (import.meta.env.VITE_BRIGHT_DATA_API_KEY || import.meta.env.REACT_APP_BRIGHT_DATA_API_KEY) as string;
  const datasetId = (import.meta.env.VITE_BRIGHT_DATA_DATASET_ID || import.meta.env.REACT_APP_BRIGHT_DATA_DATASET_ID) as string;

  if (!apiKey || !datasetId) {
    const errorMessage = "Bright Data API key or Dataset ID is missing. Please check your .env file.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  return { apiKey, datasetId };
}

/**
 * Triggers a crawl for the specified dataset.
 * NOTE: This is a simplified example. Real-world usage might require more options.
 */
async function triggerCrawl(config: ApiConfig): Promise<string> {
  console.log("Attempting to trigger new crawl...");
  const response = await fetch(`${API_BASE_URL}/trigger?dataset=${config.datasetId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${config.apiKey}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to trigger crawl: ${response.statusText}`);
  }
  const data = await response.json();
  console.log("Crawl triggered successfully. Crawl ID:", data.crawl_id);
  return data.crawl_id;
}

/**
 * Checks the status of an ongoing crawl.
 */
async function getCrawlStatus(config: ApiConfig, crawlId: string): Promise<CrawlStatus> {
  const response = await fetch(`${API_BASE_URL}/status?crawl_id=${crawlId}`, {
    headers: { 'Authorization': `Bearer ${config.apiKey}` }
  });
  if (!response.ok) {
    throw new Error(`Failed to get crawl status: ${response.statusText}`);
  }
  const data = await response.json();
  return data.status;
}

/**
 * Downloads the latest snapshot of the dataset.
 */
async function downloadLatestSnapshot(config: ApiConfig): Promise<BrightDataIncident[]> {
  console.log("Downloading latest dataset snapshot...");
  const response = await fetch(`${API_BASE_URL}/dataset/snapshot?dataset_id=${config.datasetId}`, {
    headers: { 'Authorization': `Bearer ${config.apiKey}` }
  });
  if (!response.ok) {
    throw new Error(`Failed to download snapshot: ${response.statusText}`);
  }
  const data = await response.json();
  console.log("Snapshot downloaded successfully.");
  return data as BrightDataIncident[];
}

/**
 * Transforms a raw BrightDataIncident into the application's Scenario format.
 * This function contains the logic to map API data to our internal types.
 */
function transformToScenario(raw: BrightDataIncident, existingIds: Set<number>): Scenario {
  // 1. Transform to StandardizedIncident first (Validation Step)
  const incident: StandardizedIncident = {
    id: `bd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Temporary ID
    type: raw.type,
    location: { lat: raw.latitude, lng: raw.longitude },
    description: raw.details,
    priority: raw.urgency,
    timestamp: raw.timestamp || new Date().toISOString()
  };

  // 2. Game Logic transformation
  let correctResponse: ResponseCategory;
  switch (incident.type.toLowerCase()) {
    case 'fire': correctResponse = ResponseCategory.FIRE; break;
    case 'medical': correctResponse = ResponseCategory.MEDICAL; break;
    case 'police': correctResponse = ResponseCategory.POLICE; break;
    default: correctResponse = ResponseCategory.LOW_PRIORITY; break;
  }

  // Generate a unique ID that doesn't conflict with static scenarios
  let newId = Math.floor(Math.random() * 10000) + 1000; // Start live incidents from ID 1000
  while (existingIds.has(newId)) {
    newId = Math.floor(Math.random() * 10000) + 1000;
  }
  // Mark this ID as used immediately so the next incident in this batch doesn't get it
  existingIds.add(newId);
  
  return {
    id: newId,
    location: {
      name: raw.address, // Use original address as name
      lat: incident.location.lat,
      lng: incident.location.lng,
    },
    category: `Live Incident: ${incident.type}`,
    incident: incident.description,
    correctResponse,
    // Static data for fields not provided by the live API
    reason: "Response determined by live incident type.",
    impact: `A ${incident.priority} urgency event requiring immediate attention.`,
    severity: incident.priority === 'high' ? 8 : (incident.priority === 'medium' ? 5 : 2),
  };
}

/**
 * Main orchestrator function to get live incidents.
 * It triggers a crawl, polls for completion, and then downloads the data.
 * Includes a fallback to return an empty array on failure.
 */
async function getLiveIncidents(staticScenarios: Scenario[]): Promise<Scenario[]> {
  try {
    const config = getApiConfig();
    
    // In a real production app, you wouldn't trigger a crawl on every page load.
    // You'd likely trigger it via a webhook or a scheduled job.
    // For this simulation, we'll just download the latest available data.
    const incidents = await downloadLatestSnapshot(config);
    
    if (!incidents || incidents.length === 0) {
      console.log("No new live incidents found.");
      return [];
    }

    console.log(`Found ${incidents.length} live incidents. Transforming to scenarios...`);
    const existingIds = new Set(staticScenarios.map(s => s.id));
    const liveScenarios = incidents.map(incident => transformToScenario(incident, existingIds));
    
    return liveScenarios;

  } catch (error) {
    console.error("--- LIVE INCIDENT FETCH FAILED ---");
    console.error("Could not fetch live incidents from Bright Data API.", error);
    console.log("Falling back to using only static scenarios.");
    return []; // Return empty array on any failure
  }
}

export const brightDataService = {
 getLiveIncidents,
 // Exposing for potential manual use or debugging, but getLiveIncidents is the main entry point.
 triggerCrawl,
 getCrawlStatus,
 downloadLatestSnapshot,
};
