// ================================================================
// BENDEREIGN ENHANCED FUNCTIONALITY — FIXED FRAME BOOK VIEW
// ================================================================

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const pageSections = $$('main > section');
let lastSectionScrollTop = 0;

function closeMenuRail() {
    const toggle = $('#sidebarToggle');
    $('#menuRail')?.classList.remove('expanded');
    toggle?.setAttribute('aria-expanded', 'false');
    if (toggle) {
        toggle.textContent = '>|';
        toggle.setAttribute('aria-label', 'Open menu utilities');
    }
}

function switchSection(id, updateHash = true) {
    const target = pageSections.find(section => section.id === id) || $('#home');
    if (!target) return;

    pageSections.forEach(section => {
        const active = section === target;
        if (!active && section.contains(document.activeElement)) {
            document.activeElement.blur();
        }
        section.classList.toggle('active-section', active);
        section.setAttribute('aria-hidden', String(!active));
        if (active) {
            section.scrollTop = 0;
        }
    });

    lastSectionScrollTop = 0;
    closeMenuRail();

    updateBackToTopVisibility();
    updateFloatingActionsVisibility();
    document.body.classList.toggle('home-active', target.id === 'home');
    document.body.dataset.section = target.id;
    updateNavbarState();

    $$('.desktop-nav a, .mobile-nav a').forEach(link => {
        link.classList.toggle('active-nav', link.getAttribute('href') === `#${target.id}`);
    });

    $('#mobileNav')?.classList.remove('open');
    $('#rightDrawer')?.classList.remove('open');
    $('#drawerBackdrop')?.classList.remove('open');
    document.body.classList.remove('drawer-open');

    if (updateHash && window.location.hash !== `#${target.id}`) {
        history.replaceState(null, '', `#${target.id}`);
    }
}

function updateNavbarState() {
    const header = $('#navbar');
    const activeSection = $('main > section.active-section');
    if (!header || !activeSection) return;

    const scrolled = activeSection.id !== 'home'
        || activeSection.scrollTop > 80
        || window.scrollY > 80;
    header.classList.toggle('navbar-scrolled', scrolled);
}

function updateBackToTopVisibility() {
    const activeSection = $('main > section.active-section');
    const backToTop = $('#backToTop');
    if (!backToTop) return;
    backToTop.classList.toggle('show', Boolean(activeSection && activeSection.scrollTop > 250));
}

function updateFloatingActionsVisibility() {
    const container = $('.floating-actions-container');
    const activeSection = $('main > section.active-section');
    if (!container || !activeSection) return;

    const pastHero = activeSection.id !== 'home'
        || activeSection.scrollTop > 300
        || window.scrollY > 300;
    container.classList.toggle('is-visible', pastHero);
}

switchSection(window.location.hash.slice(1) || 'home', false);

