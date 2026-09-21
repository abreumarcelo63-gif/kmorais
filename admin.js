/**
 * KMORAIS - Painel de Controle Administrativo (In-Place Editor)
 * Senha configurada: @marcelo123
 */

const ADMIN_PASSWORD_HASH = '@marcelo123';
const AUTH_SESSION_KEY = 'km_admin_authenticated';

class KMAdminPanel {
  constructor() {
    this.authOverlay = document.getElementById('admin-auth-overlay');
    this.loginForm = document.getElementById('admin-login-form');
    this.loginInput = document.getElementById('admin-password-input');
    this.loginError = document.getElementById('admin-login-error');
    this.mediaModal = document.getElementById('admin-media-modal');
    this.currentEditingMedia = null;

    this.initAuth();
  }

  initAuth() {
    const isAuth = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
    if (isAuth) {
      this.unlockAdmin();
    } else {
      this.lockAdmin();
    }

    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pwd = this.loginInput.value.trim();
        if (pwd === ADMIN_PASSWORD_HASH) {
          sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
          this.loginError.style.display = 'none';
          this.unlockAdmin();
        } else {
          this.loginError.style.display = 'block';
          this.loginInput.value = '';
          this.loginInput.focus();
        }
      });
    }
  }

  lockAdmin() {
    if (this.authOverlay) {
      this.authOverlay.classList.remove('is-hidden');
    }
    document.body.classList.remove('is-admin-mode');
  }

  unlockAdmin() {
    if (this.authOverlay) {
      this.authOverlay.classList.add('is-hidden');
    }
    document.body.classList.add('is-admin-mode');

    // Inicializa a barra e ferramentas de edição
    this.setupEditableElements();
    this.setupMediaButtons();
    this.setupToolbar();
    this.setupMediaModal();
  }

  setupEditableElements() {
    // Lista de seletores de textos editáveis seguros
    const textSelectors = [
      '#hero-title',
      '.hero-text',
      '.hero-copy .eyebrow',
      '.hero-sticker',
      '#brands-title',
      '#portfolio-title',
      '.portfolio .section-intro',
      '.category-head h3',
      '.category-head p',
      '.video-meta span:first-child',
      '#about-title',
      '.about-content p:nth-of-type(2)',
      '#services-title',
      '.service-card h3',
      '.service-card p',
      '.stats-row strong',
      '.stats-row span',
      '#contact-title',
      '.contact-note-item a'
    ];

    textSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
        el.setAttribute('data-editable', 'text');

        // Previne navegação se o elemento for um link enquanto edita
        el.addEventListener('click', (e) => {
          if (el.tagName === 'A') {
            e.preventDefault();
          }
        });

        // Impede quebra de linha indevida com formatações malucas
        el.addEventListener('paste', (e) => {
          e.preventDefault();
          const text = (e.originalEvent || e).clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        });
      });
    });
  }

  setupMediaButtons() {
    // 1. Hero Video
    const heroFrame = document.querySelector('.hero-frame');
    if (heroFrame && !heroFrame.querySelector('.admin-edit-media-btn')) {
      const btn = document.createElement('button');
      btn.className = 'admin-edit-media-btn';
      btn.innerHTML = '✏ Editar Vídeo do Hero';
      btn.type = 'button';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const video = heroFrame.querySelector('video');
        const source = video?.querySelector('source');
        this.openMediaModal({
          title: 'Editar Vídeo da Primeira Dobra (Hero)',
          type: 'hero',
          videoUrl: source ? source.src : (video ? video.src : ''),
          posterUrl: video ? video.poster : '',
          onSave: (data) => {
            if (source) source.src = data.videoUrl;
            if (video) {
              video.poster = data.posterUrl;
              video.load();
              video.play().catch(() => {});
            }
          }
        });
      });
      heroFrame.appendChild(btn);
    }

    // 2. Video Cards do Portfólio
    document.querySelectorAll('.video-card').forEach((card, index) => {
      if (card.querySelector('.admin-edit-media-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'admin-edit-media-btn';
      btn.innerHTML = '✏ Editar Vídeo';
      btn.type = 'button';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const video = card.querySelector('video');
        const source = video?.querySelector('source');
        const metaSpan = card.querySelector('.video-meta span:first-child');

        this.openMediaModal({
          title: `Editar Vídeo do Card #${index + 1}`,
          type: 'video',
          videoUrl: source ? source.src : (video ? video.src : ''),
          posterUrl: video ? video.poster : '',
          label: metaSpan ? metaSpan.textContent.trim() : '',
          onSave: (data) => {
            if (source) source.src = data.videoUrl;
            if (video) {
              video.poster = data.posterUrl;
              video.load();
            }
            if (metaSpan && data.label) {
              metaSpan.textContent = data.label;
            }
          }
        });
      });
      card.appendChild(btn);
    });

    // 3. Imagem da Kelly (Sobre)
    const aboutImageWrap = document.querySelector('.about-image');
    if (aboutImageWrap && !aboutImageWrap.querySelector('.admin-edit-media-btn')) {
      const btn = document.createElement('button');
      btn.className = 'admin-edit-media-btn';
      btn.innerHTML = '✏ Trocar Foto';
      btn.type = 'button';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const img = aboutImageWrap.querySelector('img');
        this.openMediaModal({
          title: 'Trocar Foto da Kelly (Seção Sobre)',
          type: 'image',
          posterUrl: img ? img.src : '',
          onSave: (data) => {
            if (img && data.posterUrl) {
              img.src = data.posterUrl;
            }
          }
        });
      });
      aboutImageWrap.appendChild(btn);
    }

    // 4. Cases Reais ("Cases que saem da tela.")
    document.querySelectorAll('.real-case').forEach((caseEl, index) => {
      if (caseEl.querySelector('.admin-edit-media-btn')) return;
      caseEl.style.position = 'relative';

      // Impede que o clique no link leve ao Instagram enquanto edita
      caseEl.addEventListener('click', (e) => {
        if (!e.target.closest('.admin-edit-media-btn')) {
          e.preventDefault();
        }
      });

      const btn = document.createElement('button');
      btn.className = 'admin-edit-media-btn';
      btn.innerHTML = '✏ Editar Capa e Link';
      btn.type = 'button';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const cover = caseEl.querySelector('.real-case-cover');
        let currentCover = caseEl.dataset.coverUrl || '';
        if (!currentCover && cover) {
          const match = cover.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
          if (match) currentCover = match[1];
        }
        const currentLink = caseEl.getAttribute('href') || '';
        const currentTag = caseEl.querySelector('.real-case-content span')?.textContent.trim() || '';

        this.openMediaModal({
          title: `Editar Case #${index + 1} ("Cases que saem da tela")`,
          type: 'case',
          posterUrl: currentCover,
          linkUrl: currentLink,
          label: currentTag,
          onSave: (data) => {
            if (cover && data.posterUrl) {
              cover.style.backgroundImage = `url("${data.posterUrl}")`;
              caseEl.dataset.coverUrl = data.posterUrl;
            }
            if (data.linkUrl) {
              caseEl.href = data.linkUrl;
            }
            const tagEl = caseEl.querySelector('.real-case-content span');
            if (tagEl && data.label) {
              tagEl.textContent = data.label;
            }
          }
        });
      });
      caseEl.appendChild(btn);
    });

    // 5. Últimos Posts do Instagram ("O que está no ar agora.")
    document.querySelectorAll('.photo-card').forEach((photoEl, index) => {
      if (photoEl.querySelector('.admin-edit-media-btn')) return;
      photoEl.style.position = 'relative';

      photoEl.addEventListener('click', (e) => {
        if (!e.target.closest('.admin-edit-media-btn')) {
          e.preventDefault();
        }
      });

      const btn = document.createElement('button');
      btn.className = 'admin-edit-media-btn';
      btn.innerHTML = '✏ Trocar Foto e Link';
      btn.type = 'button';
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const img = photoEl.querySelector('img');
        const span = photoEl.querySelector('span');
        const currentImg = img ? img.src : '';
        const currentLink = photoEl.getAttribute('href') || '';
        const currentLabel = span ? span.innerText.replace('↗', '').trim() : '';

        this.openMediaModal({
          title: `Editar Post #${index + 1} ("O que está no ar agora")`,
          type: 'instagram',
          posterUrl: currentImg,
          linkUrl: currentLink,
          label: currentLabel,
          onSave: (data) => {
            if (img && data.posterUrl) {
              img.src = data.posterUrl;
            }
            if (data.linkUrl) {
              photoEl.href = data.linkUrl;
            }
            if (span && data.label) {
              span.innerHTML = `${data.label} <b>&#8599;</b>`;
            }
          }
        });
      });
      photoEl.appendChild(btn);
    });
  }

  setupToolbar() {
    const saveBtn = document.getElementById('admin-save-btn');
    const resetBtn = document.getElementById('admin-reset-btn');
    const logoutBtn = document.getElementById('admin-logout-btn');

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveAllChanges());
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja restaurar os textos e vídeos padrões do site original?')) {
          localStorage.removeItem(KM_CMS_STORAGE_KEY);
          location.reload();
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem(AUTH_SESSION_KEY);
        location.reload();
      });
    }
  }

  setupMediaModal() {
    if (!this.mediaModal) return;

    const closeBtn = this.mediaModal.querySelector('.admin-modal-close');
    const cancelBtn = document.getElementById('admin-modal-cancel');
    const saveBtn = document.getElementById('admin-modal-save');

    const closeModal = () => {
      this.mediaModal.classList.remove('is-open');
      this.currentEditingMedia = null;
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    this.mediaModal.addEventListener('click', (e) => {
      if (e.target === this.mediaModal) closeModal();
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        if (!this.currentEditingMedia) return;

        const videoUrl = document.getElementById('admin-modal-video-url')?.value.trim();
        const posterUrl = document.getElementById('admin-modal-poster-url')?.value.trim();
        const label = document.getElementById('admin-modal-label')?.value.trim();
        const linkUrl = document.getElementById('admin-modal-link-url')?.value.trim();

        if (this.currentEditingMedia.onSave) {
          this.currentEditingMedia.onSave({ videoUrl, posterUrl, label, linkUrl });
        }

        closeModal();
        this.showToast('Mídia atualizada no editor!');
      });
    }
  }

  openMediaModal({ title, type, videoUrl = '', posterUrl = '', label = '', linkUrl = '', onSave }) {
    if (!this.mediaModal) return;

    this.currentEditingMedia = { type, onSave };

    const modalTitle = document.getElementById('admin-modal-title');
    const videoGroup = document.getElementById('admin-modal-video-group');
    const labelGroup = document.getElementById('admin-modal-label-group');
    const linkGroup = document.getElementById('admin-modal-link-group');

    const videoInput = document.getElementById('admin-modal-video-url');
    const posterInput = document.getElementById('admin-modal-poster-url');
    const labelInput = document.getElementById('admin-modal-label');
    const linkInput = document.getElementById('admin-modal-link-url');

    if (modalTitle) modalTitle.textContent = title || 'Editar Mídia';
    if (videoInput) videoInput.value = videoUrl;
    if (posterInput) posterInput.value = posterUrl;
    if (labelInput) labelInput.value = label;
    if (linkInput) linkInput.value = linkUrl;

    // Ajusta campos conforme o tipo de mídia
    if (type === 'case' || type === 'instagram') {
      if (videoGroup) videoGroup.style.display = 'none';
      if (linkGroup) linkGroup.style.display = 'block';
      if (labelGroup) labelGroup.style.display = 'block';
    } else if (type === 'image') {
      if (videoGroup) videoGroup.style.display = 'none';
      if (linkGroup) linkGroup.style.display = 'none';
      if (labelGroup) labelGroup.style.display = 'none';
    } else {
      if (videoGroup) videoGroup.style.display = 'block';
      if (linkGroup) linkGroup.style.display = 'none';
      if (labelGroup) labelGroup.style.display = type === 'video' ? 'block' : 'none';
    }

    this.mediaModal.classList.add('is-open');
  }

  saveAllChanges() {
    // 1. Extrai todos os dados atuais do DOM
    const heroEyebrow = document.querySelector('.hero-copy .eyebrow')?.innerText.replace('✦', '').trim();
    const heroTitle = document.querySelector('#hero-title')?.innerHTML.trim();
    const heroText = document.querySelector('.hero-text')?.innerHTML.trim();
    const heroSticker = document.querySelector('.hero-sticker')?.innerHTML.trim();

    const heroVideo = document.querySelector('.hero-frame video');
    const heroSource = heroVideo?.querySelector('source');

    const brandsTitle = document.querySelector('#brands-title')?.innerHTML.trim();
    const portfolioTitle = document.querySelector('#portfolio-title')?.innerHTML.trim();
    const portfolioIntro = document.querySelector('.portfolio .section-intro')?.innerHTML.trim();

    // 30 Vídeos
    const portfolioVideos = [];
    document.querySelectorAll('.video-card').forEach((card) => {
      const video = card.querySelector('video');
      const source = video?.querySelector('source');
      const label = card.querySelector('.video-meta span:first-child')?.textContent.trim();

      portfolioVideos.push({
        video: source ? source.src : (video ? video.src : ''),
        poster: video ? video.poster : '',
        label: label || ''
      });
    });

    // Cases Reais ("Cases que saem da tela.")
    const realCases = [];
    document.querySelectorAll('.real-case').forEach((caseEl) => {
      const cover = caseEl.querySelector('.real-case-cover');
      let bgUrl = caseEl.dataset.coverUrl || '';
      if (!bgUrl && cover) {
        const match = cover.style.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
        if (match) bgUrl = match[1];
      }
      const tag = caseEl.querySelector('.real-case-content span')?.innerHTML.trim();
      const title = caseEl.querySelector('.real-case-content h3')?.innerHTML.trim();
      const desc = caseEl.querySelector('.real-case-content p')?.innerHTML.trim();

      realCases.push({
        cover: bgUrl,
        link: caseEl.getAttribute('href') || '',
        tag: tag || '',
        title: title || '',
        desc: desc || ''
      });
    });

    // Últimos Posts do Instagram ("O que está no ar agora.")
    const instagramPosts = [];
    document.querySelectorAll('.photo-card').forEach((card) => {
      const img = card.querySelector('img');
      const span = card.querySelector('span');
      const label = span ? span.innerText.replace('↗', '').trim() : '';

      instagramPosts.push({
        image: img ? img.src : '',
        link: card.getAttribute('href') || '',
        label: label || ''
      });
    });

    // Sobre
    const aboutTitle = document.querySelector('#about-title')?.innerHTML.trim();
    const aboutBio = document.querySelector('.about-content p:nth-of-type(2)')?.innerHTML.trim();
    const aboutImage = document.querySelector('.about-image img')?.src;

    // Contato
    const contactTitle = document.querySelector('#contact-title')?.innerHTML.trim();
    const contactEmail = document.querySelector('a[href^="mailto:"]')?.textContent.trim();
    const contactWa = document.querySelector('a[href*="wa.me"]')?.textContent.trim();
    const contactWaLink = document.querySelector('a[href*="wa.me"]')?.getAttribute('href');

    const contentToSave = {
      hero: {
        eyebrow: heroEyebrow,
        title: heroTitle,
        text: heroText,
        sticker: heroSticker,
        video: heroSource ? heroSource.src : (heroVideo ? heroVideo.src : ''),
        poster: heroVideo ? heroVideo.poster : ''
      },
      brandsTitle,
      portfolioTitle,
      portfolioIntro,
      portfolioVideos,
      realCases,
      instagramPosts,
      about: {
        title: aboutTitle,
        bio: aboutBio,
        image: aboutImage
      },
      contact: {
        title: contactTitle,
        email: contactEmail,
        whatsapp: contactWa,
        whatsappLink: contactWaLink
      }
    };

    // Salva via motor CMS
    kmCMS.saveContent(contentToSave);

    this.showToast('✓ Alterações salvas! A página principal já foi atualizada.');
  }

  showToast(message) {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.className = 'admin-toast';
      toast.innerHTML = `<span class="admin-toast-check">✓</span> <span class="admin-toast-msg">${message}</span>`;
      document.body.appendChild(toast);
    } else {
      toast.querySelector('.admin-toast-msg').textContent = message;
    }

    toast.classList.add('is-visible');
    setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 3800);
  }
}

// Inicializa no carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
  new KMAdminPanel();
});

