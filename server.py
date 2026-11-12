#!/usr/bin/env python3
"""Serve the invitation and append each RSVP to RSVPs.xlsx."""

from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json

from openpyxl import Workbook, load_workbook
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parent
WORKBOOK = ROOT / "RSVPs.xlsx"
BASE_HEADERS = ["Timestamp", "Attending", "Attendee(s)", "Dietary requirements", "Email / WhatsApp"]
HEADERS = BASE_HEADERS + ["Message / wishes", "Song suggestion"]
WIDTHS = [22, 22, 36, 32, 36, 48, 36]
ACCEPT_TAB = "Joyfully accept"
DECLINE_TAB = "Regretfully decline"


class InvitationHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        if self.path.split("?", 1)[0] != "/api/rsvp":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", "0") or 0)
        raw = self.rfile.read(length)
        try:
            data = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.respond(400, {"ok": False, "error": "Invalid JSON"})
            return
        if not isinstance(data, dict):
            self.respond(400, {"ok": False, "error": "Invalid RSVP"})
            return

        attendees = str(data.get("attendees") or data.get("name") or "").strip()
        attending = str(data.get("attending", "")).strip().lower()
        if not attendees or attending not in {"yes", "no"}:
            self.respond(400, {"ok": False, "error": "Attendee name(s) and attendance are required."})
            return

        row = [
            str(data.get("submittedAt") or datetime.now(timezone.utc).isoformat()),
            "Joyfully accept" if attending == "yes" else "Regretfully decline",
            attendees,
            str(data.get("diet", "")).strip(),
            str(data.get("contact") or data.get("email") or "").strip(),
            str(data.get("message", "")).strip(),
            str(data.get("song", "")).strip(),
        ]
        try:
            append_rsvp(row)
        except OSError:
            self.respond(500, {"ok": False, "error": "Could not write RSVPs.xlsx. Close the file if it is open in Excel."})
            return
        self.respond(200, {"ok": True})

    def respond(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def sheet_matches(sheet):
    """True when this sheet already uses the current columns, adding any missing ones."""
    if sheet.cell(1, 1).value is None:
        return False
    first = [sheet.cell(1, index).value for index in range(1, len(BASE_HEADERS) + 1)]
    if first != BASE_HEADERS:
        return False
    for index, header in enumerate(HEADERS, start=1):
        current = sheet.cell(1, index).value
        if current == header:
            continue
        if current not in (None, ""):
            return False
        sheet.cell(1, index).value = header
        sheet.column_dimensions[get_column_letter(index)].width = WIDTHS[index - 1]
    return True


def style_sheet(sheet):
    if sheet.cell(1, 1).value in (None, ""):
        for index, header in enumerate(HEADERS, start=1):
            sheet.cell(1, index).value = header
    sheet.freeze_panes = "A2"
    for index, width in enumerate(WIDTHS, start=1):
        sheet.column_dimensions[get_column_letter(index)].width = width


def ensure_tab(workbook, title):
    sheet = workbook[title] if title in workbook.sheetnames else workbook.create_sheet(title)
    style_sheet(sheet)
    return sheet


def split_combined(workbook):
    """Move a single RSVPs tab onto the accept and decline tabs."""
    if "RSVPs" not in workbook.sheetnames:
        return
    sheet = workbook["RSVPs"]
    if not sheet_matches(sheet):
        stamp = datetime.now().strftime("%Y-%m-%d %H-%M")
        sheet.title = f"RSVPs (old layout {stamp})"[:31]
        return
    accept, decline, other = [], [], []
    for row in sheet.iter_rows(min_row=2, values_only=True):
        values = [("" if value is None else value) for value in row[: len(HEADERS)]]
        values += [""] * (len(HEADERS) - len(values))
        if not any(values):
            continue
        label = values[1]
        if label == ACCEPT_TAB:
            accept.append(values)
        elif label == DECLINE_TAB:
            decline.append(values)
        else:
            other.append(values)
    for title, rows in ((ACCEPT_TAB, accept), (DECLINE_TAB, decline)):
        target = ensure_tab(workbook, title)
        for values in rows:
            target.append(values)
    if other:
        sheet.delete_rows(2, sheet.max_row)
        for values in other:
            sheet.append(values)
    elif len(workbook.sheetnames) > 1:
        workbook.remove(sheet)
    else:
        sheet.delete_rows(2, max(sheet.max_row - 1, 1))


def append_rsvp(row):
    if WORKBOOK.exists():
        workbook = load_workbook(WORKBOOK)
    else:
        workbook = Workbook()
        workbook.active.title = ACCEPT_TAB
    split_combined(workbook)
    ensure_tab(workbook, ACCEPT_TAB)
    ensure_tab(workbook, DECLINE_TAB)
    title = DECLINE_TAB if row[1] == DECLINE_TAB else ACCEPT_TAB
    workbook[title].append(row)
    # Drop the empty default sheet left behind when a new workbook is created.
    if "Sheet" in workbook.sheetnames and workbook["Sheet"].cell(1, 1).value is None and len(workbook.sheetnames) > 1:
        workbook.remove(workbook["Sheet"])
    workbook.save(WORKBOOK)


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 8080), InvitationHandler)
    print("Invitation at http://127.0.0.1:8080")
    print(f"RSVPs will be added to {WORKBOOK}")
    server.serve_forever()


if __name__ == "__main__":
    main()