$('#backToTop')?.addEventListener('click', event => {
    event.preventDefault();
    const activeSec = $('main > section.active-section');
    if (activeSec) {
        activeSec.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
});

document.addEventListener('scroll', () => {
    const activeSection = $('main > section.active-section');
    if (activeSection) lastSectionScrollTop = activeSection.scrollTop;
    updateBackToTopVisibility();
    updateFloatingActionsVisibility();
    updateNavbarState();
    closeMenuRail();
}, true);

$$('.brand').forEach(logo => {
    logo.onclick = (e) => {
        e.preventDefault();
        switchSection('home');
    };
});

document.addEventListener('click', event => {
    if (event.target.closest('a') || !event.target.closest('#menuRail, #sidebarToggle')) closeMenuRail();
    
    const link = event.target.closest('a[href^="#"]');
    if (link) {
        const action = link.dataset.action;
        if (action === 'privacy') {
            event.preventDefault();
            openPrivacy();
            return;
        }
        if (action === 'favorites') {
            event.preventDefault();
            openFavorites();
            return;
        }
        if (action === 'feedback') {
            event.preventDefault();
            window.location.hash = 'visit-us';
            switchSection('visit-us');
            $('#contactForm')?.querySelector('textarea')?.focus();
            return;
        }
        if (action === 'reignClub') {
            event.preventDefault();
            openRightDrawer();
            return;
        }
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        event.preventDefault();
        switchSection(id.slice(1));
    }

    const externalReviewLink = event.target.closest('a[data-action="googleReview"]');
    if (externalReviewLink) {
        event.preventDefault();
        window.open('https://www.google.com/search?q=Bendereign+Dubai+reviews', '_blank', 'noopener,noreferrer');
    }
});

function closeUtilityPanel() {
    if (document.activeElement && (document.activeElement.closest('#favoritesPanel') || document.activeElement.closest('#privacyOverlay'))) {
        document.activeElement.blur();
    }
    $('#favoritesPanel')?.classList.remove('open');
    $('#privacyOverlay')?.classList.remove('open');
    $('#favoritesPanel')?.setAttribute('aria-hidden', 'true');
    $('#privacyOverlay')?.setAttribute('aria-hidden', 'true');
}

function openPrivacy() {
    closeUtilityPanel();
    $('#privacyOverlay')?.classList.add('open');
    $('#privacyOverlay')?.setAttribute('aria-hidden', 'false');
}

function openFavorites() {
    closeUtilityPanel();
    renderFavorites();
    $('#favoritesPanel')?.classList.add('open');
    $('#favoritesPanel')?.setAttribute('aria-hidden', 'false');
}

$$('[data-close-panel]').forEach(button => button.addEventListener('click', closeUtilityPanel));
$('#privacyOverlay')?.addEventListener('click', event => {
    if (event.target.id === 'privacyOverlay') closeUtilityPanel();
});
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeUtilityPanel();
});

$('#menuToggle')?.addEventListener('click', () => {
    const mobileNav = $('#mobileNav');
    if (window.matchMedia('(min-width: 901px)').matches) {
        const open = rightDrawer?.classList.contains('open');
        if (open) closePanels();
        else openRightDrawer();
        $('#menuToggle')?.setAttribute('aria-expanded', String(!open));
        return;
    }

    const open = mobileNav?.classList.toggle('open');
    $('#menuToggle')?.setAttribute('aria-expanded', String(Boolean(open)));
});

const rightDrawer = $('#rightDrawer');
const drawerBackdrop = $('#drawerBackdrop');

const closePanels = () => {
    if (document.activeElement && rightDrawer?.contains(document.activeElement)) {
        document.activeElement.blur();
    }
    rightDrawer?.classList.remove('open');
    drawerBackdrop?.classList.remove('open');
    document.body.classList.remove('drawer-open');
    rightDrawer?.setAttribute('aria-hidden', 'true');
};

const openRightDrawer = () => {
    rightDrawer?.classList.add('open');
    rightDrawer?.setAttribute('aria-hidden', 'false');
    drawerBackdrop?.classList.add('open');
    document.body.classList.add('drawer-open');
};

window.addEventListener('click', event => {
    const clickedBackdrop = event.target === drawerBackdrop;
    const clickedOutsideDrawer = rightDrawer?.classList.contains('open')
        && !rightDrawer.contains(event.target)
        && !event.target.closest('#menuToggle')
        && !event.target.closest('#realmToggle');
    
    if (clickedBackdrop || clickedOutsideDrawer) {
        closePanels();
    }
});

const menuRail = $('#menuRail');
$('#sidebarToggle')?.addEventListener('click', () => {
    const expanded = menuRail?.classList.toggle('expanded');
    $('#sidebarToggle')?.setAttribute('aria-expanded', String(Boolean(expanded)));
    if ($('#sidebarToggle')) {
        $('#sidebarToggle').textContent = expanded ? '|<' : '>|';
    }
});

$('#realmToggle')?.addEventListener('click', () => {
    $('#mobileNav')?.classList.remove('open');
    $('#menuToggle')?.setAttribute('aria-expanded', 'false');
    const isOpen = rightDrawer?.classList.contains('open');
    if (isOpen) closePanels();
    else openRightDrawer();
});

