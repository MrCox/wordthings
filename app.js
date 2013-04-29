var express = require('express'),
  app = express(),
  http = require('http'),
  fs = require('fs'),
  dict = require('./words'),
  cross = require('crossfilter')

app.configure( function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views','./views');
  app.set('views','./views');
  app.set('view engine', 'jade');
  app.use(app.router);
  app.use('/public', express.static(__dirname+'/public'));
})
var j = 0
app.get('/gallop_safely', function(req, res) {
  res.render('mapauth.jade', {PageTitle: 'WHO IS YOUR FATHER?'})
  j += 1
  fs.appendFile('./count.js', ', ' + j, function(err) {
    if (err) throw err
  })
})
var k = 0;
app.get('/', function(req, res) {
    res.render('layout.jade', {pageTitle: 'wordthings' })
    k += 1;
    fs.appendFile('./anacount.js', ', ' + k, function(e) {
      if (e) throw e;
    })
})

function wordgen(dict, rack) {
  var l = rack.length,
    j = 0;
  for ( var i = 0; i<l; i++ ) { if ( rack[i] == '*' ) {j++} };

  function reduceAdd(p, v) {
    if (l < v.length - 5) { return p; }
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
        p.push(v);
    }}
    return p
  }
 
  function reduceRemove(p, v) {}
  
  function reduceInitial(p, v) {return [] }
  return dict.reduce( reduceAdd, reduceRemove, reduceInitial ).value()
}

var d = cross(dict).groupAll();

app.get('/words', function(req, res) {
  if (req.query.rack.length <= 35) {
    res.json(wordgen(d, String(req.query.rack).toLowerCase()));
  }
})

app.get('/mapauth', function(req, res) {
  if (req.query.password == "The eyes are on the roofs and in the alleys.") {
    res.render('for_map.jade', {PageTitle: 'Gallop Safely!'})
  } else { res.render('mapauth.jade', {PageTitle: "You F*&K3D up."})}
})

app.get('/mapdata', function(req, res) {
  var r = req.query.obj
  var thing ={} 
  for (var key in r) {
    thing[key] = r[key]
  }
  fs.writeFile('./public/js/data.js', 'GTA_data =' + JSON.stringify(thing), function(err) {
    if (err) throw (err);
  })
  
  var w = 'It worked, yo'
  res.json(w)
})

http.createServer(app).listen(app.get('port'), function() {
  console.log('listening on port ' + app.get('port'));
})
