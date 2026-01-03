/**
 * IMEX GROUP | INDUSTRIAL CORE ENGINE v21.0.8
 * Architecture: Modular Class-Based System
 * Description: Handles high-load industrial data, multi-language routing, and kinetic motion.
 */

"use strict";

class ImexEngine {
    constructor() {
        this.version = "21.0.8";
        this.config = {
            lang: localStorage.getItem('imex_lang') || 'en',
            isLoaded: false,
            currency: 'UZS',
            steelWeightFactor: 7.85, // Density of steel in kg/dm3
            debug: false
        };

        // Initialize Core Modules
        this.init();
    }

    async init() {
        console.log(`%c IMEX GROUP CORE v${this.version} INITIALIZING... `, 'background: #000; color: #fff; font-weight: bold;');
        
        try {
            await this.initLocalization();
            this.initComponents();
            this.initEventListeners();
            this.initPreloader();
            this.initParallaxEngine();
            
            // Mark as loaded
            this.config.isLoaded = true;
            document.body.classList.add('engine-ready');
        } catch (error) {
            console.error("Critical Engine Failure:", error);
        }
    }

    /* [MODULE: LOCALIZATION ENGINE] */
    async initLocalization() {
        // Словарь вынесен в отдельный объект для масштабируемости
        this.i18n = {
            en: {
                nav_home: "Home",
                nav_catalog: "Catalog",
                nav_projects: "Projects",
                nav_about: "Company",
                hero_badge: "UZBEKISTAN'S INDUSTRIAL LEADER",
                hero_desc: "We provide a reliable foundation for the infrastructure of tomorrow. Global standards, local expertise.",
                btn_catalog: "Explore Catalog",
                cat_title: "Industrial Arsenal",
                cart_empty: "Your industrial inquiry list is empty.",
                loading_init: "SYSTEM INITIALIZING"
            },
            ru: {
                nav_home: "Главная",
                nav_catalog: "Каталог",
                nav_projects: "Проекты",
                nav_about: "Компания",
                hero_badge: "ПРОМЫШЛЕННЫЙ ЛИДЕР УЗБЕКИСТАНА",
                hero_desc: "Мы создаем надежный фундамент для инфраструктуры будущего. Мировые стандарты, локальный опыт.",
                btn_catalog: "Открыть каталог",
                cat_title: "Промышленный Арсенал",
                cart_empty: "Ваш список заказа пуст.",
                loading_init: "ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ"
            },
            uz: {
                nav_home: "Asosiy",
                nav_catalog: "Katalog",
                nav_projects: "Loyihalar",
                nav_about: "Kompaniya",
                hero_badge: "O'ZBEKISTON SANOAT YETAKCHISI",
                hero_desc: "Biz ertangi kun infratuzilmasi uchun ishonchli poydevor yaratamiz. Global standartlar, mahalliy tajriba.",
                btn_catalog: "Katalogni ko'rish",
                cat_title: "Sanoat Arsenali",
                cart_empty: "Sizning buyurtma ro'yxatingiz bo'sh.",
                loading_init: "TIZIM YUKLANMOQDA"
            }
        };

        this.updateDOMTranslations();
    }

    setLang(langCode) {
        if (this.i18n[langCode]) {
            this.config.lang = langCode;
            localStorage.setItem('imex_lang', langCode);
            this.updateDOMTranslations();
            this.notify(`Language changed to ${langCode.toUpperCase()}`);
        }
    }

    updateDOMTranslations() {
        const elements = document.querySelectorAll('[data-t]');
        elements.forEach(el => {
            const key = el.getAttribute('data-t');
            if (this.i18n[this.config.lang][key]) {
                // Плавная смена текста через opacity
                el.style.opacity = 0;
                setTimeout(() => {
                    el.textContent = this.i18n[this.config.lang][key];
                    el.style.opacity = 1;
                }, 200);
            }
        });
    }

