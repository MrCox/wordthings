var input = d3.select('#solver'),
  graph = d3.select('#graph'),
  dictDiv = d3.select('#dicts'),
  alias = [1, 1, 1, 1, 1],
  faqDiv = d3.select('#faqDiv'),
  faq = d3.select('#faq');

faq.on('click', function() { 
  var faq = d3.select(this),
    m = faq.text()
  if (m == 'faq') {
    faq.text('hide faq')
    faqDiv.style('display', null);
  } else{
    faq.text('faq')
    faqDiv.style('display', 'none');
  }
})

oldWords = {};

// dealing with buttons 
var d = d3.select('#dicts').selectAll('label input'),
  s = d3.select('#sorting').selectAll('a');

d.property('checked', true)
d.attr('check', true)

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

s.on('click', function(d) {
  var td = d3.select(this),
    sl = td.text();
  if (sl == 'alphabetical') {
    td.text('reverse alphabetical')
    d3.selectAll('.cols').each(function() { 
      d3.select(this).selectAll('.words')
        .sort(d3.ascending)
    })
  } 
  if (sl == 'reverse alphabetical'){
    td.text('alphabetical')
    d3.selectAll('.cols').each(function() { 
      var e = d3.select(this).selectAll('.words')
        .sort(d3.descending)
    })
  }
  if (sl == 'ascending') {
    td.text('descending')
    var d = d3.selectAll('.cols')
    d[0].reverse();
    d.order();
  }
  if (sl == 'descending') {
    td.text('ascending')
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

// solving anagrams
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
  if (r == '') { return '<span style = "color:red; font-weight:900;">' + word + '</span>'};
  for (var i in word) {
    if (r.search(word[i]) == -1) {
      w += '<span style = "color:red; font-weight:900;">' + word[i] + '</span>';
    } else {
      w += word[i];
    }
  }
  return w;
}

function wordcount() {
  var wordsum = d3.selectAll('.words')
    .filter(function(d) { return d3.select(this)
    .style('display') != 'none'})[0].length
  if (wordsum > 0) {
    d3.select('#wordcount')
      .select('i')
      .html(function(d) { return wordsum + ' results'})
  }
}

function tooMany() {
  var total = 0,
    sum = 0;
  graph.selectAll('.cols').each(function(d) { 
    var t = d3.select(this)
    if (t.selectAll('.words').empty()) {
      t.remove();
      return;
    }
    total += 1;
    sum += Number(d.key);
    return;
  })
  if (total < 10) {
    graph.selectAll('.cols')
      .style('margin-right', null)
      .style('width', function(d) { return +d.key * 100 / sum + '%'})
  } else {
    graph.selectAll('.cols')
      .style('width', null)
      .style('margin-right', function(d) { return +d.key * 100 /(3 * sum) + "%"})
  }
}

function graphFilter() {
  d3.selectAll('.words').style('display', function(d) {
    var ds = d.slice(d.length - 5, d.length).split('')
    for (var i in alias) {
      if (alias[i] == 1 && ds[i] == 1)  {
        return null;
      }
    }
    return 'none';
  })
  wordcount();
}

function filter() {
  d3.selectAll('.words').style('display',function(d) { 
    var t = d3.select(this),
      ds = d.slice(d.length - 5, d.length).split('')
    for (var i in alias) {
      if (alias[i] == 1 && ds[i] == 1)  {
        return null;
      }
    }
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

  var action = starCheck(rack);

  var col = graph.append('div')
    .attr('id', function(d) { return 'l' + ld})
    .attr('class', 'cols')
    .datum({key:ld})

  col.append('div')
    .append('b')
    .text(function(d) { return d.key - 5;})
  
  var k = 0;
  for (var i in rack) {
    if (rack[i] == '*') k += 1;
  }
  dict.forEach(function(v){
    var r = rack.split(''), w = v.slice(0, v.length - 5).split(''),
    j = 0;
    while (w.length > 0) {
      if (r.indexOf(w[0]) != -1 ) {
        r.splice( r.indexOf(w.shift()), 1 );
      } else {
        if (j < k) { 
          j += 1; 
          r.splice( r.indexOf(w.shift()), 1 );
        } else {break};
      }
      if ( w.length == 0 ) { 
        col.append('p')
          .datum(v)
          .attr('class', 'words')
          .html(function(d) { return action(d, rack)})
      }
    }
  })
}

function makeWords(set, va) {
  var action = starCheck(va)

  var coldat = graph.selectAll('.cols')
    .data(d3.entries(set))

  coldat.select('div b').text(function(d) { 
    return Number(d.key) - 5;
  })

  coldat.enter().append('div')
    .attr('id', function(d) { return 'l' + d.key })
    .attr('class', 'cols')
    .append('div')
    .append('b')
    .text(function(d) { return +d.key - 5})

  coldat.exit()
    .remove();
    
  graph.selectAll('.cols').each(function(d) {
    var wordat = d3.select(this).selectAll('p')
      .data(function(d) { return d.value})
      
    wordat.html(function(d) { return action(d, va);})

    wordat.enter().append('p')
      .attr('class', 'words')
      .html(function(d) {return action(d, va); })

    var e = wordat.exit().remove();
  })
  graphFilter();
} 

function words(set, va) {
  makeWords(set, va);
  tooMany();
}

function message(va) {
  d3.select('#message') 
    .html(function() {
      return "<p class = 'message'>Whoa, <i>woa</i>! I can't do  " + va.length + " characters. I can only do 35. Doctor's orders.</p>"})
}
var alph = 'abcdefghijklmnopqrstuvwxyz*'
alph = alph.split('')

input.on('change', function() {
  d3.select('#message').html(null)
  var va = this.value,
    nv = '';
  if (va.length > 35) {
    message(va);
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
      graph.selectAll('.cols').remove();
      for (var j in oldWords[k]) {
        wordgen(oldWords[k][j], va);
      }
      filter();
      tooMany();
      return;
    }
  }
  d3.json(v, function(e, j) {
    if (e) console.log(e);
    words(j, nv)
    oldWords[nv] = j;
  })
}).on('keyup', function() {
  d3.select('#counter')
    .text(this.value.length)
    .attr('class', 'message')
})

