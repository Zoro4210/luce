const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const detailsDialog = document.querySelector('#details-dialog');
const reservationDialog = document.querySelector('#reservation-dialog');
const artDialog = document.querySelector('#art-dialog');

const openDialog = dialog => {
  if (dialog && !dialog.open) dialog.showModal();
};

document.querySelectorAll('[data-open="details"]').forEach(button => {
  button.addEventListener('click', () => openDialog(detailsDialog));
});

document.querySelectorAll('[data-open="reservation"]').forEach(button => {
  button.addEventListener('click', () => openDialog(reservationDialog));
});

document.querySelectorAll('dialog .dialog-close').forEach(button => {
  button.addEventListener('click', () => button.closest('dialog').close());
});

document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    const outside = event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
    if (outside) dialog.close();
  });
});

const works = [
  {
    title: 'Portrait of a Man',
    meta: 'Jacopo Tintoretto · 1550s · Oil on canvas',
    image: 'assets/tintoretto.jpg',
    text: 'A merchant meets our gaze with startling directness. Tintoretto’s quick, assured brushwork gives stillness the charge of living thought.',
    url: 'https://www.metmuseum.org/art/collection/search/437822'
  },
  {
    title: 'Erasmus of Rotterdam',
    meta: 'Hans Holbein the Younger and Workshop · c. 1532 · Oil on linden panel',
    image: 'assets/erasmus.jpg',
    text: 'Holbein’s searching portrait locates the scholar’s intellectual intensity not in symbols, but in a face observed without flattery.',
    url: 'https://www.metmuseum.org/art/collection/search/459080'
  },
  {
    title: 'Portrait of a Young Man',
    meta: 'Antonello da Messina · c. 1470 · Oil on wood',
    image: 'assets/antonello.jpg',
    text: 'A half-smile and unwavering gaze suggest an inner life just beyond reach. Antonello turns portraiture into an encounter between equals.',
    url: 'https://www.metmuseum.org/art/collection/search/435581'
  },
  {
    title: 'Man with a Magnifying Glass',
    meta: 'Rembrandt van Rijn · early 1660s · Oil on canvas',
    image: 'assets/rembrandt.jpg',
    text: 'Light travels across face, hand, and lens. The likely auctioneer does not simply look—he appraises, reminding us that seeing has always carried value.',
    url: 'https://www.metmuseum.org/art/collection/search/437399'
  },
  {
    title: 'Cecilia Gallerani',
    meta: 'Leonardo da Vinci · c. 1489–1491 · Oil on walnut panel',
    image: 'assets/artwork-05.jpg',
    text: 'Turning just beyond the frame, Cecilia seems to respond to someone entering the room. The portrait catches identity in motion rather than repose.'
  },
  {
    title: 'La Velata',
    meta: 'Raphael · c. 1514–1515 · Oil on canvas',
    image: 'assets/artwork-06.jpg',
    text: 'Silk, skin, and shadow are rendered with equal attention. The sitter’s quiet poise makes material splendor feel intimate rather than ceremonial.'
  },
  {
    title: 'Eleonora of Toledo',
    meta: 'Agnolo Bronzino · c. 1545 · Oil on panel',
    image: 'assets/artwork-07.jpg',
    text: 'The precise brocade becomes an architecture of status. Bronzino constructs a public image whose controlled surface is itself the subject.'
  },
  {
    title: 'Man with a Glove',
    meta: 'Titian · c. 1520 · Oil on canvas',
    image: 'assets/artwork-08.jpg',
    text: 'A gloved hand rests against darkness while the ungloved hand remains visible. Titian balances social polish with a quietly psychological presence.'
  },
  {
    title: 'Anne Lovell',
    meta: 'Hans Holbein the Younger · c. 1526–1528 · Oil and tempera on oak',
    image: 'assets/artwork-09.jpg',
    text: 'A small animal and carefully observed dress carry private associations. Holbein lets personal detail complicate the formality of the pose.'
  }
];

const artPanels = Array.from(document.querySelectorAll('.art-panel'));

const activateArtwork = panel => {
  artPanels.forEach(item => {
    const active = item === panel;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });

  if (window.innerWidth <= 760) {
    panel.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  }
};

