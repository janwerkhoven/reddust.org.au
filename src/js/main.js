isProduction = location.host === 'www.reddust.org.au' ? true : false;
environment = isProduction ? 'production' : 'staging';

// Google Analytics

/* jshint ignore:start */

(function(i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function() {
    (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date();
  a = s.createElement(o),
    m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

/* jshint ignore:end */

if (!!ga) {
  ga('create', 'UA-34474019-10', 'auto');
  ga('set', {
    dimension1: environment
  });
  ga('send', 'pageview');
}

// Animates open the modal
function openModal() {
  var speed = 700;
  var easing = 'easeOutExpo';
  var $overlay = $('#modals .overlay');
  var $modal = $('#modals .modal');
  if (!$modal.hasClass('velocity-animating')) {
    $('body').addClass('prevent-scroll'); // prevent users from scrolling the content behind the modal
    $('#modals').show();
    checkModalCentre();
    $overlay.velocity('stop').velocity({
      opacity: 1
    }, speed, easing);
    $modal.velocity('stop').velocity({
      translateY: ['0%', '10%'],
      scale: [1, 0.9]
    }, speed, easing);
  }
}

// Animates close the modal
function closeModal() {
  var speed = 400;
  var easing = 'easeOutExpo';
  var $overlay = $('#modals .overlay');
  var $modal = $('#modals .modal');
  if (!$modal.hasClass('velocity-animating')) {
    $overlay.velocity('stop').velocity({
      opacity: 0
    }, speed, easing);
    $modal.velocity('stop').velocity({
      translateY: '10%',
      scale: 0.9
    }, speed, easing, function() {
      $('#modals').hide();
      $('body').removeClass('prevent-scroll');
    });
  }
}

// Make sure the modal centres vertically, yet is scrollable if content is taller than the window
function checkModalCentre() {
  var $overlay = $('#modals .overlay');
  var $modal = $('#modals .modal');
  var windowHeight = $(window).height();
  var modalHeight = $modal.height() + 40;
  if (modalHeight >= windowHeight) {
    $overlay.removeClass('centre-content');
  } else {
    $overlay.addClass('centre-content');
  }
}

var animatingCounters = false;

// Check whether to animate the landing page counters or not
function checkWhetherToAnimateCounters() {
  // Only bind this this on logic on the landing page, avoid collisions on other pages
  var triggerTop = $('#landing .counter-wrapper').first().offset().top;
  var windowBottom = $(window).scrollTop() + $(window).height();
  // console.log(triggerTop, windowBottom);
  if (!animatingCounters) {
    if (windowBottom > triggerTop) {
      animatingCounters = true;
      animateCounters();
    }
  }
}

// Animate the counters on the landing page
function animateCounters() {
  $('#impact').find('.counter-wrapper').each(function() {
    var countUpToValue = $(this).find('h1').attr('value');
    $(this).find('h1').attr('id', countUpToValue);
    var options = {  
      useEasing: true,
        useGrouping: true,
        separator: ',',
        decimal: '.',
        prefix: '',
        suffix: ''
    };
    var demo = new CountUp(countUpToValue, 0, countUpToValue, 0, 5 * (countUpToValue / 1709), options);
    demo.start();
  });
}

$(document).ready(function() {

  // Open & close the mobile navigation
  var mobileNavActive = false;
  $('header nav button').on('click', function() {
    if (mobileNavActive) {
      $('body').removeClass('mobile-nav-active');
      mobileNavActive = false;
    } else {
      $('body').addClass('mobile-nav-active');
      mobileNavActive = true;
      $('html, body').animate({
        scrollTop: 0
      }, 200);
    }
  });

  // Things to fire ONLY on the landing page (avoid unexpected future collisions)
  if ($('body').attr('id') === 'landing') {

    // On load
    checkWhetherToAnimateCounters();
    // On scroll
    $(window).scroll(function() {
      checkWhetherToAnimateCounters();
    });

  }

  //Filter dropdown toggle
  $('#filter>div>div').on('click', function() {
    event.stopPropagation();
    $('#filter ul').toggleClass('active');
  });

  // Add click - off functionality to the dropdown
  $('body').on('click', function() {
    if ($('#filter ul').hasClass('active')) {
      $('#filter ul').toggleClass('active');
    };
  });

  //Display the active filter
  $('#filter ul button').on('click', function(event) {

    var filterName = $(this).attr('class');
    var $people = $('#people li');
    var $visibles = $('#people ul .' + filterName);
    var easing = 'easeOutExpo';
    var speed = 1000; // milliseconds

    // Set the button states text
    $('#selected-filter').text(filterName);
    $('#filter ul button').removeClass('selected');
    $('#filter ul .' + filterName).addClass('selected');

    // Hide all people
    $people.addClass('hidden');

    // Animate in the visible people
    $visibles.removeClass('hidden').css({
      opacity: 0
    }).each(function(i) {
      var delay = i * 80; // milliseconds
      $(this).delay(delay).velocity({
        scale: [1, .8],
        opacity: [1, 0],
      }, easing, speed);
    });

    // Prevent the parent dropdown from closing
    event.stopPropagation();
  });

  // Make any hashtag link scroll with animation to element with matching ID
  // Example: <a href="#features"> will scroll to element with ID #features
  // Commonly found in the #hero of each page
  $('a[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1000);
        return false;
      }
    }
  });

  // Animate the horizantal program sliders
  $('.program-slider nav img').on('click', function() {
    var $section = $(this).parents('section'); // reusable jQuery selector
    var $ul = $section.children('ul');
    var amountOfSlides = $section.children('ul').children('li').length; // count the amount of slides
    var currentSlide = $section.data('current') || 1; // if no data attribute is found on <section> then assume current slide is 1
    var increment = $(this).hasClass('next') ? 1 : -1;
    var newSlide = currentSlide + increment;
    var newLeft = -100 * (newSlide - 1) + '%';
    var isAnimating = $ul.hasClass('velocity-animating') ? true : false;
    if (newSlide < 1) {
      // if first slide, spring left and back
      if (!isAnimating) {
        $ul.velocity('stop')
          .velocity({
            translateX: '150px'
          }, 250, "easeOutQuad")
          .velocity({
            translateX: '0px'
          }, 250, "easeInSine");
      }
    } else if (newSlide > amountOfSlides) {
      // if last slide, spring right and back
      if (!isAnimating) {
        $ul.velocity('stop')
          .velocity({
            translateX: '-150px'
          }, 250, "easeOutQuad")
          .velocity({
            translateX: '0px'
          }, 250, "easeInSine");
      }
    } else {
      // if not first or last slide, slide to next or previous slide
      $section
        .data('current', newSlide)
        .find('ul').velocity('stop').velocity({
          left: -100 * (newSlide - 1) + '%'
        }, 800, 'easeOutExpo');
    }
  });

  // Clicking a person opens the modal
  $('.tiles.people li').on('click', function() {
    var $bio = $(this).find('.bio').clone();
    var $img = $(this).find('.img').clone();
    var $modal = $('#modals .modal');
    $('#modals .modal .content').html('').append($img).append($bio);
    openModal();
    if ($img.length) {
      $modal.addClass('has-image');
    } else {
      $modal.removeClass('has-image');
    }
  });

  // Clicking a partner opens the modal, only if screen width is below 720px
  $('.tiles.partners li').on('click', function() {
    console.log($(window).width());
    if ($(window).width() <= 720) {
      var $img = $(this).find('.front img').clone();
      var $h2 = $(this).find('.back h2').clone();
      var $p = $(this).find('.back p').clone();
      var $a = $(this).find('.back a').clone();
      var $modal = $('#modals .modal');
      $modal.find('.img').html('').append($img);
      $modal.find('.bio').html('').append($h2).append($p).append($a);
      openModal();
      if ($img.length) {
        $modal.addClass('has-image');
      } else {
        $modal.removeClass('has-image');
      }
    }
  });

  // Clicking the modal overlay or close button closes the modal
  $('#modals').find('.overlay, .modal>svg').on('click', function() {
    closeModal();
  });

  // Prevent the modal from closing when clicking inside the modal box
  $('#modals .modal').on('click', function(event) {
    event.stopPropagation();
  });

  // button closes the modal
  $('#modals').find('.overlay, .modal>svg').on('click', function() {
    closeModal();
  });

  // Prevent the modal from closing when clicking inside the modal box
  $('#modals .modal').on('click', function(event) {
    event.stopPropagation();
  });

  // If this page has modals, check the centre on each resize of screen
  if ($('#modals').length) {
    $(window).resize(function() {
      checkModalCentre();
    });
  }

});
