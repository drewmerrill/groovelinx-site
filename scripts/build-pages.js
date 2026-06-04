/**
 * build-pages.js — static page generator for groovelinx.com
 *
 * Emits per-band-type landing pages + the deep /features page from shared
 * partials, so nav / footer / modal / motion stay identical to index.html.
 * Output is plain static HTML committed to the repo (GitHub Pages stays a
 * pure static host — this is a one-shot local generator, not a runtime build).
 *
 *   node scripts/build-pages.js
 *
 * index.html (the homepage) is hand-authored and NOT generated here.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

/* ── Shared partials (mirror index.html markup) ───────────────────────── */

function head({ title, desc, canonical, jsonld }) {
  const blocks = (jsonld || [])
    .map((o) => `  <script type="application/ld+json">\n  ${JSON.stringify(o)}\n  </script>`)
    .join("\n");
  return `  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="theme-color" content="#07040e" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <link rel="canonical" href="${canonical}" />
  <meta name="robots" content="index,follow" />
  <link rel="icon" href="/favicon.ico" sizes="any" />
  <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png" />
  <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
  <link rel="apple-touch-icon" href="/icon-180.png" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="GrooveLinx" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="https://groovelinx.com/images/og-card.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="https://groovelinx.com/images/og-card.png" />

${blocks}

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="/styles.css" />`;
}

const announce = `    <div class="announce">
      <div class="row">
        <span>🎸 GrooveLinx is in <strong>invite-only beta</strong> — get your band on the list.</span>
        <button type="button" class="announce-cta" data-open="beta">Join the list &rarr;</button>
      </div>
    </div>`;

// Sub-page nav: brand -> home, section links absolute to homepage, + Features.
const nav = `    <header class="topbar" role="banner">
      <div class="wrap">
        <div class="nav" aria-label="Primary">
          <a class="brand" href="/" aria-label="GrooveLinx home">
            <img src="/images/groovelinx_psychedelic_logo.png" width="1024" height="1024" alt="GrooveLinx logo"
                 onerror="this.onerror=null;this.src='/images/groovelinx_clean_logo.png';" />
            <div class="nm">
              <strong>GrooveLinx</strong>
              <span>Band Operating System</span>
            </div>
          </a>
          <nav class="navlinks" aria-label="Site links">
            <a href="/features.html">Features</a>
            <a href="/#systems">Systems</a>
            <a href="/#compare">Why</a>
            <a href="/#bands">Bands</a>
            <a href="/#faq">FAQ</a>
          </nav>
          <div class="actions">
            <a class="btn ghost" href="https://app.groovelinx.com" target="_blank">Member sign-in</a>
            <button class="btn primary" type="button" data-open="beta">Join the list</button>
            <button class="hamburger" type="button" aria-label="Open menu" aria-expanded="false" data-open="menu">
              <span></span>
            </button>
          </div>
        </div>
        <div class="mobilepanel" id="mobilepanel" aria-label="Mobile menu">
          <div class="pcard">
            <a href="/features.html" data-close="menu">Features</a>
            <a href="/#systems" data-close="menu">Systems</a>
            <a href="/#compare" data-close="menu">Why GrooveLinx</a>
            <a href="/#bands" data-close="menu">For your band</a>
            <a href="/#faq" data-close="menu">FAQ</a>
            <div class="spacer"></div>
            <a class="btn ghost" style="width:100%" href="https://app.groovelinx.com" target="_blank">Member sign-in</a>
            <button class="btn primary" style="width:100%; margin-top:10px" type="button" data-open="beta">Join the list &rarr;</button>
          </div>
        </div>
      </div>
    </header>`;

const systemsStrip = `      <section id="systems">
        <div class="wrap">
          <div class="sectionHead reveal">
            <div class="kick"><span class="sq"></span> Five Systems</div>
            <h2>One platform. Five systems. Built around how bands&nbsp;actually&nbsp;work.</h2>
            <p class="sub">Not a chat app with a calendar bolted on. A connected operating system for bands &mdash; from first idea to last encore.</p>
          </div>
          <div class="console reveal">
            <a href="/#plan" class="consoleItem" style="--accent:var(--green)"><div class="ix">01</div><h3 style="color:var(--green)">Practice</h3><p>Songs, setlists &amp; shared schedule</p><span class="bar"></span></a>
            <a href="/#rehearse" class="consoleItem" style="--accent:var(--violet)"><div class="ix">02</div><h3 style="color:#a9b1ff">Rehearse</h3><p>Plans, readiness &amp; what to work on</p><span class="bar"></span></a>
            <a href="/#perform" class="consoleItem" style="--accent:var(--amber)"><div class="ix">03</div><h3 style="color:var(--amber)">Play</h3><p>Stage view, live charts &amp; setlists</p><span class="bar"></span></a>
            <a href="/#learn" class="consoleItem" style="--accent:var(--red)"><div class="ix">04</div><h3 style="color:var(--red)">Review</h3><p>Listen back, isolate parts &amp; study takes</p><span class="bar"></span></a>
            <a href="/#improve" class="consoleItem" style="--accent:var(--grape)"><div class="ix">05</div><h3 style="color:#d3a8ff">Improve</h3><p>Trends, readiness &amp; your next step</p><span class="bar"></span></a>
          </div>
        </div>
      </section>`;

