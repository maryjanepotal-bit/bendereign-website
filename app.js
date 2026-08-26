// ================================================================
// BENDEREIGN ENHANCED FUNCTIONALITY — FIXED FRAME BOOK VIEW
// ================================================================

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

// Set current year
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// =====================================================
// FIXED-FRAME PAGE SWITCHING (SINGLE SECTION VISIBILITY)
// =====================================================
const pageSections = $$('main > section');
const footer = $('.site-footer');
const footerFlow = document.createElement('div');
footerFlow.className = 'page-footer-flow';
if (footer) footerFlow.append(footer);
const footerSections = new Set(['minds', 'menu', 'visit-us']);
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

    // Tagalog comment: Dito i-aadjust kung aling sections ang may shared footer.
    // Mount the footer only in sections that are meant to show it.
    footerFlow.classList.toggle('footer-visible', footerSections.has(target.id));
    if (footerSections.has(target.id)) {
        footerFlow.dataset.section = target.id;
        target.append(footerFlow);
    } else {
        delete footerFlow.dataset.section;
        footerFlow.remove();
    }

    // Itago ang lahat at ipakita LAMANG ang pinindot na section
    pageSections.forEach(section => {
        const active = section === target;
        if (!active && section.contains(document.activeElement)) {
            document.activeElement.blur();
        }
        section.classList.toggle('active-section', active);
        section.setAttribute('aria-hidden', String(!active));
        if (active) {
            section.scrollTop = 0; // Ibalik sa tuktok ang scroll ng active section
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

// Unang bukas ng page
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

// =====================================================
// NAVIGATION LINKS & LOGO (IN-PLACE SECTION SWAP)
// =====================================================
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
    window.setTimeout(() => {
        if (document.activeElement?.closest('#favoritesPanel, #privacyOverlay')) document.activeElement.blur();
    }, 0);
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

// The hamburger opens the primary navigation on mobile and the secondary
// navigation drawer on desktop, where the mobile nav is intentionally hidden.
$('#menuToggle')?.addEventListener('click', () => {
    const mobileNav = $('#mobileNav');
    if (window.matchMedia('(min-width: 901px)').matches) {
        const open = rightDrawer?.classList.contains('open');
        if (open) closePanels();
        else openRightDrawer();
        $('#menuToggle')?.setAttribute('aria-expanded', String(!open));
        $('#menuToggle')?.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
        return;
    }

    const open = mobileNav?.classList.toggle('open');
    $('#menuToggle')?.setAttribute('aria-expanded', String(Boolean(open)));
    $('#menuToggle')?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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

// Developer comment: Configure backdrop blur intensity and click-outside window event listener to auto-hide drawer here
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
        $('#sidebarToggle').setAttribute('aria-label', expanded ? 'Close menu utilities' : 'Open menu utilities');
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

// =====================================================
// NUMBER COUNTER ANIMATION
// =====================================================
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

// =====================================================
// MENU DATA & FILTERING
// =====================================================
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
            ['Smurf Fuel', 'A bold signature fuel shake with a playful Bendereign finish. Blue Spirulina, Banana, Raspberry, Coconut, Mango, Coconut Milk. A striking, nutrient-dense powerhouse that tastes as vibrant as it looks, crafted to elevate your daily wellness routine.', null, 'assets/products/fuel-shakes/smurf-fuel.png'],
            
            ['ChocoCherry', 'Chocolate and cherry notes blended into a rich, fruit-forward shake. Raw Cacao, Cherry, Oat Milk. Indulgent yet entirely clean, this sophisticated pairing satisfies your sweet cravings while fueling your body with raw, natural energy.', null, 'assets/products/fuel-shakes/choco-cherry.png'],

            ['BenderBerry', 'A vibrant berry-forward fuel shake with a refreshing finish. Dates, Blackberry, Blueberry, Oat Milk. Earthy and naturally sweetened by dates, it offers a rich, smooth texture that serves as the perfect wholesome, plant-based pick-me-up.', null, 'assets/products/fuel-shakes/bender-berry.png'],

            ['HoPink', 'A bright, creamy pink fuel shake made for a bold refresh. Dragon Fruit, Mango, Strawberry, Coconut Milk. Packed with vibrant antioxidants, this visually stunning blend delivers a perfectly balanced, naturally sweet kick to revitalize your day.', null, 'assets/products/fuel-shakes/hot-pink.png'],

            ['Let The Mango', 'A tropical mango fuel shake with a smooth, sunny finish. Mango, Pineapple, Passion Fruit, Coconut Milk. Sweetened by nature and blended to creamy perfection, this luxurious drink is the ultimate refreshing escape.', null, 'assets/products/fuel-shakes/let-the-mango.png']
        ]
    },
    {
        id: 'refreshers',
        name: 'Fruit Refreshers',
        cover: 'assets/page-16.webp',
        items: [
            ['Berry Crown', 'A bright berry refresher with a fruit-forward finish. Strawberry, Frozen Raspberries, Green Tea, Strawberry Cloud Foam. Made fresh with real whole fruits and clean botanical blends.', null, 'assets/products/fruit-refreshers/berry-crown.jpg'],

            ['Dates Oasis', 'A refreshing Bendereign blend inspired by rich date notes. Dates, Black Tea, Orange Juice, Cloud Foam. Naturally sweetened and made fresh daily to energize your body.', null, 'assets/products/fruit-refreshers/dates-oasis.jpg'],

            ['Purple Lemon', 'A vivid citrus refresher with Bendereign\'s signature purple character. Blueberry, Lemon, Green Tea, Cloud Foam. Crafted with pure, real ingredients to elevate your daily refreshment.', null, 'assets/products/fruit-refreshers/purple-lemon.jpg'],

            ['Stella Fruit', 'A colourful fruit refresher designed for an easy, cooling sip. Orange, Kumquats, Green Tea, Passion Fruit, Water Melon, Orange Juice, Yellow Lemon. Handcrafted daily with 100% natural fruit and zero artificial sweeteners.', null, 'assets/products/fruit-refreshers/stellar-fruit.jpg'],

            ['Supper Orange', 'A vibrant orange-led refresher with a bright citrus finish. Orange, Green Tea, Orange Juice, Yellow Lemon. Blended fresh with real fruit juice and natural vitality boosters.', null, 'assets/products/fruit-refreshers/supper-orange.jpg'],

            ['Cherry Crush', 'A juicy cherry refresher with a crisp, fruity finish. Cherry, Raspberry, Black Tea, Cloud Foam. Prepared fresh daily using authentic ingredients and zero syrups.', null, 'assets/products/fruit-refreshers/cherry-crush.jpg']
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

            ['Blue Spirulina Cloud Foam Matcha Latte:', ' Earthy ceremonial matcha topped with nutrient-rich blue spirulina cloud foam.', null, 'assets/products/ceremonial-matcha/spirulina-cloud-foam-matcha.png'],

            ['Match meets Ube', 'Ceremonial matcha blended harmoniously with sweet, in-house fresh ube prep.', null, 'assets/products/ceremonial-matcha/match-meets-ube.png'],

            ['Matcha Latte', 'Traditional, high-quality ceremonial matcha blended with smooth milk.', null, 'assets/products/ceremonial-matcha/matcha-latte.png']

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

             ['Cappuccino', 'Equal parts espresso and warm milk - bold and balanced.', null, 'assets/products/coffee/cappuccino.jpg']
           
             ['Machiato', 'Espresso topped with a touch of silky milk foam.', null, 'assets/products/coffee/machiato.jpg'],

            ['Espresso', 'A single bold shot of pure, rich espresso.', null, 'assets/products/coffee/espresso.jpg'],

            ['Cortado', 'Small latte with a strong espresso base.', null, 'assets/products/coffee/cortado.jpg'],

            ['Double Espresso', 'Espresso with steamed milk and sweet condensed milk.', null, 'assets/products/coffee/double-espresso.jpg'],




            ['Iced Mocha', 'RIced espresso blended with chocolate and cold milk.', null, 'assets/products/coffee/mocha.jpg'],

            ['Ice Americano', 'Espresso poured over ice with cold water - light and refreshing.', null, 'assets/products/coffee/ice-americano.jpg'],
            
            ['Matcha Latte Ceremonial', 'Premium ceremonial-grade matcha blended with smooth, creamy milk for an authentic, earthy flavor.', null, 'assets/products/coffee/latte.jpg'],  
        ]
    },

       {
        id: 'coffee',
        name: 'Cold Coffee',
        cover: 'assets/page-19.webp',
        items: [
     
            ['Iced Mocha', 'RIced espresso blended with chocolate and cold milk.', null, 'assets/products/coffee/ice-mocha.jpg'],
            
            ['Fresh Orange Iced Americano', 'Iced espresso with fresh orange juice - citrusy and refreshing.', null, 'assets/products/coffee/fresh.jpg'], 
            
            ['Ice Americano', 'Espresso poured over ice with cold water - light and refreshing.', null, 'assets/products/coffee/ice-americano.jpg'],

            ['Iced Double Espreso', 'Honey (Universal) Drinks.', null, 'assets/products/coffee/iced-double-espreso.jpg'],
            
            ['Iced Latte', 'Smooth espresso poured over ice and blended with cold milk.', null, 'assets/products/coffee/ice-latte.jpg'],  

            ['Iced Spanish Latte', 'Iced espresso with creamy milk and sweet condensed milk.', null, 'assets/products/coffee/ice-spanish-latte.jpg'],  

            ['Iced Lemon Sparkling Americano', 'Iced espresso with sparkling water and fresh lemon', null, 'assets/products/coffee/ice-lemon.jpg'],  

            ['Iced Strawberry Cheese Foam Latte', 'Iced latte topped with strawberry-infused creamy cheese foam', null, 'assets/products/coffee/iced-strawberry.jpg'],  

            ['Iced Cappuccino', 'Chilled espresso over ice topped with creamy, frothy milk.', null, 'assets/products/coffee/iced-cappuccino.jpg'],  

            ['Iced Espresso', 'A bold shot of espresso served over ice - smooth, strong, and refreshing.', null, 'assets/products/coffee/iced-espresso.jpg'],  
        ]
    },
    {
        id: 'sandwiches',
        name: 'Sandwiches',
        cover: 'assets/Sandwiches.jpg',
        items: [

            ['Bender’s Garden:', 'In-house Pesto, Lettuce, Slice Mozzarella, Red Cabbage, Strawberry, Avocado. A vibrant, gourmet vegetarian sandwich featuring creamy avocado, fresh greens, and a unique touch of sweet strawberry paired with rich in-house pesto.', null, 'assets/products/sandwiches/benders-garden.png'],

            ['Rule The Roast:', 'Bender Jus, Avocado Dressing, Avocado, Chicken Roast, Lettuce.Tender roasted chicken paired with smooth avocado dressing and rich bender jus for a savory, satisfying crunch.', null, 'assets/products/sandwiches/rule-the-roast.png'],

            ['Shrimply The Best:', 'Shrimp, Lettuce Greens, Avocado, Red cabbage, Cajun sauce. Juicy, premium shrimp combined with fresh greens and a kick of flavorful Cajun sauce.', null, 'assets/products/sandwiches/shrimply-the-best.png'],

            ['Tuna Matata:', 'Lettuce Romania, Tuna Premix, Red Cabbage, Avocado. A protein-packed, flavorful tuna blend layered with fresh vegetables and creamy avocado.', null, 'assets/products/sandwiches/tuna-matata.png'],

            ['Meat The Bender: ', 'Beef Strips, Grilled Bun, Lettuce, Red Cabbages, Avocado, Cajun Base Sauce. Ɖ44 — Hearty, savory beef strips stacked on a perfectly toasted bun with a bold Cajun base sauce and fresh fixings.', null, 'assets/products/sandwiches/meat-the-bender.png'],

        ]
    },
    {
        id: 'salads',
        name: 'Salad Bowls',
        cover: 'assets/products/salad-bowls.png',
        items: [
            ['Vegan Super Salad', 'Rocca Leaves, House Pesto, Lettuce, Red Cabbage, Pickle Onion, Avocado, Cherry Tomato, Peso Dressing, Pomegranate Seeds, Pumpkin Seeds, Cranberry. A vibrant and nutrient-dense plant-based bowl packed with fresh greens, creamy avocado, and a delightful mix of seeds and berries.', null, 'assets/products/salad-bowls/vegan-super-salad.png'],

            ['Chicken Salad', 'Lettuce, House Pesto, Cherry Tomato, Red Cabbage, Pickle Onion, Chicken Edamame, Croutons, Cranberry Cheese Emmental. A satisfying, protein-rich salad featuring tender chicken, savory cheese, and a crisp crunch from fresh croutons and vegetables.', null, 'assets/products/salad-bowls/chicken-salad.png'],

            ['Shrimp Salad:', 'Baby Spinach, Pesto, Cherry Tomato, Red Cabbage, Pickle Onion, Boiled Shrimp, Edamame, Lettuce, Croutons, Cranberry Dried, Pumpkin Seeds. A refreshing seafood bowl featuring succulent boiled shrimp tossed with baby spinach, sweet cranberries, and crunchy pumpkin seeds.', null, 'assets/products/salad-bowls/shrimp-salad.png'],

            ['Tuna Spicy Salad:', 'Rocca Leaves, Lettuce, Red Cabbage, Pickle Onion, Tuna, Cherry Tomato, Lemon Olive, Mixed Sesame Seeds, Cranberry, Pumpkin Seeds. A bold and flavorful tuna salad balanced with fresh rocca leaves, zesty lemon olive oil, and a kick of spice.', null, 'assets/products/salad-bowls/tuna-spicy-salad.png'],

            ['Beef Salad', 'Spinach, Lemon Olive, Lettuce, Red Cabbage, Pickle Onion, Beef, Edamame, Mixed Sesame Seeds, Cranberry, Pumpkin Seeds. A hearty, protein-packed bowl featuring savory beef slices over a bed of fresh spinach and mixed greens.', null, 'assets/products/salad-bowls/beef-salad.png']

            ['Fruit Salad:', 'Orange, Watermelon, Pineapple, Strawberry, Blackberry, Blueberry. A refreshing, colorful assortment of hand-cut seasonal fruits bursting with natural sweetness.', null, 'assets/products/salad-bowls/fruit-salad.png']
        ]
    },
    {
        id: 'buff',
        name: 'Bender Buff',
        cover: 'assets/Bender-Buff.jpg',
        items: [
            
            ['Blackberry Buff', ' A sweet and tart pastry buff crowned with a generous mound of fresh, juicy blackberries.', null, 'assets/products/bender-buff/blackberry-buff.jpg'],

            ['Blueberry Buff', ' A delightful pastry buff filled with juicy, plump blueberries and a smooth, creamy topping.', null, 'assets/products/bender-buff/blueberry-buff.jpg'],

            ['Matcha Tiramisu Buff', 'An exquisite fusion of earthy ceremonial matcha and creamy tiramisu cream served in a crisp, buttery crust.', null, 'assets/products/bender-buff/matcha-buff.jpg'],

            ['Mixedberry Buff', 'A vibrant, fruit-forward pastry buff loaded with a fresh selection of hand-picked seasonal mixed berries.', null, 'assets/products/bender-buff/mixedberry-buff.jpg'],

            ['Oreo Buff', 'A rich and indulgent pastry buff layered with crushed Oreo cookies and creamy, sweet filling.', null, 'assets/products/bender-buff/oreo-buff.jpg'],

            ['Pistachio Khunafa Buff', 'A special, golden pastry crust filled with rich pistachio khunafa flavors and topped with a decadent, nutty finish.', null, 'assets/products/bender-buff/pistachio-khunafa-buff.jpg'],

            ['Strawberry Buff', 'A classic, fresh pastry buff topped with vibrant, sweet strawberries and a dollop of smooth cream.', null, 'assets/products/bender-buff/strawberry-buff.jpg'],

            ['Tiramisu Buff', 'A decadent pastry buff featuring classic coffee and cocoa notes layered into a rich, creamy Italian-inspired treat.', null, 'assets/products/bender-buff/tiramisu-buff.jpg']
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
    const modalButton = $('#productModalFavorite');
    if (modalButton?.dataset.title === title) {
        modalButton.classList.toggle('is-favorite', active);
        modalButton.setAttribute('aria-pressed', String(active));
        modalButton.textContent = active ? '♥' : '♡';
    }
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
        btn.onclick = () => {
            toggleFavorite(btn.dataset.save);
        };
        updateFavoriteUI(btn.dataset.save);
    });

    setFilter(id);
}

function setFilter(id) {
    $$('.menu-filter').forEach(b => b.classList.toggle('active', b.dataset.id === id));
}

$('#filterPrev')?.addEventListener('click', () => $('#menuFilters')?.scrollBy({ left: -240, behavior: 'smooth' }));
$('#filterNext')?.addEventListener('click', () => $('#menuFilters')?.scrollBy({ left: 240, behavior: 'smooth' }));

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
        grid.classList.add('is-switching');
        window.setTimeout(() => {
            grid.classList.remove('is-switching');
            grid.classList.toggle('list-view', view === 'list');
            grid.classList.toggle('column-view', view === 'column');
            grid.classList.toggle('view-grid', view === 'grid');
            grid.classList.toggle('view-list', view === 'list');
            grid.classList.toggle('view-column', view === 'column');
        }, 150);

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
            menuViewToggle.dataset.view = view;
            menuViewToggle.setAttribute('aria-pressed', String(view === 'grid' || view === 'column'));
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

// =====================================================
// PRODUCT DETAIL AND DELIVERY MODALS
// =====================================================
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
        <button class="favorite-btn" id="productModalFavorite" type="button" aria-label="Add to favorites"
            aria-pressed="false">♡</button>
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
        favoriteButton.setAttribute('aria-label', `${isFavorite(product.title) ? 'Remove' : 'Add'} ${product.title} ${isFavorite(product.title) ? 'from' : 'to'} favorites`);
        favoriteButton.classList.toggle('is-favorite', isFavorite(product.title));
        favoriteButton.setAttribute('aria-pressed', String(isFavorite(product.title)));
        favoriteButton.textContent = isFavorite(product.title) ? '♥' : '♡';
    }
    $('#productModalOrder')?.removeEventListener('click', openProductOrder);
    $('#productModalOrder')?.addEventListener('click', openProductOrder);
    productOverlay.classList.add('open');
    productModal.classList.add('open');
    productOverlay.setAttribute('aria-hidden', 'false');
    productModal.setAttribute('aria-hidden', 'false');
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
    productOverlay.setAttribute('aria-hidden', 'true');
    productModal.setAttribute('aria-hidden', 'true');
}

