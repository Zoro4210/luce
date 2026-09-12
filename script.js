const details = document.querySelector('#details-dialog');
document.querySelectorAll('[data-open="details"]').forEach(button => button.addEventListener('click', () => details.showModal()));
const reservation = document.querySelector('#reservation-dialog');
document.querySelectorAll('[data-open="reservation"]').forEach(button => button.addEventListener('click', () => reservation.showModal()));
document.querySelectorAll('dialog .dialog-close').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
}));

const works = [
  {title:'Portrait of a Man', meta:'Jacopo Tintoretto · 1550s · Oil on canvas', image:'assets/tintoretto.jpg', text:'A merchant meets our gaze with startling directness. Tintoretto’s quick, assured brushwork gives stillness a charge of living thought.', url:'https://www.metmuseum.org/art/collection/search/437822'},
  {title:'Erasmus of Rotterdam', meta:'Hans Holbein the Younger and Workshop · c. 1532 · Oil on linden panel', image:'assets/erasmus.jpg', text:'Holbein’s small, searching portrait locates the scholar’s intellectual intensity not in symbols, but in a face observed without flattery.', url:'https://www.metmuseum.org/art/collection/search/459080'},
  {title:'Portrait of a Young Man', meta:'Antonello da Messina · c. 1470 · Oil on wood', image:'assets/antonello.jpg', text:'A half-smile and unwavering gaze suggest an inner life just beyond reach. Antonello turns portraiture into an encounter between equals.', url:'https://www.metmuseum.org/art/collection/search/435581'},
  {title:'Man with a Magnifying Glass', meta:'Rembrandt van Rijn · early 1660s · Oil on canvas', image:'assets/rembrandt.jpg', text:'Light travels across face, hand, and lens. The likely auctioneer does not simply look—he appraises, reminding us that seeing has always carried value.', url:'https://www.metmuseum.org/art/collection/search/437399'}
];
const artDialog = document.querySelector('#art-dialog');
document.querySelectorAll('[data-art]').forEach(card => card.addEventListener('click', () => {
  const work = works[Number(card.dataset.art)];
  artDialog.querySelector('img').src = work.image;
  artDialog.querySelector('img').alt = work.title;
  artDialog.querySelector('h2').textContent = work.title;
  artDialog.querySelector('.art-meta').textContent = work.meta;
  artDialog.querySelector('.art-description').textContent = work.text;
  artDialog.querySelector('.source-link').href = work.url;
  artDialog.showModal();
}));

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); }));

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
}), {threshold:.12});
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelector('#newsletter').addEventListener('submit', event => {
  event.preventDefault();
  const status = event.currentTarget.querySelector('.form-status');
  status.textContent = 'You’re on the list. Your first letter arrives next month.';
  const input = event.currentTarget.querySelector('input');
  input.value = '';
  input.dispatchEvent(new Event('input'));
});

const GLITCH_CHARS = Array.from('.,·-─~+:;=*π"┐┌┘┴┬╗╔╝╚╬╠╣╩╦║░▒▓█▄▀▌▐■!?&#$@0123456789*');
const WAVE_THRESHOLD = 3;
const CHARACTER_MULTIPLIER = 3;
const ANIMATION_STEP = 40;
const WAVE_BUFFER = 5;

function initAsciiRipple(element, duration = 1000, spread = 1) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const segments = [];
  let totalLength = 0;
  let node;

  while ((node = walker.nextNode())) {
    if (!node.nodeValue || !node.nodeValue.trim()) continue;
    const original = node.nodeValue;
    segments.push({node, original, offset: totalLength});
    totalLength += original.length;
  }
  if (!totalLength) return;

  const originalLabel = segments.map(segment => segment.original.trim()).join(' ');
  if (!element.hasAttribute('aria-label')) element.setAttribute('aria-label', originalLabel);
  element.classList.add('ascii-ripple');

  const state = {
    active: false,
    hovering: false,
    cursorPosition: 0,
    waves: [],
    animationId: null,
    lockedWidth: null
  };

  const restore = () => {
    segments.forEach(segment => { segment.node.nodeValue = segment.original; });
    element.classList.remove('is-glitching');
    if (state.lockedWidth !== null) {
      element.style.width = '';
      state.lockedWidth = null;
    }
    state.active = false;
    if (state.animationId !== null) cancelAnimationFrame(state.animationId);
    state.animationId = null;
  };

  const updateCursorPosition = event => {
    const rect = element.getBoundingClientRect();
    const position = Math.round(((event.clientX - rect.left) / rect.width) * totalLength);
    state.cursorPosition = Math.max(0, Math.min(position, totalLength - 1));
  };

  const characterAt = (originalCharacter, characterIndex, time) => {
    if (originalCharacter === ' ') return originalCharacter;
    let result = originalCharacter;

    for (const wave of state.waves) {
      const age = time - wave.startedAt;
      const progress = Math.min(age / duration, 1);
      const distance = Math.abs(characterIndex - wave.startPosition);
      const maximumDistance = Math.max(
        wave.startPosition,
        totalLength - wave.startPosition - 1
      );
      const radius = (progress * (maximumDistance + WAVE_BUFFER)) / spread;
      const intensity = Math.max(0, radius - distance);

      if (distance <= radius && intensity > 0 && intensity <= WAVE_THRESHOLD) {
        const characterSetIndex =
          (distance * CHARACTER_MULTIPLIER + Math.floor(age / ANIMATION_STEP)) % GLITCH_CHARS.length;
        result = GLITCH_CHARS[characterSetIndex];
      }
    }
    return result;
  };

  const animate = time => {
    state.waves = state.waves.filter(wave => time - wave.startedAt < duration);
    if (!state.waves.length) {
      restore();
      return;
    }

    segments.forEach(segment => {
      segment.node.nodeValue = Array.from(segment.original)
        .map((character, index) => characterAt(character, segment.offset + index, time))
        .join('');
    });
    state.animationId = requestAnimationFrame(animate);
  };

  const start = () => {
    if (state.active) return;
    state.active = true;
    element.classList.add('is-glitching');
    if (element.matches('.line-button')) {
      state.lockedWidth = element.getBoundingClientRect().width;
      element.style.width = `${state.lockedWidth}px`;
    }
    state.animationId = requestAnimationFrame(animate);
  };

  const startWave = () => {
    state.waves.push({startPosition: state.cursorPosition, startedAt: performance.now()});
    start();
  };

  element.addEventListener('mouseenter', event => {
    state.hovering = true;
    updateCursorPosition(event);
    startWave();
  });
  element.addEventListener('mousemove', event => {
    if (!state.hovering) return;
    const previousPosition = state.cursorPosition;
    updateCursorPosition(event);
    if (previousPosition !== state.cursorPosition) startWave();
  });
  element.addEventListener('mouseleave', () => { state.hovering = false; });
  element.addEventListener('focus', () => {
    state.cursorPosition = Math.floor(totalLength / 2);
    startWave();
  });
}

