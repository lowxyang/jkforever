(() => {
  const cfg = window.WEDDING;
  const sessionKey = "wedding-unlocked";

  const gate = document.getElementById("gate");
  const invitation = document.getElementById("invitation");
  const gateForm = document.getElementById("gate-form");
  const gateError = document.getElementById("gate-error");
  const reel = document.getElementById("reel");
  const music = document.getElementById("music");
  const mute = document.getElementById("mute");
  const rsvpForm = document.getElementById("rsvp-form");
  const rsvpStatus = document.getElementById("rsvp-status");

  function coupleLine() {
    return `${cfg.names.one} <span class="gate-and">${cfg.names.and}</span> ${cfg.names.two}`;
  }

  let guests = [];

  function parseGuestList(text) {
    return text.split(/\r?\n/).flatMap((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("```")) return [];
      const bar = trimmed.lastIndexOf("|");
      if (bar === -1) return [];
      const name = trimmed.slice(0, bar).trim();
      const password = trimmed.slice(bar + 1).trim();
      if (!name || !password) return [];
      return [{ name, password }];
    });
  }

  function guestListUrl() {
    const host = location.hostname;
    if (host === "localhost" || host === "127.0.0.1") return "guest-passwords.md";
    return "https://raw.githubusercontent.com/lowxyang/jkforever/version-2/guest-passwords.md";
  }

  async function loadGuests() {
    const response = await fetch(`${guestListUrl()}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Guest list unavailable");
    guests = parseGuestList(await response.text());
  }

  function fillCopy() {
    document.title = `${cfg.names.one} & ${cfg.names.two}`;
    document.getElementById("gate-names").innerHTML = coupleLine();
    document.getElementById("invite-names").innerHTML = coupleLine();
    document.getElementById("tagline").textContent = cfg.tagline;
    document.getElementById("when").textContent = `${cfg.date} · ${cfg.time}`;
    document.getElementById("where").textContent =
      `${cfg.venue.name}, ${cfg.venue.address}`;
    document.getElementById("story").textContent = cfg.story;
    document.getElementById("dress").textContent = `Dress: ${cfg.dressCode}`;
    document.getElementById("rsvp-by").textContent =
      `Please reply by ${cfg.rsvpBy}.`;

    const schedule = document.getElementById("schedule");
    schedule.innerHTML = cfg.schedule
      .map(
        (item) =>
          `<li><time>${item.time}</time><span>${item.label}</span></li>`
      )
      .join("");

    if (cfg.backgroundImage) {
      document.documentElement.style.backgroundImage = `url("${cfg.backgroundImage}")`;
    }
  }

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const preview = document.getElementById("preview");
  const previewFrame = document.getElementById("preview-frame");
  const previewImg = document.getElementById("preview-img");
  const previewCaption = document.getElementById("preview-caption");
  let lightboxIndex = 0;
  let activeIndex = 0;
  let pointerStartX = 0;

  function renderGallery() {
    reel.innerHTML = "";
    cfg.photos.forEach((photo, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "shot is-placeholder";
      button.setAttribute("aria-label", photo.caption || `Photo ${index + 1}`);
      const img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.addEventListener("load", () => button.classList.remove("is-placeholder"));
      img.addEventListener("error", () => img.remove());
      img.src = photo.src;
      const caption = document.createElement("span");
      caption.className = "shot-caption";
      caption.textContent = photo.caption || "Add a photo";
      button.append(img, caption);
      button.addEventListener("pointerdown", (event) => {
        pointerStartX = event.clientX;
      });
      button.addEventListener("click", (event) => {
        if (Math.abs(event.clientX - pointerStartX) > 8) return;
        selectPhoto(index, true);
      });
      reel.append(button);
    });
    if (cfg.photos.length) selectPhoto(0, false);
  }

  function showPreview(index) {
    const photo = cfg.photos[index];
    if (!photo) return;
    activeIndex = index;
    previewFrame.classList.add("is-placeholder");
    previewImg.style.visibility = "";
    previewImg.alt = photo.caption || `Photo ${index + 1}`;
    previewImg.src = photo.src;
    previewCaption.textContent = photo.caption || "";
    preview.setAttribute("aria-label", `Enlarge ${photo.caption || "photo"}`);
    [...reel.children].forEach((shot, shotIndex) => {
      shot.classList.toggle("is-active", shotIndex === index);
      shot.setAttribute("aria-current", shotIndex === index ? "true" : "false");
    });
  }

  function centerShot(index) {
    const shot = reel.children[index];
    if (!shot) return;
    const left = shot.offsetLeft - (reel.clientWidth - shot.offsetWidth) / 2;
    reel.scrollTo({ left, behavior: "smooth" });
  }

  function selectPhoto(index, shouldCenter) {
    showPreview(index);
    if (shouldCenter) centerShot(index);
  }

  function scrollGallery(direction) {
    if (!cfg.photos.length) return;
    const next = Math.min(cfg.photos.length - 1, Math.max(0, activeIndex + direction));
    selectPhoto(next, true);
  }

  previewImg.addEventListener("load", () => {
    previewFrame.classList.remove("is-placeholder");
    previewImg.style.visibility = "";
  });
  previewImg.addEventListener("error", () => {
    previewImg.style.visibility = "hidden";
  });
  preview.addEventListener("click", () => openLightbox(activeIndex));

  const photoFallback =
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
        <defs>
          <pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)">
            <rect width="16" height="16" fill="#e8dccb"/>
            <rect width="1" height="16" fill="#d9cbb8"/>
          </pattern>
        </defs>
        <rect width="900" height="1200" fill="url(#p)"/>
      </svg>`
    );

  function openLightbox(index) {
    const photo = cfg.photos[index];
    if (!photo) return;
    lightboxIndex = index;
    lightboxImg.alt = photo.caption || `Photo ${index + 1}`;
    lightboxImg.src = photo.src;
    lightboxCaption.textContent = photo.caption || "";
    lightbox.hidden = false;
    document.getElementById("lightbox-close").focus();
  }

  lightboxImg.addEventListener("error", () => {
    if (lightboxImg.dataset.fallback === "1") return;
    lightboxImg.dataset.fallback = "1";
    lightboxImg.src = photoFallback;
  });
  lightboxImg.addEventListener("load", () => {
    if (!lightboxImg.src.startsWith("data:")) lightboxImg.dataset.fallback = "";
  });

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
  }

  function stepLightbox(direction) {
    const count = cfg.photos.length;
    if (!count) return;
    openLightbox((lightboxIndex + direction + count) % count);
  }

  reel.addEventListener(
    "wheel",
    (event) => {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      reel.scrollLeft += delta;
    },
    { passive: false }
  );

  reel.addEventListener("scroll", () => {
    const center = reel.scrollLeft + reel.clientWidth / 2;
    let nearest = 0;
    let nearestDistance = Infinity;
    [...reel.children].forEach((shot, index) => {
      const shotCenter = shot.offsetLeft + shot.offsetWidth / 2;
      const distance = Math.abs(shotCenter - center);
      if (distance < nearestDistance) {
        nearest = index;
        nearestDistance = distance;
      }
    });
    if (nearest !== activeIndex) showPreview(nearest);
  });

  document.getElementById("gallery-prev").addEventListener("click", () => scrollGallery(-1));
  document.getElementById("gallery-next").addEventListener("click", () => scrollGallery(1));
  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  document.getElementById("lightbox-prev").addEventListener("click", () => stepLightbox(-1));
  document.getElementById("lightbox-next").addEventListener("click", () => stepLightbox(1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") stepLightbox(1);
    if (event.key === "ArrowLeft") stepLightbox(-1);
  });

  function startMusic() {
    if (!cfg.musicSrc) return;
    music.src = cfg.musicSrc;
    mute.classList.add("is-visible");
    music.play().catch(() => {
      mute.textContent = "Tap for music";
    });
  }

  function openInvitation(guestName) {
    sessionStorage.setItem(sessionKey, "1");
    if (guestName) sessionStorage.setItem("wedding-guest", guestName);
    const nameInput = rsvpForm.elements.name;
    const savedName = guestName || sessionStorage.getItem("wedding-guest");
    if (nameInput && savedName && !nameInput.value) nameInput.value = savedName;
    gate.classList.add("is-open");
    invitation.hidden = false;
    gate.setAttribute("aria-hidden", "true");
    startMusic();
  }

  mute.addEventListener("click", () => {
    music.muted = !music.muted;
    mute.textContent = music.muted ? "Sound off" : "Sound on";
    mute.setAttribute("aria-pressed", String(!music.muted));
    if (music.paused) music.play().catch(() => {});
  });

  gateForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    gateError.textContent = "";
    const entered = document.getElementById("passcode").value.trim();
    try {
      if (!guests.length) await loadGuests();
    } catch (error) {
      gateError.textContent = "The guest list could not be loaded. Try again.";
      return;
    }
    const match = guests.find((guest) => guest.password === entered);
    if (match) {
      openInvitation(match.name);
    } else {
      gateError.textContent = "That code doesn’t match. Try again.";
    }
  });

  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    rsvpStatus.textContent = "Sending…";
    const data = Object.fromEntries(new FormData(rsvpForm));
    data.submittedAt = new Date().toISOString();

    const endpoint = cfg.sheetsEndpoint || "/api/rsvp";
    const localSheet = endpoint.startsWith("/");

    try {
      const response = await fetch(
        endpoint,
        localSheet
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }
          : {
              method: "POST",
              mode: "no-cors",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify(data),
            }
      );
      if (localSheet && !response.ok) throw new Error("RSVP was not saved");
      rsvpStatus.textContent = "Thank you — we have your reply.";
      rsvpForm.reset();
    } catch (error) {
      rsvpStatus.textContent = localSheet
        ? "Could not save to the spreadsheet. Close RSVPs.xlsx if it is open, then try again."
        : "Could not send just now. Please try again.";
    }
  });

  fillCopy();
  renderGallery();
  if (sessionStorage.getItem(sessionKey) === "1") {
    openInvitation();
  }
})();
