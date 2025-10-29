# Auto-Load Configuration Guide

This guide explains how to configure the dashboard to automatically load data from Google Sheets when it starts.

## Overview

The dashboard can now automatically load data from Google Sheets on startup, eliminating the need to manually upload files or configure the Google Sheets settings each time.

## Quick Setup

1. **Create your `.env.local` file**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   ```

2. **Edit `.env.local` with your Google Sheets details**
   ```env
   NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_api_key_here
   NEXT_PUBLIC_GOOGLE_SHEETS_ID=your_sheet_id_here
   NEXT_PUBLIC_GOOGLE_SHEETS_RANGE=sheet10
   NEXT_PUBLIC_AUTO_LOAD_GOOGLE_SHEETS=true
   ```

3. **Restart the development server**
   ```bash
   npm run dev
   ```

## Environment Variables Explained

### NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY
- **Required**: Yes (if auto-load is enabled)
- **Description**: Your Google Cloud API key with Google Sheets API enabled
- **Example**: `AIzaSyANryJMnNvAiVe6rzV2P5aJEg1cxcVBfrM`
- **How to get**: See [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)

### NEXT_PUBLIC_GOOGLE_SHEETS_ID
- **Required**: Yes (if auto-load is enabled)
- **Description**: Your Google Sheet ID or full URL
- **Example**: `1BBDiji27c4OqSSwXBzhSneh1_w8QUOEXVfiw6PiLI4E`
- **Full URL Example**: `https://docs.google.com/spreadsheets/d/1BBDiji27c4OqSSwXBzhSneh1_w8QUOEXVfiw6PiLI4E/edit`
- **Note**: You can use either just the ID or the full URL

### NEXT_PUBLIC_GOOGLE_SHEETS_RANGE
- **Required**: No
- **Default**: `Sheet1`
- **Description**: The sheet name or range to load from
- **Examples**:
  - `Sheet1` - Load all data from Sheet1
  - `sheet10` - Load all data from sheet10
  - `Sheet1!A1:Z1000` - Load a specific range
  - `Deals!A:Z` - Load all rows from columns A to Z

### NEXT_PUBLIC_AUTO_LOAD_GOOGLE_SHEETS
- **Required**: No
- **Default**: `false`
- **Description**: Whether to automatically load Google Sheets data on startup
- **Values**:
  - `true` - Auto-load from Google Sheets
  - `false` - Show upload screen (user chooses data source)

## How Auto-Load Works

1. **On First Load**:
   - Dashboard checks if there's data in browser sessionStorage
   - If no stored data, checks if auto-load is enabled in `.env.local`
   - If enabled, automatically fetches data from Google Sheets
   - Dashboard displays with loaded data

2. **On Subsequent Visits (Same Session)**:
   - Dashboard loads from sessionStorage (faster)
   - No need to fetch from Google Sheets again
   - Data persists until browser tab is closed

3. **After Closing Browser Tab**:
   - SessionStorage is cleared
   - Next visit will auto-load from Google Sheets again

## Manual Upload Option

Even with auto-load enabled, users can still upload new data:

1. Click the **"Upload New Data"** button in the header
2. This will:
   - Clear current data
   - Clear sessionStorage
   - Show the upload screen
3. Choose either:
   - **Upload File** tab - for local JSON/Excel files
   - **Google Sheets** tab - to load from a different sheet

## Changing Google Sheets Configuration

To update your Google Sheets details:

1. **Edit `.env.local`**
   - Change `NEXT_PUBLIC_GOOGLE_SHEETS_ID` to your new sheet ID
   - Change `NEXT_PUBLIC_GOOGLE_SHEETS_RANGE` if needed
   - Save the file

2. **Restart the development server**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

3. **Clear browser cache** (optional but recommended)
   - Or just clear sessionStorage in browser DevTools
   - Or click "Upload New Data" button

## Security Considerations

### API Key Security

The `.env.local` file is automatically ignored by git (see `.gitignore`), so your API key won't be committed to version control.

