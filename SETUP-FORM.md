# Early Access Form Setup

The form on the EncodeIQ website submits to a Google Apps Script web app that logs submissions to a Google Sheet.

## Setup (2 minutes)

### 1. Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Rename it to **"EncodeIQ Early Access"**
3. In row 1, add these headers: `Timestamp` | `Email` | `Source`
4. Copy the **spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

### 2. Deploy the Apps Script

1. Go to [Google Apps Script](https://script.google.com) → **New project**
2. Replace the default code with the contents of `apps-script.js` (in this repo)
3. On **line 2**, replace `YOUR_SPREADSHEET_ID` with your actual spreadsheet ID
4. Click **Deploy → New deployment**
5. Type = **Web app**
6. Execute as = **Me**
7. Who has access = **Anyone**
8. Click **Deploy** and authorize when prompted
9. Copy the **Web app URL**

### 3. Configure the Website

1. Open `main.js`
2. On **line 2**, replace the placeholder URL with your Apps Script web app URL:
   ```
   const FORM_ENDPOINT = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
   ```
3. Commit and push

### Testing

Submit a test email on the site. It should appear in your Google Sheet within 1-2 seconds.
