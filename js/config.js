/**
 * Personalize the invitation here.
 * Photos: drop files into assets/photos/ and list them below.
 * Music: drop an mp3 into assets/music/ and set musicSrc.
 * Passwords: add one password per line in guest-passwords.md. Capitalisation does not matter.
 *
 * RSVPs: `python3 server.py` writes each reply to RSVPs.xlsx.
 * For a public site, paste a Google Apps Script web app URL into sheetsEndpoint.
 * (See README.md — responses land in a Google Sheet you can open in Excel.)
 */
window.WEDDING = {
  names: {
    one: "Khine",
    two: "Xian Yang",
    nickname: "Josh",
    and: "&",
  },
  tagline: "together with their families",
  date: "Saturday, 12 June 2027",
  time: "4:00 in the afternoon",
  venue: {
    name: "The Garden Estate",
    address: "12 Willow Lane, your city",
  },
  rsvpBy: "1 May 2027",
  dressCode: "Garden formal",
  story:
    "A few words about how you met, why this place matters, or what the day will feel like. Replace this paragraph with your own.",
  schedule: [
    { time: "3:30 PM", label: "Guests arrive" },
    { time: "4:00 PM", label: "Ceremony" },
    { time: "5:00 PM", label: "Drinks & photographs" },
    { time: "7:00 PM", label: "Dinner & dancing" },
  ],
  /** SHA-256 of "forever" — change before sharing the real link. */
  passcodeHash:
    "2070f725ff1c765b73c498de52bc419377979691f6100de3ed99794aeb40d988",
  /** Replies from the live site are appended to the Wedding RSVPs Google Sheet. */
  sheetsEndpoint:
    "https://script.google.com/macros/s/AKfycbz1VtbDwMWhD7wE88x8ktB5PzqZQ5a65op-OtWDbgJUVUMklTiyeEXIQ_T-AriFxz4/exec",
  musicSrc: "assets/music/yes-i-will.mp3",
  backgroundImage: "assets/background/silk.jpg",
  fonts: {
    script: "Great Vibes",
    body: "Cormorant Garamond",
  },
  photos: [
    { src: "assets/photos/01.jpg", caption: "The beginning" },
    { src: "assets/photos/02.jpg", caption: "A favourite afternoon" },
    { src: "assets/photos/03.jpg", caption: "Travel" },
    { src: "assets/photos/04.jpg", caption: "Home" },
    { src: "assets/photos/05.jpg", caption: "Family" },
    { src: "assets/photos/06.jpg", caption: "The proposal" },
    { src: "assets/photos/07.jpg", caption: "Friends" },
    { src: "assets/photos/08.jpg", caption: "Soon" },
  ],
};
