# Joy D'Souza — Engineering Portfolio

A simple 3-page portfolio (About / Projects / Resume) built with plain HTML, CSS,
and a small bit of JS — no build tools, frameworks, or dependencies. It's designed
to be hosted for free on GitHub Pages.

## File structure

```
portfolio/
├── index.html              About page (homepage)
├── projects.html            Projects page
├── resume.html               Resume page (embeds assets/resume.pdf)
├── css/
│   └── style.css             All styling — colors, fonts, layout
├── js/
│   └── main.js                Mobile nav toggle + active-link highlighting
├── assets/
│   ├── resume.pdf              Your resume — replace this file to update
│   ├── img/                    Placeholder project + hero images (SVGs)
│   └── videos/                 Put project video files here if you use them
└── README.md
```

## 1. Put this on GitHub

1. Create a new repository on GitHub. If you want the site at
   `https://<your-username>.github.io/<repo-name>/`, name it anything.
   If you want it at `https://<your-username>.github.io/` (root URL, no repo
   name in path), name the repo exactly `<your-username>.github.io`.
2. Upload all the files in this folder to the repo, **keeping the folder
   structure** (the `css`, `js`, and `assets` folders must stay where they are
   relative to the HTML files). Easiest way:
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

Any time you push new commits to `main`, the live site updates automatically
within a minute or two.

## 3. Editing content

Everything is plain HTML — open any `.html` file in a text editor (VS Code,
GitHub's own web editor, etc.) and edit the text directly. A few common edits:

- **Change your bio / hero text:** edit the `<div class="hero-content">` block
  in `index.html`.
- **Add or edit a work experience entry:** in `index.html`, copy an entire
  `<div class="log-entry">...</div>` block and edit the dates/title/description.
- **Add or edit a project:** in `projects.html`, copy an entire
  `<div class="project-entry">...</div>` block (including the closing `</div>`)
  and edit the content. Add `class="project-entry reverse"` to alternate which
  side the image sits on.
- **Swap a project image:** drop your image file into `assets/img/` and change
  the `src="..."` on the matching `<img>` tag. Keep images under ~500KB
  each (resize/compress before uploading) so the site stays fast.
- **Embed a video instead of an image:** replace the `<img>` tag with:
  ```html
  <video controls poster="assets/img/your-poster.jpg">
    <source src="assets/videos/your-video.mp4" type="video/mp4">
  </video>
  ```
  Put the video file in `assets/videos/`. Keep video files small (compress to
  under ~15–20MB) — GitHub Pages isn't meant for heavy media hosting. For
  longer or higher-quality videos, upload to YouTube and embed an `<iframe>`
  instead so the video streams from YouTube rather than your repo.
- **Update your resume:** replace `assets/resume.pdf` with your new PDF, keeping
  the exact filename `resume.pdf` (or update the `src`/`href` in `resume.html`
  if you rename it).
- **Change colors:** every color is defined once at the top of `css/style.css`
  inside `:root { ... }`. Change a hex value there and it updates everywhere.
- **Change fonts:** the Google Fonts `<link>` tags are in the `<head>` of each
  HTML file, and the font names are set in `css/style.css` under
  `--font-display`, `--font-body`, `--font-mono`.

## 4. Notes on performance

- No frameworks, no build step, no external JS libraries — the whole site is
  a handful of KB of HTML/CSS/JS plus whatever images/videos you add.
- The placeholder project images are lightweight SVGs. Once you swap in real
  photos, compress them first (e.g. [squoosh.app](https://squoosh.app)) and
  prefer `.webp` or optimized `.jpg` over large PNGs.
- Keep any embedded videos short/compressed, or host them on YouTube/Vimeo and
  embed instead of uploading raw video files to the repo.