$('#drawerClose')?.addEventListener('click', closePanels);
drawerBackdrop?.addEventListener('click', closePanels);

const counter = $('.counter');
if (counter) {
    let started = false;
    const runCounter = () => {
        if (started) return;
        started = true;
        let n = 0;
        const t = +counter.dataset.target;
        const x = setInterval(() => {
            n += 4;
            counter.textContent = Math.min(n, t);
            if (n >= t) clearInterval(x);
        }, 28);
    };
    const ci = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) runCounter();
        });
    });
    ci.observe(counter);
}

const collections = [
    {
        id: 'bakery',
        name: 'Croissant',
        cover: 'assets/products/croissant.png',
        items: [
            ['Butter Croissant', 'A Flaky French croissant layered with premium butter.', null, 'assets/products/bakery-pastries/bakery-pastry-01.jpg'],
            ['Zaatar Croissant', 'Buttery croissant finished with aromatic zaatar blend.', null, 'assets/products/bakery-pastries/bakery-pastry-02.jpg'],
            ['Cheese Croissant', 'Golden flaky croissant with rich toasted cheese.', null, 'assets/products/bakery-pastries/bakery-pastry-03.jpg'],
            ['Almond Croissant', 'A freshly baked croissant with in-house almond paste.', null, 'assets/products/bakery-pastries/bakery-pastry-04.jpg'],
            ['Pain au Chocolat', 'A Buttery pastry with premium chocolate buttons and raw cacao.', null, 'assets/products/bakery-pastries/bakery-pastry-05.jpg'],
            ['Strawberry Croissant', 'A Flaky croissant with fresh strawberry and in-house strawberry paste.', null, 'assets/products/bakery-pastries/bakery-pastry-06.jpg'],
            ['Blueberry Croissant', 'A Buttery croissant with fresh blueberry and in-house blueberry paste.', null, 'assets/products/bakery-pastries/bakery-pastry-07.jpg'],
            ['Protein Croissant', 'A Freshly baked croissant packed with 20g of protein.', null, 'assets/products/bakery-pastries/bakery-pastry-08.jpg']
        ]
    },
    {
        id: 'fuel',
        name: 'Fuel Shakes',
        cover: 'assets/page-15.webp',
        items: [
            ['Smurf Fuel', 'A bold signature fuel shake with a playful Bendereign finish. Blue Spirulina, Banana, Raspberry, Coconut, Mango, Coconut Milk.', null, 'assets/products/fuel-shakes/smurf-fuel.png'],
            ['ChocoCherry', 'Chocolate and cherry notes blended into a rich, fruit-forward shake. Raw Cacao, Cherry, Oat Milk.', null, 'assets/products/fuel-shakes/choco-cherry.png'],
            ['BenderBerry', 'A vibrant berry-forward fuel shake with a refreshing finish. Dates, Blackberry, Blueberry, Oat Milk.', null, 'assets/products/fuel-shakes/bender-berry.png'],
            ['HoPink', 'A bright, creamy pink fuel shake made for a bold refresh. Dragon Fruit, Mango, Strawberry, Coconut Milk.', null, 'assets/products/fuel-shakes/hot-pink.png'],
            ['Let The Mango', 'A tropical mango fuel shake with a smooth, sunny finish. Mango, Pineapple, Passion Fruit, Coconut Milk.', null, 'assets/products/fuel-shakes/let-the-mango.png']
        ]
    },
    {
        id: 'refreshers',
        name: 'Fruit Refreshers',
        cover: 'assets/page-16.webp',
        items: [
            ['Berry Crown', 'A bright berry refresher with a fruit-forward finish.', null, 'assets/products/fruit-refreshers/berry-crown.jpg'],
            ['Dates Oasis', 'A refreshing Bendereign blend inspired by rich date notes.', null, 'assets/products/fruit-refreshers/dates-oasis.jpg'],
            ['Purple Lemon', 'A vivid citrus refresher with Bendereign\'s signature purple character.', null, 'assets/products/fruit-refreshers/purple-lemon.jpg'],
            ['Stella Fruit', 'A colourful fruit refresher designed for an easy, cooling sip.', null, 'assets/products/fruit-refreshers/stellar-fruit.jpg'],
            ['Supper Orange', 'A vibrant orange-led refresher with a bright citrus finish.', null, 'assets/products/fruit-refreshers/supper-orange.jpg'],
            ['Cherry Crush', 'A juicy cherry refresher with a crisp, fruity finish.', null, 'assets/products/fruit-refreshers/cherry-crush.jpg']
        ]
    },
    {
        id: 'specialty',
        name: 'Specialty Coffee',
        cover: 'assets/products/specialty-coffee.jpg',
        items: [
            ['Iced Orange Americano', 'A refreshing iced Americano paired with bright orange citrus notes.', null, 'assets/products/specialty-coffee/iced-orange-americano.png'],
            ['Iced Sparkling Lemon Americano', 'A crisp iced Americano lifted with sparkling lemon.', null, 'assets/products/specialty-coffee/iced-sparkling-lemon-americano.png'],
            ['Iced Strawberry Cloud Foam Latte', 'A layered iced latte with strawberry and a soft cloud-foam finish.', null, 'assets/products/specialty-coffee/iced-strawberry-cloud-foam-latte.png']
        ]
    },
    {
        id: 'matcha',
        name: 'Ceremonial Matcha',
        cover: 'assets/products/ceremonial-matcha.png',
        items: [
            ['Strawberry Cloud Foam Matcha Latte', 'Premium ceremonial matcha layered with vibrant strawberry puree and silky cloud foam.', null, 'assets/products/ceremonial-matcha/iced-strawberry-cloud-foam-latte.png'],
            ['Blue Spirulina Cloud Foam Matcha Latte', 'Earthy ceremonial matcha topped with nutrient-rich blue spirulina cloud foam.', null, 'assets/products/ceremonial-matcha/spirulina-cloud-foam-matcha.png'],
            ['Match meets Ube', 'Ceremonial matcha blended harmoniously with sweet, in-house fresh ube prep.', null, 'assets/products/ceremonial-matcha/match-meets-ube.png'],
            ['Matcha Latte', 'Traditional, high-quality ceremonial matcha blended with smooth milk.', null, 'assets/products/ceremonial-matcha/matcha-latte.png'],
            ['Ube Latte', 'Rich and creamy beverage crafted with in-house fresh ube prep.', null, 'assets/products/ceremonial-matcha/ube-latte.png'],
            ['Ube Bliss', 'A smooth, comforting, and sweet ube-forward treat.', null, 'assets/products/ceremonial-matcha/ube-bliss.png'],
            ['Mont Blanc Ube', 'A decadent fusion of rich coffee, dark layers, and smooth ube cream.', null, 'assets/products/ceremonial-matcha/mont-blanc-ube.png']
        ]
    },
    {
        id: 'coffee',
        name: 'Hot Coffee',
        cover: 'assets/page-19.webp',
        items: [
            ['Latte', 'Espresso with steamed milk and sweet condensed milk.', null, 'assets/products/coffee/latte.jpg'],
            ['Spanish Latte', 'Espresso with steamed milk and sweet condensed milk.', null, 'assets/products/coffee/spanish-latte.jpg'],
            ['Flat White', 'Espresso with steamed milk and thick, creamy foam.', null, 'assets/products/coffee/flat-white.jpg'],
            ['Americano', 'Espresso diluted with hot water - light and smooth.', null, 'assets/products/coffee/americano.jpg'],
            ['Mocha', 'Espresso with steamed milk and sweet condensed milk.', null, 'assets/products/coffee/mocha.jpg'],
            ['Cappuccino', 'Equal parts espresso and warm milk - bold and balanced.', null, 'assets/products/coffee/cappuccino.jpg'],
            ['Machiato', 'Espresso topped with a touch of silky milk foam.', null, 'assets/products/coffee/machiato.jpg'],
            ['Espresso', 'A single bold shot of pure, rich espresso.', null, 'assets/products/coffee/espresso.jpg'],
            ['Cortado', 'Small latte with a strong espresso base.', null, 'assets/products/coffee/cortado.jpg'],
            ['Double Espresso', 'Espresso with steamed milk and sweet condensed milk.', null, 'assets/products/coffee/double-espresso.jpg'],
            ['Iced Mocha', 'Iced espresso blended with chocolate and cold milk.', null, 'assets/products/coffee/mocha.jpg'],
            ['Ice Americano', 'Espresso poured over ice with cold water - light and refreshing.', null, 'assets/products/coffee/ice-americano.jpg'],
            ['Matcha Latte Ceremonial', 'Premium ceremonial-grade matcha blended with smooth, creamy milk.', null, 'assets/products/coffee/latte.jpg']
        ]
    },
    {
        id: 'sandwiches',
        name: 'Sandwiches',
        cover: 'assets/Sandwiches.jpg',
        items: [
            ['Bender’s Garden', 'In-house Pesto, Lettuce, Slice Mozzarella, Red Cabbage, Strawberry, Avocado.', null, 'assets/products/sandwiches/benders-garden.png'],
            ['Rule The Roast', 'Bender Jus, Avocado Dressing, Avocado, Chicken Roast, Lettuce.', null, 'assets/products/sandwiches/rule-the-roast.png'],
            ['Shrimply The Best', 'Shrimp, Lettuce Greens, Avocado, Red cabbage, Cajun sauce.', null, 'assets/products/sandwiches/shrimply-the-best.png'],
            ['Tuna Matata', 'Lettuce Romania, Tuna Premix, Red Cabbage, Avocado.', null, 'assets/products/sandwiches/tuna-matata.png'],
            ['Meat The Bender', 'Beef Strips, Grilled Bun, Lettuce, Red Cabbages, Avocado, Cajun Base Sauce.', null, 'assets/products/sandwiches/meat-the-bender.png']
        ]
    },
    {
        id: 'salads',
        name: 'Salad Bowls',
        cover: 'assets/products/salad-bowls.png',
        items: [
            ['Vegan Super Salad', 'Rocca Leaves, House Pesto, Lettuce, Red Cabbage, Pickle Onion, Avocado.', null, 'assets/products/salad-bowls/vegan-super-salad.png'],
            ['Chicken Salad', 'Lettuce, House Pesto, Cherry Tomato, Red Cabbage, Pickle Onion, Chicken Edamame.', null, 'assets/products/salad-bowls/chicken-salad.png'],
            ['Shrimp Salad', 'Baby Spinach, Pesto, Cherry Tomato, Red Cabbage, Pickle Onion, Boiled Shrimp.', null, 'assets/products/salad-bowls/shrimp-salad.png'],
            ['Tuna Spicy Salad', 'Rocca Leaves, Lettuce, Red Cabbage, Pickle Onion, Tuna, Cherry Tomato.', null, 'assets/products/salad-bowls/tuna-spicy-salad.png'],
            ['Beef Salad', 'Spinach, Lemon Olive, Lettuce, Red Cabbage, Pickle Onion, Beef.', null, 'assets/products/salad-bowls/beef-salad.png'],
            ['Fruit Salad', 'Orange, Watermelon, Pineapple, Strawberry, Blackberry, Blueberry.', null, 'assets/products/salad-bowls/fruit-salad.png']
        ]
    },
    {
        id: 'buff',
        name: 'Bender Buff',
        cover: 'assets/Bender-Buff.jpg',
        items: [
            ['Blackberry Buff', 'A sweet and tart pastry buff crowned with fresh blackberries.', null, 'assets/products/bender-buff/blackberry-buff.jpg'],
            ['Blueberry Buff', 'A delightful pastry buff filled with juicy blueberries and creamy topping.', null, 'assets/products/bender-buff/blueberry-buff.jpg'],
            ['Matcha Tiramisu Buff', 'An exquisite fusion of ceremonial matcha and creamy tiramisu.', null, 'assets/products/bender-buff/matcha-buff.jpg'],
            ['Mixedberry Buff', 'A vibrant pastry buff loaded with a selection of mixed berries.', null, 'assets/products/bender-buff/mixedberry-buff.jpg'],
            ['Oreo Buff', 'A rich pastry buff layered with crushed Oreo cookies and sweet filling.', null, 'assets/products/bender-buff/oreo-buff.jpg'],
            ['Pistachio Khunafa Buff', 'A golden pastry crust filled with pistachio khunafa flavors.', null, 'assets/products/bender-buff/pistachio-khunafa-buff.jpg'],
            ['Strawberry Buff', 'A classic pastry buff topped with strawberries and smooth cream.', null, 'assets/products/bender-buff/strawberry-buff.jpg'],
            ['Tiramisu Buff', 'A decadent pastry buff featuring classic coffee and cocoa notes.', null, 'assets/products/bender-buff/tiramisu-buff.jpg']
        ]
    }
];

