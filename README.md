# ymp5078.github.io

Personal academic homepage built with Jekyll and styled as a Windows 98 desktop (Emu 98 theme).

Based on the [Minimal Light](https://github.com/yaoyao-liu/minimal-light) theme by Yaoyao Liu.

```
        oo
       ████
       █◐█        Emu 98
        ██
       ██
     ▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓     Your desktop companion.
   ▓▓▓▓▓▓▓▓▓▓     Walks on the taskbar, poops,
    ▓▓▓▓▓▓▓▓▓     grows flowers, reacts to clicks.
      █ █
       █  █
      ██ ██
```

## Features

- Windows 98 themed desktop with boot screen, Explorer window, taskbar, and start menu
- Dark mode support (toggle in start menu, respects system preference)
- Emu desktop pet that walks on the taskbar with interactive behaviors
- Poop lifecycle: poop > flat > grass/vanish > flower/dry grass > dry flower > dried stem > dry grass > vanish
- Responsive layout for mobile and desktop
- Publication list with teaser images and link buttons
- Jekyll + GitHub Pages auto-deployment

## Use This Template

### 1. Fork and rename

Fork this repository and rename it to `your-username.github.io`. Enable GitHub Pages in the repository settings.

### 2. Edit your info in `_config.yml`

```yaml
title: Your Name
position: Your Position
affiliation: Your Affiliation
education: "Your Degree, Your University"
email: you (at) example (dot) com

google_scholar: https://scholar.google.com/citations?user=YOUR_ID
github_link: https://github.com/your-username
linkedin: https://www.linkedin.com/in/your-id/

avatar: ./assets/img/avatar.png
```

### 3. Write your bio in `index.md`

```markdown
---
layout: homepage
---

## About Me

Write your bio here. Supports Markdown and HTML.

## Research Interests

- **Topic A:** description
- **Topic B:** description
```

### 4. Add your publications in `_data/publications.yml`

```yaml
- title: "Your Paper Title"
  authors: "Author A, <strong>Your Name</strong>, Author B"
  venue: "Conference or Journal Name, 2024"
  paper_url: "https://arxiv.org/abs/..."
  teaser: paper_teaser.png
```

Place teaser images in `assets/img/`.

### 5. Update other sections

- `_includes/news.md` — Your news and announcements
- `_includes/services.md` — Reviewing, committees, etc.
- `assets/img/` — Replace avatar and favicon images

### 6. Deploy

Push to GitHub and your site will be live at `https://your-username.github.io`.

## Local Development

Install [Ruby](https://www.ruby-lang.org/en/) and [Jekyll](https://jekyllrb.com/), then:

```bash
bundle install
bundle exec jekyll serve --livereload
```

View at [http://localhost:4000](http://localhost:4000).

## License

[Creative Commons Zero v1.0 Universal](LICENSE)

## Acknowledgements

- [yaoyao-liu/minimal-light](https://github.com/yaoyao-liu/minimal-light) - Base theme
- [pages-themes/minimal](https://github.com/pages-themes/minimal)
- [orderedlist/minimal](https://github.com/orderedlist/minimal)
- [al-folio](https://github.com/alshedivat/al-folio)
