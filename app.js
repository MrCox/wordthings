var express = require('express'),
  app = express(),
  http = require('http'),
  fs = require('fs'),
  dict = require('./masterDict'),
  cp = require('child_process');

process.setMaxListeners(0);

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
var k = 0;
app.get('/', function(req, res) {
    res.render('layout.jade', {pageTitle: 'wordthings' })
    k += 1;
    fs.appendFile('./anacount.js', ', ' + k, function(e) {
      if (e) throw e;
    })
})

var child = []
for (var l = 0; l <= 25; l ++) {
  child.push( cp.fork('./wordgen'))
}

function merger(obj) {
  var a = [];
  for (var i in obj) {
    for (var j in obj[i]) {
      a.push(obj[i][j])
    }
  }
  return a;
}
function words(rack, res) {
  var words = {},
    count = 0,
    j = 0,
    stars = 0,
    start = 7,
    arg = '';
  
  for (var i in rack) {
    if (rack[i] == '*') {
      stars += 1;
      if (stars >= 2) {
        start = stars + 7;
        words[stars + 5] = merger(dict[stars + 5]);
        count += 1;
      }
    } else { arg += rack[i]}
  }
  var l = arg.length + stars;
  if (count == l - 1) {res.send(words); return};
  function tattle(d) {
    if (d[0]) {
      words[d[0].length] = d;
    }
    count += 1; 
    if (count == l - 1) {res.send(words);}
  }

  for (var i = start; i <= l + 5;i++) {
    if (!dict[i]) { count++; continue;}
    j = j < 25 ? j + 1 : 0; 
    var c = child[j];
    c.on('message', function(d) {
      tattle(d);
    })
    c.send([arg, dict[i], stars]) 
  }
}

app.get('/robots.txt', function( req, res) {
  res.sendfile('./robots.txt')
})

app.get('/words', function(req, res) {
  if (req.query.rack.length <= 35) {
    words(req.query.rack, res);
  }
})

app.get('/mapauth', function(req, res) {
  if (req.query.password == "The eyes are on the roofs and in the alleys.") {
    res.render('userMap.jade', {PageTitle: 'Gallop Safely!'})
  } else if ( req.query.password == "It's me, Sut'jinn.") {
    res.render('for_map.jade', {PageTitle: 'Gallop Safely!'})
  } else { res.render('mapauth.jade', {PageTitle: "You F*&K3D up."})
  }
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
