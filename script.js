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

const latestInstagramPosts = [
  { image: 'https://scontent.cdninstagram.com/v/t51.82787-15/793997193_18087506789465845_1493912234232938555_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=103&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D', link: 'https://www.instagram.com/kemoraiso/reel/Dc4TsgNhvXy/', label: 'post recente / 01' },
  { image: 'https://scontent.cdninstagram.com/v/t51.82787-15/802223934_18088187423465845_2112713030528299844_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=109&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D', link: 'https://www.instagram.com/kemoraiso/reel/DdFP3quBgB9/', label: 'post recente / 02' },
  { image: 'https://scontent.cdninstagram.com/v/t51.82787-15/789264302_18086872220465845_4064890268782519889_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=101&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D', link: 'https://www.instagram.com/kemoraiso/reel/DctXke_BpJF/', label: 'post recente / 03' },
  { image: 'https://scontent.cdninstagram.com/v/t51.82787-15/779017821_18085290011465845_8676784775363484447_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=101&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D', link: 'https://www.instagram.com/kemoraiso/reel/Dbto7oNho3o/', label: 'post recente / 04' },
  { image: 'https://scontent.cdninstagram.com/v/t51.71878-15/747290094_1244532351019225_4772269882185221831_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=109&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D', link: 'https://www.instagram.com/kemoraiso/reel/Dav1BwnB8S4/', label: 'post recente / 05' },
  { image: 'https://scontent.cdninstagram.com/v/t51.82787-15/779918638_18085420529465845_7587684543376603894_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=106&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D', link: 'https://www.instagram.com/kemoraiso/reel/DcRrZvuh33B/', label: 'post recente / 06' },
  { image: 'https://scontent.cdninstagram.com/v/t51.82787-15/708155102_18072713915465845_7080674928025271012_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=106&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D', link: 'https://www.instagram.com/kemoraiso/reel/DY65T1vu4bn/', label: 'post recente / 07' },
  { image: 'https://scontent.cdninstagram.com/v/t51.82787-15/780087747_18085289960465845_835888731528923369_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=103&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D', link: 'https://www.instagram.com/kemoraiso/reel/Daan3KYuQgw/', label: 'post recente / 08' }
];

const socialCarousel = document.querySelector('[data-social-carousel]');
if (socialCarousel) {
  socialCarousel.innerHTML = latestInstagramPosts.map((post, index) => `<a class="photo-card" href="${post.link}" target="_blank" rel="noreferrer"><img src="${post.image}" alt="${post.label}" loading="lazy" onerror="this.onerror=null;this.src='${currentPortfolioCovers[index % currentPortfolioCovers.length]}'"><span>${post.label} <b>&#8599;</b></span></a>`).join('');
  const photoShell = socialCarousel.closest('.photo-carousel-shell');
  const photoStep = () => Math.min(socialCarousel.clientWidth * 0.8, 500);
  photoShell.querySelector('.prev').addEventListener('click', () => socialCarousel.scrollBy({ left: -photoStep(), behavior: 'smooth' }));
  photoShell.querySelector('.next').addEventListener('click', () => socialCarousel.scrollBy({ left: photoStep(), behavior: 'smooth' }));
  socialCarousel.addEventListener('scroll', () => {
    const maxScroll = socialCarousel.scrollWidth - socialCarousel.clientWidth;
    const progress = photoShell.nextElementSibling.querySelector('.progress-track i');
    progress.style.width = `${maxScroll ? Math.max(24, (socialCarousel.scrollLeft / maxScroll) * 76 + 24) : 24}%`;
  });
}

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

/* === FORMULÁRIO — Web3Forms ====================================
   Os e-mails chegam direto no Gmail da Kelly.
   Chave: 7fe3ffc0-5845-4f52-b3a7-1aaab028939d
   ============================================================= */
const briefingForm = document.querySelector('.briefing-form');
if (briefingForm) {
  briefingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = briefingForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Estado de loading
    submitBtn.innerHTML = 'Enviando… <span aria-hidden="true">↻</span>';
    submitBtn.disabled = true;

    try {
      const formData = new FormData(briefingForm);
      const data = Object.fromEntries(formData.entries());

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();

      if (result.success) {
        // Sucesso — substituir formulário por mensagem
        briefingForm.innerHTML = `
          <div class="form-success">
            <span class="form-check">✓</span>
            <p>Briefing recebido!</p>
            <small>Já caiu na minha caixa de entrada. Em breve entro em contato.<br>Prefere ir direto? <a href="mailto:marketing.kellymorais@gmail.com">marketing.kellymorais@gmail.com</a></small>
          </div>
        `;
      } else {
        // Erro da API — restaurar botão
        submitBtn.innerHTML = 'Tentar novamente <span aria-hidden="true">↻</span>';
        submitBtn.disabled = false;
        console.warn('Web3Forms error:', result);
      }
    } catch (error) {
      // Erro de rede — restaurar botão
      submitBtn.innerHTML = originalBtnText;
      submitBtn.disabled = false;
      console.error('Erro ao enviar:', error);
    }
  });
}


/* === HAMBURGER MENU =========================================== */
const navToggle = document.querySelector('.nav-toggle');
const mobileNav = document.querySelector('.mobile-nav');
if (navToggle && mobileNav) {
  const openMenu = () => {
    mobileNav.classList.add('is-open');
    navToggle.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    navToggle.setAttribute('aria-expanded', 'true');
  };
  const closeMenu = () => {
    mobileNav.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    document.body.style.overflow = '';
    navToggle.setAttribute('aria-expanded', 'false');
  };
  navToggle.addEventListener('click', openMenu);
  mobileNav.querySelector('.mobile-nav-close').addEventListener('click', closeMenu);
  mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
}

/* === SKELETON LOADER — marcar card como carregado ============= */
document.querySelectorAll('.photo-card img').forEach((img) => {
  if (img.complete) {
    img.closest('.photo-card')?.classList.add('loaded');
  } else {
    img.addEventListener('load', () => img.closest('.photo-card')?.classList.add('loaded'));
  }
});
