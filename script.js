// ===== VARIÁVEIS GLOBAIS =====
let currentSlide = 0;
let slideInterval;
let currentTestimonial = 0;
let testimonialsInterval;
let currentNewsFilter = 'all';
let currentGalleryFilter = 'all';
let currentNewsIndex = 0;
let currentGalleryIndex = 0;
const newsPerPage = 3;
const galleryPerPage = 6;

// ===== CONFIGURAÇÃO DO VÍDEO DO YOUTUBE =====
const YOUTUBE_VIDEO_ID = '6eu824WqEvw'; // ID do vídeo da Araras Negras

// ===== PRELOADER =====
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.preloader').classList.add('fade-out');
    }, 2000);
});

// ===== MENU RESPONSIVO =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const header = document.getElementById('header');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });
}

// Fechar menu ao clicar em um link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
});

// ===== HEADER SCROLL EFFECT =====
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ===== ACTIVE MENU LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-menu a');

window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// ===== HERO SLIDER =====
const slides = document.querySelectorAll('.slide');
const dotsContainer = document.querySelector('.slider-dots');

if (slides.length > 0 && dotsContainer) {
    // Criar dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.slider-dot');

    function showSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function goToSlide(index) {
        showSlide(index);
        resetSlideInterval();
    }

    function startSlideInterval() {
        slideInterval = setInterval(nextSlide, 5000);
    }

    function resetSlideInterval() {
        clearInterval(slideInterval);
        startSlideInterval();
    }

    // Iniciar slider
    showSlide(0);
    startSlideInterval();

    // Event listeners para controles do slider
    document.querySelector('.slider-arrow.next')?.addEventListener('click', () => {
        nextSlide();
        resetSlideInterval();
    });

    document.querySelector('.slider-arrow.prev')?.addEventListener('click', () => {
        prevSlide();
        resetSlideInterval();
    });
}

// ===== ANIMAÇÕES AO ROLAR =====
const animateElements = document.querySelectorAll('[data-animate]');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            
            // Se tem delay, aplicar
            const delay = entry.target.dataset.delay;
            if (delay) {
                entry.target.style.transitionDelay = `${delay}ms`;
            }
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

animateElements.forEach(element => observer.observe(element));

// ===== CONTADORES ESTATÍSTICOS =====
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const current = parseInt(stat.innerText);
        const increment = Math.ceil(target / 50);
        
        if (current < target) {
            stat.innerText = Math.min(current + increment, target);
            setTimeout(animateStats, 20);
        } else {
            stat.innerText = target;
        }
    });
}

// Iniciar contadores quando a seção estiver visível
const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statsObserver.observe(statsSection);
}

// ===== SERVIÇOS DINÂMICOS =====
const servicesData = [
    {
        category: 'incendio',
        icon: 'fa-fire',
        title: 'Combate a Incêndios',
        description: 'Atuação rápida e eficiente no combate a princípios de incêndio em edificações e áreas florestais.',
        features: ['Incêndios urbanos', 'Incêndios florestais', 'Rescaldo e prevenção']
    },
    {
        category: 'incendio',
        icon: 'fa-fire-extinguisher',
        title: 'Prevenção de Incêndios',
        description: 'Análise de riscos e implementação de medidas preventivas em empresas e residências.',
        features: ['Análise de risco', 'Sistemas preventivos', 'Vistorias técnicas']
    },
    {
        category: 'socorro',
        icon: 'fa-heartbeat',
        title: 'Primeiros Socorros',
        description: 'Atendimento pré-hospitalar qualificado até a chegada do suporte avançado.',
        features: ['Suporte básico', 'Imobilização', 'RCP']
    },
    {
        category: 'socorro',
        icon: 'fa-ambulance',
        title: 'Atendimento Pré-hospitalar',
        description: 'Equipe preparada para emergências médicas com equipamentos modernos.',
        features: ['APH', 'Suporte avançado', 'Transporte']
    },
    {
        category: 'resgate',
        icon: 'fa-mountain',
        title: 'Resgate em Altura',
        description: 'Operações de resgate em locais de difícil acesso e trabalho em altura.',
        features: ['Rapel', 'Espaço confinado', 'Verticalização']
    },
    {
        category: 'resgate',
        icon: 'fa-water',
        title: 'Resgate Aquático',
        description: 'Salvamento em ambientes aquáticos e enchentes.',
        features: ['Afogamentos', 'Inundações', 'Salvamento aquático']
    },
    {
        category: 'treinamento',
        icon: 'fa-chalkboard-teacher',
        title: 'Treinamentos Corporativos',
        description: 'Capacitação para empresas em prevenção e combate a incêndios.',
        features: ['Brigada', 'Evacuação', 'Primeiros socorros']
    },
    {
        category: 'treinamento',
        icon: 'fa-users',
        title: 'Cursos para Comunidade',
        description: 'Cursos abertos para a comunidade em geral sobre segurança.',
        features: ['Noções básicas', 'Prevenção', 'Emergências']
    }
];

