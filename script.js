const carousels = document.querySelectorAll('[data-carousel]');

/* Covers de fallback — usados apenas quando o CMS não tem imagem configurada */
const currentPortfolioCovers = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=700&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=700&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=700&q=85&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=700&q=85&auto=format&fit=crop'
];

/* Vídeos de fallback para o portfólio */
const workingPortfolioVideos = [
  'https://res.cloudinary.com/demo/video/upload/q_auto,w_400/sea_turtle.mp4',
  'https://res.cloudinary.com/demo/video/upload/q_auto,w_400/finish_line.mp4',
  'https://res.cloudinary.com/demo/video/upload/q_auto,w_400/dog.mp4',
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://res.cloudinary.com/demo/video/upload/q_auto,w_400/snow_deer.mp4',
  'https://res.cloudinary.com/demo/video/upload/q_auto,w_400/elephants.mp4'
];


document.querySelectorAll('.video-card').forEach((card, index) => {
  const video = card.querySelector('video');
  if (!video) return;

  // Garante fonte funcional de vídeo caso ainda aponte para Coverr 403
  const source = video.querySelector('source');
  const targetVideoUrl = workingPortfolioVideos[index % workingPortfolioVideos.length];
  if (!source || !source.src || source.src.includes('coverr-main')) {
    if (source) {
      source.src = targetVideoUrl;
    }
    video.src = targetVideoUrl;
    video.load();
  }

  // Se o poster for ausente ou do Canva, define foto Unsplash
  if (!video.poster || video.poster.includes('canva.site')) {
    video.poster = currentPortfolioCovers[index % currentPortfolioCovers.length];
  }

  // Remove eventual badge legada de Play para não conflitar com player nativo
  const existingBadge = card.querySelector('.video-play-badge');
  if (existingBadge) {
    existingBadge.remove();
  }

  // Sincroniza estado visual de reprodução
  video.addEventListener('play', () => card.classList.add('is-playing'));
  video.addEventListener('pause', () => card.classList.remove('is-playing'));
  video.addEventListener('ended', () => card.classList.remove('is-playing'));
});

// Inicialização do vídeo Hero
const heroVideo = document.querySelector('.hero-frame video');
if (heroVideo) {
  const heroSource = heroVideo.querySelector('source');
  if (!heroSource || !heroSource.src || heroSource.src.includes('coverr-main')) {
    const defHero = 'https://res.cloudinary.com/demo/video/upload/q_auto,w_600/sea_turtle.mp4';
    if (heroSource) heroSource.src = defHero;
    heroVideo.src = defHero;
    heroVideo.load();
    heroVideo.play().catch(() => {});
  }
}

