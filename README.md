# Cherif — AI & Full‑Stack Developer Portfolio

A fast, modern portfolio optimized for GitHub Pages or Netlify. Dark (NVIDIA‑inspired) default with optional light mode.

## Structure

- `index.html` — Single‑page site with all sections (Hero, About, Skills, Projects, CV, Vision, Contact)
- `assets/css/styles.css` — Custom responsive styling, theme variables, animations
- `assets/js/main.js` — Theme toggle, reveal animations, skill progress, form handling
- `assets/images/placeholders/*` — Temporary images; replace with your real screenshots/photos
- `assets/Cherif-CV.pdf` — CV placeholder; replace with your own

## Customize

1. Replace placeholder images in `assets/images/placeholders/` with real assets.
2. Update social links in the Contact section of `index.html`.
3. Replace `assets/Cherif-CV.pdf` with your real CV file.
4. Edit copy in the About / Vision sections directly in `index.html`.

## Contact Form

- Netlify: Works out‑of‑the‑box (uses `data-netlify` + POST `/` with `form-name`).
- GitHub Pages: No backend. The JavaScript reports success locally; add a service like Formspree or move to Netlify for real submissions.

## Deploy

### GitHub Pages
- Commit and push this repository.
- In GitHub repo settings → Pages → set the branch to `main` (root).
- Your site will be available at `https://<username>.github.io/<repo>/`.

### Netlify
- Drag‑and‑drop the folder into app.netlify.com (or connect your repo).
- Ensure Builds are enabled for forms (static form detection). Submissions will appear in the Netlify dashboard.

## Performance & Accessibility
- Lightweight: no heavy JS frameworks.
- Images `loading="lazy"`, CSS only animations for efficiency, semantic HTML, focus states.

## License
You own your content. Code is provided as starter template under MIT.
