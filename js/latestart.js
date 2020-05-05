$(document).foundation();
var popup = new Foundation.Reveal($('#onboardingContainer'));
popup.open();
(function ($, window, undefined) {
  'use strict';
  $('#onboardingContainer').on('closed.zf.reveal', function () {
    var modal = $(this);
    audioStream.play();
    isPlaying = true;
    document.getElementById('playButton').style.backgroundImage = "url('img/volume_up.svg')";
  });
  $(document).foundation();
})(jQuery, this);