function ctaPanel() {
  return `      <section>
        <div class="wrap">
          <div class="panel reveal">
            <div class="inner">
              <h2 style="margin-top:0">Run your band like an operating system.</h2>
              <p class="sub" style="max-width:520px;margin:0 auto 24px;text-align:center">GrooveLinx is in invite-only beta. Join the list for the next bands we onboard &mdash; and help shape what gets built.</p>
              <div class="heroBtns" style="justify-content:center">
                <button class="btn primary" type="button" data-open="beta">Join the list &rarr;</button>
                <a class="btn ghost" href="https://app.groovelinx.com" target="_blank">Member sign-in</a>
              </div>
            </div>
          </div>
        </div>
      </section>`;
}

const footer = `      <footer>
        <div class="wrap">
          <div class="footRow">
            <div class="copy">&copy; <span id="year"></span> GrooveLinx &mdash; Band Operating System</div>
            <div class="footLinks">
              <a href="/features.html">Features</a>
              <a href="/for-jam-bands.html">Jam bands</a>
              <a href="/for-cover-bands.html">Cover bands</a>
              <a href="/for-worship-teams.html">Worship teams</a>
              <a href="/for-tribute-bands.html">Tributes</a>
              <a href="/vs-bandhelper.html">vs BandHelper</a>
              <a href="/privacy.html">Privacy</a>
              <a href="/terms.html">Terms</a>
            </div>
          </div>
        </div>
      </footer>`;

const modal = `    <div class="modalOverlay" id="betaOverlay" role="dialog" aria-modal="true" aria-label="Join Beta form">
      <div class="modal" role="document">
        <div class="modalHead">
          <strong>Join the GrooveLinx beta</strong>
          <button class="x" type="button" data-close="beta">&times;</button>
        </div>
        <div class="modalBody">
          <p class="fineprint">Invite-only beta &mdash; get on the list for the next bands we onboard.</p>
          <form action="https://formspree.io/f/xdkovpvv" method="POST">
            <div class="formRow">
              <div><label>Name</label><input name="name" required placeholder="Your name" /></div>
              <div><label>Email</label><input type="email" name="email" required placeholder="you@band.com" /></div>
            </div>
            <div class="formRow">
              <div><label>Band / Project</label><input name="band" placeholder="Band name" /></div>
              <div><label>City</label><input name="city" placeholder="City, State" /></div>
            </div>
            <label>What kind of band?</label>
            <input name="band_type" placeholder="Jam, Cover, Tribute, Church, Wedding, Acoustic, Original..." />
            <button class="btn primary" type="submit" style="width:100%;margin-top:8px">Join the list &rarr;</button>
          </form>
        </div>
      </div>
    </div>`;

const script = `  <script>
    document.getElementById("year").textContent = new Date().getFullYear();
    const mobilePanel = document.getElementById("mobilepanel");
    const hamburger = document.querySelector(".hamburger");
    function openPanel(){ mobilePanel.style.display = "block"; hamburger.setAttribute("aria-expanded","true"); }
    function closePanel(){ mobilePanel.style.display = "none"; hamburger.setAttribute("aria-expanded","false"); }
    function togglePanel(){ mobilePanel.style.display === "block" ? closePanel() : openPanel(); }
    const betaOverlay = document.getElementById("betaOverlay");
    function openOverlay(which){ if(which === "beta") betaOverlay.style.display = "flex"; closePanel(); }
    function closeOverlay(which){ if(which === "beta") betaOverlay.style.display = "none"; }
    document.addEventListener("click", (e) => {
      const open = e.target.closest("[data-open]");
      const close = e.target.closest("[data-close]");
      if(open){ const w = open.getAttribute("data-open"); if(w === "menu") togglePanel(); else openOverlay(w); return; }
      if(close){ const w = close.getAttribute("data-close"); if(w === "menu") closePanel(); else closeOverlay(w); return; }
      if(e.target === betaOverlay) closeOverlay("beta");
    });
    document.addEventListener("keydown", (e) => { if(e.key === "Escape"){ closeOverlay("beta"); closePanel(); } });
    document.querySelectorAll('[data-close="menu"]').forEach(a => a.addEventListener("click", () => closePanel()));
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    } else {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    }
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion) {
      const hero = document.querySelector(".hero");
      const spot = document.querySelector(".spotlight");
      const aurora = document.querySelector(".aurora");
      const stage = document.querySelector(".heroStage");
      const phone = document.querySelector(".heroStage .phoneCard");
      const clamp = (v) => Math.max(-1, Math.min(1, v));
      if (window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener("pointermove", (e) => {
          if (spot && hero) {
            const r = hero.getBoundingClientRect();
            spot.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
            spot.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
          }
          if (aurora) {
            const dx = (e.clientX / window.innerWidth - 0.5) * -30;
            const dy = (e.clientY / window.innerHeight - 0.5) * -30;
            aurora.style.transform = "translate(" + dx + "px," + dy + "px)";
          }
          if (phone && stage) {
            const s = stage.getBoundingClientRect();
            const px = clamp((e.clientX - (s.left + s.width / 2)) / (s.width / 2));
            const py = clamp((e.clientY - (s.top + s.height / 2)) / (s.height / 2));
            phone.style.setProperty("--ry", (px * 14 - 4).toFixed(2) + "deg");
            phone.style.setProperty("--rx", (py * -11).toFixed(2) + "deg");
          }
        }, { passive: true });
        document.addEventListener("mouseleave", () => {
          if (phone) { phone.style.setProperty("--ry", "-7deg"); phone.style.setProperty("--rx", "3deg"); }
        });
      }
      const ghosts = document.querySelectorAll(".ghostnum");
      if (ghosts.length) {
        let ticking = false;
        const update = () => {
          ghosts.forEach((g) => { const r = g.getBoundingClientRect(); g.style.transform = "translateY(" + ((r.top - window.innerHeight/2) * -0.06).toFixed(1) + "px)"; });
          ticking = false;
        };
        window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
        update();
      }
    }
  </script>`;

