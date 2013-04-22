var express = require('express'),
  app = express(),
  http = require('http'),
  fs = require('fs'),
  dict = require('./words'),
  cross = require('crossfilter'),
  wordgen = require('./wordgen')

app.configure( function() {
  app.set('port', process.env.PORT || 80);
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

app.get('/', function(req, res) {
    res.render('layout.jade', {pageTitle: 'wordthings' })
})

var d = cross(dict).groupAll(),
k = 0;
app.get('/words', function(req, res) {
  var w = wordgen(d, String(req.query.rack));
  res.json(w);
  k += 1;
  fs.appendFile('./anacount.js', ', ' + k, function(e) {
    if (e) throw e;
  })
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