function renderFavorites() {
    const content = $('#favoritesContent');
    if (!content) return;
    const saved = JSON.parse(localStorage.getItem('bendereignFavorites') || '[]');
    const items = collections.flatMap(collection => collection.items.map(item => ({
        title: item[0],
        description: item[1],
        image: item[3],
        price: item[2] ? `AED ${item[2]}` : 'Price on Keeta/noon'
    }))).filter(item => saved.includes(item.title));

    content.innerHTML = items.length ? items.map(item => `
        <article class="favorite-card">
            <img src="${item.image}" alt="${item.title}">
            <div><h3>${item.title}</h3><p>${item.description}</p><small>${item.price}</small></div>
        </article>`).join('') : '<p class="favorites-empty">You have no saved favorites yet.</p>';
}

function getFavoriteNames() {
    return JSON.parse(localStorage.getItem('bendereignFavorites') || '[]');
}

function isFavorite(title) {
    return getFavoriteNames().includes(title);
}

function updateFavoriteUI(title) {
    const active = isFavorite(title);
    $$(`[data-save="${CSS.escape(title)}"]`).forEach(button => {
        button.textContent = active ? '♥ Saved' : '♡ Save';
        button.classList.toggle('is-favorite', active);
    });
}

function toggleFavorite(title) {
    const saved = getFavoriteNames();
    const next = saved.includes(title) ? saved.filter(item => item !== title) : [...saved, title];
    localStorage.setItem('bendereignFavorites', JSON.stringify(next));
    updateFavoriteUI(title);
    if ($('#favoritesPanel')?.classList.contains('open')) renderFavorites();
}

