const partyDate = new Date("2026-05-08T19:00:00+02:00");
const mtbNames = ["Clement", "Noa", "Morgan"];
const config = window.CR3PSCL_CONFIG || {};
const supabaseUrl = (config.SUPABASE_URL || "").replace(/\/$/, "");
const supabaseKey = config.SUPABASE_ANON_KEY || "";
const adminCode = config.ADMIN_CODE || "";
const hasSharedStorage = Boolean(supabaseUrl && supabaseKey);

const fallbackGuests = [
  { name: "Clement", status: "present", brings: " confiance " },
  { name: "Noa", status: "maybe", brings: "glacons" },
  { name: "Morgan", status: "present", brings: "des mauvaises idees" },
];

const fallbackSongs = [
  { title: "Satisfaction", artist: "Benny Benassi", by: "la regie" },
  { title: "One More Time", artist: "Daft Punk", by: "obligatoire" },
  { title: "Alors on danse", artist: "Stromae", by: "urgence collective" },
];

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
};

const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const qs = (selector) => document.querySelector(selector);
const qsa = (selector) => [...document.querySelectorAll(selector)];

let guests = load("cr3pscl-guests", fallbackGuests);
let songs = load("cr3pscl-songs", fallbackSongs);
let pollVotes = load("cr3pscl-mtb", []);

function activateTab(tabId) {
  document.body.dataset.activeTab = tabId;
  qsa(".tab-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === tabId);
  });
  qsa(".tab-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === tabId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateCountdown() {
  const distance = partyDate.getTime() - Date.now();
  const safeDistance = Math.max(distance, 0);
  const days = Math.floor(safeDistance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safeDistance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safeDistance / (1000 * 60)) % 60);
  const seconds = Math.floor((safeDistance / 1000) % 60);

  qs("#days").textContent = String(days).padStart(2, "0");
  qs("#hours").textContent = String(hours).padStart(2, "0");
  qs("#minutes").textContent = String(minutes).padStart(2, "0");
  qs("#seconds").textContent = String(seconds).padStart(2, "0");

  if (distance <= 0) {
    qs("#countdown-note").textContent = "C'est maintenant. Bonne chance a la sono.";
  }
}

function renderGuests() {
  const present = guests.filter((guest) => guest.status === "present").length;
  const maybe = guests.filter((guest) => guest.status === "maybe").length;
  const bring = guests.filter((guest) => guest.brings.trim()).length;

  qs("#present-count").textContent = present;
  qs("#maybe-count").textContent = maybe;
  qs("#bring-count").textContent = bring;

  qs("#guest-list").innerHTML = guests
    .map((guest) => {
      const statusLabel = {
        present: "Present",
        maybe: "Peut-etre",
        absent: "Absent",
      }[guest.status] || "Present";
      const brings = guest.brings ? guest.brings : "Rien annonce";
      return `
        <article class="guest-item">
          <strong>${escapeHtml(guest.name)}</strong>
          <span class="tag">${statusLabel}</span>
          <p>${escapeHtml(brings)}</p>
        </article>
      `;
    })
    .join("");
}

function renderSongs() {
  qs("#song-list").innerHTML = songs
    .map((song) => {
      const artist = song.artist ? ` - ${escapeHtml(song.artist)}` : "";
      const by = song.by ? `<small>Propose par ${escapeHtml(song.by)}</small>` : "";
      return `<li><strong>${escapeHtml(song.title)}${artist}</strong>${by}</li>`;
    })
    .join("");
}

function setupPollSelects() {
  ["#marry-choice", "#kill-choice", "#kiss-choice"].forEach((selector) => {
    qs(selector).innerHTML = mtbNames
      .map((name) => `<option value="${name}">${name}</option>`)
      .join("");
  });
  qs("#kill-choice").value = "Noa";
  qs("#kiss-choice").value = "Morgan";
}

