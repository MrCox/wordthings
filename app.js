var express = require('express'),
  app = express(),
  http = require('http'),
  fs = require('fs'),
  dict = require('./masterDict'),
  cross = require('crossfilter'),
  cp = require('child_process')

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

var children = {}
for (var len in dict) {
  children[len] = cp.fork('./wordgen')
}

function words(rack, res) {
  var start = new Date()
  var l = rack.length,
    words = [],
    count = 0;

  function tattle() {count += 1; if (count == l - 1) {res.send(words);console.log(new Date() - start)}}
  for (var i = 7; i<=l + 5 && i != 31; i++) {
    var c = children[i]; 
    c.on('message', function(d) {
      for (var i in d) { words.push(d[i]);}
      tattle();
    })
    c.send([rack, dict[i]]) 
  }
}

app.get('/words', function(req, res) {
  if (req.query.rack.length <= 35) {
    words(req.query.rack, res);
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
