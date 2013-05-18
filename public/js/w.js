var input = d3.select('#solver'),
  graph = d3.select('#graph'),
  dictDiv = d3.select('#dicts'),
  checker = [],
  sum = 0,
  wordsum = 0,
  alias = [1, 1, 1, 1, 1],
  rendered;

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
  if (wordsum > 0) {
    d3.select('#wordcount')
      .select('i')
      .html(function(d) { return wordsum + ' results'})
  }
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
    .style('width',function(d){return checker.length > 11 ? null : (Number(d.key) - 5) * 100 / sum + '%'})
    .style('margin-right',function(d){return checker.length > 11 ? (Number(d.key) - 5) / 2 + 'px' : null})
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

function makeWords(set, va) {
  var action = starCheck(va)

  var coldat = graph.selectAll('.cols').data(d3.entries(set))

  coldat.enter().append('div')
    .attr('id', function(d) { return 'l' + d.key })
    .attr('class', 'cols')
    .append('div')
    .append('b')
    .text(function(d) { var k = Number(d.key);checker.push(k);sum += k; return k - 5})

  coldat.exit()
    .each(function(d) {
      var k = Number(d.key);
      checker.splice( checker.indexOf(k), 1 );
      sum -= 0;
    })
    .remove();
    
  graph.selectAll('.cols').each(function(d) {
    var wordat = d3.select(this).selectAll('p').data(function(d) { return d.value})
      
    wordat.enter().append('p')
      .attr('class', 'words')
      .html(function(d) {return action(d, va); })

    wordat.exit()
      .remove();

    d3.select(this).selectAll('p')
      .html(function(d) { return action(d, va);})
  })
} 

function words(set, va) {
  makeWords(set, va);
  tooMany();
  graphFilter();
}
var alph = 'abcdefghijklmnopqrstuvwxyz*'
alph = alph.split('')

input.on('change', function() {
  d3.select('#message').html(null)
  var va = this.value,
    nv = '';
  if (va.length > 35) {
   d3.select('#message') .html(function() {return "<p class = 'message'>Whoa, <i>woa</i>! I can't do  " + va.length + " characters. I can only do 35. Doctor's orders.</p>"})
  return;
  }
  for(var i in va){
    if (alph.indexOf(va[i]) != -1) {
      nv += va[i];
    }
 }
  var v = '/words?rack=' + nv;
  for (var k in oldWords) {
    if (anaCheck(k, nv)) {
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
    words(j, nv)
    oldWords[nv] = j;
  })
})
.on('keyup', function() {
  d3.select('#counter')
    .text(this.value.length)
    .attr('class', 'message')
})

var d = d3.select('#dicts').selectAll('label input'),
  s = d3.select('#sorting').selectAll('label input')

d.property('checked', true)
d.attr('check', true)
s.property('checked', true)
s.attr('check', true)

function change(t) {
  t = d3.select(t),
  tc = t.attr('check')
  if (tc == 'true') {
    t.property('checked', false)
    t.attr('check', false)
  } else if (tc == 'false' ){
    t.property('checked',true)
    t.attr('check', true)
  }
}

d3.select('#sorting').selectAll('label').on('click', function(d) {
  var t = this, 
    td = d3.select(t),
    tdh = td.html(),
    sl = tdh.slice(tdh.length - 12, tdh.length),
    ls = tdh.slice(tdh.length - 20, tdh.length),
    st = tdh.slice(tdh.length - 9, tdh.length),
    ts = tdh.slice(tdh.length - 10, tdh.length);
  if (sl == 'alphabetical') {
    td.html('<input type="radio" UNCHECKED>reverse alphabetical')
    d3.selectAll('.cols').each(function() { 
      var d = d3.select(this).selectAll('.words')
      d[0].reverse();
      d.order();
    })
  } 
  if (ls == 'reverse alphabetical'){
    td.html('<input type="radio" CHECKED> alphabetical')
    d3.selectAll('.cols').each(function() { 
      var e = d3.select(this).selectAll('.words'),
      n = [],
      el = e[0].length;
      e[0].forEach(function(d,i) {
        n[el - 1 - i] = d
      })
      for (var i; i< el - 1; i++) {
        e[0][i] = n[i]
      }
      e.order();
    })
  }
  if (st == 'ascending') {
    td.html('<input type="radio" UNCHECKED>descending')
    var d = d3.selectAll('.cols')
    d[0].reverse();
    d.order();
  }
  if (ts == 'descending') {
    td.html('<input type="radio" CHECKED>ascending')
    var d = d3.selectAll('.cols');
    d[0].reverse();
    d.order();
  }
})
d.on('click', function(d) {
  var code = [], t = this
  change(t); 
  d3.select('#dicts').selectAll('label input').each(function(d) {
    if(d3.select(this).attr('check') == 'true') {
      code.push(1);
    } else if (d3.select(this).attr('check') == 'false'){  
      code.push(0);
    }
  })
  alias = code;
  filter();
})