function page({ headOpts, body }) {
  return `<!doctype html>
<html lang="en">
<head>
${head(headOpts)}
</head>

<body>
  <div class="bg" aria-hidden="true">
    <div class="aurora"><b class="b1"></b><b class="b2"></b><b class="b3"></b><b class="b4"></b></div>
  </div>
  <div class="grain" aria-hidden="true"></div>

  <div class="skin">
${announce}

${nav}

    <main id="top">
${body}

${footer}
    </main>

${modal}
  </div>

${script}
</body>
</html>
`;
}

/* ── Band-type hero + body ────────────────────────────────────────────── */

function bandHero(b) {
  const chips = b.chips
    .map((c) => `                <div class="floatchip ${c.pos}" style="color:var(--${c.color})">${c.text}</div>`)
    .join("\n");
  return `      <section class="hero">
        <div class="spotlight" aria-hidden="true"></div>
        <div class="wrap">
          <div class="heroGrid">
            <div class="heroCopy">
              <div class="kick" style="color:var(--${b.accent})"><span class="sq" style="background:var(--${b.accent});box-shadow:0 0 12px var(--${b.accent})"></span> // For ${b.label}</div>
              <h1>${b.h1[0]}<br/><span class="grad">${b.h1[1]}</span></h1>
              <p class="heroLead">${b.sub}</p>
              <div class="heroBtns">
                <button class="btn primary" type="button" data-open="beta">Join the list &rarr;</button>
                <a class="btn ghost" href="/features.html">See all features</a>
              </div>
              <div class="heroMeta">
                <span class="chip"><span class="eq"><i></i><i></i><i></i><i></i><i></i></span> <b>${b.tagline}</b></span>
              </div>
            </div>
            <div class="heroStage">
              <div class="phoneCard">
                <div class="phoneFrame">
                  <img src="/images/${b.shot}" width="402" height="874" alt="${b.shotAlt}" loading="lazy" />
                </div>
              </div>
${chips}
            </div>
          </div>
        </div>
      </section>`;
}

function bandWhy(b) {
  const cards = b.why
    .map(
      (w) => `            <div class="card lift" style="--accent:var(--${b.accent})"><div class="pad">
              <div class="tag" style="color:var(--${b.accentText})">${w.tag}</div>
              <h3>${w.h}</h3>
              <p>${w.p}</p>
            </div></div>`
    )
    .join("\n");
  return `      <section>
        <div class="wrap">
          <div class="sectionHead reveal">
            <div class="kick" style="color:var(--${b.accentText})"><span class="sq" style="background:var(--${b.accent});box-shadow:0 0 12px var(--${b.accent})"></span> Why ${b.label.toLowerCase()} use it</div>
            <h2>${b.whyHead}</h2>
            <p class="sub">${b.whySub}</p>
          </div>
          <div class="grid2 reveal">
${cards}
          </div>
        </div>
      </section>`;
}

function bandSwitch(current) {
  const all = [
    ["for-jam-bands", "Jam bands"],
    ["for-cover-bands", "Cover bands"],
    ["for-worship-teams", "Worship teams"],
    ["for-tribute-bands", "Tribute acts"],
  ];
  const pills = all
    .filter(([slug]) => slug !== current)
    .map(([slug, label]) => `            <a class="shipPill" href="/${slug}.html" style="text-decoration:none">→ ${label}</a>`)
    .join("\n");
  return `      <section>
        <div class="wrap">
          <div class="sectionHead reveal">
            <div class="kick"><span class="sq"></span> Other bands</div>
            <h2>Different band, same operating system.</h2>
          </div>
          <div class="changelogStrip reveal" style="gap:10px">
${pills}
            <a class="shipPill" href="/" style="text-decoration:none">→ Everything in GrooveLinx</a>
          </div>
        </div>
      </section>`;
}

function buildBand(b) {
  const canonical = `https://groovelinx.com/${b.slug}.html`;
  const jsonld = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "GrooveLinx", applicationCategory: "MusicApplication", operatingSystem: "Web, iOS (PWA)", description: b.desc, url: canonical, offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Invite-only beta" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "GrooveLinx", item: "https://groovelinx.com/" },
      { "@type": "ListItem", position: 2, name: b.label, item: canonical },
    ] },
  ];
  const body = [bandHero(b), bandWhy(b), systemsStrip, bandSwitch(b.slug), ctaPanel()].join("\n\n");
  return page({ headOpts: { title: b.title, desc: b.desc, canonical, jsonld }, body });
}

/* ── Band-type data (truthful framing of shipped features) ────────────── */

