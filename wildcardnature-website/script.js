// Native scrolling remains available with JavaScript disabled.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#motion');
const collection = document.querySelector('#collection');
let paused = reducedMotion.matches;
let scheduled = false;
function updateScroll() {
  scheduled = false;
  const progress = Math.max(
    0,
    Math.min(
      1,
      scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)
    )
  );
  document.documentElement.style.setProperty('--progress', progress);
  document.documentElement.style.setProperty(
    '--zoom',
    paused ? 1 : 1 + Math.min(scrollY / innerHeight, 1) * 0.13
  );
  const box = collection.getBoundingClientRect();
  const reveal = Math.max(
    0,
    Math.min(1, -box.top / Math.max(1, box.height - innerHeight))
  );
  collection.style.setProperty('--reveal', paused ? 1 : reveal);
  document.querySelector('header').classList.toggle('scrolled', scrollY > 40);
}
function setMotion() {
  document.body.classList.toggle('no-motion', paused);
  motionButton.textContent = paused ? 'Motion off' : 'Motion on';
  motionButton.setAttribute('aria-pressed', String(!paused));
  updateScroll();
}
motionButton.addEventListener('click', () => {
  paused = !paused;
  setMotion();
});
reducedMotion.addEventListener('change', (event) => {
  paused = event.matches;
  setMotion();
});
function scheduleScroll() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(updateScroll);
  }
}
addEventListener('scroll', scheduleScroll, { passive: true });
addEventListener('resize', scheduleScroll);
setMotion();

document.querySelectorAll('[data-mode]').forEach((button) =>
  button.addEventListener('click', () => {
    document
      .querySelectorAll('[data-mode]')
      .forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelector('#mode-copy').textContent =
      button.dataset.mode === 'scenic'
        ? 'Preserve the scene around your subject as your photo becomes collectible art.'
        : 'A classic trading-card look, with your wildlife discovery as the subject.';
  })
);

const spotButton = document.querySelector('#spot');
spotButton.addEventListener('click', () => {
  const showing = document.querySelector('#expedition').classList.toggle('spotted');
  spotButton.setAttribute('aria-expanded', String(showing));
  spotButton.textContent = showing ? 'Hide field note ↙' : 'Reveal a field note ↗';
  document.querySelector('#wildlife-note').textContent = showing
    ? 'Red fox — look beside the stream. In the app, find all six animals to complete the woodland expedition.'
    : 'Look along the stream. A woodland neighbour is waiting to be found.';
});

const menuButton = document.querySelector('#menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('open', open);
});
navigation.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    menuButton.focus();
  }
});

const chapters = [...document.querySelectorAll('.journey a')];
const sections = chapters.map((link) =>
  document.querySelector(link.getAttribute('href'))
);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        chapters.forEach((link) => {
          if (link.getAttribute('href') === `#${entry.target.id}`)
            link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    },
    { rootMargin: '-15% 0px -55% 0px', threshold: 0 }
  );
  sections.forEach((section) => observer.observe(section));
}
