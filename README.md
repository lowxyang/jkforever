# Wedding invitation site

A password-gated two-page card: photos scroll on the left, details and RSVP on the right. Host it on GitHub Pages. Replies can land in a Google Sheet you open in Excel.

Default passcode while you build: **forever**

## Personalize

Edit `js/config.js`:

- Names, date, venue, story, schedule, dress code
- Photo list (files go in `assets/photos/`)
- Background image (`assets/background/`)
- Music (`assets/music/song.mp3`)
- Passcode hash
- `sheetsEndpoint` once the spreadsheet is connected

Fonts and colours live in `css/styles.css` (`--script`, `--serif`, cream/gold/sage).

### Change the passcode

```bash
echo -n "your-new-code" | shasum -a 256
```

Paste the hex string into `passcodeHash`. This is a courtesy lock, not real security — anyone who can view the GitHub repo can bypass it.

## Connect RSVPs to a spreadsheet

GitHub Pages is static, so the form cannot write an `.xlsx` file on GitHub. The usual path:

1. Create a Google Sheet with a tab `RSVPs` and header row: Timestamp, Name, Attending, Guests, Diet, Note, Email
2. Paste `sheets/Code.gs` into **Extensions → Apps Script**
3. Deploy as a **web app** (execute as you, access: anyone)
4. Put the web app URL in `sheetsEndpoint`

Until that URL is set, RSVPs are stored only in the guest’s browser so you can still preview the form.

You can download the Google Sheet as Excel whenever you like (**File → Download → Microsoft Excel**).

## Preview locally

Open `index.html` in a browser, or from this folder:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080

## Host on GitHub Pages

1. Create a GitHub repository and push this project
2. Settings → Pages → Deploy from branch `main` / `/` (root)
3. Share `https://<you>.github.io/<repo>/` plus the passcode

Drop photos and an audio file before you go live. Autoplay starts after the passcode is accepted (browsers block music until then).