function renderPoll() {
  const buckets = {
    marry: Object.fromEntries(mtbNames.map((name) => [name, 0])),
    kill: Object.fromEntries(mtbNames.map((name) => [name, 0])),
    kiss: Object.fromEntries(mtbNames.map((name) => [name, 0])),
  };

  pollVotes.forEach((vote) => {
    if (buckets.marry[vote.marry] !== undefined) buckets.marry[vote.marry] += 1;
    if (buckets.kill[vote.kill] !== undefined) buckets.kill[vote.kill] += 1;
    if (buckets.kiss[vote.kiss] !== undefined) buckets.kiss[vote.kiss] += 1;
  });

  const labels = [
    ["Tu maries", buckets.marry],
    ["Tu tues", buckets.kill],
    ["Tu embrasses", buckets.kiss],
  ];

  qs("#poll-results").innerHTML = labels
    .map(([label, bucket]) => {
      const rows = mtbNames
        .map((name) => `<span>${name}: <strong>${bucket[name]}</strong></span>`)
        .join("");
      return `<article class="result-card"><h3>${label}</h3>${rows}</article>`;
    })
    .join("");
}

function renderAll() {
  renderGuests();
  renderSongs();
  renderPoll();
  renderAdminDetails();
}

function renderAdminDetails() {
  const adminGuests = qs("#admin-guests");
  const adminVotes = qs("#admin-votes");
  const adminSongs = qs("#admin-songs");
  if (!adminGuests || !adminVotes || !adminSongs) return;

  adminGuests.innerHTML = guests.length
    ? guests
        .map((guest) => {
          const brings = guest.brings ? guest.brings : "Rien annonce";
          return `
            <div class="admin-row">
              <strong>${escapeHtml(guest.name)} - ${escapeHtml(guest.status)}</strong>
              <small>${escapeHtml(brings)}</small>
            </div>
          `;
        })
        .join("")
    : `<div class="admin-row"><strong>Aucune presence pour l'instant</strong></div>`;

  adminVotes.innerHTML = pollVotes.length
    ? pollVotes
        .map((vote, index) => {
          return `
            <div class="admin-row">
              <strong>Vote ${index + 1}</strong>
              <small>Marie: ${escapeHtml(vote.marry)} | Tue: ${escapeHtml(vote.kill)} | Embrasse: ${escapeHtml(vote.kiss)}</small>
            </div>
          `;
        })
        .join("")
    : `<div class="admin-row"><strong>Aucun vote pour l'instant</strong></div>`;

  adminSongs.innerHTML = songs.length
    ? songs
        .map((song) => {
          const artist = song.artist ? ` - ${escapeHtml(song.artist)}` : "";
          const by = song.by ? `Propose par ${escapeHtml(song.by)}` : "Sans signature";
          return `
            <div class="admin-row">
              <strong>${escapeHtml(song.title)}${artist}</strong>
              <small>${by}</small>
            </div>
          `;
        })
        .join("")
    : `<div class="admin-row"><strong>Aucun son pour l'instant</strong></div>`;
}

async function loadSharedEvents() {
  if (!hasSharedStorage) {
    setStorageNote("Mode local: ajoute les cles Supabase dans config.js pour partager les resultats.");
    renderAll();
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/party_events?select=type,payload,created_at&order=created_at.asc`, {
      headers: supabaseHeaders(),
    });
    if (!response.ok) throw new Error("Chargement impossible");
    const events = await response.json();
    hydrateFromEvents(events);
    setStorageNote("Resultats partages charges.");
  } catch {
    setStorageNote("Impossible de charger le stockage partage. Affichage local temporaire.");
  }

  renderAll();
}

function hydrateFromEvents(events) {
  const remoteGuests = [];
  const remoteSongs = [];
  const remotePollVotes = [];

  events.forEach((event) => {
    if (event.type === "guest") remoteGuests.push(event.payload);
    if (event.type === "song") remoteSongs.push(event.payload);
    if (event.type === "poll") remotePollVotes.push(event.payload);
  });

  guests = remoteGuests.length ? remoteGuests.reverse() : [];
  songs = remoteSongs;
  pollVotes = remotePollVotes;
  save("cr3pscl-guests", guests);
  save("cr3pscl-songs", songs);
  save("cr3pscl-mtb", pollVotes);
}

async function saveSharedEvent(type, payload) {
  if (!hasSharedStorage) {
    addLocalEvent(type, payload);
    return { ok: true, local: true };
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/party_events`, {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ type, payload }),
  });

  if (!response.ok) {
    addLocalEvent(type, payload);
    return { ok: false, local: true };
  }

  await loadSharedEvents();
  return { ok: true, local: false };
}

