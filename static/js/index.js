// Light index.js for the DexSimBench project page.
window.HELP_IMPROVE_VIDEOJS = false;

$(document).ready(function () {
  // Navbar burger toggle (mobile menu)
  $(".navbar-burger").click(function () {
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
  });

  // Carousel init (used by any .carousel block)
  var options = {
    slidesToScroll: 1,
    slidesToShow: 2,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
  };
  if (window.bulmaCarousel) {
    bulmaCarousel.attach(".carousel", options);
  }
  if (window.bulmaSlider) {
    bulmaSlider.attach();
  }
});
