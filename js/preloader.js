$(document).ready(function() {
  setTimeout( function() {
    var preloader = document.getElementById('loader');
    if( !preloader.classList.contains('done'))
    {
      preloader.classList.add('done');
    }
  }, 1000);
  initApp();
});