$('#closeProduct')?.addEventListener('click', closeProductDetail);
productOverlay.addEventListener('click', closeProductDetail);

function openDelivery() {
    $('#deliveryOverlay')?.classList.add('open');
    const modal = $('#deliveryModal');
    if (modal) {
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeDelivery() {
    $('#deliveryOverlay')?.classList.remove('open');
    const modal = $('#deliveryModal');
    if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
    }
}

$('#closeDelivery')?.addEventListener('click', closeDelivery);
$('#deliveryOverlay')?.addEventListener('click', closeDelivery);
document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    closeProductDetail();
    closeDelivery();
});

// =====================================================
// EXPERIENCE SLIDESHOW & MOMENTS
// =====================================================
const exp = ['assets/exp-01.jpg', 'assets/exp-02.jpg', 'assets/exp-03.jpg', 'assets/exp-04.jpg', 'assets/exp-05.jpg'];
let ex = 0;
const expImage = $('#experienceImage');
let experienceChangeTimer;
let experienceTransitionId = 0;

async function showExperience(index) {
    if (!expImage) return;
    ex = (index + exp.length) % exp.length;
    const transitionId = ++experienceTransitionId;
    const nextImage = new Image();
    nextImage.src = exp[ex];

    try {
        await nextImage.decode();
    } catch {
        // Continue with the source swap if the browser cannot decode explicitly.
    }

    if (transitionId !== experienceTransitionId) return;
    expImage.classList.add('is-changing');
    clearTimeout(experienceChangeTimer);
    experienceChangeTimer = setTimeout(() => {
        if (transitionId !== experienceTransitionId) return;
        expImage.src = exp[ex];
        const num = $('#experienceNumber');
        if (num) num.textContent = String(ex + 1).padStart(2, '0');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => expImage.classList.remove('is-changing'));
        });
    }, 500);
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

// =====================================================
// CONCENTRIC RING BUTTONS
// =====================================================
const ringMarkup = '<svg class="ring-button-svg" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20"></circle></svg>';
const pillMarkup = '<svg class="social-pill-svg" preserveAspectRatio="none" viewBox="0 0 100 40" aria-hidden="true"><rect x="1" y="1" width="98" height="38" rx="19" ry="19"></rect></svg>';
$$('.visit-socials a, .whatsapp-float').forEach(button => {
    button.classList.add('ring-button');
    if (!button.querySelector('.ring-button-svg')) button.insertAdjacentHTML('afterbegin', ringMarkup);
});
$$('.drawer-socials a').forEach(button => {
    button.classList.add('social-pill');
    if (!button.querySelector('.social-pill-svg')) button.insertAdjacentHTML('afterbegin', pillMarkup);
});

// Forms
$('#contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    alert('Inquiry sent! Demo mode.');
});

$('#reignSignup')?.addEventListener('submit', e => {
    e.preventDefault();
    alert('Welcome to The Reign Club!');
});