const BANDS = [
  {
    slug: "for-jam-bands", label: "Jam Bands", accent: "green", accentText: "green",
    title: "Setlist & Rehearsal App for Jam Bands — GrooveLinx",
    desc: "GrooveLinx is the operating system for jam bands: a shared song catalog, reusable setlists with segues, rehearsal plans, stage-ready charts, and stems to learn parts — all built around your songs.",
    h1: ["Your jams, organized.", "Your sets, ready."],
    sub: "Rotating repertoire, long-form tunes, segues that change every night. GrooveLinx keeps the whole catalog, the setlists, and who-knows-what in one place the whole band shares — so every show is built on what you actually rehearsed.",
    tagline: "Built with a real jam band that gigs every month",
    shot: "gl-setlists.png", shotAlt: "GrooveLinx setlists for a jam band with upcoming gigs, songs and sets",
    chips: [
      { pos: "fc1", color: "green", text: "<b>Setlist</b> · drag to reorder" },
      { pos: "fc2", color: "amber", text: "Key <b>A</b> · <b>124</b> BPM" },
      { pos: "fc3", color: "cyan", text: "<b>Readiness</b> 4.8/5 ▲" },
    ],
    whyHead: "Built for a deep, rotating repertoire.",
    whySub: "Jam bands don't play the same 12 songs every night. GrooveLinx is built for a big catalog that rotates — and sets that get rebuilt every show.",
    why: [
      { tag: "🎵 Big catalog", h: "Hundreds of songs, structured and searchable", p: "Active vs. library status, per-song key, BPM, structure, lyrics, and reference recordings. Your whole book in one shared place instead of a spreadsheet and a Drive folder." },
      { tag: "📋 Sets that rotate", h: "Reusable, versioned setlists per gig", p: "Build a set, reorder by drag, tie it to the gig on your calendar. Versioned so last weekend's set doesn't overwrite next weekend's — and Stage View reads from it directly." },
      { tag: "🎚 Learn the jam", h: "Stems to isolate any part", p: "Self-hosted Demucs separation pulls drums, bass, keys, guitar and vocals out of a recording so you can practice your part with — or without — the rest of the band." },
      { tag: "📊 Know what's ready", h: "Per-song, per-member readiness", p: "See which tunes are stage-ready, which are still woodshedding, and which haven't been touched in a month — so the set you build is the set you can actually play." },
    ],
  },
  {
    slug: "for-cover-bands", label: "Cover Bands", accent: "amber", accentText: "amber",
    title: "Song & Setlist Manager for Cover Bands — GrooveLinx",
    desc: "GrooveLinx is the operating system for cover bands: a huge shared song catalog with keys and BPM, reusable setlists, stage-ready charts, and a shared calendar — one source of truth for the whole band.",
    h1: ["Hundreds of songs.", "One source of truth."],
    sub: "A cover band lives or dies by its book. GrooveLinx keeps every song — key, BPM, structure, chart — in one shared catalog, builds sets you reuse across gigs, and puts stage-ready charts on the stand so requests never catch you out.",
    tagline: "Your whole book, shared and current",
    shot: "gl-songs.png", shotAlt: "GrooveLinx song library for a cover band with per-song readiness scores",
    chips: [
      { pos: "fc1", color: "green", text: "<b>Active</b> 63 · Library 549" },
      { pos: "fc2", color: "amber", text: "Key <b>G</b> · <b>118</b> BPM" },
      { pos: "fc3", color: "cyan", text: "<b>Search</b> any song" },
    ],
    whyHead: "Your repertoire, finally in one place.",
    whySub: "Stop hunting through a spreadsheet, a Drive folder, and three group chats. One catalog the whole band shares — searchable, current, stage-ready.",
    why: [
      { tag: "🎵 The whole book", h: "Every song, with key and BPM up front", p: "Active and library status, per-song key, BPM, structure, lyrics, chord charts and references — all band-shared and searchable. Replace five places with one." },
      { tag: "📋 Sets in minutes", h: "Reusable setlists per gig", p: "Build once, reuse across gigs, reorder by drag. Tied to the gig on your calendar and versioned, so each weekend's set stands on its own." },
      { tag: "📜 Take the request", h: "Stage-ready charts on the stand", p: "Per-song charts with auto-scroll, swipe or keyboard nav between songs, and key + BPM visible without squinting — under stage lights, on a tablet." },
      { tag: "📆 One shared calendar", h: "Gigs and rehearsals everyone can see", p: "Two-way Google Calendar sync the whole band subscribes to, with time-aware classification so personal events don't block rehearsal availability." },
    ],
  },
  {
    slug: "for-worship-teams", label: "Worship Teams", accent: "cyan", accentText: "cyan",
    title: "Worship Team & Church Band Software — GrooveLinx",
    desc: "GrooveLinx is the operating system for worship teams: shared songs with keys for every vocalist, reusable Sunday sets, rehearsal plans, readiness tracking, and a shared schedule the whole team sees.",
    h1: ["Every Sunday,", "the team's ready."],
    sub: "Rotating volunteers, weekly sets, and songs that move keys for whoever's leading. GrooveLinx keeps the team's songs, this week's set, and who's prepared in one shared place — so Sunday morning is calm, not scrambled.",
    tagline: "One source of truth for the whole team",
    shot: "gl-songs.png", shotAlt: "GrooveLinx shared song library for a worship team with keys and readiness",
    chips: [
      { pos: "fc1", color: "green", text: "<b>This week's</b> set" },
      { pos: "fc2", color: "amber", text: "Key <b>D</b> · capo 2" },
      { pos: "fc3", color: "cyan", text: "<b>Team</b> readiness" },
    ],
    whyHead: "Built for a rotating team and a weekly set.",
    whySub: "Worship teams change week to week — different leads, different keys, different volunteers. GrooveLinx keeps everyone on the same page without the Sunday-morning scramble.",
    why: [
      { tag: "🎵 Songs with keys", h: "Per-song key, structure and references", p: "Keep every song's key, structure, lyrics and reference recording in one shared catalog — so whoever's leading this week, the team's working from the same chart." },
      { tag: "📋 This week's set", h: "Reusable, shareable Sunday sets", p: "Build the set once, reuse and adapt it week to week, and share it with the whole team. Versioned so this Sunday's order doesn't clobber last Sunday's." },
      { tag: "📊 Who's prepared", h: "Per-song, per-member readiness", p: "See who's ready on which song before the team gets in the room — so rehearsal time goes to what actually needs it." },
      { tag: "🔔 Everyone aligned", h: "In-app, push, and SMS notifications", p: "In-app banners, browser/OS push, and SMS for the volunteer who never opens the app — so the whole team gets the set and the call time without anyone getting buried." },
    ],
  },
  {
    slug: "for-tribute-bands", label: "Tribute Acts", accent: "grape", accentText: "grape",
    title: "Tribute Band Setlist & Rehearsal App — GrooveLinx",
    desc: "GrooveLinx is the operating system for tribute acts: a precise song catalog, faithful setlists, stems to nail every part, stage-ready charts, and shared rehearsal intelligence — built around getting it right.",
    h1: ["Note for note.", "Show after show."],
    sub: "Tribute acts live on getting it exactly right. GrooveLinx keeps the catalog precise, the sets faithful to the show, and gives you stems and loops to nail every part — then puts it all on the stand, stage-ready.",
    tagline: "Get it right, every show",
    shot: "gl-stems.png", shotAlt: "GrooveLinx stems mixer for a tribute act isolating drums, bass, guitar, keys and vocals",
    chips: [
      { pos: "fc1", color: "green", text: "<b>6 stems</b> isolated" },
      { pos: "fc2", color: "amber", text: "Loop the <b>bridge</b>" },
      { pos: "fc3", color: "cyan", text: "<b>Key</b> · <b>BPM</b> matched" },
    ],
    whyHead: "For acts that have to get it exactly right.",
    whySub: "When the whole show is faithfulness to the original, the details matter. GrooveLinx is built to get the parts, the keys, and the set right.",
    why: [
      { tag: "🎚 Nail every part", h: "Stems to isolate drums, bass, keys, guitar, vocals", p: "Self-hosted Demucs separation gives 4 or 6 stems per song. Mute, solo, pan and slow down any part, and loop the bars you're learning until it's right." },
      { tag: "🎤 Match the vocals", h: "Split lead vs. backing in Harmony Lab", p: "LALAL.AI separates a recording into lead and backing, pans each into its own ear, and loops a phrase — so the harmonies land like the record." },
      { tag: "🎼 Keys and tempo, matched", h: "BPM and key detected from the audio", p: "Drop a reference recording in and BPM + key are detected and saved to the song, with the metronome auto-tuned — so the set matches the originals." },
      { tag: "📜 Stage-ready charts", h: "Faithful sets on the stand", p: "Reusable, versioned setlists feed Stage View and Live Gig charts with auto-scroll and swipe nav — so the show runs exactly as rehearsed." },
    ],
  },
];

