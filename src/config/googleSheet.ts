// Reads the connected Google Sheet URL from environment config.
// Add the URL to your .env file, e.g.:
// VITE_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/xxxxx/edit
//
// If your project uses Create React App instead of Vite, replace the line
// below with: process.env.REACT_APP_GOOGLE_SHEET_URL
export const GOOGLE_SHEET_URL: string | undefined = import.meta.env.VITE_GOOGLE_SHEET_URL;