    /* [MODULE: PRELOADER & PROGRESS] */
    initPreloader() {
        const bar = document.getElementById('load-progress');
        const perc = document.getElementById('load-perc');
        let progress = 0;

        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.revealSite();
            }
            if(bar) bar.style.width = `${progress}%`;
            if(perc) perc.textContent = `${Math.floor(progress)}%`;
        }, 100);
    }

    revealSite() {
        const preloader = document.getElementById('imex-preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                document.body.classList.remove('scroll-locked');
                document.body.classList.add('loaded');
                this.initHeroAnimations();
            }, 800);
        }
    }

    /* [MODULE: MOTION & GSAP] */
    initHeroAnimations() {
        if (typeof gsap !== 'undefined') {
            const tl = gsap.timeline();
            tl.to('.h-word', {
                y: 0,
                duration: 1.5,
                stagger: 0.1,
                ease: "expo.out"
            })
            .to('.hero-para-v21', {
                opacity: 1,
                y: 0,
                duration: 1
            }, "-=1")
            .to('.hero-action-v21', {
                opacity: 1,
                duration: 1
            }, "-=0.8");
        }
    }

    /* [HELPER: NOTIFICATION SYSTEM] */
    notify(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `imex-toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // CSS for dynamic toast is handled in style.css
        setTimeout(() => toast.classList.add('active'), 100);
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // Initialization of static components
    initComponents() {
        this.initScrollLogic();
    }

    initScrollLogic() {
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('main-nav');
            if (window.scrollY > 50) {
                nav.classList.add('is-scrolled');
            } else {
                nav.classList.remove('is-scrolled');
            }
        });
    }
}

// Global Engine Instance
const engine = new ImexEngine();

/* [MODULE: CART & ORDER PIPELINE] */
class CartController {
    constructor(parent) {
        this.core = parent;
        this.items = JSON.parse(localStorage.getItem('imex_cart')) || [];
        this.ui = {
            counter: document.getElementById('cart-counter'),
            mount: document.getElementById('cart-items-mount'),
            totalPrice: document.getElementById('total-price'),
            totalWeight: document.getElementById('total-weight')
        };
        this.updateUI();
    }

    add(productId, metadata = {}) {
        // Имитация базы данных товаров (в реале тянется из API)
        const productData = this.getProductMock(productId);
        
        const existing = this.items.find(item => item.id === productId);
        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push({
                id: productId,
                name: productData.name,
                price: productData.price,
                weightPerUnit: productData.weight, // кг за метр/шт
                qty: 1,
                category: productData.category
            });
        }

        this.sync();
        this.core.notify(`${productData.name} added to inquiry`);
        this.renderItems();
    }

    remove(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.sync();
        this.renderItems();
    }

    sync() {
        localStorage.setItem('imex_cart', JSON.stringify(this.items));
        this.updateUI();
    }

    updateUI() {
        if (this.ui.counter) {
            this.ui.counter.textContent = this.items.reduce((acc, i) => acc + i.qty, 0);
            this.ui.counter.classList.add('pulse-anim');
            setTimeout(() => this.ui.counter.classList.remove('pulse-anim'), 300);
        }
        this.calculateTotals();
    }

    calculateTotals() {
        let total = 0;
        let weight = 0;

        this.items.forEach(item => {
            total += item.price * item.qty;
            weight += item.weightPerUnit * item.qty;
        });

        if (this.ui.totalPrice) this.ui.totalPrice.textContent = `${total.toLocaleString()} ${this.core.config.currency}`;
        if (this.ui.totalWeight) this.ui.totalWeight.textContent = `${weight.toFixed(2)} kg`;
    }

    renderItems() {
        if (!this.ui.mount) return;

        if (this.items.length === 0) {
            this.ui.mount.innerHTML = `<div class="empty-state-v21"><p>Your list is empty</p></div>`;
            return;
        }

        this.ui.mount.innerHTML = this.items.map(item => `
            <div class="cart-item-v21" data-aos="fade-left">
                <div class="ci-info">
                    <h4>${item.name}</h4>
                    <span>SKU: ${item.id} | ${item.weightPerUnit} kg/u</span>
                </div>
                <div class="ci-controls">
                    <button onclick="engine.cart.updateQty('${item.id}', -1)">-</button>
                    <input type="number" value="${item.qty}" readonly>
                    <button onclick="engine.cart.updateQty('${item.id}', 1)">+</button>
                    <button class="ci-remove" onclick="engine.cart.remove('${item.id}')">×</button>
                </div>
            </div>
        `).join('');
    }

    updateQty(id, delta) {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.qty = Math.max(1, item.qty + delta);
            this.sync();
            this.renderItems();
        }
    }

    getProductMock(id) {
        const db = {
            'PX-001': { name: 'Seamless Pipe ASTM', price: 1450000, weight: 12.5, category: 'pipes' },
            'BM-442': { name: 'H-Beam S355JR', price: 9800000, weight: 45.0, category: 'structural' },
            'VL-099': { name: 'Ball Valve PN40', price: 3250000, weight: 8.2, category: 'tech' }
        };
        return db[id] || { name: 'Industrial Asset', price: 0, weight: 0 };
    }
}

/* [MODULE: ASSET FILTER ENGINE] */
class FilterEngine {
    constructor() {
        this.buttons = document.querySelectorAll('.pill-v21');
        this.cards = document.querySelectorAll('.asset-card-v21');
        this.init();
    }

    init() {
        this.buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.applyFilter(filter, btn);
            });
        });
    }

    applyFilter(filter, activeBtn) {
        // Update Buttons UI
        this.buttons.forEach(b => b.classList.remove('active'));
        activeBtn.classList.add('active');

        // Filter Cards with Animation
        this.cards.forEach(card => {
            const cat = card.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
                card.style.display = 'flex';
                setTimeout(() => card.style.opacity = '1', 10);
            } else {
                card.style.opacity = '0';
                setTimeout(() => card.style.display = 'none', 400);
            }
        });
    }
}

// Добавляем модули в основное ядро
engine.cart = new CartController(engine);
engine.filters = new FilterEngine();

/* [MODULE: INDUSTRIAL FORM HANDLER] 
   Обработка сложных заявок с вложениями и валидацией
*/
class InquiryProcessor {
    constructor() {
        this.form = document.getElementById('industrial-order-form');
        this.submitBtn = this.form?.querySelector('.submit-btn-v21');
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmission();
        });

        // Live validation for technical specs
        const textarea = this.form.querySelector('textarea');
        textarea?.addEventListener('input', (e) => {
            if (e.target.value.length > 0 && e.target.value.length < 10) {
                e.target.style.borderColor = 'var(--hazard-red)';
            } else {
                e.target.style.borderColor = 'var(--surface-light)';
            }
        });
    }

    async handleSubmission() {
        this.setLoading(true);
        
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());

        console.log("%c [DATA INGESTION] ", "background: #007aff; color: white", data);

        // Имитация сетевой задержки при обработке тяжелых данных
        await new Promise(resolve => setTimeout(resolve, 2000));

        this.setLoading(false);
        engine.notify("Technical inquiry sent successfully!", "success");
        this.form.reset();
    }

    setLoading(state) {
        if (!this.submitBtn) return;
        this.submitBtn.disabled = state;
        this.submitBtn.innerHTML = state 
            ? '<span class="engine-spinner"></span> PROCESSING...' 
            : 'SEND INQUIRY';
    }
}

/* [MODULE: DYNAMIC MODAL & BLUEPRINT VIEWER] 
   Система для детального просмотра спецификаций и чертежей
*/
class ModalEngine {
    constructor() {
        this.modal = document.getElementById('tech-modal');
        this.mount = document.getElementById('modal-content-mount');
        this.isOpen = false;
    }

    open(productId) {
        const product = engine.cart.getProductMock(productId);
        this.renderContent(product);
        
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;

        // Инициализация SVG-анимации чертежа при открытии
        this.animateBlueprint();
    }

    close() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
    }

    renderContent(data) {
        this.mount.innerHTML = `
            <div class="modal-tech-grid">
                <div class="tech-header">
                    <span class="tech-tag">${data.category.toUpperCase()}</span>
                    <h2>${data.name}</h2>
                    <p class="sku">SYSTEM_ID: ${data.id}</p>
                </div>
                <div class="tech-specs-deep">
                    <div class="spec-block">
                        <label>Chemical Composition</label>
                        <p>C: 0.17-0.24% | Si: 0.17-0.37% | Mn: 0.35-0.65%</p>
                    </div>
                    <div class="spec-block">
                        <label>Mechanical Properties</label>
                        <p>Tensile Strength: 410 MPa | Yield Point: 245 MPa</p>
                    </div>
                </div>
                <button class="imex-btn-v21 primary" onclick="engine.cart.add('${data.id}')">
                    Add to Specification
                </button>
            </div>
        `;
    }

    animateBlueprint() {
        gsap.from(".bp-shape", {
            strokeDashoffset: 1000,
            duration: 2,
            ease: "power2.out"
        });
    }
}

/* [MODULE: UI INTERACTION BRIDGE] */
const ui = {
    toggleCart: () => {
        const cart = document.getElementById('global-cart');
        cart.classList.toggle('active');
    },
    
    scroll: (target) => {
        const element = document.querySelector(target);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    },

    openTechModal: (id) => engine.modals.open(id)
};

// Регистрация модулей
engine.inquiry = new InquiryProcessor();
engine.modals = new ModalEngine();

/* [MODULE: SMOOTH SCROLL & SCROLL-TRIGGER ENGINE] 
   Создаем эффект инерции при скролле для премиального ощущения
*/
class MotionController {
    constructor() {
        this.scrollY = 0;
        this.targetY = 0;
        this.ease = 0.075; // Коэффициент плавности
        this.init();
    }

    init() {
        // Инициализация AOS (Animate On Scroll) для появления блоков
        AOS.init({
            duration: 1000,
            offset: 100,
            once: true,
            easing: 'ease-out-quart'
        });

        this.initStatsCounter();
        this.initParallax();
    }

    /* Оживление цифр при прокрутке (Counter Up) */
    initStatsCounter() {
        const counters = document.querySelectorAll('.counter-trigger');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const endValue = parseInt(target.getAttribute('data-target'));
                    this.animateValue(target, 0, endValue, 2000);
                    observer.unobserve(target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => observer.observe(c));
    }

    animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            
            // Форматирование для больших чисел (например, 1 450 000)
            obj.innerHTML = current.toLocaleString();
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    /* Индустриальный параллакс фона */
    initParallax() {
        window.addEventListener('mousemove', (e) => {
            const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
            const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
            
            gsap.to('.hero-bg-canvas', {
                x: moveX,
                y: moveY,
                duration: 2,
                ease: "power2.out"
            });

            gsap.to('.blueprint-parallax-bg', {
                x: -moveX * 2,
                y: -moveY * 2,
                duration: 3,
                ease: "power2.out"
            });
        });
    }
}

/* [MODULE: TAB SYSTEM FOR BLUEPRINTS] */
class TabEngine {
    constructor() {
        this.tabs = document.querySelectorAll('.bp-tab');
        this.mount = document.getElementById('bp-info-mount');
        this.data = {
            tolerances: {
                desc: "Our products undergo strict ultrasonic testing (UT). Tolerance limits: ±0.05mm for high-precision alloys.",
                list: ["Zero Defect Policy", "ISO 9001:2026", "Hydrostatic Tests"]
            },
            chemistry: {
                desc: "Full heat traceability. Each batch is verified for Carbon, Silicon, and Manganese levels according to EN 10210.",
                list: ["Batch Certification", "Spectrometric Analysis", "Heat Number Tracking"]
            },
            mechanics: {
                desc: "Tensile and Yield strength verification in certified labs. Impact testing at -40°C available.",
                list: ["Tensile Strength: 410-550 MPa", "Elongation: >22%", "SGS Inspection Ready"]
            }
        };
        this.init();
    }

    init() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const type = tab.getAttribute('data-tab');
                this.update(type, tab);
            });
        });
    }

    update(type, activeTab) {
        this.tabs.forEach(t => t.classList.remove('active'));
        activeTab.classList.add('active');

        const content = this.data[type];
        
        // Анимация смены контента
        gsap.to(this.mount, {
            opacity: 0,
            y: 10,
            duration: 0.3,
            onComplete: () => {
                this.mount.innerHTML = `
                    <p class="bp-description">${content.desc}</p>
                    <ul class="bp-feature-list">
                        ${content.list.map(li => `<li>${li}</li>`).join('')}
                    </ul>
                `;
                gsap.to(this.mount, { opacity: 1, y: 0, duration: 0.4 });
            }
        });
    }
}

// Регистрация в ядре
engine.motion = new MotionController();
engine.tabs = new TabEngine();

/* [MODULE: ADAPTIVE GRID & RESIZE BRIDGE] 
   Гарантируем, что сложные вычисления (параллакс, веса) не "сломаются" при ресайзе
*/
class SystemGuard {
    constructor() {
        this.resizeTimeout = null;
        this.init();
    }

    init() {
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this.handleResize(), 250);
        });

        // Блокировка контекстного меню на чертежах (защита интеллектуальной собственности)
        document.querySelectorAll('.blueprint-visual').forEach(bp => {
            bp.addEventListener('contextmenu', e => e.preventDefault());
        });
    }

    handleResize() {
        console.log("%c [SYSTEM] Recalculating grid metrics... ", "color: #ffcc00");
        // Переинициализация AOS для корректных отступов
        AOS.refresh();
        
        // Обновление высоты вьюпорта для мобильных (фикс бага с адресной строкой)
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
}

/* [MODULE: B2B ANALYTICS & DEBUG] 
   Скрытая логика для отслеживания интереса к конкретным SKU
*/
class BusinessIntel {
    static logInteractions() {
        const events = ['click', 'touchstart'];
        events.forEach(ev => {
            document.addEventListener(ev, (e) => {
                const target = e.target.closest('[data-category]');
                if (target) {
                    const cat = target.getAttribute('data-category');
                    // В реальном проекте здесь идет отправка в Google Analytics / Mixpanel
                    if (engine.config.debug) console.log(`[BI] Interest in category: ${cat}`);
                }
            });
        });
    }
}

/* [FINAL INITIALIZATION SEQUENCE] */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Запуск защиты системы
    engine.guard = new SystemGuard();

    // 2. Активация бизнес-аналитики
    BusinessIntel.logInteractions();

    // 3. Финальная проверка корзины (рендеринг сохраненных данных)
    engine.cart.renderItems();

    // 4. Обработка внешних ссылок (открытие в новой вкладке)
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });

    console.log(`%c IMEX GROUP ENGINE DEPLOYED %c OK `, 
        "background: #1a1a1c; color: #ffffff; padding: 5px 10px; border-radius: 4px 0 0 4px;", 
        "background: #4cc9f0; color: #000; padding: 5px 10px; border-radius: 0 4px 4px 0; font-weight: bold;");
});

// Глобальный хендлер для ошибок (чтобы сайт не падал полностью)
window.onerror = function(msg, url, line) {
    console.error(`[ENGINE CRITICAL]: ${msg} at ${line}`);
    return true; // Предотвращает стандартный вывод ошибки в консоль пользователя
};