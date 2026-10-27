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
  rsvpBy: "1st March 2027",
  dressCode: "",
  story: "Conrad Bali, Jalan Pratama 168, Tanjung Benoa, Bali 80363, Indonesia",
  schedule: [
    {
      time: "10:00 a.m.",
      label: "Tea Ceremony (Family / Wedding party only)",
      image: "assets/decor/tea-ceremony.png",
      feature: true,
    },
    {
      time: "4:30 p.m.",
      label: "Wedding ceremony",
      image: "assets/decor/wedding-arch.png",
    },
    {
      time: "5:30 p.m.",
      label: "Pre-Dinner cocktails",
      image: "assets/decor/cocktail.png",
    },
    {
      time: "7:00 p.m.",
      label: "Dinner reception",
      image: "assets/decor/dinner.png",
    },
    {
      time: "10:00 p.m.",
      label: "Partyyy",
      image: "assets/decor/party.png",
    },
  ],
  closing: [
    "Thank you for all the love and support you've shown us over the years. We feel so lucky to share this special moment with the people who mean the most to us.",
    "We can't wait to see you on our wedding day!",
  ],
  registry: {
    lines: [
      "Your love and presence on our wedding day are the greatest gifts we could ever receive.",
      "If you wish to give us a little something extra, we have set up an online wishing well via bank transfer.",
    ],
    // Text shown when a currency is tapped on the Wishing Well page.
    currencies: [
      {
        code: "AUD",
        lines: [
          "Name: Khine Tin Zar Thu",
          "BSB code: 774-001",
          "Account number: 242406705",
        ],
      },
      {
        code: "GBP",
        lines: [
          "Name: Khine Tin Zar Thu",
          "Account number: 67587347",
          "Sort code: 23-14-70",
        ],
      },
      { code: "MYR", lines: [] },
    ],
  },
  faqs: [
    {
      question: "Dress code & footwear",
      lines: [
        "Dress up as you wish - We have no strict dress code!",
        "However, we recommend choosing footwear suitable for a beachside wedding ceremony",
      ],
    },
    {
      question: "Visa & travel",
      lines: [
        "Please note Indonesian Visa and travel requirements for your specific passport, we don't want you being stopped at the gate!",
      ],
    },
    {
      question: "If you wish to extend your stay at Conrad Bali",
      note: "Room rates at Conrad Bali (on venue)",
      rates: [
        { label: "Deluxe Garden Room", value: "IDR 2,800,000 net per night" },
        { label: "Deluxe Pool View", value: "IDR 3,000,000 net per night" },
        { label: "Deluxe Ocean Front", value: "IDR 3,450,000 net per night" },
        { label: "Conrad Suite", value: "IDR 4,300,000 net per night" },
        { label: "Ocean Front Suite", value: "IDR 5,000,000 net per night" },
      ],
      footnote:
        "*Room rates may change in 2027. Please get in touch directly with Conrad Bali at +6281138002476",
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
    { src: "assets/photos/04.jpg", caption: "", position: "center 55%" },
    { src: "assets/photos/01.jpg", caption: "", position: "center 18%" },
    { src: "assets/photos/02.jpg", caption: "" },
    { src: "assets/photos/03.jpg", caption: "", position: "center 40%" },
    { src: "assets/photos/05.jpg", caption: "", position: "center 78%" },
    { src: "assets/photos/06.jpg", caption: "", position: "center 55%" },
    { src: "assets/photos/07.jpg", caption: "", position: "center 55%" },
  ],
};
