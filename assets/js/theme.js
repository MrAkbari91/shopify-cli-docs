/* ============================================================
   theme.js — Premium theme system with system preference detection
   ============================================================ */

const ThemeManager = (() => {
  const STORAGE_KEY = 'shopify-docs-theme';
  const HTML = document.documentElement;

  // Detect system preference
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  const getSystem = () => (mq.matches ? 'dark' : 'light');

  // Get active theme: stored > system
  const getActive = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || 'system';
  };

  // Resolve 'system' → actual 'dark'/'light'
  const resolve = (pref) => (pref === 'system' ? getSystem() : pref);

  // Apply theme to document + update toggle buttons
  const apply = (pref) => {
    const theme = resolve(pref);
    // Suppress transition flicker on initial load
    HTML.setAttribute('data-theme', theme);
    updateUI(pref);
  };

  // Update toggle button states
  const updateUI = (pref) => {
    document.querySelectorAll('.theme-opt').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.theme === pref);
    });
  };

  // Set theme preference, persist, apply
  const set = (pref) => {
    localStorage.setItem(STORAGE_KEY, pref);
    apply(pref);
  };

  // Init: apply saved preference, hook system change listener
  const init = () => {
    const pref = getActive();
    apply(pref);

    // Listen for OS theme changes when on 'system'
    mq.addEventListener('change', () => {
      if (getActive() === 'system') apply('system');
    });

    // Bind toggle buttons
    document.querySelectorAll('.theme-opt').forEach((btn) => {
      btn.addEventListener('click', () => set(btn.dataset.theme));
    });
  };

  return { init, set, getActive, resolve };
})();

// Run before DOMContentLoaded to prevent flash
ThemeManager.init();
