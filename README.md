# Joy D'Souza — Engineering Portfolio

A simple portfolio (About / Projects / Resume + a detail page per project) built
with plain HTML, CSS, and a small bit of JS — no build tools, frameworks, or
dependencies (beyond the optional CAD viewer, which loads three.js from a CDN).
Designed to be hosted for free on GitHub Pages.

## Recent changes

- **Experience section (About page):** the logo/date column is now wrapped in
  `.log-rail`, which stretches the full height of each entry and fills the
  space under the logo with a dotted connector line — this is what used to
  read as awkward "blank space" on desktop and an extra gap between the date
  and role on mobile.
- **More color:** added `.page-header` (dark intro band on Projects/Resume),
  a dark Experience section tint, and a dark Contact/footer, so the site
  isn't all white.
- **Resume page:** the Download PDF button (and the toolbar text above it) is
  now centered via `.resume-toolbar`.
- **Projects page:** all 7 projects, a `research` filter category, and a
  `.status-badge` (Ongoing / Completed) next to each project-type eyebrow.
- **Project detail pages:** rebuilt to a consistent order — full-width main
  media → Objective → Project Description → Reflection → Skills → an
  additional-media gallery (max 2 rectangles per row, no labels, just a
  caption). Every media type (photo, video, CAD model, PDF) in the gallery is
  now fullscreen-interactive via `.media-frame`, including live CAD models
  (see `js/cad-viewer.js`, which now uses a `ResizeObserver` so the model
  keeps working when reparented into the lightbox) and PDFs.
- **Skills:** now `.skill-tags` / `.skill-tag` — one consistent color instead
  of the old alternating `.tag` / `.tag-orange`.
- Every project page currently has **placeholder text and blank placeholder
  files** (empty `.svg`/`.stl`/`.pdf`) — nothing has been filled in from
  content elsewhere. Replace the placeholders and write your own
  Objective / Project Description / Reflection per page.

## File structure

```
portfolio/
├── index.html                      About page — hero, Experience, Contact Me
├── projects.html                    Projects page — filterable by category
├── project-force-sensor.html         Detail page for Project 1 (includes the
│                                       CAD viewer + PDF embed demo)
├── project-menstrual-pad.html        Detail page for Project 2
├── project-autonomous-robot.html     Detail page for Project 3
├── resume.html                        Resume page (embeds assets/resume.pdf)
├── css/
│   └── style.css                       All styling — colors, fonts, layout
├── js/
│   ├── main.js                          Mobile nav, active-link highlight,
│   │                                      fullscreen media viewer, project filter
│   └── cad-viewer.js                     Interactive STL viewer (three.js via CDN)
├── assets/
│   ├── resume.pdf                        Your resume — replace this file to update
│   ├── img/                              Placeholder photos/illustrations (SVGs)
│   ├── models/
│   │   └── sample-part.stl                Placeholder CAD file for the STL viewer demo
│   └── videos/                           Put project video files here if you use them
└── README.md
```

## 1. Put this on GitHub

1. Create a new repository on GitHub. If you want the site at
   `https://<your-username>.github.io/<repo-name>/`, name it anything.
   If you want it at `https://<your-username>.github.io/` (root URL, no repo
   name in path), name the repo exactly `<your-username>.github.io`.
2. Upload all the files in this folder to the repo, **keeping the folder
   structure** (the `css`, `js`, and `assets` folders must stay where they are
   relative to the HTML files).
   - On the repo page, click **Add file → Upload files**, drag the whole
     `portfolio` folder's contents in, and commit.
   - Or, if you use git locally:
     ```
     cd portfolio
     git init
     git remote add origin https://github.com/<your-username>/<repo-name>.git
     git add .
     git commit -m "Initial portfolio"
     git branch -M main
     git push -u origin main
     ```

## 2. Turn on GitHub Pages

1. In your repo, go to **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Under **Branch**, choose `main` and folder `/ (root)`, then **Save**.
4. Wait 1–2 minutes. GitHub will show you the live URL at the top of that
   Pages settings screen.

## 3. Editing content

### About page
- **Bio / intro text:** edit `<div class="hero-content">` in `index.html`.
- **Hero background:** currently `assets/img/hero-bg-illustration.svg`, scaled
  to fill the whole hero. Replace it with a real photo any time — same
  filename, or update the `src` on `<img class="hero-bg-illustration">`.
  Because it's `object-fit: cover`, any photo you drop in will fill the space
  without distortion.
