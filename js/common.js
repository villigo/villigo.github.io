"use strict";

$(document).ready(function() {

  /**
  * Слайдеры
  * Docs: https://kenwheeler.github.io/slick/
  */

  var $banner = $('.banner');

  $banner.on('init', function(event, slick) {
    $banner.find('.slick-current').addClass('animation-reset');
    setTimeout( function() {
      $banner.find('.slick-current').removeClass('animation-reset');
    }, 1);
  });

  $banner.slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    prevArrow: '<button class="banner__arrow slick-prev"></button>',
    nextArrow: '<button class="banner__arrow slick-next"></button>',
    dots: true,
    dotsClass: 'banner__dots',
    fade: true,
    speed: 1000,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: false,
    pauseOnFocus: false,
    centerMode: true,
    centerPadding: false,
  });

  $('.work-slider').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    prevArrow: '<button class="work-slider__arrow slick-prev"></button>',
    nextArrow: '<button class="work-slider__arrow slick-next"></button>',
  });

  $('.process-slider').slick({
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    appendArrows: $('.process__nav'),
    prevArrow: '<button class="process__arrow slick-prev"></button>',
    nextArrow: '<button class="process__arrow slick-next"></button>',
    responsive: [
        {
          breakpoint: 992,
          settings: {
            slidesToShow: 3,
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 2,
          }
        },
        {
          breakpoint: 481,
          settings: {
            variableWidth: true,
            arrows: false,
          }
        }
      ]
  });


  /**
  * Вкладки
  */

  $('.tabs-nav').each(function() {
    $(this).find('.tabs-nav__item').each(function(i) {
      $(this).click(function(){
        $(this).addClass('tabs-nav__item_active').siblings().removeClass('tabs-nav__item_active')
          .closest('.tabs').find('.tabs-content').removeClass('tabs-content_active').eq(i).addClass('tabs-content_active');
      });
    });
  });


  /**
  * Форма
  */

  $('.form__control').keyup(function() {
    var val = $(this).val();
    if (val.length) {
      $(this).addClass('form__control_active');
    } else {
      $(this).removeClass('form__control_active');
    }
  });


  /**
  * Анимация
  */

  var wow = new WOW(
    {
      boxClass:     'wow',      // animated element css class (default is wow)
      animateClass: 'animated', // animation css class (default is animated)
      offset:       0,          // distance to the element when triggering the animation (default is 0)
      mobile:       false,       // trigger animations on mobile devices (default is true)
      live:         true,       // act on asynchronously loaded content (default is true)
      callback:     function(box) {
        // the callback is fired every time an animation is started
        // the argument that is passed in is the DOM node being animated
      },
      scrollContainer: null,    // optional scroll container selector, otherwise use window,
      resetAnimation: true,     // reset animation on end (default is true)
    }
  );
  wow.init();


  /**
  * Меню на мобильных
  */

  $('.nav-toggle').click(function() {
    $('.header__nav').toggleClass('header__nav_open');
  });


  /**
  * Аккордион
  */

  $('.accordion__head').click(function() {
    $(this).parents('.accordion__item').toggleClass('accordion__item_open').find('.accordion__body').slideToggle('normal');
  });


  /**
  * FancyBox 3
  * Docs: http://fancyapps.com/fancybox/3/docs/
  */

  $("[data-fancybox]").fancybox({
    buttons : [
      'close',
    ],
    touch: {
      vertical: false,
      momentum: false,
    },
  });


  /**
  * Свернуть/развернуть текст истории
  */

  $('.history__more-link').click(function(e) {
    e.preventDefault();
    $('.history__hide').slideToggle(1000);
  });

  /**
  * Свернуть/развернуть Stay Alert
  */

  $('.protect__btn').click(function(e) {
    e.preventDefault();
    $('.stay-alert').slideToggle(1000);
  });


  /**
  * Поиск
  */

  $('.header__search-btn').click(function(e) {
    e.preventDefault();
    $('.search-form').fadeIn(300);
  });


  /**
  * Coming soon
  */

  $('.coming-soon').click(function(e) {
    e.preventDefault();
    $(".coming-soon__tooltip").remove();
    $(this).append('<div class="coming-soon__tooltip">Coming soon</div>');
  });

  $(document).click(function(event) {
    if ($(event.target).closest(".coming-soon").length) return;
    $(".coming-soon__tooltip").remove();

    if ($(event.target).closest(".header__search").length) return;
    $('.search-form').fadeOut(300);
    event.stopPropagation();
  });

});