/**
 * KMORAIS - CMS Content Engine
 * Gerencia o carregamento e aplicação do conteúdo dinâmico no site principal e no painel admin.
 */

const KM_CMS_STORAGE_KEY = 'kmorais_cms_content_v1';
const KM_CMS_SYNC_KEY = 'kmorais_cms_updated_at';

function normalizeVideoUrl(url) {
  if (!url || typeof url !== 'string') return '';
  url = url.trim();

  // 1. Google Drive (converte link de compartilhamento para streaming direto)
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

// Sanitizador anti-XSS para renderização segura de textos e tags básicas do CMS
function sanitizeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<\s*(?:script|iframe|object|embed|applet|meta|link|style)[^>]*>[\s\S]*?<\s*\/\s*(?:script|iframe|object|embed|applet|meta|link|style)\s*>/gi, '')
    .replace(/<\s*(?:script|iframe|object|embed|applet|meta|link|style)[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

// Função utilitária de Deep Merge para preservar propriedades aninhadas e padrões
function deepMerge(target, source) {
  if (!source || typeof source !== 'object') return target;
  const output = Object.assign({}, target);
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = output[key];
    if (Array.isArray(srcVal)) {
      output[key] = srcVal.slice();
    } else if (srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal)) {
      output[key] = deepMerge(tgtVal && typeof tgtVal === 'object' ? tgtVal : {}, srcVal);
    } else if (srcVal !== undefined) {
      output[key] = srcVal;
    }
  }
  return output;
}

