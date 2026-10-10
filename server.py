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
HEADERS = ["Timestamp", "Name", "Attending", "Guests", "Diet", "Note", "Email"]
WIDTHS = [22, 28, 22, 12, 32, 40, 32]


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

        name = str(data.get("name", "")).strip()
        attending = str(data.get("attending", "")).strip().lower()
        if not name or attending not in {"yes", "no"}:
            self.respond(400, {"ok": False, "error": "Name and attendance are required."})
            return

        guests = str(data.get("guests", "")).strip()
        try:
            guests_value = int(guests) if guests else ""
        except ValueError:
            guests_value = guests

        row = [
            str(data.get("submittedAt") or datetime.now(timezone.utc).isoformat()),
            name,
            "Joyfully accepts" if attending == "yes" else "Regretfully declines",
            guests_value,
            str(data.get("diet", "")).strip(),
            str(data.get("note", "")).strip(),
            str(data.get("email", "")).strip(),
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


def append_rsvp(row):
    if WORKBOOK.exists():
        workbook = load_workbook(WORKBOOK)
        sheet = workbook.active
    else:
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = "RSVPs"
        sheet.append(HEADERS)
        sheet.freeze_panes = "A2"
        for index, width in enumerate(WIDTHS, start=1):
            sheet.column_dimensions[get_column_letter(index)].width = width
    if sheet["A1"].value != "Timestamp":
        sheet.insert_rows(1)
        for index, header in enumerate(HEADERS, start=1):
            sheet.cell(1, index, header)
    sheet.append(row)
    workbook.save(WORKBOOK)


def main():
    server = ThreadingHTTPServer(("127.0.0.1", 8080), InvitationHandler)
    print("Invitation at http://127.0.0.1:8080")
    print(f"RSVPs will be added to {WORKBOOK}")
    server.serve_forever()


if __name__ == "__main__":
    main()
