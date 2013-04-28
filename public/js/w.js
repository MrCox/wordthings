var input = d3.select('#solver'),
  graph = d3.select('#graph'),
  oldWords = {},
  checker = [];

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

function group(d){
  if (checker.indexOf(d) == -1) {
    checker.push(d)
    graph.append('div')
      .attr('id', 'l' + d)
      .attr('class', 'cols')
      .style('margin-left', function() { return d * 1.8 + 'px'})
      .style('margin-right', function() { return d * 1.8 + 'px'})
      .append('div')
      .append('b').text(function() { return Number(d) - 5})
  }
  return d;
}

function add(p,v) {
  graph.select('#l' + v.length).select('div')
   .append('p')
   .datum(v)
   .attr('class', 'words')
   .text(function(d) { return d.slice(0, d.length - 5)});
}
function r() {}

function wordgen(dict, rack) {
  graph.selectAll('.cols').remove();
  checker = [];
  var l = rack.length
  function reduceAdd(p, v) {
    var r = rack.split(''), w = v.slice(0, v.length - 5).split('')
    k = 0;
    while (w.length > 0) {
      if ( r.indexOf(w[0]) != -1 ) {
        var i = r.indexOf( w.shift() );
        r.splice( i, 1 );
      }
      else {break}
    if ( w.length == 0 ) { 
      add(p, v);
    }}
  }
  return dict.dimension(function(d) { return d.length }).group(group).reduce(reduceAdd, r, r).all();
}

function words(set) {
  graph.selectAll('.cols').remove();
  checker = [];
  set = crossfilter(set).dimension(function(d) { return d.length }).group(group).reduce(add, r, r).all()
}

input.on('change', function() {
  d3.select('#message').html('')
  var v = '/words?rack=' + this.value,
    va = this.value;
  if (va.length > 44) {
    var h = d3.select('#message')
    .html(function() {return "<p class = 'message'>Whoa, <i>woa</i>! Are you trying to <i>kill</i> me?! You're at a " + va.length + " right now. How about toning it down to 45, champ?</p>"})
  return;
  }
  for (var k in oldWords) {
    if (anaCheck(k, va)) {
      wordgen(crossfilter(oldWords[k]), va);
      graph.selectAll('.cols').each(function(d) { 
        if (d3.select(this).selectAll('.words').empty()){
          d3.select(this).remove();
        }
      })
      return;
    }
  }
  d3.json(v, function(e, j) {
    if (e) console.log(e);
    words(j)
    oldWords[va] = j;
  })
})

