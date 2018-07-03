/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.6
 */
(function($) {
  var selectors = [];

  var check_binded = false;
  var check_lock = false;
  var defaults = {
    interval: 250,
    force_process: false
  };
  var $window = $(window);

  var $prior_appeared = [];

  function process() {
    check_lock = false;
    for (var index = 0, selectorsLength = selectors.length; index < selectorsLength; index++) {
      var $appeared = $(selectors[index]).filter(function() {
        return $(this).is(':appeared');
      });

      $appeared.trigger('appear', [$appeared]);

      if ($prior_appeared[index]) {
        var $disappeared = $prior_appeared[index].not($appeared);
        $disappeared.trigger('disappear', [$disappeared]);
      }
      $prior_appeared[index] = $appeared;
    }
  };

  function add_selector(selector) {
    selectors.push(selector);
    $prior_appeared.push();
  }

  // "appeared" custom filter
  $.expr[':']['appeared'] = function(element) {
    var $element = $(element);
    if (!$element.is(':visible')) {
      return false;
    }

    var window_left = $window.scrollLeft();
    var window_top = $window.scrollTop();
    var offset = $element.offset();
    var left = offset.left;
    var top = offset.top;

    if (top + $element.height() >= window_top &&
        top - ($element.data('appear-top-offset') || 0) <= window_top + $window.height() &&
        left + $element.width() >= window_left &&
        left - ($element.data('appear-left-offset') || 0) <= window_left + $window.width()) {
      return true;
    } else {
      return false;
    }
  };

  $.fn.extend({
    // watching for element's appearance in browser viewport
    appear: function(options) {
      var opts = $.extend({}, defaults, options || {});
      var selector = this.selector || this;
      if (!check_binded) {
        var on_check = function() {
          if (check_lock) {
            return;
          }
          check_lock = true;

          setTimeout(process, opts.interval);
        };

        $(window).scroll(on_check).resize(on_check);
        check_binded = true;
      }

      if (opts.force_process) {
        setTimeout(process, opts.interval);
      }
      add_selector(selector);
      return $(selector);
    }
  });

  $.extend({
    // force elements's appearance check
    force_appear: function() {
      if (check_binded) {
        process();
        return true;
      }
      return false;
    }
  });
})(function() {
  if (typeof module !== 'undefined') {
    // Node
    return require('jquery');
  } else {
    return jQuery;
  }
}());

