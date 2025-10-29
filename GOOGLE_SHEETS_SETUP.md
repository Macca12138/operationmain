# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets integration for the LifeX Deals Dashboard.

## Overview

The dashboard now supports loading data directly from Google Sheets instead of uploading files locally. This allows for real-time data updates and easier data management.

## Prerequisites

1. A Google Cloud account
2. A Google Sheet with your deals data
3. Basic understanding of Google Cloud Console

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "LifeX Dashboard")
5. Click "Create"

### 2. Enable Google Sheets API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Sheets API"
3. Click on it and press "Enable"

### 3. Create an API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" at the top
3. Select "API key"
4. Your API key will be created and displayed
5. **IMPORTANT**: Copy and save this key securely
6. (Optional but recommended) Click "Restrict Key" to add restrictions:
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API" from the dropdown
   - Save

### 4. Prepare Your Google Sheet

1. Open your Google Sheet with deals data
2. Make sure the first row contains column headers that match the expected format:
   - Required: `deal_id`, `deal_name`, `broker_name`, `deal_value`
   - Optional: `status`, `created_time`, `process days`, pipeline stages, etc.

3. Make the sheet accessible:

   **Option A: Public Access (Simpler)**
   - Click "Share" button
   - Click "Change" under "General access"
   - Select "Anyone with the link"
   - Change permission to "Viewer"
   - Click "Done"

   **Option B: Specific Access (More Secure)**
   - The API key approach requires public access
   - For more secure access, you would need to use OAuth2 (not covered in this basic setup)

4. Copy the Sheet URL or ID:
   - The URL looks like: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
   - You can paste the full URL or just the `SHEET_ID` part

### 5. Use in the Dashboard

1. Open the LifeX Dashboard
2. Click on the "Google Sheets" tab
3. Enter your API Key (from step 3)
4. Enter your Sheet ID or URL (from step 4)
5. (Optional) Specify sheet name or range (default is "Sheet1")
6. Click "Load Data from Google Sheets"

## Data Format

Your Google Sheet should have columns matching this structure:

### Required Columns
- `deal_id` - Unique identifier for the deal
- `deal_name` - Name of the deal
- `broker_name` - Name of the broker
- `deal_value` - Value of the deal (can include currency symbols like $)

### Optional Columns
- `status` - Current status of the deal
- `created_time` - When the deal was created
- `process days` - Number of days in process
- `latest_date` - Most recent activity date
- `new_lead?` - Whether this is a new lead

### Pipeline Stage Columns
- `Enquiry Leads`
- `Opportunity`
- `1. Application`
- `2. Assessment`
- `3. Approval`
- `4. Loan Document`
- `5. Settlement Queue`
- `6. Settled`

### Additional Tracking Columns
- `2025 Settlement`
- `2024 Settlement`
- `Lost date`
- `lost reason`
- `which process (if lost)`
- `From Rednote?`
- `From LifeX?`

## Security Best Practices

1. **API Key Security**
   - Never commit your API key to version control
   - Use API restrictions in Google Cloud Console
   - Consider using environment variables for production

2. **Sheet Access**
   - Only make sheets public if the data is not sensitive
   - Regularly audit who has access to your sheets
   - Consider using service accounts for production environments

3. **Data Privacy**
   - Be aware that data loaded from Google Sheets is stored in browser sessionStorage
   - Data is cleared when the browser tab is closed
   - No data is sent to external servers

## Troubleshooting

### "Access denied" Error
- Check that your API key is correct
- Verify the Google Sheets API is enabled in your project
- Ensure the sheet is publicly accessible or properly shared

### "Sheet not found" Error
- Verify the Sheet ID or URL is correct
- Check that the sheet hasn't been deleted
- Ensure you're using the correct sheet name/range

### "No data found" Error
- Check that your sheet has data beyond just headers
- Verify the sheet name or range is correct (default is "Sheet1")
- Make sure the first row contains column headers

### "Invalid spreadsheet ID" Error
- Ensure you're using a valid Google Sheets URL or ID
- The ID should be alphanumeric with hyphens and underscores

## Advanced Usage

### Specifying a Range
Instead of loading the entire sheet, you can specify a range:
- `Sheet1!A1:Z1000` - Loads columns A to Z, rows 1 to 1000
- `Deals!A:Z` - Loads all rows from columns A to Z in the "Deals" sheet
- `Sheet2` - Loads all data from Sheet2

### Multiple Sheets
If your spreadsheet has multiple sheets, specify the sheet name:
- Default: `Sheet1`
- Custom: `Deals`, `2024 Data`, etc.

### Refreshing Data
To reload data from Google Sheets:
1. Click the "Google Sheets" tab
2. The form will remember your last inputs
3. Click "Load Data from Google Sheets" again

## Architecture

### Components Created
- `lib/google-sheets.ts` - Core service for Google Sheets API integration
- `components/google-sheets-loader.tsx` - React component for the UI
- Modified `components/deals-dashboard.tsx` - Integrated tabs for file upload and Google Sheets

### Data Flow
1. User enters API key and Sheet ID
2. System validates connection to Google Sheets
3. Data is fetched using Google Sheets API v4
4. Raw data is converted to Deal objects
5. Data is stored in sessionStorage and component state
6. Dashboard renders with the loaded data

## API Limits

Google Sheets API has usage limits:
- 300 requests per minute per project
- 100 requests per 100 seconds per user

For this dashboard, each data load counts as 1-2 requests, so you're unlikely to hit limits with normal usage.

## Future Enhancements

Potential improvements:
1. OAuth2 authentication for private sheets
2. Auto-refresh functionality
3. Real-time updates using Google Sheets webhooks
4. Support for writing data back to sheets
5. Multi-sheet aggregation

## Support

For issues or questions:
1. Check this documentation
2. Verify your API key and sheet permissions
3. Check the browser console for detailed error messages
4. Review the Google Cloud Console for API usage and errors