function addLocalEvent(type, payload) {
  if (type === "guest") {
    guests = [payload, ...guests];
    save("cr3pscl-guests", guests);
  }
  if (type === "song") {
    songs = [...songs, payload];
    save("cr3pscl-songs", songs);
  }
  if (type === "poll") {
    pollVotes = [...pollVotes, payload];
    save("cr3pscl-mtb", pollVotes);
  }
  renderAll();
}

function supabaseHeaders() {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
  };
}

function setStorageNote(message) {
  qs("#guest-confirmation").textContent = message;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

qsa(".tab-button").forEach((button) => {
  button.addEventListener("click", () => activateTab(button.dataset.tab));
});

qsa("[data-tab-jump]").forEach((button) => {
  button.addEventListener("click", () => activateTab(button.dataset.tabJump));
});

qs("#admin-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const code = qs("#admin-code").value.trim();
  const message = qs("#admin-message");

  if (!adminCode) {
    message.textContent = "Code admin non configure dans config.js.";
    return;
  }

  if (code !== adminCode) {
    message.textContent = "Code incorrect.";
    qs("#admin-results").hidden = true;
    return;
  }

  if (hasSharedStorage) await loadSharedEvents();
  renderAdminDetails();
  qs("#admin-results").hidden = false;
  message.textContent = "Cockpit ouvert.";
});

qs("#refresh-admin").addEventListener("click", async () => {
  if (hasSharedStorage) await loadSharedEvents();
  renderAdminDetails();
  qs("#admin-message").textContent = "Resultats a jour.";
});

qs("#guest-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (localStorage.getItem("cr3pscl-presence")) {
    qs("#guest-confirmation").textContent = "T'as déjà répondu, triche pas.";
    return;
  }

  const guest = {
    name: qs("#guest-name").value.trim(),
    status: qs("#guest-status").value,
    brings: qs("#guest-brings").value.trim(),
  };
  if (!guest.name) return;

  qs("#guest-confirmation").textContent = "Envoi...";
  const result = await saveSharedEvent("guest", guest);
  localStorage.setItem("cr3pscl-presence", "true");
  event.currentTarget.reset();
  qs("#guest-confirmation").textContent = result.local
    ? "C'est noté en local."
    : "C'est noté, tout le monde peut le voir.";
});

qs("#song-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const song = {
    title: qs("#song-title").value.trim(),
    artist: qs("#song-artist").value.trim(),
    by: qs("#song-by").value.trim(),
  };
  if (!song.title) return;

  qs("#song-confirmation").textContent = "Envoi...";
  const result = await saveSharedEvent("song", song);
  event.currentTarget.reset();
  qs("#song-confirmation").textContent = result.local
    ? "Son note en local. Configure Supabase pour le partage public."
    : "Son ajoute a la liste commune.";
});

qs("#mtb-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (localStorage.getItem("cr3pscl-voted")) {
    qs("#vote-confirmation").textContent = "T'as déjà voté, triche pas.";
    return;
  }

  const vote = {
    marry: qs("#marry-choice").value,
    kill: qs("#kill-choice").value,
    kiss: qs("#kiss-choice").value,
  };
  if (new Set(Object.values(vote)).size !== 3) {
    qs("#vote-confirmation").textContent = "Il faut choisir une personne différente pour chaque catégorie.";
    return;
  }

  qs("#vote-confirmation").textContent = "Envoi...";
  const result = await saveSharedEvent("poll", vote);
  localStorage.setItem("cr3pscl-voted", "true");
  qs("#vote-confirmation").textContent = result.local
    ? "Vote noté en local."
    : "Vote ajouté aux résultats publics.";
});

setupPollSelects();
renderAll();
loadSharedEvents();
updateCountdown();
setInterval(updateCountdown, 1000);
if (hasSharedStorage) setInterval(loadSharedEvents, 15000);