let active = null;

function renderFilters() {
    const f = $('#menuFilters');
    if (!f) return;
    f.innerHTML = `<button class="menu-filter active" data-id="all">Menu Overview</button>` +
        collections.map(c => `<button class="menu-filter" data-id="${c.id}">${c.name}</button>`).join('');
    $$('.menu-filter', f).forEach(b =>
        b.onclick = () => b.dataset.id === 'all' ? renderCategories() : openCollection(b.dataset.id)
    );
}

function renderCategories() {
    active = null;
    const breadcrumb = $('#menuBreadcrumb');
    const grid = $('#menuGrid');
    if (breadcrumb) breadcrumb.hidden = true;
    if (!grid) return;

    grid.innerHTML = collections.map(c =>
        `<article class="menu-card category-card" data-open="${c.id}">
            <img src="${c.cover}" alt="${c.name}">
            <div class="menu-card-body">
                <small>Collection</small>
                <h3>${c.name}</h3>
                <p>Open collection to view individual products.</p>
                <button class="order-now" type="button">View collection →</button>
            </div>
        </article>`
    ).join('');
    $$('[data-open]').forEach(c => c.onclick = () => openCollection(c.dataset.open));
    setFilter('all');
}

function openCollection(id) {
    const c = collections.find(x => x.id === id);
    if (!c) return;
    active = id;
    const breadcrumb = $('#menuBreadcrumb');
    const currCollection = $('#currentCollection');
    const grid = $('#menuGrid');

    if (breadcrumb) breadcrumb.hidden = false;
    if (currCollection) currCollection.textContent = c.name;
    if (!grid) return;

    grid.innerHTML = c.items.map(i =>
        `<article class="menu-card product-card" data-product="${i[0]}" data-img="${i[3]}" data-desc="${i[1]}" data-price="${i[2] || 'Price on Keeta/noon'}">
            <img src="${i[3]}" alt="${i[0]}">
            <div class="menu-card-body">
                <small>${c.name}</small>
                <h3>${i[0]}</h3>
                <p>${i[1]}</p>
                <span class="menu-price">${i[2] ? `AED ${i[2]}` : 'Price on Keeta/noon'}</span>
                <button class="save-product" type="button" data-save="${i[0]}">♡ Save</button>
                <button class="order-now" type="button" data-order="${i[0]}">Order Now</button>
            </div>
        </article>`
    ).join('');

    $$('.menu-card[data-product]').forEach(card => {
        card.onclick = event => {
            if (event.target.closest('button')) return;
            openProductDetail({
                title: card.dataset.product,
                image: card.dataset.img,
                description: card.dataset.desc,
                price: card.dataset.price
            });
        };
    });

    $$('[data-order]').forEach(b => b.onclick = openDelivery);
    $$('[data-save]').forEach(btn => {
        btn.onclick = () => toggleFavorite(btn.dataset.save);
        updateFavoriteUI(btn.dataset.save);
    });

    setFilter(id);
}

