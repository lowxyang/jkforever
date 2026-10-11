# Wedding invitation site

A password-gated two-page card: photos scroll on the left, details and RSVP on the right. Host it on GitHub Pages. Replies can land in a Google Sheet you open in Excel.

Guest passwords live in `guest-passwords.md`. A sample code, `forever`, is in that file until you replace it.

## Personalize

Edit `js/config.js`:

- Names, date, venue, story, schedule, dress code
- Photo list (files go in `assets/photos/`)
- Background image (`assets/background/`)
- Music (`assets/music/song.mp3`)
- Guest passwords (`guest-passwords.md`)
- `sheetsEndpoint` once the spreadsheet is connected

Fonts and colours live in `css/styles.css` (`--script`, `--serif`, cream/gold/sage).

### Add a guest password

Open `guest-passwords.md` and add one password per line. Capitalisation does not matter. This is a courtesy lock, not real security — anyone who can view the GitHub repo can read the list.

## RSVPs in Excel

Run the site with the included server so each reply is added to `RSVPs.xlsx` in this folder:

```bash
python3 -m pip install -r requirements.txt
python3 server.py
```

Open `RSVPs.xlsx` in Excel. Close it before someone submits, or the save can fail while the file is open.

GitHub Pages cannot write that file. For the public site, create a Google Sheet (tab `RSVPs`, headers Timestamp, Name, Attending, Guests, Diet, Note, Email), paste `sheets/Code.gs` into **Extensions → Apps Script**, deploy it as a web app (execute as you, access: anyone), and put that URL in `sheetsEndpoint`. Download the Google Sheet as Excel any time (**File → Download → Microsoft Excel**).

## Preview locally

From this folder:

```bash
python3 server.py
```

Then visit http://localhost:8080

## Host on GitHub Pages

1. Create a GitHub repository and push this project
2. Settings → Pages → Deploy from branch `main` / `/` (root)
3. Share `https://<you>.github.io/<repo>/` plus the passcode

Drop photos and an audio file before you go live. Autoplay starts after the passcode is accepted (browsers block music until then).
