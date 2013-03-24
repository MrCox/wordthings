var express = require('express'),
  app = express(),
  http = require('http'),
  fs = require('fs'),
  wordgen = require('./wordgen')

app.configure( function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views','./views');
  app.set('views','./views');
  app.set('view engine', 'jade');
  app.use(app.router);
  app.use('/public', express.static(__dirname+'/public'));
})

app.get('/gallop_safely', function(req, res) {
  res.render('for_map.jade', {PageTitle: 'Gallop Safely!' })
})

var j = 0
app.get('/', function(req, res) {
    res.render('layout.jade', {pageTitle: 'wordthings' })
  j += 1
  console.log( j )
})
app.get('/words', function(req, res) {
  var w = wordgen(req.query.lets)
  res.json(w)
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
