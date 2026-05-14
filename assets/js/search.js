/* ============================================================
   search.js — Advanced documentation search with keyboard nav
   ============================================================ */

const SearchEngine = (() => {
  // ── Search Index ──────────────────────────────────────────
  // Built from page DOM sections + command data
  let index = [];
  let focusedIdx = -1;

  const MODAL = document.getElementById('searchBackdrop');
  const MODAL_INPUT = document.getElementById('searchModalInput');
  const RESULTS_CONTAINER = document.getElementById('searchResults');
  const SIDEBAR_INPUT = document.getElementById('sidebarSearch');

  // ── Build Index ───────────────────────────────────────────
  const buildIndex = () => {
    index = [];

    // Index document sections
    document.querySelectorAll('.doc-section[id]').forEach((sec) => {
      const id = sec.id;
      const titleEl = sec.querySelector('.section-title');
      const descEl = sec.querySelector('.section-desc');
      const title = titleEl ? titleEl.textContent.trim() : id;
      const desc = descEl ? descEl.textContent.trim() : '';

      // Add section entry
      index.push({
        type: 'section',
        id,
        title,
        desc: desc.slice(0, 80) + (desc.length > 80 ? '…' : ''),
        icon: sec.querySelector('.section-icon-box')?.textContent.trim() || '◈',
        bodyText: sec.textContent.toLowerCase(),
      });

      // Index code blocks within this section
      sec.querySelectorAll('.code-block').forEach((block) => {
        const code = block.querySelector('pre')?.textContent.trim() || '';
        if (code.length < 8) return;
        const label = block.querySelector('.code-label')?.textContent.trim() || '';
        index.push({
          type: 'code',
          id,
          title: label || code.slice(0, 50),
          desc: title, // parent section name
          icon: '$',
          bodyText: code.toLowerCase(),
          cmd: code.slice(0, 60),
        });
      });
    });
  };

  // ── Highlight match ───────────────────────────────────────
  const highlight = (text, query) => {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${escaped})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
  };

  // ── Search Logic ──────────────────────────────────────────
  const search = (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return index
      .filter((item) => {
        return (
          item.title.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.bodyText.includes(q)
        );
      })
      .slice(0, 10);
  };

  // ── Render Results ────────────────────────────────────────
  const renderResults = (query) => {
    const results = search(query);
    focusedIdx = -1;

    if (!query.trim()) {
      RESULTS_CONTAINER.innerHTML = renderHints();
      return;
    }

    if (results.length === 0) {
      RESULTS_CONTAINER.innerHTML = `
        <div class="search-empty">
          <div style="font-size:28px;margin-bottom:10px">🔍</div>
          No results for <strong>"${query}"</strong>
        </div>`;
      return;
    }

    const html = results
      .map((item, i) => {
        const isCmd = item.type === 'code';
        const titleH = highlight(item.title, query);
        return `
        <div class="search-result-item" data-idx="${i}" data-section="${item.id}" onclick="SearchEngine.navigate('${item.id}')">
          <div class="search-result-icon">${isCmd ? '›_' : item.icon}</div>
          <div class="search-result-text">
            <div class="search-result-title">${titleH}</div>
            <div class="search-result-section">${isCmd ? item.desc : 'Section'}</div>
          </div>
          ${isCmd ? `<div class="search-result-cmd">${item.cmd || ''}</div>` : ''}
        </div>`;
      })
      .join('');

    RESULTS_CONTAINER.innerHTML = html;
  };

  // ── Default hints when search is empty ───────────────────
  const renderHints = () => {
    const shortcuts = [
      { icon: '⚡', label: 'Theme Dev Server', id: 'theme-dev' },
      { icon: '↕', label: 'Pull & Push', id: 'theme-pull-push' },
      { icon: '⑂', label: 'Git Workflow', id: 'git-workflow' },
      { icon: '⚠', label: 'Conflict Resolution', id: 'conflicts' },
      { icon: '🚀', label: 'Deployment', id: 'deployment' },
    ];
    return `
      <div style="padding:12px 8px">
        <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text-muted);padding:4px 12px 10px">Quick Access</div>
        ${shortcuts
          .map(
            (s) => `
          <div class="search-result-item" onclick="SearchEngine.navigate('${s.id}')">
            <div class="search-result-icon">${s.icon}</div>
            <div class="search-result-text">
              <div class="search-result-title">${s.label}</div>
            </div>
          </div>`
          )
          .join('')}
      </div>`;
  };

  // ── Navigate to section ───────────────────────────────────
  const navigate = (sectionId) => {
    close();
    const target = document.getElementById(sectionId);
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Flash the section header
        const head = target.querySelector('.section-head');
        if (head) {
          head.style.transition = 'background 0.15s ease';
          head.style.background = 'var(--accent-subtle)';
          setTimeout(() => (head.style.background = ''), 600);
        }
      }, 80);
    }
  };

  // ── Keyboard navigation ───────────────────────────────────
  const moveFocus = (dir) => {
    const items = RESULTS_CONTAINER.querySelectorAll('.search-result-item');
    if (!items.length) return;
    items[focusedIdx]?.classList.remove('focused');
    focusedIdx = Math.max(0, Math.min(items.length - 1, focusedIdx + dir));
    items[focusedIdx]?.classList.add('focused');
    items[focusedIdx]?.scrollIntoView({ block: 'nearest' });
  };

  const activateFocused = () => {
    const items = RESULTS_CONTAINER.querySelectorAll('.search-result-item');
    if (focusedIdx >= 0 && items[focusedIdx]) {
      items[focusedIdx].click();
    }
  };

  // ── Open / Close ──────────────────────────────────────────
  const open = () => {
    MODAL.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => MODAL_INPUT?.focus(), 80);
    renderResults('');
  };

  const close = () => {
    MODAL.classList.remove('open');
    document.body.style.overflow = '';
    if (MODAL_INPUT) MODAL_INPUT.value = '';
  };

  // ── Sidebar filter (nav search) ───────────────────────────
  const filterNav = (query) => {
    const q = query.toLowerCase().trim();
    document.querySelectorAll('.nav-item').forEach((item) => {
      const text = item.textContent.toLowerCase();
      const group = item.closest('.nav-group');
      item.style.display = !q || text.includes(q) ? '' : 'none';
    });

    // Hide groups with all hidden items
    document.querySelectorAll('.nav-group').forEach((group) => {
      const visible = [...group.querySelectorAll('.nav-item')].some(
        (i) => i.style.display !== 'none'
      );
      group.style.display = visible ? '' : 'none';
    });
  };

  // ── Init ─────────────────────────────────────────────────
  const init = () => {
    buildIndex();

    // Modal input events
    MODAL_INPUT?.addEventListener('input', (e) => renderResults(e.target.value));

    MODAL_INPUT?.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(-1); }
      else if (e.key === 'Enter') activateFocused();
      else if (e.key === 'Escape') close();
    });

    // Close on backdrop click
    MODAL?.addEventListener('click', (e) => {
      if (e.target === MODAL) close();
    });

    // Esc key global
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && MODAL?.classList.contains('open')) close();
      // Open with Cmd/Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        MODAL?.classList.contains('open') ? close() : open();
      }
      // Open with /
      if (e.key === '/' && !MODAL?.classList.contains('open')) {
        const active = document.activeElement;
        if (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA') {
          e.preventDefault();
          open();
        }
      }
    });

    // Sidebar search filter
    SIDEBAR_INPUT?.addEventListener('input', (e) => filterNav(e.target.value));
    SIDEBAR_INPUT?.addEventListener('focus', () => {
      // On mobile, open full search modal instead
      if (window.innerWidth < 1024) {
        SIDEBAR_INPUT.blur();
        open();
      }
    });

    // Search trigger buttons (topbar + elsewhere)
    document.querySelectorAll('[data-search-open]').forEach((btn) => {
      btn.addEventListener('click', open);
    });
  };

  return { init, open, close, navigate, buildIndex };
})();