/* ── Features page (the deep "second page") ───────────────────────────── */

function featuresPage() {
  const canonical = "https://groovelinx.com/features.html";
  const groups = [
    { sys: "Practice", color: "green", id: "plan", lead: "Songs, setlists, and a shared schedule — one place the whole band sees.", items: [
      ["Shared song catalog", "Active + library status, key, BPM, structure, lyrics, chord charts and references — band-shared and searchable."],
      ["Reusable setlists", "Build once, reuse across gigs, drag to reorder, tied to a gig and versioned so sets don't overwrite each other."],
      ["Two-way Google Calendar", "Sync rehearsals and gigs to a calendar the band subscribes to; pick which calendars to import; time-aware classification."],
      ["Gigs queue", "Upcoming gigs surface what to rehearse, what set to build, and which songs aren't ready yet."],
    ] },
    { sys: "Rehearse", color: "violet", id: "rehearse", lead: "Walk into rehearsal knowing exactly what to work on.", items: [
      ["Rehearsal plans", "An agenda built from readiness, recent coverage, and the gig calendar. Edit it, ignore it, or hand it to the band."],
      ["Readiness tracking", "Per-song, per-member readiness — what's stage-ready, what's woodshedding, what's gone cold."],
      ["Walkthrough mode", "Timed walkthroughs capture what was rehearsed and how it went; take notes mid-song, jump sections."],
      ["Practice actions", "One specific, song-sized thing to work on next — not generic encouragement."],
    ] },
    { sys: "Play", color: "amber", id: "perform", lead: "Stage-ready surfaces designed for the gig, not the rehearsal room.", items: [
      ["Setlist Stage View", "The full set in stage-friendly type; tap any song to jump; key and BPM visible without squinting."],
      ["Live Gig charts", "Per-song charts with auto-scroll, swipe or keyboard nav, and member assignments up top."],
      ["Stage plot", "Drag members onto a stage diagram; save layouts per venue; reference at sound check."],
      ["Instant SLA", "Performance surfaces load to a strict 'instant' target — no spinner between you and the next song."],
    ] },
    { sys: "Review", color: "red", id: "learn", lead: "Learn parts faster — without burning hours on YouTube.", items: [
      ["Stems mixer", "Self-hosted Demucs separation into 4 or 6 stems; mute, solo, volume, pan and tempo per part."],
      ["Harmony Lab", "LALAL.AI lead/backing split, pan each into an ear, loop a phrase; auto-draft notation to clean up by hand."],
      ["BPM & key auto-detect", "Tempo and key detected from the audio and saved to the song; metronome auto-tunes; manual override always."],
      ["Song intelligence", "Sections, chords, lyrics and structure fill in as you use the app — the catalog sharpens over time."],
    ] },
    { sys: "Improve", color: "grape", id: "improve", lead: "What changed, what's working, and what's next — on purpose.", items: [
      ["Post-rehearsal insights", "'This rehearsal vs last' per song — what improved, what tightened, what needs work. Real data, not 'good job.'"],
      ["Activity feed", "Everything that changed across the band in one feed: takes, status, calendar, polls, ideas, gig prep."],
      ["Band pulse", "Readiness across songs, members and weeks — spot the song quietly slipping before the gig."],
      ["3-layer notifications", "In-app banners, browser/OS push, and SMS — keep everyone aligned without burying anyone."],
    ] },
  ];

  const sections = groups.map((g) => {
    const rows = g.items.map(([h, p]) => `            <div class="card lift" style="--accent:var(--${g.color})"><div class="pad">
              <h3 style="font-size:18px">${h}</h3>
              <p>${p}</p>
            </div></div>`).join("\n");
    return `      <section id="${g.id}">
        <div class="wrap">
          <div class="sectionHead reveal">
            <div class="kick" style="color:var(--${g.color})"><span class="sq" style="background:var(--${g.color});box-shadow:0 0 12px var(--${g.color})"></span> ${g.sys}</div>
            <h2>${g.lead}</h2>
          </div>
          <div class="grid2 reveal" style="grid-template-columns:repeat(2,1fr)">
${rows}
          </div>
        </div>
      </section>`;
  }).join("\n\n");

  const hero = `      <section class="hero">
        <div class="spotlight" aria-hidden="true"></div>
        <div class="wrap">
          <div class="heroGrid">
            <div class="heroCopy">
              <div class="kick"><span class="sq"></span> // Everything inside</div>
              <h1>Every feature,<br/><span class="grad">one operating system.</span></h1>
              <p class="heroLead">A full map of what GrooveLinx does — across all five systems. Practice, rehearse, play, review, improve. Built around your songs, shared by the whole band.</p>
              <div class="heroBtns">
                <button class="btn primary" type="button" data-open="beta">Join the list &rarr;</button>
                <a class="btn ghost" href="/#bands">Find your band</a>
              </div>
            </div>
            <div class="heroStage">
              <div class="phoneCard">
                <div class="phoneFrame">
                  <img src="/images/gl-home.png" width="402" height="874" alt="GrooveLinx home screen showing what matters most for the band right now" loading="lazy" />
                </div>
              </div>
              <div class="floatchip fc1" style="color:var(--green)"><b>Practice</b></div>
              <div class="floatchip fc2" style="color:var(--amber)"><b>Play</b> · stage-ready</div>
              <div class="floatchip fc3" style="color:var(--grape)"><b>Improve</b> ▲</div>
            </div>
          </div>
        </div>
      </section>`;

  const body = [hero, sections, systemsStrip, ctaPanel()].join("\n\n");
  const jsonld = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "GrooveLinx", applicationCategory: "MusicApplication", operatingSystem: "Web, iOS (PWA)", description: "Full feature set of GrooveLinx — the operating system for working bands.", url: canonical, offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Invite-only beta" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "GrooveLinx", item: "https://groovelinx.com/" },
      { "@type": "ListItem", position: 2, name: "Features", item: canonical },
    ] },
  ];
  return page({ headOpts: { title: "GrooveLinx Features — Band Practice, Rehearsal, Setlist & Stage Tools", desc: "Every GrooveLinx feature across all five systems: shared song catalog, reusable setlists, rehearsal plans and readiness, stage-ready charts, stems and Harmony Lab, and band insights.", canonical, jsonld }, body });
}