document.querySelectorAll('.chapters a, .story .line-button').forEach(element => initAsciiRipple(element));

function initSmoothInput(input) {
  const wrapper = input.parentElement;
  const caret = document.createElement('span');
  caret.className = 'smooth-input-caret';
  caret.setAttribute('aria-hidden', 'true');
  wrapper.append(caret);
  input.classList.add('smooth-input');
  const measureContext = document.createElement('canvas').getContext('2d');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const syncCaret = () => {
    if (document.activeElement !== input) return;
    const selectionStart = Number.isInteger(input.selectionStart) ? input.selectionStart : input.value.length;
    const selectionEnd = Number.isInteger(input.selectionEnd) ? input.selectionEnd : selectionStart;
    if (selectionStart !== selectionEnd) {
      caret.style.opacity = '0';
      return;
    }

    const styles = getComputedStyle(input);
    const textBeforeCaret = input.value.slice(0, selectionStart);
    measureContext.font = `${styles.fontStyle} ${styles.fontWeight} ${styles.fontSize} ${styles.fontFamily}`;
    const letterSpacing = parseFloat(styles.letterSpacing) || 0;
    const measuredWidth = measureContext.measureText(textBeforeCaret).width +
      Math.max(0, textBeforeCaret.length - 1) * letterSpacing;

    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const absolutePosition = measuredWidth + paddingLeft;
    const visibleRight = input.scrollLeft + input.clientWidth - paddingRight;
    const visibleLeft = input.scrollLeft + paddingLeft;

    if (absolutePosition > visibleRight) {
      input.scrollLeft = absolutePosition - input.clientWidth + paddingRight;
    } else if (absolutePosition < visibleLeft) {
      input.scrollLeft = Math.max(0, absolutePosition - paddingLeft);
    }

    const x = Math.min(
      Math.max(absolutePosition - input.scrollLeft, paddingLeft),
      input.clientWidth - paddingRight
    );
    caret.style.transitionDuration = reducedMotion ? '0s' : '';
    caret.style.left = `${x}px`;
    caret.style.opacity = '1';
  };

  const scheduleSync = () => requestAnimationFrame(syncCaret);
  input.addEventListener('focus', scheduleSync);
  input.addEventListener('input', scheduleSync);
  input.addEventListener('keyup', scheduleSync);
  input.addEventListener('click', scheduleSync);
  input.addEventListener('select', scheduleSync);
  input.addEventListener('scroll', scheduleSync);
  input.addEventListener('blur', () => { caret.style.opacity = '0'; });
  document.addEventListener('selectionchange', scheduleSync);
  document.fonts.ready.then(scheduleSync);
  new ResizeObserver(scheduleSync).observe(wrapper);
}

initSmoothInput(document.querySelector('#email'));

const newsletterEmail = document.querySelector('#email');
const newsletterMap = document.querySelector('.footer-location');
if (newsletterEmail && newsletterMap) {
  const syncMapPin = () => newsletterMap.classList.toggle('has-location', newsletterEmail.value.trim().length > 0);
  newsletterEmail.addEventListener('input', syncMapPin);
  syncMapPin();
}

const hoverGallery = document.querySelector('.art-hover-gallery');
if (hoverGallery) {
  const hoverArtworks = Array.from(hoverGallery.querySelectorAll('.hover-art'));
  const activateArtwork = artwork => {
    hoverArtworks.forEach(item => {
      const active = item === artwork;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    if (window.innerWidth <= 850) {
      artwork.scrollIntoView({behavior:'smooth', block:'nearest', inline:'center'});
    }
  };

  hoverArtworks.forEach((artwork, index) => {
    artwork.addEventListener('mouseenter', () => activateArtwork(artwork));
    artwork.addEventListener('focus', () => activateArtwork(artwork));
    artwork.addEventListener('click', () => activateArtwork(artwork));
    artwork.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + hoverArtworks.length) % hoverArtworks.length;
      hoverArtworks[nextIndex].focus();
    });
  });
}