const latestInstagramPosts = [
  { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/Dc4TsgNhvXy/', label: 'post recente / 01' },
  { image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/DdFP3quBgB9/', label: 'post recente / 02' },
  { image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/DctXke_BpJF/', label: 'post recente / 03' },
  { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/Dbto7oNho3o/', label: 'post recente / 04' },
  { image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/Dav1BwnB8S4/', label: 'post recente / 05' },
  { image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/DcRrZvuh33B/', label: 'post recente / 06' },
  { image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/DY65T1vu4bn/', label: 'post recente / 07' },
  { image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/Daan3KYuQgw/', label: 'post recente / 08' }
];

function setupDragToScroll(carousel, isVideo = false) {
  if (!carousel) return;

  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let hasDragged = false;
  let wasDragged = false;

  // Previne arrasto nativo fantasma do navegador em imagens, vídeos e links
  carousel.querySelectorAll('img, video, a, article').forEach((el) => {
    el.setAttribute('draggable', 'false');
    el.addEventListener('dragstart', (e) => e.preventDefault());
  });

  carousel.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; // Apenas botão principal (esquerdo)
    isDown = true;
    hasDragged = false;
    startX = e.pageX;
    scrollStart = carousel.scrollLeft;
    carousel.style.scrollBehavior = 'auto';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    if (!hasDragged && Math.abs(dx) > 6) {
      hasDragged = true;
      wasDragged = true;
      carousel.classList.add('is-pointer-dragging');
    }
    if (hasDragged) {
      e.preventDefault();
      carousel.scrollLeft = scrollStart - dx;
    }
  });

  const stopDrag = () => {
    if (!isDown) return;
    isDown = false;
    carousel.style.scrollBehavior = '';
    carousel.classList.remove('is-pointer-dragging');
    if (hasDragged) {
      setTimeout(() => {
        wasDragged = false;
        hasDragged = false;
      }, 100);
    }
  };

  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('blur', stopDrag);

  // Captura e cancela clique se houve arraste, ou dispara play/pause do vídeo em clique limpo
  carousel.addEventListener('click', (e) => {
    if (hasDragged || wasDragged) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      hasDragged = false;
      wasDragged = false;
      return;
    }

    if (isVideo) {
      const card = e.target.closest('.video-card');
      if (!card) return;

      // Se for link de rede social externa (ex: Reel do Instagram ou TikTok), abre no clique
      if (card.dataset.externalUrl) {
        window.open(card.dataset.externalUrl, '_blank');
        return;
      }

      const video = card.querySelector('video');
      if (!video) return;

      if (video.paused) {
        // Pausa outros vídeos para evitar áudio/reprodução simultânea
        document.querySelectorAll('.video-card video').forEach((other) => {
          if (other !== video && !other.paused) other.pause();
        });
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Playback bloqueado por política de áudio, tentando muted:', err);
            video.muted = true;
            video.play().catch((e) => console.error('Erro na reprodução do vídeo:', e));
          });
        }
      } else {
        video.pause();
      }
    }
  }, true);
}

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
  setupDragToScroll(socialCarousel, false);
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
  setupDragToScroll(carousel, true);
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
let isManualFilterScroll = false;
let filterScrollTimeout = null;

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedFilter = button.dataset.filter;
    isManualFilterScroll = true;
    if (filterScrollTimeout) clearTimeout(filterScrollTimeout);

    // 1. Atualiza estado visual dos botões
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
      item.setAttribute('aria-current', isActive ? 'true' : 'false');
    });

    // 2. Filtra as seções de cases (exibe/oculta)
    categoryBlocks.forEach((category) => {
      const shouldShow = selectedFilter === 'todos' || category.dataset.category === selectedFilter;
      category.classList.toggle('is-hidden', !shouldShow);
    });

    // 3. Centraliza o botão clicado na barra de filtros (especialmente no mobile)
    button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

    // 4. Rola a página suavemente para o topo do case selecionado,
    //    evitando que a redução de altura da página jogue o usuário no fim dela.
    requestAnimationFrame(() => {
      const targetBlock = selectedFilter === 'todos'
        ? document.querySelector('#trabalhos')
        : document.querySelector(`[data-category="${selectedFilter}"]`);

      if (targetBlock) {
        const filterBar = document.querySelector('.filter-bar');
        const filterBarHeight = filterBar ? filterBar.offsetHeight + 24 : 75;
        const targetTop = targetBlock.getBoundingClientRect().top + window.pageYOffset - filterBarHeight;

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });
      }

      filterScrollTimeout = setTimeout(() => {
        isManualFilterScroll = false;
      }, 700);
    });
  });
});

