const isProduction = location.host === "reddust.org.au" ? true : false;
const environment = isProduction ? "production" : "development";

// Google Analytics

(function(i, s, o, g, r, a, m) {
  i["GoogleAnalyticsObject"] = r;
  (i[r] =
    i[r] ||
    function() {
      (i[r].q = i[r].q || []).push(arguments);
    }),
    (i[r].l = 1 * new Date());
  (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
})(
  window,
  document,
  "script",
  "https://www.google-analytics.com/analytics.js",
  "ga"
);

if (ga) {
  ga("create", "UA-34474019-10", "auto");
  ga("set", {
    dimension1: environment
  });
  ga("send", "pageview");
}

// Animates open the modal
function openModal() {
  const speed = 700;
  const easing = "easeOutExpo";
  const $overlay = $("#modals .overlay");
  const $modal = $("#modals .modal");
  if (!$modal.hasClass("velocity-animating")) {
    $("body").addClass("prevent-scroll"); // prevent users from scrolling the content behind the modal
    $("#modals").show();
    checkModalCentre();
    $overlay.velocity("stop").velocity(
      {
        opacity: 1
      },
      speed,
      easing
    );
    $modal.velocity("stop").velocity(
      {
        translateY: ["0%", "10%"],
        scale: [1, 0.9]
      },
      speed,
      easing
    );
  }
}

// Animates close the modal
function closeModal() {
  const speed = 400;
  const easing = "easeOutExpo";
  const $overlay = $("#modals .overlay");
  const $modal = $("#modals .modal");
  if (!$modal.hasClass("velocity-animating")) {
    $overlay.velocity("stop").velocity(
      {
        opacity: 0
      },
      speed,
      easing
    );
    $modal.velocity("stop").velocity(
      {
        translateY: "10%",
        scale: 0.9
      },
      speed,
      easing,
      function() {
        $("#modals").hide();
        $("body").removeClass("prevent-scroll");
      }
    );
  }
}

// Make sure the modal centres vertically, yet is scrollable if content is taller than the window
function checkModalCentre() {
  const $overlay = $("#modals .overlay");
  const $modal = $("#modals .modal");
  const windowHeight = $(window).height();
  const modalHeight = $modal.height() + 40;
  if (modalHeight >= windowHeight) {
    $overlay.removeClass("centre-content");
  } else {
    $overlay.addClass("centre-content");
  }
}

let animatingCounters = false;

// Check whether to animate the landing page counters or not
function checkWhetherToAnimateCounters() {
  // Only bind this this on logic on the landing page, avoid collisions on other pages
  const triggerTop = $("#landing .counter-wrapper")
    .first()
    .offset().top;
  const windowBottom = $(window).scrollTop() + $(window).height();
  if (!animatingCounters) {
    if (windowBottom > triggerTop) {
      animatingCounters = true;
      animateCounters();
    }
  }
}

// Animate the counters on the landing page
function animateCounters() {
  $("#impact")
    .find(".counter-wrapper")
    .each(function() {
      const countUpToValue = $(this)
        .find("h1")
        .attr("value");
      $(this)
        .find("h1")
        .attr("id", countUpToValue);
      const options = {
        useEasing: true,
        useGrouping: true,
        separator: ",",
        decimal: ".",
        prefix: "",
        suffix: ""
      };
      const demo = new CountUp(
        countUpToValue,
        0,
        countUpToValue,
        0,
        5 * (countUpToValue / 1709),
        options
      );
      demo.start();
    });
}

$(document).ready(function() {
  const bodyId = $("body").attr("id");

  // Open & close the mobile navigation
  let mobileNavActive = false;
  $("header nav button").on("click", function() {
    if (mobileNavActive) {
      $("body").removeClass("mobile-nav-active");
      mobileNavActive = false;
    } else {
      $("body").addClass("mobile-nav-active");
      mobileNavActive = true;
      $("html, body").animate(
        {
          scrollTop: 0
        },
        200
      );
    }
  });

  // Things to fire ONLY on the landing page (avoid unexpected future collisions)
  if (bodyId === "landing") {
    // On load
    checkWhetherToAnimateCounters();
    // On scroll
    $(window).scroll(function() {
      checkWhetherToAnimateCounters();
    });
  }

  // 1. Create an array populated with people filtered first by category then by name
  if (bodyId === "about-people") {
    const people = [];
    const categories = [
      "founder",
      "patron",
      "board-chairman",
      "board-member",
      "ambassador",
      "staff-ceo",
      "staff-member",
      "role-model"
    ];

    // Do this for each category
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const peopleInCategory = [];
      const $peopleInCategory = $("#people li." + category);

      // 1. Find all people of this category, then populate a temporary array
      $peopleInCategory.each(function() {
        const name = $(this)
          .find("h2")
          .text();
        const role = $(this)
          .find("h3")
          .text();
        peopleInCategory.push({ name, role, category });
      });

      // 2. Sort each individual alphabetically by their name
      // const sortedPeopleInCategory = peopleInCategory.sort(function(a, b) {
      //   if (a.name < b.name) return -1;
      //   if (a.name > b.name) return 1;
      //   return 0;
      // });

      // 3. Add the property `order` to each person, which will be used for flexbox ordering
      for (let ii = 0; ii < peopleInCategory.length; ii++) {
        const person = peopleInCategory[ii];
        person.order = people.length;
        people.push(person);
      }
    }

    // Iterate over all people in the array an apply the flexbox order to each person in the DOM
    for (let i = 0; i < people.length; i++) {
      const person = people[i];
      $('#people li[data-name="' + person.name + '"]').css({
        order: person.order
      });
    }

    filterPeople();
  }

  // Bind click to dropdown on people page
  // Filters the people list on click of dropdown item
  $("#about-people #filter ul button").on("click", function() {
    $("#selected-filter").text($(this).text());
    $(this)
      .addClass("selected")
      .siblings()
      .removeClass("selected");
    const category = $(this).data("category");
    filterPeople(category);
  });

  // Close the dropdown if clicked outside
  $("#about-people").on("click", function() {
    $("#filter ul").removeClass("active");
  });

  // Prevent bubbling when clicking within the dropdown
  $("#filter>div>div").on("click", function(event) {
    event.stopPropagation();
    $("#filter ul").toggleClass("active");
  });

  // Filter the list of people
  function filterPeople(category) {
    let selection = $("#people li"); // If no category is given select all people to be shown

    // If a category is given, use it to select that group of people
    // Filters can contain multiple categories divided by spaces
    if (category) {
      const categories = category.split(" ");
      const selectors = [];
      for (let i = 0; i < categories.length; i++) {
        selectors.push("#people li." + categories[i]);
      }
      selection = $(selectors.join(", "));
    }

    // Sort that selection by their flexbox order
    let count = 0;
    const sorted = selection.sort(function(a, b) {
      a = parseInt($(a).css("order"), 10);
      b = parseInt($(b).css("order"), 10);
      count += 2;
      return a > b ? 1 : a < b ? -1 : 0;
    });

    // Hide all people and stop all animations
    $("#people li")
      .hide()
      .stop()
      .velocity("stop");

    // Animate in the selected group of people
    sorted
      .css({
        opacity: 0
      })
      .show()
      .each(function(i) {
        const delay = i * 80; // We apply a progressive delay for sequence effect
        $(this)
          .delay(delay)
          .velocity(
            {
              scale: [1, 0.8],
              opacity: [1, 0]
            },
            "easeOutExpo",
            1000
          );
      });
  }

  // Make any hashtag link scroll with animation to element with matching ID
  // Example: <a href="#features"> will scroll to element with ID #features
  // Commonly found in the #hero of each page
  $('a[href*="#"]:not([href="#"])').click(function() {
    if (
      location.pathname.replace(/^\//, "") ==
        this.pathname.replace(/^\//, "") &&
      location.hostname == this.hostname
    ) {
      let target = $(this.hash);
      target = target.length ? target : $("[name=" + this.hash.slice(1) + "]");
      if (target.length) {
        $("html, body").animate(
          {
            scrollTop: target.offset().top
          },
          1000
        );
        return false;
      }
    }
  });

  // Animate the horizantal program sliders
  $(".program-slider nav img").on("click", function() {
    const $section = $(this).parents("section"); // reusable jQuery selector
    const $ul = $section.children("ul");
    const amountOfSlides = $section.children("ul").children("li").length; // count the amount of slides
    const currentSlide = $section.data("current") || 1; // if no data attribute is found on <section> then assume current slide is 1
    const increment = $(this).hasClass("next") ? 1 : -1;
    const newSlide = currentSlide + increment;
    // const newLeft = -100 * (newSlide - 1) + "%";
    const isAnimating = $ul.hasClass("velocity-animating") ? true : false;
    if (newSlide < 1) {
      // if first slide, spring left and back
      if (!isAnimating) {
        $ul
          .velocity("stop")
          .velocity(
            {
              translateX: "150px"
            },
            250,
            "easeOutQuad"
          )
          .velocity(
            {
              translateX: "0px"
            },
            250,
            "easeInSine"
          );
      }
    } else if (newSlide > amountOfSlides) {
      // if last slide, spring right and back
      if (!isAnimating) {
        $ul
          .velocity("stop")
          .velocity(
            {
              translateX: "-150px"
            },
            250,
            "easeOutQuad"
          )
          .velocity(
            {
              translateX: "0px"
            },
            250,
            "easeInSine"
          );
      }
    } else {
      // if not first or last slide, slide to next or previous slide
      $section
        .data("current", newSlide)
        .find("ul")
        .velocity("stop")
        .velocity(
          {
            left: -100 * (newSlide - 1) + "%"
          },
          800,
          "easeOutExpo"
        );
    }
  });

  // Clicking a person opens the modal
  $(".tiles.people li").on("click", function() {
    const $bio = $(this)
      .find(".bio")
      .clone();
    const $img = $(this)
      .find(".img")
      .clone();
    const $modal = $("#modals .modal");
    $("#modals .modal .content")
      .html("")
      .append($img)
      .append($bio);
    openModal();
    if ($img.length) {
      $modal.addClass("has-image");
    } else {
      $modal.removeClass("has-image");
    }
  });

  // Clicking a partner opens the modal, only if screen width is below 720px
  $(".tiles.partners li").on("click", function() {
    if ($(window).width() <= 720) {
      const $img = $(this)
        .find(".front img")
        .clone();
      const $h2 = $(this)
        .find(".back h2")
        .clone();
      const $p = $(this)
        .find(".back p")
        .clone();
      const $a = $(this)
        .find(".back a")
        .clone();
      const $modal = $("#modals .modal");
      $modal
        .find(".img")
        .html("")
        .append($img);
      $modal
        .find(".bio")
        .html("")
        .append($h2)
        .append($p)
        .append($a);
      openModal();
      if ($img.length) {
        $modal.addClass("has-image");
      } else {
        $modal.removeClass("has-image");
      }
    }
  });

  // Clicking the button on test page, opens the modal and shows donation form
  $("#test #lightbox a.button").on("click", function(event) {
    event.preventDefault();
    console.log("FIRE");
    const form =
      '<div style="padding:1px;max-width: 700px"><iframe class="gn-iframe" src="https://www.givenow.com.au/embed/Y2F1c2VpZD0zODA2JmRvbWFpbj13d3cucmVkZHVzdC5vcmcuYXUmdG9rZW49MzgwNjo2NjhhOGI4ODNjMzY1YjFk" height="870" style="width: 100%" frameborder="0"></iframe></div>';
    $("#modals .modal .content")
      .html("")
      .append(form);
    openModal();
  });

  // Clicking the modal overlay or close button closes the modal
  $("#modals")
    .find(".overlay, .modal>svg")
    .on("click", function() {
      closeModal();
    });

  // Prevent the modal from closing when clicking inside the modal box
  $("#modals .modal").on("click", function(event) {
    event.stopPropagation();
  });

  // button closes the modal
  $("#modals")
    .find(".overlay, .modal>svg")
    .on("click", function() {
      closeModal();
    });

  // Prevent the modal from closing when clicking inside the modal box
  $("#modals .modal").on("click", function(event) {
    event.stopPropagation();
  });

  // If this page has modals, check the centre on each resize of screen
  if ($("#modals").length) {
    $(window).resize(function() {
      checkModalCentre();
    });
  }
});