function setFilter(id) {
    $$('.menu-filter').forEach(b => b.classList.toggle('active', b.dataset.id === id));
}

function initializeMenu() {
    renderFilters();
    renderCategories();

    const menuSearch = $('#menuSearch');
    const menuViewToggle = $('#menuViewToggle');
    const viewSequence = ['grid', 'list', 'column'];
    let currentView = 'grid';

    menuSearch?.addEventListener('input', () => {
        const query = menuSearch.value.trim().toLowerCase();
        $$('.menu-card', $('#menuGrid')).forEach(card => {
            card.hidden = query && !card.textContent.toLowerCase().includes(query);
        });
    });

    const setMenuView = view => {
        const grid = $('#menuGrid');
        if (!grid) return;

        currentView = view;
        grid.classList.toggle('list-view', view === 'list');
        grid.classList.toggle('column-view', view === 'column');

        const labelMap = {
            grid: { icon: '▦', title: 'View Grid', aria: 'Toggle menu to grid view' },
            list: { icon: '☰', title: 'View List', aria: 'Toggle menu to list view' },
            column: { icon: '▤', title: 'View Column', aria: 'Toggle menu to column view' }
        };

        const config = labelMap[view] || labelMap.grid;
        if (menuViewToggle) {
            menuViewToggle.textContent = config.icon;
            menuViewToggle.title = config.title;
            menuViewToggle.setAttribute('aria-label', config.aria);
        }
    };

    menuViewToggle?.addEventListener('click', () => {
        const nextIndex = (viewSequence.indexOf(currentView) + 1) % viewSequence.length;
        setMenuView(viewSequence[nextIndex]);
    });

    setMenuView('grid');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMenu, { once: true });
} else {
    initializeMenu();
}

