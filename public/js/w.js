var input = d3.select('#solver'),
  graph = d3.select('#graph'),
  dictDiv = d3.select('#dicts'),
  checker = [],
  sum = 0,
  wordsum = 0,
  alias = [1, 1, 1, 1, 1]

oldWords = {};

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

function highlight(word, rack) {
  word = word.slice(0, word.length - 5);
  var r = '',
  w = '';
  for (var i in rack) {
    if (rack[i] != '*') {
      r += rack[i];
    }
  }
  for (var i in word) {
    if (r.search(word[i]) == -1) {
      w += '<b style = "color:red">' + word[i] + '</b>';
    } else {
      w += word[i];
    }
  }
  return w;
}

function wordcount() {
  d3.select('#wordcount')
    .select('i')
    .html(function(d) { return wordsum + ' results'})
}

function tooMany() {
  graph.selectAll('.cols').each(function(d) { 
    var t = d3.select(this)
    if (t.selectAll('.words').empty()) {
      var k = t.select('div b').datum().key
      sum -= k;
      checker.splice( checker.indexOf(k), 1)
      t.remove();
    }
  })
  graph.selectAll('.cols')
    .style('width',function(d){return checker.length > 10 ? null : Number(d.key) * 100 / sum + '%'})
    .style('margin-right',function(d){return checker.length > 10 ? Number(d.key) / 2 + 'px' : null})
}

function graphFilter() {
  var words = graph.selectAll('.words').style('display', function(d) { 
    var ds = d.slice(d.length - 5, d.length).split('')
    for (var i in alias) {
      if (alias[i] == 1 && ds[i] == 1)  {
        wordsum += 1;
        return '';
      }
    }
    return 'none';
  })
  wordcount();
}

function filter() {
  var words = graph.selectAll('.words').style('display', function(d) {
    var ds = d.slice(d.length - 5, d.length).split('')
    for (var i in alias) {
      if (alias[i] == 1 && ds[i] == 1)  {
        if (d3.select(this).style('display') == 'none') { wordsum += 1; }
        return '';
      }
    }
    if (d3.select(this).style('display') != 'none') { wordsum -= 1; }
    return 'none';
  })
  wordcount();
}

function starCheck(rack) {
  for (var i in rack) {
    if (rack[i] == '*') {
      return highlight;
    }
  }
  return (function(d) { return d.slice(0, d.length - 5)});
}

function wordgen(dict, rack) {
  var ld = dict[0].length,
    l = rack.length
  checker.push(ld)
  sum += ld;
  wordsum = 0;
  graph.select('#l' + ld).remove();

  var action = starCheck(rack);

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
      } else {break}
      if ( w.length == 0 ) { 
        col.append('div')
          .datum(v)
          .append('p')
          .attr('class', 'words')
          .html(function(d) { return action(d, rack)})
      }
    }
  })
  tooMany();
  graphFilter();
}

function words(set, va) {
  graph.selectAll('.cols').remove();
  checker = [];
  sum = 0;
  wordsum = 0;
  var action = starCheck(va);

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
    .html(function(d) { return action(d, va); })
  
  tooMany();
  graphFilter();
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
      sum = 0;
      checker = [];
      graph.selectAll('.cols').remove();
      for (var j in oldWords[k]) {
        wordgen(oldWords[k][j], va);
      }
      tooMany();
      return;
    }
  }
  d3.json(v, function(e, j) {
    if (e) console.log(e);
    words(j, va)
    oldWords[va] = j;
  })
})
.on('keyup', function() {
  d3.select('#counter')
    .text(this.value.length)
    .attr('class', 'message')
})

var d = d3.selectAll('label input')
d.property('checked', true)
d.attr('check', true)

d.on('click', function(d) {
  var code = [];
  if (d3.select(this).attr('check') == 'true') {
    d3.select(this).property('checked', false)
    d3.select(this).attr('check', false)
  } else if (d3.select(this).attr('check') == 'false' ){
    d3.select(this).property('checked',true)
    d3.select(this).attr('check', true)
  }
  d3.selectAll('label input').each(function(d) {
    if(d3.select(this).attr('check') == 'true') {
      code.push(1);
    } else if (d3.select(this).attr('check') == 'false'){  
      code.push(0);
    }
  })
  alias = code;
  filter();
})
