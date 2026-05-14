/* ============================================================
   main.js — Core UI interactions for Shopify CLI Docs
   ============================================================ */

'use strict';

/* ── Utilities ────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Reading Progress Bar ─────────────────────────────────── */
const ProgressBar = (() => {
  const bar = document.getElementById('progress-bar');

  const update = () => {
    if (!bar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    bar.style.width = pct + '%';
  };

  return {
    init() {
      window.addEventListener('scroll', update, { passive: true });
      update();
    },
  };
})();

/* ── Scroll Spy — Active nav highlight ────────────────────── */
const ScrollSpy = (() => {
  const sectionNames = {};
  let observer = null;

  const buildNameMap = () => {
    $$('.doc-section[id]').forEach((sec) => {
      const titleEl = sec.querySelector('.section-title');
      sectionNames[sec.id] = titleEl?.textContent.trim() || sec.id;
    });
  };

  const setActive = (id) => {
    $$('.nav-item').forEach((n) => n.classList.remove('active'));
    const link = $(`.nav-item[href="#${id}"]`);
    if (link) {
      link.classList.add('active');
      // Auto-scroll nav to keep active item visible
      link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    // Update breadcrumb
    const crumb = document.getElementById('bcCurrent');
    if (crumb) crumb.textContent = sectionNames[id] || id;
  };

  return {
    init() {
      buildNameMap();

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(e.target.id);
          });
        },
        {
          rootMargin: `-${56 + 40}px 0px -60% 0px`,
          threshold: 0,
        }
      );

      $$('.doc-section[id]').forEach((s) => observer.observe(s));
    },
  };
})();

/* ── Navigation — click to scroll ────────────────────────── */
const Navigation = (() => {
  const closeMobileNav = () => {
    $('.sidebar')?.classList.remove('open');
    $('.mob-overlay')?.classList.remove('show');
    document.body.style.overflow = '';
  };

  const openMobileNav = () => {
    $('.sidebar')?.classList.add('open');
    $('.mob-overlay')?.classList.add('show');
    document.body.style.overflow = 'hidden';
  };

  return {
    init() {
      // Handle all nav item clicks
      $$('.nav-item[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const id = link.getAttribute('href').slice(1);
          const target = document.getElementById(id);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          if (window.innerWidth < 1024) closeMobileNav();
        });
      });

      // Mobile menu toggle
      document.getElementById('mobMenuBtn')?.addEventListener('click', openMobileNav);

      // Overlay close
      $('.mob-overlay')?.addEventListener('click', closeMobileNav);

      // Escape key closes mobile nav
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileNav();
      });
    },
    closeMobileNav,
  };
})();

/* ── Copy to Clipboard ────────────────────────────────────── */
const Clipboard = (() => {
  const toast = document.getElementById('toast');
  let toastTimer = null;

  const showToast = (msg = '✓ Copied to clipboard') => {
    if (!toast) return;
    toast.querySelector('.toast-text').textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    }
  };

  return {
    showToast,

    // Copy code block
    async copyBlock(btn) {
      const block = btn.closest('.code-block');
      const pre = block?.querySelector('pre');
      if (!pre) return;
      const text = pre.textContent.trim();
      const ok = await copy(text);
      if (ok) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        btn.classList.add('copied');
        showToast();
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.classList.remove('copied');
        }, 2000);
      }
    },

    // Copy cheatsheet card
    async copyCheat(card, cmd) {
      const ok = await copy(cmd);
      if (ok) {
        card.classList.add('copied');
        showToast(`✓ Copied: ${cmd.slice(0, 30)}${cmd.length > 30 ? '…' : ''}`);
        setTimeout(() => card.classList.remove('copied'), 1400);
      }
    },

    init() {
      // Delegate copy-btn clicks
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.copy-btn');
        if (btn) this.copyBlock(btn);
      });
    },
  };
})();

/* ── Accordions ───────────────────────────────────────────── */
const Accordion = (() => ({
  init() {
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.accordion-trigger');
      if (!trigger) return;
      const item = trigger.closest('.accordion-item');
      if (!item) return;
      item.classList.toggle('open');
    });
  },
}))();

/* ── Scroll Reveal Animations ─────────────────────────────── */
const RevealAnim = (() => {
  let observer = null;

  return {
    init() {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              observer.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      $$('.reveal, .stagger').forEach((el) => observer.observe(el));
    },
  };
})();

/* ── Command Filter (Cheatsheet) ──────────────────────────── */
const CommandFilter = (() => ({
  init() {
    const tabs = $$('.filter-tab');
    const cards = $$('.cheat-card');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const cat = tab.dataset.filter;
        cards.forEach((card) => {
          const match = cat === 'all' || card.dataset.cat === cat;
          card.style.display = match ? '' : 'none';
          // Animate in visible cards
          if (match) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.96)';
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
              card.style.opacity = '1';
              card.style.transform = '';
            });
          }
        });
      });
    });
  },
}))();

/* ── Topbar scroll shadow ─────────────────────────────────── */
const TopbarEffect = (() => ({
  init() {
    const topbar = $('.topbar');
    if (!topbar) return;
    window.addEventListener(
      'scroll',
      () => {
        topbar.style.boxShadow = window.scrollY > 10 ? 'var(--shadow)' : '';
      },
      { passive: true }
    );
  },
}))();

/* ── Keyboard shortcut display update ────────────────────── */
const KeyboardShortcuts = (() => ({
  init() {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    $$('.kb-cmd').forEach((el) => {
      el.textContent = isMac ? '⌘' : 'Ctrl';
    });
  },
}))();

/* ── Cheatsheet cards ─────────────────────────────────────── */
const Cheatsheet = (() => ({
  init() {
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.cheat-card');
      if (!card) return;
      const cmd = card.dataset.cmd;
      if (cmd) Clipboard.copyCheat(card, cmd);
    });
  },
}))();

/* ── Main Init ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  ProgressBar.init();
  ScrollSpy.init();
  Navigation.init();
  Clipboard.init();
  Accordion.init();
  RevealAnim.init();
  CommandFilter.init();
  TopbarEffect.init();
  KeyboardShortcuts.init();
  Cheatsheet.init();
  SearchEngine.init();
});

// Expose globally for inline onclick handlers
window.SearchEngine = SearchEngine;
window.Clipboard = Clipboard;
