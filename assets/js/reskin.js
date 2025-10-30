jQuery(document).ready(function ($) {

    if (window.location.href.indexOf("favorites") > -1) {
        $(".header__utility-favorites").addClass('favorites--active');
    }

    /**
     * Off Canvas Nav - Toggles / Images
     */

    var navLink = $('.menu-item-has-children > a');
    $(navLink).click(function (e) {
        e.preventDefault();
    });

    var navItem = $('#menu-off-canvas > li');

    if (navItem.hasClass('current-menu-parent')) {
        $('.current-menu-parent').addClass('menu-item--active');
        $('.current-menu-parent .sub-menu').addClass('sub-menu--active');
    }

    navItem.click(function () {
        var imgUrl = $('img', this).attr('src');
        var titleAttr = $('a', this).attr('title');
        var imageTitle = $('.header__canvas-image-title');
        var imageDiv = $('.header__canvas-image');
        imageDiv.css("background-image", "url(" + imgUrl + ")");
        imageTitle.html(titleAttr);

        var menuItem = $('.menu-item');
        menuItem.removeClass('menu-item--active');
        $(this).addClass('menu-item--active');

        var activeSubMenu = $('.sub-menu', this);
        var subMenu = $('.sub-menu');
        activeSubMenu.addClass('sub-menu--active');
        if (subMenu.hasClass('sub-menu--active')) {
            subMenu.removeClass('sub-menu--active');
            activeSubMenu.addClass('sub-menu--active');
        }

    });

    /**
     * Toggles
     */
    $('.site-header__search-toggle').click(function () {
        $('.site-header__mobile-search').toggleClass('site-header__mobile-search--active');
    });

    $('#openSearch').click(function () {
        $('#modalSearch').addClass('site-search--open');
        $('body').addClass('site-search--modal');
        $('.header').removeClass('header--open');
        $('html, body').css({
            overflow: 'hidden',
            height: '100vh'
        });
    });

    $('#closeSearch .fa-times').click(function () {
        $('#modalSearch').removeClass('site-search--open');
        $('body').removeClass('site-search--modal');
        $('html, body').css({
            overflow: '',
            height: ''
        });
    });

    $('#openHamburger').click(function () {
        $('.header').addClass('header--open');
        $('#modalSearch').removeClass('site-search--open');
        $('body').removeClass('site-search--modal');
        $('html, body').css({
            overflow: 'hidden',
            height: '100vh'
        });
    });

    $('#closeHamburger').click(function () {
        $('.header').removeClass('header--open');
        $('html, body').css({
            overflow: '',
            height: ''
        });
    });

    /**
     * Sticky Nav
     */
    var header = document.getElementById('header');
    var sticky = header.offsetTop;

    window.onscroll = function () {
        stickyNav()
    };

    function stickyNav() {
        if (window.pageYOffset > sticky) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    }

    /**
     * Global events and variables should go here.
     */

    var ww = window.innerWidth;
    var scrollPos = window.scrollY;
    var body = document.querySelector('body')

    window.addEventListener('DOMContentLoaded', () => {

        // close overlays on 'esc' key
        window.addEventListener('keyup', evt => {
            if (evt.key.toLowerCase() !== 'escape') {
                return;
            }
            document.querySelector('#header').classList.remove('header--open', 'header--search');
            document.querySelector('.header__mobile-search').classList.remove('header__mobile-search--active');
            document.querySelector('.sub-menu').classList.remove('sub-menu--active');
        });

        // open external links in new tab, add rel=noopener for security
        var anchors = document.getElementsByTagName('a');
        for (var i = 0; i < anchors.length; i++) {
            if (anchors[i].hostname != window.location.hostname) {
                anchors[i].setAttribute('target', '_blank');
                anchors[i].setAttribute('rel', 'noopener');
            }
        }
    });

    /**
     * Search open/close and positioning of overlay menu relative to header.
     */
    function initSearchOverlay() {
        var trigger = document.querySelectorAll('.header__search-trigger');
        var search = document.querySelector('#searchOverlay');
        var header = document.querySelector('#siteHeader');
        var searchForm = document.querySelector('#searchForm input[type=text]');

        [].slice.call(trigger).forEach(el => {
            el.addEventListener('click', () => {
                search.style.top = Math.floor(header.getBoundingClientRect().height) + 'px';
                search.style.height = 'calc(100% - ' + Math.floor(header.getBoundingClientRect().height) + 'px)';
                header.classList.toggle('site-header--search');
                header.classList.remove('site-header--open');

                if (header.classList.contains('site-header--search')) {
                    searchForm.focus();
                    return
                }
                trigger.focus();
            });
        });
    }

});
