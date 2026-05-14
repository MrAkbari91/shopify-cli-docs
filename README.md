# Shopify CLI Docs — Premium Developer Documentation

A world-class documentation platform for Shopify CLI, theme development, Git workflows, conflict resolution, and real-world deployment patterns.

---

## 📁 Folder Structure

```
shopify-docs/
├── index.html                  # Main HTML — all doc sections
├── assets/
│   ├── css/
│   │   ├── style.css           # Core design system (CSS variables, all components)
│   │   └── responsive.css      # Breakpoints: mobile, tablet, desktop, ultrawide, print
│   ├── js/
│   │   ├── theme.js            # Dark/light/system theme manager (load first)
│   │   ├── search.js           # Full-text search, keyboard nav, modal
│   │   └── main.js             # Core UI: scroll spy, progress bar, clipboard, animations
│   └── data/
│       └── docs.json           # Nav structure + command reference data
└── README.md
```

---

## 🚀 Setup

**No build step required.** This is pure HTML/CSS/JS.

### Option A — Open directly
```bash
open index.html     # macOS
start index.html    # Windows
```

### Option B — Local dev server (recommended for search)
```bash
# Using Python
python3 -m http.server 3000

# Using Node
npx serve .

# Using VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Then visit `http://localhost:3000`

---

## ✨ Features

| Feature | Details |
|---|---|
| **Theme system** | Light / Dark / System preference, persisted in localStorage |
| **Search** | Full-text across all sections + commands, keyboard nav (`⌘K` / `/`) |
| **Scroll spy** | Active nav item auto-highlights as you scroll |
| **Progress bar** | Reading progress indicator at top of page |
| **Copy buttons** | Every code block has a one-click copy button |
| **Cheatsheet** | Filterable command cards with click-to-copy |
| **Animations** | Scroll reveal, stagger, micro-interactions (respects prefers-reduced-motion) |
| **Mobile drawer** | Slide-out sidebar on mobile/tablet with overlay |
| **Accordions** | Collapsible debugging FAQ items |
| **Responsive** | Mobile 380px → Ultrawide 1600px+ |
| **Print styles** | Clean print layout, sidebar/topbar hidden |
| **Accessibility** | Semantic HTML, ARIA labels, keyboard navigation, focus management |

---

## 🎨 Customization

### Change accent color
In `assets/css/style.css`, update the `--accent` variable in both `[data-theme="light"]` and `[data-theme="dark"]`:

```css
[data-theme="light"] {
  --accent: #008060;        /* Shopify green */
  --accent-hover: #006e52;
  --accent-subtle: #e8f5f1;
  --accent-muted: rgba(0,128,96,0.12);
}
```

### Change fonts
Replace the Google Fonts import URL and the `font-family` in `:root` / `body`:

```css
/* In style.css — swap Figtree for any other font */
body { font-family: 'Your Font', system-ui, sans-serif; }
```

---

## 📝 Adding a New Documentation Section

1. **Add nav entry** in `index.html` inside `<nav class="sidebar-nav">`:
```html
<a class="nav-item" href="#my-new-section">
  <span class="nav-icon">🆕</span>My New Section
</a>
```

2. **Add section content** in the main content area:
```html
<section class="doc-section reveal" id="my-new-section">
  <div class="section-head">
    <div class="section-icon-box">🆕</div>
    <div class="section-meta">
      <div class="section-eyebrow">Section XX</div>
      <h2 class="section-title">My New Section</h2>
      <p class="section-desc">Brief description here.</p>
    </div>
  </div>

  <p>Your content here...</p>

  <!-- Code block example -->
  <div class="code-block">
    <div class="code-header">
      <div class="window-dots">...</div>
      <span class="code-label">Terminal</span>
      <button class="copy-btn">...</button>
    </div>
    <pre><code>your code here</code></pre>
  </div>
</section>
```

3. The **search index** and **scroll spy** auto-discover new sections — no JS changes needed.

---

## 🧩 Component Reference

### Callout boxes
```html
<div class="callout tip">    <!-- tip | warn | danger | info -->
  <span class="callout-icon">💡</span>
  <div class="callout-content">
    <div class="callout-title">Title</div>
    <div class="callout-body">Body text with <code>inline code</code>.</div>
  </div>
</div>
```

### Code block with syntax tokens
```html
<div class="code-block">
  <div class="code-header">
    <div class="window-dots"><span class="window-dot"></span>...</div>
    <span class="code-label">Terminal</span>
    <button class="copy-btn">Copy</button>
  </div>
  <pre><code>
    <span class="t-cmd">shopify theme dev</span>
    <span class="t-flag">--store</span> <span class="t-str">my-store.myshopify.com</span>
    <span class="t-cmt"># this is a comment</span>
  </code></pre>
</div>
```

**Token classes:** `t-cmd` · `t-flag` · `t-str` · `t-cmt` · `t-kw` · `t-num` · `t-op`

### Step flow
```html
<div class="step-flow stagger">
  <div class="step">
    <div class="step-num">1</div>
    <div class="step-content">
      <div class="step-title">Step title</div>
      <div class="step-desc">Description here.</div>
    </div>
  </div>
</div>
```

### Card grid
```html
<div class="card-grid stagger">
  <div class="card">
    <div class="card-icon">⚡</div>
    <div class="card-title">Title</div>
    <div class="card-desc">Description.</div>
  </div>
</div>
```

### Accordion
```html
<div class="accordion-list">
  <div class="accordion-item">
    <button class="accordion-trigger">
      <span>🔴</span>
      <span>Question text</span>
      <span class="accordion-chevron">▾</span>
    </button>
    <div class="accordion-body">Answer content here.</div>
  </div>
</div>
```

---

## ⚡ Performance Notes

- **Zero dependencies** — no frameworks, no heavy libraries
- **~90kB HTML** + ~46kB CSS + ~22kB JS (all unminified)
- **Fonts** load via Google Fonts with `display=swap` (no layout shift)
- **Animations** use `will-change: transform` implicitly via CSS transforms
- **Scroll events** use `passive: true` to avoid blocking
- **IntersectionObserver** used for scroll spy and reveal (no scroll polling)

### To further optimize:
1. Minify HTML/CSS/JS with a build tool (Vite, Parcel, or just `terser` + `cssnano`)
2. Self-host fonts to eliminate Google Fonts network round-trip
3. Add a Service Worker for offline support

---

## 🌐 Deployment

Drop into any static host — no server required:

| Host | Command |
|---|---|
| **Netlify** | Drag folder to netlify.com/drop |
| **Vercel** | `npx vercel` from project root |
| **GitHub Pages** | Push to `gh-pages` branch |
| **Cloudflare Pages** | Connect repo, build command: none |

---

## 📄 License

MIT — free to use, modify, and distribute.

---

*Built as a premium developer documentation platform. Inspired by Stripe Docs, Vercel Docs, and Linear.*
