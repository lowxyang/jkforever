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
 *      the permission prompt). This moves existing replies onto two tabs,
 *      "Joyfully accept" and "Regretfully decline".
 *   b. Deploy → Manage deployments → pencil icon → Version: New version → Deploy.
 *      The URL stays the same.
 *
 * New replies are appended to the matching tab. A combined "RSVPs" tab is
 * split the next time tidySheet or a new reply runs. A tab whose columns are
 * not recognised is renamed "RSVPs (old layout …)" and left untouched.
 * Open the Google Sheet in Excel, or File → Download → Microsoft Excel.
 */
const BASE_HEADERS = ["Timestamp", "Attending", "Attendee(s)", "Dietary requirements", "Email / WhatsApp"];
const HEADERS = BASE_HEADERS.concat(["Message / wishes", "Song suggestion"]);
const LEGACY_HEADERS = ["Timestamp", "Name", "Attending", "Guests", "Diet", "Note", "Email"];
const ACCEPT_TAB = "Joyfully accept";
const DECLINE_TAB = "Regretfully decline";

/** Run once from the editor to split an existing combined RSVPs tab. */
function tidySheet() {
  splitCombinedSheet_();
  ensureTab_(ACCEPT_TAB);
  ensureTab_(DECLINE_TAB);
}

function doPost(e) {
  const data = readRsvp_(e);
  const label = attendingLabel_(data.attending);
  splitCombinedSheet_();
  const sheet = ensureTab_(label === DECLINE_TAB ? DECLINE_TAB : ACCEPT_TAB);
  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    label,
    data.attendees || data.name || "",
    data.diet || "",
    data.contact || data.email || "",
    data.message || "",
    data.song || "",
  ]);
  return json_({ ok: true });
}

function doGet() {
  return json_({ ok: true, message: "RSVP endpoint is live." });
}

function ensureTab_(name) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  } else {
    extendHeaders_(sheet);
  }
  return sheet;
}

/** Move rows on a combined RSVPs tab onto the accept and decline tabs. */
function splitCombinedSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName("RSVPs");
  if (!sheet || sheet.getLastRow() === 0) return;
  if (hasLayout_(sheet, LEGACY_HEADERS)) migrateLegacy_(sheet);
  if (!(extendHeaders_(sheet) || hasLayout_(sheet, HEADERS))) {
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH-mm");
    sheet.setName("RSVPs (old layout " + stamp + ")");
    return;
  }
  const rows = sheet
    .getDataRange()
    .getValues()
    .slice(1)
    .filter((row) => row.join("") !== "");
  const accept = [];
  const decline = [];
  const other = [];
  rows.forEach((row) => {
    const label = attendingLabel_(row[1]);
    const normalized = row.slice(0, HEADERS.length);
    while (normalized.length < HEADERS.length) normalized.push("");
    normalized[1] = label || row[1];
    if (label === ACCEPT_TAB) accept.push(normalized);
    else if (label === DECLINE_TAB) decline.push(normalized);
    else other.push(normalized);
  });
  appendRows_(ensureTab_(ACCEPT_TAB), accept);
  appendRows_(ensureTab_(DECLINE_TAB), decline);
  if (other.length) {
    sheet.clearContents();
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(2, 1, other.length, HEADERS.length).setValues(other);
    sheet.setFrozenRows(1);
  } else if (spreadsheet.getSheets().length > 1) {
    spreadsheet.deleteSheet(sheet);
  } else {
    sheet.clearContents();
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function appendRows_(sheet, rows) {
  if (!rows.length) return;
  const start = Math.max(sheet.getLastRow(), 1) + 1;
  sheet.getRange(start, 1, rows.length, HEADERS.length).setValues(rows);
}

/** Add any missing newer columns when the existing headers are a prefix of HEADERS. */
function extendHeaders_(sheet) {
  const width = Math.max(sheet.getLastColumn(), HEADERS.length);
  const row = sheet.getRange(1, 1, 1, width).getValues()[0];
  let filled = 0;
  while (filled < row.length && row[filled] !== "" && row[filled] !== null) filled++;
  if (filled > HEADERS.length) return false;
  for (let index = 0; index < filled; index++) {
    if (row[index] !== HEADERS[index]) return false;
  }
  if (filled < HEADERS.length) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return true;
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
    song: fields.song,
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
