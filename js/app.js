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
    const nick = cfg.names.nickname
      ? ` <span class="couple-nick">(${cfg.names.nickname})</span>`
      : "";
    return `${cfg.names.one} <span class="gate-and">${cfg.names.and}</span> <span class="couple-two">${cfg.names.two}${nick}</span>`;
  }

  let guests = [];

  function parseGuestList(text) {
    return text.split(/\r?\n/).flatMap((line) => {
      const password = line.trim();
      if (!password || password.startsWith("#") || password.startsWith("```")) return [];
      return [password];
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
    document.title = cfg.names.nickname
      ? `${cfg.names.one} & ${cfg.names.two} (${cfg.names.nickname})`
      : `${cfg.names.one} & ${cfg.names.two}`;
    document.getElementById("gate-names").innerHTML = coupleLine();
    document.getElementById("invite-names").innerHTML = coupleLine();
    const tagline = document.getElementById("tagline");
    tagline.textContent = cfg.tagline || "";
    tagline.hidden = !cfg.tagline;
    const whenText = cfg.time ? `${cfg.date} · ${cfg.time}` : cfg.date;
    document.getElementById("when").textContent = whenText;
    const nick = cfg.names.nickname ? ` (${cfg.names.nickname})` : "";
    document.getElementById("preview-names").textContent =
      `${cfg.names.one} ${cfg.names.and} ${cfg.names.two}${nick}`;
    document.getElementById("preview-date").textContent = whenText;
    const where = document.getElementById("where");
    const place = [cfg.venue.name, cfg.venue.address].filter(Boolean).join(", ");
    where.textContent = place;
    where.hidden = !place;
    document.getElementById("story").textContent = cfg.story;
    const dress = document.getElementById("dress");
    dress.textContent = cfg.dressCode ? `Dress: ${cfg.dressCode}` : "";
    dress.hidden = !cfg.dressCode;
    document.getElementById("rsvp-by").textContent =
      `Please reply by ${cfg.rsvpBy}.`;

    document.getElementById("schedule-date").textContent = cfg.date;
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
  const previewPage = document.getElementById("preview-page");
  const previewImg = document.getElementById("preview-img");
  const underImg = document.getElementById("preview-under-img");
  const previewCaption = document.getElementById("preview-caption");
  let lightboxIndex = 0;
  let activeIndex = 0;
  let pointerStartX = 0;
  let flipping = false;
  let ignoreReelScroll = false;
  let flipTimer = 0;
  const flipEveryMs = 15000;

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
    if (cfg.photos.length) showPreview(0);
    scheduleFlip();
  }

  function markShot(index) {
    [...reel.children].forEach((shot, shotIndex) => {
      shot.classList.toggle("is-active", shotIndex === index);
      shot.setAttribute("aria-current", shotIndex === index ? "true" : "false");
    });
  }

  function framePhoto(img, photo) {
    img.style.objectPosition = photo.position || "center";
  }

  function showPreview(index) {
    const photo = cfg.photos[index];
    if (!photo) return;
    activeIndex = index;
    previewFrame.classList.add("is-placeholder");
    previewImg.style.visibility = "";
    previewImg.alt = photo.caption || `Photo ${index + 1}`;
    framePhoto(previewImg, photo);
    previewImg.src = photo.src;
    previewCaption.textContent = photo.caption || "";
    preview.setAttribute("aria-label", `Enlarge ${photo.caption || "photo"}`);
    markShot(index);
  }

  function centerShot(index) {
    const shot = reel.children[index];
    if (!shot) return;
    ignoreReelScroll = true;
    const left = shot.offsetLeft - (reel.clientWidth - shot.offsetWidth) / 2;
    reel.scrollTo({ left, behavior: "smooth" });
    const release = () => {
      if (!flipping) ignoreReelScroll = false;
    };
    reel.addEventListener("scrollend", release, { once: true });
    window.setTimeout(release, 800);
  }

  function finishTurn(index, photo) {
    previewImg.alt = photo.caption || `Photo ${index + 1}`;
    previewImg.style.visibility = "";
    framePhoto(previewImg, photo);
    previewImg.src = photo.src;
    previewCaption.textContent = photo.caption || "";
    preview.setAttribute("aria-label", `Enlarge ${photo.caption || "photo"}`);
    activeIndex = index;
    previewFrame.classList.remove("is-placeholder");
    previewFrame.classList.add("is-instant");
    previewFrame.classList.remove("is-turning");
    void previewPage.offsetWidth;
    previewFrame.classList.remove("is-instant");
    flipping = false;
    ignoreReelScroll = false;
  }

  function turnPage(index, shouldCenter) {
    const photo = cfg.photos[index];
    if (!photo || flipping || index === activeIndex) return;
    flipping = true;
    markShot(index);
    if (shouldCenter) centerShot(index);
    const incoming = new Image();
    const begin = () => {
      underImg.style.visibility = "";
      framePhoto(underImg, photo);
      underImg.src = photo.src;
      previewFrame.classList.add("is-turning");
      let settled = false;
      const finish = (event) => {
        if (settled) return;
        if (event && event.animationName !== "turn-front") return;
        settled = true;
        previewPage.removeEventListener("animationend", finish);
        finishTurn(index, photo);
      };
      previewPage.addEventListener("animationend", finish);
      window.setTimeout(finish, 1300);
    };
    incoming.onload = begin;
    incoming.onerror = begin;
    incoming.src = photo.src;
    scheduleFlip();
  }

  function scheduleFlip() {
    window.clearTimeout(flipTimer);
    flipTimer = window.setTimeout(autoFlip, flipEveryMs);
  }

  function nextPhotoIndex(from) {
    const count = reel.children.length;
    for (let step = 1; step <= count; step += 1) {
      const index = (from + step) % count;
      const img = reel.children[index]?.querySelector("img");
      if (img && img.complete && img.naturalWidth > 0) return index;
    }
    return -1;
  }

  function autoFlip() {
    if (invitation.hidden || document.hidden || !lightbox.hidden || flipping) {
      scheduleFlip();
      return;
    }
    const next = nextPhotoIndex(activeIndex);
    if (next < 0 || next === activeIndex) {
      scheduleFlip();
      return;
    }
    turnPage(next, true);
  }

  function selectPhoto(index, shouldCenter) {
    turnPage(index, shouldCenter);
    scheduleFlip();
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
    previewFrame.classList.add("is-placeholder");
  });
  underImg.addEventListener("error", () => {
    underImg.style.visibility = "hidden";
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
    scheduleFlip();
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
    if (ignoreReelScroll || flipping) return;
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
    if (nearest !== activeIndex) {
      showPreview(nearest);
      scheduleFlip();
    }
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

  function openInvitation() {
    sessionStorage.setItem(sessionKey, "1");
    gate.classList.add("is-open");
    invitation.hidden = false;
    gate.setAttribute("aria-hidden", "true");
    startMusic();
    scheduleFlip();
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
    const enteredKey = entered.toLowerCase();
    const match = guests.find((password) => password.toLowerCase() === enteredKey);
    if (match) {
      openInvitation();
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
