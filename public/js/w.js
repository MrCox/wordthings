var input = d3.select('#solver'),
  graph = d3.select('#graph'),
  oldWords = {},
  checker = [];
  sum = 0;
var now;
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

function tooMany() {
  graph.selectAll('.cols').each(function(d) { 
    var t = d3.select(this)
    if (t.selectAll('.words').empty()) {
      t.remove();
    }
    t.style('width', function(d) {return Number(d.key) * 100 / sum + '%'})
    if (checker.length > 10) {
      t.style('width', null)
        .style('margin-right', function(d) { return Number(d.key) / 2 + 'px'})
    }
  })
}

function wordgen(dict, rack) {
  var ld = dict[0].length,
    l = rack.length
  checker.push(ld)
  sum += ld;
  graph.select('#l' + ld).remove();
  var col = graph.append('div')
    .attr('id', function(d) { return 'l' + ld})
    .attr('class', 'cols')
    .datum({key:ld})

  col.append('div')
    .datum(ld)
    .append('b')
    .text(function(d) { return d - 5})
  
  dict.forEach(function(v){
    var r = rack.split(''), w = v.slice(0, v.length - 5).split('')
    k = 0;
    while (w.length > 0) {
      if ( r.indexOf(w[0]) != -1 ) {
        var i = r.indexOf( w.shift() );
        r.splice( i, 1 );
      }
      else {break}
    if ( w.length == 0 ) { 
      col.append('div')
        .datum(v)
        .append('p')
        .attr('class', 'words')
        .text(function(d) { return d.slice(0, d.length - 5)})
    }}
  })
}

function words(set) {
  graph.selectAll('.cols').remove();
  checker = [];
  sum = 0;
  var col = graph.selectAll('.cols')
    .data(d3.entries(set))
    .enter().append('div')
    .attr('id', function(d) { return 'l' + d.key })
    .attr('class', 'cols')
    
  col.append('div')
    .append('b')
    .text(function(d) { var k = Number(d.key);checker.push(k);sum += k; return k - 5})

  col.selectAll('p')
    .data(function(d) { return d.value})
    .enter().append('div')
    .append('p')
    .attr('class', 'words')
    .text(function(d) { return d.slice(0, d.length - 5)})

  tooMany();
  console.log(new Date().getTime() - now)
}

input.on('change', function() {
  now = new Date().getTime();
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
      sum = 0;
      for (var j in oldWords[k]) {
        wordgen(oldWords[k][j], va);
      }
      tooMany();
      return;
    }
  }
  d3.json(v, function(e, j) {
    if (e) console.log(e);
    words(j)
    oldWords[va] = j;
    console.log(new Date().getTime() - now);
  })
})
.on('keyup', function() {
  d3.select('#counter')
    .text(this.value.length)
    .attr('class', 'message')
})