const categoryObserver = new IntersectionObserver((entries) => {
  // Não dispara durante o scroll automático do clique de filtro
  if (isManualFilterScroll) return;

  // Se houver filtro ativo (algum bloco oculto), não altera os botões com base no scroll
  const isAnyHidden = Array.from(categoryBlocks).some((block) => block.classList.contains('is-hidden'));
  if (isAnyHidden) return;

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

/* === HEADER FIXO COM CONTROLE DE VISIBILIDADE ==================
   - Fixo ao rolar a página.
   - Some quando o menu de filtros (.filter-bar) estiver fixado no topo.
   - Some quando chegar na última dobra da página (seção #contato e rodapé).
   ============================================================= */
const siteHeader = document.querySelector('.site-header');
const filterBar = document.querySelector('.filter-bar');
const portfolioSection = document.querySelector('#trabalhos');
const contactSection = document.querySelector('#contato');

let headerScrollTicking = false;

function updateHeaderVisibility() {
  if (!siteHeader) return;

  // 1. Menu de filtros fixo no topo:
  let isFilterSticky = false;
  if (filterBar && portfolioSection) {
    const filterRect = filterBar.getBoundingClientRect();
    const portfolioRect = portfolioSection.getBoundingClientRect();
    isFilterSticky = filterRect.top <= 25 && portfolioRect.bottom > 50;
  }

  // 2. Última dobra da página (Contato e Rodapé):
  let isLastFold = false;
  if (contactSection) {
    const contactRect = contactSection.getBoundingClientRect();
    isLastFold = contactRect.top <= 120;
  }

  const shouldHideHeader = isFilterSticky || isLastFold;
  siteHeader.classList.toggle('is-hidden-header', shouldHideHeader);
}

window.addEventListener('scroll', () => {
  if (!headerScrollTicking) {
    requestAnimationFrame(() => {
      updateHeaderVisibility();
      headerScrollTicking = false;
    });
    headerScrollTicking = true;
  }
}, { passive: true });

window.addEventListener('resize', updateHeaderVisibility, { passive: true });
updateHeaderVisibility();

/* === FORMULÁRIO — Web3Forms ====================================
   Os e-mails chegam direto no Gmail da Kelly via Web3Forms.
   ============================================================= */

/**
 * Envia um formulário para a API Web3Forms de forma assíncrona.
 * @param {HTMLFormElement} form - Formulário a ser enviado
 * @param {string} successHTML  - HTML a ser exibido após envio bem-sucedido
 */
async function submitWeb3Form(form, successHTML) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.innerHTML;

  submitBtn.innerHTML = 'Enviando… <span aria-hidden="true">↻</span>';
  submitBtn.disabled = true;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const result = await response.json();

    if (result.success) {
      form.innerHTML = successHTML;
    } else {
      submitBtn.innerHTML = 'Tentar novamente <span aria-hidden="true">↻</span>';
      submitBtn.disabled = false;
      console.warn('Web3Forms error:', result);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
    if (error.name !== 'AbortError') {
      console.error('Erro ao enviar:', error);
    }
  }
}

const briefingForm = document.querySelector('.briefing-form');
if (briefingForm) {
  briefingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitWeb3Form(briefingForm, `
      <div class="form-success">
        <span class="form-check">✓</span>
        <p>Briefing recebido!</p>
        <small>Já caiu na minha caixa de entrada. Em breve entro em contato.<br>Prefere ir direto? <a href="mailto:marketing.kellymorais@gmail.com">marketing.kellymorais@gmail.com</a></small>
      </div>
    `);
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

/* === POPUPS DE CONTATO (LINKTREE & BRIEFING) =================== */
const modalLinktree = document.getElementById('modal-linktree');
const modalEmailForm = document.getElementById('modal-email-form');
const btnOpenEmailModal = document.getElementById('btn-open-email-modal');
const btnBackToLinktree = document.getElementById('btn-back-to-linktree');
const contactTriggers = document.querySelectorAll('[data-open-contact]');

const openModal = (modal) => {
  if (!modal) return;
  modal.classList.add('is-active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeModal = (modal) => {
  if (!modal) return;
  modal.classList.remove('is-active');
  modal.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.contact-modal.is-active')) {
    document.body.style.overflow = '';
  }
};

const closeAllModals = () => {
  document.querySelectorAll('.contact-modal').forEach((modal) => closeModal(modal));
};

// Abrir popup Linktree ao clicar em qualquer CTA configurado
contactTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    closeAllModals();
    openModal(modalLinktree);
  });
});

// Abrir diretamente o popup de e-mail / formulário de briefing
document.querySelectorAll('[data-open-email-modal]').forEach((trigger) => {
  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    closeAllModals();
    openModal(modalEmailForm);
  });
});

// Transição do Linktree para o Formulário de E-mail
if (btnOpenEmailModal) {
  btnOpenEmailModal.addEventListener('click', () => {
    closeModal(modalLinktree);
    openModal(modalEmailForm);
  });
}

// Botão voltar do Formulário para o Linktree
if (btnBackToLinktree) {
  btnBackToLinktree.addEventListener('click', () => {
    closeModal(modalEmailForm);
    openModal(modalLinktree);
  });
}

// Fechar modais ao clicar em backdrop ou botão de fechar
document.querySelectorAll('[data-close-modal]').forEach((elem) => {
  elem.addEventListener('click', () => closeAllModals());
});

// Fechar com a tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllModals();
});

// Envio assíncrono do formulário dentro do popup modal
const modalBriefingForm = document.querySelector('.modal-briefing-form');
if (modalBriefingForm) {
  modalBriefingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    submitWeb3Form(modalBriefingForm, `
      <div class="form-success" style="padding: 20px 0; text-align: center;">
        <span class="form-check" style="margin: 0 auto 10px;">✓</span>
        <p style="font-size: 18px;">Briefing recebido!</p>
        <small style="display: block; margin-top: 8px;">Chegou direto na caixa de entrada da Kelly.<br>Em breve ela responderá sua proposta!</small>
      </div>
    `);
  });
}
