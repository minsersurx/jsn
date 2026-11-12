/* Occasional, non-interactive background cakes. The host page supplies the script/link references. */
(function backgroundCakes() {
    'use strict';

    var SECTION_SELECTOR = '.cover, .plain-note-section, .birthday-letter-section, .timeline-section, .photo-wall-section, .main-footer';
    var CAKE_FIELD_CLASS = 'cake-field';
    var CAKE_CLASS = 'background-cake';
    var CAKES = ['🎂', '🍰'];
    var MAX_CAKES = 6;
    var MIN_DELAY = 2500;
    var MAX_DELAY = 4500;
    var FALLBACK_BUFFER = 700;

    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    function reducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function introIsFinished() {
        var intro = document.getElementById('introScreen');
        return !intro || intro.classList.contains('hidden');
    }

    function ensureFields() {
        document.querySelectorAll(SECTION_SELECTOR).forEach(function (section) {
            if (!section.querySelector(':scope > .' + CAKE_FIELD_CLASS)) {
                var field = document.createElement('div');
                field.className = CAKE_FIELD_CLASS;
                field.setAttribute('aria-hidden', 'true');
                section.insertBefore(field, section.firstChild);
            }
        });
    }

    function visibleSections() {
        var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        var cover = document.querySelector('.cover');
        if (cover && !cover.classList.contains('slide-up')) return [cover];

        return Array.prototype.filter.call(document.querySelectorAll(SECTION_SELECTOR), function (section) {
            var rect = section.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < viewportWidth && rect.bottom > 0 && rect.top < viewportHeight;
        });
    }

    function activeCakeCount() {
        return document.querySelectorAll('.' + CAKE_CLASS).length;
    }

    function removeCake(cake) {
        if (cake && cake.parentNode) cake.remove();
    }

    function spawnCake() {
        if (document.visibilityState !== 'visible' || reducedMotion() || !introIsFinished()) return;
        if (activeCakeCount() >= MAX_CAKES) return;

        ensureFields();
        var sections = visibleSections();
        if (!sections.length) return;

        var section = sections[Math.floor(Math.random() * sections.length)];
        var field = section.querySelector(':scope > .' + CAKE_FIELD_CLASS);
        if (!field) return;

        var sectionRect = section.getBoundingClientRect();
        var fieldHeight = Math.max(0, field.getBoundingClientRect().height || sectionRect.height);
        var visibleTopInField = Math.max(0, -sectionRect.top);
        var size = Math.round(randomBetween(16, 24));
        var duration = randomBetween(9, 14);
        var cake = document.createElement('span');

        cake.className = CAKE_CLASS;
        cake.textContent = CAKES[Math.floor(Math.random() * CAKES.length)];
        cake.setAttribute('aria-hidden', 'true');
        cake.style.setProperty('--cake-size', size + 'px');
        cake.style.setProperty('--cake-opacity', randomBetween(0.15, 0.30).toFixed(2));
        cake.style.left = randomBetween(4, 96).toFixed(2) + '%';
        cake.style.setProperty('--cake-x', '-50%');
        cake.style.setProperty('--cake-y', visibleTopInField + 'px');
        cake.style.setProperty('--cake-distance', Math.max(300, Math.min(720, fieldHeight - visibleTopInField + 80)) + 'px');
        cake.style.setProperty('--cake-drift', randomBetween(-26, 26) + 'px');
        cake.style.setProperty('--cake-rotate', randomBetween(-10, 10) + 'deg');
        cake.style.setProperty('--cake-end-rotate', randomBetween(-20, 20) + 'deg');
        cake.style.setProperty('--cake-duration', duration.toFixed(2) + 's');

        field.appendChild(cake);
        cake.addEventListener('animationend', function (event) {
            if (event.animationName === 'background-cake-fall') removeCake(cake);
        }, { once: true });
        window.setTimeout(function () { removeCake(cake); }, duration * 1000 + FALLBACK_BUFFER);
    }

    function scheduleNext() {
        window.setTimeout(function () {
            spawnCake();
            scheduleNext();
        }, randomBetween(MIN_DELAY, MAX_DELAY));
    }

    function start() {
        ensureFields();
        scheduleNext();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
}());
