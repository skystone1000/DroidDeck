/* ==========================================================================
   Theme — dark/light, backed by localStorage.
   Falls back to the OS colour-scheme preference on first visit.

   The control is a two-state switch rather than a toggle button. A moon that
   turns into a sun only tells you what will happen once you have learnt the
   convention; two labelled options say which theme you are in and which one
   you would be switching to, without being decoded.
   ========================================================================== */

function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme, { instant: true });

    document.querySelectorAll('.theme-switch-option').forEach((option) => {
        option.addEventListener('click', () => applyTheme(option.dataset.themeValue));
    });
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

/**
 * The system asks for 0ms on a theme change — no cross-fade, no flash. Rather
 * than hunt down every property that might animate a colour, the document is
 * marked for exactly one frame and a global rule zeroes transitions while the
 * mark is present. The rAF pair matters: the first callback runs before paint
 * with the new theme still un-rendered, so the attribute has to survive into
 * the second one to cover the frame that actually repaints.
 */
function applyTheme(theme, options) {
    const root = document.documentElement;
    const instant = !options || options.instant !== false;

    if (instant) root.setAttribute('data-theme-switching', '');
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}

    syncThemeSwitch(theme);

    if (instant) {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => root.removeAttribute('data-theme-switching'));
        });
    }
}

function syncThemeSwitch(theme) {
    document.querySelectorAll('.theme-switch-option').forEach((option) => {
        option.setAttribute('aria-checked', String(option.dataset.themeValue === theme));
    });
}