// == START OF BRUT PRESENTATION JS ==
window.addEventListener('DOMContentLoaded', function (){
	'use strict';

	// START OF: is mobile =====
	function isMobile() {
		return (/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera);
	}
	// ===== END OF: is mobile


	// START OF: mark is mobile =====
	(function() {
		if(isMobile()){
			$('body').addClass('body--mobile');
		}else{
			$('body').addClass('body--desktop');
		}
	})();
	// ===== END OF: mark is mobile


	// START OF: loader =====
	var loader = (function(){
		var $introImagesSection = $('.js-intro-image-section');
		var $body = $('body');
		var $loader = $('.js-loader-section');
		var durations = {
			revealIntro: 1700, //taken from CSS
			showIntroSlider: 1000,
			showIntroSlides: 1000,
			introSlidesShift: 1500,
			percentFakeIncrementing: 1000
		};
		var $percent = $('.js-percent');
		var $finishingOverlay = $('.js-loader-finishing-overlay');

		var currentPercentIteration = 0;
		var incrementor = 1.5;
		var newPercent;

		$body.addClass('state-fixed-body');
		function revealIntro() {
			$body
				.addClass('state-reveal-intro');

			moveFinishingOverlay();

			//show slider children itself
			setTimeout(function(){
				$body
					.removeClass('state-fixed-body')
					.addClass('state-show-slider')
					.addClass('state-show-text')
					.addClass('state-show-corners')
					.addClass('state-intro-lines-started-moving');

				$loader.remove();
			}, durations.revealIntro);

			//show slider children
			setTimeout(function(){
				$body
					.addClass('state-slider-children-visible');
			}, durations.revealIntro + durations.showIntroSlider);

			//move slides
			setTimeout(function(){
				$body
					.removeClass('state-intro-slides-shift')
					.addClass('state-intro-slides-dots-visible');
			}, durations.revealIntro + durations.showIntroSlider + durations.showIntroSlides);
			//
			setTimeout(function(){
				$body
					.removeClass('state-intro-slides-transition');
				introSlider.init();
			}, durations.revealIntro + durations.showIntroSlider + durations.showIntroSlides + durations.introSlidesShift);
		}

		function incrementPercent(value) {
			$percent.html(value + '%');
		}

		function moveFinishingOverlay() {
			$finishingOverlay.css('transform', 'translateX(0%) translateZ(0)');
		}

		function incrementPercents() {
			currentPercentIteration++;
			newPercent = Math.floor(incrementor * currentPercentIteration);
			if(newPercent >= 98){
				newPercent = 98;
			}
			incrementPercent(newPercent);
		}

		function init(){
			setInterval(function () {
				incrementPercents();
			}, 35);

			$introImagesSection.imagesLoaded({ background: false })
				//reveal the into once all the images loaded
				.always( function( instance ) {
					setTimeout(function(){
						revealIntro();
					}, durations.percentFakeIncrementing);
				})
				.done( function( instance ) {
					console.log('All images successfully loaded.');
				})
				.fail( function() {
					console.log('Images loaded, at least one is broken.');
				})
				.progress( function( instance, image ) {
				});
		}
		return {
			revealIntro: revealIntro,
			init: init
		}
	}());
	
	loader.init();
	// ===== END OF: loader


	// START OF: intro screen slider =====
	var introSlider = (function(){
		var DOM = {
			item: $('.js-main-slider-item'),
			caseTitle: $('.js-case-title'),
			dot: $('.js-slider-dot')
		};
		var stateClassnames = {
			activeSlide: 'state-active-slide',
			leavingSlide: 'state-leaving-slide',
			activeTitle: 'state-visible',
			activeDot: 'state-active'
		};
		var attributes = {
			index: 'data-slide-index'
		};
		var state = {
			slidesCount: DOM.item.length
		};
		var durations = {
			slideChange: 5000,
			slideLeaving: 800
		};

		function changeTitle(nextIndex) {
			DOM.caseTitle.removeClass(stateClassnames.activeTitle);
			$('.js-case-title[' + attributes.index + '="' + nextIndex + '"]').addClass(stateClassnames.activeTitle);
		}

		function changeDot(nextIndex) {
			DOM.dot.removeClass(stateClassnames.activeDot);
			$('.js-slider-dot[' + attributes.index + '="' + nextIndex + '"]').addClass(stateClassnames.activeDot);
		}

		function changeSlide($previous, $next) {
			if($previous !== undefined && $next !== undefined){
				var $current = $previous;
				var $coming = $next;
			}else{
				var $current = $('.' + stateClassnames.activeSlide);
				var $coming = $current.next('.js-main-slider-item');

				if($coming.length === 0){
					$coming = DOM.item.eq(0);
				}
			}

			$current
				.addClass(stateClassnames.leavingSlide)
				.removeClass(stateClassnames.activeSlide);

			setTimeout(function(){
				$current.removeClass(stateClassnames.leavingSlide)
			}, durations.slideLeaving);

			$coming
				.addClass(stateClassnames.activeSlide)
				.removeClass(stateClassnames.leavingSlide);

			var nextIndex = $coming.attr(attributes.index);

			changeTitle(nextIndex);
			changeDot(nextIndex);
		}

		function bindDots() {
			DOM.dot.on('click', function(event) {
				event.preventDefault();

				var index = $(this).attr(attributes.index);
				var $previous = $('.' + stateClassnames.activeSlide);
				var $next = $('.js-main-slider-item[' + attributes.index + '=' + index + ']');

				changeSlide($previous, $next);
			});
		}

		var autoslideTimer;
		var startAutoplay = function () {
			autoslideTimer = setInterval(function () {
				changeSlide();
			}, durations.slideChange);
		};
		var stopAutoplay = function () {
			clearInterval(autoslideTimer);
		};
		var bindAutoplay = function () {
			startAutoplay();
		};

		var init = function () {
			changeSlide();
			bindAutoplay();
			bindDots();
		};
		return {
			startAutoplay: startAutoplay,
			stopAutoplay: stopAutoplay,
			init: init
		}
	}());
	//the introSlider is initiated after loader animation ends
	// ===== END OF: intro screen slider


	// START OF: on scroll section =====
	var onScroll = (function(){
		var bind = function() {
			var scrollr = skrollr.init({
				'smoothScrolling': true,
				'smoothScrollingDuration': 2000,
				'easing': 'linear',
				'forceHeight': false
			});
		};
		return {
			bind: bind
		}
	}());
	if(!isMobile()){
		//Skrollr imitates scroll on mobile devices and it performs awfully. That is why we turned off the skrollr plugin on mobiles and created another set of animations: special for mobile devices.
		window.onload = function() {
			onScroll.bind();
		};
	}
// ===== END OF: on scroll section


	// START OF: subscribe form =====
	var subscribeForm = (function(){
		var DOM = {
			$form: $('.js-subscribe-form')
		};
		var bind = function () {
			DOM.$form.on('submit', function(event) {
				event.preventDefault();

				register($(this));
			});
		};
		function register($form) {
			var $submitButton = $form.find($('.js-submit-button'));
			var submitButtonValue = $form.find($('.js-submit-button')).val();
			$submitButton.val(submitButtonValue + '...');

			var $successMessage = $form.find('.js-success-message');
			var $errorMessage = $form.find('.js-error-message');

			var toggleDuration = 200; //ms

			$.ajax({
				type: $form.attr('method'),
				url: $form.attr('action'),
				data: $form.serialize(),
				cache: false,
				dataType: 'json',
				contentType: "application/json; charset=utf-8"
			})
				.done(function(data) {
					function trimCode(string) {
						//cut off the mailchimp meta data code user doesn't need to see
						if(string.indexOf('0 -') === 0){
							return string.slice(4);
						}else{
							return string;
						}
					}
					if (data.result != "success") {
						console.log('err');
						$errorMessage.slideUp(toggleDuration);
						$successMessage.slideUp(toggleDuration);

						setTimeout(function(){
							$errorMessage.html(trimCode(data.msg));
							$errorMessage.slideDown(toggleDuration);
						}, toggleDuration);
					} else {
						$errorMessage.slideUp(toggleDuration, function () {
							$successMessage.slideDown(toggleDuration);
						})
					}
				})
				.fail(function(response) {
					$errorMessage.slideUp(toggleDuration);
					$successMessage.slideUp(toggleDuration, function () {
						$errorMessage.slideDown(toggleDuration, function () {
							$errorMessage.html('Could not connect to the registration server. Please try again later.');
						});
					})
				})
				.always(function(response) {
					console.log(response);
					$submitButton.val(submitButtonValue);
				});
		}

		return{
			bind: bind
		}
	}());
	subscribeForm.bind();
	// ===== END OF: subscribe form


	// START OF: scroll intro section button =====
	var scrollIntroSectionDown = (function(){
		var introSectionHeight = $('.js-intro-section').outerHeight();
		var headerHeight = $('.js-header').outerHeight();

		function init(){
			$(document).on('click', '.js-scroll-intro-section-down', function(event) {
				event.preventDefault();
				$('html,body').animate({scrollTop: introSectionHeight - headerHeight}, 800);
			});
		}
		return {
			init: init
		}
	}());

	scrollIntroSectionDown.init();
	// ===== END OF: scroll intro section button


	// START OF: scroll to buy section button =====
	var scrollToBuySection = (function(){
		var $buySection = $('#purchase');
		var scrollValue = $buySection.offset().top;

		function goToBuySection() {
			$('html,body').animate({scrollTop: scrollValue - 100}, 800);
		}

		function init(){
			$(document).on('click', '[href="#purchase"]', function(event) {
				event.preventDefault();
				goToBuySection();
			});
		}
		return {
			goToBuySection: goToBuySection,
			init: init
		}
	}());

	scrollToBuySection.init();
	// ===== END OF: scroll to buy section button


	// START OF: testimonials slider =====
	var testimonialsSlider = (function(){
		var stateClassnames = {
			active: {
				header: 'state-active',
				number: 'state-visible',
				testimonialItem: 'state-active'
			},
			nextTestimonial: 'state-next',
			prevTestimonial: 'state-previous',
			disabledArrow: 'state-disabled',
			hideNext: 'state-hide-next-item'
		};

		var durations = {
			slideChange: 1000
		};

		var $testimonialItems = $('.js-testimonials-slider-item');
		var $testimonialNumbers = $('.js-testimonials-number');
		var $testimonialHeaders = $('.js-testimonials-header');
		var itemsCount = $testimonialItems.length; //actually the amount of testimonials/headers/decorative numbers

		var currentIndex = 1;
		var nextIndex;
		var prevIndex;
		var $currentActiveNumber;
		var $currentActiveHeader;

		function changeTestimonialItem() {
			$testimonialItems
				.removeClass(stateClassnames.prevTestimonial)
				.removeClass(stateClassnames.nextTestimonial)
				.removeClass(stateClassnames.active.testimonialItem);

			//set active
			$testimonialItems.filter('[data-index=' + currentIndex + ']').addClass(stateClassnames.active.testimonialItem);

			//set next
			$testimonialItems.filter('[data-index=' + nextIndex + ']').addClass(stateClassnames.nextTestimonial);

			//set previous
			$testimonialItems.filter('[data-index=' + prevIndex + ']').addClass(stateClassnames.prevTestimonial);
		}

		function changeHeader() {
			$currentActiveHeader = $testimonialHeaders.filter('.' + stateClassnames.active.header);
			$currentActiveHeader.removeClass(stateClassnames.active.header);

			$testimonialHeaders.filter('[data-index=' + currentIndex + ']').addClass(stateClassnames.active.header);
		}
		function changeNumber() {
			$currentActiveNumber = $testimonialNumbers.filter('.' + stateClassnames.active.number);
			$currentActiveNumber.removeClass(stateClassnames.active.number);

			$testimonialNumbers.filter('[data-index=' + currentIndex + ']').addClass(stateClassnames.active.number);
		}

		function changeSlide() {
			changeTestimonialItem();
			changeHeader();
			changeNumber();
		}

		function nextTestimonial() {
			if(currentIndex === itemsCount){
				currentIndex = 1;
				nextIndex = currentIndex + 1;
				prevIndex = itemsCount;
			}else{
				currentIndex++;
				if(currentIndex === itemsCount){
					nextIndex = 1;
				}else{
					nextIndex = currentIndex + 1;
				}
				prevIndex = currentIndex - 1;
			}
			changeSlide();
		}

		function prevTestimonial() {
			if(currentIndex === 1){
				currentIndex = itemsCount;
				nextIndex = 1;
				prevIndex = currentIndex - 1;
			}else{
				currentIndex--;
				if(currentIndex === 1){
					prevIndex = itemsCount;
				}else{
					prevIndex = currentIndex - 1;
				}
				nextIndex = currentIndex + 1;
			}
			changeSlide();
		}

		function bind() {
			var $nextArrow = $('.js-next-testimonial');
			var $prevArrow = $('.js-prev-testimonial');
			var $wrapper = $('.js-testimonials-wrapper');

			function pauseArrows() {
				$nextArrow.addClass(stateClassnames.disabledArrow);
				$prevArrow.addClass(stateClassnames.disabledArrow);
				setTimeout(function(){
					$nextArrow.removeClass(stateClassnames.disabledArrow);
					$prevArrow.removeClass(stateClassnames.disabledArrow);
				}, durations.slideChange);
			}

			$(document).on('click', '.js-next-testimonial', function(event) {
				//When clicking 'next' next slide must be hidden.
				$wrapper.addClass(stateClassnames.hideNext);

				event.preventDefault();
				if($nextArrow.hasClass(stateClassnames.disabledArrow)){
					return false;
				}else{
					nextTestimonial();
					pauseArrows();
				}
			});

			$(document).on('click', '.js-prev-testimonial', function(event) {
				//When clicking 'next' next slide must be hidden.
				$wrapper.removeClass(stateClassnames.hideNext);

				event.preventDefault();
				if($prevArrow.hasClass(stateClassnames.disabledArrow)){
					return false;
				}else{
					prevTestimonial();
					pauseArrows();
				}
			});
		}

		function init(){
			bind();
		}
		return {
			init: init
		}
	}());

	testimonialsSlider.init();
	// ===== END OF: testimonials slider


	// START OF: scrollTop hide on scroll =====
	var scrollTop = (function(){
		function init(){
			$(window).scroll(function(e){
				var $body = $('body');
				var atTopClassname = 'state-at-top-position';

				if ($(this).scrollTop() > 50){
					$body.removeClass(atTopClassname);
				}
				if ($(this).scrollTop() <= 50)
				{
					$body.addClass(atTopClassname);
				}
			});
		}
		return {
			init: init
		}
	}());

	scrollTop.init();
	// ===== END OF: scrollTop hide on scroll


	// START OF: purchase features hover effect =====
	var purchaseFeatures = (function(){
		var $features = $('.js-inner-feature');

		function bind() {
			$(document).on('click', '.js-hide-feature', function(event) {
				// event.preventDefault();
				console.log($(event.target));
				if(!$(event.target).hasClass('js-show-feature')){
					$features.removeClass('state-opened');
				}
			});
			$(document).on('click', '.js-show-feature', function(event) {
				event.preventDefault();
				event.stopPropagation();

				$features.removeClass('state-opened');
				$(this).siblings('.js-inner-feature').addClass('state-opened');
			});

		}

		function init(){
			bind();
		}
		return {
			init: init
		}
	}());

	purchaseFeatures.init();
	// ===== END OF: purchase features hover effect


	// START OF: content appearing =====
	var contentAppearing = (function(){
		var bind = function () {
			var $content= $('.js-appearing-content');
			$content.appear();

			var setOffset = function () {
				var coefficient = -0.7; //manual
				var offsetValue = $content.eq(0).innerHeight();

				$content.attr('data-appear-top-offset', offsetValue * coefficient);
			};
			setOffset();

			$(document.body)
				.on('appear', '.js-appearing-content', function(e, $affected) {
					// this code is executed for each appeared element
					$(this).addClass('skrollable-between');
				})
				.on('disappear', '.js-appearing-content', function(e, $affected) {
					// this code is executed for each appeared element
					$(this).removeClass('skrollable-between');
				});
		};
		return {
			bind: bind
		}
	}());

	contentAppearing.bind();
	// ===== END OF: content appearing


	// START OF: show footer input =====
	var showFooterInput = (function(){
		function init(){
			var $input = $('.js-input-to-show');

			$(document).on('click', '.js-show-footer-input', function(event) {
				event.preventDefault();

				$("html, body").animate({ scrollTop: $(document).height() }, 700);

				$input.addClass('state-blinking');

				setTimeout(function(){
					$input.removeClass('state-blinking');
				}, 2250);
			});

			$(document).on('focus', '.js-input-to-show', function(event) {
				event.preventDefault();
				$input.removeClass('state-blinking');
			});
		}
		return {
			init: init
		}
	}());

	showFooterInput.init();
	// ===== END OF: show footer input


	// START OF: del =====
	var goToPurchase = (function(){
		function init(){
			var $body = $('body');
			var $loader = $('.js-loader-section');
			var hash = window.location.hash;

			if(hash === "#purchase"){
				loader.revealIntro();
				$loader.remove();
				window.location='#purchase';
			}
		}
		return {
			init: init
		}
	}());

	goToPurchase.init();
	// ===== END OF: del

});
// == END OF BRUT PRESENTATION JS ==