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
