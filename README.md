# DroidDeck

A static, zero-build single-page application for Android interview preparation.
No frameworks, no bundlers, no server — just vanilla HTML, CSS and JavaScript.

Open `index.html` in a browser and it runs.

## What's inside

- **14 topics**, hundreds of curated interview questions with detailed answers
- **Client-side fuzzy search** across every question, answer and tag
- **Hash-based routing** — every topic and subsection is linkable
- **Dark / light themes** with system preference detection and persistence
- **Syntax highlighting** for Kotlin, Java and XML (no external highlighter)
- **SVG diagrams** — flowcharts, animated step sequences and sequence diagrams
- **Three.js particle background** and GSAP scroll reveals

## Structure

```
/
├── index.html
├── css/
│   ├── themes.css        # design tokens for dark/light
│   ├── styles.css        # layout, responsive, accessibility
│   ├── components.css    # UI component styles
│   └── animations.css    # keyframes, transitions, reduced-motion
├── js/
│   ├── code-highlight.js # syntax highlighting (Kotlin, Java, XML)
│   ├── diagrams.js       # SVG diagram renderer
│   ├── theme.js          # dark/light toggle + persistence
│   ├── three-bg.js       # Three.js particle mesh background
│   ├── navigation.js     # sidebar, hash routing, mobile menu
│   ├── search.js         # client-side fuzzy search
│   └── app.js            # main controller and rendering
└── data/                 # one file per topic + index.js
```

## Running locally

Any static file server works, or simply open the file directly:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Adding a topic

1. Create `data/<topic-id>.js` exporting a global `const <name>Data = { ... }`.
2. Add a `<script>` tag in `index.html` **before** `data/index.js`.
3. Append the variable to the `topics` array in `data/index.js`.
4. Add an emoji to `topicIcons` in `js/navigation.js`.
