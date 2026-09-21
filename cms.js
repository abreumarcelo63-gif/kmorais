/**
 * KMORAIS - CMS Content Engine
 * Gerencia o carregamento e aplicação do conteúdo dinâmico no site principal e no painel admin.
 */

const KM_CMS_STORAGE_KEY = 'kmorais_cms_content_v1';
const KM_CMS_CLOUD_URL = 'https://api.jsonbin.io/v3/b/66ed856fac924618e722db34'; // Fallback cloud sync id

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
  portfolioTitle: "Cases que<br><em>fazem vender.</em>",
  portfolioIntro: "Do roteiro ao video final, cada entrega nasce alinhada ao objetivo da marca: conectar, explicar ou converter.",
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

class KMCMS {
  constructor() {
    this.data = this.loadLocalContent();
  }

  loadLocalContent() {
    try {
      const saved = localStorage.getItem(KM_CMS_STORAGE_KEY);
      if (saved) {
        return Object.assign({}, defaultCMSContent, JSON.parse(saved));
      }
    } catch (e) {
      console.warn('CMS: Falha ao carregar conteúdo local', e);
    }
    return Object.assign({}, defaultCMSContent);
  }

  saveContent(newData) {
    try {
      this.data = Object.assign({}, this.data, newData);
      localStorage.setItem(KM_CMS_STORAGE_KEY, JSON.stringify(this.data));
      // Tenta sincronizar com broadcast channel para atualizar abas abertas em tempo real
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel('km_cms_channel');
        channel.postMessage({ type: 'CONTENT_UPDATED', data: this.data });
      }
      return true;
    } catch (e) {
      console.error('CMS: Erro ao salvar conteúdo', e);
      return false;
    }
  }

  applyToPage() {
    const data = this.data;
    if (!data) return;

    // 1. Hero
    const heroEyebrow = document.querySelector('.hero-copy .eyebrow');
    if (heroEyebrow && data.hero?.eyebrow) {
      heroEyebrow.innerHTML = `<span class="eyebrow-line"></span> ${data.hero.eyebrow}`;
    }

    const heroTitle = document.querySelector('#hero-title');
    if (heroTitle && data.hero?.title) {
      heroTitle.innerHTML = data.hero.title;
    }

    const heroText = document.querySelector('.hero-text');
    if (heroText && data.hero?.text) {
      heroText.innerHTML = data.hero.text;
    }

    const heroSticker = document.querySelector('.hero-sticker');
    if (heroSticker && data.hero?.sticker) {
      heroSticker.innerHTML = data.hero.sticker;
    }

    const heroVideo = document.querySelector('.hero-frame video');
    if (heroVideo && data.hero?.video) {
      const src = heroVideo.querySelector('source');
      if (src && src.src !== data.hero.video) {
        src.src = data.hero.video;
        heroVideo.load();
      }
      if (data.hero?.poster && heroVideo.poster !== data.hero.poster) {
        heroVideo.poster = data.hero.poster;
      }
    }

    // 2. Títulos gerais
    const brandsTitle = document.querySelector('#brands-title');
    if (brandsTitle && data.brandsTitle) {
      brandsTitle.innerHTML = data.brandsTitle;
    }

    const portfolioTitle = document.querySelector('#portfolio-title');
    if (portfolioTitle && data.portfolioTitle) {
      portfolioTitle.innerHTML = data.portfolioTitle;
    }

    const portfolioIntro = document.querySelector('.section-intro');
    if (portfolioIntro && data.portfolioIntro) {
      portfolioIntro.innerHTML = data.portfolioIntro;
    }

    // 3. Vídeos do portfólio customizados
    if (data.portfolioVideos && Array.isArray(data.portfolioVideos)) {
      const cards = document.querySelectorAll('.video-card');
      data.portfolioVideos.forEach((item, idx) => {
        if (!cards[idx]) return;
        const video = cards[idx].querySelector('video');
        const metaSpan = cards[idx].querySelector('.video-meta span:first-child');
        if (video) {
          const src = video.querySelector('source');
          if (item.video && src && src.src !== item.video) {
            src.src = item.video;
            video.load();
          }
          if (item.poster && video.poster !== item.poster) {
            video.poster = item.poster;
          }
        }
        if (metaSpan && item.label) {
          metaSpan.innerHTML = item.label;
        }
      });
    }

    // 3.5. Cases Reais ("Cases que saem da tela")
    if (data.realCases && Array.isArray(data.realCases)) {
      const cases = document.querySelectorAll('.real-case');
      data.realCases.forEach((item, idx) => {
        if (!cases[idx]) return;
        const el = cases[idx];
        const cover = el.querySelector('.real-case-cover');
        const tag = el.querySelector('.real-case-content span');
        const title = el.querySelector('.real-case-content h3');
        const desc = el.querySelector('.real-case-content p');

        if (item.link) el.href = item.link;
        if (cover && item.cover) {
          cover.style.backgroundImage = `url("${item.cover}")`;
          el.dataset.coverUrl = item.cover;
        }
        if (tag && item.tag) tag.innerHTML = item.tag;
        if (title && item.title) title.innerHTML = item.title;
        if (desc && item.desc) desc.innerHTML = item.desc;
      });
    }

    // 3.6. Últimos Posts do Instagram ("O que está no ar agora")
    if (data.instagramPosts && Array.isArray(data.instagramPosts)) {
      const photoCards = document.querySelectorAll('.photo-card');
      data.instagramPosts.forEach((post, idx) => {
        if (!photoCards[idx]) return;
        const card = photoCards[idx];
        const img = card.querySelector('img');
        const span = card.querySelector('span');

        if (post.link) card.href = post.link;
        if (img && post.image) img.src = post.image;
        if (span && post.label) {
          span.innerHTML = `${post.label} <b>&#8599;</b>`;
        }
      });
    }

    // 4. Sobre
    const aboutTitle = document.querySelector('#about-title');
    if (aboutTitle && data.about?.title) {
      aboutTitle.innerHTML = data.about.title;
    }

    const aboutContentP = document.querySelector('.about-content p:nth-of-type(2)');
    if (aboutContentP && data.about?.bio) {
      aboutContentP.innerHTML = data.about.bio;
    }

    const aboutImg = document.querySelector('.about-image img');
    if (aboutImg && data.about?.image) {
      aboutImg.src = data.about.image;
    }

    // 5. Contato
    const contactTitle = document.querySelector('#contact-title');
    if (contactTitle && data.contact?.title) {
      contactTitle.innerHTML = data.contact.title;
    }

    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    if (data.contact?.email) {
      emailLinks.forEach((a) => {
        a.href = `mailto:${data.contact.email}`;
        if (a.textContent.includes('@')) a.textContent = data.contact.email;
      });
    }

    const waLinks = document.querySelectorAll('a[href*="wa.me"]');
    if (data.contact?.whatsapp) {
      waLinks.forEach((a) => {
        if (data.contact?.whatsappLink) a.href = data.contact.whatsappLink;
        if (a.textContent.includes('+55')) a.textContent = data.contact.whatsapp;
      });
    }
  }
}

// Inicializa e escuta atualizações
const kmCMS = new KMCMS();
document.addEventListener('DOMContentLoaded', () => {
  kmCMS.applyToPage();
});

// Atualiza na hora se outra aba (ex: o Admin) salvar alterações
if ('BroadcastChannel' in window) {
  const channel = new BroadcastChannel('km_cms_channel');
  channel.onmessage = (event) => {
    if (event.data && event.data.type === 'CONTENT_UPDATED') {
      kmCMS.data = event.data.data;
      kmCMS.applyToPage();
    }
  };
}

// Execução imediata caso o DOM já esteja pronto
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  kmCMS.applyToPage();
}