const servicesGrid = document.getElementById('servicesGrid');

function renderServices(category = 'todos') {
    if (!servicesGrid) return;
    
    const filteredServices = category === 'todos' 
        ? servicesData 
        : servicesData.filter(service => service.category === category);
    
    servicesGrid.innerHTML = filteredServices.map(service => `
        <div class="service-card" data-category="${service.category}">
            <i class="fas ${service.icon}"></i>
            <h3>${service.title}</h3>
            <p>${service.description}</p>
            <ul>
                ${service.features.map(f => `<li><i class="fas fa-check"></i>${f}</li>`).join('')}
            </ul>
            <a href="#contato" class="btn-small">Solicitar orçamento</a>
        </div>
    `).join('');
}

// Event listeners para tabs de serviços
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderServices(btn.dataset.tab);
    });
});

// Renderizar serviços iniciais
renderServices();

// ===== NOTÍCIAS DINÂMICAS =====
const newsContainer = document.getElementById('newsContainer');
const newsData = [
    {
        title: 'Curso de APH (atendimento pré-hospitalar)',
        description: 'Equipe participa de simulação realística na Serra da Jurema, preparando-se para o período de estiagem.',
        image: 'src/img/logo-aph.jpg',
        category: 'treinamento',
        date: '15 Abr 2026',
        author: 'Equipe Araras Negras'
    },
    {
        title: 'Palestra sobre primeiros socorros alcança mais de 500 estudantes',
        description: 'Projeto "Araras Negras nas Escolas" leva conhecimento sobre prevenção de acidentes para alunos da rede municipal.',
        image: 'https://images.unsplash.com/photo-1591009513298-94c6f2b9bf5c?w=600&q=80',
        category: 'evento',
        date: '10 Mar 2024',
        author: 'Comunicação'
    },
    {
        title: 'Resgate bem-sucedido em área rural comove comunidade',
        description: 'Equipe Araras Negras realiza resgate de idoso em área de difícil acesso na zona rural de Araruna.',
        image: 'https://images.unsplash.com/photo-1624021852672-6cf99f8f0c24?w=600&q=80',
        category: 'operacao',
        date: '5 Mar 2024',
        author: 'Operações'
    },
    {
        title: 'Novos equipamentos de proteção são adquiridos',
        description: 'Investimento em tecnologia de ponta garante maior segurança e eficiência nas operações.',
        image: 'https://images.unsplash.com/photo-1611918126831-0a831cac1f06?w=600&q=80',
        category: 'treinamento',
        date: '28 Fev 2024',
        author: 'Equipe Araras Negras'
    },
    {
        title: 'Simulado de evacuação em shopping center',
        description: 'Exercício prepara equipe e comunidade para situações de emergência em locais de grande circulação.',
        image: 'https://images.unsplash.com/photo-1591391869996-42bef6ab6598?w=600&q=80',
        category: 'evento',
        date: '20 Fev 2024',
        author: 'Comunicação'
    },
    {
        title: 'Formatura celebra novos membros na equipe',
        description: 'Cerimônia de formatura incorpora 10 novos bombeiros civis à equipe Araras Negras.',
        image: 'https://images.unsplash.com/photo-1590420492497-075a35eab973?w=600&q=80',
        category: 'evento',
        date: '15 Fev 2024',
        author: 'RH'
    }
];