**Important**:
- Never commit `.env.local` to git
- Never share your API key publicly
- Use API restrictions in Google Cloud Console
- For production, consider using server-side environment variables

### Sheet Access

Your Google Sheet must be:
- Publicly accessible (anyone with link can view), OR
- Properly shared with your service account (advanced setup)

**Note**: For this basic setup, we're using public access with API key restrictions.

## Production Deployment

### For Vercel/Netlify

1. **Don't commit `.env.local`** - it's for local development only

2. **Add environment variables in your hosting platform**:
   - Go to your project settings
   - Add each `NEXT_PUBLIC_*` variable
   - Values will be injected at build time

### For Docker

```dockerfile
# In your docker-compose.yml or Dockerfile
ENV NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=${GOOGLE_SHEETS_API_KEY}
ENV NEXT_PUBLIC_GOOGLE_SHEETS_ID=${GOOGLE_SHEETS_ID}
ENV NEXT_PUBLIC_GOOGLE_SHEETS_RANGE=${GOOGLE_SHEETS_RANGE}
ENV NEXT_PUBLIC_AUTO_LOAD_GOOGLE_SHEETS=true
```

## Troubleshooting

### Auto-load not working

1. **Check environment variables are set**
   ```bash
   # In development, these should work:
   echo $NEXT_PUBLIC_AUTO_LOAD_GOOGLE_SHEETS
   ```

2. **Restart dev server**
   - Environment variables are loaded at server start
   - Changes require restart

3. **Check browser console**
   - Open DevTools (F12)
   - Look for error messages
   - Common issues: API key invalid, sheet not accessible

### Data not updating

1. **Clear sessionStorage**
   ```javascript
   // In browser console:
   sessionStorage.removeItem('dashboard-deals-data')
   ```

2. **Or click "Upload New Data" button**
   - This clears all cached data
   - Forces fresh load on next visit

### Environment variables not found

**Problem**: `process.env.NEXT_PUBLIC_*` is undefined

**Solution**:
- Ensure variable names start with `NEXT_PUBLIC_`
- Restart development server
- Check `.env.local` exists in project root
- No spaces around `=` in env file

## Workflow Examples

### Daily Usage (Auto-Load Enabled)

1. Update your Google Sheet with new deals
2. Open the dashboard - **data loads automatically**
3. View real-time analytics
4. Close browser when done

### Switching Between Sheets

```env
# In .env.local

# Option 1: Use 2024 data
NEXT_PUBLIC_GOOGLE_SHEETS_ID=1BBDiji27c4OqSSwXBzhSneh1_w8QUOEXVfiw6PiLI4E
NEXT_PUBLIC_GOOGLE_SHEETS_RANGE=2024_Deals

# Option 2: Use 2025 data
# NEXT_PUBLIC_GOOGLE_SHEETS_ID=1BBDiji27c4OqSSwXBzhSneh1_w8QUOEXVfiw6PiLI4E
# NEXT_PUBLIC_GOOGLE_SHEETS_RANGE=2025_Deals
```

Just uncomment/comment the lines you want to use and restart the server.

### Testing with Different Data Sources

```env
# Development: Auto-load test data
NEXT_PUBLIC_AUTO_LOAD_GOOGLE_SHEETS=true
NEXT_PUBLIC_GOOGLE_SHEETS_RANGE=Test_Sheet

# Production: Manual upload
# NEXT_PUBLIC_AUTO_LOAD_GOOGLE_SHEETS=false
```

## Files Created

- `.env.local` - Your actual configuration (DO NOT COMMIT)
- `.env.example` - Template for others (COMMIT THIS)
- `AUTO_LOAD_SETUP.md` - This documentation
- `GOOGLE_SHEETS_SETUP.md` - Google Sheets API setup guide

## Support

For issues:
1. Check this documentation
2. Verify `.env.local` is configured correctly
3. Check Google Sheets API is enabled
4. Review browser console for errors
5. See [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) for API setup
