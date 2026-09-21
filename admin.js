/**
 * KMORAIS - Painel de Controle Administrativo (In-Place Editor)
 * Senha configurada: @marcelo123
 */

const ADMIN_PASSWORD_HASH = '@marcelo123';
const AUTH_SESSION_KEY = 'km_admin_authenticated';

function normalizeVideoUrl(url) {
  if (!url || typeof url !== 'string') return '';
  url = url.trim();

  // 1. Google Drive (converte link de compartilhamento para stream direto)
  const driveMatch = url.match(/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?id=([a-zA-Z0-9_-]+))/);
  if (driveMatch) {
    const fileId = driveMatch[1] || driveMatch[2];
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // 2. Dropbox (dl=0 -> raw=1 para streaming direto)
  if (url.includes('dropbox.com') && url.includes('dl=0')) {
    return url.replace('dl=0', 'raw=1');
  }

  return url;
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function compressImageFile(file, maxWidth = 1280, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      resolve(null);
      return;
    }

    // Para SVGs, preserva vetor puro via Data URL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const isPng = file.type === 'image/png';
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        if (isPng) {
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

class KMAdminPanel {
  constructor() {
    this.authOverlay = document.getElementById('admin-auth-overlay');
    this.loginForm = document.getElementById('admin-login-form');
    this.loginInput = document.getElementById('admin-password-input');
    this.loginError = document.getElementById('admin-login-error');
    this.mediaModal = document.getElementById('admin-media-modal');
    this.currentEditingMedia = null;
    this.selectedVideoFile = null;
    this.selectedPosterFile = null;
    this.videoDropzoneCtrl = null;
    this.posterDropzoneCtrl = null;

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
    // 0. Marcas (Brand Pills)
    document.querySelectorAll('.brands-grid .brand-pill').forEach((pill, index) => {
      if (pill.querySelector('.admin-edit-brand-btn')) return;
      pill.style.position = 'relative';

      const circle = pill.querySelector('.brand-pill-circle');
      const brandName = pill.getAttribute('title') || circle?.querySelector('.brand-name')?.textContent.trim() || `Marca #${index + 1}`;

      const btn = document.createElement('button');
      btn.className = 'admin-edit-brand-btn';
      btn.innerHTML = '✏';
      btn.title = `Trocar ícone/logo da marca ${brandName}`;
      btn.type = 'button';

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();

        const currentImg = circle?.querySelector('img.brand-logo-img')?.src || circle?.dataset?.customLogo || '';
        const currentId = circle?.dataset?.mediaId || '';
        const currentTitle = pill.getAttribute('title') || brandName;

        this.openMediaModal({
          title: `Editar Marca #${index + 1} (${currentTitle})`,
          type: 'brand',
          posterUrl: currentId || currentImg,
          label: currentTitle,
          onSave: (data) => {
            if (data.label) {
              pill.title = data.label;
            }
            if (data.posterUrl) {
              circle.classList.add('has-custom-logo');
              circle.dataset.customLogo = data.posterUrl;
              if (data.posterId) circle.dataset.mediaId = data.posterId;
              else delete circle.dataset.mediaId;

              let img = circle.querySelector('img.brand-logo-img');
              if (!img) {
                circle.innerHTML = `<img src="${data.posterUrl}" alt="${data.label || currentTitle}" class="brand-logo-img">`;
              } else {
                img.src = data.posterUrl;
                img.alt = data.label || currentTitle;
              }
            } else {
              circle.classList.remove('has-custom-logo');
              delete circle.dataset.customLogo;
              delete circle.dataset.mediaId;
              if (data.label) {
                circle.innerHTML = `<span class="brand-name">${data.label}</span>`;
              }
            }
          }
        });
      });
      pill.appendChild(btn);
    });

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
        const currentVid = source?.dataset?.mediaId || (source ? source.src : (video ? video.src : ''));
        const currentPost = video?.dataset?.posterId || (video ? video.poster : '');
        this.openMediaModal({
          title: 'Editar Vídeo da Primeira Dobra (Hero)',
          type: 'hero',
          videoUrl: currentVid,
          posterUrl: currentPost,
          onSave: (data) => {
            const finalUrl = normalizeVideoUrl(data.videoUrl);
            if (source) {
              source.src = finalUrl;
              if (data.videoId) source.dataset.mediaId = data.videoId;
              else delete source.dataset.mediaId;
            }
            if (video) {
              video.src = finalUrl;
              if (data.posterUrl) video.poster = data.posterUrl;
              if (data.posterId) video.dataset.posterId = data.posterId;
              else delete video.dataset.posterId;
              video.load();
              const p = video.play();
              if (p !== undefined) {
                p.catch(() => {
                  video.muted = true;
                  video.play().catch(() => {});
                });
              }
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
        const currentVid = source?.dataset?.mediaId || (source ? source.src : (video ? video.src : ''));
        const currentPost = video?.dataset?.posterId || (video ? video.poster : '');

        this.openMediaModal({
          title: `Editar Vídeo do Card #${index + 1}`,
          type: 'video',
          videoUrl: currentVid,
          posterUrl: currentPost,
          label: metaSpan ? metaSpan.textContent.trim() : '',
          onSave: (data) => {
            const finalUrl = normalizeVideoUrl(data.videoUrl);
            if (source) {
              source.src = finalUrl;
              if (data.videoId) source.dataset.mediaId = data.videoId;
              else delete source.dataset.mediaId;
            }
            if (video) {
              video.src = finalUrl;
              if (data.posterUrl) video.poster = data.posterUrl;
              if (data.posterId) video.dataset.posterId = data.posterId;
              else delete video.dataset.posterId;
              video.load();
            }
            if (finalUrl.includes('instagram.com') || finalUrl.includes('tiktok.com')) {
              card.dataset.externalUrl = finalUrl;
            } else {
              delete card.dataset.externalUrl;
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
          posterUrl: img?.dataset?.mediaId || (img ? img.src : ''),
          onSave: (data) => {
            if (img && data.posterUrl) {
              img.src = data.posterUrl;
              if (data.posterId) img.dataset.mediaId = data.posterId;
              else delete img.dataset.mediaId;
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
          posterUrl: caseEl.dataset.coverId || currentCover,
          linkUrl: currentLink,
          label: currentTag,
          onSave: (data) => {
            if (cover && data.posterUrl) {
              cover.style.backgroundImage = `url("${data.posterUrl}")`;
              caseEl.dataset.coverUrl = data.posterUrl;
              if (data.posterId) caseEl.dataset.coverId = data.posterId;
              else delete caseEl.dataset.coverId;
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
        const currentImg = img?.dataset?.mediaId || (img ? img.src : '');
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
              if (data.posterId) img.dataset.mediaId = data.posterId;
              else delete img.dataset.mediaId;
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

    const viewBtn = document.querySelector('.admin-btn-view');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        this.saveAllChanges();
      });
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

    const feedbackEl = document.getElementById('admin-video-url-feedback');
    const videoUrlInput = document.getElementById('admin-modal-video-url');

    const updateVideoFeedback = () => {
      if (!feedbackEl || !videoUrlInput) return;
      const val = videoUrlInput.value.trim();
      if (!val) {
        feedbackEl.className = 'admin-url-feedback is-hidden';
        feedbackEl.textContent = '';
        return;
      }

      const normalized = normalizeVideoUrl(val);
      if (normalized !== val) {
        videoUrlInput.value = normalized;
        feedbackEl.className = 'admin-url-feedback info';
        feedbackEl.textContent = '✓ Link de nuvem (Google Drive / Dropbox) ajustado automaticamente para streaming direto!';
        return;
      }

      if (val.includes('instagram.com/reel') || val.includes('instagram.com/p')) {
        feedbackEl.className = 'admin-url-feedback warn';
        feedbackEl.textContent = 'ℹ️ Link de post do Instagram detectado: o card abrirá o Reel ao ser clicado. Para reproduzir o vídeo diretamente na página, envie o arquivo MP4 na aba "📁 Subir do PC".';
        return;
      }

      if (val.includes('tiktok.com')) {
        feedbackEl.className = 'admin-url-feedback warn';
        feedbackEl.textContent = 'ℹ️ Link do TikTok detectado: o card abrirá o TikTok ao ser clicado. Para reproduzir o vídeo diretamente na página, envie o arquivo MP4 na aba "📁 Subir do PC".';
        return;
      }

      if (val.match(/\.(mp4|webm|mov|m4v)(\?.*)?$/i) || val.includes('cloudinary') || val.includes('storage.googleapis') || val.includes('amazonaws')) {
        feedbackEl.className = 'admin-url-feedback success';
        feedbackEl.textContent = '✓ Link direto de vídeo reconhecido (.mp4 / streaming)';
        return;
      }

      feedbackEl.className = 'admin-url-feedback info';
      feedbackEl.textContent = '▶️ Link inserido. Certifique-se de que o arquivo é público e acessível.';
    };

    videoUrlInput?.addEventListener('input', updateVideoFeedback);
    videoUrlInput?.addEventListener('change', updateVideoFeedback);
    this.updateVideoFeedback = updateVideoFeedback;

    const closeModal = () => {
      this.mediaModal.classList.remove('is-open');
      this.currentEditingMedia = null;
      this.selectedVideoFile = null;
      this.selectedPosterFile = null;
      this.videoDropzoneCtrl?.reset();
      this.posterDropzoneCtrl?.reset();
      if (feedbackEl) {
        feedbackEl.className = 'admin-url-feedback is-hidden';
        feedbackEl.textContent = '';
      }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    this.mediaModal.addEventListener('click', (e) => {
      if (e.target === this.mediaModal) closeModal();
    });

    // Abas (Link vs Subir do PC)
    const tabButtons = this.mediaModal.querySelectorAll('.admin-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.closest('.admin-modal-group');
        const tabName = btn.dataset.tab; // 'url' ou 'file'
        group.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        group.querySelectorAll('.admin-tab-content').forEach(c => {
          c.classList.remove('is-active');
          if (c.dataset.tabContent.endsWith(tabName)) {
            c.classList.add('is-active');
          }
        });
      });
    });

    // Configuração do Dropzone de Vídeo
    this.videoDropzoneCtrl = this.initDropzone({
      dropzoneId: 'video-dropzone',
      fileInputId: 'admin-modal-video-file',
      emptyId: 'video-dropzone-empty',
      selectedId: 'video-dropzone-selected',
      nameId: 'video-file-name',
      removeId: 'video-file-remove',
      onSelect: (file) => {
        this.selectedVideoFile = file;
      },
      onRemove: () => {
        this.selectedVideoFile = null;
      }
    });

    // Configuração do Dropzone de Imagem/Poster
    this.posterDropzoneCtrl = this.initDropzone({
      dropzoneId: 'poster-dropzone',
      fileInputId: 'admin-modal-poster-file',
      emptyId: 'poster-dropzone-empty',
      selectedId: 'poster-dropzone-selected',
      nameId: 'poster-file-name',
      removeId: 'poster-file-remove',
      onSelect: (file) => {
        this.selectedPosterFile = file;
      },
      onRemove: () => {
        this.selectedPosterFile = null;
      }
    });

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        if (!this.currentEditingMedia) return;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Processando...';

        try {
          let rawVideoUrl = document.getElementById('admin-modal-video-url')?.value.trim() || '';
          let finalVideoUrl = normalizeVideoUrl(rawVideoUrl);
          let finalVideoId = null;

          if (this.selectedVideoFile) {
            const mediaId = `idb:video_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            await kmMediaStore.saveMedia(mediaId, this.selectedVideoFile, this.selectedVideoFile.type);
            finalVideoUrl = URL.createObjectURL(this.selectedVideoFile);
            finalVideoId = mediaId;
          } else if (this.currentEditingMedia.currentVideoId && !finalVideoUrl) {
            finalVideoId = this.currentEditingMedia.currentVideoId;
            finalVideoUrl = await kmMediaStore.resolveUrl(finalVideoId);
          }

          let finalPosterUrl = document.getElementById('admin-modal-poster-url')?.value.trim();
          let finalPosterId = null;

          if (this.selectedPosterFile) {
            const mediaId = `idb:img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            await kmMediaStore.saveMedia(mediaId, this.selectedPosterFile, this.selectedPosterFile.type);
            const compressed = await compressImageFile(this.selectedPosterFile);
            finalPosterUrl = compressed || URL.createObjectURL(this.selectedPosterFile);
            finalPosterId = mediaId;
          } else if (this.currentEditingMedia.currentPosterId && !finalPosterUrl) {
            finalPosterId = this.currentEditingMedia.currentPosterId;
            finalPosterUrl = await kmMediaStore.resolveUrl(finalPosterId);
          }

          const label = document.getElementById('admin-modal-label')?.value.trim();
          const linkUrl = document.getElementById('admin-modal-link-url')?.value.trim();

          if (this.currentEditingMedia.onSave) {
            this.currentEditingMedia.onSave({
              videoUrl: finalVideoUrl,
              videoId: finalVideoId,
              posterUrl: finalPosterUrl,
              posterId: finalPosterId,
              label,
              linkUrl
            });
          }

          closeModal();
          this.showToast('Mídia atualizada no editor!');
        } catch (err) {
          console.error('Erro ao processar mídia:', err);
          alert('Houve um erro ao processar a mídia. Tente novamente.');
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Aplicar';
        }
      });
    }
  }

  initDropzone({ dropzoneId, fileInputId, emptyId, selectedId, nameId, removeId, onSelect, onRemove }) {
    const dropzone = document.getElementById(dropzoneId);
    const fileInput = document.getElementById(fileInputId);
    const emptyEl = document.getElementById(emptyId);
    const selectedEl = document.getElementById(selectedId);
    const nameEl = document.getElementById(nameId);
    const removeBtn = document.getElementById(removeId);

    if (!dropzone || !fileInput) return null;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('is-dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('is-dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        fileInput.files = files;
        handleFile(files[0]);
      }
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        handleFile(fileInput.files[0]);
      }
    });

    const handleFile = (file) => {
      if (nameEl) nameEl.textContent = `${file.name} (${formatFileSize(file.size)})`;
      if (emptyEl) emptyEl.classList.add('is-hidden');
      if (selectedEl) selectedEl.classList.remove('is-hidden');
      if (onSelect) onSelect(file);
    };

    const reset = () => {
      fileInput.value = '';
      if (nameEl) nameEl.textContent = '';
      if (emptyEl) emptyEl.classList.remove('is-hidden');
      if (selectedEl) selectedEl.classList.add('is-hidden');
      if (onRemove) onRemove();
    };

    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        reset();
      });
    }

    return {
      reset,
      setDisplay: (text) => {
        if (nameEl) nameEl.textContent = text;
        if (emptyEl) emptyEl.classList.add('is-hidden');
        if (selectedEl) selectedEl.classList.remove('is-hidden');
      }
    };
  }

  openMediaModal({ title, type, videoUrl = '', posterUrl = '', label = '', linkUrl = '', onSave }) {
    if (!this.mediaModal) return;

    this.selectedVideoFile = null;
    this.selectedPosterFile = null;
    this.videoDropzoneCtrl?.reset();
    this.posterDropzoneCtrl?.reset();

    const currentVideoId = (typeof videoUrl === 'string' && videoUrl.startsWith('idb:')) ? videoUrl : null;
    const currentPosterId = (typeof posterUrl === 'string' && posterUrl.startsWith('idb:')) ? posterUrl : null;

    this.currentEditingMedia = { type, currentVideoId, currentPosterId, onSave };

    const modalTitle = document.getElementById('admin-modal-title');
    const videoGroup = document.getElementById('admin-modal-video-group');
    const labelGroup = document.getElementById('admin-modal-label-group');
    const linkGroup = document.getElementById('admin-modal-link-group');

    const videoInput = document.getElementById('admin-modal-video-url');
    const posterInput = document.getElementById('admin-modal-poster-url');
    const labelInput = document.getElementById('admin-modal-label');
    const linkInput = document.getElementById('admin-modal-link-url');

    if (modalTitle) modalTitle.textContent = title || 'Editar Mídia';
    if (labelInput) labelInput.value = label;
    if (linkInput) linkInput.value = linkUrl;

    // Configura aba do Vídeo
    if (videoGroup) {
      const vidBtnUrl = videoGroup.querySelector('.admin-tab-btn[data-tab="url"]');
      const vidBtnFile = videoGroup.querySelector('.admin-tab-btn[data-tab="file"]');
      const vidContentUrl = videoGroup.querySelector('.admin-tab-content[data-tab-content="video-url"]');
      const vidContentFile = videoGroup.querySelector('.admin-tab-content[data-tab-content="video-file"]');

      if (currentVideoId) {
        if (videoInput) videoInput.value = '';
        vidBtnUrl?.classList.remove('is-active');
        vidBtnFile?.classList.add('is-active');
        vidContentUrl?.classList.remove('is-active');
        vidContentFile?.classList.add('is-active');
        this.videoDropzoneCtrl?.setDisplay('Vídeo do PC salvo no banco');
      } else {
        if (videoInput) videoInput.value = videoUrl || '';
        vidBtnUrl?.classList.add('is-active');
        vidBtnFile?.classList.remove('is-active');
        vidContentUrl?.classList.add('is-active');
        vidContentFile?.classList.remove('is-active');
      }
    }

    // Configura aba do Poster / Foto
    const posterGroup = document.getElementById('admin-modal-poster-group');
    if (posterGroup) {
      const posBtnUrl = posterGroup.querySelector('.admin-tab-btn[data-tab="url"]');
      const posBtnFile = posterGroup.querySelector('.admin-tab-btn[data-tab="file"]');
      const posContentUrl = posterGroup.querySelector('.admin-tab-content[data-tab-content="poster-url"]');
      const posContentFile = posterGroup.querySelector('.admin-tab-content[data-tab-content="poster-file"]');

      if (currentPosterId) {
        if (posterInput) posterInput.value = '';
        posBtnUrl?.classList.remove('is-active');
        posBtnFile?.classList.add('is-active');
        posContentUrl?.classList.remove('is-active');
        posContentFile?.classList.add('is-active');
        this.posterDropzoneCtrl?.setDisplay('Imagem do PC salva');
      } else if (posterUrl && posterUrl.startsWith('data:image/')) {
        if (posterInput) posterInput.value = '';
        posBtnUrl?.classList.remove('is-active');
        posBtnFile?.classList.add('is-active');
        posContentUrl?.classList.remove('is-active');
        posContentFile?.classList.add('is-active');
        this.posterDropzoneCtrl?.setDisplay('Foto do PC carregada');
      } else {
        if (posterInput) posterInput.value = posterUrl || '';
        posBtnUrl?.classList.add('is-active');
        posBtnFile?.classList.remove('is-active');
        posContentUrl?.classList.add('is-active');
        posContentFile?.classList.remove('is-active');
      }
    }

    // Ajusta rótulos dos campos dinamicamente conforme o tipo
    const posterLabel = document.getElementById('admin-modal-poster-label');
    const labelGroupLabel = labelGroup ? labelGroup.querySelector('label') : null;

    if (type === 'brand') {
      if (posterLabel) posterLabel.textContent = 'Ícone / Logo da Marca (PNG, SVG, JPG)';
      if (labelGroupLabel) labelGroupLabel.textContent = 'Nome da Marca';
    } else {
      if (posterLabel) posterLabel.textContent = 'Imagem de Capa / Foto';
      if (labelGroupLabel) labelGroupLabel.textContent = 'Rótulo / Legenda do Card';
    }

    // Ajusta visibilidade de grupos conforme o tipo de mídia
    if (type === 'brand') {
      if (videoGroup) videoGroup.style.display = 'none';
      if (linkGroup) linkGroup.style.display = 'none';
      if (labelGroup) labelGroup.style.display = 'block';
    } else if (type === 'case' || type === 'instagram') {
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

    this.updateVideoFeedback?.();
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
    const heroVideoVal = heroSource?.dataset?.mediaId || (heroSource?.src?.startsWith('blob:') ? '' : heroSource?.src) || (heroVideo?.src?.startsWith('blob:') ? '' : heroVideo?.src) || '';
    const heroPosterVal = heroVideo?.dataset?.posterId || (heroVideo?.poster?.startsWith('blob:') ? '' : heroVideo?.poster) || '';

    const brandsTitle = document.querySelector('#brands-title')?.innerHTML.trim();

    // Marcas (Brand Pills)
    const brandsList = [];
    document.querySelectorAll('.brands-grid .brand-pill').forEach((pill) => {
      const circle = pill.querySelector('.brand-pill-circle');
      const img = circle?.querySelector('img.brand-logo-img');
      const imageVal = circle?.dataset?.mediaId || (circle?.dataset?.customLogo?.startsWith('blob:') ? '' : circle?.dataset?.customLogo) || (img?.src?.startsWith('blob:') ? '' : img?.src) || '';
      const nameVal = pill.getAttribute('title') || circle?.querySelector('.brand-name')?.textContent.trim() || '';

      brandsList.push({
        name: nameVal,
        image: imageVal
      });
    });

    const portfolioTitle = document.querySelector('#portfolio-title')?.innerHTML.trim();
    const portfolioIntro = document.querySelector('.portfolio .section-intro')?.innerHTML.trim();

    // 30 Vídeos
    const portfolioVideos = [];
    document.querySelectorAll('.video-card').forEach((card) => {
      const video = card.querySelector('video');
      const source = video?.querySelector('source');
      const label = card.querySelector('.video-meta span:first-child')?.textContent.trim();
      const videoVal = source?.dataset?.mediaId || (source?.src?.startsWith('blob:') ? '' : source?.src) || (video?.src?.startsWith('blob:') ? '' : video?.src) || '';
      const posterVal = video?.dataset?.posterId || (video?.poster?.startsWith('blob:') ? '' : video?.poster) || '';

      portfolioVideos.push({
        video: videoVal,
        poster: posterVal,
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
      const coverVal = caseEl.dataset.coverId || (bgUrl?.startsWith('blob:') ? '' : bgUrl) || '';
      const tag = caseEl.querySelector('.real-case-content span')?.innerHTML.trim();
      const title = caseEl.querySelector('.real-case-content h3')?.innerHTML.trim();
      const desc = caseEl.querySelector('.real-case-content p')?.innerHTML.trim();

      realCases.push({
        cover: coverVal,
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
      const imgVal = img?.dataset?.mediaId || (img?.src?.startsWith('blob:') ? '' : img?.src) || '';

      instagramPosts.push({
        image: imgVal,
        link: card.getAttribute('href') || '',
        label: label || ''
      });
    });

    // Sobre
    const aboutTitle = document.querySelector('#about-title')?.innerHTML.trim();
    const aboutBio = document.querySelector('.about-content p:nth-of-type(2)')?.innerHTML.trim();
    const aboutImgEl = document.querySelector('.about-image img');
    const aboutImageVal = aboutImgEl?.dataset?.mediaId || (aboutImgEl?.src?.startsWith('blob:') ? '' : aboutImgEl?.src) || '';

    // Serviços & Formatos
    const servicesTitle = document.querySelector('#services-title')?.innerHTML.trim();
    const servicesList = [];
    document.querySelectorAll('.service-card').forEach((card) => {
      servicesList.push({
        title: card.querySelector('h3')?.innerHTML.trim() || '',
        text: card.querySelector('p')?.innerHTML.trim() || ''
      });
    });

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
        video: heroVideoVal,
        poster: heroPosterVal
      },
      brandsTitle,
      brandsList,
      portfolioTitle,
      portfolioIntro,
      portfolioVideos,
      realCases,
      instagramPosts,
      servicesTitle,
      servicesList,
      about: {
        title: aboutTitle,
        bio: aboutBio,
        image: aboutImageVal
      },
      contact: {
        title: contactTitle,
        email: contactEmail,
        whatsapp: contactWa,
        whatsappLink: contactWaLink
      }
    };

    // Salva via motor CMS
    const savedOk = kmCMS.saveContent(contentToSave);

    if (savedOk) {
      // Notifica janelas abertas caso o site principal esteja aberto via opener
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: 'CONTENT_UPDATED', data: contentToSave }, '*');
        }
      } catch (err) {}

      this.showToast('✓ Alterações salvas! A página principal já foi atualizada.');
    } else {
      alert('Atenção: Não foi possível salvar tudo no armazenamento local do navegador devido ao limite de espaço (cota excedida). Experimente usar links diretos de fotos ou imagens menores.');
    }
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