const showArtwork = index => {
  const work = works[index];
  if (!work || !artDialog) return;

  const image = artDialog.querySelector('img');
  const source = artDialog.querySelector('.source-link');
  image.src = work.image;
  image.alt = work.title;
  artDialog.querySelector('h2').textContent = work.title;
  artDialog.querySelector('.art-meta').textContent = work.meta;
  artDialog.querySelector('.art-description').textContent = work.text;

  if (work.url) {
    source.href = work.url;
    source.hidden = false;
  } else {
    source.hidden = true;
  }

  openDialog(artDialog);
};

artPanels.forEach((panel, index) => {
  panel.addEventListener('mouseenter', () => activateArtwork(panel));
  panel.addEventListener('focus', () => activateArtwork(panel));
  panel.addEventListener('click', () => {
    activateArtwork(panel);
    showArtwork(Number(panel.dataset.art));
  });
  panel.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    artPanels[(index + direction + artPanels.length) % artPanels.length].focus();
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  mainNav.classList.toggle('open', !open);
  menuToggle.querySelector('span').textContent = open ? 'Menu' : 'Close';
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.querySelector('span').textContent = 'Menu';
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: .12 });

document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));

const newsletter = document.querySelector('#newsletter');
const newsletterInput = document.querySelector('#email');
const newsletterMap = document.querySelector('.footer-location');

newsletter.addEventListener('submit', event => {
  event.preventDefault();
  newsletter.querySelector('.form-status').textContent = 'You’re on the list. Your first letter arrives next month.';
  newsletterInput.value = '';
  newsletterMap.classList.remove('has-location');
});

newsletterInput.addEventListener('input', () => {
  newsletterMap.classList.toggle('has-location', newsletterInput.value.trim().length > 0);
});

const prepareWordReveal = element => {
  const words = element.textContent.trim().split(/\s+/);
  element.textContent = '';
  words.forEach((word, index) => {
    const span = document.createElement('span');
    span.textContent = word;
    element.append(span);
    if (index < words.length - 1) element.append(document.createTextNode(' '));
  });
};

const wordReveal = document.querySelector('.word-reveal');
prepareWordReveal(wordReveal);

if (window.gsap && window.ScrollTrigger && !reducedMotion) {
  gsap.registerPlugin(ScrollTrigger);

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.hero .eyebrow', { opacity: 0, y: 16, duration: .7 })
    .from('.hero h1 span', { opacity: 0, yPercent: 24, duration: 1, stagger: .12 }, '-=.35')
    .from('.hero-intro-row', { opacity: 0, y: 24, duration: .8 }, '-=.45')
    .from('.hero-visual', { clipPath: 'inset(0 0 100% 0)', duration: 1.15 }, '-=1')
    .from('.hero-date', { opacity: 0, x: 35, duration: .65 }, '-=.4');

  gsap.to('.hero-image', {
    scale: 1.14,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  });

  ScrollTrigger.matchMedia({
    '(min-width: 1001px)': () => {
      ScrollTrigger.create({
        trigger: '.story',
        start: 'top top',
        end: 'bottom bottom',
        pin: '.story-heading',
        pinSpacing: false
      });
    }
  });

  gsap.to('.word-reveal span', {
    opacity: 1,
    stagger: .08,
    ease: 'none',
    scrollTrigger: { trigger: '.story', start: 'top 68%', end: '35% 42%', scrub: true }
  });

  document.querySelectorAll('.story-panel').forEach(panel => {
    const image = panel.querySelector('img');
    gsap.timeline({
      scrollTrigger: { trigger: panel, start: 'top 92%', end: 'bottom 10%', scrub: true }
    })
      .fromTo(image, { scale: .86, opacity: .32 }, { scale: 1, opacity: 1, ease: 'none', duration: .58 })
      .to(image, { scale: 1.05, opacity: .24, filter: 'saturate(.35) brightness(.55)', ease: 'none', duration: .42 });
  });

  gsap.from('.collection-statement', {
    opacity: .18,
    y: 70,
    scrollTrigger: { trigger: '.collection-statement', start: 'top 90%', end: 'top 45%', scrub: true }
  });
}
