"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileSpreadsheet, Link as LinkIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { fetchGoogleSheetData, validateGoogleSheetConnection } from "@/lib/google-sheets"

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
  'Enquiry Leads': string | null;
  'Opportunity': string | null;
  '1. Application': string | null;
  '2. Assessment': string | null;
  '3. Approval': string | null;
  '4. Loan Document': string | null;
  '5. Settlement Queue': string | null;
  '6. Settled': string | null;
  '2025 Settlement': string | null;
  '2024 Settlement': string | null;
  'Lost date': string | null;
  'lost reason': string | null;
  'which process (if lost)': string | null;
  'From Rednote?': string;
  'From LifeX?': string;
}

interface GoogleSheetsLoaderProps {
  onDataLoad: (deals: Deal[]) => void;
  onError: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function GoogleSheetsLoader({ onDataLoad, onError, isLoading, setIsLoading }: GoogleSheetsLoaderProps) {
  const [apiKey, setApiKey] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [sheetRange, setSheetRange] = useState("Sheet1");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLoad = async () => {
    if (!apiKey.trim()) {
      setLocalError("Please enter a Google API Key");
      onError("Please enter a Google API Key");
      return;
    }
    if (!sheetId.trim()) {
      setLocalError("Please enter a Google Sheets ID or URL");
      onError("Please enter a Google Sheets ID or URL");
      return;
    }

    setIsLoading(true);
    setLocalError(null);
    onError("");

    try {
      // First validate the connection
      const validation = await validateGoogleSheetConnection(sheetId, apiKey);

      if (!validation.valid) {
        throw new Error(validation.error || "Failed to connect to Google Sheets");
      }

      // Fetch the data
      const dealsData = await fetchGoogleSheetData(sheetId, apiKey, sheetRange);

      if (dealsData.length === 0) {
        throw new Error("No valid deals found in the sheet");
      }

      onDataLoad(dealsData);
      setLocalError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load data from Google Sheets";
      setLocalError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet to-hot-pink rounded-full mb-4">
        <FileSpreadsheet className="h-8 w-8 text-white" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-violet">Load from Google Sheets</h2>
        <p className="text-violet/70">
          Connect to your Google Sheet to automatically load data
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-violet font-medium">
            Google API Key
          </Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your Google API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isLoading}
            className="border-violet/30 focus:border-violet"
          />
          <p className="text-xs text-violet/60">
            Create an API key in Google Cloud Console with Sheets API enabled
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sheetId" className="text-violet font-medium">
            Google Sheet ID or URL
          </Label>
          <Input
            id="sheetId"
            type="text"
            placeholder="Paste Sheet URL or ID"
            value={sheetId}
            onChange={(e) => setSheetId(e.target.value)}
            disabled={isLoading}
            className="border-violet/30 focus:border-violet"
          />
          <p className="text-xs text-violet/60">
            The sheet must be publicly accessible or shared with your API key
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sheetRange" className="text-violet font-medium">
            Sheet Name or Range (Optional)
          </Label>
          <Input
            id="sheetRange"
            type="text"
            placeholder="Sheet1"
            value={sheetRange}
            onChange={(e) => setSheetRange(e.target.value)}
            disabled={isLoading}
            className="border-violet/30 focus:border-violet"
          />
          <p className="text-xs text-violet/60">
            Leave as "Sheet1" or specify a range like "Sheet1!A1:Z1000"
          </p>
        </div>

        <Button
          onClick={handleLoad}
          disabled={isLoading || !apiKey.trim() || !sheetId.trim()}
          className="w-full bg-gradient-to-r from-violet to-hot-pink hover:from-violet/90 hover:to-hot-pink/90 text-white font-semibold py-6"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Loading...
            </>
          ) : (
            <>
              <LinkIcon className="h-4 w-4 mr-2" />
              Load Data from Google Sheets
            </>
          )}
        </Button>
      </div>

      {localError && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{localError}</AlertDescription>
        </Alert>
      )}

      <div className="bg-violet/5 rounded-lg p-4 text-left">
        <h3 className="font-semibold text-violet mb-2 flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Setup Instructions
        </h3>
        <ol className="text-sm text-violet/70 space-y-2 list-decimal list-inside">
          <li>Create a Google Cloud project and enable Google Sheets API</li>
          <li>Create an API key in Credentials section</li>
          <li>Make your Google Sheet publicly viewable or share it</li>
          <li>Paste the API key and Sheet URL above</li>
          <li>Ensure the first row contains column headers matching the expected format</li>
        </ol>
      </div>
    </div>
  );
}
