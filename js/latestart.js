$(document).foundation();
var popup = new Foundation.Reveal($('#onboardingContainer'));
popup.open();
(function ($, window, undefined) {
  'use strict';
  console.debug("Adding Onboarding Conainer and waiting for user gesture.");
  $('#onboardingContainer').on('closed.zf.reveal', function () {
      console.debug("Gesture detected, now turning on player.");
      var modal = $(this);
      console.debug("Setup audio.");
      setup_audio();
      //document.getElementById('playButton').style.backgroundImage = "url('img/volume_up.svg')";
  });
  $(document).foundation();
})(jQuery, this);