const productOverlay = document.createElement('div');
productOverlay.className = 'overlay';
productOverlay.id = 'productOverlay';
productOverlay.setAttribute('aria-hidden', 'true');

const productModal = document.createElement('section');
productModal.className = 'product-modal';
productModal.id = 'productModal';
productModal.setAttribute('aria-hidden', 'true');
productModal.innerHTML = `
    <button class="close" id="closeProduct" type="button" aria-label="Close product details">×</button>
    <img class="product-modal-image" id="productModalImage" alt="">
    <div class="product-modal-content">
        <p class="eyebrow">Bendereign menu</p>
        <h2 id="productModalTitle"></h2>
        <p id="productModalDescription"></p>
        <span class="menu-price" id="productModalPrice"></span>
        <button class="favorite-btn" id="productModalFavorite" type="button" aria-label="Add to favorites">♡</button>
        <button class="order-now" id="productModalOrder" type="button">Order Now</button>
    </div>`;
document.body.append(productOverlay, productModal);

function openProductDetail(product) {
    const image = $('#productModalImage');
    if (image) {
        image.src = product.image;
        image.alt = product.title;
    }
    if ($('#productModalTitle')) $('#productModalTitle').textContent = product.title;
    if ($('#productModalDescription')) $('#productModalDescription').textContent = product.description;
    if ($('#productModalPrice')) $('#productModalPrice').textContent = product.price;

    const favoriteButton = $('#productModalFavorite');
    if (favoriteButton) {
        favoriteButton.dataset.title = product.title;
        favoriteButton.textContent = isFavorite(product.title) ? '♥' : '♡';
    }

    $('#productModalOrder')?.removeEventListener('click', openProductOrder);
    $('#productModalOrder')?.addEventListener('click', openProductOrder);
    productOverlay.classList.add('open');
    productModal.classList.add('open');
}

