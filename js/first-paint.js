/* Runs first, in each page's <head>, before anything else is drawn.
 * Going from one page to the next (the Clubhouse to a game, a game back to the Clubhouse) is a full page change,
 * so for a moment the new page has nothing on it. This paints it straight away in the background colour of the
 * player's theme (applyTheme remembers it as 'meadow-paint'), then fades the page in, so there is never a blank flash.
 * With Reduce Motion on there is no fade. */
(function () {
  // each theme's main colour (keep in step with the themes in js/meadow-core.js); day is the same as the launch screen
  var THEME_BG = { day: '#F6EBD3', sunset: '#FFE3D0', sea: '#D4F3F1', night: '#1C2140', snow: '#EEF5FB', christmas: '#173B2C', pixel: '#8ED3FF', space: '#0F1430', volcano: '#2A1A17' };
  var bg = THEME_BG.day;
  try { bg = THEME_BG[localStorage.getItem('meadow-paint')] || bg; } catch (e) {}
  var st = document.createElement('style');
  st.textContent = 'html{background:' + bg + '}' +
    '@media (prefers-reduced-motion:no-preference){body{animation:meadowPageIn .22s ease-out both}}' +
    '@keyframes meadowPageIn{from{opacity:0}to{opacity:1}}';
  document.head.appendChild(st);
})();
