var words = require('./words'),
  crossfilter = require('crossfilter'),
  dict = crossfilter(words).groupAll();

function wordgen(rack) {
  var l = rack.length
  var ind = indext[ l + 1]
  j = 0;
  var ra = rack.split('')
  for ( var i = 0; i<l; i++ ) { if ( ra[i] == '*' ) {j++} };

  function reduceAdd(p, v) {
    var r = rack.split(''), w = v.split('')
    k = 0;
    while (w.length > 0) {
      if ( r.indexOf(w[0]) != -1 ) {
        var i = r.indexOf( w.shift() );
        r.splice( i, 1 );
      }
      else { 
        if (k<j) { w.shift(); k++ }
        else if (k==j) {break}
        }
    if ( w.length == 0 ) { 
      var l = v.length
      try {
        p[l - 2].push(v)
      } catch(e) {
        p[l - 2] = [v]
      }
    }}
    return p
  }
 
  function reduceRemove(p, v) {}
  
  function reduceInitial(p, v) {return {}
  }
  return dict.reduce( reduceAdd, reduceRemove, reduceInitial ).value()
}
module.exports = wordgen;