$('#productModalFavorite')?.addEventListener('click', () => {
    const title = $('#productModalFavorite')?.dataset.title;
    if (title) toggleFavorite(title);
});

function openProductOrder() {
    closeProductDetail();
    openDelivery();
}

function closeProductDetail() {
    productOverlay.classList.remove('open');
    productModal.classList.remove('open');
}

$('#closeProduct')?.addEventListener('click', closeProductDetail);
productOverlay.addEventListener('click', closeProductDetail);

function openDelivery() {
    $('#deliveryOverlay')?.classList.add('open');
    $('#deliveryModal')?.classList.add('open');
}

function closeDelivery() {
    $('#deliveryOverlay')?.classList.remove('open');
    $('#deliveryModal')?.classList.remove('open');
}

$('#closeDelivery')?.addEventListener('click', closeDelivery);
$('#deliveryOverlay')?.addEventListener('click', closeDelivery);

const exp = ['assets/exp-01.jpg', 'assets/exp-02.jpg', 'assets/exp-03.jpg', 'assets/exp-04.jpg', 'assets/exp-05.jpg'];
let ex = 0;
const expImage = $('#experienceImage');

function showExperience(index) {
    if (!expImage) return;
    ex = (index + exp.length) % exp.length;
    expImage.src = exp[ex];
    const num = $('#experienceNumber');
    if (num) num.textContent = String(ex + 1).padStart(2, '0');
}

$('#expPrev')?.addEventListener('click', () => showExperience(ex - 1));
$('#expNext')?.addEventListener('click', () => showExperience(ex + 1));
if (expImage) window.setInterval(() => showExperience(ex + 1), 4500);

const moments = [
    'assets/page-23.jpg', 'assets/page-24.webp', 'assets/page-25.webp',
    'assets/page-26.webp', 'assets/page-27.webp', 'assets/page-28.webp', 'assets/page-29.webp'
];

const momentsTrack = $('#momentsTrack');
if (momentsTrack) {
    momentsTrack.innerHTML = [...moments, ...moments].map((s, i) =>
        `<img src="${s}" alt="Bendereign moment ${i % moments.length + 1}">`
    ).join('');
}

$('#contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    alert('Inquiry sent! Demo mode.');
});

$('#reignSignup')?.addEventListener('submit', e => {
    e.preventDefault();
    alert('Welcome to The Reign Club!');
});