function createNewsCard(news) {
    return `
        <div class="news-card" data-category="${news.category}">
            <div class="news-image-wrapper">
                <img src="${news.image}" alt="${news.title}" class="news-image" loading="lazy">
                <span class="news-category">${news.category}</span>
                <span class="news-date">${news.date}</span>
            </div>
            <div class="news-content">
                <h3 class="news-title">${news.title}</h3>
                <p class="news-description">${news.description}</p>
                <div class="news-meta">
                    <div class="news-author">
                        <i class="fas fa-user-circle"></i>
                        <span>${news.author}</span>
                    </div>
                    <a href="#" class="news-link">Ler mais <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </div>
    `;
}

function getFilteredNews(filter) {
    if (filter === 'all') return newsData;
    return newsData.filter(news => news.category === filter);
}

function loadMoreNews() {
    const filteredNews = getFilteredNews(currentNewsFilter);
    const nextNews = filteredNews.slice(currentNewsIndex, currentNewsIndex + newsPerPage);
    
    nextNews.forEach(news => {
        newsContainer.innerHTML += createNewsCard(news);
    });
    
    currentNewsIndex += newsPerPage;
    
    // Esconder botão se não houver mais notícias
    const loadMoreBtn = document.getElementById('loadMoreNews');
    if (currentNewsIndex >= filteredNews.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }
}

function filterNews(filter) {
    currentNewsFilter = filter;
    currentNewsIndex = 0;
    newsContainer.innerHTML = '';
    loadMoreNews();
    
    // Atualizar botões ativos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
}

// Event listeners para filtros de notícias
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        filterNews(btn.dataset.filter);
    });
});

// Carregar primeiras notícias
if (newsContainer) {
    filterNews('all');
}

// Event listener para botão "Ver mais"
document.getElementById('loadMoreNews')?.addEventListener('click', loadMoreNews);

// ===== GALERIA DINÂMICA =====
const galleryData = [
    { src: 'src/img/comabate.jpg', category: 'treinamento', title: 'Treinamento de combate a incêndio', description: 'Equipe em simulação realística' },
    { src: 'https://images.unsplash.com/photo-1591009513298-94c6f2b9bf5c?w=600&q=80', category: 'operacao', title: 'Atendimento de emergência', description: 'Equipe em ação' },
    { src: 'https://images.unsplash.com/photo-1624021852672-6cf99f8f0c24?w=600&q=80', category: 'operacao', title: 'Resgate em área rural', description: 'Operação bem-sucedida' },
    { src: 'https://images.unsplash.com/photo-1611918126831-0a831cac1f06?w=600&q=80', category: 'equipe', title: 'Equipamentos', description: 'Materiais de última geração' },
    { src: 'https://images.unsplash.com/photo-1591391869996-42bef6ab6598?w=600&q=80', category: 'treinamento', title: 'Simulado', description: 'Exercício de evacuação' },
    { src: 'https://images.unsplash.com/photo-1590420492497-075a35eab973?w=600&q=80', category: 'equipe', title: 'Equipe Araras Negras', description: 'Compromisso com a vida' },
    { src: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&q=80', category: 'treinamento', title: 'Técnicas avançadas', description: 'Treinamento especializado' },
    { src: 'https://images.unsplash.com/photo-1591009513298-94c6f2b9bf5c?w=600&q=80', category: 'operacao', title: 'Operação conjunta', description: 'Parceria com outros órgãos' },
    { src: 'https://images.unsplash.com/photo-1624021852672-6cf99f8f0c24?w=600&q=80', category: 'equipe', title: 'Reconhecimento', description: 'Homenagem à equipe' }
];

const galleryGrid = document.getElementById('galleryGrid');

function createGalleryItem(item) {
    return `
        <div class="gallery-item" data-category="${item.category}">
            <img src="${item.src}" alt="${item.title}" loading="lazy" onclick="openImageModal('${item.src}', '${item.title}')">
            <div class="gallery-overlay">
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            </div>
        </div>
    `;
}

function getFilteredGallery(filter) {
    if (filter === 'all') return galleryData;
    return galleryData.filter(item => item.category === filter);
}

function loadMoreGallery() {
    const filteredGallery = getFilteredGallery(currentGalleryFilter);
    const nextItems = filteredGallery.slice(currentGalleryIndex, currentGalleryIndex + galleryPerPage);
    
    nextItems.forEach(item => {
        galleryGrid.innerHTML += createGalleryItem(item);
    });
    
    currentGalleryIndex += galleryPerPage;
    
    // Esconder botão se não houver mais itens
    const loadMoreBtn = document.getElementById('loadMoreGallery');
    if (currentGalleryIndex >= filteredGallery.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }
}

function filterGallery(filter) {
    currentGalleryFilter = filter;
    currentGalleryIndex = 0;
    galleryGrid.innerHTML = '';
    loadMoreGallery();
    
    // Atualizar botões ativos
    document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
}

// Event listeners para filtros da galeria
document.querySelectorAll('.gallery-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        filterGallery(btn.dataset.filter);
    });
});

