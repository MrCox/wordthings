var input = d3.select('#solver')
  .style('border', '1px solid LightBlue');

var graph = d3.select('#graph').style('text-align', 'center');

var oldWords = {}

function anaCheck(w1, w2) {
  var w = w1.split(''), r = w2.split('')
  while (r.length > 0) {
    if (w.indexOf(r[0]) != -1) {
      var i = w.indexOf(r.shift());
      w.splice(i, 1);
    } else {break}
  }
  return r.length == 0
}
var width;
input.on('change', function() {
  var v = '/words?rack=' + this.value,
    va = this.value;
  for (var k in oldWords) {
    if (anaCheck(k, va)) {
      words(wordgen(crossfilter(oldWords[k]).groupAll(), va));
      return;
    }
  }
  d3.json(v, function(e, j) {
    if (e) console.log(e);
    words(j)
    oldWords[va] = j;
  })
})
function add(p,v) {
  graph.select('#l' + v.length).select('div')
   .append('p')
   .datum(v)
   .attr('class', 'words')
   .text(function(d) { return d.slice(0, d.length - 5)});
}
function r() {}
var checker = []
function words(set) {
  graph.selectAll('.cols').remove();
  checker = [];
  set = crossfilter(set)
    .dimension(function(d) { return d.length })
    .group( function(d) { 
      if (checker.indexOf(d) == -1) {
        checker.push(d)
        graph.append('div')
          .attr('id', 'l' + d)
          .attr('class', 'cols')
          .style('float', 'left')
          .style('margin-left', function() { return d * 1.8 + 'px'})
          .style('margin-right', function() { return d * 1.8 + 'px'})
          .append('div')
          .attr('style', 'margin-bottom: 10px; text-align: center;')
          .append('p').text(function() { return Number(d) - 5})
      }
      return d;
    }).reduce(add, r, r).all()
}
