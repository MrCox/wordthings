var input = d3.select('#solver'),
  graph = d3.select('#graph'),
  oldWords = {},
  checker = [];
  sum = 0;

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
    sum += d;
    graph.append('div')
      .datum(d)
      .attr('id', 'l' + d)
      .attr('class', 'cols')
      .append('div')
      .append('b').text(function() { return Number(d) - 5})
  }
  return d;
}

function add(p,v) {
  graph.select('#l' + v.length).select('div')
   .datum(v)
   .append('p')
   .attr('class', 'words')
   .text(function(d) { return d.slice(0, d.length - 5)});
}
function r() {}

function wordgen(dict, rack) {
  graph.selectAll('.cols').remove();
  checker = [];
  sum = 0;
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
  sum = 0;
  set = crossfilter(set).dimension(function(d) { return d.length }).group(group).reduce(add, r, r).all()
  var g = graph.selectAll('.cols')
    .style('width', function(d) { return d * 100/ sum + "%"})
  if( checker.length > 10) { 
    g.style('margin-right', function(d) { return d  + 'px'})
      .style('margin-left', function(d) { return d + 'px'})
  }
}

input.on('change', function() {
  d3.select('#message').html('')
  var v = '/words?rack=' + this.value,
    va = this.value;
  if (va.length > 35) {
    var h = d3.select('#message')
    .html(function() {return "<p class = 'message'>Whoa, <i>woa</i>! I can't do  " + va.length + " characters. I can only do 35. Doctor's orders.</p>"})
  return;
  }
  for (var k in oldWords) {
    if (anaCheck(k, va)) {
      wordgen(crossfilter(oldWords[k]), va);
      graph.selectAll('.cols').each(function(d) { 
        var t = d3.select(this)
        if (t.selectAll('.words').empty()){
          t.remove();
        }
        t.style('width', function(d) { return d * 100 / sum + '%'})
        if (checker.length > 10) {
          t.style('margin-right', function(d) { return d + 'px'})
            .style('margin-left', function(d) {return d + 'px'})
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
.on('keyup', function() {
  d3.select('#counter')
    .text(this.value.length)
    .attr('class', 'message')
})

