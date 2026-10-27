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
 * Already deployed? After pasting this version:
 *   a. Pick "tidySheet" in the function menu at the top and press Run (approve
 *      the permission prompt). This trims the existing RSVPs tab to the six
 *      columns below. The old Guests and Note columns are removed.
 *   b. Deploy → Manage deployments → pencil icon → Version: New version → Deploy.
 *      The URL stays the same.
 *
 * The script creates an "RSVPs" tab and the header row if they are missing.
 * A tab with a layout it does not recognise is renamed "RSVPs (old layout …)"
 * and a fresh "RSVPs" tab is started.
 * Open the Google Sheet in Excel, or File → Download → Microsoft Excel.
 */
const BASE_HEADERS = ["Timestamp", "Attending", "Attendee(s)", "Dietary requirements", "Email / WhatsApp"];
const HEADERS = BASE_HEADERS.concat(["Message / wishes"]);
const LEGACY_HEADERS = ["Timestamp", "Name", "Attending", "Guests", "Diet", "Note", "Email"];

/** Run once from the editor to trim an existing sheet to the current columns. */
function tidySheet() {
  getRsvpSheet_();
}

function doPost(e) {
  const sheet = getRsvpSheet_();
  const data = readRsvp_(e);
  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    attendingLabel_(data.attending),
    data.attendees || data.name || "",
    data.diet || "",
    data.contact || data.email || "",
    data.message || "",
  ]);
  return json_({ ok: true });
}

function doGet() {
  return json_({ ok: true, message: "RSVP endpoint is live." });
}

function getRsvpSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName("RSVPs");
  if (sheet && sheet.getLastRow() > 0 && hasLayout_(sheet, LEGACY_HEADERS)) {
    migrateLegacy_(sheet);
  }
  if (sheet && sheet.getLastRow() > 0 && hasLayout_(sheet, BASE_HEADERS) && !hasLayout_(sheet, HEADERS)) {
    // Existing five-column sheet: add the message column in place.
    sheet.getRange(1, HEADERS.length).setValue(HEADERS[HEADERS.length - 1]);
  }
  if (sheet && sheet.getLastRow() > 0 && !hasLayout_(sheet, HEADERS)) {
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH-mm");
    sheet.setName("RSVPs (old layout " + stamp + ")");
    sheet = null;
  }
  if (!sheet) sheet = spreadsheet.insertSheet("RSVPs");
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function hasLayout_(sheet, headers) {
  const row = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  return headers.every((header, index) => row[index] === header);
}

/** Old columns: Timestamp, Name, Attending, Guests, Diet, Note, Email. */
function migrateLegacy_(sheet) {
  const rows = sheet.getDataRange().getValues().slice(1);
  const converted = rows.map((row) => [
    row[0],
    attendingLabel_(row[2]),
    row[1],
    row[4],
    row[6],
    "",
  ]);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  if (converted.length) {
    sheet.getRange(2, 1, converted.length, HEADERS.length).setValues(converted);
  }
  const extra = sheet.getMaxColumns() - HEADERS.length;
  if (extra > 0) sheet.deleteColumns(HEADERS.length + 1, extra);
  sheet.setFrozenRows(1);
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
    attending: fields.attending,
    attendees: fields.attendees || fields.name,
    diet: fields.diet,
    contact: fields.contact || fields.email,
    message: fields.message,
  };
}

function attendingLabel_(value) {
  const answer = String(value || "").toLowerCase();
  if (answer === "yes" || answer.indexOf("joyfully") === 0) return "Joyfully accept";
  if (answer === "no" || answer.indexOf("regretfully") === 0) return "Regretfully decline";
  return value || "";
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