// Conteúdo padrão extraído do design original
const defaultCMSContent = {
  hero: {
    eyebrow: "Kelly Morais · creator + marketing",
    title: "Conteúdo que<br><em>parece conversa</em><br>e gera ação.",
    text: "UGC com a autenticidade de uma mãe real, a visão de quem fez marketing de e-commerce e o roteiro que uma campanha precisa para performar.",
    sticker: "a vibe que<br><strong>para o scroll</strong>",
    video: "https://res.cloudinary.com/demo/video/upload/q_auto,w_600/sea_turtle.mp4",
    poster: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=85&auto=format&fit=crop"
  },
  brandsTitle: "Grandes marcas <em>confiam.</em>",
  brandsList: [
    { name: "Dove", image: "" },
    { name: "Fox Cycles", image: "" },
    { name: "Seda", image: "" },
    { name: "Kibon", image: "" },
    { name: "Omo", image: "" },
    { name: "Avon", image: "" },
    { name: "Kopenhagen", image: "" },
    { name: "Cif", image: "" },
    { name: "Pantene", image: "" },
    { name: "Eudora", image: "" },
    { name: "Mercado Livre", image: "" },
    { name: "Sensodyne", image: "" },
    { name: "Secret", image: "" },
    { name: "Upseller ERP", image: "" }
  ],
  portfolioTitle: "Cases que<br><em>fazem vender.</em>",
  portfolioIntro: "Do roteiro ao video final, cada entrega nasce alinhada ao objetivo da marca: conectar, explicar ou converter.",
  portfolioVideos: [],
  servicesTitle: "Conteudo para<br><em>cada objetivo.</em>",
  servicesList: [
    { title: "Videos para Ads", text: "Roteiro alinhado ao objetivo da campanha, com gancho, prova e CTA." },
    { title: "Marketplace", text: "Videos curtos, diretos e demonstrativos para apresentar produtos e vender mais." },
    { title: "Live Shop", text: "Conteudo nativo e demonstrativo para aproximar produto, creator e compra." },
    { title: "Pacote para agencia", text: "Roteiros, variacoes de hook, gravacao e entregas organizadas para seus clientes." }
  ],
  about: {
    eyebrow: "quem está por trás",
    title: "A amiga que<br>seu público <em>estava procurando.</em>",
    bio: "Tenho 26 anos, moro em São Paulo e sou formada em Marketing. Sou mãe, trabalho no marketing de um e-commerce e crio conteúdo com uma linguagem leve, real e sem performar.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=85&auto=format&fit=crop"
  },
  contact: {
    title: "Tem uma ideia?<br><em>Vamos tirar do papel.</em>",
    email: "marketing.kellymorais@gmail.com",
    whatsapp: "+55 11 95636-7834",
    whatsappLink: "https://wa.me/5511956367834"
  },
  realCases: [
    {
      cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80&auto=format&fit=crop",
      link: "https://www.instagram.com/kemoraiso/reel/Dc4TsgNhvXy/",
      tag: "01 / Instagram Reel",
      title: "Conteudo com cara de rotina",
      desc: "Para aproximar produto e audiencia sem perder naturalidade."
    },
    {
      cover: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80&auto=format&fit=crop",
      link: "https://www.instagram.com/kemoraiso/reel/DdFP3quBgB9/",
      tag: "02 / Instagram Reel",
      title: "Creator + CLT",
      desc: "A vida real como contexto para uma historia que conecta."
    },
    {
      cover: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80&auto=format&fit=crop",
      link: "https://www.instagram.com/foxcyclesoficial/reel/DUB0JGkkkR_/",
      tag: "03 / Collab de marca",
      title: "Conteudo para negocio real",
      desc: "Quando a creator entra na conversa oficial da marca."
    },
    {
      cover: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&q=80&auto=format&fit=crop",
      link: "https://www.tiktok.com/@kellymoraiso",
      tag: "04 / TikTok",
      title: "Rotina, maternidade e dicas",
      desc: "31K pessoas acompanhando conteudo que informa e acolhe."
    }
  ],
  instagramPosts: [
    { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/Dc4TsgNhvXy/', label: 'post recente / 01' },
    { image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/DdFP3quBgB9/', label: 'post recente / 02' },
    { image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/DctXke_BpJF/', label: 'post recente / 03' },
    { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/Dbto7oNho3o/', label: 'post recente / 04' },
    { image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/Dav1BwnB8S4/', label: 'post recente / 05' },
    { image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/DcRrZvuh33B/', label: 'post recente / 06' },
    { image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/DY65T1vu4bn/', label: 'post recente / 07' },
    { image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80&auto=format&fit=crop', link: 'https://www.instagram.com/kemoraiso/reel/Daan3KYuQgw/', label: 'post recente / 08' }
  ]
};

class KMMediaStore {
  constructor() {
    this.dbPromise = this.initDB();
    this.blobUrlCache = new Map();
  }

  initDB() {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve(null);
        return;
      }

      let settled = false;
      const safeResolve = (res) => {
        if (!settled) {
          settled = true;
          resolve(res);
        }
      };

      // Timeout de segurança: se o IndexedDB demorar ou estiver bloqueado, nunca trava a página
      setTimeout(() => safeResolve(null), 1200);

      try {
        const req = indexedDB.open('kmorais_media_store', 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('media')) {
            db.createObjectStore('media', { keyPath: 'id' });
          }
        };
        req.onsuccess = () => safeResolve(req.result);
        req.onerror = (err) => {
          console.warn('KMMediaStore: IndexedDB init error', err);
          safeResolve(null);
        };
        req.onblocked = () => {
          console.warn('KMMediaStore: IndexedDB blocked');
          safeResolve(null);
        };
      } catch (err) {
        console.warn('KMMediaStore: IndexedDB open exception', err);
        safeResolve(null);
      }
    });
  }

  async saveMedia(id, blobOrFile, mimeType) {
    const db = await this.dbPromise;
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('media', 'readwrite');
        const store = tx.objectStore('media');
        store.put({ id, data: blobOrFile, type: mimeType, updated: Date.now() });
        tx.oncomplete = () => resolve(id);
        tx.onerror = (err) => {
          console.error('KMMediaStore save error:', err);
          resolve(null);
        };
      } catch (err) {
        console.error('KMMediaStore tx error:', err);
        resolve(null);
      }
    });
  }

  async getMedia(id) {
    const db = await this.dbPromise;
    if (!db) return null;
    return new Promise((resolve) => {
      try {
        const tx = db.transaction('media', 'readonly');
        const store = tx.objectStore('media');
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  async resolveUrl(urlOrId) {
    if (!urlOrId) return '';
    if (typeof urlOrId === 'string' && urlOrId.startsWith('idb:')) {
      if (this.blobUrlCache.has(urlOrId)) {
        return this.blobUrlCache.get(urlOrId);
      }
      try {
        const blob = await Promise.race([
          this.getMedia(urlOrId),
          new Promise((r) => setTimeout(() => r(null), 2000))
        ]);
        if (blob) {
          const blobUrl = URL.createObjectURL(blob);
          this.blobUrlCache.set(urlOrId, blobUrl);
          return blobUrl;
        }
      } catch (err) {
        console.warn('KMMediaStore: erro ao resolver idb URL', err);
      }
      return '';
    }
    return urlOrId;
  }
}

const kmMediaStore = new KMMediaStore();
if (typeof window !== 'undefined') {
  window.kmMediaStore = kmMediaStore;
}

class KMCMS {
  constructor() {
    this.data = this.loadLocalContent();
  }

  loadLocalContent() {
    try {
      const saved = localStorage.getItem(KM_CMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return deepMerge(defaultCMSContent, parsed);
      }
    } catch (e) {
      console.warn('CMS: Falha ao carregar conteúdo local', e);
    }
    return deepMerge({}, defaultCMSContent);
  }

  saveContent(newData) {
    try {
      this.data = deepMerge(this.data, newData);
      localStorage.setItem(KM_CMS_STORAGE_KEY, JSON.stringify(this.data));
      localStorage.setItem(KM_CMS_SYNC_KEY, String(Date.now()));

      // 1. Sincroniza via BroadcastChannel para outras abas
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const channel = new BroadcastChannel('km_cms_channel');
          channel.postMessage({ type: 'CONTENT_UPDATED', data: this.data });
        } catch (err) {
          console.warn('CMS: BroadcastChannel falhou', err);
        }
      }

      // 2. Dispara evento customizado na própria janela
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('kmCMSUpdated', { detail: this.data }));
      }

      return true;
    } catch (e) {
      console.error('CMS: Erro ao salvar conteúdo', e);
      return false;
    }
  }

  reloadAndApply() {
    this.data = this.loadLocalContent();
    return this.applyToPage();
  }

  async fetchPublishedContent() {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(`content.json?_t=${Date.now()}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return null;
      const published = await res.json();
      if (!published || typeof published !== 'object') return null;

      const localSaved = localStorage.getItem(KM_CMS_STORAGE_KEY);
      const localUpdatedAt = localStorage.getItem(KM_CMS_SYNC_KEY);

      const publishedTimestamp = published.updatedAt ? new Date(published.updatedAt).getTime() : 0;
      const localTimestamp = localUpdatedAt ? Number(localUpdatedAt) : 0;

      // Se os dados publicados no GitHub forem mais recentes ou se o visitante não tiver nada local:
      if (!localSaved || (publishedTimestamp && publishedTimestamp > localTimestamp)) {
        this.data = deepMerge(defaultCMSContent, published);
        localStorage.setItem(KM_CMS_STORAGE_KEY, JSON.stringify(this.data));
        if (publishedTimestamp) {
          localStorage.setItem(KM_CMS_SYNC_KEY, String(publishedTimestamp));
        }
        await this.applyToPage();
      }
      return published;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name !== 'AbortError') {
        console.warn('CMS: Falha ao buscar conteúdo publicado', err);
      }
      return null;
    }
  }

  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        this.saveContent(parsed);
        this.applyToPage();
        return true;
      }
    } catch (err) {
      console.error('Falha ao importar JSON:', err);
    }
    return false;
  }

  async applyToPage() {
    const data = this.data;
    if (!data) return;

    // =========================================================================
    // FASE 1: APLICAÇÃO SÍNCRONA IMEDIATA DE TEXTOS (SEM AWAIT, EXECUTA EM 1ms)
    // =========================================================================

    // 1. Hero Texts
    try {
      const heroEyebrow = document.querySelector('.hero-copy .eyebrow');
      if (heroEyebrow && data.hero?.eyebrow) {
        heroEyebrow.innerHTML = `<span class="eyebrow-line"></span> ${sanitizeHtml(data.hero.eyebrow)}`;
      }

      const heroTitle = document.querySelector('#hero-title');
      if (heroTitle && data.hero?.title) {
        heroTitle.innerHTML = sanitizeHtml(data.hero.title);
      }

      const heroText = document.querySelector('.hero-text');
      if (heroText && data.hero?.text) {
        heroText.innerHTML = sanitizeHtml(data.hero.text);
      }

      const heroSticker = document.querySelector('.hero-sticker');
      if (heroSticker && data.hero?.sticker) {
        heroSticker.innerHTML = sanitizeHtml(data.hero.sticker);
      }
    } catch (e) {
      console.error('CMS: Erro ao aplicar textos do Hero', e);
    }

    // 2. Título da seção de Marcas
    try {
      const brandsTitle = document.querySelector('#brands-title');
      if (brandsTitle && data.brandsTitle) {
        brandsTitle.innerHTML = sanitizeHtml(data.brandsTitle);
      }
    } catch (e) {
      console.error('CMS: Erro ao aplicar título de Marcas', e);
    }

    // 3. Título e intro do Portfólio
    try {
      const portfolioTitle = document.querySelector('#portfolio-title');
      if (portfolioTitle && data.portfolioTitle) {
        portfolioTitle.innerHTML = sanitizeHtml(data.portfolioTitle);
      }

      const portfolioIntro = document.querySelector('.portfolio .section-intro') || document.querySelector('.section-intro');
      if (portfolioIntro && data.portfolioIntro) {
        portfolioIntro.innerHTML = sanitizeHtml(data.portfolioIntro);
      }
    } catch (e) {
      console.error('CMS: Erro ao aplicar textos do Portfólio', e);
    }

    // 4. Cases Reais ("Cases que saem da tela.") - Textos e Links
    try {
      if (data.realCases && Array.isArray(data.realCases)) {
        const cases = document.querySelectorAll('.real-case');
        data.realCases.forEach((item, idx) => {
          if (!cases[idx] || !item) return;
          const el = cases[idx];
          if (item.link) el.href = item.link;
          const tag = el.querySelector('.real-case-content span');
          const title = el.querySelector('.real-case-content h3');
          const desc = el.querySelector('.real-case-content p');
          if (tag && item.tag) tag.innerHTML = sanitizeHtml(item.tag);
          if (title && item.title) title.innerHTML = sanitizeHtml(item.title);
          if (desc && item.desc) desc.innerHTML = sanitizeHtml(item.desc);
        });
      }
    } catch (e) {
      console.error('CMS: Erro ao aplicar textos de Cases Reais', e);
    }

    // 5. Posts do Instagram ("O que está no ar agora.") - Legendas e Links
    try {
      if (data.instagramPosts && Array.isArray(data.instagramPosts)) {
        const photoCards = document.querySelectorAll('.photo-card');
        data.instagramPosts.forEach((post, idx) => {
          if (!photoCards[idx] || !post) return;
          const card = photoCards[idx];
          if (post.link) card.href = post.link;
          const span = card.querySelector('span');
          if (span && post.label) {
            span.innerHTML = `${sanitizeHtml(post.label)} <b>&#8599;</b>`;
          }
        });
      }
    } catch (e) {
      console.error('CMS: Erro ao aplicar textos do Instagram', e);
    }

    // 6. Serviços - Título e Cards
    try {
      const servTitle = document.querySelector('#services-title');
      if (servTitle && data.servicesTitle) {
        servTitle.innerHTML = sanitizeHtml(data.servicesTitle);
      }
      if (data.servicesList && Array.isArray(data.servicesList)) {
        const serviceCards = document.querySelectorAll('.service-card');
        data.servicesList.forEach((s, idx) => {
          if (!serviceCards[idx] || !s) return;
          const card = serviceCards[idx];
          const h3 = card.querySelector('h3');
          const p = card.querySelector('p');
          if (h3 && s.title) h3.innerHTML = sanitizeHtml(s.title);
          if (p && s.text) p.innerHTML = sanitizeHtml(s.text);
        });
      }
    } catch (e) {
      console.error('CMS: Erro ao aplicar textos de Serviços', e);
    }

    // 7. Sobre - Título e Bio
    try {
      const aboutTitle = document.querySelector('#about-title');
      if (aboutTitle && data.about?.title) {
        aboutTitle.innerHTML = sanitizeHtml(data.about.title);
      }

      const aboutContentP = document.querySelector('.about-content p:nth-of-type(2)');
      if (aboutContentP && data.about?.bio) {
        aboutContentP.innerHTML = sanitizeHtml(data.about.bio);
      }
    } catch (e) {
      console.error('CMS: Erro ao aplicar textos da seção Sobre', e);
    }

    // 8. Contato - Título, Email e WhatsApp
    try {
      const contactTitle = document.querySelector('#contact-title');
      if (contactTitle && data.contact?.title) {
        contactTitle.innerHTML = sanitizeHtml(data.contact.title);
      }

      if (data.contact?.email) {
        document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
          a.href = `mailto:${data.contact.email}`;
          if (a.textContent.includes('@')) a.textContent = data.contact.email;
        });
      }

      if (data.contact?.whatsapp) {
        document.querySelectorAll('a[href*="wa.me"]').forEach((a) => {
          if (data.contact?.whatsappLink) a.href = data.contact.whatsappLink;
          if (a.textContent.includes('+55')) a.textContent = data.contact.whatsapp;
        });
      }
    } catch (e) {
      console.error('CMS: Erro ao aplicar contatos', e);
    }

    // =========================================================================
    // FASE 2: RESOLUÇÃO ASSÍNCRONA DE MÍDIAS (ISOLADAS, EM PARALELO)
    // =========================================================================

    // 9. Hero Video & Poster
    try {
      const heroVideo = document.querySelector('.hero-frame video');
      if (heroVideo) {
        if (data.hero?.video) {
          const rawVideo = await kmMediaStore.resolveUrl(data.hero.video);
          const resolvedVideo = normalizeVideoUrl(rawVideo);
          if (resolvedVideo) {
            const src = heroVideo.querySelector('source');
            if (src) src.src = resolvedVideo;
            heroVideo.src = resolvedVideo;
            heroVideo.load();
          }
        }
        if (data.hero?.poster) {
          const resolvedPoster = await kmMediaStore.resolveUrl(data.hero.poster);
          if (resolvedPoster && heroVideo.poster !== resolvedPoster) {
            heroVideo.poster = resolvedPoster;
          }
        }
      }
    } catch (e) {
      console.error('CMS: Erro ao resolver mídia do Hero', e);
    }

    // 10. Marcas (Brand Pills - Nomes Visíveis e Logotipos Customizados)
    try {
      if (data.brandsList && Array.isArray(data.brandsList)) {
        const brandPills = document.querySelectorAll('.brands-grid .brand-pill');
        await Promise.allSettled(data.brandsList.map(async (item, idx) => {
          if (!brandPills[idx] || !item) return;
          const pill = brandPills[idx];
          const circle = pill.querySelector('.brand-pill-circle');
          if (!circle) return;

          if (item.name) {
            pill.title = item.name;
            const nameSpan = circle.querySelector('.brand-name');
            if (nameSpan) nameSpan.textContent = item.name;
          }

          if (item.image) {
            const resolvedImg = await kmMediaStore.resolveUrl(item.image);
            if (resolvedImg) {
              circle.classList.add('has-custom-logo');
              circle.dataset.customLogo = item.image;
              let img = circle.querySelector('img.brand-logo-img');
              if (!img) {
                circle.innerHTML = `<img src="${resolvedImg}" alt="${item.name || ''}" class="brand-logo-img">`;
              } else {
                img.src = resolvedImg;
                img.alt = item.name || '';
              }
            }
          }
        }));
      }
    } catch (e) {
      console.error('CMS: Erro ao resolver logotipos de Marcas', e);
    }

    // 11. Vídeos do Portfólio (30 cards)
    try {
      if (data.portfolioVideos && Array.isArray(data.portfolioVideos) && data.portfolioVideos.length > 0) {
        const cards = document.querySelectorAll('.video-card');
        await Promise.allSettled(data.portfolioVideos.map(async (item, idx) => {
          if (!cards[idx] || !item) return;
          const video = cards[idx].querySelector('video');
          const metaSpan = cards[idx].querySelector('.video-meta span:first-child');
          if (metaSpan && item.label) {
            metaSpan.innerHTML = item.label;
          }
          if (video) {
            const src = video.querySelector('source');
            if (item.video) {
              const rawVideo = await kmMediaStore.resolveUrl(item.video);
              const resolvedVideo = normalizeVideoUrl(rawVideo);
              if (resolvedVideo) {
                if (src) src.src = resolvedVideo;
                video.src = resolvedVideo;
                video.load();
                if (resolvedVideo.includes('instagram.com') || resolvedVideo.includes('tiktok.com')) {
                  cards[idx].dataset.externalUrl = resolvedVideo;
                } else {
                  delete cards[idx].dataset.externalUrl;
                }
              }
            }
            if (item.poster) {
              const resolvedPoster = await kmMediaStore.resolveUrl(item.poster);
              if (resolvedPoster && video.poster !== resolvedPoster) {
                video.poster = resolvedPoster;
              }
            }
          }
        }));
      }
    } catch (e) {
      console.error('CMS: Erro ao resolver vídeos do Portfólio', e);
    }

    // 12. Cases Reais - Capas de Imagem
    try {
      if (data.realCases && Array.isArray(data.realCases)) {
        const cases = document.querySelectorAll('.real-case');
        await Promise.allSettled(data.realCases.map(async (item, idx) => {
          if (!cases[idx] || !item) return;
          const cover = cases[idx].querySelector('.real-case-cover');
          if (cover && item.cover) {
            const resolvedCover = await kmMediaStore.resolveUrl(item.cover);
            if (resolvedCover) {
              cover.style.backgroundImage = `url("${resolvedCover}")`;
              cases[idx].dataset.coverUrl = item.cover;
            }
          }
        }));
      }
    } catch (e) {
      console.error('CMS: Erro ao resolver capas de Cases Reais', e);
    }

    // 13. Posts do Instagram - Imagens
    try {
      if (data.instagramPosts && Array.isArray(data.instagramPosts)) {
        const photoCards = document.querySelectorAll('.photo-card');
        await Promise.allSettled(data.instagramPosts.map(async (post, idx) => {
          if (!photoCards[idx] || !post) return;
          const img = photoCards[idx].querySelector('img');
          if (img && post.image) {
            const resolvedImg = await kmMediaStore.resolveUrl(post.image);
            if (resolvedImg && img.src !== resolvedImg) {
              img.src = resolvedImg;
            }
          }
        }));
      }
    } catch (e) {
      console.error('CMS: Erro ao resolver fotos do Instagram', e);
    }

    // 14. Foto da Kelly (Sobre)
    try {
      const aboutImg = document.querySelector('.about-image img');
      if (aboutImg && data.about?.image) {
        const resolvedImg = await kmMediaStore.resolveUrl(data.about.image);
        if (resolvedImg && aboutImg.src !== resolvedImg) {
          aboutImg.src = resolvedImg;
        }
      }
    } catch (e) {
      console.error('CMS: Erro ao resolver foto da Kelly', e);
    }
  }
}

