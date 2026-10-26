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
  tagline: "",
  date: "Saturday, 29th May 2027",
  time: "",
  venue: {
    name: "",
    address: "",
  },
  hotelNote:
    "As our guests, we are delighted to provide a complimentary two-night hotel stay at the Conrad Bali, from 28th May to 30th May. We look forward to celebrating our special occasion with you!",
  rsvpBy: "28th February 2027",
  dressCode: "",
  story: "Conrad Bali, Jalan Pratama 168, Tanjung Benoa, Bali 80363, Indonesia",
  schedule: [
    { time: "10:00", label: "Tea Ceremony (Family / Wedding party only)" },
    { time: "4:30", label: "Wedding ceremony" },
    { time: "5:30", label: "Pre-Dinner cocktails" },
    { time: "7:00", label: "Dinner reception" },
    { time: "10:00", label: "Partyyy" },
  ],
  faqs: [
    {
      question: "Where can I stay?",
      note: "Room rates at Conrad Bali (on venue)",
      rates: [
        { label: "Deluxe Garden Room", value: "IDR 2,800,000 net per night" },
        { label: "Deluxe Pool View", value: "IDR 3,000,000 net per night" },
        { label: "Deluxe Ocean Front", value: "IDR 3,450,000 net per night" },
        { label: "Conrad Suite", value: "IDR 4,300,000 net per night" },
        { label: "Ocean Front Suite", value: "IDR 5,000,000 net per night" },
      ],
    },
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
    { src: "assets/photos/01.jpg", caption: "The beginning", position: "center 18%" },
    { src: "assets/photos/02.jpg", caption: "A favourite afternoon" },
    { src: "assets/photos/03.jpg", caption: "Travel" },
    { src: "assets/photos/04.jpg", caption: "Home" },
    { src: "assets/photos/05.jpg", caption: "Family" },
    { src: "assets/photos/06.jpg", caption: "The proposal" },
    { src: "assets/photos/07.jpg", caption: "Friends" },
    { src: "assets/photos/08.jpg", caption: "Soon" },
  ],
};
