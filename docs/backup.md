# Project Backup — Android Interview Questions SPA

> This file contains everything needed to regenerate the project from scratch (excluding the `data/` directory, which is in `data-backup.md`).

## Overview

Static single-page application for Android interview questions. No build tools, no frameworks, no server. Runs entirely in-browser with vanilla JS, CSS, and HTML. Content rendered client-side from JS data files.

- **Fonts**: Inter (sans), JetBrains Mono (mono) — Google Fonts
- **External libs**: Three.js r128, GSAP 3.12.5, GSAP ScrollTrigger 3.12.5 (CDN)
- **Theme**: 21st.dev-inspired dark/light with purple accent (#8b5cf6 dark, #7c3aed light)

---

## Directory Structure

```
/
├── index.html
├── css/
│   ├── themes.css       # CSS custom properties for dark/light
│   ├── styles.css       # Layout, responsive, accessibility
│   ├── components.css   # UI component styles
│   └── animations.css   # Keyframes, transitions, reduced-motion
├── js/
│   ├── code-highlight.js # Syntax highlighting (Kotlin, Java, XML)
│   ├── diagrams.js       # SVG diagram renderer (flowchart, animation, sequence)
│   ├── theme.js          # Dark/light toggle + localStorage persistence
│   ├── three-bg.js       # Three.js particle mesh background
│   ├── navigation.js     # Sidebar, hash routing, mobile menu
│   ├── search.js         # Client-side fuzzy search with debounce
│   └── app.js            # Main controller, rendering, lazy loading
├── data/                 # See data-backup.md
│   ├── [14 topic files]
│   └── index.js
└── docs/                 # Architecture/Features/Codebase docs
```

---



## index.html

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Comprehensive Android Interview Questions and Answers - Kotlin, Coroutines, Jetpack Compose, Architecture, System Design and more">
    <title>Android Interview Questions & Answers</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/themes.css">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/animations.css">
</head>
<body>
    <canvas id="bgCanvas" class="bg-canvas"></canvas>
    <a href="#mainContent" class="skip-link">Skip to main content</a>

    <header class="header" role="banner">
        <button class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle navigation menu" aria-expanded="false">
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        </button>
        <div class="header-brand">
            <div class="brand-logo">
                <span class="logo-icon">🤖</span>
                <h1 class="header-title">Android Interview</h1>
            </div>
        </div>
        <div class="header-actions">
            <div class="search-container" role="search">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="search" id="searchInput" class="search-input" placeholder="Search questions..." aria-label="Search questions">
                <kbd class="search-shortcut">/</kbd>
                <div id="searchResults" class="search-results" role="listbox" hidden></div>
            </div>
            <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
                <span class="theme-icon-light">☀️</span>
                <span class="theme-icon-dark">🌙</span>
            </button>
        </div>
    </header>

    <aside class="sidebar" id="sidebar" role="navigation" aria-label="Topic navigation">
        <nav class="sidebar-nav" id="sidebarNav"></nav>
    </aside>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <main class="main-content" id="mainContent" role="main" aria-live="polite">
        <div class="topic-container" id="topicContainer"></div>
    </main>

    <button class="back-to-top" id="backToTop" aria-label="Back to top" hidden>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 15l-6-6-6 6"/>
        </svg>
    </button>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

    <!-- Data Layer (order matters) -->
    <script src="data/kotlin-coroutines.js"></script>
    <script src="data/kotlin-flow-api.js"></script>
    <script src="data/kotlin.js"></script>
    <script src="data/android.js"></script>
    <script src="data/android-libraries.js"></script>
    <script src="data/android-architecture.js"></script>
    <script src="data/design-pattern.js"></script>
    <script src="data/android-system-design.js"></script>
    <script src="data/android-unit-testing.js"></script>
    <script src="data/android-tools-technologies.js"></script>
    <script src="data/jetpack-compose.js"></script>
    <script src="data/java.js"></script>
    <script src="data/other-topics.js"></script>
    <script src="data/data-structures-algorithms.js"></script>
    <script src="data/index.js"></script>

    <!-- App Logic (order matters) -->
    <script src="js/code-highlight.js"></script>
    <script src="js/diagrams.js"></script>
    <script src="js/theme.js"></script>
    <script src="js/three-bg.js"></script>
    <script src="js/navigation.js"></script>
    <script src="js/search.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

--- 


## CSS Files

### css/themes.css

Design tokens using CSS custom properties on `[data-theme]` selector.

```css
:root {
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] {
    --bg-primary: #0a0a0f;
    --bg-secondary: #111118;
    --bg-header: rgba(17, 17, 24, 0.8);
    --bg-sidebar: rgba(17, 17, 24, 0.9);
    --bg-card: rgba(22, 22, 32, 0.6);
    --bg-card-hover: rgba(30, 30, 45, 0.8);
    --bg-input: rgba(255, 255, 255, 0.05);
    --bg-hover: rgba(255, 255, 255, 0.08);
    --bg-code: rgba(0, 0, 0, 0.4);
    --bg-code-inline: rgba(139, 92, 246, 0.15);
    --bg-glass: rgba(255, 255, 255, 0.03);
    --bg-key-topics: rgba(139, 92, 246, 0.08);
    --text-primary: #f0f0f5;
    --text-secondary: #a0a0b5;
    --text-muted: #6b6b80;
    --text-code: #e0e0f0;
    --border-color: rgba(255, 255, 255, 0.08);
    --border-subtle: rgba(255, 255, 255, 0.04);
    --accent-color: #8b5cf6;
    --accent-hover: #a78bfa;
    --accent-light: rgba(139, 92, 246, 0.15);
    --accent-glow: rgba(139, 92, 246, 0.4);
    --gradient-accent: linear-gradient(135deg, #8b5cf6, #6366f1);
    --gradient-card: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.02));
    --gradient-shine: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%);
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
    --shadow-glow: 0 0 30px rgba(139, 92, 246, 0.15);
    --success-color: #10b981;
    --warning-color: #f59e0b;
    --error-color: #ef4444;
    --keyword-color: #c084fc;
    --string-color: #34d399;
    --comment-color: #6b7280;
    --number-color: #60a5fa;
    --annotation-color: #fbbf24;
    --tag-color: #f87171;
    --attribute-color: #a78bfa;
    --diagram-bg: rgba(139, 92, 246, 0.05);
    --diagram-border: #6366f1;
    --diagram-node: rgba(139, 92, 246, 0.2);
    --diagram-text: #a78bfa;
    --diagram-arrow: #8b5cf6;
}

[data-theme="light"] {
    --bg-primary: #fafafa;
    --bg-secondary: #ffffff;
    --bg-header: rgba(255, 255, 255, 0.85);
    --bg-sidebar: rgba(255, 255, 255, 0.92);
    --bg-card: rgba(255, 255, 255, 0.8);
    --bg-card-hover: rgba(255, 255, 255, 0.95);
    --bg-input: rgba(0, 0, 0, 0.04);
    --bg-hover: rgba(0, 0, 0, 0.04);
    --bg-code: rgba(0, 0, 0, 0.03);
    --bg-code-inline: rgba(139, 92, 246, 0.1);
    --bg-glass: rgba(255, 255, 255, 0.6);
    --bg-key-topics: rgba(139, 92, 246, 0.06);
    --text-primary: #111118;
    --text-secondary: #555566;
    --text-muted: #888899;
    --text-code: #1a1a2e;
    --border-color: rgba(0, 0, 0, 0.08);
    --border-subtle: rgba(0, 0, 0, 0.04);
    --accent-color: #7c3aed;
    --accent-hover: #6d28d9;
    --accent-light: rgba(124, 58, 237, 0.1);
    --accent-glow: rgba(124, 58, 237, 0.2);
    --gradient-accent: linear-gradient(135deg, #7c3aed, #4f46e5);
    --gradient-card: linear-gradient(135deg, rgba(124, 58, 237, 0.03), rgba(79, 70, 229, 0.01));
    --gradient-shine: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%);
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
    --shadow-glow: 0 0 30px rgba(124, 58, 237, 0.08);
    --success-color: #059669;
    --warning-color: #d97706;
    --error-color: #dc2626;
    --keyword-color: #7c3aed;
    --string-color: #059669;
    --comment-color: #6b7280;
    --number-color: #2563eb;
    --annotation-color: #d97706;
    --tag-color: #dc2626;
    --attribute-color: #7c3aed;
    --diagram-bg: rgba(124, 58, 237, 0.04);
    --diagram-border: #7c3aed;
    --diagram-node: rgba(124, 58, 237, 0.1);
    --diagram-text: #4f46e5;
    --diagram-arrow: #7c3aed;
}

/* Scrollbar */
* { scrollbar-width: thin; scrollbar-color: var(--text-muted) transparent; }
*::-webkit-scrollbar { width: 6px; height: 6px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb { background-color: var(--border-color); border-radius: 3px; }
*::-webkit-scrollbar-thumb:hover { background-color: var(--text-muted); }
```
 

### css/styles.css

Layout system: fixed header (64px), fixed sidebar (280px), content offset with margin-left.

Key structure:
- Reset (`*, *::before, *::after { box-sizing: border-box; margin:0; padding:0 }`)
- `.bg-canvas` — fixed fullscreen, z-index:0, pointer-events:none, opacity:0.6
- `.skip-link` — absolute positioned, shown on focus
- `.header` — fixed top, 64px height, backdrop-filter blur, flex layout, z-index:1000
- `.header-brand` / `.brand-logo` — flex with gap, gradient text on title
- `.search-container` — relative, search icon absolute left, kbd shortcut absolute right
- `.search-input` — 260px width, expands to 320px on focus, rounded, border transitions
- `.search-results` — absolute dropdown below search, max-height 400px, overflow-y auto
- `.theme-toggle` — 38px circle button
- `.hamburger-btn` — hidden by default, shown at ≤768px
- `.sidebar` — fixed, top:64px, left:0, bottom:0, width:280px, backdrop-filter, z-index:900
- `.sidebar-overlay` — hidden, fixed inset:0, dark backdrop on mobile
- `.main-content` — margin-left:280px, margin-top:64px, padding 32px 40px
- `.topic-container` — max-width:860px, margin:0 auto
- `.back-to-top` — fixed bottom-right, 44px circle, z-index:800

Responsive breakpoints:
- ≤1024px: sidebar 260px, search narrows
- ≤768px: hamburger visible, sidebar transforms off-screen, `.sidebar.open` shows it, overlay activates, main-content margin-left:0
- ≤480px: tighter padding, smaller search

```css
/* Key responsive rules */
@media (max-width: 768px) {
    .hamburger-btn { display: flex; }
    .sidebar { transform: translateX(-100%); width: 300px; z-index: 1001; }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay.active { display: block; }
    .main-content { margin-left: 0; padding: 24px 16px; }
}
```

### css/components.css

Components styled with BEM-ish naming:

- `.nav-item` — sidebar links with left accent bar on active, emoji icon + text
- `.nav-item-group` / `.nav-item-parent` / `.nav-chevron` — expandable topic groups
- `.nav-subsections` / `.nav-subsection` — indented subsection links
- `.topic-header` / `.topic-title` / `.topic-stats` — page header with question count
- `.key-topics-section` / `.key-topic-pill` — accent-bg block with pill badges
- `.question-card` — glass-morphism card with gradient shine on hover, glow shadow
- `.question-header` — flex with number circle + question text + chevron
- `.answer-body` — max-height:0 collapsed, max-height:5000px expanded with opacity transition
- `.answer-content` — styled HTML (p, ul, ol, li, code, strong)
- `.reference-links` / `.reference-link` — pill-style links above answer
- `.code-block` — dark bg, header with title+lang, collapsible body
- Syntax classes: `.keyword`, `.string`, `.comment`, `.number`, `.annotation`, `.tag`, `.attribute`
- `.diagram-container` / `.diagram-title` — themed SVG container
- `.search-result-item` — dropdown items with topic label + question text
- `.subsection-header` — section dividers in content
- Accessibility: `:focus-visible` outline, `prefers-reduced-motion` media query

### css/animations.css

- `.question-card` starts opacity:0 translateY(20px), `.revealed` restores
- Diagram animations: `@keyframes drawLine` (stroke-dashoffset), `@keyframes fadeIn`
- `.diagram-animated .diagram-line` — stroke-dasharray:1000, drawLine 2s
- `.diagram-animated .diagram-node` — staggered fadeIn (nth-child delays 0.2s increments)
- `.flow-arrow` — infinite stroke-dash animation
- `.sidebar` — transition transform 0.3s
- `.search-results` — slideDown keyframe
- Theme transition on body, header, sidebar, cards, code-block
- `.skeleton` — shimmer gradient animation
- `.hamburger-btn.active` — line transforms to X
- `.topic-container.topic-transitioning` — opacity:0
- `.nav-item.active` — glowPulse keyframe (3s infinite)
- `@keyframes cardReveal` — GSAP fallback

--- 



## JavaScript Modules

### js/theme.js

```javascript
function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
    const toggle = document.getElementById('themeToggle');
    if (toggle) toggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
}
```

### js/code-highlight.js

Keyword-based syntax highlighter using placeholder approach to avoid nested replacements.

**Algorithm:**
1. Escape HTML (`&`, `<`, `>`, `"`)
2. Dispatch by language (kotlin/java/xml)
3. For kotlin/java: replace in order using `\x00PH{idx}\x00` placeholders:
   - Multi-line comments → `<span class="comment">`
   - Single-line comments
   - Strings (using `&quot;` entities)
   - Annotations (`@word`)
   - Numbers
   - Keywords (from keyword list)
4. Restore all placeholders
5. For XML: mark comments, tags, attributes, strings with placeholder pairs then replace

**Keyword lists:**
- KOTLIN_KEYWORDS: ~50 keywords including coroutine-specific (launch, async, suspend, flow, emit, collect, etc.)
- JAVA_KEYWORDS: ~40 keywords including primitives
-  


### js/diagrams.js

SVG-based renderer with 3 diagram types:

**`renderDiagram(container, config, type)`** — dispatcher

**`renderFlowchart(container, config)`:**
- config: `{ nodes: [{label, type}], connections: [{from, to}], columns, title }`
- Node types: "decision" (diamond), "terminal" (pill), default (rounded rect)
- Calculates grid layout (nodeWidth=160, nodeHeight=50, gaps)
- Draws connections as lines with arrowhead markers
- Draws nodes with text

**`renderAnimatedDiagram(container, config)`:**
- config: `{ steps: string[], title }`
- Vertical step boxes (300×40) connected by arrows
- Sequential numbered steps

**`renderSequenceDiagram(container, config)`:**
- config: `{ actors: string[], messages: [{from, to, label, dashed?}], title }`
- Actor boxes at top with dashed lifelines
- Horizontal arrows between actor lifelines

All use CSS variables for theming (`--diagram-node`, `--diagram-border`, `--diagram-text`, `--diagram-arrow`).

### js/three-bg.js

IIFE creating a Three.js animated background:
- 80 particles floating in 3D space (20×20×10 bounds)
- Particles rendered as Points with accent color
- Connection lines between particles within distance 3.5
- Lines update every 3 frames for performance
- Subtle camera sway using sin/cos
- Responds to theme changes via MutationObserver on `data-theme`
- Reduces animation when page hidden (visibilitychange)
- Color: dark=0x8b5cf6, light=0x7c3aed

### js/navigation.js

```javascript
const topicIcons = {
    'kotlin-coroutines': '⚡', 'kotlin-flow-api': '🌊', 'kotlin': '🟣',
    'android': '🤖', 'android-libraries': '📚', 'android-architecture': '🏗️',
    'design-pattern': '🎨', 'android-system-design': '📐',
    'android-unit-testing': '🧪', 'android-tools-technologies': '🔧',
    'jetpack-compose': '🧩', 'java': '☕', 'other-topics': '📋',
    'data-structures-algorithms': '🔢'
};
```

**Functions:**
- `renderSidebar(topicsList)` — iterates topics, creates nav-item or nav-item-group (if subsections)
- `toggleSubsections(topicId)` — show/hide subsection list, rotate chevron
- `setActiveTopic(topicId, subsectionId)` — highlight active, auto-expand group
- `handleRouteChange()` — parse hash, call renderTopic
- `generateHash(topicId, subsectionId)` — `#topic/sub` or `#topic`
- `parseHash(hash)` — split on `/`, default to first topic
- `toggleMobileMenu()` / `closeMobileMenu()` — sidebar.open, overlay.active, hamburger.active

**Event setup** (DOMContentLoaded):
- Hamburger click → toggleMobileMenu
- Overlay click → closeMobileMenu
- `hashchange` → handleRouteChange 

 

### js/search.js

- `searchIndex` array built from all topics (flattened questions with topicId, topicTitle, subsectionId, subsectionTitle, question, tags, searchText)
- `setupSearch(topicsList)` — builds index, attaches input/focus/click-outside/escape listeners
- `search(query)` — splits into terms, scores each index entry (all terms must match, question text boosted ×2), returns top 20 sorted by score
- `handleSearchInput(event)` — 200ms debounce, calls search + renderSearchResults
- `renderSearchResults(results, query)` — builds dropdown items with click handlers to navigate
- `showSearchResults()` / `hideSearchResults()` — toggle hidden attribute

### js/app.js

**`initApp()`** (on DOMContentLoaded):
1. `initTheme()`
2. `renderSidebar(topics)`
3. `setupSearch(topics)`
4. `setupEventListeners()`
5. `setupLazyLoading()`
6. `handleRouteChange()`

**`renderTopic(topicId, scrollToSubsection)`:**
1. Find topic in `topics` array (fallback to first)
2. Add `.topic-transitioning` class
3. After 150ms timeout: clear container, build:
   - Topic header (title + stats)
   - Key topics section (pill badges)
   - If subsections: group questions by subsection with subsection headers
   - If no subsections: flat numbered list
4. Remove transition class
5. Update active nav + URL hash (replaceState)
6. Scroll to subsection or top

**`renderQuestionCard(question, number)`:**
- Card div with data-id
- Header: number badge + question text + expand chevron (tabindex=0, role=button)
- Body (aria-hidden): reference links + answer HTML + code blocks + diagram container
- Click/keyboard toggles expand/collapse
- Diagram rendered after 100ms setTimeout

**`renderKeyTopics(keyTopics)`** — grid of pill badges
**`renderReferenceLinks(links)`** — pill links with 📎 prefix
**`renderCodeBlock(snippet)`** — highlighted code in collapsible block
**`toggleAnswer(card)`** — toggle .expanded, aria attributes

**`setupEventListeners()`:**
- Back-to-top: show after 1vh scroll, smooth scroll top on click
- Scroll hash update (300ms debounce) via `updateHashFromScroll()`
- Keyboard `/` → focus search

**`setupLazyLoading()`:**
- MutationObserver on topicContainer
- New `.question-card` nodes get GSAP staggered reveal (opacity, y, scale)
- Fallback: add `.revealed` class directly
- Topic header + key topics also animate in

**`updateHashFromScroll()`:**
- Finds subsection headers above viewport midpoint
- Updates hash via replaceState without triggering hashchange

---



## Data Schema

### Topic Object
```javascript
{
    id: "topic-id",              // URL-friendly identifier
    title: "Display Title",
    subsections: [               // null if no subsections
        { id: "sub-id", title: "Sub Title", keyTopics: ["..."] }
    ],
    keyTopics: ["Topic 1", "Topic 2"],
    questions: [/* Question objects */]
}
```

### Question Object
```javascript
{
    id: "question-id",
    question: "Question text?",
    answer: "<p>HTML answer</p>",
    referenceLinks: [{ title: "Link", url: "https://..." }],
    tags: ["tag1", "tag2"],
    hasDiagram: false,
    diagramType: "flowchart" | "animation" | "sequence" | null,
    diagramConfig: { /* type-specific config */ } | null,
    codeSnippets: [{ language: "kotlin", title: "Title", code: "..." }],
    subsection: "sub-id"  // optional, links to subsection
}
```

### data/index.js
```javascript
const topics = [
    kotlinCoroutinesData, kotlinFlowApiData, kotlinData, androidData,
    androidLibrariesData, androidArchitectureData, designPatternData,
    androidSystemDesignData, androidUnitTestingData, androidToolsTechnologiesData,
    jetpackComposeData, javaData, otherTopicsData, dataStructuresAlgorithmsData
];
```

--- 


## Key Patterns

### Adding a New Topic
1. Create `data/<topic-id>.js` with `const <varName>Data = { ... };`
2. Add `<script>` tag in index.html before `data/index.js`
3. Add variable to `topics` array in `data/index.js`
4. Add icon mapping in `topicIcons` in `js/navigation.js`

### Module Communication
All modules use global functions. Load order in HTML determines availability. `app.js` must be last.

### Routing
Hash-based: `#topic-id` or `#topic-id/subsection-id`. `hashchange` event triggers re-render.

### State
- URL hash = current view (source of truth)
- localStorage = theme preference
- Everything else is derived/transient

