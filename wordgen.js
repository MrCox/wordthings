var Mdict = require('./masterDict');
process.on('message', function(ar){
  var a1 = ar[1], dict = Mdict[a1], rack = ar[0];
  var l = rack.length,
    j = 0;
  for ( var i = 0; i<l; i++ ) { if ( rack[i] == '*' ) {j++} };
  if (a1 <= j){ process.send(dict); return;}
  var p = [];
  dict.forEach(function(v){
    var r = rack.split(''), w = v.slice(0, v.length - 5).split('')
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
        p.push(v)
      }
    }
  })
  process.send(p)
})
