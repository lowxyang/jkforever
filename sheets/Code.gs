/**
 * Google Apps Script — paste into Extensions → Apps Script on your RSVP sheet.
 *
 * 1. Create a Google Sheet (sheets.new) named "Wedding RSVPs".
 * 2. Extensions → Apps Script. Replace the sample code with this file. Save.
 * 3. Deploy → New deployment → Type: Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 4. Authorize the script, then copy the web app URL (it ends in /exec)
 *    into js/config.js → sheetsEndpoint.
 *
 * The script creates an "RSVPs" tab and the header row if they are missing.
 * Open the Google Sheet in Excel, or File → Download → Microsoft Excel.
 */
function doPost(e) {
  const sheet = getRsvpSheet_();
  const data = readRsvp_(e);
  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.name || "",
    attendingLabel_(data.attending),
    data.guests || "",
    data.diet || "",
    data.note || "",
    data.email || "",
  ]);
  return json_({ ok: true });
}

function doGet() {
  return json_({ ok: true, message: "RSVP endpoint is live." });
}

function getRsvpSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName("RSVPs");
  if (!sheet) sheet = spreadsheet.insertSheet("RSVPs");
  if (sheet.getRange(1, 1).getValue() !== "Timestamp") {
    sheet.insertRowBefore(1);
    sheet
      .getRange(1, 1, 1, 7)
      .setValues([["Timestamp", "Name", "Attending", "Guests", "Diet", "Note", "Email"]]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readRsvp_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (error) {
      // Fall through to form fields.
    }
  }
  const fields = (e && e.parameter) || {};
  return {
    submittedAt: fields.submittedAt,
    name: fields.name,
    attending: fields.attending,
    guests: fields.guests,
    diet: fields.diet,
    note: fields.note,
    email: fields.email,
  };
}

function attendingLabel_(value) {
  const answer = String(value || "").toLowerCase();
  if (answer === "yes") return "Joyfully accepts";
  if (answer === "no") return "Regretfully declines";
  return value || "";
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
