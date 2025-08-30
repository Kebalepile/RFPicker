/**
 * @file Minimal hash router. Renders a module for each route.
 * @typedef {Object} RouteModule
 * @property {() => string} template - Returns HTML to inject.
 * @property {() => void} [onMount]  - Optional hook after DOM is injected.
 */

/**
 * Initialize hash router and render on navigation.
 * @param {Record<string, RouteModule>} routeMap - Map of "#/path" -> module.
 * @param {string} [defaultRoute='#/landing'] - Fallback route if hash is empty/unknown.
 */
export function initRouter(routeMap, defaultRoute = '#/landing') {
  const root = document.getElementById('app');
  const navLinks = () => document.querySelectorAll('[data-route]');

  function render() {
    const path = location.hash || defaultRoute;
    const Mod = routeMap[path] || routeMap[defaultRoute];
    root.innerHTML = Mod.template();
    navLinks().forEach(a => a.classList.toggle('active', a.getAttribute('href') === path));
    document.querySelector('.app')?.classList.remove('nav-open');
    if (typeof Mod.onMount === 'function') Mod.onMount();
  }

  window.addEventListener('hashchange', render);
  render();
}
