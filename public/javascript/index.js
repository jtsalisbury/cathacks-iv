$(document).ready(function() {
  $('#accordion a').click(function(e) {
    $(e.target).next('div').siblings('div').slideUp();
    $(e.target).next('div').slideToggle();
  });

  console.log('Loaded!');
});
