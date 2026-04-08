// EncodeIQ Early Access - Google Apps Script
const SHEET_ID = '1jsxuegT6E7c2Gpj7Xm9pkt7nEY_qo2BNu3MZvcrtJT4';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const email = data.email;

    if (!email || !email.includes('@')) {
      return jsonResponse({ success: false, error: 'Invalid email' }, 400);
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

    // Check for duplicate
    const emails = sheet.getRange('B:B').getValues().flat();
    if (emails.includes(email)) {
      return jsonResponse({ success: true, message: 'Already registered' });
    }

    // Append new row
    sheet.appendRow([
      new Date().toISOString(),
      email,
      data.source || 'website'
    ]);

    return jsonResponse({ success: true, message: 'Registered' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message }, 500);
  }
}

function doGet(e) {
  return jsonResponse({ status: 'ok', service: 'EncodeIQ Early Access' });
}

function jsonResponse(data, code) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
