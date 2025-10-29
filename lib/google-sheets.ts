/**
 * Google Sheets Integration Service
 *
 * This service provides functionality to fetch data from Google Sheets
 * using the Google Sheets API v4 with public read access.
 */

interface Deal {
  deal_id: string;
  deal_name: string;
  broker_name: string;
  deal_value: number;
  created_time?: string | null;
  status: string;
  process_days: number | null;
  latest_date: string | null;
  new_lead?: string | null;

  // Pipeline stages (dates)
  'Enquiry Leads': string | null;
  'Opportunity': string | null;
  '1. Application': string | null;
  '2. Assessment': string | null;
  '3. Approval': string | null;
  '4. Loan Document': string | null;
  '5. Settlement Queue': string | null;
  '6. Settled': string | null;

  // Settlement tracking
  '2025 Settlement': string | null;
  '2024 Settlement': string | null;

  // Lost deal tracking
  'Lost date': string | null;
  'lost reason': string | null;
  'which process (if lost)': string | null;

  // Source tracking
  'From Rednote?': string;
  'From LifeX?': string;
}

/**
 * Extract spreadsheet ID from various Google Sheets URL formats
 */
export function extractSpreadsheetId(input: string): string | null {
  // If it's already just an ID (no slashes), return it
  if (!input.includes('/') && !input.includes('?')) {
    return input.trim();
  }

  // Match various Google Sheets URL patterns
  const patterns = [
    /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
    /\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetch data from a public Google Sheet
 *
 * @param spreadsheetId - The Google Sheets ID or full URL
 * @param apiKey - Google API key with Sheets API enabled
 * @param range - The range to fetch (e.g., 'Sheet1!A1:Z1000' or just 'Sheet1')
 * @returns Array of Deal objects
 */
export async function fetchGoogleSheetData(
  spreadsheetId: string,
  apiKey: string,
  range: string = 'Sheet1'
): Promise<Deal[]> {
  try {
    // Extract ID from URL if needed
    const sheetId = extractSpreadsheetId(spreadsheetId);

    if (!sheetId) {
      throw new Error('Invalid spreadsheet ID or URL');
    }

    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API key is required');
    }

    // Construct the Google Sheets API URL
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;

    // Fetch the data
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied. Make sure the sheet is publicly accessible and the API key is valid.');
      } else if (response.status === 404) {
        throw new Error('Sheet not found. Check the spreadsheet ID and range.');
      }
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.values || data.values.length === 0) {
      throw new Error('No data found in the specified range');
    }

    // Parse the data
    const [headers, ...rows] = data.values;

    if (rows.length === 0) {
      throw new Error('Sheet contains headers but no data rows');
    }

    // Convert rows to Deal objects
    const deals: Deal[] = rows
      .map((row: any[], index: number) => {
        const deal: any = {};

        headers.forEach((header: string, colIndex: number) => {
          const value = row[colIndex] !== undefined ? row[colIndex] : null;

          // Handle different data types
          if (header === 'deal_value') {
            // Parse currency values
            const numValue = typeof value === 'string'
              ? parseFloat(value.replace(/[$,]/g, ''))
              : value;
            deal[header] = isNaN(numValue) ? 0 : numValue;
          } else if (header === 'process_days') {
            const numValue = typeof value === 'string'
              ? parseInt(value, 10)
              : value;
            deal[header] = isNaN(numValue) ? null : numValue;
          } else {
            deal[header] = value;
          }
        });

        // Auto-generate deal_id if missing
        if (!deal.deal_id) {
          deal.deal_id = `DEAL-${Date.now()}-${index}`;
        }

        // Ensure required fields have defaults
        deal.deal_name = deal.deal_name || 'Unnamed Deal';
        deal.broker_name = deal.broker_name || 'Unknown';
        deal.status = deal.status || 'Unknown';
        deal.deal_value = deal.deal_value || 0;

        return deal as Deal;
      })
      .filter((deal: Deal) => {
        // Filter out completely empty deals
        return deal.deal_id && (deal.deal_name !== 'Unnamed Deal' || deal.deal_value > 0);
      });

    return deals;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while fetching Google Sheets data');
  }
}

/**
 * Validate Google Sheets connection
 *
 * @param spreadsheetId - The Google Sheets ID or full URL
 * @param apiKey - Google API key
 * @returns Promise<boolean> - true if connection is valid
 */
export async function validateGoogleSheetConnection(
  spreadsheetId: string,
  apiKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const sheetId = extractSpreadsheetId(spreadsheetId);

    if (!sheetId) {
      return { valid: false, error: 'Invalid spreadsheet ID or URL' };
    }

    if (!apiKey || apiKey.trim() === '') {
      return { valid: false, error: 'API key is required' };
    }

    // Try to fetch just the spreadsheet metadata
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}&fields=sheets.properties.title`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 403) {
        return { valid: false, error: 'Access denied. Check your API key and sheet permissions.' };
      } else if (response.status === 404) {
        return { valid: false, error: 'Spreadsheet not found.' };
      }
      return { valid: false, error: `Connection failed: ${response.statusText}` };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get available sheet names from a spreadsheet
 *
 * @param spreadsheetId - The Google Sheets ID or full URL
 * @param apiKey - Google API key
 * @returns Array of sheet names
 */
export async function getSheetNames(
  spreadsheetId: string,
  apiKey: string
): Promise<string[]> {
  try {
    const sheetId = extractSpreadsheetId(spreadsheetId);

    if (!sheetId) {
      throw new Error('Invalid spreadsheet ID or URL');
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}&fields=sheets.properties.title`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch sheet names: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.sheets || data.sheets.length === 0) {
      return ['Sheet1'];
    }

    return data.sheets.map((sheet: any) => sheet.properties.title);
  } catch (error) {
    console.error('Error fetching sheet names:', error);
    return ['Sheet1']; // Default fallback
  }
}