/* ── /vs-bandhelper — comparison + migration (the switch-capture page) ── */

function vsBandhelperPage() {
  const canonical = "https://groovelinx.com/vs-bandhelper.html";

  const hero = `      <section class="hero">
        <div class="spotlight" aria-hidden="true"></div>
        <div class="wrap">
          <div class="heroGrid">
            <div class="heroCopy">
              <div class="kick"><span class="sq"></span> // Thinking about switching?</div>
              <h1>BandHelper got you<br/>this far. <span class="grad">Here's what's next.</span></h1>
              <p class="heroLead">BandHelper is a genuinely good, mature tool — if it's working for your band, that's great. GrooveLinx takes a different angle: one connected operating system that doesn't just store your songs and sets, but tells you what to rehearse next and helps you learn the parts. Here's an honest comparison.</p>
              <div class="heroBtns">
                <button class="btn primary" type="button" data-open="beta">Join the list &rarr;</button>
                <a class="btn ghost" href="#compare">See the comparison</a>
              </div>
              <div class="heroMeta">
                <span class="chip"><span class="eq"><i></i><i></i><i></i><i></i><i></i></span> <b>Honest comparison — no trash-talk</b></span>
              </div>
            </div>
            <div class="heroStage">
              <div class="phoneCard">
                <div class="phoneFrame">
                  <img src="/images/gl-rehearsal.png" width="402" height="874" alt="GrooveLinx rehearsal plan showing focus songs and per-member readiness" loading="lazy" />
                </div>
              </div>
              <div class="floatchip fc1" style="color:var(--green)"><b>What to rehearse</b> next</div>
              <div class="floatchip fc2" style="color:var(--amber)"><b>Readiness</b> per song</div>
              <div class="floatchip fc3" style="color:var(--cyan)"><b>Stems</b> built in</div>
            </div>
          </div>
        </div>
      </section>`;

  const fair = `      <section>
        <div class="wrap">
          <div class="sectionHead reveal">
            <div class="kick"><span class="sq"></span> Credit where it's due</div>
            <h2>What BandHelper does well.</h2>
            <p class="sub">A fair comparison starts here. BandHelper is established, deep, and battle-tested — it has earned its place in a lot of bands' workflows. If these are what you need most, it may still be the better fit today, and that's an honest answer.</p>
          </div>
          <div class="grid2 reveal">
            <div class="card"><div class="pad"><h3 style="font-size:17px">Mature and feature-deep</h3><p>Years of polish across setlists, repertoire, smart documents, layouts, scheduling and member management. A broad, configurable toolkit.</p></div></div>
            <div class="card"><div class="pad"><h3 style="font-size:17px">Native apps + offline</h3><p>Established native iOS and Android apps with offline use — a real advantage if your stage or rehearsal space has no signal.</p></div></div>
            <div class="card"><div class="pad"><h3 style="font-size:17px">Highly configurable</h3><p>Lots of settings, custom fields, and layout control for bands that want to tune everything to their exact workflow.</p></div></div>
            <div class="card"><div class="pad"><h3 style="font-size:17px">Proven at scale</h3><p>A large, long-standing user base across many kinds of bands and performers. It works, and a lot of people rely on it.</p></div></div>
          </div>
        </div>
      </section>`;

  const table = `      <section id="compare">
        <div class="wrap">
          <div class="sectionHead reveal">
            <div class="kick"><span class="sq"></span> Side by side</div>
            <h2>Two philosophies, honestly compared.</h2>
            <p class="sub">BandHelper is a deep <em>toolkit</em>. GrooveLinx is a connected <em>operating system</em> that adds rehearsal intelligence and part-learning. Neither is "better" for every band — here's the real difference.</p>
          </div>
          <div class="card reveal"><div class="pad" style="padding:6px">
            <table class="cmp cmp-bh">
              <thead>
                <tr><th></th><th class="h-old">BandHelper</th><th class="h-new">GrooveLinx</th></tr>
              </thead>
              <tbody>
                <tr><td class="rowlabel">Core model</td><td class="old">A deep, configurable toolkit for setlists, documents and scheduling.</td><td class="new">A connected operating system — five systems sharing one source of truth.</td></tr>
                <tr><td class="rowlabel">Songs &amp; setlists</td><td class="old">Robust, established repertoire and setlist management.</td><td class="new">Shared catalog with key/BPM/structure; versioned setlists that feed Stage View directly.</td></tr>
                <tr><td class="rowlabel">Rehearsal</td><td class="old">Scheduling and availability.</td><td class="new">Rehearsal intelligence: per-song &amp; per-member readiness, a plan of what to work on, and post-rehearsal insights.</td></tr>
                <tr><td class="rowlabel">Learning parts</td><td class="old">Attach reference audio and documents to songs.</td><td class="new">Isolate stems (drums/bass/keys/guitar/vocals) and split lead vs. backing vocals — in the same app.</td></tr>
                <tr><td class="rowlabel">Insight</td><td class="old">Stores your band's data.</td><td class="new">Turns it into "what changed, what's ready, what's next" — a band pulse on the Home screen.</td></tr>
                <tr><td class="rowlabel">Platform</td><td class="old">Native iOS/Android apps + web, with offline.</td><td class="new">Web app that installs as a PWA — no app store, always current.</td></tr>
                <tr><td class="rowlabel">Maturity</td><td class="old">Established and broad, with years of polish.</td><td class="new">Younger, invite-only beta, shipping new surfaces weekly — built with a band that gigs monthly.</td></tr>
              </tbody>
            </table>
          </div></div>
          <p class="sub reveal" style="margin-top:14px;font-size:14px;color:var(--muted2)"><em>Honest note: BandHelper has more breadth and years of polish, plus native offline apps. GrooveLinx's edge is the connected model, rehearsal intelligence, and built-in part-learning. Pick the one that matches how your band actually works.</em></p>
        </div>
      </section>`;

  const why = `      <section>
        <div class="wrap">
          <div class="sectionHead reveal">
            <div class="kick" style="color:var(--green)"><span class="sq"></span> Why bands switch</div>
            <h2>The three reasons bands move to GrooveLinx.</h2>
          </div>
          <div class="grid2 reveal">
            <div class="card lift" style="--accent:var(--violet)"><div class="pad">
              <div class="tag" style="color:#a9b1ff">🎯 Tells you what to do next</div>
              <h3>Rehearsal intelligence, not just storage</h3>
              <p>Per-song and per-member readiness, a rehearsal plan built from your band's data, and "this rehearsal vs last" insights — so practice time goes where it's needed instead of "what should we play tonight?"</p>
            </div></div>
            <div class="card lift" style="--accent:var(--red)"><div class="pad">
              <div class="tag" style="color:var(--red)">🎚 Learn parts in the same app</div>
              <h3>Stems + Harmony Lab built in</h3>
              <p>Isolate any instrument from a recording, split lead vs. backing vocals, loop the hard bars — without leaving the app or paying for a separate stem tool.</p>
            </div></div>
            <div class="card lift" style="--accent:var(--green)"><div class="pad">
              <div class="tag" style="color:var(--green)">🔗 One connected system</div>
              <h3>Songs, sets, schedule and stage — joined up</h3>
              <p>Your catalog feeds your setlists, your setlists feed Stage View, your calendar drives your rehearsal plan. One source of truth instead of separate modules.</p>
            </div></div>
            <div class="card lift" style="--accent:var(--grape)"><div class="pad">
              <div class="tag" style="color:#d3a8ff">🤘 Built by a working band</div>
              <h3>Made at real rehearsals and real gigs</h3>
              <p>GrooveLinx is the operating system DeadCetera actually runs on, rehearsal to stage. Features ship because a gigging band needed them this week.</p>
            </div></div>
          </div>
        </div>
      </section>`;

  const migrate = `      <section>
        <div class="wrap">
          <div class="sectionHead reveal">
            <div class="kick"><span class="sq"></span> Switching</div>
            <h2>Moving over is low-risk.</h2>
            <p class="sub">You don't have to flip a switch and abandon BandHelper on day one. Here's how bands make the move.</p>
          </div>
          <div class="grid2 reveal">
            <div class="card"><div class="pad"><h3 style="font-size:17px">1 · Get on the list</h3><p>GrooveLinx is invite-only beta. Join the list and we'll onboard your band when a slot opens.</p></div></div>
            <div class="card"><div class="pad"><h3 style="font-size:17px">2 · We help you set up</h3><p>We hand-onboard you: get your songs seeded, your first setlist built, and your band invited — typically under 10 minutes of real setup.</p></div></div>
            <div class="card"><div class="pad"><h3 style="font-size:17px">3 · Run both for a bit</h3><p>Keep BandHelper for your next gig or two while the band gets comfortable. No pressure to migrate everything at once.</p></div></div>
            <div class="card"><div class="pad"><h3 style="font-size:17px">4 · Switch when it sticks</h3><p>Once rehearsals and sets are running in GrooveLinx, make it home. We're hands-on through the whole transition.</p></div></div>
          </div>
          <p class="sub reveal" style="margin-top:14px;font-size:14px;color:var(--muted2)"><em>Honest note: there's no one-click BandHelper importer yet — during the beta we set your band up with you by hand, which is also when we learn what would make the switch easier.</em></p>
        </div>
      </section>`;

  const faqs = [
    ["Is GrooveLinx a BandHelper replacement?", "For many bands, yes — it covers songs, setlists, scheduling and stage view, and adds rehearsal intelligence and part-learning. But BandHelper is more mature and has native offline apps, so the honest answer depends on what your band needs most."],
    ["Can I import my BandHelper data?", "There's no automated importer yet. During the invite-only beta we hand-onboard your band — seeding songs and building your first setlist with you — which is usually quick and gives us a chance to learn what would make migration easier."],
    ["What does GrooveLinx do that BandHelper doesn't?", "The biggest differences are rehearsal intelligence (per-song and per-member readiness plus a plan of what to work on next) and built-in part-learning (isolate stems and split lead vs. backing vocals inside the app)."],
    ["What does BandHelper do better?", "It's more mature and feature-deep, it has established native iOS/Android apps with offline use, and it's proven across a large user base. If those matter most to you, it may be the better fit today."],
    ["What does GrooveLinx cost?", "GrooveLinx is in invite-only beta — free for the bands we onboard during the beta. Join the list for the next round."],
    ["Do I have to quit BandHelper to try it?", "No. Run both during the transition — keep BandHelper for an upcoming gig while your band gets comfortable, and switch when it sticks."],
  ];
  const faqSection = `      <section id="faq">
        <div class="wrap">
          <div class="sectionHead reveal">
            <div class="kick"><span class="sq"></span> FAQ</div>
            <h2>Switching questions, answered.</h2>
          </div>
          <div class="card reveal faq"><div class="pad" style="padding:8px 22px 16px">
${faqs.map(([q, a]) => `            <details><summary>${q}</summary><p>${a}</p></details>`).join("\n")}
          </div></div>
        </div>
      </section>`;

  const jsonld = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "GrooveLinx", applicationCategory: "MusicApplication", operatingSystem: "Web, iOS (PWA)", description: "GrooveLinx is a band operating system and a BandHelper alternative — songs, setlists, rehearsal intelligence, stage-ready charts, and built-in stems for learning parts.", url: canonical, offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Invite-only beta" } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "GrooveLinx", item: "https://groovelinx.com/" },
      { "@type": "ListItem", position: 2, name: "GrooveLinx vs BandHelper", item: canonical },
    ] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ];

  const body = [hero, fair, table, why, migrate, faqSection, ctaPanel()].join("\n\n");
  return page({
    headOpts: {
      title: "GrooveLinx vs BandHelper — a working musician's honest comparison",
      desc: "An honest GrooveLinx vs BandHelper comparison: where each one wins, and how bands switch. GrooveLinx adds rehearsal intelligence and built-in stems for learning parts.",
      canonical, jsonld,
    },
    body,
  });
}

/* ── Emit ─────────────────────────────────────────────────────────────── */

const written = [];
BANDS.forEach((b) => { const f = path.join(ROOT, `${b.slug}.html`); fs.writeFileSync(f, buildBand(b)); written.push(`${b.slug}.html`); });
fs.writeFileSync(path.join(ROOT, "features.html"), featuresPage()); written.push("features.html");
fs.writeFileSync(path.join(ROOT, "vs-bandhelper.html"), vsBandhelperPage()); written.push("vs-bandhelper.html");
console.log("Generated:\n  " + written.join("\n  "));
