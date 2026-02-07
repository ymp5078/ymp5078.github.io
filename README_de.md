# ymp5078.github.io

Akademische Homepage mit Jekyll im Windows 98 Desktop-Stil (Emu 98 Theme).

Basierend auf dem [Minimal Light](https://github.com/yaoyao-liu/minimal-light) Theme von Yaoyao Liu.

```
        oo
       ████
       █◐█        Emu 98
        ██
       ██
     ▓▓▓▓▓▓
    ▓▓▓▓▓▓▓▓
   ▓▓▓▓▓▓▓▓▓▓     Dein Desktop-Begleiter.
   ▓▓▓▓▓▓▓▓▓▓     Laeuft auf der Taskleiste, macht Haufen,
    ▓▓▓▓▓▓▓▓▓     zuechtet Blumen, reagiert auf Klicks.
      █ █
       █  █
      ██ ██
```

## Funktionen

- Windows 98 Desktop mit Startbildschirm, Explorer-Fenster, Taskleiste und Startmenue
- Dunkelmodus (umschaltbar im Startmenue, folgt Systemeinstellung)
- Emu Desktop-Haustier mit interaktiven Verhaltensweisen
- Haufen-Lebenszyklus: Haufen > flach > Gras/verschwinden > Blume/trockenes Gras > trockene Blume > trockener Stiel > trockenes Gras > verschwinden
- Responsives Layout fuer Mobil und Desktop
- Publikationsliste mit Vorschaubildern und Link-Buttons
- Automatisches Deployment via Jekyll + GitHub Pages

## Vorlage verwenden

### 1. Forken und umbenennen

Forke dieses Repository und benenne es in `your-username.github.io` um. Aktiviere GitHub Pages in den Repository-Einstellungen.

### 2. Persoenliche Daten in `_config.yml` bearbeiten

```yaml
title: Dein Name
position: Deine Position
affiliation: Deine Zugehoerigkeit
education: "Dein Abschluss, Deine Universitaet"
email: du (at) beispiel (dot) de

google_scholar: https://scholar.google.com/citations?user=DEINE_ID
github_link: https://github.com/dein-benutzername
linkedin: https://www.linkedin.com/in/deine-id/

avatar: ./assets/img/avatar.png
```

### 3. Biografie in `index.md` schreiben

```markdown
---
layout: homepage
---

## About Me

Schreibe hier deine Biografie. Unterstuetzt Markdown und HTML.

## Research Interests

- **Thema A:** Beschreibung
- **Thema B:** Beschreibung
```

### 4. Publikationen in `_data/publications.yml` hinzufuegen

```yaml
- title: "Titel deiner Arbeit"
  authors: "Autor A, <strong>Dein Name</strong>, Autor B"
  venue: "Konferenz oder Zeitschrift, 2024"
  paper_url: "https://arxiv.org/abs/..."
  teaser: paper_teaser.png
```

Vorschaubilder in `assets/img/` ablegen.

### 5. Weitere Abschnitte aktualisieren

- `_includes/news.md` — Neuigkeiten und Ankuendigungen
- `_includes/services.md` — Gutachten, Komitees usw.
- `assets/img/` — Avatar und Favicon ersetzen

### 6. Bereitstellen

Pushe zu GitHub und deine Seite ist unter `https://dein-benutzername.github.io` erreichbar.

## Lokale Entwicklung

Installiere [Ruby](https://www.ruby-lang.org/en/) und [Jekyll](https://jekyllrb.com/), dann:

```bash
bundle install
bundle exec jekyll serve --livereload
```

Vorschau unter [http://localhost:4000](http://localhost:4000).

## Lizenz

[Creative Commons Zero v1.0 Universal](LICENSE)

## Danksagung

- [yaoyao-liu/minimal-light](https://github.com/yaoyao-liu/minimal-light) - Basis-Theme
- [pages-themes/minimal](https://github.com/pages-themes/minimal)
- [orderedlist/minimal](https://github.com/orderedlist/minimal)
- [al-folio](https://github.com/alshedivat/al-folio)