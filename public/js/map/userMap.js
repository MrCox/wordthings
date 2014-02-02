define(['map', 'controlPanel'], function(map, controlPanel) {
  window.onresize = function() {
    d3.sa('#canvas, #milkyWay').width(window.innerWidth)
      .height(window.innerHeight);
  };
  window.onresize();

});