- **Company logo + link (Experience section):** each `.log-entry` starts with
  a small squared chip (currently two-letter initials like "SN" or "GT").
  - To link it to the company: use `<a href="https://company.com" target="_blank" rel="noopener" class="log-logo">SN</a>`.
  - To leave it unlinked: use `<div class="log-logo">SN</div>` instead.
  - To use a real logo image instead of initials: put the image in
    `assets/img/logos/` and replace the chip's text with
    `<img src="assets/img/logos/company.png" alt="Company name">` (add
    `width:100%; height:100%; object-fit:contain;` inline style if needed).
- **Contact Me:** now sits at the bottom of the page, just above the footer.
  Edit the two links inside `<div class="contact-grid">` — the `mailto:`
  address, the LinkedIn URL, and the visible text in each `.contact-value`.

### Projects page
- **Category filter:** each `.project-entry` has a `data-category` attribute
  set to `class`, `club`, or `personal`. Change that value to move a project
  between filter tabs — nothing else needs to change. The filter buttons
  themselves are the `.filter-btn` elements near the top of `projects.html`;
  add another one (with a matching `data-filter` value) if you want a new
  category.
- **Add or edit a project card:** copy an entire `<div class="project-entry">...</div>`
  block and edit the content. Image stays on the left, text on the right, for
  every entry.
- **Add a project's detail page:** copy one of the existing `project-*.html`
  files, rename it, edit the content, then point a new card's "Learn More"
  button at that filename.

### Project detail pages
- **Captions:** every photo sits in a `.gallery-item` with a `.media-caption`
  paragraph right underneath — edit that text directly.
- **CAD / STL viewer:** `project-force-sensor.html` has a working example —
  a `<div class="cad-viewer" data-stl="assets/models/your-part.stl"></div>`.
  Visitors can rotate (drag), zoom (scroll), and pan (right-click drag, or
  two-finger drag on trackpad/touch). To use it on another project page, copy
  that block plus the `<script type="module" src="js/cad-viewer.js"></script>`
  tag near the bottom of the file, and point `data-stl` at your own exported
  `.stl` file placed in `assets/models/`. **Note:** this loads three.js from a
  CDN (unpkg.com), so it needs an internet connection and adds some load time
  — only include it on pages where an interactive model is actually useful.
- **Embedded PDF:** same pattern as the Resume page, reusable anywhere — see
  the "Calibration Report" section in `project-force-sensor.html` for a
  working example. Good for spec sheets, drawings, or reports. Delete the
  block if you don't need it on a given page.

### Resume page
- Replace `assets/resume.pdf` with your new PDF, keeping the filename
  `resume.pdf` (or update `resume.html` if you rename it). The embed is sized
  to a standard page's proportions so it stays readable on both desktop and
  mobile without zooming.

### Site-wide
- **Fullscreen viewing:** any image or video wrapped in
  `<div class="media-frame">...</div>` automatically gets a hover-to-reveal
  expand button (always visible on mobile) that opens it full-screen in a
  lightbox. No extra setup needed.
- **"Last updated" date:** each page's footer reads `Last updated: August 2026`
  — update this text by hand whenever you make a meaningful content edit.
- **Colors:** every color is defined once at the top of `css/style.css` inside
  `:root { ... }`.
- **Fonts:** headings use Spectral, set via `--font-display` in `css/style.css`
  plus the Google Fonts `<link>` in each page's `<head>`. If you'd rather try
  Lora, Source Serif 4, Newsreader, or Petrona, swap the family name in both
  places — they're all similar in mood to Spectral.

## 4. Notes on performance

- No frameworks, no build step — the whole site is a handful of KB of
  HTML/CSS/JS plus whatever images/videos/models you add.
- The CAD viewer is the one exception: three.js is a real (if small-ish)
  library loaded from a CDN. It only activates on pages that include a
  `.cad-viewer` element and the `cad-viewer.js` script tag, so pages without
  it stay lightweight.
- Compress real photos before uploading (e.g. [squoosh.app](https://squoosh.app))
  and prefer `.webp` or optimized `.jpg` over large PNGs.
- Keep STL files reasonably light for a snappy viewer — decimate/simplify a
  high-poly export if your CAD tool produces a huge file.
