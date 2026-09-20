const carousels = document.querySelectorAll('[data-carousel]');
const currentPortfolioCovers = [
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/4d32b415364851a235067d8a481befb4.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/106275706a988ec0eef37676c5d6cb85.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/de2c605bd923737f10d4b291d84c263e.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/198ec0272a556b47e52dd8d0fef40a0c.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/b6bef147e831d492bd22303e258883c6.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/fa8f5c282670d7341d7c45ef85b9a363.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/a91ba6400b07470fe64b50c1405951cb.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/294e86580a202e9d9863e4ef0b7d6a07.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/c3ccb7e36d1ce8173a4a95055e7cca55.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/4988a4498dc333607b339df447c4d0bc.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/ee4e17591674f0cd720148a22c55a2c0.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/01fa271e1eb4d3e6b23c73c084312e6f.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/409c25580b06dda0eb97d1b803605d81.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/ee0a45d764d0cea2383e329a6361c65c.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/a30c85bf43877178d6739b911c2baa60.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/78c268ed3589a56acbdf5cbb18413023.jpg',
  'https://myworksnet.my.canva.site/kellymoraiso-ugc/_assets/video/850e6b990b9243015b5c32bdf90e808d.jpg'
];

document.querySelectorAll('.video-card video').forEach((video, index) => {
  video.poster = currentPortfolioCovers[index % currentPortfolioCovers.length];
});

carousels.forEach((carousel) => {
  const shell = carousel.closest('.carousel-shell');
  const previous = shell.querySelector('.prev');
  const next = shell.querySelector('.next');
  const progress = shell.closest('.category-block').querySelector('.progress-track i');
  const step = () => Math.min(carousel.clientWidth * 0.8, 500);

  previous.addEventListener('click', () => carousel.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => carousel.scrollBy({ left: step(), behavior: 'smooth' }));
  carousel.addEventListener('scroll', () => {
    const maxScroll = carousel.scrollWidth - carousel.clientWidth;
    const percentage = maxScroll ? Math.max(24, (carousel.scrollLeft / maxScroll) * 76 + 24) : 24;
    progress.style.width = `${percentage}%`;
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach((section) => sectionObserver.observe(section));

// Pause videos that leave the viewport to keep the page light on mobile.
const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) return;
    if (!entry.target.paused) entry.target.pause();
  });
}, { threshold: 0.15 });
document.querySelectorAll('video').forEach((video) => videoObserver.observe(video));

const filterButtons = document.querySelectorAll('[data-filter]');
const categoryBlocks = document.querySelectorAll('[data-category]');
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedFilter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
    categoryBlocks.forEach((category) => {
      const shouldShow = selectedFilter === 'todos' || category.dataset.category === selectedFilter;
      category.classList.toggle('is-hidden', !shouldShow);
    });
  });
});

const categoryObserver = new IntersectionObserver((entries) => {
  const visibleCategory = entries
    .filter((entry) => entry.isIntersecting && !entry.target.classList.contains('is-hidden'))
    .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
  if (!visibleCategory) return;

  const activeButton = document.querySelector(`[data-filter="${visibleCategory.target.dataset.category}"]`);
  if (!activeButton) return;
  filterButtons.forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
    button.setAttribute('aria-current', isActive ? 'true' : 'false');
  });
  activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}, { rootMargin: '-24% 0px -58% 0px', threshold: [0.15, 0.35, 0.6] });
categoryBlocks.forEach((category) => categoryObserver.observe(category));

const briefingForm = document.querySelector('.briefing-form');
if (briefingForm) {
  briefingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(briefingForm);
    const subject = encodeURIComponent(`Briefing de ${data.get('company')}`);
    const body = encodeURIComponent(`Nome: ${data.get('name')}\nEmpresa/agencia: ${data.get('company')}\n\nProjeto:\n${data.get('message')}`);
    window.location.href = `mailto:marketing.kellymorais@gmail.com?subject=${subject}&body=${body}`;
  });
}