// Carregar primeiras imagens da galeria
if (galleryGrid) {
    filterGallery('all');
}

// Event listener para botão "Ver mais" da galeria
document.getElementById('loadMoreGallery')?.addEventListener('click', loadMoreGallery);

// ===== DEPOIMENTOS =====
const testimonialsData = [
    {
        name: 'João Silva',
        role: 'Empresário',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        text: 'A equipe Araras Negras é extremamente profissional. Realizaram um treinamento impecável na minha empresa e hoje nos sentimos muito mais seguros.'
    },
    {
        name: 'Maria Santos',
        role: 'Moradora',
        image: 'https://images.unsplash.com/photo-1494790108777-466d85388023?w=100&h=100&fit=crop',
        text: 'Quando precisei de resgate para meu pai, eles foram rápidos, atenciosos e muito competentes. Gratidão eterna à equipe!'
    },
    {
        name: 'Pedro Oliveira',
        role: 'Gestor Público',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        text: 'Parceiros fundamentais da nossa cidade. Sempre prontos para atender a população com excelência e dedicação.'
    }
];

const testimonialsWrapper = document.getElementById('testimonialsWrapper');
const testimonialsTrack = document.createElement('div');
testimonialsTrack.classList.add('testimonials-track');

function renderTestimonials() {
    testimonialsTrack.innerHTML = testimonialsData.map(testimonial => `
        <div class="testimonial-card">
            <div class="testimonial-content">
                <i class="fas fa-quote-left"></i>
                <p>${testimonial.text}</p>
                <div class="testimonial-author">
                    <img src="${testimonial.image}" alt="${testimonial.name}" loading="lazy">
                    <div class="testimonial-author-info">
                        <h4>${testimonial.name}</h4>
                        <p>${testimonial.role}</p>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    if (testimonialsWrapper) {
        testimonialsWrapper.appendChild(testimonialsTrack);
    }
}

renderTestimonials();

// Controles do slider de depoimentos
function showTestimonial(index) {
    if (index < 0) index = testimonialsData.length - 1;
    if (index >= testimonialsData.length) index = 0;
    
    testimonialsTrack.style.transform = `translateX(-${index * 100}%)`;
    currentTestimonial = index;
    
    // Atualizar dots
    document.querySelectorAll('.testimonial-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function nextTestimonial() {
    showTestimonial(currentTestimonial + 1);
}

function prevTestimonial() {
    showTestimonial(currentTestimonial - 1);
}

// Criar dots dos depoimentos
const testimonialDots = document.querySelector('.testimonial-dots');
if (testimonialDots) {
    testimonialsData.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('testimonial-dot');
        dot.addEventListener('click', () => {
            showTestimonial(index);
            resetTestimonialsInterval();
        });
        testimonialDots.appendChild(dot);
    });
}

// Event listeners para controles dos depoimentos
document.querySelector('.testimonial-arrow.next')?.addEventListener('click', () => {
    nextTestimonial();
    resetTestimonialsInterval();
});

document.querySelector('.testimonial-arrow.prev')?.addEventListener('click', () => {
    prevTestimonial();
    resetTestimonialsInterval();
});

// Autoplay dos depoimentos
function startTestimonialsInterval() {
    testimonialsInterval = setInterval(nextTestimonial, 8000);
}

function resetTestimonialsInterval() {
    clearInterval(testimonialsInterval);
    startTestimonialsInterval();
}

if (testimonialsData.length > 0) {
    showTestimonial(0);
    startTestimonialsInterval();
}

// ===== VALIDAÇÃO DO FORMULÁRIO =====
const contactForm = document.getElementById('contactForm');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isValid = true;
    
    // Validar nome
    const name = document.getElementById('name');
    const nameError = document.getElementById('nameError');
    if (name.value.trim().length < 3) {
        nameError.textContent = 'Nome deve ter pelo menos 3 caracteres';
        name.style.borderColor = 'var(--primary-red)';
        isValid = false;
    } else {
        nameError.textContent = '';
        name.style.borderColor = '';
    }
    
    // Validar email
    const email = document.getElementById('email');
    const emailError = document.getElementById('emailError');
    if (!emailRegex.test(email.value)) {
        emailError.textContent = 'E-mail inválido';
        email.style.borderColor = 'var(--primary-red)';
        isValid = false;
    } else {
        emailError.textContent = '';
        email.style.borderColor = '';
    }
    
    // Validar mensagem
    const message = document.getElementById('message');
    const messageError = document.getElementById('messageError');
    if (message.value.trim().length < 10) {
        messageError.textContent = 'Mensagem deve ter pelo menos 10 caracteres';
        message.style.borderColor = 'var(--primary-red)';
        isValid = false;
    } else {
        messageError.textContent = '';
        message.style.borderColor = '';
    }
    
    // Validar checkbox de privacidade
    const privacy = document.getElementById('privacy');
    if (!privacy.checked) {
        alert('Você precisa concordar com a política de privacidade');
        isValid = false;
    }
    
    // Se válido, mostrar mensagem de sucesso e resetar formulário
    if (isValid) {
        alert('Mensagem enviada com sucesso! A equipe Araras Negras entrará em contato em breve.');
        contactForm.reset();
    }
});

// ===== NEWSLETTER =====
const newsletterForm = document.getElementById('newsletterForm');
newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]');
    
    if (email.value && emailRegex.test(email.value)) {
        alert('Inscrição realizada com sucesso! Você receberá nossas novidades.');
        email.value = '';
    } else {
        alert('Por favor, insira um e-mail válido.');
    }
});

// ===== MÁSCARA DE TELEFONE =====
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 7) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/^(\d*)/, '($1');
        }
        
        e.target.value = value;
    });
}

// ===== MODAIS COM VÍDEO DO YOUTUBE =====
function openVideoModal() {
    const modal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');
    
    const videoUrl = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&mute=0&enablejsapi=1`;
    
    videoFrame.src = videoUrl;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const videoFrame = document.getElementById('videoFrame');
    videoFrame.src = '';
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

function openImageModal(src, title) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    modalImg.src = src;
    modalImg.alt = title;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

// Fechar modais ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeVideoModal();
        closeImageModal();
    }
});

// Fechar modais com tecla ESC
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeVideoModal();
        closeImageModal();
    }
});

// ===== SCROLL SUAVE =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== DETECTAR SAÍDA DA PÁGINA =====
let exitIntentShown = false;

document.addEventListener('mouseleave', (e) => {
    if (e.clientY <= 0 && !exitIntentShown) {
        exitIntentShown = true;
        console.log('Usuário está saindo da página');
    }
});

// ===== RESIZE HANDLER =====
let resizeTimer;
window.addEventListener('resize', () => {
    document.body.classList.add('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper');
    }, 400);
});

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Site Araras Negras inicializado com sucesso!');
});