// The same projects can be explored through three existing planning attitudes.
export const lenses = [
  {id: 'discover', label: '실마리 찾기', projects: ['korail', 'bridge', 'bluedog']},
  {id: 'weave', label: '생각 엮기', projects: ['bridge', 'bluedog', 'rocketfresh', 'kaywon']},
  {id: 'validate', label: '매듭 짓기', projects: ['chak', 'korail']},
];

export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let transition;
export function transitionView(update) {
  if (!document.startViewTransition || reduceMotion()) return update();
  transition?.skipTransition();
  transition = document.startViewTransition(update);
  transition.finished.catch(() => {});
  return transition;
}

export function replaceCards(grid, markup, animate = false) {
  const before = new Map([...grid.children].map(card => [card.dataset.projectId, card.getBoundingClientRect()]));
  const update = () => {
    grid.innerHTML = markup;
    if (!animate || document.startViewTransition || reduceMotion()) return;
    for (const card of grid.children) {
      const old = before.get(card.dataset.projectId);
      const next = card.getBoundingClientRect();
      card.animate([
        {opacity: old ? 1 : 0, transform: old ? `translate(${old.left - next.left}px, ${old.top - next.top}px)` : 'translateY(20px) scale(.97)'},
        {opacity: 1, transform: 'translate(0, 0) scale(1)'},
      ], {duration: 480, easing: 'cubic-bezier(.22,1,.36,1)'});
    }
  };
  return animate ? transitionView(update) : update();
}