// Inicializa e expõe no escopo global
let kmCMS = null;
if (typeof window !== 'undefined') {
  kmCMS = new KMCMS();
  window.kmCMS = kmCMS;
  window.KMCMS = KMCMS;
  window.normalizeVideoUrl = normalizeVideoUrl;
}

// Execução ao carregar no browser
if (typeof document !== 'undefined') {
  const boot = () => {
    kmCMS?.applyToPage();
    kmCMS?.fetchPublishedContent();
  };

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    boot();
  } else {
    document.addEventListener('DOMContentLoaded', boot);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KMCMS, KMMediaStore, normalizeVideoUrl, deepMerge, defaultCMSContent };
}

// Sincronização em tempo real entre abas:
// 1. BroadcastChannel
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    const channel = new BroadcastChannel('km_cms_channel');
    channel.onmessage = (event) => {
      if (event.data && event.data.type === 'CONTENT_UPDATED') {
        kmCMS.data = event.data.data;
        kmCMS.applyToPage();
      }
    };
  } catch (e) {
    console.warn('CMS: BroadcastChannel listener warning', e);
  }
}

// 2. Storage event padrão universal (disparado entre abas no mesmo origin)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === KM_CMS_STORAGE_KEY || event.key === KM_CMS_SYNC_KEY) {
      kmCMS.reloadAndApply();
    }
  });

  // 3. PostMessage (para comunicação quando aberta via popup/opener) — valida origem
  window.addEventListener('message', (event) => {
    // Aceita apenas mensagens da mesma origem (mesmo domínio/localhost)
    if (event.origin !== window.location.origin) return;
    if (event.data && event.data.type === 'CONTENT_UPDATED' && event.data.data) {
      kmCMS.data = event.data.data;
      kmCMS.applyToPage();
    }
  });
}
