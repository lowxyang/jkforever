/**
 * Google Apps Script — paste into Extensions → Apps Script on your RSVP sheet.
 *
 * 1. Create a Google Sheet named something like "Wedding RSVPs".
 * 2. Put headers in row 1:
 *    Timestamp | Name | Attending | Guests | Diet | Note | Email
 * 3. Extensions → Apps Script, paste this file, Save.
 * 4. Deploy → New deployment → Type: Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 5. Copy the web app URL into js/config.js → sheetsEndpoint
 *
 * Open the Google Sheet in Excel via File → Download → Microsoft Excel,
 * or File → Share → Excel if you use Microsoft 365.
 */
function doPost(e) {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("RSVPs") ||
    SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.name || "",
    data.attending || "",
    data.guests || "",
    data.diet || "",
    data.note || "",
    data.email || "",
  ]);
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput("RSVP endpoint is live.");
}
