process.on('message', function(ar){
  var dict = ar[1], rack = ar[0], j = ar[2];
  var l = rack.length
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
